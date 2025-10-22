import { Ellipsoid } from "../Geometry/Ellipsoid.js";

export class Body {
  constructor(gl, program) {
    this.mesh = new Ellipsoid(gl, program, 0.9, 1.0, 0.8, 40, 40, [0.4, 0.5, 0.9, 1.0]);
/*************  ✨ Windsurf Command ⭐  *************/
/**
 * Constructor for Body class.
 * @param {WebGLRenderingContext} gl - WebGL rendering context.
/*******  669bac94-fd6e-4fc9-8913-080f3f257164  *******/  }

  draw(matrix) {
    this.mesh.draw(matrix);
  }
}
