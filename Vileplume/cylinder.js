class Cylinder {
    constructor(gl, shaderProgram, radiusTop, radiusBottom, height, segments, color) {
        this.gl = gl;
        this.shaderProgram = shaderProgram;
        this.color = color;

        let positions = [];
        let indices = [];

        for (let i = 0; i <= segments; i++) {
            let theta = (i / segments) * 2 * Math.PI;
            let cos = Math.cos(theta);
            let sin = Math.sin(theta);

            // Atas
            positions.push(radiusTop * cos, radiusTop * sin, height / 2);
            // Bawah
            positions.push(radiusBottom * cos, radiusBottom * sin, -height / 2);
        }

        for (let i = 0; i < segments; i++) {
            let top1 = i * 2;
            let bot1 = top1 + 1;
            let top2 = (i + 1) * 2;
            let bot2 = top2 + 1;

            // sisi
            indices.push(top1, bot1, top2);
            indices.push(bot1, bot2, top2);
        }

        // buffer
        this.positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

        this.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

        this.vertexCount = indices.length;
    }

    draw() {
        const gl = this.gl;
        const program = this.shaderProgram;

        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.vertexAttribPointer(
            program.aVertexPosition,
            3, gl.FLOAT, false, 0, 0
        );
        gl.enableVertexAttribArray(program.aVertexPosition);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

        gl.uniform4fv(program.uColor, this.color);

        gl.drawElements(gl.TRIANGLES, this.vertexCount, gl.UNSIGNED_SHORT, 0);
    }
}
