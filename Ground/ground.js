import { Hemisphere } from "./Objects/Hemisphere.js";

export class Ground{
    root = null;
    constructor(GL, SHADER_PROGRAM, _position, _color, _normal){
        const hemisphere = new Hemisphere(GL, SHADER_PROGRAM, _position, _color, _normal, 
            3, 2, 3, // radius x, y, z
            40, 40,
            [0.55, 0.27, 0.07], // coklat (kubah)
            [0.13, 0.55, 0.13]  // hijau (rumput)
        );
        LIBS.rotateX(hemisphere.POSITION_MATRIX, Math.PI);
        this.root = hemisphere;
    }

    setup(){
        this.root.setup();
    }

    render(Mmatrix, PARENT_MATRIX){
        this.root.render(Mmatrix, PARENT_MATRIX);
    }
}