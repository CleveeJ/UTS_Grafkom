
export class Cylinder {
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

    this.vertex = [];
    this.faces = [];

    const zTop = height / 2;
    const zBottom = -height / 2;

    // ====== Vertex: posisi + warna (per segmen) ======
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * 2 * Math.PI;
      const cos = Math.cos(theta);
      const sin = Math.sin(theta);

      // titik atas
      this.vertex.push(
        radiusTop * cos, radiusTop * sin, zTop,
        colorValue[0], colorValue[1], colorValue[2]
      );

      // titik bawah
      this.vertex.push(
        radiusBottom * cos, radiusBottom * sin, zBottom,
        colorValue[0], colorValue[1], colorValue[2]
      );
    }

    // ====== Faces: sambungkan sisi antar segmen ======
    for (let i = 0; i < segments * 2; i += 2) {
      this.faces.push(i, i + 1, i + 2);
      this.faces.push(i + 1, i + 3, i + 2);
    }

    this.height = height;
  }

  setup() {
    // buffer vertex
    this.OBJECT_VERTEX = this.GL.createBuffer();
    this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.OBJECT_VERTEX);
    this.GL.bufferData(this.GL.ARRAY_BUFFER, new Float32Array(this.vertex), this.GL.STATIC_DRAW);

    // buffer faces (index)
    this.OBJECT_FACES = this.GL.createBuffer();
    this.GL.bindBuffer(this.GL.ELEMENT_ARRAY_BUFFER, this.OBJECT_FACES);
    this.GL.bufferData(this.GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.faces), this.GL.STATIC_DRAW);

    // setup anak-anak (kalau ada)
    this.childs.forEach(child => child.setup());
  }

  render(_MMatrix, PARENT_MATRIX) {
    // hitung model matrix gabungan
    this.MODEL_MATRIX = LIBS.multiply(this.MOVE_MATRIX, this.POSITION_MATRIX);
    this.MODEL_MATRIX = LIBS.multiply(this.MODEL_MATRIX, PARENT_MATRIX);

    this.GL.useProgram(this.SHADER_PROGRAM);
    this.GL.uniformMatrix4fv(_MMatrix, false, this.MODEL_MATRIX);

    // bind buffer vertex dan faces
    this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.OBJECT_VERTEX);
    this.GL.bindBuffer(this.GL.ELEMENT_ARRAY_BUFFER, this.OBJECT_FACES);

    // vertex attrib pointer
    this.GL.vertexAttribPointer(this._position, 3, this.GL.FLOAT, false, 4 * 6, 0);
    this.GL.vertexAttribPointer(this._color, 3, this.GL.FLOAT, false, 4 * 6, 4 * 3);

    // gambar elemen
    this.GL.drawElements(this.GL.TRIANGLES, this.faces.length, this.GL.UNSIGNED_SHORT, 0);

    // render anak-anak
    this.childs.forEach(child => {
      child.render(_MMatrix, this.MODEL_MATRIX);
    });
  }
}
