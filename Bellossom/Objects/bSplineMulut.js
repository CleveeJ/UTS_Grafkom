function generateClosedBSpline(controlPoints, m, degree = 3) {
  const n_base = controlPoints.length / 2;
  const extendedPoints = [...controlPoints];
  for (let i = 0; i < degree; i++) {
    extendedPoints.push(controlPoints[2 * i], controlPoints[2 * i + 1]);
  }

  const n = (extendedPoints.length / 2) - 1;
  const curvePoints = [];
  const knotCount = n + degree + 2;
  const knots = [];
  for (let i = 0; i < knotCount; i++) knots.push(i);

  function N(i, p, t) {
    if (p === 0) return (knots[i] <= t && t < knots[i + 1]) ? 1 : 0;
    let left = 0, right = 0;
    if (knots[i + p] !== knots[i])
      left = ((t - knots[i]) / (knots[i + p] - knots[i])) * N(i, p - 1, t);
    if (knots[i + p + 1] !== knots[i + 1])
      right = ((knots[i + p + 1] - t) / (knots[i + p + 1] - knots[i + 1])) * N(i + 1, p - 1, t);
    return left + right;
  }

  const t_start = knots[degree];
  const t_end = knots[n_base + degree];

  for (let j = 0; j <= m; j++) {
    const t_param = j / m;
    const t = t_start + t_param * (t_end - t_start);
    let x = 0, y = 0;
    for (let i = 0; i <= n; i++) {
      const coeff = N(i, degree, t);
      x += coeff * extendedPoints[2 * i];
      y += coeff * extendedPoints[2 * i + 1];
    }
    curvePoints.push(x, y);
  }
  return curvePoints;
}

// =================================================
// B-Spline 3D (z bisa diubah sesuai keinginan)
// =================================================
function generateClosedBSplineWithDepth(controlPoints, m, degree = 3) {
  const baseCurve = generateClosedBSpline(controlPoints, m, degree);
  const curveWithDepth = [];
  const len = baseCurve.length / 2;

  for (let i = 0; i < len; i++) {
    const x = baseCurve[i * 2];
    const y = baseCurve[i * 2 + 1];
    const z = -0.4 * Math.pow(x, 2); // bentuk sedikit melengkung ke dalam
    curveWithDepth.push([x, y, z]);
  }
  return curveWithDepth;
}

