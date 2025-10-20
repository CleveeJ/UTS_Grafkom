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
    this.flower = new Flower(gl, program);
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

  draw(baseMatrix, projectionMatrix, time = 0) {
    const gl = this.gl;

    // ===== ambil sudut miring sinkron dengan bunga =====
    const tilt = Math.sin(time * 0.5) * 0.1; // arah sama dgn bunga
    const floatY = Math.sin(time * 0.8) * 0.05; // naik-turun halus

    // ===== BADAN =====
    let bodyMatrix = baseMatrix.slice();
    mat4.translate(bodyMatrix, bodyMatrix, [0, floatY, -1.25]);
    mat4.rotateX(bodyMatrix, bodyMatrix, LIBS.degToRad(90));
    // mat4.rotateZ(bodyMatrix, bodyMatrix, -tilt); // miring sama arah dgn bunga
    this.body.draw(bodyMatrix, projectionMatrix);

    // ===== MATA =====
    this.mata.draw(bodyMatrix, projectionMatrix, time);

    // ===== SENYUM =====
    this.senyum.draw(bodyMatrix, projectionMatrix);

    // ===== BUNGA =====
    let flowerMatrix = baseMatrix.slice();
    mat4.translate(flowerMatrix, flowerMatrix, [0, 1.1 + floatY, 0]);
    mat4.rotateZ(flowerMatrix, flowerMatrix, tilt); // ikut arah badan
    this.flower.draw(flowerMatrix, projectionMatrix, time);

    // ===== TANGAN KIRI =====
    let handL = bodyMatrix.slice();
    mat4.translate(handL, handL, [-1.0, 0, 0.0]);
    mat4.rotateZ(handL, handL, LIBS.degToRad(-90));
    mat4.rotateX(handL, handL, LIBS.degToRad(60));
    this.handLeft.draw(handL, projectionMatrix);

    // ===== TANGAN KANAN =====
    let handR = bodyMatrix.slice();
    mat4.translate(handR, handR, [1.0, 0, 0.0]);
    mat4.rotateZ(handR, handR, LIBS.degToRad(90));
    mat4.rotateX(handR, handR, LIBS.degToRad(60));
    this.handRight.draw(handR, projectionMatrix);

    // ===== KAKI KIRI =====
    let footL = bodyMatrix.slice();
    mat4.translate(footL, footL, [-0.4, -1.0, 0.0]);
    mat4.rotateZ(footL, footL, LIBS.degToRad(-10));
    this.footLeft.draw(footL, projectionMatrix);

    // ===== KAKI KANAN =====
    let footR = bodyMatrix.slice();
    mat4.translate(footR, footR, [0.4, -1.0, 0.0]);
    mat4.rotateZ(footR, footR, LIBS.degToRad(10));
    this.footRight.draw(footR, projectionMatrix);
  }
}
