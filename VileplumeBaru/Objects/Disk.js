export class Disk {
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
    radius = 0.5,
    segments = 40,
    colorValue = [0.87, 0.65, 0.25]
  ) {
    this.GL = GL;
    this.SHADER_PROGRAM = SHADER_PROGRAM;

    this._position = _position;
    this._color = _color;
    this._normal = _normal;

    this.vertex = [];
    this.faces = [];
    this.normal = [];

    // ====== Vertex (pusat + keliling) ======
    // titik pusat
    this.vertex.push(0, 0, 0, colorValue[0], colorValue[1], colorValue[2]);
    this.normal.push(0, 0, 1); // normal menghadap ke atas (sumbu Z)

    // titik keliling
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * 2 * Math.PI;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      const z = 0;

      this.vertex.push(x, y, z, colorValue[0], colorValue[1], colorValue[2]);
      this.normal.push(0, 0, 1); // normal tiap titik sama, menghadap Z+
    }

    // ====== Faces (TRIANGLE_FAN style) ======
    for (let i = 1; i <= segments; i++) {
      this.faces.push(0, i, i + 1);
    }
  }

  setup() {
    // ====== Buffer vertex ======
    this.OBJECT_VERTEX = this.GL.createBuffer();
    this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.OBJECT_VERTEX);
    this.GL.bufferData(this.GL.ARRAY_BUFFER, new Float32Array(this.vertex), this.GL.STATIC_DRAW);

    // ====== Buffer normal ======
    if (this._normal) {
      this.OBJECT_NORMAL = this.GL.createBuffer();
      this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.OBJECT_NORMAL);
      this.GL.bufferData(this.GL.ARRAY_BUFFER, new Float32Array(this.normal), this.GL.STATIC_DRAW);
    }

    // ====== Buffer faces ======
    this.OBJECT_FACES = this.GL.createBuffer();
    this.GL.bindBuffer(this.GL.ELEMENT_ARRAY_BUFFER, this.OBJECT_FACES);
    this.GL.bufferData(this.GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.faces), this.GL.STATIC_DRAW);

    // Setup anak-anak
    this.childs.forEach(child => child.setup());
  }

  render(_MMatrix, PARENT_MATRIX) {
    // Hitung model matrix hasil gabungan parent
    this.MODEL_MATRIX = LIBS.multiply(this.MOVE_MATRIX, this.POSITION_MATRIX);
    this.MODEL_MATRIX = LIBS.multiply(this.MODEL_MATRIX, PARENT_MATRIX);

    this.GL.useProgram(this.SHADER_PROGRAM);
    this.GL.uniformMatrix4fv(_MMatrix, false, this.MODEL_MATRIX);

    // Bind buffer vertex & faces
    this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.OBJECT_VERTEX);
    this.GL.bindBuffer(this.GL.ELEMENT_ARRAY_BUFFER, this.OBJECT_FACES);

    // Atribut posisi & warna
    this.GL.vertexAttribPointer(this._position, 3, this.GL.FLOAT, false, 4 * 6, 0);
    this.GL.vertexAttribPointer(this._color, 3, this.GL.FLOAT, false, 4 * 6, 4 * 3);

    // Atribut normal (jika ada)
    if (this._normal && this.OBJECT_NORMAL) {
      this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.OBJECT_NORMAL);
      this.GL.vertexAttribPointer(this._normal, 3, this.GL.FLOAT, false, 0, 0);
    }

    // Gambar disk
    this.GL.drawElements(this.GL.TRIANGLES, this.faces.length, this.GL.UNSIGNED_SHORT, 0);

    // Render anak-anak
    this.childs.forEach(child => {
      child.render(_MMatrix, this.MODEL_MATRIX);
    });
  }
}
