import { Character } from "./Character.js";
function main() {
    const CANVAS = document.getElementById("mycanvas");
    CANVAS.width = window.innerWidth;
    CANVAS.height = window.innerHeight;

    var drag = false;
    var x_prev, y_prev;
    var mouseDown = function (e) {
        drag = true;
        x_prev = e.pageX, y_prev = e.pageY;
        e.preventDefault();
        return false;
    };
    var mouseUp = function (e) {
        drag = false;
    };
    var mouseMove = function (e) {
        if (!drag) return false;
        dX = (e.pageX - x_prev) * 2 * Math.PI / CANVAS.width;
        dY = (e.pageY - y_prev) * 2 * Math.PI / CANVAS.height;
        THETA += dX;
        PHI += dY;
        x_prev = e.pageX, y_prev = e.pageY;
        e.preventDefault();
    };

    CANVAS.addEventListener("mousedown", mouseDown, false);
    CANVAS.addEventListener("mouseup", mouseUp, false);
    CANVAS.addEventListener("mouseout", mouseUp, false);
    CANVAS.addEventListener("mousemove", mouseMove, false);

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

    var BellossomObject = new Character(GL, SHADER_PROGRAM, _position, _color);

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

    let time = 0;

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
        
        BellossomObject.render(_Mmatrix, LIBS.get_I4(), time);
        GL.flush();
        window.requestAnimationFrame(animate);
        time += 0.02;
    }
    animate();
}

window.addEventListener('load', main);
