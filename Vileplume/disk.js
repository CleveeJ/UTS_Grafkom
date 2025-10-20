class Disk extends SceneObject {
  constructor(gl, program, radius = 0.5, segments = 40, color = [0.87, 0.65, 0.25, 1.0]) {
    const vertices = [0, 0, 0]; // titik pusat
    const indices = [];

    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * 2 * Math.PI;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      vertices.push(x, y, 0);
    }

    for (let i = 1; i <= segments; i++) {
      indices.push(0, i, i + 1);
    }

    super(gl, program, vertices, indices, color);
  }
}
