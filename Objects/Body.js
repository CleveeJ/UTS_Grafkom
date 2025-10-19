import { Ellipsoid } from "../Geometry/Ellipsoid.js";

export class Body {
  constructor(gl, program) {
    this.mesh = new Ellipsoid(gl, program, 0.9, 1.0, 0.8, 40, 40, [0.4, 0.6, 0.9, 1.0]);
  }

  draw(matrix) {
    this.mesh.draw(matrix);
  }
}
