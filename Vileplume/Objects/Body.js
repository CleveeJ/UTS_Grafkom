import { Ellipsoid } from "./Ellipsoid.js";

export class Body {
  GL = null;
  SHADER_PROGRAM = null;
  _position = null;
  _color = null;
  _MMatrix = null;

  MODEL_MATRIX = LIBS.get_I4();
  POSITION_MATRIX = LIBS.get_I4();
  MOVE_MATRIX = LIBS.get_I4();

  childs = [];

  constructor(GL, SHADER_PROGRAM, _position, _color, _normal) {
    this.GL = GL;
    this.SHADER_PROGRAM = SHADER_PROGRAM;
    this._position = _position;
    this._color = _color;

    // === Komponen utama badan ===
    const bodyMain = new Ellipsoid(
      GL,
      SHADER_PROGRAM,
      _position,
      _color,
      _normal,
      0.9,  // rx
      1.0,  // ry
      0.8,  // rz
      40,   // stacks
      40,   // slices
      [0.4, 0.5, 0.9] // warna badan
    );

    // === Transformasi ===
    LIBS.translateZ(bodyMain.MOVE_MATRIX, 0.1);
    LIBS.rotateX(bodyMain.MOVE_MATRIX, LIBS.degToRad(90));

    // === Hierarki ===
    this.childs = [bodyMain];
  }

  setup() {
    this.childs.forEach(child => child.setup());
  }

  render(_MMatrix, PARENT_MATRIX) {
    // Gabungkan matriks posisi
    this.MODEL_MATRIX = LIBS.multiply(this.MOVE_MATRIX, this.POSITION_MATRIX);
    this.MODEL_MATRIX = LIBS.multiply(this.MODEL_MATRIX, PARENT_MATRIX ?? LIBS.get_I4());

    // Render semua bagian tubuh utama dan anaknya
    this.childs.forEach(child => {
      child.render(_MMatrix, this.MODEL_MATRIX);
    });
  }
}