// =================================================
// Tabung 3D + Ujung Tertutup Bulat (sosis style)
// =================================================
function generateSosisGeometry3D(spinePoints3D, radius, segments, stacks = 10) {
  const vertices = [];
  const indices = [];
  const spineLength = spinePoints3D.length;

  // ---- BAGIAN TUBE UTAMA ----
  for (let i = 0; i < spineLength; i++) {
    const [x1, y1, z1] = spinePoints3D[i];
    let tangent = [0, 0, 1];

    if (i < spineLength - 1) {
      const [x2, y2, z2] = spinePoints3D[i + 1];
      tangent = [x2 - x1, y2 - y1, z2 - z1];
    } else {
      const [x0, y0, z0] = spinePoints3D[i - 1];
      tangent = [x1 - x0, y1 - y0, z1 - z0];
    }

    const tLen = Math.sqrt(tangent[0] ** 2 + tangent[1] ** 2 + tangent[2] ** 2);
    tangent = tangent.map(v => v / tLen);

    let normal = [0, 1, 0];
    if (Math.abs(tangent[1]) > 0.9) normal = [1, 0, 0];

    const binormal = [
      tangent[1] * normal[2] - tangent[2] * normal[1],
      tangent[2] * normal[0] - tangent[0] * normal[2],
      tangent[0] * normal[1] - tangent[1] * normal[0]
    ];
    const bLen = Math.sqrt(binormal[0] ** 2 + binormal[1] ** 2 + binormal[2] ** 2);
    for (let k = 0; k < 3; k++) binormal[k] /= bLen;

    // pastikan normal ortogonal
    normal = [
      binormal[1] * tangent[2] - binormal[2] * tangent[1],
      binormal[2] * tangent[0] - binormal[0] * tangent[2],
      binormal[0] * tangent[1] - binormal[1] * tangent[0]
    ];

    for (let j = 0; j <= segments; j++) {
      const angle = (j / segments) * 2 * Math.PI;
      const cx = radius * Math.cos(angle), cy = radius * Math.sin(angle);

      const vx = x1 + cx * normal[0] + cy * binormal[0];
      const vy = y1 + cx * normal[1] + cy * binormal[1];
      const vz = z1 + cx * normal[2] + cy * binormal[2];
      vertices.push(vx, vy, vz);
    }
  }

  const ringVerts = segments + 1;
  for (let i = 0; i < spineLength - 1; i++) {
    for (let j = 0; j < segments; j++) {
      const a = i * ringVerts + j;
      const b = a + ringVerts;
      indices.push(a, b, a + 1);
      indices.push(b, b + 1, a + 1);
    }
  }

  // ---- BAGIAN UJUNG BULAT (HEMISPHERE) ----
  const addHemisphere = (center, tangentDir, invert = false) => {
    const baseIndex = vertices.length / 3;
    for (let i = 0; i <= stacks; i++) {
      const phi = (Math.PI / 2) * (i / stacks);
      const sinPhi = Math.sin(phi);
      const cosPhi = Math.cos(phi);

      for (let j = 0; j <= segments; j++) {
        const theta = (j / segments) * 2 * Math.PI;
        const x = radius * cosPhi * Math.cos(theta);
        const y = radius * cosPhi * Math.sin(theta);
        const z = radius * sinPhi * (invert ? -1 : 1);

        // orientasi hemisphere sesuai tangent
        const vx = center[0] + x;
        const vy = center[1] + y;
        const vz = center[2] + z * (invert ? -1 : 1);
        vertices.push(vx, vy, vz);
      }
    }

    // sambungkan hemisphere dengan tabung
    for (let i = 0; i < stacks; i++) {
      for (let j = 0; j < segments; j++) {
        const a = baseIndex + i * (segments + 1) + j;
        const b = a + (segments + 1);
        indices.push(a, b, a + 1);
        indices.push(b, b + 1, a + 1);
      }
    }
  };

  addHemisphere(spinePoints3D[0], [0, 0, -1], true); // depan
  addHemisphere(spinePoints3D[spineLength - 1], [0, 0, 1], false); // belakang

  return { vertices, indices };
}

// =================================================
// 🔹 Class utama (mulut/sosis)
// =================================================
export class bSplineMulut {
  GL = null; SHADER_PROGRAM = null; _position = null; _color = null; _normal = null;
  OBJECT_VERTEX = null; OBJECT_FACES = null;
  vertex = []; faces = [];
  MODEL_MATRIX = LIBS.get_I4();
  POSITION_MATRIX = LIBS.get_I4();
  MOVE_MATRIX = LIBS.get_I4();
  childs = [];

  constructor(GL, SHADER_PROGRAM, _position, _color, _normal,
              controlPoints, radius = 0.05, segments = 16,
              curveDetail = 200, colorValue = [1, 1, 1]) {
    this.GL = GL;
    this.SHADER_PROGRAM = SHADER_PROGRAM;
    this._position = _position;
    this._color = _color;
    this._normal = _normal;
    this.controlPoints = controlPoints;
    this.radius = radius;
    this.segments = segments;
    this.curveDetail = curveDetail;
    this.colorValue = colorValue;
    this._generateGeometry();
  }

