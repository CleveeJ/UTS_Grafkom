import { mat4, LIBS } from "../libs.js";
import { Ellipsoid } from "./Ellipsoid.js";

export class Rambut {
  constructor(gl, program) {
    this.parts = [];
    for (let i = 0; i < 5; i++) {
      this.parts.push(new Ellipsoid(gl, program, 0.25, 0.2, 0.25, 20, 20, [0.25, 0.25, 0.25, 1]));
    }
  }

  draw(baseMatrix) {
    for (let i = 0; i < this.parts.length; i++) {
      let M = baseMatrix.slice();
      mat4.translate(M, M, [
        Math.cos(i * (Math.PI / 2.5)) * 0.8,
        0.9,
        Math.sin(i * (Math.PI / 2.5)) * 0.8
      ]);
      this.parts[i].draw(M);
    }
  }
}
