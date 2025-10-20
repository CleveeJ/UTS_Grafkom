
export class Disk {
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
    radius = 0.5,
    segments = 40,
    colorValue = [0.87, 0.65, 0.25]
  ) {
    this.GL = GL;
    this.SHADER_PROGRAM = SHADER_PROGRAM;

    this._position = _position;
    this._color = _color;

    // ====== Buat vertex (pusat + keliling) ======
    this.vertex = [];
    this.faces = [];

    // titik pusat (0,0,0)
    this.vertex.push(0, 0, 0, colorValue[0], colorValue[1], colorValue[2]);

    // titik keliling
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * 2 * Math.PI;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      const z = 0;
      this.vertex.push(x, y, z, colorValue[0], colorValue[1], colorValue[2]);
    }

    // ====== Faces (TRIANGLE_FAN style) ======
    for (let i = 1; i <= segments; i++) {
      this.faces.push(0, i, i + 1);
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

    // atribut posisi & warna
    this.GL.vertexAttribPointer(this._position, 3, this.GL.FLOAT, false, 4 * 6, 0);
    this.GL.vertexAttribPointer(this._color, 3, this.GL.FLOAT, false, 4 * 6, 4 * 3);

    // gambar disk
    this.GL.drawElements(this.GL.TRIANGLES, this.faces.length, this.GL.UNSIGNED_SHORT, 0);

    // render anak-anak
    this.childs.forEach(child => {
      child.render(_MMatrix, this.MODEL_MATRIX);
    });
  }
}
