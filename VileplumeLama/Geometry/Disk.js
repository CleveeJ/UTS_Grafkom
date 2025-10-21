import { SceneObject } from "../Objects/SceneObject.js";

export class Disk extends SceneObject {
  constructor(gl, program, radius, segments, color) {
    const vertices = [0, 0, 0];
    const indices = [];

    for (let i = 0; i <= segments; i++) {
      const angle = (i * 2 * Math.PI) / segments;
      vertices.push(radius * Math.cos(angle), radius * Math.sin(angle), 0);
      if (i > 0) indices.push(0, i, i + 1);
    }

    super(gl, program, vertices, indices, color);
  }

  draw(matrix) {
    super.draw(matrix);
  }
}
