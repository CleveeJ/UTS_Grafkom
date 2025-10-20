import { mat4, LIBSS } from "../libs.js";
import { Ellipsoid } from "../Geometry/Ellipsoid.js";
import { Cylinder } from "../Geometry/Cylinder.js";

export class Hand {
  constructor(gl, program, radius = 0.12, length = 0.6, color = [0.2, 0.9, 0.9, 1.0]) {
    this.gl = gl;
    this.program = program;
    this.color = color;
    this.radius = radius;
    this.length = length;

    // Bagian utama (batang lengan)
    this.cylinder = new Cylinder(gl, program, radius, radius, length * 0.8, 32, color);

    // Bahu (ujung atas)
    this.top = new Ellipsoid(gl, program, radius, radius, radius, 24, 24, color);

    // Tangan (ujung bawah)
    this.bottom = new Ellipsoid(gl, program, radius * 1.1, radius * 0.9, radius, 24, 24, color);
  }

  draw(baseMatrix) {
    const gl = this.gl;
    gl.uniform4fv(this.program.uColor, this.color);

    // batang utama
    this.cylinder.draw(baseMatrix);

    // bahu (atas)
    let Mtop = baseMatrix.slice();
    mat4.translate(Mtop, Mtop, [0, 0, this.cylinder.height / 2]);
    this.top.draw(Mtop);

    // tangan (bawah)
    let Mbot = baseMatrix.slice();
    mat4.translate(Mbot, Mbot, [0, 0, -this.cylinder.height / 2]);
    this.bottom.draw(Mbot);
  }
}