  _generateGeometry() {
  const curve3D = generateClosedBSplineWithDepth(this.controlPoints, this.curveDetail, 3);
  const geom = generateSosisGeometry3D(curve3D, this.radius, this.segments);

  const vertices = geom.vertices;
  const indices = geom.indices;
  const normals = new Array(vertices.length).fill(0);

  // --- Hitung normal per-face dan akumulasikan ke setiap vertex ---
  for (let i = 0; i < indices.length; i += 3) {
    const ia = indices[i];
    const ib = indices[i + 1];
    const ic = indices[i + 2];

    const ax = vertices[ia * 3 + 0], ay = vertices[ia * 3 + 1], az = vertices[ia * 3 + 2];
    const bx = vertices[ib * 3 + 0], by = vertices[ib * 3 + 1], bz = vertices[ib * 3 + 2];
    const cx = vertices[ic * 3 + 0], cy = vertices[ic * 3 + 1], cz = vertices[ic * 3 + 2];

    // vektor tepi
    const Ux = bx - ax, Uy = by - ay, Uz = bz - az;
    const Vx = cx - ax, Vy = cy - ay, Vz = cz - az;

    // 🔹 balik arah normal (V × U, bukan U × V)
    const Nx = Vy * Uz - Vz * Uy;
    const Ny = Vz * Ux - Vx * Uz;
    const Nz = Vx * Uy - Vy * Ux;

    // akumulasi ke tiga vertex
    normals[ia * 3 + 0] += Nx; normals[ia * 3 + 1] += Ny; normals[ia * 3 + 2] += Nz;
    normals[ib * 3 + 0] += Nx; normals[ib * 3 + 1] += Ny; normals[ib * 3 + 2] += Nz;
    normals[ic * 3 + 0] += Nx; normals[ic * 3 + 1] += Ny; normals[ic * 3 + 2] += Nz;
  }

  // --- Normalisasi setiap normal vertex ---
  for (let i = 0; i < normals.length; i += 3) {
    const nx = normals[i];
    const ny = normals[i + 1];
    const nz = normals[i + 2];
    const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1.0;
    normals[i] = nx / len;
    normals[i + 1] = ny / len;
    normals[i + 2] = nz / len;
  }

  // --- Gabungkan posisi + normal + warna jadi 1 array (interleaved) ---
  this.vertex = [];
  for (let i = 0; i < vertices.length / 3; i++) {
    this.vertex.push(
      vertices[i * 3 + 0], vertices[i * 3 + 1], vertices[i * 3 + 2], // posisi
      normals[i * 3 + 0],  normals[i * 3 + 1],  normals[i * 3 + 2],  // normal
      this.colorValue[0],  this.colorValue[1],  this.colorValue[2]   // warna
    );
  }

  this.faces = indices;
}


  setup() {
    const GL = this.GL;
    this.OBJECT_VERTEX = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, this.OBJECT_VERTEX);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(this.vertex), GL.STATIC_DRAW);

    this.OBJECT_FACES = GL.createBuffer();
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.OBJECT_FACES);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.faces), GL.STATIC_DRAW);

    this.childs.forEach(c => c.setup());
  }

  render(_MMatrix, parentMatrix) {
    const GL = this.GL;
    this.MODEL_MATRIX = LIBS.multiply(LIBS.multiply(this.MOVE_MATRIX, this.POSITION_MATRIX), parentMatrix);

    GL.useProgram(this.SHADER_PROGRAM);
    GL.uniformMatrix4fv(_MMatrix, false, this.MODEL_MATRIX);

    GL.bindBuffer(GL.ARRAY_BUFFER, this.OBJECT_VERTEX);
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.OBJECT_FACES);

    const stride = 9 * 4; // 9 floats = 36 bytes
    GL.vertexAttribPointer(this._position, 3, GL.FLOAT, false, stride, 0);
    GL.vertexAttribPointer(this._normal,   3, GL.FLOAT, false, stride, 4 * 3);
    GL.vertexAttribPointer(this._color,    3, GL.FLOAT, false, stride, 4 * 6);

    GL.enableVertexAttribArray(this._position);
    GL.enableVertexAttribArray(this._normal);
    GL.enableVertexAttribArray(this._color);

    GL.drawElements(GL.TRIANGLES, this.faces.length, GL.UNSIGNED_SHORT, 0);

    this.childs.forEach(c => c.render(_MMatrix, this.MODEL_MATRIX));
  }
}
