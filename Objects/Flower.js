import { Toroid } from "../Geometry/Toroid.js";
import { Disk } from "../Geometry/Disk.js";
import { EllipticParaboloid } from "../Geometry/EllipticParaboloid.js";
import { PetalRim } from "../Geometry/PetalRim.js";
import { BezierCircle } from "../Geometry/BezierCircle.js";
import { mat4, LIBS } from "../libs.js";

export class Flower {
  constructor(gl, program) {
    this.gl = gl;
    this.program = program;

    // Bagian tengah bunga (torus dan disk)
    this.outerTorus = new Toroid(gl, program, 0.4, 0.1, 40, 40, [1.0, 0.6, 0.0, 1.0]); // oranye
    this.innerTorus = new Toroid(gl, program, 0.35, 0.05, 40, 40, [0.05, 0.05, 0.05, 1.0]); // hitam
    this.diskBottom = new Disk(gl, program, 0.3, 60, [0.55, 0.27, 0.07, 1.0]); // batang

    // Kelopak bunga (top, rim, bottom)
    const petalColor = [0.82, 0.1, 0.12, 1.0];
    this.petalTop = new EllipticParaboloid(gl, program, 0.9, 0.65, 0.12, 48, petalColor);
    this.petalRim = new PetalRim(gl, program, 0.9, 0.65, 0.12, 0.05, petalColor);
    this.petalBottom = new EllipticParaboloid(gl, program, 0.9, 0.65, 0.12, 48, petalColor);

    // Bintik putih di kelopak
    this.petalSpots = [];
    const PETAL_COUNT = 5;
    for (let i = 0; i < PETAL_COUNT; i++) {
      const spots = [];
      const spotCount = Math.floor(4 + Math.random() * 3); // 4–6 bintik
      for (let k = 0; k < spotCount; k++) {
        const radius = 0.03 + Math.random() * 0.05;
        const color = [1.0, 1.0, 1.0, 1.0];
        const circle = new BezierCircle(gl, program, radius, 20, color);
        const offset = [
          (Math.random() * 0.5) - 0.25, // X lebih tersebar
          0.05 + Math.random() * 0.1,   // Y sedikit di atas permukaan
          0.02                          // Z tipis di atas kelopak
        ];
        spots.push({ circle, offset });
      }
      this.petalSpots.push(spots);
    }
  }

  draw(baseMatrix, projectionMatrix) {
    const gl = this.gl;
    gl.uniformMatrix4fv(this.program.uProjectionMatrix, false, projectionMatrix);

    // ===== TORUS =====
    let Mouter = baseMatrix.slice();
    mat4.translate(Mouter, Mouter, [0.0, -1.05, -0.2]);
    this.outerTorus.draw(Mouter);

    let Minner = baseMatrix.slice();
    mat4.translate(Minner, Minner, [0.0, -1.05, -0.18]);
    this.innerTorus.draw(Minner);

    let Mdisk = baseMatrix.slice();
    mat4.translate(Mdisk, Mdisk, [0.0, -1.05, -0.2]);
    this.diskBottom.draw(Mdisk);

    // ===== KELOPAK =====
    const PETAL_COUNT = 5;
    const PETAL_RADIUS = 0.8;              // Lebih besar agar menutupi torus
    const PETAL_TILT = LIBS.degToRad(2);   // Hampir datar
    const PETAL_Y_OFFSET = -1.02;          // Menyesuaikan tinggi supaya nempel torus
    const PETAL_Z_FLAT = -0.18;            // Kelopak rata (tidak menukik)

    for (let i = 0; i < PETAL_COUNT; i++) {
      const ang = (i * 2 * Math.PI) / PETAL_COUNT + Math.PI / 2 + Math.PI + LIBS.degToRad(-25);
      let M = baseMatrix.slice();

      // Geser posisi kelopak sedikit ke sumbu Y agar pas dengan torus
      mat4.translate(M, M, [0.0, PETAL_Y_OFFSET, PETAL_Z_FLAT]);
      mat4.rotateZ(M, M, ang);
      mat4.translate(M, M, [PETAL_RADIUS, 0.0, -0.18]);
      mat4.rotateY(M, M, PETAL_TILT);

      // Layer kelopak (bawah → atas)
      let Mbottom = M.slice();
      for (let z = 1; z <= 5; z++) {
        let nilai_z = -z * 0.01;
        mat4.translate(Mbottom, Mbottom, [0, 0, nilai_z]); // naikkan kelopak bawah sedikit per layer
        this.petalBottom.draw(Mbottom); 
      }
    //   mat4.translate(Mbottom, Mbottom, [0, 0, -0.05]); // turunkan kelopak bawah sedikit
    //   this.petalBottom.draw(Mbottom);    
      this.petalTop.draw(M);
      this.petalRim.draw(M);

      // Bintik putih
      const spotsArr = this.petalSpots[i];
      for (let s = 0; s < spotsArr.length; s++) {
        const { circle, offset } = spotsArr[s];
        let S = M.slice();
        mat4.translate(S, S, offset);
        circle.draw(S);
      }
    }
  }
}
