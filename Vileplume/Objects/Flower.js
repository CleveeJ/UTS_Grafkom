import { PetalRim } from "./PetalRim.js";
import { Toroid } from "./Toroid.js";
import { Disk } from "./Disk.js";
import { EllipticParaboloid } from "./EllipticParaboloid.js";
import { BezierCircle } from "./BezierCircle.js";

export class Flower {
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

    // ====== Bagian tengah bunga ======
    const orange = [1.0, 0.6, 0.0];
    const black = [0.05, 0.05, 0.05];
    const brown = [0.55, 0.27, 0.07];
    const redPetal = [0.82, 0.1, 0.12];
    const white = [1.0, 1.0, 1.0];

    this.outerTorus = new Toroid(
      GL,
      SHADER_PROGRAM,
      _position,
      _color,
      _normal,
      0.4,
      0.1,
      40,
      40,
      orange
    );
    this.innerTorus = new Toroid(
      GL,
      SHADER_PROGRAM,
      _position,
      _color,
      _normal,
      0.33,
      0.05,
      40,
      40,
      black
    );
    this.diskBottom = new Disk(
      GL,
      SHADER_PROGRAM,
      _position,
      _color,
      _normal,
      0.3,
      60,
      brown
    );

    // ====== Kelopak ======
    this.petalTop = new EllipticParaboloid(
      GL,
      SHADER_PROGRAM,
      _position,
      _color,
      _normal,
      0.9,
      0.65,
      0.12,
      48,
      redPetal
    );
    this.petalRim = new PetalRim(
      GL,
      SHADER_PROGRAM,
      _position,
      _color,
      _normal,
      0.9,
      0.65,
      0.12,
      0.05,
      redPetal
    );
    this.petalBottom = new EllipticParaboloid(
      GL,
      SHADER_PROGRAM,
      _position,
      _color,
      _normal,
      0.9,
      0.65,
      0.12,
      48,
      redPetal
    );

    // ====== Bintik di kelopak ======
    this.petalSpots = [];
    const PETAL_COUNT = 5;
    for (let i = 0; i < PETAL_COUNT; i++) {
      const spots = [];
      const spotCount = Math.floor(4 + Math.random() * 3); // 4–6 bintik
      for (let k = 0; k < spotCount; k++) {
        const radius = 0.03 + Math.random() * 0.05;
        const circle = new BezierCircle(
          GL,
          SHADER_PROGRAM,
          _position,
          _color,
          _normal,
          radius,
          20,
          white
        );
        const offset = [
          Math.random() * 0.5 - 0.25,
          0.05 + Math.random() * 0.1,
          0.02,
        ];
        spots.push({ circle, offset });
      }
      this.petalSpots.push(spots);
    }

    // Tambahkan semua komponen ke childs
    this.childs.push(this.outerTorus, this.innerTorus, this.diskBottom);
  }

  setup() {
    // Setup semua bagian bunga
    this.outerTorus.setup();
    this.innerTorus.setup();
    this.diskBottom.setup();
    this.petalTop.setup();
    this.petalRim.setup();
    this.petalBottom.setup();

    this.petalSpots.forEach((spots) => spots.forEach((s) => s.circle.setup()));

    this.childs.forEach((child) => child.setup());
  }

  render(_MMatrix, PARENT_MATRIX, time = 0) {
    const gl = this.GL;

    // ====== Animasi ======
    const floatY = Math.sin(time) * 0.05; // bunga naik turun
    const tilt = Math.sin(time * 0.5) * 0.1;

    // ====== Matriks dasar ======
    let baseMatrix = LIBS.get_I4();
    // LIBS.translate(baseMatrix, [0, floatY, 0]);
    // LIBS.rotateY(baseMatrix, tilt);
    // LIBS.translateY(baseMatrix, floatY);
    // LIBS.rotateY(baseMatrix, tilt);
    // LIBS.scaleX(baseMatrix, scale);
    // LIBS.scaleY(baseMatrix, scale);
    // LIBS.scaleZ(baseMatrix, scale);
    this.MODEL_MATRIX = LIBS.multiply(baseMatrix, PARENT_MATRIX);

    // ====== Gambar bagian tengah bunga ======
    let Mouter = LIBS.get_I4();
    LIBS.translateY(Mouter, -1.05);
    LIBS.translateZ(Mouter, -0.02);
    LIBS.rotateY(Mouter, floatY);
    this.outerTorus.render(_MMatrix, this.MODEL_MATRIX);

    let Minner = LIBS.get_I4();
    LIBS.translateY(Minner, -1.05);
    LIBS.rotateY(Minner, floatY);
    this.innerTorus.render(_MMatrix, this.MODEL_MATRIX);

    let Mdisk = LIBS.get_I4();
    LIBS.translateY(Mdisk, -1.05);
    LIBS.translateZ(Mdisk, -0.02);
    LIBS.rotateY(Mdisk, floatY);
    this.diskBottom.render(_MMatrix, this.MODEL_MATRIX);

    // ====== Kelopak ======
    const PETAL_COUNT = 5;
    const PETAL_RADIUS = 0.8;
    const PETAL_TILT = LIBS.degToRad(5 + Math.sin(time) * -3);
    const PETAL_Y_OFFSET = -1.02 + floatY;
    const PETAL_Z_FLAT = -0.11;

    for (let i = 0; i < PETAL_COUNT; i++) {
      const ang =
        (i * 2 * Math.PI) / PETAL_COUNT +
        Math.PI / 2 +
        Math.PI +
        LIBS.degToRad(-25);
      let M = LIBS.get_I4();

      LIBS.translate(M, [0.0, PETAL_Y_OFFSET, PETAL_Z_FLAT]);
      LIBS.rotateX(M, Math.sin(time + i) * 0.1);
      LIBS.rotateZ(M, ang);
      LIBS.rotateZ(M, LIBS.degToRad(-90));  
      LIBS.translate(M, [PETAL_RADIUS, 0.0, PETAL_Z_FLAT]);
      LIBS.rotateY(M, PETAL_TILT);

      // --- pusatkan tepat di bawah torus ---
      LIBS.translateY(M, 1.1);
      // LIBS.translateX(M, 0);
      LIBS.translateZ(M, 0.3);
      
      M = LIBS.multiply(M, this.MODEL_MATRIX);
      for (let a = 0; a <= 1; a++) {
        let layer = LIBS.clone(M);
        LIBS.translateY(layer, -a * 0.05);        
        this.petalBottom.render(_MMatrix, layer);
      }

      // --- kelopak utama ---
      this.petalTop.render(_MMatrix, M);
      this.petalRim.render(_MMatrix, M);

      // --- bintik putih ---
      const spotsArr = this.petalSpots[i];
      for (let s = 0; s < spotsArr.length; s++) {
        const { circle, offset } = spotsArr[s];
        let S = LIBS.clone(M);
        LIBS.translateX(S, offset[0]);
        LIBS.translateY(S, offset[1]);
        LIBS.translateZ(S, offset[2]);
        circle.render(_MMatrix, S);
      }
    }

    // render anak-anak (jika ada)
    this.childs.forEach((child) => child.render(_MMatrix, this.MODEL_MATRIX));
  }
}
