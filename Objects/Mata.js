import { BezierCircle } from "../Geometry/BezierCircle.js";
import { mat4, LIBS } from "../libs.js";

export class Mata {
  constructor(gl, program) {
    this.gl = gl;
    this.program = program;

    this.leftEye = [
      new BezierCircle(gl, program, 0.10, 40, [0.0, 0.0, 0.0, 1.0]),
      new BezierCircle(gl, program, 0.08, 40, [0.8, 0.0, 0.0, 1.0]),
      new BezierCircle(gl, program, 0.04, 40, [1.0, 1.0, 1.0, 1.0]),
    ];
    this.rightEye = [
      new BezierCircle(gl, program, 0.10, 40, [0.0, 0.0, 0.0, 1.0]),
      new BezierCircle(gl, program, 0.08, 40, [0.8, 0.0, 0.0, 1.0]),
      new BezierCircle(gl, program, 0.04, 40, [1.0, 1.0, 1.0, 1.0]),
    ];
  }

  draw(bodyMatrix, projectionMatrix) {
    // kiri
    let ML = bodyMatrix.slice();
    mat4.translate(ML, ML, [-0.3, 0.28, 0.725]);
    mat4.rotateX(ML, ML, LIBS.degToRad(-18));
    mat4.rotateY(ML, ML, LIBS.degToRad(-18));

    this.leftEye[0].draw(ML);
    let ML2 = ML.slice(); mat4.translate(ML2, ML2, [0, 0, 0.01]); this.leftEye[1].draw(ML2);
    let ML3 = ML2.slice(); mat4.translate(ML3, ML3, [0, 0, 0.01]); this.leftEye[2].draw(ML3);

    // kanan
    let MR = bodyMatrix.slice();
    mat4.translate(MR, MR, [0.3, 0.28, 0.725]);
    mat4.rotateX(MR, MR, LIBS.degToRad(-18));
    mat4.rotateY(MR, MR, LIBS.degToRad(18));

    this.rightEye[0].draw(MR);
    let MR2 = MR.slice(); mat4.translate(MR2, MR2, [0, 0, 0.01]); this.rightEye[1].draw(MR2);
    let MR3 = MR2.slice(); mat4.translate(MR3, MR3, [0, 0, 0.01]); this.rightEye[2].draw(MR3);
  }
}
