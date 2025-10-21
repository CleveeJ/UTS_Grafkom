export class Toroid {
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
    majorR = 0.5,
    minorR = 0.2,
    majorSeg = 30,
    minorSeg = 20,
    colorValue = [1, 1, 1]
  ) {
    this.GL = GL;
    this.SHADER_PROGRAM = SHADER_PROGRAM;
    this._position = _position;
    this._color = _color;
    this._normal = _normal;

    this.vertex = [];
    this.faces = [];

    for (let i = 0; i <= majorSeg; i++) {
      const phi = (i * 2 * Math.PI) / majorSeg;
      for (let j = 0; j <= minorSeg; j++) {
        const theta = (j * 2 * Math.PI) / minorSeg;

        const x = (majorR + minorR * Math.cos(theta)) * Math.cos(phi);
        const y = (majorR + minorR * Math.cos(theta)) * Math.sin(phi);
        const z = minorR * Math.sin(theta);

        // Normal lokal (arah dari pusat torus)
        const nx = Math.cos(phi) * Math.cos(theta);
        const ny = Math.sin(phi) * Math.cos(theta);
        const nz = Math.sin(theta);

        this.vertex.push(
          x, y, z,
          colorValue[0], colorValue[1], colorValue[2],
          nx, ny, nz
        );
      }
    }

    for (let i = 0; i < majorSeg; i++) {
      for (let j = 0; j < minorSeg; j++) {
        const first = i * (minorSeg + 1) + j;
        const second = first + minorSeg + 1;
        this.faces.push(first, second, first + 1);
        this.faces.push(second, second + 1, first + 1);
      }
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

    const stride = 4 * 9; // 9 elemen per vertex (pos+color+normal)
    this.GL.vertexAttribPointer(this._position, 3, this.GL.FLOAT, false, stride, 0);
    this.GL.vertexAttribPointer(this._color, 3, this.GL.FLOAT, false, stride, 4 * 3);
    this.GL.vertexAttribPointer(this._normal, 3, this.GL.FLOAT, false, stride, 4 * 6);

    this.GL.drawElements(this.GL.TRIANGLES, this.faces.length, this.GL.UNSIGNED_SHORT, 0);

    this.childs.forEach(child => {
      child.render(_MMatrix, this.MODEL_MATRIX);
    });
  }
}
