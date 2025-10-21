import { SceneObject } from "../Objects/SceneObject.js";

export class Cylinder extends SceneObject {
  constructor(
    gl,
    program,
    radiusTop = 0.5,
    radiusBottom = 0.5,
    height = 1.0,
    segments = 32,
    color = [0.2, 0.2, 0.8, 1.0]
  ) {
    const vertices = [];
    const indices = [];

    // Buat titik lingkaran atas & bawah
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * 2 * Math.PI;
      const cos = Math.cos(theta);
      const sin = Math.sin(theta);

      const xTop = radiusTop * cos;
      const yTop = radiusTop * sin;
      const xBottom = radiusBottom * cos;
      const yBottom = radiusBottom * sin;

      const zTop = height / 2;
      const zBottom = -height / 2;

      // titik atas & bawah
      vertices.push(xTop, yTop, zTop);
      vertices.push(xBottom, yBottom, zBottom);
    }

    // Sambungkan sisi antar titik
    for (let i = 0; i < segments * 2; i += 2) {
      indices.push(i, i + 1, i + 2);
      indices.push(i + 1, i + 3, i + 2);
    }

    super(gl, program, vertices, indices, color);
    this.height = height; // simpan tinggi untuk referensi transformasi
  }
}
