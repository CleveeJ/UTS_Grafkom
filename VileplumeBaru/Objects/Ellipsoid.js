
export class Ellipsoid {
  GL = null;
  SHADER_PROGRAM = null;

  _position = null;
  _color = null;
  _MMatrix = null;

  OBJECT_VERTEX = null;
  OBJECT_FACES = null;

  vertex = [];
  faces = [];

  MODEL_MATRIX = LIBS.get_I4();
  POSITION_MATRIX = LIBS.get_I4();
  MOVE_MATRIX = LIBS.get_I4();

  childs = [];

  constructor(
    GL,
    SHADER_PROGRAM,
    _position,
    _color,
    rx = 1,
    ry = 1,
    rz = 1,
    stacks = 20,
    slices = 20,
    colorValue = [1, 1, 1]
  ) {
    this.GL = GL;
    this.SHADER_PROGRAM = SHADER_PROGRAM;

    this._position = _position;
    this._color = _color;

    this.vertex = [];
    this.faces = [];

    // ===== Buat vertex =====
    for (let i = 0; i <= stacks; i++) {
      const phi = (i * Math.PI) / stacks;
      for (let j = 0; j <= slices; j++) {
        const theta = (j * 2 * Math.PI) / slices;

        const x = rx * Math.sin(phi) * Math.cos(theta);
        const y = ry * Math.sin(phi) * Math.sin(theta);
        const z = rz * Math.cos(phi);

        this.vertex.push(x, y, z, colorValue[0], colorValue[1], colorValue[2]);
      }
    }

    // ===== Buat faces =====
    for (let i = 0; i < stacks; i++) {
      for (let j = 0; j < slices; j++) {
        const first = i * (slices + 1) + j;
        const second = first + slices + 1;
        this.faces.push(first, second, first + 1);
        this.faces.push(second, second + 1, first + 1);
      }
    }
  }

  setup() {
    // buffer vertex
    this.OBJECT_VERTEX = this.GL.createBuffer();
    this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.OBJECT_VERTEX);
    this.GL.bufferData(this.GL.ARRAY_BUFFER, new Float32Array(this.vertex), this.GL.STATIC_DRAW);

    // buffer faces
    this.OBJECT_FACES = this.GL.createBuffer();
    this.GL.bindBuffer(this.GL.ELEMENT_ARRAY_BUFFER, this.OBJECT_FACES);
    this.GL.bufferData(this.GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.faces), this.GL.STATIC_DRAW);

    // setup anak-anak juga
    this.childs.forEach(child => child.setup());
  }

  render(_MMatrix, PARENT_MATRIX) {
    // hitung model matrix
    this.MODEL_MATRIX = LIBS.multiply(this.MOVE_MATRIX, this.POSITION_MATRIX);
    this.MODEL_MATRIX = LIBS.multiply(this.MODEL_MATRIX, PARENT_MATRIX);

    this.GL.useProgram(this.SHADER_PROGRAM);
    this.GL.uniformMatrix4fv(_MMatrix, false, this.MODEL_MATRIX);

    // aktifkan buffer
    this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.OBJECT_VERTEX);
    this.GL.bindBuffer(this.GL.ELEMENT_ARRAY_BUFFER, this.OBJECT_FACES);

    // atribut posisi dan warna
    this.GL.vertexAttribPointer(this._position, 3, this.GL.FLOAT, false, 4 * 6, 0);
    this.GL.vertexAttribPointer(this._color, 3, this.GL.FLOAT, false, 4 * 6, 4 * 3);

    // gambar ellipsoid
    this.GL.drawElements(this.GL.TRIANGLES, this.faces.length, this.GL.UNSIGNED_SHORT, 0);

    // render anak-anak
    this.childs.forEach(child => {
      child.render(_MMatrix, this.MODEL_MATRIX);
    });
  }
}
