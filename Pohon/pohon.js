import { Tabung } from "./Objects/Tabung.js";
import { Kerucut } from "./Objects/Kerucut.js";

export class Pohon {
    root = null;

    constructor(GL, SHADER_PROGRAM, _position=[0,0,0], _color=[0.4,0.25,0.1], _normal=null) {
        this.GL = GL;
        this.SHADER_PROGRAM = SHADER_PROGRAM;
        this._position = _position;
        this._color = _color;
        this._normal = _normal;

        // ===== BATANG =====
        const batang = new Tabung(GL, SHADER_PROGRAM, _position, _color, _normal, 0.25, 2, 36, [0.4, 0.25, 0.1]);

        // ===== DAUN 1 (paling atas) =====
        const daun1 = new Kerucut(GL, SHADER_PROGRAM, _position, _color, _normal, 0.6, 1.0, 36, [0.1, 0.6, 0.1]);
        daun1.MOVE_MATRIX = LIBS.get_I4();
        LIBS.translateY(daun1.MOVE_MATRIX, 1.5 + 1.0); // di atas batang

        // ===== DAUN 2 (di bawah daun1) =====
        const daun2 = new Kerucut(GL, SHADER_PROGRAM, _position, _color, _normal, 0.8, 1.2, 36, [0.1, 0.5, 0.1]);
        daun2.MOVE_MATRIX = LIBS.get_I4();
        LIBS.translateY(daun2.MOVE_MATRIX, 1.5 + 0.5); // sedikit di bawah daun1

        // ===== DAUN 3 (paling bawah) =====
        const daun3 = new Kerucut(GL, SHADER_PROGRAM, _position, _color, _normal, 1.0, 1.4, 36, [0.1, 0.4, 0.1]);
        daun3.MOVE_MATRIX = LIBS.get_I4();
        LIBS.translateY(daun3.MOVE_MATRIX, 1.5); // di atas batang tapi paling bawah dari daun

        // tambahkan daun ke batang
        batang.childs.push(daun1, daun2, daun3);

        this.root = batang;
    }

    setup() {
        this.root.setup();
    }

    render(_MMatrix, PARENT_MATRIX) {
        this.root.render(_MMatrix, PARENT_MATRIX);
    }
}
