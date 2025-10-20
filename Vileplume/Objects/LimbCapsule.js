import { mat4, LIBS } from "../libs.js";
import { Ellipsoid } from "../Geometry/Ellipsoid.js";
import { Cylinder } from "../Geometry/Cylinder.js";

export class LimbCapsule {
  constructor(gl, program, radius, length, color = [0.4, 0.5, 0.9, 1.0]) {
    this.gl = gl;
    this.program = program;
    this.color = color;
    this.radius = radius;
    this.length = length;

    // bagian utama (vertikal)
    this.cylinder = new Cylinder(gl, program, radius, radius, length * 0.6, 32, color);

    // ujung-ujung
    this.top = new Ellipsoid(gl, program, radius, radius, radius, 24, 24, color);
    this.bottom = new Ellipsoid(gl, program, radius, radius, radius, 24, 24, color);

    // bagian horizontal (telapak kaki atau tangan)
    this.foot = new Cylinder(gl, program, radius * 0.8, radius * 0.8, length * 0.7, 32, color);
  }

  draw(baseMatrix) {
    const gl = this.gl;
    const radius = this.radius;

    gl.uniform4fv(this.program.uColor, this.color);

    // batang vertikal
    this.cylinder.draw(baseMatrix);

    // ujung atas
    let Mtop = baseMatrix.slice();
    mat4.translate(Mtop, Mtop, [0, 0, this.cylinder.height / 2]);
    this.top.draw(Mtop);

    // ujung bawah
    let Mbot = baseMatrix.slice();
    mat4.translate(Mbot, Mbot, [0, 0, -this.cylinder.height / 2]);
    this.bottom.draw(Mbot);

    // batang horizontal (telapak)
    let Mfoot = Mbot.slice();
    mat4.translate(Mfoot, Mfoot, [0, 0, -radius * 0.4]);
    mat4.rotateX(Mfoot, Mfoot, LIBS.degToRad(90));
    mat4.translate(Mfoot, Mfoot, [this.cylinder.height * 0.5, 0, 0]);
    this.foot.draw(Mfoot);
  }
}
