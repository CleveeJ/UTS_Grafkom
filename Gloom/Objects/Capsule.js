export class Capsule {
    GL = null;
    SHADER_PROGRAM = null;

    _position = null;
    _color = null;
    _MMatrix = null;

    OBJECT_VERTEX = null;
    OBJECT_FACES = null;

    vertex = [];
    faces = [];
    MODEL_MATRIX = LIBS.get_I4();
    POSITION_MATRIX = LIBS.get_I4();
    MOVE_MATRIX = LIBS.get_I4();

    childs = [];

    constructor(GL, SHADER_PROGRAM, _position, _color,
                radiusX = 1, radiusY = 1, radiusZ = 1,
                height = 2, slices = 20, stacks = 10,
                colorValue = [1, 1, 1]) {
        this.GL = GL;
        this.SHADER_PROGRAM = SHADER_PROGRAM;
        this._position = _position;
        this._color = _color;

        this.vertex = [];
        this.faces = [];

        let halfH = height / 2;

        for (let y = -halfH; y <= halfH; y += height / stacks) {
            for (let slice = 0; slice <= slices; slice++) {
                let theta = 2 * Math.PI * slice / slices;
                let x = radiusX * Math.cos(theta);
                let z = radiusZ * Math.sin(theta);
                this.vertex.push(x, y, z, colorValue[0], colorValue[1], colorValue[2]);
            }
        }

        for (let stack = 0; stack <= stacks; stack++) {
            let phi = (Math.PI / 2) * stack / stacks;
            let cosPhi = Math.cos(phi);
            let sinPhi = Math.sin(phi);

            for (let slice = 0; slice <= slices; slice++) {
                let theta = 2 * Math.PI * slice / slices;
                let x = radiusX * cosPhi * Math.cos(theta);
                let z = radiusZ * cosPhi * Math.sin(theta);
                let y = halfH + radiusY * sinPhi;
                this.vertex.push(x, y, z, colorValue[0], colorValue[1], colorValue[2]);
            }
        }

        for (let stack = 0; stack <= stacks; stack++) {
            let phi = (Math.PI / 2) * stack / stacks;
            let cosPhi = Math.cos(phi);
            let sinPhi = Math.sin(phi);

            for (let slice = 0; slice <= slices; slice++) {
                let theta = 2 * Math.PI * slice / slices;
                let x = radiusX * cosPhi * Math.cos(theta);
                let z = radiusZ * cosPhi * Math.sin(theta);
                let y = -halfH - radiusY * sinPhi;
                this.vertex.push(x, y, z, colorValue[0], colorValue[1], colorValue[2]);
            }
        }

        let ringVerts = slices + 1;
        let ringsTotal = (stacks + 1) + (stacks + 1) + (stacks + 1);

        for (let r = 0; r < ringsTotal - 1; r++) {
            for (let s = 0; s < slices; s++) {
                let first = r * ringVerts + s;
                let second = first + ringVerts;

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

        this.GL.vertexAttribPointer(this._position, 3, this.GL.FLOAT, false, 4 * (3 + 3), 0);
        this.GL.vertexAttribPointer(this._color, 3, this.GL.FLOAT, false, 4 * (3 + 3), 4 * 3);

        this.GL.drawElements(this.GL.TRIANGLES, this.faces.length, this.GL.UNSIGNED_SHORT, 0);

        this.childs.forEach(child => {
            child.render(_MMatrix, this.MODEL_MATRIX);
        });
    }
}