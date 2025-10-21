import { SceneObject } from "../Objects/SceneObject.js";

export class Ellipsoid extends SceneObject {
  constructor(gl, program, rx, ry, rz, stacks, slices, color) {
    const vertices = [];
    const indices = [];

    for (let i = 0; i <= stacks; i++) {
      const phi = (i * Math.PI) / stacks;
      for (let j = 0; j <= slices; j++) {
        const theta = (j * 2 * Math.PI) / slices;
        const x = rx * Math.sin(phi) * Math.cos(theta);
        const y = ry * Math.sin(phi) * Math.sin(theta);
        const z = rz * Math.cos(phi);
        vertices.push(x, y, z);
      }
    }

    for (let i = 0; i < stacks; i++) {
      for (let j = 0; j < slices; j++) {
        const first = i * (slices + 1) + j;
        const second = first + slices + 1;
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
