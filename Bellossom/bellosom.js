import { Ellipsoid } from "./Objects/Ellipsoid.js";
import { Capsule } from "./Objects/Capsule.js";
import { Leaf } from "./Objects/Leaf.js";
import { Toroid } from "./Objects/Toroid.js";

export class Bellossom{
    root = null;
    constructor(GL, SHADER_PROGRAM, _position, _color, _normal){
        // ======================== BAGIAN DEFINISI ===================

        //Kepala, Badan, Tangan
        var Head = new Ellipsoid(GL, SHADER_PROGRAM, _position, _color, _normal, 1.7, 1.7, 1.7, 20, 20, [0.7686, 0.8588, 0.6118]);
        var Body = new Capsule(GL, SHADER_PROGRAM, _position, _color, _normal, 1.2, 0.5, 1.2, 2, 20, 10, [0.7686, 0.8588, 0.6118]);
        var Right_Hand = new Capsule(GL, SHADER_PROGRAM, _position, _color, _normal, 0.3, 0.3, 0.3, 2, 20, 10, [0.7686, 0.8588, 0.6118]);
        var Left_Hand = new Capsule(GL, SHADER_PROGRAM, _position, _color, _normal, 0.3, 0.3, 0.3, 2, 20, 10, [0.7686, 0.8588, 0.6118]);

        //Rok Luar
        var Skirt1 = [
            [new Leaf(GL, SHADER_PROGRAM, _position, _color, _normal, 1.0, 0.8, 20, 36, [0.0, 0.7, 0.1]), -1/6],
            [new Leaf(GL, SHADER_PROGRAM, _position, _color, _normal, 1.0, 0.8, 20, 36, [0.0, 0.7, 0.1]), 1/6],
            [new Leaf(GL, SHADER_PROGRAM, _position, _color, _normal, 1.0, 0.8, 20, 36, [0.9569, 0.9059, 0.5333]), 3/6],
            [new Leaf(GL, SHADER_PROGRAM, _position, _color, _normal, 1.0, 0.8, 20, 36, [0.0, 0.7, 0.1]), 5/6],
            [new Leaf(GL, SHADER_PROGRAM, _position, _color, _normal, 1.0, 0.8, 20, 36, [0.0, 0.7, 0.1]), 7/6],
            [new Leaf(GL, SHADER_PROGRAM, _position, _color, _normal, 1.0, 0.8, 20, 36, [0.9569, 0.9059, 0.5333]), 9/6],
        ];

        //Rok Dalam
        var Skirt2 = [
            [new Leaf(GL, SHADER_PROGRAM, _position, _color, _normal, 1.0, 0.8, 20, 36, [0.9569, 0.9059, 0.5333]), 0],
            [new Leaf(GL, SHADER_PROGRAM, _position, _color, _normal, 1.0, 0.8, 20, 36, [0.0, 0.7, 0.1]), 1/3],
            [new Leaf(GL, SHADER_PROGRAM, _position, _color, _normal, 1.0, 0.8, 20, 36, [0.0, 0.7, 0.1]), 2/3],
            [new Leaf(GL, SHADER_PROGRAM, _position, _color, _normal, 1.0, 0.8, 20, 36, [0.9569, 0.9059, 0.5333]), 1],
            [new Leaf(GL, SHADER_PROGRAM, _position, _color, _normal, 1.0, 0.8, 20, 36, [0.0, 0.7, 0.1]), 4/3],
            [new Leaf(GL, SHADER_PROGRAM, _position, _color, _normal, 1.0, 0.8, 20, 36, [0.0, 0.7, 0.1]), 5/3],
        ];

        //Bunga di sisi Kepala Kiri
        var Flower_Torus1 = new Toroid(GL, SHADER_PROGRAM, _position, _color, _normal, 0.4, 0.4, 0.2, 0.2, 20, 10, [0.9921568627450981, 0.8980392156862745, 0.5058823529411764]);
        var Flower_Elipsoid1 = new Ellipsoid(GL, SHADER_PROGRAM, _position, _color, _normal, 0.4, 0.4, 0.1, 20, 20, [0.9921568627450981, 0.8980392156862745, 0.5058823529411764]);
        var Sepals1 = [
            [new Capsule(GL, SHADER_PROGRAM, _position, _color, _normal, 0.55, 0.3, 0.1, 1, 20, 10, [0.9294117647058824, 0.4549019607843137, 0.2784313725490196]), 1/5],
            [new Capsule(GL, SHADER_PROGRAM, _position, _color, _normal, 0.55, 0.3, 0.1, 1, 20, 10, [0.9294117647058824, 0.4549019607843137, 0.2784313725490196]), 3/5],
            [new Capsule(GL, SHADER_PROGRAM, _position, _color, _normal, 0.55, 0.3, 0.1, 1, 20, 10, [0.9294117647058824, 0.4549019607843137, 0.2784313725490196]), 5/5],
            [new Capsule(GL, SHADER_PROGRAM, _position, _color, _normal, 0.55, 0.3, 0.1, 1, 20, 10, [0.9294117647058824, 0.4549019607843137, 0.2784313725490196]), 7/5],
            [new Capsule(GL, SHADER_PROGRAM, _position, _color, _normal, 0.55, 0.3, 0.1, 1, 20, 10, [0.9294117647058824, 0.4549019607843137, 0.2784313725490196]), 9/5],
        ]

        //Bunga di sisi Kepala Kanan
        var Flower_Torus2 = new Toroid(GL, SHADER_PROGRAM, _position, _color, _normal, 0.4, 0.4, 0.2, 0.2, 20, 10, [0.9921568627450981, 0.8980392156862745, 0.5058823529411764]);
        var Flower_Elipsoid2 = new Ellipsoid(GL, SHADER_PROGRAM, _position, _color, _normal, 0.4, 0.4, 0.1, 20, 20, [0.9921568627450981, 0.8980392156862745, 0.5058823529411764]);
        var Sepals2 = [
            [new Capsule(GL, SHADER_PROGRAM, _position, _color, _normal, 0.55, 0.3, 0.1, 1, 20, 10, [0.9294117647058824, 0.4549019607843137, 0.2784313725490196]), 1/5],
            [new Capsule(GL, SHADER_PROGRAM, _position, _color, _normal, 0.55, 0.3, 0.1, 1, 20, 10, [0.9294117647058824, 0.4549019607843137, 0.2784313725490196]), 3/5],
            [new Capsule(GL, SHADER_PROGRAM, _position, _color, _normal, 0.55, 0.3, 0.1, 1, 20, 10, [0.9294117647058824, 0.4549019607843137, 0.2784313725490196]), 5/5],
            [new Capsule(GL, SHADER_PROGRAM, _position, _color, _normal, 0.55, 0.3, 0.1, 1, 20, 10, [0.9294117647058824, 0.4549019607843137, 0.2784313725490196]), 7/5],
            [new Capsule(GL, SHADER_PROGRAM, _position, _color, _normal, 0.55, 0.3, 0.1, 1, 20, 10, [0.9294117647058824, 0.4549019607843137, 0.2784313725490196]), 9/5],
        ]

        // Mata
        var LeftEye = new Ellipsoid(GL, SHADER_PROGRAM, _position, _color, _normal, 0.2, 0.2, 0.2, 20, 20, [0, 0, 0]);
        var RightEye = new Ellipsoid(GL, SHADER_PROGRAM, _position, _color, _normal, 0.2, 0.2, 0.2, 20, 20, [0, 0, 0]);

        // ============= END OF DEFINISI ===================

        // ============= BAGIAN HIERARKI NYA ===============
        this.root = Body;
        Body.childs.push(Head);
        Body.childs.push(Right_Hand);
        Body.childs.push(Left_Hand);
        Head.childs.push(Flower_Torus1);
        Head.childs.push(LeftEye);
        Head.childs.push(RightEye);
        Flower_Torus1.childs.push(Flower_Elipsoid1);
        Head.childs.push(Flower_Torus2);
        Flower_Torus2.childs.push(Flower_Elipsoid2);

        for (let index = 0; index < Sepals1.length; index++) {
            const element = Sepals1[index];
            Flower_Torus1.childs.push(element[0]);
        }

        for (let index = 0; index < Sepals2.length; index++) {
            const element = Sepals2[index];
            Flower_Torus2.childs.push(element[0]);
        }

        for (let index = 0; index < Skirt1.length; index++) {
            const element = Skirt1[index];
            Body.childs.push(element[0]);
        }

        for (let index = 0; index < Skirt1.length; index++) {
            const element = Skirt2[index];
            Body.childs.push(element[0]);
        }

        // ==================== END OF HIERARKI =======================

        // ==================== BAGIAN POSITIONING NYA ==================
        //Bunga sisi kiri kepala
        LIBS.translateZ(Flower_Torus1.POSITION_MATRIX, 1.7);
        var temp = LIBS.get_I4();
        LIBS.rotateY(temp, Math.PI/3);
        LIBS.rotateZ(temp,Math.PI/4.5);
        Flower_Torus1.POSITION_MATRIX = LIBS.multiply(Flower_Torus1.POSITION_MATRIX, temp);
        LIBS.translateZ(Flower_Elipsoid1.POSITION_MATRIX, -0.05);
        
        for (let index = 0; index < Sepals1.length; index++) {
            const element = Sepals1[index];
            
            LIBS.translateY(element[0].POSITION_MATRIX, -0.8);
            var temp = LIBS.get_I4();
            LIBS.rotateZ(temp, Math.PI * element[1]);
            element[0].POSITION_MATRIX = LIBS.multiply(element[0].POSITION_MATRIX, temp);
            
            LIBS.translateZ(element[0].POSITION_MATRIX, -0.1)
        }

        //Bunga sisi Kanan kepala
        LIBS.translateZ(Flower_Torus2.POSITION_MATRIX, 1.7);
        var temp = LIBS.get_I4();
        LIBS.rotateY(temp, -Math.PI/3);
        LIBS.rotateZ(temp, -Math.PI/4.5);
        Flower_Torus2.POSITION_MATRIX = LIBS.multiply(Flower_Torus2.POSITION_MATRIX, temp);
        LIBS.translateZ(Flower_Elipsoid2.POSITION_MATRIX, -0.05);
        
        for (let index = 0; index < Sepals2.length; index++) {
            const element = Sepals2[index];

            LIBS.translateY(element[0].POSITION_MATRIX, -0.8);
            var temp = LIBS.get_I4();
            LIBS.rotateZ(temp, Math.PI * element[1]);
            element[0].POSITION_MATRIX = LIBS.multiply(element[0].POSITION_MATRIX, temp);

            LIBS.translateZ(element[0].POSITION_MATRIX, -0.1)
        }

        //Kepala
        LIBS.translateY(Head.POSITION_MATRIX, 2);

        //Mata Kiri
        LIBS.translateZ(LeftEye.POSITION_MATRIX, 1.6);
        LIBS.translateY(LeftEye.POSITION_MATRIX, 0.2);
        LIBS.translateX(LeftEye.POSITION_MATRIX, 0.5);

        //Mata Kanan
        LIBS.translateZ(RightEye.POSITION_MATRIX, 1.6);
        LIBS.translateY(RightEye.POSITION_MATRIX, 0.2);
        LIBS.translateX(RightEye.POSITION_MATRIX, -0.5);

        //Tangan Kanan
        LIBS.rotateX(Right_Hand.POSITION_MATRIX, Math.PI / 2);
        LIBS.rotateY(Right_Hand.POSITION_MATRIX, -Math.PI / 3);
        LIBS.translateX(Right_Hand.POSITION_MATRIX, -1);
        LIBS.translateZ(Right_Hand.POSITION_MATRIX, 0.7);
        LIBS.translateY(Right_Hand.POSITION_MATRIX, 0.5);

        //Tangan Kiri
        LIBS.rotateX(Left_Hand.POSITION_MATRIX, Math.PI / 2);
        LIBS.rotateY(Left_Hand.POSITION_MATRIX, Math.PI / 3);
        LIBS.translateX(Left_Hand.POSITION_MATRIX, 1);
        LIBS.translateZ(Left_Hand.POSITION_MATRIX, 0.7);
        LIBS.translateY(Left_Hand.POSITION_MATRIX, 0.5);

        //Rok Luar
        for (let index = 0; index < Skirt1.length; index++) {
            const element = Skirt1[index];

            LIBS.translateZ(element[0].POSITION_MATRIX, -1.7);
            LIBS.rotateX(element[0].POSITION_MATRIX, Math.PI/6)
            LIBS.scaleX(element[0].POSITION_MATRIX, 1.3);
            var temp = LIBS.get_I4();
            LIBS.rotateY(temp, Math.PI * element[1]);
            element[0].POSITION_MATRIX = LIBS.multiply(element[0].POSITION_MATRIX, temp);

            LIBS.translateY(element[0].POSITION_MATRIX, -0.5)
        }

        //Rok Dalam
        for (let index = 0; index < Skirt2.length; index++) {
            const element = Skirt2[index];

            LIBS.translateZ(element[0].POSITION_MATRIX, -0.8);
            LIBS.rotateX(element[0].POSITION_MATRIX, Math.PI/6)
            var temp = LIBS.get_I4();
            LIBS.rotateY(temp, Math.PI * element[1]);
            element[0].POSITION_MATRIX = LIBS.multiply(element[0].POSITION_MATRIX, temp);

            LIBS.translateY(element[0].POSITION_MATRIX, -0.5)
        }

        // ======================= END OF POSITIONING =======================
    }

    setup(){
        this.root.setup();
    }

    render(Mmatrix, PARENT_MATRIX){
        this.root.render(Mmatrix, PARENT_MATRIX);
    }
}