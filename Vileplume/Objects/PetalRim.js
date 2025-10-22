export class PetalRim {
  GL = null;
  SHADER_PROGRAM = null;
  _position = null;
  _color = null;
  _normal = null;
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
    _normal,
    radiusX = 1.0,
    radiusY = 1.0,
    height = 0.5,
    thickness = 0.1,
    colorValue = [0.8, 0.5, 0.2]
  ) {
    this.GL = GL;
    this.SHADER_PROGRAM = SHADER_PROGRAM;
    this._position = _position;
    this._color = _color;
    this._normal = _normal;

    const segments = 64;
    const outerZ = height;
    const innerZ = height - thickness;
    const innerScale = 0.9;

    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * 2 * Math.PI;
      const cos = Math.cos(theta);
      const sin = Math.sin(theta);

      const xOuter = radiusX * cos;
      const yOuter = radiusY * sin;
      const xInner = radiusX * innerScale * cos;
      const yInner = radiusY * innerScale * sin;

      // Normal untuk bagian luar dan dalam (arah ke samping)
      let nx = cos;
      let ny = sin;
      let nz = 0;
      const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
      nx /= len;
      ny /= len;
      nz /= len;

      this.vertex.push(
        xOuter, yOuter, outerZ, colorValue[0], colorValue[1], colorValue[2], nx, ny, nz,
        xInner, yInner, innerZ, colorValue[0], colorValue[1], colorValue[2], nx, ny, nz
      );
    }

    for (let i = 0; i < segments; i++) {
      const a = i * 2;
      const b = a + 1;
      const c = a + 2;
      const d = a + 3;
      this.faces.push(a, b, c);
      this.faces.push(b, d, c);
    }
  }

  setup() {
    this.OBJECT_VERTEX = this.GL.createBuffer();
    this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.OBJECT_VERTEX);
    this.GL.bufferData(this.GL.ARRAY_BUFFER, new Float32Array(this.vertex), this.GL.STATIC_DRAW);

    this.OBJECT_FACES = this.GL.createBuffer();
    this.GL.bindBuffer(this.GL.ELEMENT_ARRAY_BUFFER, this.OBJECT_FACES);
    this.GL.bufferData(this.GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.faces), this.GL.STATIC_DRAW);

    this.childs.forEach(child => child.setup());
  }

  render(_MMatrix, PARENT_MATRIX) {
    this.MODEL_MATRIX = LIBS.multiply(this.MOVE_MATRIX, this.POSITION_MATRIX);
    this.MODEL_MATRIX = LIBS.multiply(this.MODEL_MATRIX, PARENT_MATRIX);

    this.GL.useProgram(this.SHADER_PROGRAM);
    this.GL.uniformMatrix4fv(_MMatrix, false, this.MODEL_MATRIX);

    this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.OBJECT_VERTEX);
    this.GL.bindBuffer(this.GL.ELEMENT_ARRAY_BUFFER, this.OBJECT_FACES);

    const stride = 4 * 9;
    this.GL.vertexAttribPointer(this._position, 3, this.GL.FLOAT, false, stride, 0);
    this.GL.vertexAttribPointer(this._color, 3, this.GL.FLOAT, false, stride, 4 * 3);
    this.GL.vertexAttribPointer(this._normal, 3, this.GL.FLOAT, false, stride, 4 * 6);

    this.GL.drawElements(this.GL.TRIANGLES, this.faces.length, this.GL.UNSIGNED_SHORT, 0);

    this.childs.forEach(child => {
      child.render(_MMatrix, this.MODEL_MATRIX);
    });
  }
}
