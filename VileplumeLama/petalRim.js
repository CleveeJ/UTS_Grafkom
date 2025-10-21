class PetalRim {
  constructor(gl, program, radiusX, radiusY, height, thickness, color) {
    this.gl = gl;
    this.program = program;
    this.color = color;

    const segments = 48;
    let vertices = [];
    let indices = [];

    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * 2 * Math.PI;
      const x = Math.cos(theta) * radiusX;
      const y = Math.sin(theta) * radiusY;

      // atas
      vertices.push(x, y, height);
      // bawah (geser ke dalam sedikit biar nutup)
      vertices.push(x, y, -height * 0.5);
    }

    for (let i = 0; i < segments * 2; i += 2) {
      indices.push(i, i + 1, i + 2);
      indices.push(i + 1, i + 3, i + 2);
    }

    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    this.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    this.numIndices = indices.length;
  }

  draw() {
    const gl = this.gl;
    const program = this.program;

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.vertexAttribPointer(program.aVertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(program.aVertexPosition);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

    gl.uniform4fv(program.uColor, this.color);
    gl.drawElements(gl.TRIANGLES, this.numIndices, gl.UNSIGNED_SHORT, 0);
  }
}
