import { mat4, LIBS } from "../libs.js";
import { Body } from "./Body.js";
import { Flower } from "./Flower.js";
import { Mata } from "./Mata.js";
import { Smile } from "./Smile.js";
import { Hand } from "./Hand.js";
import { FootRight } from "./FootRight.js";
import { FootLeft } from "./FootLeft.js";

export class Character {
  constructor(gl, program) {
    this.gl = gl;
    this.program = program;

    // Komponen utama karakter
    this.body = new Body(gl, program);
    this.bunga = new Flower(gl, program);
    this.mata = new Mata(gl, program);
    this.senyum = new Smile(gl, program);

    // Warna biru lembut untuk anggota tubuh
    const limbColor = [0.3, 0.4, 0.9, 1.0];

    // === ANGGOTA TUBUH ===
    this.handLeft = new Hand(gl, program, 0.12, 0.6, limbColor);
    this.handRight = new Hand(gl, program, 0.12, 0.6, limbColor);
    this.footLeft = new FootLeft(gl, program, 0.12, 0.8, limbColor);
    this.footRight = new FootRight(gl, program, 0.12, 0.8, limbColor);
  }

  draw(baseMatrix, projectionMatrix) {
    const gl = this.gl;

    // ===== BADAN =====
    let bodyMatrix = baseMatrix.slice();
    mat4.translate(bodyMatrix, bodyMatrix, [0, 0, -1.2]);
    mat4.rotateX(bodyMatrix, bodyMatrix, LIBS.degToRad(90));
    this.body.draw(bodyMatrix, projectionMatrix);

    // ===== MATA =====
    this.mata.draw(bodyMatrix, projectionMatrix);

    // ===== SENYUM =====
    this.senyum.draw(bodyMatrix, projectionMatrix);

    // ===== BUNGA DI ATAS KEPALA =====
    let flowerMatrix = baseMatrix.slice();
    mat4.translate(flowerMatrix, flowerMatrix, [0, 1.1, 0]);
    this.bunga.draw(flowerMatrix, projectionMatrix);

    // ===== TANGAN KIRI =====
    let handL = bodyMatrix.slice();
    mat4.translate(handL, handL, [-1.0, 0, 0.0]);  // geser ke kiri
    mat4.rotateZ(handL, handL, LIBS.degToRad(-90));
    mat4.rotateX(handL, handL, LIBS.degToRad(60));
    this.handLeft.draw(handL);

    // ===== TANGAN KANAN =====
    let handR = bodyMatrix.slice();
    mat4.translate(handR, handR, [1.0, 0, 0.0]);  // geser ke kanan
    mat4.rotateZ(handR, handR, LIBS.degToRad(90));
    mat4.rotateX(handR, handR, LIBS.degToRad(60));
    this.handRight.draw(handR);

    // ===== KAKI KIRI =====
    let footL = bodyMatrix.slice();
    mat4.translate(footL, footL, [-0.4, -1.0, 0.0]); // bawah kiri
    mat4.rotateZ(footL, footL, LIBS.degToRad(-10));
    this.footLeft.draw(footL);

    // ===== KAKI KANAN =====
    let footR = bodyMatrix.slice();
    mat4.translate(footR, footR, [0.4, -1.0, 0.0]); // bawah kanan
    mat4.rotateZ(footR, footR, LIBS.degToRad(10));
    this.footRight.draw(footR);
  }
}
