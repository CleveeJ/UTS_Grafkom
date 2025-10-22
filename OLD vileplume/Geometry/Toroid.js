import { SceneObject } from "../Objects/SceneObject.js";

export class Toroid extends SceneObject {
  constructor(gl, program, majorR, minorR, majorSeg, minorSeg, color) {
    const vertices = [];
    const indices = [];

    for (let i = 0; i <= majorSeg; i++) {
      const phi = (i * 2 * Math.PI) / majorSeg;
      for (let j = 0; j <= minorSeg; j++) {
        const theta = (j * 2 * Math.PI) / minorSeg;
        const x = (majorR + minorR * Math.cos(theta)) * Math.cos(phi);
        const y = (majorR + minorR * Math.cos(theta)) * Math.sin(phi);
        const z = minorR * Math.sin(theta);
        vertices.push(x, y, z);
      }
    }

    for (let i = 0; i < majorSeg; i++) {
      for (let j = 0; j < minorSeg; j++) {
        const first = i * (minorSeg + 1) + j;
        const second = first + minorSeg + 1;
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
