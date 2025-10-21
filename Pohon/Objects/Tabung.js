export class Tabung {
    GL = null;
    SHADER_PROGRAM = null;

    _position = null;
    _color = null;
    _normal = null;

    OBJECT_VERTEX = null;
    OBJECT_FACES = null;

    vertex = [];
    normal = [];
    faces = [];

    MODEL_MATRIX = LIBS.get_I4();
    POSITION_MATRIX = LIBS.get_I4();
    MOVE_MATRIX = LIBS.get_I4();

    childs = [];

    constructor(GL, SHADER_PROGRAM, _position, _color, _normal, radius = 0.2, height = 1, segments = 36, colorValue = [0.55,0.27,0.07]) {
        this.GL = GL;
        this.SHADER_PROGRAM = SHADER_PROGRAM;
        this._position = _position;
        this._color = _color;
        this._normal = _normal;
        this.colorValue = colorValue;

        this._generateMesh(radius, height, segments);
    }

    _generateMesh(radius, height, segments) {
        const vertices = [];
        const faces = [];
        const cv = this.colorValue;

        // Generate vertices
        for (let i = 0; i <= 1; i++) {
            let y = (i === 0 ? -height/2 : height/2);
            for (let j = 0; j <= segments; j++) {
                let theta = (j / segments) * 2 * Math.PI;
                let x = radius * Math.cos(theta);
                let z = radius * Math.sin(theta);

                let nx = x, ny = 0, nz = z;
                let len = Math.sqrt(nx*nx + nz*nz);
                nx /= len; nz /= len;

                vertices.push(x, y, z, cv[0], cv[1], cv[2], nx, ny, nz);
            }
        }

        const ringVerts = segments + 1;
        // Sisi tabung
        for (let i = 0; i < segments; i++) {
            let a = i;
            let b = i + ringVerts;
            let c = (i + 1) % ringVerts;
            let d = ((i + 1) % ringVerts) + ringVerts;

            faces.push(a, b, c);
            faces.push(b, d, c);
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

        this.childs.forEach(c => c.setup());
    }

    render(_MMatrix, PARENT_MATRIX) {
        this.MODEL_MATRIX = LIBS.multiply(this.MOVE_MATRIX, this.POSITION_MATRIX);
        this.MODEL_MATRIX = LIBS.multiply(this.MODEL_MATRIX, PARENT_MATRIX);

        this.GL.useProgram(this.SHADER_PROGRAM);

        this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.OBJECT_VERTEX);
        this.GL.bindBuffer(this.GL.ELEMENT_ARRAY_BUFFER, this.OBJECT_FACES);

        const stride = 9 * 4; // 9 float per vertex
        this.GL.vertexAttribPointer(this._position, 3, this.GL.FLOAT, false, stride, 0);
        this.GL.vertexAttribPointer(this._color, 3, this.GL.FLOAT, false, stride, 3*4);
        this.GL.vertexAttribPointer(this._normal, 3, this.GL.FLOAT, false, stride, 6*4);

        this.GL.enableVertexAttribArray(this._position);
        this.GL.enableVertexAttribArray(this._color);
        this.GL.enableVertexAttribArray(this._normal);

        this.GL.uniformMatrix4fv(_MMatrix, false, this.MODEL_MATRIX);

        this.GL.drawElements(this.GL.TRIANGLES, this.faces.length, this.GL.UNSIGNED_SHORT, 0);

        this.childs.forEach(c => c.render(_MMatrix, this.MODEL_MATRIX));
    }
}
