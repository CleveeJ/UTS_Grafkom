import { mat4, LIBS } from "../libs.js";
import { Body } from "./Body.js";
import { Flower } from "./Flower.js";
import { Mata } from "./Mata.js";
import { Smile } from "./Smile.js";

export class Character {
  constructor(gl, program) {
    this.gl = gl;
    this.program = program;
    this.body = new Body(gl, program);
    this.bunga = new Flower(gl, program);
    this.mata = new Mata(gl, program);
    this.senyum = new Smile(gl, program);
  }

  draw(baseMatrix, projectionMatrix) {
  const gl = this.gl;

  // BADAN
  let bodyMatrix = baseMatrix.slice();
  mat4.translate(bodyMatrix, bodyMatrix, [0, 0, -1.2]);
  mat4.rotateX(bodyMatrix, bodyMatrix, LIBS.degToRad(90));
  this.body.draw(bodyMatrix, projectionMatrix);

  // MATA
  this.mata.draw(bodyMatrix, projectionMatrix);

  // SENYUM
  this.senyum.draw(bodyMatrix, projectionMatrix);

  // BUNGA
  let flowerMatrix = baseMatrix.slice();
  mat4.translate(flowerMatrix, flowerMatrix, [0, 1.0, 0]); // posisikan di atas kepala
  this.bunga.draw(flowerMatrix, projectionMatrix);
}

}
