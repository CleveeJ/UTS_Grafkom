function drawEye(gl, shaderProgram, baseMatrix, x, y) {
    let M = baseMatrix.slice();
    // geser X dan Y relatif ke badan
    mat4.translate(M, M, [x, y, 0.5]);  // Z offset lebih besar biar nongol di depan

    // Lingkaran hitam (outline)
    let eyeBlack = new BezierCircle(gl, shaderProgram, 0.1, 40, [0.0, 0.0, 0.0, 1.0]);
    eyeBlack.draw(M);

    // Lingkaran merah penuh
    let eyeRed = new BezierCircle(gl, shaderProgram, 0.08, 40, [0.8, 0.0, 0.0, 1.0]);
    eyeRed.draw(M);

    // Lingkaran putih (refleksi)
    let Mw = M.slice();
    let eyeWhite = new BezierCircle(gl, shaderProgram, 0.04, 40, [1.0, 1.0, 1.0, 1.0]);
    eyeWhite.draw(Mw);
}

function drawSmile(gl, shaderProgram, baseMatrix, x, y) {
    let M = baseMatrix.slice();
    mat4.translate(M, M, [x, y, 0.5]); // majuin ke depan biar nggak ketutup badan

    // Titik kontrol cubic Bezier untuk senyuman
    let p0 = [-0.25, 0.0, 0];
    let p1 = [-0.25, -0.25, 0];
    let p2 = [ 0.25, -0.25, 0];
    let p3 = [ 0.25, 0.0, 0];

    function bezier(p0, p1, p2, p3, t) {
        let u = 1 - t;
        let tt = t * t;
        let uu = u * u;
        let uuu = uu * u;
        let ttt = tt * t;
        return [
            uuu * p0[0] + 3 * uu * t * p1[0] + 3 * u * tt * p2[0] + ttt * p3[0],
            uuu * p0[1] + 3 * uu * t * p1[1] + 3 * u * tt * p2[1] + ttt * p3[1],
            0
        ];
    }

    // Generate titik-titik kurva
    let vertices = [];
    let segments = 40;
    for (let i = 0; i <= segments; i++) {
        let t = i / segments;
        let pt = bezier(p0, p1, p2, p3, t);
        vertices.push(pt[0], pt[1], pt[2]);
    }

    // Buffer
    let buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(shaderProgram.aVertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(shaderProgram.aVertexPosition);

    gl.uniform4fv(shaderProgram.uColor, [0.0, 0.0, 0.0, 1.0]); // warna hitam
    gl.uniformMatrix4fv(shaderProgram.uModelViewMatrix, false, M);

    gl.lineWidth(3.0);
    gl.drawArrays(gl.LINE_STRIP, 0, vertices.length / 3);
}



function main() {
    const gl = LIBS.get_gl_context("mycanvas");
    if (!gl) {
        alert("WebGL not supported");
        return;
    }

    const vsSource = `
        attribute vec3 aVertexPosition;
        uniform mat4 uModelViewMatrix;
        uniform mat4 uProjectionMatrix;
        void main(void) {
            gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aVertexPosition, 1.0);
        }
    `;

    const fsSource = `
        precision mediump float;
        uniform vec4 uColor;
        void main(void) {
            gl_FragColor = uColor;
        }
    `;

    const vertexShader   = LIBS.get_shader(gl, "shader-vs", vsSource);
    const fragmentShader = LIBS.get_shader(gl, "shader-fs", fsSource);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        console.error("Unable to initialize the shader program.");
        return;
    }

    gl.useProgram(shaderProgram);

    shaderProgram.aVertexPosition  = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    shaderProgram.uColor           = gl.getUniformLocation(shaderProgram, "uColor");
    shaderProgram.uModelViewMatrix = gl.getUniformLocation(shaderProgram, "uModelViewMatrix");
    shaderProgram.uProjectionMatrix= gl.getUniformLocation(shaderProgram, "uProjectionMatrix");

    // ====================== OBJEK ======================
    const torusOuter  = new Toroid(gl, shaderProgram, 0.4, 0.15, 40, 40, [1.0, 0.6, 0.0, 1.0]);
    const torusInner  = new Toroid(gl, shaderProgram, 0.35, 0.1,  40, 40, [0.05, 0.05, 0.05, 1.0]);
    const diskBottom  = new Disk  (gl, shaderProgram, 0.3,  60,             [0.55, 0.27, 0.07, 1.0]);

    const petalTop = new EllipticParaboloid(gl, shaderProgram, 0.65, 0.45, 0.15, 48, [0.87, 0.05, 0.05, 1.0]);
    const petalRim = new PetalRim          (gl, shaderProgram, 0.65, 0.45, 0.15, 0.05, [0.87, 0.05, 0.05, 1.0]);

    const BASE_RADIUS = 0.6;
    const EPS = 0.001;
    const Z_TOP = -0.05;
    const Z_BOT = -0.15;
    const Z_CENTER = (Z_TOP + Z_BOT) / 2.0;
    const H_CYL = Math.abs(Z_TOP - Z_BOT);

    const petalBaseTop    = new Disk    (gl, shaderProgram, BASE_RADIUS + EPS, 64, [0.87, 0.05, 0.05, 1.0]);
    const petalBaseBottom = new Disk    (gl, shaderProgram, BASE_RADIUS + EPS, 64, [0.87, 0.05, 0.05, 1.0]);
    const petalBaseRim    = new Cylinder(gl, shaderProgram, BASE_RADIUS, BASE_RADIUS, H_CYL, 64, [0.87, 0.05, 0.05, 1.0]);

    // ================== SPOTS ==================
    const PETAL_COUNT = 5;
    const petalSpots = [];
    for (let p = 0; p < PETAL_COUNT; p++) {
        const arr = [];
        const spotCount = Math.floor(3 + Math.random() * 4); // 3..6
        for (let k = 0; k < spotCount; k++) {
            const radius = 0.02 + Math.random() * 0.05;
            const color  = [1.0, 0.85 + Math.random()*0.15, 0.85 + Math.random()*0.15, 1.0];
            const spot   = new BezierCircle(gl, shaderProgram, radius, 20, color);
            const offset = [
                (Math.random() * 0.4) - 0.2,  // X
                0.05 + Math.random() * 0.15,  // Y (agak ke atas saja)
                0.05                          // Z naik sedikit
            ];
            arr.push({ spot, offset });
        }
        petalSpots.push(arr);
    }

    // BADAN
    const body = new Ellipsoid(gl, shaderProgram, 0.9, 0.9, 0.8, 40, 40, [0.4, 0.6, 0.9, 1.0]);

    // TANGAN (elliptic paraboloid)
    const leftHand  = new EllipticParaboloid(gl, shaderProgram, 0.45, 0.15, 0.25, 32, [0.4, 0.6, 0.9, 1.0]);
    const rightHand = new EllipticParaboloid(gl, shaderProgram, 0.45, 0.15, 0.25, 32, [0.4, 0.6, 0.9, 1.0]);


    // =================== KONTROL MOUSE ===================
    let rotationX = 0, rotationY = 0;
    let dragging = false, lastX, lastY;

    const canvas = gl.canvas;
    canvas.addEventListener("mousedown", (e) => { dragging = true; lastX = e.clientX; lastY = e.clientY; });
    canvas.addEventListener("mouseup",   ()  => { dragging = false; });
    canvas.addEventListener("mousemove", (e) => {
        if (!dragging) return;
        const dx = e.clientX - lastX, dy = e.clientY - lastY;
        rotationY += dx * 0.01; rotationX += dy * 0.01;
        lastX = e.clientX; lastY = e.clientY;
    });

    // ======================= RENDER =======================
    function render() {
        gl.clearColor(226/255, 198/255, 255/255, 1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        const projectionMatrix = mat4.create();
        mat4.perspective(projectionMatrix, LIBS.degToRad(45), gl.canvas.clientWidth / gl.canvas.clientHeight, 0.1, 100.0);

        let modelViewMatrix = mat4.create();
        mat4.translate(modelViewMatrix, modelViewMatrix, [0.0, 0.9, -5.0]);

        // kasih rotasi default supaya torus berdiri
        mat4.rotateX(modelViewMatrix, modelViewMatrix, LIBS.degToRad(-90));

        // baru kemudian rotasi interaktif
        mat4.rotateY(modelViewMatrix, modelViewMatrix, rotationY);
        mat4.rotateX(modelViewMatrix, modelViewMatrix, rotationX);

        // === BADAN ===
        let bodyMatrix = modelViewMatrix.slice();
        mat4.translate(bodyMatrix, bodyMatrix, [0.0, 0, -1.1]);
        mat4.rotateX(bodyMatrix, bodyMatrix, LIBS.degToRad(90));
        gl.uniformMatrix4fv(shaderProgram.uProjectionMatrix, false, projectionMatrix);
        gl.uniformMatrix4fv(shaderProgram.uModelViewMatrix, false, bodyMatrix);
        body.draw(bodyMatrix);

        // === TANGAN KIRI ===
        let leftMatrix = bodyMatrix.slice();
        mat4.translate(leftMatrix, leftMatrix, [-1.1, -0.1, 0.0]);    // geser ke kiri badan
        mat4.rotateY(leftMatrix, leftMatrix, LIBS.degToRad(0));     // putar paraboloid ke arah samping
        mat4.rotateZ(leftMatrix, leftMatrix, LIBS.degToRad(-15));    // condong sedikit ke bawah
        mat4.rotateX(leftMatrix, leftMatrix, LIBS.degToRad(-60)); 
        gl.uniformMatrix4fv(shaderProgram.uModelViewMatrix, false, leftMatrix);
        leftHand.draw();

        // === TANGAN KANAN ===
        let rightMatrix = bodyMatrix.slice();
        mat4.translate(rightMatrix, rightMatrix, [1.0, 0.0, 0.0]); // geser ke kanan badan
        mat4.rotateY(leftMatrix, leftMatrix, LIBS.degToRad(0));     // putar paraboloid ke arah samping
        mat4.rotateZ(leftMatrix, leftMatrix, LIBS.degToRad(-15));    // condong sedikit ke bawah
        mat4.rotateX(leftMatrix, leftMatrix, LIBS.degToRad(-90)); 
        gl.uniformMatrix4fv(shaderProgram.uModelViewMatrix, false, rightMatrix);
        rightHand.draw();


        // === MATA ===
        gl.disable(gl.DEPTH_TEST); // supaya mata nggak ketutup badan
        drawEye(gl, shaderProgram, bodyMatrix, -0.3, 0.3); // kiri
        drawEye(gl, shaderProgram, bodyMatrix,  0.3, 0.3); // kanan

        // === SENYUM ===
        drawSmile(gl, shaderProgram, bodyMatrix, 0.0, 0);
        gl.enable(gl.DEPTH_TEST);

        // === PUSAT BUNGA ===
        gl.uniformMatrix4fv(shaderProgram.uModelViewMatrix,  false, modelViewMatrix);
        torusOuter.draw();

        let innerMatrix = modelViewMatrix.slice();
        mat4.translate(innerMatrix, innerMatrix, [0.0, 0.0, 0.01]);
        gl.uniformMatrix4fv(shaderProgram.uModelViewMatrix, false, innerMatrix);
        torusInner.draw();

        let diskMatrix = modelViewMatrix.slice();
        mat4.translate(diskMatrix, diskMatrix, [0.0, 0.0, -0.01]);
        gl.uniformMatrix4fv(shaderProgram.uModelViewMatrix, false, diskMatrix);
        diskBottom.draw();

        let baseTopMatrix = modelViewMatrix.slice();
        mat4.translate(baseTopMatrix, baseTopMatrix, [0, 0, Z_TOP]);
        gl.uniformMatrix4fv(shaderProgram.uModelViewMatrix, false, baseTopMatrix);
        petalBaseTop.draw();

        let baseBottomMatrix = modelViewMatrix.slice();
        mat4.translate(baseBottomMatrix, baseBottomMatrix, [0, 0, Z_BOT]);
        gl.uniformMatrix4fv(shaderProgram.uModelViewMatrix, false, baseBottomMatrix);
        petalBaseBottom.draw();

        let rimMatrix = modelViewMatrix.slice();
        mat4.translate(rimMatrix, rimMatrix, [0, 0, Z_CENTER]);
        gl.uniformMatrix4fv(shaderProgram.uModelViewMatrix, false, rimMatrix);
        petalBaseRim.draw();

        // === KELOPAK ===
        
        const PETAL_RADIUS = 0.8;
        const PETAL_TILT   = LIBS.degToRad(5);

        for (let i = 0; i < PETAL_COUNT; i++) {
            const ang = (i * 2 * Math.PI) / PETAL_COUNT + Math.PI / 2 + Math.PI +  LIBS.degToRad(-25);
            let M = modelViewMatrix.slice();

            mat4.rotateZ(M, M, ang);
            mat4.translate(M, M, [PETAL_RADIUS, 0.0, -0.25]); 
            mat4.rotateY(M, M, PETAL_TILT);

            gl.uniformMatrix4fv(shaderProgram.uModelViewMatrix, false, M);
            petalTop.draw();
            petalRim.draw();

            // spots
            const spotsArr = petalSpots[i];
            for (let s = 0; s < spotsArr.length; s++) {
                const { spot, offset } = spotsArr[s];
                let S = M.slice();
                mat4.translate(S, S, offset);
                gl.uniformMatrix4fv(shaderProgram.uModelViewMatrix, false, S);
                spot.draw(S);
            }
        }

        requestAnimationFrame(render);
    }

    render();
}
window.onload = main;
