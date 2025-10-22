import { Bellossom } from "./Bellossom/bellosom.js";
import { Cloud } from "./cloud/Cloud.js";
import { Gloom } from "./Gloom/gloom.js";
import { Ground } from "./Ground/ground.js";
import { Character } from "./Vileplume/Character2.js"

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

    // ==========================================================
    // SKYBOX SHADER & OBJECT
    // ==========================================================
    const skyboxVertexShaderSrc = `
        attribute vec3 position;
        attribute vec2 uv;
        varying vec2 vUV;
        uniform mat4 Pmatrix;
        uniform mat4 Vmatrix;
        uniform mat4 Mmatrix;
        void main(void){
            vUV = uv;
            gl_Position = Pmatrix * Vmatrix * Mmatrix * vec4(position, 1.0);
        }
    `;

    const skyboxFragmentShaderSrc = `
        precision mediump float;
        uniform sampler2D sampler;
        varying vec2 vUV;
        void main(void){
            gl_FragColor = texture2D(sampler, vUV);
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

    // skybox 
    const sbVert = compile_shader(skyboxVertexShaderSrc, GL.VERTEX_SHADER);
    const sbFrag = compile_shader(skyboxFragmentShaderSrc, GL.FRAGMENT_SHADER);
    const SKYBOX_PROGRAM = GL.createProgram();
    GL.attachShader(SKYBOX_PROGRAM, sbVert);
    GL.attachShader(SKYBOX_PROGRAM, sbFrag);
    GL.linkProgram(SKYBOX_PROGRAM);

    const sb_pos = GL.getAttribLocation(SKYBOX_PROGRAM, "position");
    const sb_uv = GL.getAttribLocation(SKYBOX_PROGRAM, "uv");
    const sb_Pmatrix = GL.getUniformLocation(SKYBOX_PROGRAM, "Pmatrix");
    const sb_Vmatrix = GL.getUniformLocation(SKYBOX_PROGRAM, "Vmatrix");
    const sb_Mmatrix = GL.getUniformLocation(SKYBOX_PROGRAM, "Mmatrix");
    const sb_sampler = GL.getUniformLocation(SKYBOX_PROGRAM, "sampler");

    // cube data
    const cube_vertex = [
        // belakang
        -1,-1,-1,    1,1/3,
        1,-1,-1,     3/4,1/3,
        1, 1,-1,     3/4,2/3,
        -1, 1,-1,    1,2/3,
        // depan
        -1,-1, 1,    1/4,1/3,
        1,-1, 1,     2/4,1/3,
        1, 1, 1,     2/4,2/3,
        -1, 1, 1,    1/4,2/3,
        // kiri
        -1,-1,-1,    0,1/3,
        -1, 1,-1,    0,2/3,
        -1, 1, 1,    1/4,2/3,
        -1,-1, 1,    1/4,1/3,
        // kanan
        1,-1,-1,     3/4,1/3,
        1, 1,-1,     3/4,2/3,
        1, 1, 1,     2/4,2/3,
        1,-1, 1,     2/4,1/3,
        // bawah
        -1,-1,-1,    1/4,0,
        -1,-1, 1,    1/4,1/3,
        1,-1, 1,     2/4,1/3,
        1,-1,-1,     2/4,0,
        // atas
        -1, 1,-1,    1/4,1,
        -1, 1, 1,    1/4,2/3,
        1, 1, 1,     2/4,2/3,
        1, 1,-1,     2/4,1
    ];

    let scale = 40;
    for (let i = 0; i < cube_vertex.length; i+=5) {
        cube_vertex[i] *= scale;
        cube_vertex[i+1] *= scale;
        cube_vertex[i+2] *= scale;
    }

    const cube_faces = [
        0,1,2,0,2,3,
        4,5,6,4,6,7,
        8,9,10,8,10,11,
        12,13,14,12,14,15,
        16,17,18,16,18,19,
        20,21,22,20,22,23
    ];

    const CUBE_VERTEX = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, CUBE_VERTEX);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(cube_vertex), GL.STATIC_DRAW);

    const CUBE_FACES = GL.createBuffer();
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CUBE_FACES);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(cube_faces), GL.STATIC_DRAW);

    // texture loader
    function load_texture(url) {
        const tex = GL.createTexture();
        const img = new Image();
        img.src = url;
        img.onload = () => {
            GL.bindTexture(GL.TEXTURE_2D, tex);
            GL.pixelStorei(GL.UNPACK_FLIP_Y_WEBGL, true);
            GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, img);
            GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
            GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR);
            GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
            GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
            GL.bindTexture(GL.TEXTURE_2D, null);
        };
        return tex;
    }

    const skybox_texture = load_texture("skybox3.png");

    // ==========================================================
    // MAIN SHADER UNTUK OBJEK (BELLOSSOM & GLOOM)
    // ==========================================================
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
            float contrastFactor = pow(diff, 2.5);
            float fade = 0.4;
            vec3 litColor = ambientColor + contrastFactor * lightColor * vColor;
            vec3 finalColor = mix(vColor, litColor, fade);
            gl_FragColor = vec4(finalColor, 1.0);
        }
    `;

    const shaderVert = compile_shader(vertexShaderSrc, GL.VERTEX_SHADER);
    const shaderFrag = compile_shader(fragmentShaderSrc, GL.FRAGMENT_SHADER);
    const SHADER_PROGRAM = GL.createProgram();
    GL.attachShader(SHADER_PROGRAM, shaderVert);
    GL.attachShader(SHADER_PROGRAM, shaderFrag);
    GL.linkProgram(SHADER_PROGRAM);

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

    // objek
    const BellossomObject = new Bellossom(GL, SHADER_PROGRAM, _position, _color, _normal);
    LIBS.translateX(BellossomObject.root.POSITION_MATRIX, 5);
    LIBS.translateY(BellossomObject.root.POSITION_MATRIX, -1.62);
    LIBS.scale(BellossomObject.root.POSITION_MATRIX, [0.4,0.4,0.4]);
    BellossomObject.setup();

    const GloomObject = new Gloom(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, _normal);
    LIBS.translateX(GloomObject.root.POSITION_MATRIX, -5);
    LIBS.translateY(GloomObject.root.POSITION_MATRIX, -1.4);
    GloomObject.setup();

    const VileplumeObject = new Character(GL, SHADER_PROGRAM, _position, _color, _normal);
    LIBS.translateY(VileplumeObject.POSITION_MATRIX, -0.6);
    LIBS.translateZ(VileplumeObject.POSITION_MATRIX, 2);
    LIBS.scale(VileplumeObject.POSITION_MATRIX, [1.8,1.8,1.8]);
    VileplumeObject.setup();

    const GroundObject = new Ground(GL, SHADER_PROGRAM, _position, _color, _normal);
    LIBS.translateY(GroundObject.root.POSITION_MATRIX, -3);
    LIBS.scale(GroundObject.root.POSITION_MATRIX, [5,5,5]);
    GroundObject.setup();

    const CloudObject = new Cloud(GL, SHADER_PROGRAM, _position, _color, _normal);
    LIBS.translateY(CloudObject.POSITION_MATRIX, 5);
    CloudObject.setup();

    // ---------------- MATRIX ----------------
    let PROJMATRIX = LIBS.get_projection(40, CANVAS.width / CANVAS.height, 1, 100);
    let VIEWMATRIX = LIBS.get_I4();
    let MOVEMATRIX = LIBS.get_I4();

    GL.enable(GL.DEPTH_TEST);
    GL.depthFunc(GL.LEQUAL);

    // cahaya
    GL.useProgram(SHADER_PROGRAM);
    GL.uniform3fv(_lightPos, [10, 10, 10]);
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

        // === DRAW SKYBOX ===
        let MOVEMATRIX_SKYBOX = LIBS.get_I4();
        LIBS.rotateY(MOVEMATRIX_SKYBOX, -Math.PI/4);
        GL.useProgram(SKYBOX_PROGRAM);
        GL.depthMask(false); // jangan tulis depth buffer
        GL.uniformMatrix4fv(sb_Pmatrix, false, PROJMATRIX);
        GL.uniformMatrix4fv(sb_Vmatrix, false, VIEWMATRIX);
        GL.uniformMatrix4fv(sb_Mmatrix, false, MOVEMATRIX_SKYBOX);

        GL.bindBuffer(GL.ARRAY_BUFFER, CUBE_VERTEX);
        GL.vertexAttribPointer(sb_pos, 3, GL.FLOAT, false, 4 * 5, 0);
        GL.vertexAttribPointer(sb_uv, 2, GL.FLOAT, false, 4 * 5, 4 * 3);
        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CUBE_FACES);
        GL.activeTexture(GL.TEXTURE0);
        GL.bindTexture(GL.TEXTURE_2D, skybox_texture);
        GL.uniform1i(sb_sampler, 0);
        GL.drawElements(GL.TRIANGLES, cube_faces.length, GL.UNSIGNED_SHORT, 0);
        GL.depthMask(true);

        // === DRAW OBJECT ===
        GL.useProgram(SHADER_PROGRAM);
        GL.uniformMatrix4fv(_Pmatrix, false, PROJMATRIX);
        GL.uniformMatrix4fv(_Vmatrix, false, VIEWMATRIX);
        BellossomObject.render(_Mmatrix, LIBS.get_I4());
        GloomObject.render(_Mmatrix, LIBS.get_I4());
        VileplumeObject.render(_Mmatrix, LIBS.get_I4(), time);
        GroundObject.render(_Mmatrix, LIBS.get_I4());
        CloudObject.render(_Mmatrix, LIBS.get_I4(), time);

        GL.flush();
        time += 0.02;
        requestAnimationFrame(animate);
    }

    animate();
}

window.addEventListener('load', main);
