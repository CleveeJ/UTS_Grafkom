export class Ellipsoid {
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
    normal = [];
    faces = [];
    MODEL_MATRIX = LIBS.get_I4();
    POSITION_MATRIX = LIBS.get_I4();
    MOVE_MATRIX = LIBS.get_I4();
    childs = [];

    constructor(GL, SHADER_PROGRAM, _position, _color, _normal = null, rx = 1, ry = 1, rz = 1, stacks = 20, slices = 20, colorValue = [1, 1, 1]) {
        this.GL = GL;
        this.SHADER_PROGRAM = SHADER_PROGRAM;
        this._position = _position;
        this._color = _color;
        this._normal = _normal;
        this.vertex = [];
        this.faces = [];
        this.normal = [];

        for (let stack = 0; stack <= stacks; stack++) {
            let phi = Math.PI * stack / stacks;
            let cosPhi = Math.cos(phi);
            let sinPhi = Math.sin(phi);

            for (let slice = 0; slice <= slices; slice++) {
                let theta = 2 * Math.PI * slice / slices;
                let cosTheta = Math.cos(theta);
                let sinTheta = Math.sin(theta);

                let x = rx * sinPhi * cosTheta;
                let y = ry * cosPhi;
                let z = rz * sinPhi * sinTheta;

                this.vertex.push(x, y, z, colorValue[0], colorValue[1], colorValue[2]);

                let len = Math.sqrt(x*x + y*y + z*z);
                this.normal.push(x/len, y/len, z/len);
            }
        }

        for (let stack = 0; stack < stacks; stack++) {
            for (let slice = 0; slice < slices; slice++) {
                let first = (stack * (slices + 1)) + slice;
                let second = first + slices + 1;
                this.faces.push(first, second, first + 1);
                this.faces.push(second, second + 1, first + 1);
            }
        }
    }

    setup() {
        this.OBJECT_VERTEX = this.GL.createBuffer();
        this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.OBJECT_VERTEX);
        this.GL.bufferData(this.GL.ARRAY_BUFFER, new Float32Array(this.vertex), this.GL.STATIC_DRAW);

        if (this._normal) {
            this.OBJECT_NORMAL = this.GL.createBuffer();
            this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.OBJECT_NORMAL);
            this.GL.bufferData(this.GL.ARRAY_BUFFER, new Float32Array(this.normal), this.GL.STATIC_DRAW);
        }

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
        this.GL.vertexAttribPointer(this._position, 3, this.GL.FLOAT, false, 4 * 6, 0);
        this.GL.vertexAttribPointer(this._color, 3, this.GL.FLOAT, false, 4 * 6, 12);
        if (this._normal && this.OBJECT_NORMAL) {
            this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.OBJECT_NORMAL);
            this.GL.vertexAttribPointer(this._normal, 3, this.GL.FLOAT, false, 0, 0);
        }
        this.GL.drawElements(this.GL.TRIANGLES, this.faces.length, this.GL.UNSIGNED_SHORT, 0);
        this.childs.forEach(child => child.render(_MMatrix, this.MODEL_MATRIX));
    }
}
