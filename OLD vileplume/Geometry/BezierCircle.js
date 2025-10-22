import { mat4 } from "../libs.js";

export class BezierCircle {
  constructor(gl, program, radius = 0.1, segments = 40, color = [1, 1, 1, 1]) {
    this.gl = gl;
    this.program = program;
    this.radius = radius;
    this.segments = segments;
    this.color = color;

    // Buat titik-titik lingkaran
    const vertices = [];
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * 2 * Math.PI;
      const x = Math.cos(theta) * radius;
      const y = Math.sin(theta) * radius;
      vertices.push(x, y, 0);
    }

    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    this.vertexCount = vertices.length / 3;
  }

  draw(modelMatrix) {
    const gl = this.gl;

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.vertexAttribPointer(this.program.aVertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.program.aVertexPosition);

    // kirim uniform warna dan matrix
    gl.uniform4fv(this.program.uColor, this.color);
    gl.uniformMatrix4fv(this.program.uModelViewMatrix, false, modelMatrix);

    // GAMBAR
    gl.drawArrays(gl.TRIANGLE_FAN, 0, this.vertexCount);
  }
}
