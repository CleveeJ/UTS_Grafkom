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

  constructor(GL, SHADER_PROGRAM, _position, _color, _normal) {
    this.GL = GL;
    this.SHADER_PROGRAM = SHADER_PROGRAM;
    this._position = _position;
    this._color = _color;

    // ====== Komponen utama karakter ======
    this.body = new Body(GL, SHADER_PROGRAM, _position, _color, _normal);
    this.flower = new Flower(GL, SHADER_PROGRAM, _position, _color, _normal);
    this.mata = new Mata(GL, SHADER_PROGRAM, _position, _color, _normal);
    this.senyum = new Smile(GL, SHADER_PROGRAM, _position, _color, _normal);

    const limbColor = [0.3, 0.4, 0.9]; // biru lembut
    this.handLeft = new Hand(
      GL,
      SHADER_PROGRAM,
      _position,
      _color,
      _normal,
      0.12,
      0.6,
      limbColor
    );
    this.handRight = new Hand(
      GL,
      SHADER_PROGRAM,
      _position,
      _color,
      _normal,
      0.12,
      0.6,
      limbColor
    );
    this.footLeft = new FootLeft(
      GL,
      SHADER_PROGRAM,
      _position,
      _color,
      _normal,
      0.12,
      0.8,
      limbColor
    );
    this.footRight = new FootRight(
      GL,
      SHADER_PROGRAM,
      _position,
      _color,
      _normal,
      0.12,
      0.8,
      limbColor
    );

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
    this.childs.forEach((child) => child.setup());
  }

  render(_MMatrix, PARENT_MATRIX, time = 0) {
    const gl = this.GL;

    // ===== Animasi dasar =====
    const tilt = Math.sin(time * 0.5) * 0.1;
    const floatY = Math.sin(time * 0.8) * 0.05;
    const speed = 2.0; // kecepatan ayunan
    const angleSwing = 0.5; // besar ayunan dalam radian (~28.6°)
    let swing = Math.sin(time * 1.) * LIBS.degToRad(15); // ayunan ±15°
    let opposite = -swing;

    // ===== Hitung model matrix karakter =====
    this.MODEL_MATRIX = LIBS.get_I4();
    LIBS.translateY(this.MODEL_MATRIX, LIBS.degToRad(10 + Math.sin(time) * -6));
    LIBS.translateZ(this.MODEL_MATRIX, -1.25);
    LIBS.rotateX(this.MODEL_MATRIX, LIBS.degToRad(90));

    // Gabungkan semua level transformasi
    let rootMatrix = LIBS.multiply(this.MODEL_MATRIX, this.POSITION_MATRIX);
    rootMatrix = LIBS.multiply(this.MOVE_MATRIX, rootMatrix);
    rootMatrix = LIBS.multiply(PARENT_MATRIX, rootMatrix);

    // ===== BUNGA =====
    this.flower.MOVE_MATRIX = LIBS.get_I4();
    LIBS.translateZ(this.flower.MOVE_MATRIX, -1.17 + floatY);

    // ===== TANGAN KIRI =====
    this.handLeft.MOVE_MATRIX = LIBS.get_I4();
    LIBS.translateX(this.handLeft.MOVE_MATRIX, -1.0);
    LIBS.rotateY(this.handLeft.MOVE_MATRIX, LIBS.degToRad(120));
    LIBS.rotateX(this.handLeft.MOVE_MATRIX, LIBS.degToRad(60));
    LIBS.rotateY(this.handLeft.MOVE_MATRIX, swing);

    // ===== TANGAN KANAN =====
    this.handRight.MOVE_MATRIX = LIBS.get_I4();
    LIBS.translateX(this.handRight.MOVE_MATRIX, 1.0);
    LIBS.rotateY(this.handRight.MOVE_MATRIX, LIBS.degToRad(90));
    LIBS.rotateX(this.handRight.MOVE_MATRIX, LIBS.degToRad(60));
    LIBS.rotateY(this.handRight.MOVE_MATRIX, opposite);

    // ===== KAKI KIRI =====
    this.footLeft.MOVE_MATRIX = LIBS.get_I4();
    LIBS.translateX(this.footLeft.MOVE_MATRIX, -0.4);
    LIBS.translateZ(this.footLeft.MOVE_MATRIX, 1.0);
    LIBS.rotateY(this.footLeft.MOVE_MATRIX, LIBS.degToRad(10));

    // kaki ikut badan tapi sedikit menahan di bawah
    let phaseL = time * 0.8 - Math.PI / 6; // terlambat sedikit
    let liftL = Math.sin(phaseL) * 0.1; // naik lebih pendek
    let bendL = Math.sin(phaseL + Math.PI / 2) * LIBS.degToRad(8);

    LIBS.translateZ(this.footLeft.MOVE_MATRIX, liftL);
    LIBS.rotateX(this.footLeft.MOVE_MATRIX, bendL);

    // ===== KAKI KANAN =====
    this.footRight.MOVE_MATRIX = LIBS.get_I4();
    LIBS.translateX(this.footRight.MOVE_MATRIX, 0.4);
    LIBS.translateZ(this.footRight.MOVE_MATRIX, 1.0);
    LIBS.rotateY(this.footRight.MOVE_MATRIX, LIBS.degToRad(-10));

    // kanan sedikit lebih lambat lagi untuk keseimbangan
    let phaseR = time * 0.8 - Math.PI / 3;
    let liftR = Math.sin(phaseR) * 0.1;
    let bendR = Math.sin(phaseR + Math.PI / 2) * LIBS.degToRad(8);

    LIBS.translateZ(this.footRight.MOVE_MATRIX, liftR);
    LIBS.rotateX(this.footRight.MOVE_MATRIX, bendR);
    this.childs.forEach(child => child.render(_MMatrix, rootMatrix, time));
  }
}
