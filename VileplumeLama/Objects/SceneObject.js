export class SceneObject {
  constructor(gl, program, vertices, indices, color) {
    this.gl = gl;
    this.program = program;
    this.color = color;
    this.projectionMatrix = null;

    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    this.indexBuffer = null;
    if (indices && indices.length > 0) {
      this.indexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
      this.numIndices = indices.length;
    } else {
      this.numVertices = vertices.length / 3;
    }
  }

  draw(matrix) {
    const gl = this.gl;
    const program = this.program;
    gl.useProgram(program);

    // kirim uniform ke shader
    if (program.uProjectionMatrix && this.projectionMatrix) {
      gl.uniformMatrix4fv(program.uProjectionMatrix, false, this.projectionMatrix);
    }
    gl.uniformMatrix4fv(program.uModelViewMatrix, false, matrix);
    gl.uniform4fv(program.uColor, this.color);

    // buffer vertex
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.vertexAttribPointer(program.aVertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(program.aVertexPosition);

    // gambar
    if (this.indexBuffer) {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
      gl.drawElements(gl.TRIANGLES, this.numIndices, gl.UNSIGNED_SHORT, 0);
    } else {
      gl.drawArrays(gl.TRIANGLE_FAN, 0, this.numVertices);
    }
  }
}
