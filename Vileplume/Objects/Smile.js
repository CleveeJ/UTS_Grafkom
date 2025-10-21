export class Smile {
  GL = null;
  SHADER_PROGRAM = null;

  _position = null;
  _color = null;
  _normal = null;
  _MMatrix = null;

  OBJECT_VERTEX = null;

  vertex = [];
  MODEL_MATRIX = LIBS.get_I4();
  POSITION_MATRIX = LIBS.get_I4();
  MOVE_MATRIX = LIBS.get_I4();

  childs = [];

  constructor(GL, SHADER_PROGRAM, _position, _color, _normal, colorValue = [0, 0, 0]) {
    this.GL = GL;
    this.SHADER_PROGRAM = SHADER_PROGRAM;
    this._position = _position;
    this._color = _color;
    this._normal = _normal;

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

      // Normal tetap ke depan (Z+)
      const nx = 0;
      const ny = 0;
      const nz = 1;

      verts.push(x, y, 0, colorValue[0], colorValue[1], colorValue[2], nx, ny, nz);
    }

    this.vertex = verts;
  }

  setup() {
    this.OBJECT_VERTEX = this.GL.createBuffer();
    this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.OBJECT_VERTEX);
    this.GL.bufferData(this.GL.ARRAY_BUFFER, new Float32Array(this.vertex), this.GL.STATIC_DRAW);

    this.childs.forEach(child => child.setup());
  }

  render(_MMatrix, PARENT_MATRIX) {
    const gl = this.GL;

    let transform = LIBS.get_I4();
    LIBS.rotateX(transform, LIBS.degToRad(-90));
    LIBS.translateX(transform, 0.0);
    LIBS.translateY(transform, 0.79);
    LIBS.translateZ(transform, 0.12);

    this.MODEL_MATRIX = LIBS.multiply(transform, PARENT_MATRIX);

    gl.useProgram(this.SHADER_PROGRAM);
    gl.uniformMatrix4fv(_MMatrix, false, this.MODEL_MATRIX);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.OBJECT_VERTEX);

    const stride = 4 * 9;
    gl.vertexAttribPointer(this._position, 3, gl.FLOAT, false, stride, 0);
    gl.vertexAttribPointer(this._color, 3, gl.FLOAT, false, stride, 4 * 3);
    gl.vertexAttribPointer(this._normal, 3, gl.FLOAT, false, stride, 4 * 6);

    gl.drawArrays(gl.LINE_STRIP, 0, this.vertex.length / 9);

    this.childs.forEach(child => {
      child.render(_MMatrix, this.MODEL_MATRIX);
    });
  }
}
