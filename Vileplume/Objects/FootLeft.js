import { Ellipsoid } from "./Ellipsoid.js";
import { Cylinder } from "./Cylinders.js";

export class FootLeft {
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
    _normal,
    radius = 0.12,
    length = 0.8,
    colorValue = [0.4, 0.5, 0.9]
  ) {
    this.GL = GL;
    this.SHADER_PROGRAM = SHADER_PROGRAM;
    this._position = _position;
    this._color = _color;

    // ===== Komponen utama =====
    const cylinder = new Cylinder(
      GL,
      SHADER_PROGRAM,
      _position,
      _color,
      _normal,
      radius,
      radius,
      length * 0.6,
      32,
      colorValue
    );
    this.cylinder = cylinder; // ✅ Simpan agar bisa diakses di bawah

    const top = new Ellipsoid(
      GL,
      SHADER_PROGRAM,
      _position,
      _color,
      _normal,
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
      _normal,
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
      _normal,
      radius,
      radius,
      length * 0.6,
      32,
      colorValue
    );

    // ===== Transformasi Hierarkis =====

    // batang utama (paha)
    LIBS.translateY(cylinder.MOVE_MATRIX, -0.25);
    LIBS.rotateY(cylinder.MOVE_MATRIX, LIBS.degToRad(-10));

    LIBS.translateZ(top.MOVE_MATRIX, cylinder.height/2);
    LIBS.translateY(top.MOVE_MATRIX, -cylinder.height / 2);
    LIBS.translateX(top.MOVE_MATRIX, -0.05);

    LIBS.translateZ(bottom.MOVE_MATRIX, cylinder.height - 0.135);
    LIBS.translateX(bottom.MOVE_MATRIX, -0.20);
    LIBS.translateY(bottom.MOVE_MATRIX, cylinder.height/2 - 0.04);

    // telapak kaki — agak ke depan dan miring
    LIBS.translateZ(foot.MOVE_MATRIX, cylinder.height + 0.08);
    LIBS.translateX(foot.MOVE_MATRIX, cylinder.height/2 - 0.375);
    LIBS.rotateX(foot.MOVE_MATRIX, LIBS.degToRad(80)); // rebahkan ke depan
    LIBS.rotateZ(foot.MOVE_MATRIX, LIBS.degToRad(-160));
    LIBS.translateZ(foot.MOVE_MATRIX, -0.25);

    // ===== Susun Hierarki =====
    this.childs = [cylinder, top, foot, bottom];
  }

  setup() {
    // Setup semua anak
    this.childs.forEach((child) => child.setup());
  }

  render(_MMatrix, PARENT_MATRIX) {
    // Hitung matriks model kaki
    this.MODEL_MATRIX = LIBS.multiply(this.MOVE_MATRIX, this.POSITION_MATRIX);
    this.MODEL_MATRIX = LIBS.multiply(this.MODEL_MATRIX, PARENT_MATRIX);

    // Render semua anak
    this.childs.forEach((child) => {
      child.render(_MMatrix, this.MODEL_MATRIX);
    });
  }
}
