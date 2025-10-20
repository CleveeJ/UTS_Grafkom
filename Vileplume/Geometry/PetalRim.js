import { SceneObject } from "../Objects/SceneObject.js";

export class PetalRim extends SceneObject {
  constructor(gl, program, radiusX, radiusY, height, thickness, color) {
    // Bikin geometri rim (cincin elips)
    const segments = 64;
    const vertices = [];
    const indices = [];

    const outerZ = height;          // bagian atas kelopak
    const innerZ = height - thickness; // sisi bawah (menutup tepi)
    const innerScale = 0.9;         // radius bagian dalam (sedikit mengecil)

    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * 2 * Math.PI;
      const cos = Math.cos(theta);
      const sin = Math.sin(theta);

      const xOuter = radiusX * cos;
      const yOuter = radiusY * sin;
      const xInner = radiusX * innerScale * cos;
      const yInner = radiusY * innerScale * sin;

      // dua vertex per sisi: luar dan dalam
      vertices.push(xOuter, yOuter, outerZ); // luar atas
      vertices.push(xInner, yInner, innerZ); // dalam bawah
    }

    // Buat indeks quad strip
    for (let i = 0; i < segments; i++) {
      const a = i * 2;
      const b = a + 1;
      const c = a + 2;
      const d = a + 3;

      // segitiga pertama
      indices.push(a, b, c);
      // segitiga kedua
      indices.push(b, d, c);
    }

    // Panggil SceneObject agar buffer dan draw function berfungsi
    super(gl, program, vertices, indices, color);
  }
}
