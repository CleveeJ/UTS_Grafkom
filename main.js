import { Badan } from "./Objects/badan.js";
import { Rambut } from "./Objects/rambut.js";
import { BolaRambut } from "./Objects/bolarambut.js";
import { Capsule } from "./Objects/Capsule.js";

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

    const _position = GL.getAttribLocation(SHADER_PROGRAM, "position");
    const _color = GL.getAttribLocation(SHADER_PROGRAM, "color");
    GL.enableVertexAttribArray(_position);
    GL.enableVertexAttribArray(_color);

    const _Pmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Pmatrix");
    const _Vmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Vmatrix");
    const _Mmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Mmatrix");

    /*================ OBJECT =================*/
    const badan = new Badan(GL, SHADER_PROGRAM, _position, _color, _Mmatrix);
    const rambut = new Rambut(GL, SHADER_PROGRAM, _position, _color, _Mmatrix);
    const bolarambut = new BolaRambut(GL, SHADER_PROGRAM, _position, _color, _Mmatrix);
    const legKiri = new Capsule(GL, SHADER_PROGRAM, _position, _color,
        0.1, 0.1, 0.1, 0.5, 20, 10, [0.2, 0.3, 0.7]);
    const legKanan = new Capsule(GL, SHADER_PROGRAM, _position, _color,
        0.1, 0.1, 0.1, 0.5, 20, 10, [0.2, 0.3, 0.7]);
    const footKiri = new Capsule(GL, SHADER_PROGRAM, _position, _color,
         0.15, 0.15, 0.15, 1, 20, 10, [0.2, 0.3, 0.7]);
    const footKanan = new Capsule(GL, SHADER_PROGRAM, _position, _color,
         0.15, 0.15, 0.15, 1, 20, 10, [0.2, 0.3, 0.7]);
    const handKanan = new Capsule(GL, SHADER_PROGRAM, _position, _color,
         0.15, 0.15, 0.15, 1, 20, 10, [0.2, 0.3, 0.7]);
    const handKiri = new Capsule(GL, SHADER_PROGRAM, _position, _color,
         0.15, 0.15, 0.15, 1, 20, 10, [0.2, 0.3, 0.7]);

    badan.childs.push(rambut);
    badan.childs.push(bolarambut);
    badan.childs.push(legKiri);
    badan.childs.push(legKanan);
    legKiri.childs.push(footKiri);
    legKanan.childs.push(footKanan);
    badan.childs.push(handKanan);
    badan.childs.push(handKiri);


    // LIBS.translateX(badan.MOVE_MATRIX, -2)


    /*================ CAMERA =================*/
    const PROJMATRIX = LIBS.get_projection(40, CANVAS.width / CANVAS.height, 1, 100);
    const MOVEMATRIX = LIBS.get_I4();
    const VIEWMATRIX = LIBS.get_I4();
    LIBS.translateZ(VIEWMATRIX, -6);

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

    /*================ DRAW LOOP ================*/
    GL.enable(GL.DEPTH_TEST);
    GL.depthFunc(GL.LEQUAL);
    GL.clearColor(0.9, 0.9, 0.9, 1.0);
    GL.clearDepth(1.0);

    badan.setup();

    LIBS.translateY(legKiri.POSITION_MATRIX, -1.2);
    LIBS.translateX(legKiri.POSITION_MATRIX, -0.4);

    LIBS.translateY(legKanan.POSITION_MATRIX, -1.2);
    LIBS.translateX(legKanan.POSITION_MATRIX, 0.4);

    LIBS.rotateX(footKanan.POSITION_MATRIX, -1.5);
    LIBS.rotateY(footKanan.POSITION_MATRIX, 0.8);
    LIBS.translateX(footKanan.POSITION_MATRIX, 0.3);
    LIBS.translateY(footKanan.POSITION_MATRIX, -0.35);
    LIBS.translateZ(footKanan.POSITION_MATRIX, 0.3);

    LIBS.rotateX(footKiri.POSITION_MATRIX, -1.5);
    LIBS.rotateY(footKiri.POSITION_MATRIX, -0.8);
    LIBS.translateX(footKiri.POSITION_MATRIX, -0.3);
    LIBS.translateY(footKiri.POSITION_MATRIX, -0.35);
    LIBS.translateZ(footKiri.POSITION_MATRIX, 0.3);

    LIBS.rotateX(handKanan.POSITION_MATRIX, -1.5);
    LIBS.rotateY(handKanan.POSITION_MATRIX, -1);
    LIBS.translateX(handKanan.POSITION_MATRIX, -1.4);
    LIBS.translateY(handKanan.POSITION_MATRIX, -0.3);
    LIBS.translateZ(handKanan.POSITION_MATRIX, 0.3);

    LIBS.rotateX(handKiri.POSITION_MATRIX, -1.5);
    LIBS.rotateY(handKiri.POSITION_MATRIX, 1);
    LIBS.translateX(handKiri.POSITION_MATRIX, 1.4);
    LIBS.translateY(handKiri.POSITION_MATRIX, -0.3);
    LIBS.translateZ(handKiri.POSITION_MATRIX, 0.3);


    function animate() {
        GL.viewport(0, 0, CANVAS.width, CANVAS.height);
        GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

        LIBS.set_I4(VIEWMATRIX);
        LIBS.rotateY(VIEWMATRIX, THETA);
        LIBS.rotateX(VIEWMATRIX, PHI);
        LIBS.translateZ(VIEWMATRIX, -6);

        if (!drag) {
            dX *= (1 - FRICTION);
            dY *= (1 - FRICTION);
            THETA += dX;
            PHI += dY;
        }

        GL.uniformMatrix4fv(_Pmatrix, false, PROJMATRIX);
        GL.uniformMatrix4fv(_Vmatrix, false, VIEWMATRIX);
        GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX);

        // Gambar badan & rambut
        badan.render(_Mmatrix, LIBS.get_I4());

        // Panggil bola rambut dengan MOVEMATRIX supaya ikut badan
        // bolarambut.draw(_position, _color, MOVEMATRIX);

        requestAnimationFrame(animate);
    }

    animate();
}

window.addEventListener('load', main);
