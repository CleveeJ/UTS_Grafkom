export class BezierCircle {
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

  constructor(GL, SHADER_PROGRAM, _position, _color, radius = 0.1, segments = 40, colorValue = [1, 1, 1]) {
    this.GL = GL;
    this.SHADER_PROGRAM = SHADER_PROGRAM;

    this._position = _position;
    this._color = _color;

    this.vertex = [];
    this.faces = [];

    // Titik tengah (pusat)
    this.vertex.push(0, 0, 0, colorValue[0], colorValue[1], colorValue[2]);

    // Titik keliling lingkaran
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * 2 * Math.PI;
      const x = Math.cos(theta) * radius;
      const y = Math.sin(theta) * radius;
      const z = 0;
      this.vertex.push(x, y, z, colorValue[0], colorValue[1], colorValue[2]);
    }

    // Indeks segitiga (TRIANGLE_FAN style)
    for (let i = 1; i <= segments; i++) {
      this.faces.push(0, i, i + 1);
    }

    // Simpan radius untuk keperluan transformasi opsional
    this.radius = radius;
  }

  setup() {
    // Buffer untuk vertex
    this.OBJECT_VERTEX = this.GL.createBuffer();
    this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.OBJECT_VERTEX);
    this.GL.bufferData(this.GL.ARRAY_BUFFER, new Float32Array(this.vertex), this.GL.STATIC_DRAW);

    // Buffer untuk faces
    this.OBJECT_FACES = this.GL.createBuffer();
    this.GL.bindBuffer(this.GL.ELEMENT_ARRAY_BUFFER, this.OBJECT_FACES);
    this.GL.bufferData(this.GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.faces), this.GL.STATIC_DRAW);

    // Setup child objects
    this.childs.forEach(child => child.setup());
  }

  render(_MMatrix, PARENT_MATRIX) {
    // Hitung model matrix hasil gabungan parent
    this.MODEL_MATRIX = LIBS.multiply(this.MOVE_MATRIX, this.POSITION_MATRIX);
    this.MODEL_MATRIX = LIBS.multiply(this.MODEL_MATRIX, PARENT_MATRIX);

    this.GL.useProgram(this.SHADER_PROGRAM);
    this.GL.uniformMatrix4fv(_MMatrix, false, this.MODEL_MATRIX);

    // Bind buffer vertex dan faces
    this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.OBJECT_VERTEX);
    this.GL.bindBuffer(this.GL.ELEMENT_ARRAY_BUFFER, this.OBJECT_FACES);

    // a_position
    this.GL.vertexAttribPointer(this._position, 3, this.GL.FLOAT, false, 4 * 6, 0);
    this.GL.vertexAttribPointer(this._color, 3, this.GL.FLOAT, false, 4 * 6, 4 * 3);

    // Gambar
    this.GL.drawElements(this.GL.TRIANGLES, this.faces.length, this.GL.UNSIGNED_SHORT, 0);

    // Render anak-anak
    this.childs.forEach(child => {
      child.render(_MMatrix, this.MODEL_MATRIX);
    });
  }
}
