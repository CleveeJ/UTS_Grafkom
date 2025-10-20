// =================================================
// 🔹 Badan dengan perhitungan normal
// =================================================
export class Badan {
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
    normals = [];

    POSITION_MATRIX = LIBS.get_I4();
    MOVE_MATRIX     = LIBS.get_I4();
    MODEL_MATRIX    = LIBS.get_I4();

    childs = [];

    constructor(GL, SHADER_PROGRAM, _position, _color, _MMatrix, _normal,
                a = 1.5, b = 1.15, c = 1.5, stack = 100, step = 100) {
        this.GL = GL;
        this.SHADER_PROGRAM = SHADER_PROGRAM;
        this._position = _position;
        this._color = _color;
        this._normal = _normal;     // 🔹 tambahkan atribut normal
        this._MMatrix = _MMatrix;

        this._generateMesh(a, b, c, stack, step);
    }

    _generateMesh(a, b, c, stack, step) {
        const positions = [];
        const faces = [];

        // --- Generate vertex posisi ---
        for (let i = 0; i <= stack; i++) {
            const u = (i / stack) * Math.PI - Math.PI / 2;
            const scale = 1 - 0.15 * Math.pow(Math.cos(u), 6); // bentuk khas badan

            for (let j = 0; j <= step; j++) {
                const v = (j / step) * 2 * Math.PI - Math.PI;
                const r = scale;

                const x = a * r * Math.cos(v) * Math.cos(u);
                const y = b * r * Math.sin(u);
                const z = c * r * Math.sin(v) * Math.cos(u);

                positions.push(x, y, z);
            }
        }

        // --- Generate faces (segitiga) ---
        for (let i = 0; i < stack; i++) {
            for (let j = 0; j < step; j++) {
                const first = i * (step + 1) + j;
                const second = first + 1;
                const third = first + (step + 1);
                const fourth = third + 1;

                faces.push(first, second, fourth);
                faces.push(first, fourth, third);
            }
        }

        // --- Hitung normal ---
        const normals = new Array(positions.length).fill(0);
        for (let i = 0; i < faces.length; i += 3) {
            const i0 = faces[i] * 3;
            const i1 = faces[i + 1] * 3;
            const i2 = faces[i + 2] * 3;

            const v0 = [positions[i0], positions[i0 + 1], positions[i0 + 2]];
            const v1 = [positions[i1], positions[i1 + 1], positions[i1 + 2]];
            const v2 = [positions[i2], positions[i2 + 1], positions[i2 + 2]];

            const uVec = [v1[0] - v0[0], v1[1] - v0[1], v1[2] - v0[2]];
            const vVec = [v2[0] - v0[0], v2[1] - v0[1], v2[2] - v0[2]];

            const nx = vVec[1] * uVec[2] - vVec[2] * uVec[1];
            const ny = vVec[2] * uVec[0] - vVec[0] * uVec[2];
            const nz = vVec[0] * uVec[1] - vVec[1] * uVec[0];


            normals[i0]     += nx; normals[i0 + 1]     += ny; normals[i0 + 2]     += nz;
            normals[i1]     += nx; normals[i1 + 1]     += ny; normals[i1 + 2]     += nz;
            normals[i2]     += nx; normals[i2 + 1]     += ny; normals[i2 + 2]     += nz;
        }

        // --- Normalisasi per vertex ---
        for (let i = 0; i < positions.length / 3; i++) {
            const nx = normals[i * 3];
            const ny = normals[i * 3 + 1];
            const nz = normals[i * 3 + 2];
            const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1.0;
            normals[i * 3] /= len;
            normals[i * 3 + 1] /= len;
            normals[i * 3 + 2] /= len;
        }

        this.normals = normals;
        this.faces = faces;

        // --- Gabungkan posisi + normal + warna ---
        const vertex = [];
        const color = [0.41, 0.57, 0.69]; // warna abu kebiruan khas badan

        for (let i = 0; i < positions.length / 3; i++) {
            vertex.push(
                positions[i * 3],
                positions[i * 3 + 1],
                positions[i * 3 + 2],
                normals[i * 3],
                normals[i * 3 + 1],
                normals[i * 3 + 2],
                color[0],
                color[1],
                color[2]
            );
        }

        this.vertex = vertex;
    }

    setup() {
        const GL = this.GL;

        // --- Vertex buffer ---
        this.OBJECT_VERTEX = GL.createBuffer();
        GL.bindBuffer(GL.ARRAY_BUFFER, this.OBJECT_VERTEX);
        GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(this.vertex), GL.STATIC_DRAW);

        // --- Face buffer ---
        this.OBJECT_FACES = GL.createBuffer();
        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.OBJECT_FACES);
        GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.faces), GL.STATIC_DRAW);

        this.childs.forEach(child => child.setup());
    }

    render(_MMatrix, PARENT_MATRIX) {
        const GL = this.GL;

        // --- Matriks Model ---
        this.MODEL_MATRIX = LIBS.multiply(LIBS.multiply(this.MOVE_MATRIX, this.POSITION_MATRIX), PARENT_MATRIX);

        GL.useProgram(this.SHADER_PROGRAM);
        GL.uniformMatrix4fv(_MMatrix, false, this.MODEL_MATRIX);

        // --- Vertex layout: pos(3) + normal(3) + color(3) = 9 floats * 4 bytes = 36 bytes ---
        const stride = 36;
        GL.bindBuffer(GL.ARRAY_BUFFER, this.OBJECT_VERTEX);

        GL.vertexAttribPointer(this._position, 3, GL.FLOAT, false, stride, 0);
        GL.enableVertexAttribArray(this._position);

        if (this._normal !== undefined && this._normal !== null) {
            GL.vertexAttribPointer(this._normal, 3, GL.FLOAT, false, stride, 12);
            GL.enableVertexAttribArray(this._normal);
        }

        GL.vertexAttribPointer(this._color, 3, GL.FLOAT, false, stride, 24);
        GL.enableVertexAttribArray(this._color);

        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.OBJECT_FACES);
        GL.drawElements(GL.TRIANGLES, this.faces.length, GL.UNSIGNED_SHORT, 0);

        // --- Render anak-anak ---
        this.childs.forEach(child => child.render(_MMatrix, this.MODEL_MATRIX));
    }
}
