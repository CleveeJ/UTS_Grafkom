export class Leaf {
    GL = null;
    SHADER_PROGRAM = null;

    _position = null;
    _color = null;

    OBJECT_VERTEX = null;
    OBJECT_FACES = null;

    vertex = [];
    faces = [];
    MODEL_MATRIX = LIBS.get_I4();
    POSITION_MATRIX = LIBS.get_I4();
    MOVE_MATRIX = LIBS.get_I4();

    childs = [];

    // Perhatikan: rx akan dipakai untuk X dan Y (rx == ry) agar simetris terhadap Z
    constructor(GL, SHADER_PROGRAM, _position, _color, rxy = 1, rz = 0.2, stacks = 15, slices = 30, colorValue = [0, 1, 0]) {
        this.GL = GL;
        this.SHADER_PROGRAM = SHADER_PROGRAM;

        this._position = _position;
        this._color = _color;

        this.vertex = [];
        this.faces = [];

        // === elipsoid (atas) ===
        for (let stack = 0; stack <= stacks; stack++) {
            let phi = (Math.PI) * (stack / stacks); // 0 .. PI/2
            let cosPhi = Math.cos(phi);
            let sinPhi = Math.sin(phi);

            for (let slice = 0; slice <= slices; slice++) {
                let theta = 2 * Math.PI * slice / slices;
                let cosT = Math.cos(theta);
                let sinT = Math.sin(theta);

                let x = rxy * sinPhi * cosT;
                let y = rxy * sinPhi * sinT;
                let z = rz * cosPhi + Math.pow((y/3 + 0.2), 2); // Z sebagai sumbu vertikal (gepeng terhadap Z)

                this.vertex.push(x, y, z, colorValue[0], colorValue[1], colorValue[2]);
            }
        }

        // faces untuk elipsoid
        for (let stack = 0; stack < stacks; stack++) {
            for (let slice = 0; slice < slices; slice++) {
                let first = (stack * (slices + 1)) + slice;
                let second = first + (slices + 1);

                this.faces.push(first, second, first + 1);
                this.faces.push(second, second + 1, first + 1);
            }
        }
        
        let baseIndex = this.vertex.length / 6;
        let coneSlices = slices;      // jumlah segmen lingkaran
        let coneStacks = 10;          // jumlah ring dari alas → tip
        let coneHeight = rxy * 3;     // tinggi kerucut
        let bendFactor = 0.5;         // seberapa bengkok ke sumbu Z

        for (let j = 0; j <= coneStacks; j++) {
            let t = j / coneStacks;               // progress 0 → 1
            let radiusXY = rxy * (1 - Math.pow(t, 2));        // radius mengecil dari alas → tip
            let radiusZ = rz * (1 - t);          // Z juga mengecil
            let y = -t * coneHeight - 0.15;             // posisi Y dari 0 → -coneHeight

            for (let i = 0; i <= coneSlices; i++) {
                let theta = 2 * Math.PI * i / coneSlices;
                let bx = radiusXY * Math.cos(theta);
                let by = y;
                let bz = radiusZ * Math.sin(theta) + Math.pow(by/3, 2); // Z mengecil + bengkok

                this.vertex.push(
                    bx, by, bz,
                    colorValue[0],
                    colorValue[1],
                    colorValue[2]
                );
            }
        }

        // === faces antar ring ===
        for (let j = 0; j < coneStacks; j++) {
            let ringStart = baseIndex + j * (coneSlices + 1);
            let nextRingStart = ringStart + (coneSlices + 1);

            for (let i = 0; i < coneSlices; i++) {
                // segitiga pertama
                this.faces.push(ringStart + i, nextRingStart + i, ringStart + i + 1);
                // segitiga kedua
                this.faces.push(ringStart + i + 1, nextRingStart + i, nextRingStart + i + 1);
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

        this.childs.forEach(child => {
            child.setup();
        });
    }

    render(_MMatrix, PARENT_MATRIX) {
        this.MODEL_MATRIX = LIBS.multiply(this.MOVE_MATRIX, this.POSITION_MATRIX);
        this.MODEL_MATRIX = LIBS.multiply(this.MODEL_MATRIX, PARENT_MATRIX);

        this.GL.useProgram(this.SHADER_PROGRAM);
        this.GL.uniformMatrix4fv(_MMatrix, false, this.MODEL_MATRIX);

        this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.OBJECT_VERTEX);
        this.GL.bindBuffer(this.GL.ELEMENT_ARRAY_BUFFER, this.OBJECT_FACES);

        // format vertex: [x,y,z, r,g,b] => stride = 4*(3+3)
        this.GL.vertexAttribPointer(this._position, 3, this.GL.FLOAT, false, 4 * (3 + 3), 0);
        this.GL.vertexAttribPointer(this._color, 3, this.GL.FLOAT, false, 4 * (3 + 3), 4 * 3);

        this.GL.drawElements(this.GL.TRIANGLES, this.faces.length, this.GL.UNSIGNED_SHORT, 0);

        this.childs.forEach(child => {
            child.render(_MMatrix, this.MODEL_MATRIX);
        });
    }
}
