// curve
export class Rambut {
    GL = null;
    SHADER_PROGRAM = null;

    _position = null;
    _color = null;
    _MMatrix = null;

    OBJECT_VERTEX = null;
    OBJECT_FACES = null;

    vertex = [];
    faces = [];

    POSITION_MATRIX = LIBS.get_I4(); // Mpos
    MOVE_MATRIX     = LIBS.get_I4(); // Mmove

    childs = [];

    constructor(GL, SHADER_PROGRAM, _position, _color, _MMatrix) {
        this.GL = GL;
        this.SHADER_PROGRAM = SHADER_PROGRAM;
        this._position = _position;
        this._color = _color;
        this._MMatrix = _MMatrix;

        // konfigurasi helai rambut
        this.helaiConfig = [
            // belakang kanan
            { panjang: 3.3, lebar: 0.8, tinggi: 1.1, alpha: -1, beta: 0.2, curveFactor: 10, posX: -0.1, posZ: 0.2, rotasiY: -0.8, rotasiZ: 0 }, 

            // belakang kiri
            { panjang: 3, lebar: 0.8,  tinggi: 1.1, alpha: 1, beta: 0.1, curveFactor: 0, posX: 0, posZ: 0.1, rotasiY: 4, rotasiZ: 0 }, 

             // kanan depan
            { panjang: 2.5, lebar: 0.8, tinggi: 1.1, alpha: 1.1, beta: 0.1, curveFactor: -1, posX: 0.15, posZ:  0.2, rotasiY:  0.6, rotasiZ: -0.15 }, 

            // kiri depan
            { panjang: 2.5, lebar: 0.8,  tinggi: 1.1, alpha: 1.1, beta: 0.1, curveFactor: -1, posX: -0.1, posZ:  0.2, rotasiY: 2.3, rotasiZ: 0 }, 
        ];

        this._generateMesh();
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
                    let R = 0.15 + 0.1 * (1 - r);
                    let G = 0.35 + 0.4 * (1 - r);
                    let B = 0.1;

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

    setup() {
        this.OBJECT_VERTEX = this.GL.createBuffer();
        this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.OBJECT_VERTEX);
        this.GL.bufferData(this.GL.ARRAY_BUFFER, new Float32Array(this.vertex), this.GL.STATIC_DRAW);

        this.OBJECT_FACES = this.GL.createBuffer();
        this.GL.bindBuffer(this.GL.ELEMENT_ARRAY_BUFFER, this.OBJECT_FACES);
        this.GL.bufferData(this.GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.faces), this.GL.STATIC_DRAW);

        this.childs.forEach(child => child.setup());
    }

    render(PARENT_MATRIX) {
        this.MODEL_MATRIX = LIBS.multiply(this.MOVE_MATRIX, this.POSITION_MATRIX);
        this.MODEL_MATRIX = LIBS.multiply(this.MODEL_MATRIX, PARENT_MATRIX);

        this.GL.useProgram(this.SHADER_PROGRAM);
        this.GL.uniformMatrix4fv(this._MMatrix, false, this.MODEL_MATRIX);

        this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.OBJECT_VERTEX);
        this.GL.vertexAttribPointer(this._position, 3, this.GL.FLOAT, false, 24, 0);
        this.GL.vertexAttribPointer(this._color, 3, this.GL.FLOAT, false, 24, 12);

        this.GL.bindBuffer(this.GL.ELEMENT_ARRAY_BUFFER, this.OBJECT_FACES);
        this.GL.drawElements(this.GL.TRIANGLES, this.faces.length, this.GL.UNSIGNED_SHORT, 0);

        this.childs.forEach(child => child.render(this.MODEL_MATRIX));
    }
}
