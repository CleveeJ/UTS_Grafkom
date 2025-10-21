export class Cylinder {
  GL = null;
  SHADER_PROGRAM = null;

  _position = null;
  _color = null;
  _normal = null;
  _MMatrix = null;

  OBJECT_VERTEX = null;
  OBJECT_FACES = null;
  OBJECT_NORMAL = null;

  vertex = [];
  faces = [];
  normal = [];

  MODEL_MATRIX = LIBS.get_I4();
  POSITION_MATRIX = LIBS.get_I4();
  MOVE_MATRIX = LIBS.get_I4();

  childs = [];

  constructor(
    GL,
    SHADER_PROGRAM,
    _position,
    _color,
    _normal = null,
    radiusTop = 0.5,
    radiusBottom = 0.5,
    height = 1.0,
    segments = 32,
    colorValue = [0.2, 0.2, 0.8]
  ) {
    this.GL = GL;
    this.SHADER_PROGRAM = SHADER_PROGRAM;

    this._position = _position;
    this._color = _color;
    this._normal = _normal;

    this.vertex = [];
    this.faces = [];
    this.normal = [];

    const zTop = height / 2;
    const zBottom = -height / 2;

    // ====== Vertex & Normal ======
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * 2 * Math.PI;
      const cos = Math.cos(theta);
      const sin = Math.sin(theta);

      // Posisi titik atas
      this.vertex.push(
        radiusTop * cos, radiusTop * sin, zTop,
        colorValue[0], colorValue[1], colorValue[2]
      );

      // Posisi titik bawah
      this.vertex.push(
        radiusBottom * cos, radiusBottom * sin, zBottom,
        colorValue[0], colorValue[1], colorValue[2]
      );

      // Normal sisi silinder (arah keluar)
      const nx = cos;
      const ny = sin;
      const nz = 0;

      // Normal atas & bawah sama
      this.normal.push(nx, ny, nz);
      this.normal.push(nx, ny, nz);
    }

    // ====== Faces: sambungkan sisi antar segmen ======
    for (let i = 0; i < segments * 2; i += 2) {
      this.faces.push(i, i + 1, i + 2);
      this.faces.push(i + 1, i + 3, i + 2);
    }

    this.height = height;
  }

  setup() {
    // ====== Buffer Vertex ======
    this.OBJECT_VERTEX = this.GL.createBuffer();
    this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.OBJECT_VERTEX);
    this.GL.bufferData(this.GL.ARRAY_BUFFER, new Float32Array(this.vertex), this.GL.STATIC_DRAW);

    // ====== Buffer Normal ======
    if (this._normal) {
      this.OBJECT_NORMAL = this.GL.createBuffer();
      this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.OBJECT_NORMAL);
      this.GL.bufferData(this.GL.ARRAY_BUFFER, new Float32Array(this.normal), this.GL.STATIC_DRAW);
    }

    // ====== Buffer Faces ======
    this.OBJECT_FACES = this.GL.createBuffer();
    this.GL.bindBuffer(this.GL.ELEMENT_ARRAY_BUFFER, this.OBJECT_FACES);
    this.GL.bufferData(this.GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.faces), this.GL.STATIC_DRAW);

    // Setup anak-anak
    this.childs.forEach(child => child.setup());
  }

  render(_MMatrix, PARENT_MATRIX) {
    // Hitung model matrix gabungan
    this.MODEL_MATRIX = LIBS.multiply(this.MOVE_MATRIX, this.POSITION_MATRIX);
    this.MODEL_MATRIX = LIBS.multiply(this.MODEL_MATRIX, PARENT_MATRIX);

    this.GL.useProgram(this.SHADER_PROGRAM);
    this.GL.uniformMatrix4fv(_MMatrix, false, this.MODEL_MATRIX);

    // Bind vertex dan faces
    this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.OBJECT_VERTEX);
    this.GL.bindBuffer(this.GL.ELEMENT_ARRAY_BUFFER, this.OBJECT_FACES);

    // Atribut posisi dan warna
    this.GL.vertexAttribPointer(this._position, 3, this.GL.FLOAT, false, 4 * 6, 0);
    this.GL.vertexAttribPointer(this._color, 3, this.GL.FLOAT, false, 4 * 6, 4 * 3);

    // Atribut normal (jika ada)
    if (this._normal && this.OBJECT_NORMAL) {
      this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.OBJECT_NORMAL);
      this.GL.vertexAttribPointer(this._normal, 3, this.GL.FLOAT, false, 0, 0);
    }

    // Gambar
    this.GL.drawElements(this.GL.TRIANGLES, this.faces.length, this.GL.UNSIGNED_SHORT, 0);

    // Render anak-anak
    this.childs.forEach(child => {
      child.render(_MMatrix, this.MODEL_MATRIX);
    });
  }
}
