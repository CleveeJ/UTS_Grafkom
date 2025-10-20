// ellipsoid modifikasi => mirip capsule karena modifikasi dari menggunakan scale
export class Badan {
    GL = null;
    SHADER_PROGRAM = null;

    _position = null;
    _color = null;
    _MMatrix = null;

    OBJECT_VERTEX = null;
    OBJECT_FACES = null;

    vertex = [];
    faces = [];

    POSITION_MATRIX = LIBS.get_I4();
    MOVE_MATRIX     = LIBS.get_I4();
    MODEL_MATRIX = LIBS.get_I4();

    childs = [];

    constructor(GL, SHADER_PROGRAM, _position, _color, _MMatrix, a = 1.5, b = 1.15, c = 1.5, stack = 100, step = 100) {
        this.GL = GL;
        this.SHADER_PROGRAM = SHADER_PROGRAM;
        this._position = _position;
        this._color = _color;
        this._MMatrix = _MMatrix;

        this._generateMesh(a, b, c, stack, step);
    }

    _generateMesh(a, b, c, stack, step) {
        const vertices = [];
        const faces = [];

        for (let i = 0; i <= stack; i++) {
            let u = i / stack * Math.PI - Math.PI / 2; // latitude
            let scale = 1 - 0.15 * Math.pow(Math.cos(u), 6); // mengecil di atas & bawah

            for (let j = 0; j <= step; j++) {
                let v = j / step * 2 * Math.PI - Math.PI;
                let r = scale;

                let x = a * r * Math.cos(v) * Math.cos(u);
                let y = b * r * Math.sin(u);
                let z = c * r * Math.sin(v) * Math.cos(u);

                vertices.push(x, y, z, 0.41, 0.57, 0.69); // warna oranye
            }
        }

        for (let i = 0; i < stack; i++) {
            for (let j = 0; j < step; j++) {
                let first = i * (step + 1) + j;
                let second = first + 1;
                let third = first + (step + 1);
                let fourth = third + 1;
                faces.push(first, second, fourth);
                faces.push(first, fourth, third);
            }
        }

        this.vertex = vertices;
        this.faces = faces;
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
        this.GL.uniformMatrix4fv(this._MMatrix, false, this.MODEL_MATRIX);

        this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.OBJECT_VERTEX);
        this.GL.vertexAttribPointer(this._position, 3, this.GL.FLOAT, false, 24, 0);
        this.GL.vertexAttribPointer(this._color, 3, this.GL.FLOAT, false, 24, 12);

        this.GL.bindBuffer(this.GL.ELEMENT_ARRAY_BUFFER, this.OBJECT_FACES);
        this.GL.drawElements(this.GL.TRIANGLES, this.faces.length, this.GL.UNSIGNED_SHORT, 0);

        this.childs.forEach(child => child.render(_MMatrix, this.MODEL_MATRIX));
    }
}
