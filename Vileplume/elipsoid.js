class Ellipsoid {
    constructor(gl, program, rx, ry, rz, stacks, slices, color) {
        this.gl = gl;
        this.program = program;
        this.color = color;

        let vertices = [];
        for (let i = 0; i <= stacks; i++) {
            let phi = Math.PI * i / stacks; // 0 → π
            for (let j = 0; j <= slices; j++) {
                let theta = 2 * Math.PI * j / slices; // 0 → 2π
                let x = rx * Math.sin(phi) * Math.cos(theta);
                let y = ry * Math.cos(phi);
                let z = rz * Math.sin(phi) * Math.sin(theta);
                vertices.push(x, y, z);
            }
        }

        let indices = [];
        for (let i = 0; i < stacks; i++) {
            for (let j = 0; j < slices; j++) {
                let first = i * (slices + 1) + j;
                let second = first + slices + 1;
                indices.push(first, second, first + 1);
                indices.push(second, second + 1, first + 1);
            }
        }

        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

        this.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

        this.numIndices = indices.length;
    }

    draw(matrix) {
        const gl = this.gl;
        const program = this.program;

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(program.aVertexPosition, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(program.aVertexPosition);

        gl.uniform4fv(program.uColor, this.color);

        if (matrix) {
            gl.uniformMatrix4fv(program.uModelViewMatrix, false, matrix);
        }

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.drawElements(gl.TRIANGLES, this.numIndices, gl.UNSIGNED_SHORT, 0);
    }
}
