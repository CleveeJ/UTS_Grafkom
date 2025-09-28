class EllipticParaboloid extends SceneObject {
  constructor(gl, program, a = 1.5, b = 1.5, height = 0.5, segments = 50, color = [0.8, 0.0, 0.0, 1.0]) {
    const vertices = [];
    const indices = [];

    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * 2 * Math.PI;
      for (let j = 0; j <= segments; j++) {
        const r = j / segments;
        const x = a * r * Math.cos(theta);
        const y = b * r * Math.sin(theta);
        const z = height * r * r; // paraboloid naik ke atas

        vertices.push(x, y, z);
      }
    }

    const ringSize = segments + 1;
    for (let i = 0; i < segments; i++) {
      for (let j = 0; j < segments; j++) {
        const p1 = i * ringSize + j;
        const p2 = p1 + ringSize;
        const p3 = p2 + 1;
        const p4 = p1 + 1;

        indices.push(p1, p2, p4);
        indices.push(p2, p3, p4);
      }
    }

    super(gl, program, vertices, indices, color);
  }
}
