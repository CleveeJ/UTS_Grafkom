import { Ellipsoid } from "./Ellipsoid.js";
export class Body {
  constructor(GL, SHADER_PROGRAM, _position, _color) {
    // Buat badan utama (ellipsoid)
    this.mesh = new Ellipsoid(
      GL,
      SHADER_PROGRAM,
      _position,
      _color,
      0.9, // rx
      1.0, // ry
      0.8, // rz
      40,  // stacks
      40,  // slices
      [0.4, 0.5, 0.9] // warna badan
    );
    LIBS.translateZ(this.mesh.POSITION_MATRIX, 0.1);
    LIBS.rotateX(this.mesh.POSITION_MATRIX, LIBS.degToRad(90));
  }

  setup() {
    this.mesh.setup();
  }

  render(_MMatrix, parentMatrix) {
    // panggil render dari mesh utama
    this.mesh.render(_MMatrix, parentMatrix ?? LIBS.get_I4());
  }
}
