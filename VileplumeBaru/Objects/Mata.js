import { BezierCircle } from "./BezierCircle.js";

export class Mata {
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

    // === MATA KIRI ===
    const leftOuter = new BezierCircle(GL, SHADER_PROGRAM, _position, _color, 0.10, 40, [0.0, 0.0, 0.0, 1.0]);
    const leftMiddle = new BezierCircle(GL, SHADER_PROGRAM, _position, _color, 0.08, 40, [0.8, 0.0, 0.0, 1.0]);
    const leftInner = new BezierCircle(GL, SHADER_PROGRAM, _position, _color, 0.04, 40, [1.0, 1.0, 1.0, 1.0]);

    // === MATA KANAN ===
    const rightOuter = new BezierCircle(GL, SHADER_PROGRAM, _position, _color, 0.10, 40, [0.0, 0.0, 0.0, 1.0]);
    const rightMiddle = new BezierCircle(GL, SHADER_PROGRAM, _position, _color, 0.08, 40, [0.8, 0.0, 0.0, 1.0]);
    const rightInner = new BezierCircle(GL, SHADER_PROGRAM, _position, _color, 0.04, 40, [1.0, 1.0, 1.0, 1.0]);

    // === POSISI RELATIF ===
    // MATA KIRI
    LIBS.translateX(leftOuter.MOVE_MATRIX, -0.3);
    LIBS.translateY(leftOuter.MOVE_MATRIX, 0.28);
    LIBS.translateZ(leftOuter.MOVE_MATRIX, 0.725);
    LIBS.rotateX(leftOuter.MOVE_MATRIX, LIBS.degToRad(-18));
    LIBS.rotateY(leftOuter.MOVE_MATRIX, LIBS.degToRad(-18));

    // susun layer
    LIBS.translateZ(leftMiddle.MOVE_MATRIX, 0.01);
    LIBS.translateZ(leftInner.MOVE_MATRIX, 0.02);

    // MATA KANAN
    LIBS.translateX(rightOuter.MOVE_MATRIX, 0.3);
    LIBS.translateY(rightOuter.MOVE_MATRIX, 0.28);
    LIBS.translateZ(rightOuter.MOVE_MATRIX, 0.725);
    LIBS.rotateX(rightOuter.MOVE_MATRIX, LIBS.degToRad(-18));
    LIBS.rotateY(rightOuter.MOVE_MATRIX, LIBS.degToRad(18));

    LIBS.translateZ(rightMiddle.MOVE_MATRIX, 0.01);
    LIBS.translateZ(rightInner.MOVE_MATRIX, 0.02);

    // === SIMPAN SEMUA ANAK ===
    this.childs = [
      leftOuter, leftMiddle, leftInner,
      rightOuter, rightMiddle, rightInner
    ];

    this.rightEyeParts = [rightOuter, rightMiddle, rightInner]; // buat animasi wink
  }

  setup() {
    this.childs.forEach(child => child.setup());
  }

  render(_MMatrix, PARENT_MATRIX, time = 0) {
    const GL = this.GL;

    // MODEL MATRIX GLOBAL
    this.MODEL_MATRIX = LIBS.multiply(this.MOVE_MATRIX, this.POSITION_MATRIX);
    this.MODEL_MATRIX = LIBS.multiply(this.MODEL_MATRIX, PARENT_MATRIX);

    // ===== MATA KIRI (tetap normal) =====
    this.childs.slice(0, 3).forEach(child => {
      child.render(_MMatrix, this.MODEL_MATRIX);
    });

    // ===== MATA KANAN (animasi kedip) =====
    const [outer, middle, inner] = this.rightEyeParts;

    const phase = (Math.sin(time * 2.0) + 1) / 2; // 0–1
    const winkScale = 0.3 + phase * 0.7;          // 0.3–1.0
    const tilt = (1 - phase) * LIBS.degToRad(15); // makin miring saat tutup

    if (winkScale > 0.45) {
      // skalakan matriks kanan
      const winkMatrix = LIBS.get_I4();
      LIBS.rotateZ(winkMatrix, -tilt);
      LIBS.scaleX(winkMatrix, 1.0);
      LIBS.scaleY(winkMatrix, winkScale);
      LIBS.scaleZ(winkMatrix, 1.0);

      [outer, middle, inner].forEach(child => {
        const combined = LIBS.multiply(child.MOVE_MATRIX, winkMatrix);
        const resultMatrix = LIBS.multiply(combined, this.MODEL_MATRIX);
        child.render(_MMatrix, resultMatrix);
      });

    } else {
      GL.useProgram(this.SHADER_PROGRAM);
      const verts = new Float32Array([
        -0.10,  0.08, 0,
        0.00,  0.00, 0,
        -0.10, -0.08, 0,
      ]);

      const buf = GL.createBuffer();
      GL.bindBuffer(GL.ARRAY_BUFFER, buf);
      GL.bufferData(GL.ARRAY_BUFFER, verts, GL.STATIC_DRAW);

      GL.vertexAttribPointer(this._position, 3, GL.FLOAT, false, 0, 0);
      GL.enableVertexAttribArray(this._position);

      // warna hitam untuk semua vertex
      const colorData = [
        0.0, 0.0, 0.0,
        0.0, 0.0, 0.0,
        0.0, 0.0, 0.0
      ];
      const colorBuffer = GL.createBuffer();
      GL.bindBuffer(GL.ARRAY_BUFFER, colorBuffer);
      GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(colorData), GL.STATIC_DRAW);
      GL.vertexAttribPointer(this._color, 3, GL.FLOAT, false, 0, 0);
      GL.enableVertexAttribArray(this._color);

      // buat model matrix untuk kedipan "<"
      const winkClosed = LIBS.get_I4();
      LIBS.translateX(winkClosed, 0.35); // kanan
      LIBS.translateY(winkClosed, 0.28);
      LIBS.translateZ(winkClosed, 0.725);
      LIBS.rotateX(winkClosed, LIBS.degToRad(-18));
      LIBS.rotateY(winkClosed, LIBS.degToRad(18));
      LIBS.translateX(winkClosed, 0.05);

      const final = LIBS.multiply(winkClosed, this.MODEL_MATRIX);
      GL.uniformMatrix4fv(_MMatrix, false, final);
      GL.lineWidth(5.0);
      GL.drawArrays(GL.LINE_STRIP, 0, 3);
    }
  }
}
