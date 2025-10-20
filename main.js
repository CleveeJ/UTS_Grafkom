import { Gloom } from "./Gloom/gloom.js";
import { Bellossom } from "./Bellossom/bellosom.js"

function main() {
    const CANVAS = document.getElementById("mycanvas");
    CANVAS.width = window.innerWidth;
    CANVAS.height = window.innerHeight;

    let GL = CANVAS.getContext("webgl", { antialias: true });
    if (!GL) {
        alert("WebGL tidak tersedia di browser ini");
        return;
    }

    /*================ SHADERS ================*/
    const shader_vertex_source = `
        attribute vec3 position;
        attribute vec3 color;
        uniform mat4 Pmatrix, Vmatrix, Mmatrix;
        varying vec3 vColor;
        void main(void) {
            gl_Position = Pmatrix * Vmatrix * Mmatrix * vec4(position, 1.);
            vColor = color;
        }`;

    const shader_fragment_source = `
        precision mediump float;
        varying vec3 vColor;
        void main(void) {
            gl_FragColor = vec4(vColor, 1.);
        }`;

    function compile_shader(source, type) {
        const shader = GL.createShader(type);
        GL.shaderSource(shader, source);
        GL.compileShader(shader);
        if (!GL.getShaderParameter(shader, GL.COMPILE_STATUS)) {
            console.error(GL.getShaderInfoLog(shader));
            return null;
        }
        return shader;
    }

    const shader_vertex = compile_shader(shader_vertex_source, GL.VERTEX_SHADER);
    const shader_fragment = compile_shader(shader_fragment_source, GL.FRAGMENT_SHADER);

    const SHADER_PROGRAM = GL.createProgram();
    GL.attachShader(SHADER_PROGRAM, shader_vertex);
    GL.attachShader(SHADER_PROGRAM, shader_fragment);
    GL.linkProgram(SHADER_PROGRAM);
    GL.useProgram(SHADER_PROGRAM);
    GL.clearColor(0.9, 0.9, 0.9, 1.0); // warna background
    GL.enable(GL.DEPTH_TEST);          // aktifkan depth test
    GL.depthFunc(GL.LEQUAL);           // gunakan perbandingan "less or equal"
    GL.clearDepth(1.0);    

    const _position = GL.getAttribLocation(SHADER_PROGRAM, "position");
    const _color = GL.getAttribLocation(SHADER_PROGRAM, "color");
    GL.enableVertexAttribArray(_position);
    GL.enableVertexAttribArray(_color);

    const _Pmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Pmatrix");
    const _Vmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Vmatrix");
    const _Mmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Mmatrix");

    /*================ OBJECTS =================*/
    // const gloom = new Gloom(GL, SHADER_PROGRAM, _position, _color, _Mmatrix);
    // LIBS.translateX(gloom.root.POSITION_MATRIX, -1);
    // gloom.setup();

    const bellossom = new Bellossom(GL, SHADER_PROGRAM, _position, _color, _Mmatrix);
    LIBS.translateX(bellossom.root.POSITION_MATRIX, 4);
    bellossom.setup();

    /*================ CAMERA =================*/
    const PROJMATRIX = LIBS.get_projection(70, CANVAS.width / CANVAS.height, 1, 100);
    const MOVEMATRIX = LIBS.get_I4();
    const VIEWMATRIX = LIBS.get_I4();
    LIBS.translateZ(VIEWMATRIX, -20);

    let THETA = 0, PHI = 0, dX = 0, dY = 0;
    let drag = false, x_prev, y_prev;
    const FRICTION = 0.05;

    CANVAS.addEventListener("mousedown", (e) => {
        drag = true; x_prev = e.pageX; y_prev = e.pageY; e.preventDefault();
    });
    CANVAS.addEventListener("mouseup", () => drag = false);
    CANVAS.addEventListener("mouseout", () => drag = false);
    CANVAS.addEventListener("mousemove", (e) => {
        if (!drag) return;
        dX = (e.pageX - x_prev) * 2 * Math.PI / CANVAS.width;
        dY = (e.pageY - y_prev) * 2 * Math.PI / CANVAS.height;
        THETA += dX;
        PHI += dY;
        x_prev = e.pageX; y_prev = e.pageY;
        e.preventDefault();
    });
    
    
    function animate() {

        // Bersihkan layar
        GL.viewport(0, 0, CANVAS.width, CANVAS.height);
        GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

        // Update view (kamera)
        LIBS.set_I4(VIEWMATRIX);
        LIBS.rotateY(VIEWMATRIX, THETA);
        LIBS.rotateX(VIEWMATRIX, PHI);
        LIBS.translateZ(VIEWMATRIX, -20);

        if (!drag) {
            dX *= (1 - FRICTION);
            dY *= (1 - FRICTION);
            THETA += dX;
            PHI += dY;
        }

        // Apply matriks global
        GL.uniformMatrix4fv(_Pmatrix, false, PROJMATRIX);
        GL.uniformMatrix4fv(_Vmatrix, false, VIEWMATRIX);
        GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX);

        // Render badan (beserta semua anak)
        // gloom.render(_Mmatrix, LIBS.get_I4());
        bellossom.render(_Mmatrix, LIBS.get_I4());

        requestAnimationFrame(animate);
    }


    animate();
}

window.addEventListener('load', main);
