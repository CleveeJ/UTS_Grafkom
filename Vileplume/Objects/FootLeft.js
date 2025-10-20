import { mat4, LIBSS } from "../libs.js";
import { Ellipsoid } from "../Geometry/Ellipsoid.js";
import { Cylinder } from "../Geometry/Cylinder.js";

export class FootLeft {
  constructor(gl, program, radius = 0.12, length = 0.8, color = [0.4, 0.5, 0.9, 1.0]) {
    this.gl = gl;
    this.program = program;
    this.color = color;
    this.radius = radius;
    this.length = length;

    // Paha (batang utama)
    this.cylinder = new Cylinder(gl, program, radius, radius, length * 0.6, 32, color);

    // Ujung atas (pinggul)
    this.top = new Ellipsoid(gl, program, radius, radius, radius, 24, 24, color);

    // Ujung bawah (lutut / betis)
    this.bottom = new Ellipsoid(gl, program, radius, radius, radius, 24, 24, color);

    // Telapak kaki (silinder horizontal)
    this.foot = new Cylinder(gl, program, radius * 0.8, radius * 0.8, length * 0.5, 32, color);
  }

  draw(baseMatrix) {
    const gl = this.gl;
    const radius = this.radius;
    gl.uniform4fv(this.program.uColor, this.color);

    // batang utama
    mat4.translate(baseMatrix, baseMatrix, [0, -0.25, 0]);
    mat4.rotateY(baseMatrix, baseMatrix, LIBSS.degToRad(-20));
    this.cylinder.draw(baseMatrix);

    // ujung atas (pinggul)
    let Mtop = baseMatrix.slice();
    mat4.translate(Mtop, Mtop, [0, 0, this.cylinder.height / 2]);
    this.top.draw(Mtop);

    // ujung bawah (lutut)
    let Mbot = baseMatrix.slice();
    mat4.translate(Mbot, Mbot, [0, 0, -this.cylinder.height / 2]);
    this.bottom.draw(Mbot);

    // telapak kaki
    let Mfoot = Mbot.slice();
    mat4.translate(Mfoot, Mfoot, [0, 0, 0]);
    mat4.rotateX(Mfoot, Mfoot, LIBSS.degToRad(90)); // putar rebah ke depan
    mat4.translate(Mfoot, Mfoot, [0, 0, -0.25]);
    this.foot.draw(Mfoot);
  }
}
