import { Ellipsoid } from "./Ellipsoid.js";
import { Cylinder } from "./Cylinders.js";

export class Hand {
  GL = null;
  SHADER_PROGRAM = null;
  _position = null;
  _color = null;
  _MMatrix = null;

  MODEL_MATRIX = LIBS.get_I4();
  POSITION_MATRIX = LIBS.get_I4();
  MOVE_MATRIX = LIBS.get_I4();

  childs = [];

  constructor(
    GL,
    SHADER_PROGRAM,
    _position,
    _color,
    radius = 0.12,
    length = 0.6,
    colorValue = [0.2, 0.9, 0.9]
  ) {
    this.GL = GL;
    this.SHADER_PROGRAM = SHADER_PROGRAM;
    this._position = _position;
    this._color = _color;

    // === Komponen utama lengan ===
    const cylinder = new Cylinder(
      GL,
      SHADER_PROGRAM,
      _position,
      _color,
      radius,
      radius,
      length * 0.8,
      32,
      colorValue
    );

    const top = new Ellipsoid(
      GL,
      SHADER_PROGRAM,
      _position,
      _color,
      radius,
      radius,
      radius,
      24,
      24,
      colorValue
    );

    const bottom = new Ellipsoid(
      GL,
      SHADER_PROGRAM,
      _position,
      _color,
      radius * 1.1,
      radius * 0.9,
      radius,
      24,
      24,
      colorValue
    );

    // === Transformasi masing-masing bagian ===
    // batang utama (posisi default di tengah)
    LIBS.translateZ(cylinder.MOVE_MATRIX, 0);

    // bahu (ujung atas)
    LIBS.translateZ(top.MOVE_MATRIX, length * 0.4);

    // tangan (ujung bawah)
    LIBS.translateZ(bottom.MOVE_MATRIX, -length * 0.4);

    // === Susun hierarchy ===
    this.childs = [cylinder, top, bottom];
  }

  setup() {
    this.childs.forEach(child => child.setup());
  }

  render(_MMatrix, PARENT_MATRIX) {
    // gabungkan matriks
    this.MODEL_MATRIX = LIBS.multiply(this.MOVE_MATRIX, this.POSITION_MATRIX);
    this.MODEL_MATRIX = LIBS.multiply(this.MODEL_MATRIX, PARENT_MATRIX);

    // render semua bagian
    this.childs.forEach(child => {
      child.render(_MMatrix, this.MODEL_MATRIX);
    });
  }
}
