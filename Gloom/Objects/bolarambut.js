// BolaRambut.js
export class BolaRambut {
  GL = null;
  SHADER_PROGRAM = null;

  _position = null;
  _color = null;
  _normal = null;
  _MMatrix = null;

  OBJECT_VERTEX = null;
  OBJECT_FACES = null;

  vertex = [];
  faces = [];

  POSITION_MATRIX = LIBS.get_I4();
  MOVE_MATRIX = LIBS.get_I4();
  MODEL_MATRIX = LIBS.get_I4();

  childs = [];

  constructor(GL, SHADER_PROGRAM, _position, _color, _MMatrix, _normal) {
    this.GL = GL;
    this.SHADER_PROGRAM = SHADER_PROGRAM;
    this._position = _position;
    this._color = _color;
    this._normal = _normal;
    this._MMatrix = _MMatrix;

    this.centerPos = [0, 1.4, 0];
    this.positions = [
      [0, 0, 0], // tengah
      [0.8, 0, 0], // kanan
      [-0.8, 0, 0], // kiri
      [0, 0, 0.8], // depan
      [0, 0, -0.8], // belakang
    ];
    this.scales = [0.4, 0.6, 0.6, 0.6, 0.6];
    this.colors = [
      [0.969, 0.537, 0.322],
      [0.78, 0.53, 0.46],
      [0.78, 0.53, 0.46],
      [0.78, 0.53, 0.46],
      [0.78, 0.53, 0.46],
    ];

    this._generateSphereMesh(16, 16);
  }

  _generateSphereMesh(stacks, slices) {
    const vertices = [];
    const faces = [];

    for (let i = 0; i <= stacks; i++) {
      const phi = i * Math.PI / stacks;
      for (let j = 0; j <= slices; j++) {
        const theta = j * 2 * Math.PI / slices;
        const x = Math.sin(phi) * Math.cos(theta);
        const y = Math.cos(phi);
        const z = Math.sin(phi) * Math.sin(theta);

        // normal = posisi unit sphere
        const nx = x;
        const ny = y;
        const nz = z;

        // default warna putih
        vertices.push(
          x, y, z,     // posisi
          nx, ny, nz,  // normal
          1.0, 1.0, 1.0 // warna placeholder
        );
      }
    }

    for (let i = 0; i < stacks; i++) {
      for (let j = 0; j < slices; j++) {
        const first = i * (slices + 1) + j;
        const second = first + slices + 1;
        faces.push(first, second, first + 1);
        faces.push(second, second + 1, first + 1);
      }
    }

    this.vertex = vertices;
    this.faces = faces;
  }

  setup() {
    const gl = this.GL;
    this.OBJECT_VERTEX = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.OBJECT_VERTEX);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertex), gl.STATIC_DRAW);

    this.OBJECT_FACES = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.OBJECT_FACES);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.faces), gl.STATIC_DRAW);

    this.childs.forEach((child) => child.setup());
  }

  render(_MMatrix, PARENT_MATRIX) {
    const gl = this.GL;
    gl.useProgram(this.SHADER_PROGRAM);

    // total per vertex: 9 floats (pos3 + normal3 + color3)
    const stride = 4 * 9;

    for (let i = 0; i < this.positions.length; i++) {
      const pos = this.positions[i];
      const scale = this.scales[i];
      const color = this.colors[i];

      let M = LIBS.get_I4();

      // translasi
      if (LIBS.translate3D) {
        LIBS.translate3D(M, this.centerPos[0] + pos[0], this.centerPos[1] + pos[1], this.centerPos[2] + pos[2]);
      } else {
        M[12] += this.centerPos[0] + pos[0];
        M[13] += this.centerPos[1] + pos[1];
        M[14] += this.centerPos[2] + pos[2];
      }

      // scale
      if (LIBS.scale3D) {
        LIBS.scale3D(M, scale, scale, scale);
      } else {
        M[0] *= scale; M[5] *= scale; M[10] *= scale;
      }

      M = LIBS.multiply(LIBS.multiply(this.MOVE_MATRIX, M), PARENT_MATRIX);

      gl.uniformMatrix4fv(this._MMatrix, false, M);

      // buat buffer warna sesuai bola
      const coloredVertex = [];
      for (let v = 0; v < this.vertex.length / 9; v++) {
        const base = v * 9;
        coloredVertex.push(
          this.vertex[base + 0], this.vertex[base + 1], this.vertex[base + 2], // pos
          this.vertex[base + 3], this.vertex[base + 4], this.vertex[base + 5], // normal
          color[0], color[1], color[2] // warna unik
        );
      }

      gl.bindBuffer(gl.ARRAY_BUFFER, this.OBJECT_VERTEX);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(coloredVertex), gl.STATIC_DRAW);

      gl.vertexAttribPointer(this._position, 3, gl.FLOAT, false, stride, 0);
      gl.enableVertexAttribArray(this._position);

      gl.vertexAttribPointer(this._normal, 3, gl.FLOAT, false, stride, 4 * 3);
      gl.enableVertexAttribArray(this._normal);

      gl.vertexAttribPointer(this._color, 3, gl.FLOAT, false, stride, 4 * 6);
      gl.enableVertexAttribArray(this._color);

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.OBJECT_FACES);
      gl.drawElements(gl.TRIANGLES, this.faces.length, gl.UNSIGNED_SHORT, 0);
    }

    this.childs.forEach((child) => child.render(_MMatrix, PARENT_MATRIX));
  }
}
