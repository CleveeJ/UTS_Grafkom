import { Badan } from "./Objects/badan.js";
import { Rambut } from "./Objects/rambut.js";
import { BolaRambut } from "./Objects/bolarambut.js";
import { Capsule } from "./Objects/Capsule.js";
import { bSplineMulut } from "./Objects/bSplineMulut.js";
import { Ellipsoid } from "./Objects/Ellipsoid.js";

export class Gloom {
    root = null;
    walk = 0;

    constructor(GL, SHADER_PROGRAM, _position, _color, _MMatrix, _normal) {

        /*================ OBJECT =================*/
        const badan = new Badan(GL, SHADER_PROGRAM, _position, _color, _MMatrix, _normal);
        const rambut = new Rambut(GL, SHADER_PROGRAM, _position, _color, _MMatrix, _normal);
        const bolarambut = new BolaRambut(GL, SHADER_PROGRAM, _position, _color, _MMatrix, _normal);

        const legKiri = new Capsule(GL, SHADER_PROGRAM, _position, _color, _normal,
            0.1, 0.1, 0.1, 0.5, 20, 10, [0.41, 0.57, 0.69]);
        const legKanan = new Capsule(GL, SHADER_PROGRAM, _position, _color, _normal,
            0.1, 0.1, 0.1, 0.5, 20, 10, [0.41, 0.57, 0.69]);

        const footKiri = new Capsule(GL, SHADER_PROGRAM, _position, _color, _normal,
            0.15, 0.15, 0.15, 1, 20, 10, [0.41, 0.57, 0.69]);
        const footKanan = new Capsule(GL, SHADER_PROGRAM, _position, _color, _normal,
            0.15, 0.15, 0.15, 1, 20, 10, [0.41, 0.57, 0.69]);

        const handKanan = new Capsule(GL, SHADER_PROGRAM, _position, _color, _normal,
            0.15, 0.15, 0.15, 1, 20, 10, [0.41, 0.57, 0.69]);
        const handKiri = new Capsule(GL, SHADER_PROGRAM, _position, _color, _normal,
            0.15, 0.15, 0.15, 1, 20, 10, [0.41, 0.57, 0.69]);

        const iler1 = new Capsule(GL, SHADER_PROGRAM, _position, _color, _normal,
            0.06, 0.06, 0.06, 0.2, 20, 10, [1, 1, 1]);

        const iler2 = new Capsule(GL, SHADER_PROGRAM, _position, _color, _normal,
            0.06, 0.06, 0.06, 0.1, 20, 10, [1, 1, 1]);

        const mulutControlPoints = [
            0, 0, -0.17, 0.01, -0.38, -0.03, -0.57, -0.07,
            -0.65, 0.03, -0.51, 0.11, -0.40, 0.14, -0.18, 0.17,
            0.18, 0.17, 0.40, 0.14, 0.51, 0.11, 0.65, 0.03,
            0.57, -0.07, 0.38, -0.03, 0.17, 0.01,
        ];

        const mulutLuar = new bSplineMulut(GL, SHADER_PROGRAM, _position, _color, _MMatrix, _normal,
            mulutControlPoints, 0.05, 20, 100, [0.53, 0.51, 0.77]
        );

        const mulutControlPointsDalam = [
            -0.0225, 0.1658, -0.3097, 0.1571, -0.4576, 0.1224,
            -0.5577, 0.0876, -0.5925, 0.0528, -0.5100, 0.1100,
            -0.4000, 0.1400, -0.1800, 0.1700, 0.1800, 0.1700,
            0.4000, 0.1400, 0.4953, 0.1137, 0.6084, 0.0615,
            0.5127, 0.1137, 0.3517, 0.1484, 0.2647, 0.1658
        ];

        const mulutDalam = new bSplineMulut(GL, SHADER_PROGRAM, _position, _color, _MMatrix, _normal,
            mulutControlPointsDalam, 0.05, 20, 100, [0.929, 0.678, 0.706]
        );

        const mataKiriControlPoints = [
            -0.1313, -0.1557, -0.2488, -0.1296, -0.3837, -0.0862,
            -0.4794, -0.0167, -0.5751, 0.2788, -0.4794, -0.0167,
            -0.3880, -0.0775, -0.2531, -0.1383, -0.1313, -0.1557, 0.0906, -0.1209
        ];

        const mataKananControlPoints = [
            0.1313, -0.1557, 0.2488, -0.1296, 0.3837, -0.0862,
            0.4794, -0.0167, 0.5751, 0.2788, 0.4794, -0.0167,
            0.3880, -0.0775, 0.2531, -0.1383, 0.1313, -0.1557, -0.0906, -0.1209
        ];

        const mataKiri = new bSplineMulut(GL, SHADER_PROGRAM, _position, _color, _MMatrix, _normal,
            mataKiriControlPoints, 0.03, 20, 100, [0.1, 0.1, 0.1]
        );

        const mataKanan = new bSplineMulut(GL, SHADER_PROGRAM, _position, _color, _MMatrix, _normal,
            mataKananControlPoints, 0.03, 20, 100, [0.1, 0.1, 0.1]
        );

        const putihbolarambutDepan = new Ellipsoid(GL, SHADER_PROGRAM, _position, _color, _normal,
            0.3, 0.3, 0.3, 20, 20, [1.0, 1.0, 1.0]);
        const putihbolarambutBelakang = new Ellipsoid(GL, SHADER_PROGRAM, _position, _color, _normal,
            0.3, 0.3, 0.3, 20, 20, [1.0, 1.0, 1.0]);
        const putihbolarambutKanan = new Ellipsoid(GL, SHADER_PROGRAM, _position, _color, _normal,
            0.3, 0.3, 0.3, 20, 20, [1.0, 1.0, 1.0]);
        const putihbolarambutKiri = new Ellipsoid(GL, SHADER_PROGRAM, _position, _color, _normal,
            0.3, 0.3, 0.3, 20, 20, [1.0, 1.0, 1.0]);

        // Hierarki
        badan.childs.push(rambut, bolarambut, legKiri, legKanan, handKanan, handKiri, mulutLuar, mulutDalam, mataKiri, mataKanan);
        legKiri.childs.push(footKiri);
        legKanan.childs.push(footKanan);
        mulutLuar.childs.push(iler1, iler2);
        bolarambut.childs.push(putihbolarambutDepan, putihbolarambutBelakang, putihbolarambutKanan, putihbolarambutKiri);

        // Simpan sebagai properti kelas
        this.badan = badan;
        this.legKiri = legKiri;
        this.legKanan = legKanan;
        this.handKanan = handKanan;
        this.handKiri = handKiri;
        this.bolarambut = bolarambut;

        /*================ TRANSFORMASI POSISI =================*/
        LIBS.translateY(legKiri.POSITION_MATRIX, -1.2);
        LIBS.translateX(legKiri.POSITION_MATRIX, -0.4);
        LIBS.translateY(legKanan.POSITION_MATRIX, -1.2);
        LIBS.translateX(legKanan.POSITION_MATRIX, 0.4);

        LIBS.rotateX(footKanan.POSITION_MATRIX, -1.5);
        LIBS.rotateY(footKanan.POSITION_MATRIX, 0.8);
        LIBS.translateX(footKanan.POSITION_MATRIX, 0.3);
        LIBS.translateY(footKanan.POSITION_MATRIX, -0.35);
        LIBS.translateZ(footKanan.POSITION_MATRIX, 0.3);

        LIBS.rotateX(footKiri.POSITION_MATRIX, -1.5);
        LIBS.rotateY(footKiri.POSITION_MATRIX, -0.8);
        LIBS.translateX(footKiri.POSITION_MATRIX, -0.3);
        LIBS.translateY(footKiri.POSITION_MATRIX, -0.35);
        LIBS.translateZ(footKiri.POSITION_MATRIX, 0.3);

        LIBS.rotateX(handKanan.POSITION_MATRIX, -1.5);
        LIBS.rotateY(handKanan.POSITION_MATRIX, -1);
        LIBS.translateX(handKanan.POSITION_MATRIX, -1.4);
        LIBS.translateY(handKanan.POSITION_MATRIX, -0.3);
        LIBS.translateZ(handKanan.POSITION_MATRIX, 0.3);

        LIBS.rotateX(handKiri.POSITION_MATRIX, -1.5);
        LIBS.rotateY(handKiri.POSITION_MATRIX, 1);
        LIBS.translateX(handKiri.POSITION_MATRIX, 1.4);
        LIBS.translateY(handKiri.POSITION_MATRIX, -0.3);
        LIBS.translateZ(handKiri.POSITION_MATRIX, 0.3);

        LIBS.translateY(mulutLuar.POSITION_MATRIX, -0.27);
        LIBS.translateZ(mulutLuar.POSITION_MATRIX, 1.31);

        LIBS.translateY(mulutDalam.POSITION_MATRIX, -0.36);
        LIBS.translateZ(mulutDalam.POSITION_MATRIX, 1.30);

        LIBS.rotateX(iler1.POSITION_MATRIX, 1.6);
        LIBS.translateY(iler1.POSITION_MATRIX, -0.08);
        LIBS.translateX(iler1.POSITION_MATRIX, 0.38);
        LIBS.rotateX(iler1.POSITION_MATRIX, 1.57);

        LIBS.rotateX(iler2.POSITION_MATRIX, 1.6);
        LIBS.translateY(iler2.POSITION_MATRIX, -0.05);
        LIBS.translateX(iler2.POSITION_MATRIX, 0.45);
        LIBS.rotateX(iler2.POSITION_MATRIX, 1.57);

        LIBS.rotateY(mataKiri.POSITION_MATRIX, 0.5);
        LIBS.translateZ(mataKiri.POSITION_MATRIX, 1.1);
        LIBS.translateY(mataKiri.POSITION_MATRIX, 0.2);
        LIBS.translateX(mataKiri.POSITION_MATRIX, 0.7);

        LIBS.rotateY(mataKanan.POSITION_MATRIX, -0.58);
        LIBS.translateZ(mataKanan.POSITION_MATRIX, 1.1);
        LIBS.translateY(mataKanan.POSITION_MATRIX, 0.2);
        LIBS.translateX(mataKanan.POSITION_MATRIX, -0.7);

        LIBS.translateY(putihbolarambutDepan.POSITION_MATRIX, 1.68);
        LIBS.translateZ(putihbolarambutDepan.POSITION_MATRIX, 1);

        LIBS.translateY(putihbolarambutBelakang.POSITION_MATRIX, 1.68);
        LIBS.translateZ(putihbolarambutBelakang.POSITION_MATRIX, -1);

        LIBS.translateX(putihbolarambutKanan.POSITION_MATRIX, 1);
        LIBS.translateY(putihbolarambutKanan.POSITION_MATRIX, 1.68);

        LIBS.translateX(putihbolarambutKiri.POSITION_MATRIX, -1);
        LIBS.translateY(putihbolarambutKiri.POSITION_MATRIX, 1.68);

        this.root = badan;
    }

