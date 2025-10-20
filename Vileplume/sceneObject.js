class SceneObject {
  constructor(gl, program, vertices, indices, color) {
    this.gl = gl;
    this.program = program;
    this.color = color;

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

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.vertexAttribPointer(this.program.aVertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.program.aVertexPosition);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

    // SET warna uniform dengan benar
    gl.uniform4fv(this.program.uColor, this.color);

    gl.drawElements(gl.TRIANGLES, this.numIndices, gl.UNSIGNED_SHORT, 0);
  }
}
