import { Ellipsoid } from "./Objects/Ellipsoid.js";

export class Cloud {
  GL = null;
  SHADER_PROGRAM = null;
  _position = null;
  _color = null;
  _normal = null;

  MODEL_MATRIX = LIBS.get_I4();
  POSITION_MATRIX = LIBS.get_I4();
  MOVE_MATRIX = LIBS.get_I4();

  childs = [];

  // batas horizontal world space
  screenLeft = -22;
  screenRight = 22;

  cloudDefs = []; // setiap cloud = { puffs, offsetX, baseY, speed, amplitude, frequency }

  constructor(GL, SHADER_PROGRAM, _position, _color, _normal) {
    this.GL = GL;
    this.SHADER_PROGRAM = SHADER_PROGRAM;
    this._position = _position;
    this._color = _color;
    this._normal = _normal;

    const white = [0.95, 0.95, 1.0];

    const puff = (x, y, z, scale = 1) => {
      const e = new Ellipsoid(
        GL,
        SHADER_PROGRAM,
        _position,
        _color,
        _normal,
        0.6 * scale,
        0.6 * scale,
        0.5 * scale,
        24,
        24,
        white
      );
      LIBS.translate(e.MOVE_MATRIX, [x, y, z]);
      return e;
    };

    // Template bentuk awan
    const templates = [
      [
        puff(-0.6, 0, 0, 0.9),
        puff(0, 0, 0, 0.9),
        puff(0.6, 0, 0, 0.9),
        puff(0.3, 0.5, -0.2, 0.75),
        puff(-0.3, 0.5, -0.2, 0.75),
        puff(0, 0.8, 0, 0.5),
      ],
      [
        puff(-0.7, 0, 0),
        puff(0, 0, 0),
        puff(0.7, 0, 0),
        puff(-0.35, 0.5, -0.2, 0.8),
        puff(0.35, 0.5, -0.2, 0.8),
      ],
      [
        puff(-0.6, 0, 0, 0.85),
        puff(0.6, 0, 0, 0.85),
        puff(0, 0.4, 0, 0.75),
      ],
      [
        puff(-0.7, 0, 0),
        puff(0, 0, 0),
        puff(0.7, 0, 0),
        puff(-0.35, 0.5, -0.2, 0.8),
        puff(0.35, 0.5, -0.2, 0.8),
        puff(-1.2, 0.1, 0, 0.6),
        puff(1.2, 0.1, 0, 0.6),
      ],
      [
        puff(-0.6, 0, 0, 0.9),
        puff(0, 0, 0, 0.9),
        puff(0.6, 0, 0, 0.9),
        puff(0, 0.9, 0, 0.3),
      ],
      [
        puff(-0.7, 0, 0),
        puff(0, 0, 0),
        puff(0.7, 0, 0),
        puff(-0.35, 0.5, -0.2, 0.8),
        puff(0.35, 0.5, -0.2, 0.8),
        puff(-1.2, 0.1, 0, 0.6),
        puff(1.2, 0.1, 0, 0.6),
        ],
    ];

    const jumlahAwan = 10;
    for (let i = 0; i < jumlahAwan; i++) {
      const template = templates[i % templates.length];

      // Deep clone puffs
      const clone = template.map((p) => {
        const newP = Object.assign(Object.create(Object.getPrototypeOf(p)), p);
        newP.MOVE_MATRIX = LIBS.clone(p.MOVE_MATRIX);
        return newP;
      });

      const startX = -25 + i * 6 + Math.random() * 2;          // posisi awal horizontal acak
      const baseY = 2.0 + Math.random() * 1.2;                 // variasi tinggi awan (tetap di atas)
      const speed = 0.05 + Math.random() * 0.4;                // kecepatan berbeda
      const amplitude = 0.05 + Math.random() * 0.15;           // kayak napas vertikal
      const frequency = 0.3 + Math.random() * 0.5;             // ritme napas berbeda

      this.cloudDefs.push({
        puffs: clone,
        offsetX: startX,
        baseY,
        speed,
        amplitude,
        frequency
      });

      this.childs.push(...clone);
    }
  }

  setup() {
    this.childs.forEach((child) => child.setup());
  }

  render(_MMatrix, PARENT_MATRIX, time = 0) {
    const base = LIBS.multiply(this.MOVE_MATRIX, this.POSITION_MATRIX);
    const MODEL = LIBS.multiply(base, PARENT_MATRIX);

    for (const cloud of this.cloudDefs) {
      // update posisi X
      cloud.offsetX += cloud.speed * 0.01;

      // looping dari kiri kalau lewat kanan
      if (cloud.offsetX > this.screenRight + 5) {
        cloud.offsetX = this.screenLeft - 5;
      }

      // posisi naik turun
      const floatY = Math.sin(time * cloud.frequency + cloud.offsetX) * cloud.amplitude;
      const matrix = LIBS.clone(MODEL);
      LIBS.translateX(matrix, cloud.offsetX);
      LIBS.translateY(matrix, cloud.baseY + floatY);

      cloud.puffs.forEach((p) => p.render(_MMatrix, matrix));
    }
  }
}
