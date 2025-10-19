import { Badan } from "./Objects/badan.js";
import { Rambut } from "./Objects/rambut.js";
import { BolaRambut } from "./Objects/bolarambut.js";
import { Capsule } from "./Objects/Capsule.js";
import { bSplineMulut } from "./Objects/bSplineMulut.js";
import { Ellipsoid } from "./Objects/Ellipsoid.js";

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
        0.1, 0.1, 0.1, 0.5, 20, 10, [0.41, 0.57, 0.69]);
    const legKanan = new Capsule(GL, SHADER_PROGRAM, _position, _color,
        0.1, 0.1, 0.1, 0.5, 20, 10, [0.41, 0.57, 0.69]);
    const footKiri = new Capsule(GL, SHADER_PROGRAM, _position, _color,
         0.15, 0.15, 0.15, 1, 20, 10, [0.41, 0.57, 0.69]);
    const footKanan = new Capsule(GL, SHADER_PROGRAM, _position, _color,
         0.15, 0.15, 0.15, 1, 20, 10, [0.41, 0.57, 0.69]);
    const handKanan = new Capsule(GL, SHADER_PROGRAM, _position, _color,
         0.15, 0.15, 0.15, 1, 20, 10, [0.41, 0.57, 0.69]);
    const handKiri = new Capsule(GL, SHADER_PROGRAM, _position, _color,
         0.15, 0.15, 0.15, 1, 20, 10, [0.41, 0.57, 0.69]);


    const iler1 = new Capsule(
        GL, SHADER_PROGRAM, _position, _color,
        0.06, 0.06, 0.06, 0.2, 20, 10, [1, 1, 1] 
    );

    const iler2 = new Capsule(
        GL, SHADER_PROGRAM, _position, _color,
        0.06, 0.06, 0.06, 0.1, 20, 10, [1, 1, 1] 
    );

    const mulutControlPoints = [
        0, 0,
        -0.17, 0.01,
        -0.38, -0.03,
        -0.57, -0.07,
        -0.65, 0.03,
        -0.51, 0.11,
        -0.40 , 0.14,
        -0.18 , 0.17,
        0.18 , 0.17,
        0.40 , 0.14,
        0.51, 0.11,
        0.65, 0.03,
        0.57, -0.07,
        0.38, -0.03,
        0.17, 0.01,
    ];

    const mulutLuar = new bSplineMulut(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, 
        mulutControlPoints,
        0.05, // radius
        20,   // segments
        100,  // curveDetail
        [0.53, 0.51, 0.77] // color (merah)
        
    );

    const mulutControlPointsDalam = [
    -0.0225, 0.1658,
    -0.3097, 0.1571,
    -0.4576, 0.1224,
    -0.5577, 0.0876,
    -0.5925, 0.0528,
    -0.5100, 0.1100,
    -0.4000, 0.1400,
    -0.1800, 0.1700,
    0.1800, 0.1700,
    0.4000, 0.1400,
    0.4953, 0.1137,
    0.6084, 0.0615,
    0.5127, 0.1137,
    0.3517, 0.1484,
    0.2647, 0.1658
    ];

    const mulutDalam = new bSplineMulut(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, 
        mulutControlPointsDalam,
        0.05, // radius
        20,   // segments
        100,  // curveDetail
        [0.929, 0.678, 0.706] // color (merah)
    );

    const mataKiriControlPoints = [
        -0.1313, -0.1557,
        -0.2488, -0.1296,
        -0.3837, -0.0862,
        -0.4794, -0.0167,
        -0.5751, 0.2788,
        -0.4794, -0.0167,
        -0.3880, -0.0775,
        -0.2531, -0.1383,
        -0.1313, -0.1557,
        0.0906, -0.1209
    ];

    const mataKananControlPoints = [
        0.1313, -0.1557,
        0.2488, -0.1296,
        0.3837, -0.0862,
        0.4794, -0.0167,
        0.5751, 0.2788,
        0.4794, -0.0167,
        0.3880, -0.0775,
        0.2531, -0.1383,
        0.1313, -0.1557,
       -0.0906, -0.1209
    ];


    const mataKiri = new bSplineMulut(GL, SHADER_PROGRAM, _position, _color, _Mmatrix,
        mataKiriControlPoints,
        0.03,
        20,
        100,
        [0.1, 0.1, 0.1]
    );

    const mataKanan = new bSplineMulut(GL, SHADER_PROGRAM, _position, _color, _Mmatrix,
        mataKananControlPoints,
        0.03,
        20,
        100,
        [0.1, 0.1, 0.1], 0.
    );

    const putihbolarambutDepan = new Ellipsoid(
        GL, SHADER_PROGRAM, _position, _color,
        0.3, 0.3, 0.3,
        20, 20,
        [1.0, 1.0, 1.0]
    );

    const putihbolarambutBelakang = new Ellipsoid(
        GL, SHADER_PROGRAM, _position, _color,
        0.3, 0.3, 0.3,
        20, 20,
        [1.0, 1.0, 1.0]
    );

    const putihbolarambutKanan = new Ellipsoid(
        GL, SHADER_PROGRAM, _position, _color,
        0.3, 0.3, 0.3,
        20, 20,
        [1.0, 1.0, 1.0]
    );

    const putihbolarambutKiri = new Ellipsoid(
        GL, SHADER_PROGRAM, _position, _color,
        0.3, 0.3, 0.3,
        20, 20,
        [1.0, 1.0, 1.0]
    );

    badan.childs.push(rambut);
    badan.childs.push(bolarambut);
    badan.childs.push(legKiri);
    badan.childs.push(legKanan);
    legKiri.childs.push(footKiri);
    legKanan.childs.push(footKanan);
    badan.childs.push(handKanan);
    badan.childs.push(handKiri);
    badan.childs.push(mulutLuar);
    badan.childs.push(mulutDalam);
    badan.childs.push(mataKiri);
    badan.childs.push(mataKanan);
    mulutLuar.childs.push(iler1);
    mulutLuar.childs.push(iler2);
    bolarambut.childs.push(putihbolarambutDepan);
    bolarambut.childs.push(putihbolarambutBelakang);
    bolarambut.childs.push(putihbolarambutKanan);
    bolarambut.childs.push(putihbolarambutKiri);

    /*================ CAMERA =================*/
    const PROJMATRIX = LIBS.get_projection(70, CANVAS.width / CANVAS.height, 1, 100);
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

    LIBS.translateY(mulutLuar.POSITION_MATRIX, -0.27); 
    LIBS.translateZ(mulutLuar.POSITION_MATRIX, 1.31);  
    
    LIBS.translateY(mulutDalam.POSITION_MATRIX, -0.36); 
    LIBS.translateZ(mulutDalam.POSITION_MATRIX, 1.30);   
    
    LIBS.rotateX(iler1.POSITION_MATRIX, 1.6);
    LIBS.translateY(iler1.POSITION_MATRIX, -0.08);
    LIBS.translateX(iler1.POSITION_MATRIX, 0.38);
    LIBS.rotateX(iler1.POSITION_MATRIX, 1.57); 
    
    LIBS.rotateX(iler2.POSITION_MATRIX, 1.6);
    LIBS.translateY(iler2.POSITION_MATRIX, -0.05);
    LIBS.translateX(iler2.POSITION_MATRIX, 0.45);
    LIBS.rotateX(iler2.POSITION_MATRIX, 1.57); 

    LIBS.translateX(mataKiri.POSITION_MATRIX, 0.7);
    LIBS.translateY(mataKiri.POSITION_MATRIX, 0.2);
    LIBS.translateZ(mataKiri.POSITION_MATRIX, 1.1);
    LIBS.rotateY(mataKiri.POSITION_MATRIX, 0.5);

    LIBS.translateX(mataKanan.POSITION_MATRIX, -0.7);
    LIBS.translateY(mataKanan.POSITION_MATRIX, 0.2);
    LIBS.translateZ(mataKanan.POSITION_MATRIX, 1.1);
    LIBS.rotateY(mataKanan.POSITION_MATRIX, -0.58);

    LIBS.translateY(putihbolarambutDepan.POSITION_MATRIX, 1.68);
    LIBS.translateZ(putihbolarambutDepan.POSITION_MATRIX, 1);

    LIBS.translateY(putihbolarambutBelakang.POSITION_MATRIX, 1.68);
    LIBS.translateZ(putihbolarambutBelakang.POSITION_MATRIX, -1);

    LIBS.translateX(putihbolarambutKanan.POSITION_MATRIX, 1);
    LIBS.translateY(putihbolarambutKanan.POSITION_MATRIX, 1.68);

    LIBS.translateX(putihbolarambutKiri.POSITION_MATRIX, -1);
    LIBS.translateY(putihbolarambutKiri.POSITION_MATRIX, 1.68);
    

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

        badan.render(_Mmatrix, LIBS.get_I4());

        requestAnimationFrame(animate);
    }

    animate();
}

window.addEventListener('load', main);
