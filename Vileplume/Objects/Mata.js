import { BezierCircle } from "../Geometry/BezierCircle.js";
import { mat4, LIBSS } from "../libs.js";

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

  draw(bodyMatrix, projectionMatrix, time = 0) {
    const gl = this.gl;

    // ===== MATA KIRI (tetap normal) =====
    let ML = bodyMatrix.slice();
    mat4.translate(ML, ML, [-0.3, 0.28, 0.725]);
    mat4.rotateX(ML, ML, LIBSS.degToRad(-18));
    mat4.rotateY(ML, ML, LIBSS.degToRad(-18));
    this.leftEye[0].draw(ML);
    let ML2 = ML.slice(); mat4.translate(ML2, ML2, [0, 0, 0.01]); this.leftEye[1].draw(ML2);
    let ML3 = ML2.slice(); mat4.translate(ML3, ML3, [0, 0, 0.01]); this.leftEye[2].draw(ML3);

    // ===== MATA KANAN =====
    let MR = bodyMatrix.slice();
    mat4.translate(MR, MR, [0.3, 0.28, 0.725]);
    mat4.rotateX(MR, MR, LIBSS.degToRad(-18));
    mat4.rotateY(MR, MR, LIBSS.degToRad(18));

    // fase animasi (0 → normal, mendekati π → mengecil, lalu balik)
    const phase = (Math.sin(time * 2.0) + 1) / 2; // 0..1
    const winkScale = 0.3 + phase * 0.7;          // 0.3–1.0
    const tilt = (1 - phase) * LIBSS.degToRad(15); // makin miring saat hampir tutup

    if (winkScale > 0.45) {
      // --- fase mata masih "bulat" ---
      let MR_anim = MR.slice();
      mat4.rotateZ(MR_anim, MR_anim, -tilt);
      mat4.scale(MR_anim, MR_anim, [1.0, winkScale, 1.0]); // mengecil halus

      this.rightEye[0].draw(MR_anim);
      let MR2 = MR_anim.slice(); mat4.translate(MR2, MR2, [0, 0, 0.01]); this.rightEye[1].draw(MR2);
      let MR3 = MR2.slice(); mat4.translate(MR3, MR3, [0, 0, 0.01]); this.rightEye[2].draw(MR3);
    } else {
      // --- fase mata sudah sangat kecil, ganti "<" ---
      gl.useProgram(this.program);
      const verts = new Float32Array([
        -0.10,  0.08, 0,
        0.00,  0.00, 0,
        -0.10, -0.08, 0,
      ]);
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
      gl.vertexAttribPointer(this.program.aVertexPosition, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(this.program.aVertexPosition);
      gl.uniform4fv(this.program.uColor, [0.0, 0.0, 0.0, 1.0]);

      // 👉 geser sedikit ke kanan dan perbesar sedikit
      let MR_cute = MR.slice();
      mat4.translate(MR_cute, MR_cute, [0.05, 0.0, 0.0]); // geser kanan 0.05
      mat4.scale(MR_cute, MR_cute, [1, 1, 1.0]);      // tetap besar seperti sebelumnya

      gl.uniformMatrix4fv(this.program.uModelViewMatrix, false, MR_cute);
      gl.lineWidth(5.0);
      gl.drawArrays(gl.LINE_STRIP, 0, 3);
    }
  }
}
