import { LIBS, mat4 } from "./libs.js";
import { Character } from "./Objects/Character.js";

function main() {
  const gl = LIBS.get_gl_context("mycanvas");
  const shaderProgram = initShader(gl);
  const character = new Character(gl, shaderProgram);

  let rotationX = 0, rotationY = 0;
  let dragging = false, lastX, lastY;
  const canvas = gl.canvas;

  canvas.addEventListener("mousedown", e => { dragging = true; lastX = e.clientX; lastY = e.clientY; });
  canvas.addEventListener("mouseup", () => dragging = false);
  canvas.addEventListener("mousemove", e => {
    if (!dragging) return;
    const dx = e.clientX - lastX, dy = e.clientY - lastY;
    rotationY += dx * 0.01;
    rotationX += dy * 0.01;
    lastX = e.clientX; lastY = e.clientY;
  });

  function render() {
    gl.clearColor(226 / 255, 198 / 255, 255 / 255, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, LIBS.degToRad(45), gl.canvas.clientWidth / gl.canvas.clientHeight, 0.1, 100.0);

    let modelViewMatrix = mat4.create();
    mat4.translate(modelViewMatrix, modelViewMatrix, [0.0, 0.9, -5.0]);
    mat4.rotateX(modelViewMatrix, modelViewMatrix, LIBS.degToRad(-90));
    mat4.rotateY(modelViewMatrix, modelViewMatrix, rotationY);
    mat4.rotateX(modelViewMatrix, modelViewMatrix, rotationX);

    character.draw(modelViewMatrix, projectionMatrix);

    requestAnimationFrame(render);
  }

  render();
}

function initShader(gl) {
  const vsSource = `
    attribute vec3 aVertexPosition;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aVertexPosition, 1.0);
    }
  `;
  const fsSource = `
    precision mediump float;
    uniform vec4 uColor;
    void main(void) { gl_FragColor = uColor; }
  `;

  const vertexShader = LIBS.get_shader(gl, "shader-vs", vsSource);
  const fragmentShader = LIBS.get_shader(gl, "shader-fs", fsSource);
  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);
  gl.useProgram(shaderProgram);

  shaderProgram.aVertexPosition = gl.getAttribLocation(shaderProgram, "aVertexPosition");
  shaderProgram.uColor = gl.getUniformLocation(shaderProgram, "uColor");
  shaderProgram.uModelViewMatrix = gl.getUniformLocation(shaderProgram, "uModelViewMatrix");
  shaderProgram.uProjectionMatrix = gl.getUniformLocation(shaderProgram, "uProjectionMatrix");

  return shaderProgram;
}

window.onload = main;
