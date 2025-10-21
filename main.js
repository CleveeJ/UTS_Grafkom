import { Bellossom } from "./Bellossom/bellosom.js";
import { Gloom } from "./Gloom/gloom.js";
import { Character } from "./VileplumeBaru/Character.js"

function main() {
    const CANVAS = document.getElementById("mycanvas");
    CANVAS.width = window.innerWidth;
    CANVAS.height = window.innerHeight;

    let drag = false;
    let x_prev, y_prev;
    let THETA = 0, PHI = 0;
    let dX = 0, dY = 0;
    const FRICTION = 0.15;

    // ---------------- MOUSE EVENTS ----------------
    CANVAS.addEventListener("mousedown", (e) => {
        drag = true;
        x_prev = e.pageX;
        y_prev = e.pageY;
        e.preventDefault();
    });

    CANVAS.addEventListener("mouseup", () => { drag = false; });
    CANVAS.addEventListener("mouseout", () => { drag = false; });

    CANVAS.addEventListener("mousemove", (e) => {
        if (!drag) return;
        dX = (e.pageX - x_prev) * 2 * Math.PI / CANVAS.width;
        dY = (e.pageY - y_prev) * 2 * Math.PI / CANVAS.height;
        THETA += dX;
        PHI += dY;
        x_prev = e.pageX;
        y_prev = e.pageY;
        e.preventDefault();
    });

    // ---------------- WEBGL CONTEXT ----------------
    const GL = CANVAS.getContext("webgl", { antialias: true });
    if (!GL) { alert("WebGL tidak tersedia"); return; }

    // ---------------- SHADERS ----------------
    const vertexShaderSrc = `
        attribute vec3 position;
        attribute vec3 color;
        attribute vec3 normal;

        uniform mat4 Pmatrix;
        uniform mat4 Vmatrix;
        uniform mat4 Mmatrix;

        varying vec3 vColor;
        varying vec3 vNormal;
        varying vec3 vPosition;

        void main(void) {
            vec4 worldPos = Mmatrix * vec4(position, 1.0);
            vPosition = worldPos.xyz;
            vNormal = mat3(Mmatrix) * normal;
            vColor = color;
            gl_Position = Pmatrix * Vmatrix * worldPos;
        }
    `;

    const fragmentShaderSrc = `
        precision mediump float;

        varying vec3 vColor;
        varying vec3 vNormal;
        varying vec3 vPosition;

        uniform vec3 lightPos;
        uniform vec3 lightColor;
        uniform vec3 ambientColor;

        void main(void) {
            vec3 N = normalize(vNormal);
            vec3 L = normalize(lightPos - vPosition);

            float diff = max(dot(N, L), 0.0);
            float contrastFactor = pow(diff, 2.5); // kontras lebih kuat
            float fade = 0.4;                     // blend lebih tipis

            vec3 litColor = ambientColor + contrastFactor * lightColor * vColor;
            vec3 finalColor = mix(vColor, litColor, fade); // warna asli lebih dominan
            gl_FragColor = vec4(finalColor, 1.0);
        }
    `;

    function compile_shader(src, type) {
        const shader = GL.createShader(type);
        GL.shaderSource(shader, src);
        GL.compileShader(shader);
        if (!GL.getShaderParameter(shader, GL.COMPILE_STATUS)) {
            console.error(GL.getShaderInfoLog(shader));
            return null;
        }
        return shader;
    }

    const shaderVert = compile_shader(vertexShaderSrc, GL.VERTEX_SHADER);
    const shaderFrag = compile_shader(fragmentShaderSrc, GL.FRAGMENT_SHADER);

    const SHADER_PROGRAM = GL.createProgram();
    GL.attachShader(SHADER_PROGRAM, shaderVert);
    GL.attachShader(SHADER_PROGRAM, shaderFrag);
    GL.linkProgram(SHADER_PROGRAM);
    GL.useProgram(SHADER_PROGRAM);

    // ---------------- ATTRIBUTES & UNIFORMS ----------------
    const _position = GL.getAttribLocation(SHADER_PROGRAM, "position");
    const _color = GL.getAttribLocation(SHADER_PROGRAM, "color");
    const _normal = GL.getAttribLocation(SHADER_PROGRAM, "normal");
    GL.enableVertexAttribArray(_position);
    GL.enableVertexAttribArray(_color);
    GL.enableVertexAttribArray(_normal);

    const _Pmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Pmatrix");
    const _Vmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Vmatrix");
    const _Mmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Mmatrix");
    const _lightPos = GL.getUniformLocation(SHADER_PROGRAM, "lightPos");
    const _lightColor = GL.getUniformLocation(SHADER_PROGRAM, "lightColor");
    const _ambientColor = GL.getUniformLocation(SHADER_PROGRAM, "ambientColor");

    // ---------------- OBJECT ----------------
    const BellossomObject = new Bellossom(GL, SHADER_PROGRAM, _position, _color, _normal);
    LIBS.translateX(BellossomObject.root.POSITION_MATRIX, 5);
    BellossomObject.setup();

    const GloomObject = new Gloom(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, _normal);
    LIBS.translateX(GloomObject.root.POSITION_MATRIX, -5);
    GloomObject.setup();

    const VileplumeObject = new Character(GL, SHADER_PROGRAM, _position, _color, _normal);
    VileplumeObject.setup();

    // ---------------- MATRIX ----------------
    let PROJMATRIX = LIBS.get_projection(40, CANVAS.width / CANVAS.height, 1, 100);
    let VIEWMATRIX = LIBS.get_I4();

    LIBS.translateZ(VIEWMATRIX, -10);

    GL.enable(GL.DEPTH_TEST);
    GL.depthFunc(GL.LEQUAL);
    GL.clearColor(0.9, 0.9, 0.9, 1.0);
    GL.clearDepth(1.0);

    // ---------------- LIGHT ----------------
    GL.uniform3fv(_lightPos, [10, 10, 0]);
    GL.uniform3fv(_lightColor, [1, 1, 1]);
    GL.uniform3fv(_ambientColor, [0.1, 0.1, 0.1]);

    // ---------------- ANIMATE ----------------
    let time = 0;
    function animate() {
        GL.viewport(0, 0, CANVAS.width, CANVAS.height);
        GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

        VIEWMATRIX = LIBS.get_I4();
        LIBS.translateZ(VIEWMATRIX, -30);
        LIBS.rotateY(VIEWMATRIX, THETA);
        LIBS.rotateX(VIEWMATRIX, PHI);

        if (!drag) {
            dX *= (1 - FRICTION);
            dY *= (1 - FRICTION);
            THETA += dX;
            PHI += dY;
        }

        GL.uniformMatrix4fv(_Pmatrix, false, PROJMATRIX);
        GL.uniformMatrix4fv(_Vmatrix, false, VIEWMATRIX);

        BellossomObject.render(_Mmatrix, LIBS.get_I4());
        GloomObject.render(_Mmatrix, LIBS.get_I4());
        VileplumeObject.render(_Mmatrix, LIBS.get_I4(), time);

        GL.flush();
        time += 0.02;
        requestAnimationFrame(animate);
    }

    animate();
}

window.addEventListener('load', main);
