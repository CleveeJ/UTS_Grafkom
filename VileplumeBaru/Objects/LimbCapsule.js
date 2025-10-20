import { Ellipsoid } from "./Ellipsoid.js";
import { Cylinder } from "./Cylinders.js";

export class LimbCapsule {
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
    length = 0.8,
    colorValue = [0.4, 0.5, 0.9]
  ) {
    this.GL = GL;
    this.SHADER_PROGRAM = SHADER_PROGRAM;
    this._position = _position;
    this._color = _color;

    // === Komponen utama ===
    const cylinder = new Cylinder(
      GL,
      SHADER_PROGRAM,
      _position,
      _color,
      radius,
      radius,
      length * 0.6,
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
      radius,
      radius,
      radius,
      24,
      24,
      colorValue
    );

    const foot = new Cylinder(
      GL,
      SHADER_PROGRAM,
      _position,
      _color,
      radius * 0.8,
      radius * 0.8,
      length * 0.7,
      32,
      colorValue
    );

    // === Transformasi setiap bagian ===
    // batang utama
    LIBS.translateZ(cylinder.MOVE_MATRIX, 0);

    // ujung atas
    LIBS.translateZ(top.MOVE_MATRIX, length * 0.3);

    // ujung bawah
    LIBS.translateZ(bottom.MOVE_MATRIX, -length * 0.3);

    // batang horizontal (telapak kaki/tangan)
    LIBS.translateZ(foot.MOVE_MATRIX, -length * 0.55);
    LIBS.rotateX(foot.MOVE_MATRIX, LIBS.degToRad(90));
    LIBS.translateZ(foot.MOVE_MATRIX, length * 0.25);

    // === Susun hierarchy ===
    this.childs = [cylinder, top, bottom, foot];
  }

  setup() {
    this.childs.forEach(child => child.setup());
  }

  render(_MMatrix, PARENT_MATRIX) {
    // hitung model matrix global
    this.MODEL_MATRIX = LIBS.multiply(this.MOVE_MATRIX, this.POSITION_MATRIX);
    this.MODEL_MATRIX = LIBS.multiply(this.MODEL_MATRIX, PARENT_MATRIX);

    // render anak-anak (komponen)
    this.childs.forEach(child => {
      child.render(_MMatrix, this.MODEL_MATRIX);
    });
  }
}
