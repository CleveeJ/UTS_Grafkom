import { Ellipsoid } from "./Ellipsoid.js";

export class Rambut {
  GL = null;
  SHADER_PROGRAM = null;
  _position = null;
  _color = null;
  _MMatrix = null;

  parts = [];
  MODEL_MATRIX = LIBS.get_I4();
  POSITION_MATRIX = LIBS.get_I4();
  MOVE_MATRIX = LIBS.get_I4();

  childs = [];

  constructor(GL, SHADER_PROGRAM, _position, _color) {
    this.GL = GL;
    this.SHADER_PROGRAM = SHADER_PROGRAM;
    this._position = _position;
    this._color = _color;

    // Buat 5 helai rambut (ellipsoid kecil)
    for (let i = 0; i < 5; i++) {
      const hair = new Ellipsoid(
        GL,
        SHADER_PROGRAM,
        _position,
        _color,
        0.25, // radiusX
        0.2,  // radiusY
        0.25, // radiusZ
        20,   // segmentX
        20,   // segmentY
        [0.25, 0.25, 0.25] // warna abu gelap
      );
      this.parts.push(hair);
    }
  }

  setup() {
    this.parts.forEach(p => p.setup());
  }

  render(_MMatrix, PARENT_MATRIX) {
    for (let i = 0; i < this.parts.length; i++) {
      // Buat model matrix baru untuk setiap helai
      let M = LIBS.get_I4();
      const angle = i * (Math.PI / 2.5);
      const offsetX = Math.cos(angle) * 0.8;
      const offsetZ = Math.sin(angle) * 0.8;

      // Geser ke posisi atas kepala dan sekelilingnya
      M = LIBS.translate(M, [offsetX, 0.9, offsetZ]);
      M = LIBS.multiply(M, PARENT_MATRIX);

      this.parts[i].render(_MMatrix, M);
    }
  }
}
