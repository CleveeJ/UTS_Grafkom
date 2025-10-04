import { Ellipsoid } from "./Objects/Ellipsoid.js";
import { Capsule } from "./Objects/Capsule.js";
import { Leaf } from "./Objects/Leaf.js";
function main() {
    //GET CANVAS
    var CANVAS = document.getElementById("mycanvas");

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

    var keyDown = function (e) {
        if (e.key === 'w') {
            dY -= SPEED;
        }
        else if (e.key === 'a') {
            dX -= SPEED;
        }
        else if (e.key === 's') {
            dY += SPEED;
        }
        else if (e.key === 'd') {
            dX += SPEED;
        }
    }
    window.addEventListener("keydown", keyDown, false);


    //INIT WEBGL
    /** @type {WebGLRenderingContext} */
    var GL;
    try {
        GL = CANVAS.getContext("webgl", { antialias: true });
    } catch (e) {
        alert("WebGL context cannot be initialized");
        return false;
    }

    //INIT SHADERS: berupa teks
    var shader_vertex_source = `
        attribute vec3 position;
        uniform mat4 Pmatrix, Vmatrix, Mmatrix;
        attribute vec3 color;  
        varying vec3 vColor; 
       
        void main(void) {
            gl_Position = Pmatrix * Vmatrix * Mmatrix * vec4(position, 1.);
            vColor = color;
        }`;

    var shader_fragment_source = `
        precision mediump float;
        varying vec3 vColor;
       
        void main(void) {
            gl_FragColor = vec4(vColor, 1.);
        }`;


    //SHADER COMPILER: menjadikan object
    var compile_shader = function (source, type, typeString) {
        var shader = GL.createShader(type);
        GL.shaderSource(shader, source);
        GL.compileShader(shader);
        if (!GL.getShaderParameter(shader, GL.COMPILE_STATUS)) {
            alert("ERROR IN " + typeString + " SHADER: " + GL.getShaderInfoLog(shader));
            return false;
        }
        return shader;
    };
    var shader_vertex = compile_shader(shader_vertex_source, GL.VERTEX_SHADER, "VERTEX");
    var shader_fragment = compile_shader(shader_fragment_source, GL.FRAGMENT_SHADER, "FRAGMENT");

    //PROGRAM SHADER: mengaktifkan shader
    var SHADER_PROGRAM = GL.createProgram();
    GL.attachShader(SHADER_PROGRAM, shader_vertex);
    GL.attachShader(SHADER_PROGRAM, shader_fragment);

    GL.linkProgram(SHADER_PROGRAM);

    var _position = GL.getAttribLocation(SHADER_PROGRAM, "position");
    GL.enableVertexAttribArray(_position);

    var _color = GL.getAttribLocation(SHADER_PROGRAM, "color");
    GL.enableVertexAttribArray(_color);


    var _Pmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Pmatrix");
    var _Vmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Vmatrix");
    var _Mmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Mmatrix");

    GL.useProgram(SHADER_PROGRAM);

    /*========================= OBJECTS ========================= */
    var Head = new Ellipsoid(GL, SHADER_PROGRAM, _position, _color, 1.7, 1.7, 1.7, 20, 20, [0.7686, 0.8588, 0.6118]);
    var Body = new Capsule(GL, SHADER_PROGRAM, _position, _color, 1.2, 0.5, 1.2, 2, 20, 10, [0.3, 0.1, 0.6118]);
    var Right_Hand = new Capsule(GL, SHADER_PROGRAM, _position, _color, 0.3, 0.3, 0.3, 2, 20, 10, [0.8, 0.2, 0.6118]);
    var Left_Hand = new Capsule(GL, SHADER_PROGRAM, _position, _color, 0.3, 0.3, 0.3, 2, 20, 10, [0.5, 0.6, 0.6118]);

    var Skirt1 = [
        [new Leaf(GL, SHADER_PROGRAM, _position, _color, 1.0, 0.5, 20, 36, [0.0, 0.7, 0.1]), -1/6],
        [new Leaf(GL, SHADER_PROGRAM, _position, _color, 1.0, 0.5, 20, 36, [0.0, 0.7, 0.1]), 1/6],
        [new Leaf(GL, SHADER_PROGRAM, _position, _color, 1.0, 0.5, 20, 36, [0.9569, 0.9059, 0.5333]), 3/6],
        [new Leaf(GL, SHADER_PROGRAM, _position, _color, 1.0, 0.5, 20, 36, [0.0, 0.7, 0.1]), 5/6],
        [new Leaf(GL, SHADER_PROGRAM, _position, _color, 1.0, 0.5, 20, 36, [0.0, 0.7, 0.1]), 7/6],
        [new Leaf(GL, SHADER_PROGRAM, _position, _color, 1.0, 0.5, 20, 36, [0.9569, 0.9059, 0.5333]), 9/6],
    ];

    var Skirt2 = [
        [new Leaf(GL, SHADER_PROGRAM, _position, _color, 1.0, 0.5, 20, 36, [0.9569, 0.9059, 0.5333]), 0],
        [new Leaf(GL, SHADER_PROGRAM, _position, _color, 1.0, 0.5, 20, 36, [0.0, 0.7, 0.1]), 1/3],
        [new Leaf(GL, SHADER_PROGRAM, _position, _color, 1.0, 0.5, 20, 36, [0.0, 0.7, 0.1]), 2/3],
        [new Leaf(GL, SHADER_PROGRAM, _position, _color, 1.0, 0.5, 20, 36, [0.9569, 0.9059, 0.5333]), 1],
        [new Leaf(GL, SHADER_PROGRAM, _position, _color, 1.0, 0.5, 20, 36, [0.0, 0.7, 0.1]), 4/3],
        [new Leaf(GL, SHADER_PROGRAM, _position, _color, 1.0, 0.5, 20, 36, [0.0, 0.7, 0.1]), 5/3],
    ];

    Body.childs.push(Head);
    Body.childs.push(Right_Hand);
    Body.childs.push(Left_Hand);

    for (let index = 0; index < Skirt1.length; index++) {
        const element = Skirt1[index];
        Body.childs.push(element[0]);
    }

    for (let index = 0; index < Skirt1.length; index++) {
        const element = Skirt2[index];
        Body.childs.push(element[0]);
    }

    LIBS.translateY(Head.POSITION_MATRIX, 1);

    LIBS.rotateX(Right_Hand.POSITION_MATRIX, Math.PI / 2);
    LIBS.rotateY(Right_Hand.POSITION_MATRIX, -Math.PI / 3);
    LIBS.translateX(Right_Hand.POSITION_MATRIX, -1);
    LIBS.translateZ(Right_Hand.POSITION_MATRIX, 0.7);
    LIBS.translateY(Right_Hand.POSITION_MATRIX, 0.5);

    LIBS.rotateX(Left_Hand.POSITION_MATRIX, Math.PI / 2);
    LIBS.rotateY(Left_Hand.POSITION_MATRIX, Math.PI / 3);
    LIBS.translateX(Left_Hand.POSITION_MATRIX, 1);
    LIBS.translateZ(Left_Hand.POSITION_MATRIX, 0.7);
    LIBS.translateY(Left_Hand.POSITION_MATRIX, 0.5);

    LIBS.translateY(Head.POSITION_MATRIX, 1);

    for (let index = 0; index < Skirt1.length; index++) {
        const element = Skirt1[index];

        LIBS.translateZ(element[0].POSITION_MATRIX, -1.7);
        LIBS.rotateX(element[0].POSITION_MATRIX, Math.PI/6)
        LIBS.scaleX(element[0].POSITION_MATRIX, 1.3);
        var temp = LIBS.get_I4();
        LIBS.rotateY(temp, Math.PI * element[1]);
        element[0].POSITION_MATRIX = LIBS.multiply(element[0].POSITION_MATRIX, temp);

        LIBS.translateY(element[0].POSITION_MATRIX, -0.5)
    }

    for (let index = 0; index < Skirt2.length; index++) {
        const element = Skirt2[index];

        LIBS.translateZ(element[0].POSITION_MATRIX, -1.3);
        LIBS.rotateX(element[0].POSITION_MATRIX, Math.PI/6)
        var temp = LIBS.get_I4();
        LIBS.rotateY(temp, Math.PI * element[1]);
        element[0].POSITION_MATRIX = LIBS.multiply(element[0].POSITION_MATRIX, temp);

        LIBS.translateY(element[0].POSITION_MATRIX, -0.5)
    }

    Body.setup();
    
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
    GL.clearColor(0.0, 0.0, 0.0, 0.0);
    GL.clearDepth(1.0);

    var time_prev = 0;

    var animate = function (time) {
        GL.viewport(0, 0, CANVAS.width, CANVAS.height);
        GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

        var dt = time - time_prev;
        time_prev = time;

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
        
        Body.render(_Mmatrix, LIBS.get_I4());

        GL.flush();
        window.requestAnimationFrame(animate);
    };
    animate(0);
}
window.addEventListener('load', main);