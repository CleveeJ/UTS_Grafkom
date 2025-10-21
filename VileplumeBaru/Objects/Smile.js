export class Smile {
  GL = null;
  SHADER_PROGRAM = null;

  _position = null;
  _color = null;
  _MMatrix = null;

  OBJECT_VERTEX = null;

  vertex = [];
  MODEL_MATRIX = LIBS.get_I4();
  POSITION_MATRIX = LIBS.get_I4();
  MOVE_MATRIX = LIBS.get_I4();

  childs = [];

  constructor(GL, SHADER_PROGRAM, _position, _color, colorValue = [0, 0, 0]) {
    this.GL = GL;
    this.SHADER_PROGRAM = SHADER_PROGRAM;
    this._position = _position;
    this._color = _color;

    // ======= Buat Kurva Bezier untuk "Smile" =======
    const p0 = [-0.25, 0.00, 0];
    const p1 = [-0.25, -0.22, 0];
    const p2 = [0.25, -0.22, 0];
    const p3 = [0.25, 0.00, 0];

    const verts = [];
    const n = 40;
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const u = 1 - t;
      const tt = t * t;
      const uu = u * u;

      const x = uu * u * p0[0] + 3 * uu * t * p1[0] + 3 * u * tt * p2[0] + tt * t * p3[0];
      const y = uu * u * p0[1] + 3 * uu * t * p1[1] + 3 * u * tt * p2[1] + tt * t * p3[1];

      verts.push(x, y, 0, colorValue[0], colorValue[1], colorValue[2]);
    }

    this.vertex = verts;
  }

  setup() {
    // buffer vertex
    this.OBJECT_VERTEX = this.GL.createBuffer();
    this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.OBJECT_VERTEX);
    this.GL.bufferData(this.GL.ARRAY_BUFFER, new Float32Array(this.vertex), this.GL.STATIC_DRAW);

    // setup anak-anak juga
    this.childs.forEach(child => child.setup());
  }

  render(_MMatrix, PARENT_MATRIX) {
    const gl = this.GL;

    // Hitung model matrix: translate ke depan dan sedikit turun
    let transform = LIBS.get_I4();
    LIBS.rotateX(transform, LIBS.degToRad(-90));
    LIBS.translateX(transform, 0.0);
    LIBS.translateY(transform, 0.76);
    LIBS.translateZ(transform, 0.18);

    this.MODEL_MATRIX = LIBS.multiply(transform, PARENT_MATRIX);

    gl.useProgram(this.SHADER_PROGRAM);
    gl.uniformMatrix4fv(_MMatrix, false, this.MODEL_MATRIX);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.OBJECT_VERTEX);

    // posisi dan warna
    gl.vertexAttribPointer(this._position, 3, gl.FLOAT, false, 4 * 6, 0);
    gl.vertexAttribPointer(this._color, 3, gl.FLOAT, false, 4 * 6, 4 * 3);

    // gambar garis senyum (LINE_STRIP)
    gl.drawArrays(gl.LINE_STRIP, 0, this.vertex.length / 6);

    // render anak-anak
    this.childs.forEach(child => {
      child.render(_MMatrix, this.MODEL_MATRIX);
    });
  }
}
