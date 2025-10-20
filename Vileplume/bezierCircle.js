class BezierCircle {
    constructor(gl, program, radius, segments, color) {
        this.gl = gl;
        this.program = program;
        this.color = color;

        // Approximate circle pakai segmen Bezier (k=magic constant)
        const k = 0.552284749831; 
        const r = radius;

        // 4 kuadran lingkaran
        let controls = [
            [ [0, r], [k*r, r], [r, k*r], [r, 0] ],
            [ [r, 0], [r, -k*r], [k*r, -r], [0, -r] ],
            [ [0, -r], [-k*r, -r], [-r, -k*r], [-r, 0] ],
            [ [-r, 0], [-r, k*r], [-k*r, r], [0, r] ]
        ];

        let vertices = [];

        // cubic bezier function
        function bezier(p0, p1, p2, p3, t) {
            const u = 1 - t;
            const tt = t * t;
            const uu = u * u;
            const uuu = uu * u;
            const ttt = tt * t;

            return [
                uuu*p0[0] + 3*uu*t*p1[0] + 3*u*tt*p2[0] + ttt*p3[0],
                uuu*p0[1] + 3*uu*t*p1[1] + 3*u*tt*p2[1] + ttt*p3[1]
            ];
        }

        // generate vertices dari 4 segmen
        controls.forEach(segment => {
            let [p0, p1, p2, p3] = segment;
            for (let j=0; j<=segments; j++) {
                const t = j/segments;
                const p = bezier(p0,p1,p2,p3,t);
                vertices.push(p[0], p[1], 0.0);
            }
        });

        this.vertexCount = vertices.length/3;

        // buffer
        this.buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    }

    draw(modelMatrix) {
        const gl = this.gl;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.vertexAttribPointer(this.program.aVertexPosition, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.program.aVertexPosition);

        gl.uniform4fv(this.program.uColor, this.color);
        gl.uniformMatrix4fv(this.program.uModelViewMatrix, false, modelMatrix);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, this.vertexCount);
    }
}
