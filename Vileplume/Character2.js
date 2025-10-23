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

    // ===== Tempo slow motion =====
    const tempo = 0.8;
    const t = time * tempo;

    // ===== Siklus animasi =====
    const cycleDuration = 6.0;
    const phase = Math.floor(t / cycleDuration) % 5;
    const localTime = t % cycleDuration;
    const isFlip = (phase === 2);

    // ===== Model dasar karakter =====
    this.MODEL_MATRIX = LIBS.get_I4();
    LIBS.translateY(this.MODEL_MATRIX, LIBS.degToRad(10 + Math.sin(t) * -6));
    LIBS.translateZ(this.MODEL_MATRIX, -1.25);
    LIBS.rotateX(this.MODEL_MATRIX, LIBS.degToRad(90));

    // ===== Kurva umum lompat =====
    let jumpY = 0;
    let jumpPhase = 0; // buat sinkron kaki nanti
    let angle = 0;

    if (isFlip) {
      // ===== SALTO =====
      const flipProgress = localTime / cycleDuration; // 0–1
      const ease = 0.5 - 0.5 * Math.cos(flipProgress * Math.PI); // easing halus
      jumpPhase = ease;

      // tinggi lompat (halus)
      jumpY = Math.sin(ease * Math.PI) * 1.0;

      // rotasi dimulai setelah 40% dan selesai sebelum mendarat
      const spinStart = 0.4, spinEnd = 0.9;
      let spinProgress = 0;
      if (flipProgress > spinStart) {
        spinProgress = Math.min((flipProgress - spinStart) / (spinEnd - spinStart), 1.0);
      }
      angle = spinProgress * Math.PI * 2 * 0.9;

      LIBS.translateY(this.MODEL_MATRIX, jumpY);
      LIBS.rotateAroundAxis(this.MODEL_MATRIX, [1, 0, 0], angle);
    } else {
      // ===== LOMPAT KECIL =====
      jumpY = Math.sin(t * 0.8) * 0.05;
      jumpPhase = (Math.sin(t * 0.8 - Math.PI / 2) + 1) / 2; // 0–1 untuk fase kaki
      LIBS.translateY(this.MODEL_MATRIX, jumpY);
    }

    // ===== Gabungkan transformasi =====
    let rootMatrix = LIBS.multiply(this.MODEL_MATRIX, this.POSITION_MATRIX);
    rootMatrix = LIBS.multiply(this.MOVE_MATRIX, rootMatrix);
    rootMatrix = LIBS.multiply(PARENT_MATRIX, rootMatrix);

    // ===== BUNGA =====
    const floatY = Math.sin(t * 0.8) * 0.05;
    this.flower.MOVE_MATRIX = LIBS.get_I4();
    LIBS.translateZ(this.flower.MOVE_MATRIX, -1.17 + floatY);

    // ===== Gerakan tangan =====
    const speed = isFlip ? 0.0 : 0.3;
    const swing = Math.sin(t * speed) * LIBS.degToRad(12);
    const opposite = -swing;

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

    // kaki mengikuti fase lompat
    if (isFlip) {
      // saat salto: naik → bengkok → lurus di atas → bengkok lagi saat turun
      const bend = Math.sin(jumpPhase * Math.PI) * LIBS.degToRad(20);
      const lift = Math.sin(jumpPhase * Math.PI) * 0.3;
      LIBS.translateZ(this.footLeft.MOVE_MATRIX, lift);
      LIBS.rotateX(this.footLeft.MOVE_MATRIX, bend);
    } else {
      // saat lompat kecil: sedikit naik dan bengkok ringan
      const bend = Math.sin(jumpPhase * Math.PI) * LIBS.degToRad(6);
      const lift = Math.sin(jumpPhase * Math.PI) * 0.05;
      LIBS.translateZ(this.footLeft.MOVE_MATRIX, lift);
      LIBS.rotateX(this.footLeft.MOVE_MATRIX, bend);
    }

    // ===== KAKI KANAN =====
    this.footRight.MOVE_MATRIX = LIBS.get_I4();
    LIBS.translateX(this.footRight.MOVE_MATRIX, 0.4);
    LIBS.translateZ(this.footRight.MOVE_MATRIX, 1.0);
    LIBS.rotateY(this.footRight.MOVE_MATRIX, LIBS.degToRad(-10));

    if (isFlip) {
      const bend = Math.sin(jumpPhase * Math.PI + Math.PI / 6) * LIBS.degToRad(20);
      const lift = Math.sin(jumpPhase * Math.PI + Math.PI / 6) * 0.3;
      LIBS.translateZ(this.footRight.MOVE_MATRIX, lift);
      LIBS.rotateX(this.footRight.MOVE_MATRIX, bend);
    } else {
      const bend = Math.sin(jumpPhase * Math.PI + Math.PI / 4) * LIBS.degToRad(6);
      const lift = Math.sin(jumpPhase * Math.PI + Math.PI / 4) * 0.05;
      LIBS.translateZ(this.footRight.MOVE_MATRIX, lift);
      LIBS.rotateX(this.footRight.MOVE_MATRIX, bend);
    }

    // ===== Render semua bagian =====
    this.childs.forEach(child => child.render(_MMatrix, rootMatrix, time));
  }


}
