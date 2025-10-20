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
    radius = 0.12,
    length = 0.8,
    colorValue = [0.4, 0.5, 0.9]
  ) {
    this.GL = GL;
    this.SHADER_PROGRAM = SHADER_PROGRAM;
    this._position = _position;
    this._color = _color;

    // ===== Komponen =====
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
      length * 0.5,
      32,
      colorValue
    );

    // ===== Transformasi Hierarkis =====
    // batang utama (paha)
    LIBS.translateZ(cylinder.MOVE_MATRIX, -0.25);
    LIBS.rotateY(cylinder.MOVE_MATRIX, LIBS.degToRad(-20));

    // ujung atas (pinggul)
    LIBS.translateZ(top.MOVE_MATRIX, length * 0.3);

    // ujung bawah (lutut)
    LIBS.translateZ(bottom.MOVE_MATRIX, -length * 0.3);

    // telapak kaki
    LIBS.translateZ(foot.MOVE_MATRIX, -length * 0.55);
    LIBS.rotateX(foot.MOVE_MATRIX, LIBS.degToRad(90));
    LIBS.translateZ(foot.MOVE_MATRIX, -0.25);

    // ===== Susun Hierarki =====
    this.childs = [cylinder, top, bottom, foot];
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
