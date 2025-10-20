import { Body } from "./Objects/Body.js";
import { Flower } from "./Objects/Flower.js";
import { Mata } from "./Objects/Mata.js";
import { Smile } from "./Objects/Smile.js";
import { Hand } from "./Objects/Hand.js";
import { FootRight } from "./Objects/FootRight.js";
import { FootLeft } from "./Objects/FootLeft.js";

export class Character {
  GL = null;
  SHADER_PROGRAM = null;

  _position = null;
  _color = null;
  _MMatrix = null;

  MODEL_MATRIX = LIBS.get_I4();
  POSITION_MATRIX = LIBS.get_I4();
  MOVE_MATRIX = LIBS.get_I4();

  childs = [];

  constructor(GL, SHADER_PROGRAM, _position, _color) {
    this.GL = GL;
    this.SHADER_PROGRAM = SHADER_PROGRAM;
    this._position = _position;
    this._color = _color;

    // ====== Komponen utama karakter ======
    this.body = new Body(GL, SHADER_PROGRAM, _position, _color);
    this.flower = new Flower(GL, SHADER_PROGRAM, _position, _color);
    this.mata = new Mata(GL, SHADER_PROGRAM, _position, _color);
    this.senyum = new Smile(GL, SHADER_PROGRAM, _position, _color);

    const limbColor = [0.3, 0.4, 0.9]; // biru lembut
    this.handLeft = new Hand(GL, SHADER_PROGRAM, _position, _color, 0.12, 0.6, limbColor);
    this.handRight = new Hand(GL, SHADER_PROGRAM, _position, _color, 0.12, 0.6, limbColor);
    this.footLeft = new FootLeft(GL, SHADER_PROGRAM, _position, _color, 0.12, 0.8, limbColor);
    this.footRight = new FootRight(GL, SHADER_PROGRAM, _position, _color, 0.12, 0.8, limbColor);

    // ====== Tambahkan semua komponen ke hierarki ======
    this.childs.push(
      this.body,
      this.flower,
      this.mata,
      this.senyum,
      this.handLeft,
      this.handRight,
      this.footLeft,
      this.footRight
    );
  }

  setup() {
    // Setup semua buffer tiap bagian karakter
    this.childs.forEach(child => child.setup());
  }

  render(_MMatrix, PARENT_MATRIX, time = 0) {
    const gl = this.GL;

    // ===== Animasi dasar =====
    const tilt = Math.sin(time * 0.5) * 0.1;
    const floatY = Math.sin(time * 0.8) * 0.05;

    // ===== Hitung model matrix karakter =====
    this.MODEL_MATRIX = LIBS.get_I4();
    LIBS.translateY(this.MODEL_MATRIX, floatY);
    LIBS.translateZ(this.MODEL_MATRIX, -1.25);
    LIBS.rotateX(this.MODEL_MATRIX, LIBS.degToRad(90));
    const rootMatrix = LIBS.multiply(this.MODEL_MATRIX, PARENT_MATRIX);

    // ===== BADAN =====
    this.body.render(_MMatrix, rootMatrix);

    // ===== MATA =====
    this.mata.render(_MMatrix, rootMatrix, time);

    // ===== SENYUM =====
    this.senyum.render(_MMatrix, rootMatrix);

    // ===== BUNGA =====
    let flowerMatrix = LIBS.clone(rootMatrix);
    LIBS.translateY(flowerMatrix, 1.1 + floatY);
    LIBS.rotateZ(flowerMatrix, tilt);
    this.flower.render(_MMatrix, flowerMatrix, time);

    // ===== TANGAN KIRI =====
    let handL = LIBS.clone(rootMatrix);
    LIBS.translateX(handL, -1.0);
    LIBS.rotateZ(handL, LIBS.degToRad(-90));
    LIBS.rotateX(handL, LIBS.degToRad(60));
    this.handLeft.render(_MMatrix, handL);

    // ===== TANGAN KANAN =====
    let handR = LIBS.clone(rootMatrix);
    LIBS.translateX(handR, 1.0);
    LIBS.rotateZ(handR, LIBS.degToRad(90));
    LIBS.rotateX(handR, LIBS.degToRad(60));
    this.handRight.render(_MMatrix, handR);

    // ===== KAKI KIRI =====
    let footL = LIBS.clone(rootMatrix);
    LIBS.translateX(footL, -0.4);
    LIBS.translateY(footL, -1.0);
    LIBS.rotateZ(footL, LIBS.degToRad(-10));
    this.footLeft.render(_MMatrix, footL);

    // ===== KAKI KANAN =====
    let footR = LIBS.clone(rootMatrix);
    LIBS.translateX(footR, 0.4);
    LIBS.translateY(footR, -1.0);
    LIBS.rotateZ(footR, LIBS.degToRad(10));
    this.footRight.render(_MMatrix, footR);
  }
}