    setup() {
        this.root.setup();
    }

    render(_MMatrix, PARENT_MATRIX) {
        this.walk += 0.05;

        LIBS.set_I4(this.legKiri.MOVE_MATRIX);
        LIBS.set_I4(this.legKanan.MOVE_MATRIX);
        LIBS.set_I4(this.handKanan.MOVE_MATRIX);
        LIBS.set_I4(this.handKiri.MOVE_MATRIX);
        LIBS.set_I4(this.badan.MOVE_MATRIX);

        const swing = Math.sin(this.walk) * 0.7;
        LIBS.rotateX(this.legKiri.MOVE_MATRIX, swing);
        LIBS.rotateX(this.legKanan.MOVE_MATRIX, -swing);
        LIBS.rotateX(this.handKanan.MOVE_MATRIX, -swing / 2);
        LIBS.rotateX(this.handKiri.MOVE_MATRIX, swing / 2);

        const bodyBounce = Math.abs(Math.sin(this.walk)) * 0.1;
        LIBS.translateY(this.badan.MOVE_MATRIX, bodyBounce);

        const hairScale = 1 + Math.sin(this.walk) * 0.04;
        LIBS.set_I4(this.bolarambut.MOVE_MATRIX);
        LIBS.scale(this.bolarambut.MOVE_MATRIX, [hairScale, hairScale, hairScale]);

        this.root.render(_MMatrix, PARENT_MATRIX);
    }
}