import { Bellossom } from "./bellosom.js";
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

    GL.useProgram(SHADER_PROGRAM);

    /*========================= OBJECTS ========================= */

    var BellossomObject = new Bellossom(GL, SHADER_PROGRAM, _position, _color);

    BellossomObject.setup();
    
    // ------------------------- END -----------------------

    var PROJMATRIX = LIBS.get_projection(40, CANVAS.width / CANVAS.height, 1, 100);
    var VIEWMATRIX = LIBS.get_I4();


    LIBS.translateZ(VIEWMATRIX, -10);

    var THETA = 0, PHI = 0;
    var FRICTION = 0.15;
    var dX = 0, dY = 0;
    var SPEED = 0.05;

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
            dX *= (1 - FRICTION), dY *= (1 - FRICTION);
            THETA += dX, PHI += dY;
        }

        GL.uniformMatrix4fv(_Pmatrix, false, PROJMATRIX);

        VIEWMATRIX = LIBS.get_I4();
        LIBS.translateZ(VIEWMATRIX, -30);

        LIBS.rotateY(VIEWMATRIX, THETA);
        LIBS.rotateX(VIEWMATRIX, PHI);

        GL.uniformMatrix4fv(_Vmatrix, false, VIEWMATRIX);
        
        BellossomObject.render(_Mmatrix, LIBS.get_I4());

    animate();
}

window.addEventListener('load', main);
