import { mat4 } from "../libs.js";

export class Smile {
  constructor(gl, program) {
    this.gl = gl;
    this.program = program;
  }

  draw(bodyMatrix, projectionMatrix) {
    const gl = this.gl, program = this.program;
    gl.useProgram(program);
    gl.uniformMatrix4fv(program.uProjectionMatrix, false, projectionMatrix);

    let M = bodyMatrix.slice();
    mat4.translate(M, M, [0.0, -0.10, 0.78]); // turun sedikit, keluar ke depan
    // bezier
    const p0 = [-0.25, 0.00, 0], p1 = [-0.25, -0.22, 0], p2 = [0.25, -0.22, 0], p3 = [0.25, 0.00, 0];
    const verts = [];
    for (let i = 0; i <= 40; i++) {
      const t = i / 40, u = 1 - t, tt = t*t, uu = u*u;
      const x = uu*u*p0[0] + 3*uu*t*p1[0] + 3*u*tt*p2[0] + tt*t*p3[0];
      const y = uu*u*p0[1] + 3*uu*t*p1[1] + 3*u*tt*p2[1] + tt*t*p3[1];
      verts.push(x, y, 0);
    }
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    gl.vertexAttribPointer(program.aVertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(program.aVertexPosition);
    gl.uniform4fv(program.uColor, [0,0,0,1]);
    gl.uniformMatrix4fv(program.uModelViewMatrix, false, M);
    gl.drawArrays(gl.LINE_STRIP, 0, verts.length/3);
  }
}
