// =================================================
// Rambut dengan normal buffer (untuk shading halus)
// =================================================
export class Rambut {
    GL = null;
    SHADER_PROGRAM = null;

    _position = null;
    _color = null;
    _normal = null;
    _MMatrix = null;

    OBJECT_VERTEX = null;
    OBJECT_FACES = null;
    OBJECT_NORMAL = null;

    vertex = [];
    faces = [];
    normals = [];

    POSITION_MATRIX = LIBS.get_I4();
    MOVE_MATRIX = LIBS.get_I4();
    MODEL_MATRIX = LIBS.get_I4();

    childs = [];

    constructor(GL, SHADER_PROGRAM, _position, _color, _normal, _MMatrix) {
        this.GL = GL;
        this.SHADER_PROGRAM = SHADER_PROGRAM;
        this._position = _position;
        this._color = _color;
        this._normal = _normal;
        this._MMatrix = _MMatrix;

        this.helaiConfig = [
            { panjang: 3.3, lebar: 0.8, tinggi: 1.1, alpha: -1, beta: 0.2, curveFactor: 10, posX: -0.1, posZ: 0.2, rotasiY: -0.8, rotasiZ: 0 },
            { panjang: 3, lebar: 0.8, tinggi: 1.1, alpha: 1, beta: 0.1, curveFactor: 0, posX: 0, posZ: 0.1, rotasiY: 4, rotasiZ: 0 },
            { panjang: 2.5, lebar: 0.8, tinggi: 1.1, alpha: 1.1, beta: 0.1, curveFactor: -1, posX: 0.15, posZ: 0.2, rotasiY: 0.6, rotasiZ: -0.15 },
            { panjang: 2.5, lebar: 0.8, tinggi: 1.1, alpha: 1.1, beta: 0.1, curveFactor: -1, posX: -0.1, posZ: 0.2, rotasiY: 2.3, rotasiZ: 0 },
        ];

        this._generateMesh();
        this._generateNormals(); // <- generate normal di constructor
    }

    _generateMesh() {
        let allVertices = [];
        let allFaces = [];
        let vertexCount = 0;

        const generateLeaf = (cfg) => {
            let { panjang, lebar, tinggi, alpha, beta, posX, posZ, rotasiY, rotasiZ, curveFactor } = cfg;
            let nR = cfg.nR ?? 30;
            let nTheta = cfg.nTheta ?? 12;

            let localVertices = [];
            let localFaces = [];

            for (let i = 0; i <= nR; i++) {
                let r = i / nR;
                let halfWidth = lebar * (1 - r);

                for (let j = 0; j <= nTheta; j++) {
                    let t = (j / nTheta - 0.5) * 2;

                    let x = panjang * r;
                    let y = -alpha * Math.pow(r, curveFactor > 0 ? curveFactor : 2);
                    let z = (halfWidth + beta * Math.sin(Math.PI * r)) * t;

                    // rotasi Y
                    let rotX = x * Math.cos(rotasiY) - z * Math.sin(rotasiY);
                    let rotZ = x * Math.sin(rotasiY) + z * Math.cos(rotasiY);
                    x = rotX;
                    z = rotZ;

                    // rotasi Z
                    let rotX2 = x * Math.cos(rotasiZ) - y * Math.sin(rotasiZ);
                    let rotY2 = x * Math.sin(rotasiZ) + y * Math.cos(rotasiZ);
                    x = rotX2;
                    y = rotY2;

                    // offset posisi
                    x += posX;
                    y += tinggi;
                    z += posZ;

                    // warna
                    let R = 1.0 * (1 - 0.2 * r);
                    let G = 0.56 * (1 - 0.2 * r);
                    let B = 0.34 * (1 - 0.2 * r);

                    localVertices.push(x, y, z, R, G, B);
                }
            }

            for (let i = 0; i < nR; i++) {
                for (let j = 0; j < nTheta; j++) {
                    let first = i * (nTheta + 1) + j;
                    let second = first + (nTheta + 1);
                    localFaces.push(first, second, first + 1);
                    localFaces.push(second, second + 1, first + 1);
                }
            }

            return { vertices: localVertices, faces: localFaces, count: (nTheta + 1) * (nR + 1) };
        };

        this.helaiConfig.forEach(cfg => {
            const { vertices, faces, count } = generateLeaf(cfg);
            allVertices.push(...vertices);
            faces.forEach(idx => allFaces.push(idx + vertexCount));
            vertexCount += count;
        });

        this.vertex = allVertices;
        this.faces = allFaces;
    }

