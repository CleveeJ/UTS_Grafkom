import { SceneObject } from "../Objects/SceneObject.js";

export class EllipticParaboloid extends SceneObject {
  constructor(gl, program, a, b, h, segments, color) {
    const vertices = [];
    const indices = [];

    for (let i = 0; i <= segments; i++) {
      const r = i / segments;
      const z = h * r * r;
      for (let j = 0; j <= segments; j++) {
        const theta = (j * 2 * Math.PI) / segments;
        const x = a * r * Math.cos(theta);
        const y = b * r * Math.sin(theta);
        vertices.push(x, y, z);
      }
    }

    for (let i = 0; i < segments; i++) {
      for (let j = 0; j < segments; j++) {
        const first = i * (segments + 1) + j;
        const second = first + segments + 1;
        indices.push(first, second, first + 1);
        indices.push(second, second + 1, first + 1);
      }
    }

    super(gl, program, vertices, indices, color);
  }

  draw(matrix) {
    super.draw(matrix);
  }
}
