// Kerucut.js
export class Kerucut {
    GL = null;
    SHADER_PROGRAM = null;

    _position = null;
    _color = null;
    _normal = null;

    OBJECT_VERTEX = null;
    OBJECT_FACES = null;

    vertex = [];
    faces = [];

    MODEL_MATRIX = LIBS.get_I4();
    POSITION_MATRIX = LIBS.get_I4();
    MOVE_MATRIX = LIBS.get_I4();

    childs = [];

    constructor(GL, SHADER_PROGRAM, _position, _color, _normal, 
                radius = 1, height = 1.5, segments = 36, colorValue = [0.1, 0.6, 0.1]) {
        this.GL = GL;
        this.SHADER_PROGRAM = SHADER_PROGRAM;
        this._position = _position;
        this._color = _color;
        this._normal = _normal;
        this.colorValue = colorValue;

        this._generateMesh(radius, height, segments);
    }

    _generateMesh(radius, height, segments) {
        const v = [];
        const f = [];
        const cv = this.colorValue;

        const tipY = height / 2;   // puncak di atas
        const baseY = -height / 2; // alas di bawah

        // ===== Vertex puncak =====
        v.push(0, tipY, 0, cv[0], cv[1], cv[2], 0, 1, 0);

        // ===== Vertex lingkaran alas =====
        for (let i = 0; i < segments; i++) {
            const theta = (i / segments) * 2 * Math.PI;
            const x = radius * Math.cos(theta);
            const z = radius * Math.sin(theta);

            // Normal miring mengarah ke luar
            const slope = Math.atan(radius / height);
            const nx = Math.cos(theta) * Math.cos(slope);
            const ny = Math.sin(slope);
            const nz = Math.sin(theta) * Math.cos(slope);

            v.push(x, baseY, z, cv[0], cv[1], cv[2], nx, ny, nz);
        }

        // ===== Sisi kerucut =====
        for (let i = 1; i <= segments; i++) {
            const next = (i % segments) + 1;
            f.push(0, i, next);
        }

        // ===== Tutup bawah =====
        const baseCenterIndex = v.length / 9;
        v.push(0, baseY, 0, cv[0], cv[1], cv[2], 0, -1, 0);

        for (let i = 1; i <= segments; i++) {
            const next = (i % segments) + 1;
            f.push(baseCenterIndex, next, i);
        }

        this.vertex = v;
        this.faces = f;
    }

    setup() {
        const gl = this.GL;

        this.OBJECT_VERTEX = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.OBJECT_VERTEX);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertex), gl.STATIC_DRAW);

        this.OBJECT_FACES = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.OBJECT_FACES);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.faces), gl.STATIC_DRAW);

        this.childs.forEach(c => c.setup());
    }

    render(_MMatrix, PARENT_MATRIX) {
        const gl = this.GL;
        this.MODEL_MATRIX = LIBS.multiply(this.MOVE_MATRIX, this.POSITION_MATRIX);
        const M = LIBS.multiply(PARENT_MATRIX, this.MODEL_MATRIX);

        gl.useProgram(this.SHADER_PROGRAM);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.OBJECT_VERTEX);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.OBJECT_FACES);

        const stride = 9 * 4;
        gl.vertexAttribPointer(this._position, 3, gl.FLOAT, false, stride, 0);
        gl.vertexAttribPointer(this._color, 3, gl.FLOAT, false, stride, 3 * 4);
        gl.vertexAttribPointer(this._normal, 3, gl.FLOAT, false, stride, 6 * 4);

        gl.enableVertexAttribArray(this._position);
        gl.enableVertexAttribArray(this._color);
        gl.enableVertexAttribArray(this._normal);

        gl.uniformMatrix4fv(_MMatrix, false, M);
        gl.drawElements(gl.TRIANGLES, this.faces.length, gl.UNSIGNED_SHORT, 0);

        this.childs.forEach(c => c.render(_MMatrix, M));
    }
}
