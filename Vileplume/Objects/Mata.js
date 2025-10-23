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
  rightEyeParts = [];

  constructor(GL, SHADER_PROGRAM, _position, _color, _normal) {
    this.GL = GL;
    this.SHADER_PROGRAM = SHADER_PROGRAM;
    this._position = _position;
    this._color = _color;

    // === MATA KIRI ===
    const leftOuter = new BezierCircle(GL, SHADER_PROGRAM, _position, _color, _normal, 0.1, 40, [0.0, 0.0, 0.0, 1.0]);
    const leftMiddle = new BezierCircle(GL, SHADER_PROGRAM, _position, _color, _normal, 0.08, 40, [0.8, 0.0, 0.0, 1.0]);
    const leftInner = new BezierCircle(GL, SHADER_PROGRAM, _position, _color, _normal, 0.04, 40, [1.0, 1.0, 1.0, 1.0]);

    [leftOuter, leftMiddle, leftInner].forEach((part, i) => {
      const y = 0.725 + i * 0.01;
      const z = -0.32 + i * 0.005;
      LIBS.translateX(part.MOVE_MATRIX, -0.25);
      LIBS.translateY(part.MOVE_MATRIX, y);
      LIBS.translateZ(part.MOVE_MATRIX, z);
      LIBS.rotateX(part.MOVE_MATRIX, LIBS.degToRad(-100));
      LIBS.rotateY(part.MOVE_MATRIX, LIBS.degToRad(10));
      LIBS.rotateZ(part.MOVE_MATRIX, LIBS.degToRad(-5));
    });

    // === MATA KANAN ===
    const rightOuter = new BezierCircle(GL, SHADER_PROGRAM, _position, _color, _normal, 0.1, 40, [0.0, 0.0, 0.0, 1.0]);
    const rightMiddle = new BezierCircle(GL, SHADER_PROGRAM, _position, _color, _normal, 0.08, 40, [0.8, 0.0, 0.0, 1.0]);
    const rightInner = new BezierCircle(GL, SHADER_PROGRAM, _position, _color, _normal, 0.04, 40, [1.0, 1.0, 1.0, 1.0]);

    this.rightEyeParts = [rightOuter, rightMiddle, rightInner];
    this.rightEyeParts.forEach((part, i) => {
      const y = 0.725 + i * 0.01;
      const z = -0.32 + i * 0.005;
      LIBS.translateX(part.MOVE_MATRIX, 0.25);
      LIBS.translateY(part.MOVE_MATRIX, y);
      LIBS.translateZ(part.MOVE_MATRIX, z);
      LIBS.rotateX(part.MOVE_MATRIX, LIBS.degToRad(-100));
      LIBS.rotateY(part.MOVE_MATRIX, LIBS.degToRad(-10));
      LIBS.rotateZ(part.MOVE_MATRIX, LIBS.degToRad(5));
    });

    this.childs = [leftOuter, leftMiddle, leftInner, ...this.rightEyeParts];
  }

  setup() {
    this.childs.forEach((child) => child.setup && child.setup());
  }

  render(_MMatrix, PARENT_MATRIX, time = 0) {
    const gl = this.GL;
    const program = this.SHADER_PROGRAM;

    this.MODEL_MATRIX = LIBS.multiply(this.MOVE_MATRIX, this.POSITION_MATRIX);
    this.MODEL_MATRIX = LIBS.multiply(this.MODEL_MATRIX, PARENT_MATRIX);

    // mata kiri
    this.childs.slice(0, 3).forEach((child) => child.render(_MMatrix, this.MODEL_MATRIX));

    // animasi kedip halus
    // const BLINK_SPEED = 1;
    // const blinkRaw = 10 - Math.max(0, Math.sin(time * BLINK_SPEED));
    // const easeInOut = 0.5 - 0.5 * Math.cos(Math.PI * blinkRaw);
    // const scaleY = 0.2 + 0.8 * easeInOut;

        const blinkCycle = 10; 
        const blinkDuration = 5; 
        const cycleTime = (time % blinkCycle); 

        let blink = 0; // 0 = mata terbuka penuh, 1 = tertutup penuh

        // Kalau sedang dalam fase "kedip", lakukan scaling
        if (cycleTime < blinkDuration) {
            // fase kedipan halus: mata menutup & membuka cepat
            const blinkProgress = cycleTime / blinkDuration; // 0 → 1
            blink = Math.sin(blinkProgress * Math.PI);
        }

        // Hitung skala mata
        const blinkScale = 1 - (blink * 0.3);

    if (blinkScale  > 0.85) {
      // --- mata kanan normal ---
      this.rightEyeParts.forEach((part) => {
      const animMatrix = LIBS.get_I4();

      const radius = 0.1;
      const offsetY = radius * (1 - blinkScale);

      // Geser ke atas dulu (pivot ke tengah), lalu scale, lalu geser balik
      // LIBS.translateY(animMatrix, offsetY);
      // LIBS.scaleY(animMatrix, blinkScale);
      LIBS.scaleZ(animMatrix, blinkScale);
      // LIBS.translateY(animMatrix, -offsetY);

      const finalMatrix = LIBS.multiply(animMatrix, this.MODEL_MATRIX);
      part.render(_MMatrix, finalMatrix);
    });
      return;
    }

    // --- mata kecil: gambar "<" ---
    gl.useProgram(program);

    const thickness = 0.02;

    // Dua batang: atas dan bawah
    const verts = new Float32Array([
      // batang atas "\"
      0.00, 0.00 + thickness, 0.0,
      0.10, 0.08 + thickness, 0.0,
      0.00, 0.00 - thickness, 0.0,
      0.10, 0.08 - thickness, 0.0,

      // batang bawah "/"
      0.00, 0.00 + thickness, 0.0,
      0.10, -0.08 + thickness, 0.0,
      0.00, 0.00 - thickness, 0.0,
      0.10, -0.08 - thickness, 0.0,
    ]);

    const colors = new Float32Array([
      // semua hitam
      0,0,0, 0,0,0, 0,0,0, 0,0,0,
      0,0,0, 0,0,0, 0,0,0, 0,0,0
    ]);

    // buffer posisi
    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STREAM_DRAW);
    gl.vertexAttribPointer(this._position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this._position);

    // buffer warna
    const colBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STREAM_DRAW);
    gl.vertexAttribPointer(this._color, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this._color);

    // posisi "<"
    const localWink = LIBS.get_I4();
    LIBS.translateX(localWink, 0.15);
    LIBS.translateY(localWink, 0.725);
    LIBS.translateZ(localWink, -0.32);
    LIBS.rotateX(localWink, LIBS.degToRad(-100));
    LIBS.translateX(localWink, 0.05);

    // gabungkan dengan parent
    const M_cute = LIBS.multiply(localWink, this.MODEL_MATRIX);
    gl.uniformMatrix4fv(_MMatrix, false, M_cute);

    // --- gambar dua batang ---
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); // atas
    gl.drawArrays(gl.TRIANGLE_STRIP, 4, 4); // bawah

    // bersih
    gl.deleteBuffer(posBuffer);
    gl.deleteBuffer(colBuffer);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }
}