    _generateNormals() {
        const normals = new Array(this.vertex.length / 6).fill(0).map(() => [0, 0, 0]);

        for (let i = 0; i < this.faces.length; i += 3) {
            const ia = this.faces[i];
            const ib = this.faces[i + 1];
            const ic = this.faces[i + 2];

            const ax = this.vertex[ia * 6], ay = this.vertex[ia * 6 + 1], az = this.vertex[ia * 6 + 2];
            const bx = this.vertex[ib * 6], by = this.vertex[ib * 6 + 1], bz = this.vertex[ib * 6 + 2];
            const cx = this.vertex[ic * 6], cy = this.vertex[ic * 6 + 1], cz = this.vertex[ic * 6 + 2];

            const U = [bx - ax, by - ay, bz - az];
            const V = [cx - ax, cy - ay, cz - az];
            const N = [
                U[1] * V[2] - U[2] * V[1],
                U[2] * V[0] - U[0] * V[2],
                U[0] * V[1] - U[1] * V[0],
            ];

            normals[ia][0] += N[0];
            normals[ia][1] += N[1];
            normals[ia][2] += N[2];
            normals[ib][0] += N[0];
            normals[ib][1] += N[1];
            normals[ib][2] += N[2];
            normals[ic][0] += N[0];
            normals[ic][1] += N[1];
            normals[ic][2] += N[2];
        }

        this.normals = normals.flat();
    }

    setup() {
        const GL = this.GL;

        this.OBJECT_VERTEX = GL.createBuffer();
        GL.bindBuffer(GL.ARRAY_BUFFER, this.OBJECT_VERTEX);
        GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(this.vertex), GL.STATIC_DRAW);

        this.OBJECT_FACES = GL.createBuffer();
        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.OBJECT_FACES);
        GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.faces), GL.STATIC_DRAW);

        this.OBJECT_NORMAL = GL.createBuffer();
        GL.bindBuffer(GL.ARRAY_BUFFER, this.OBJECT_NORMAL);
        GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(this.normals), GL.STATIC_DRAW);

        this.childs.forEach(child => child.setup());
    }

    render(_MMatrix, PARENT_MATRIX) {
        const GL = this.GL;
        this.MODEL_MATRIX = LIBS.multiply(this.MOVE_MATRIX, this.POSITION_MATRIX);
        this.MODEL_MATRIX = LIBS.multiply(this.MODEL_MATRIX, PARENT_MATRIX);

        GL.useProgram(this.SHADER_PROGRAM);
        GL.uniformMatrix4fv(_MMatrix, false, this.MODEL_MATRIX);

        // posisi + warna
        GL.bindBuffer(GL.ARRAY_BUFFER, this.OBJECT_VERTEX);
        GL.vertexAttribPointer(this._position, 3, GL.FLOAT, false, 24, 0);
        GL.vertexAttribPointer(this._color, 3, GL.FLOAT, false, 24, 12);
        GL.enableVertexAttribArray(this._position);
        GL.enableVertexAttribArray(this._color);

        // normal
        GL.bindBuffer(GL.ARRAY_BUFFER, this.OBJECT_NORMAL);
        GL.vertexAttribPointer(this._normal, 3, GL.FLOAT, false, 0, 0);
        GL.enableVertexAttribArray(this._normal);

        // faces
        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.OBJECT_FACES);
        GL.drawElements(GL.TRIANGLES, this.faces.length, GL.UNSIGNED_SHORT, 0);

        this.childs.forEach(child => child.render(_MMatrix, this.MODEL_MATRIX));
    }
}
