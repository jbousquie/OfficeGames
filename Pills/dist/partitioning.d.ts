export declare class Partitioning {
    Hsize: number;
    Vsize: number;
    Hnb: number;
    Vnb: number;
    maximum: BABYLON.Vector3;
    minimum: BABYLON.Vector3;
    precision: number;
    quads: BABYLON.SolidParticle[][][];
    hBlock: number;
    vBlock: number;
    tolerance: number;
    constructor(sps: BABYLON.SolidParticleSystem, Hnb?: number, Vnb?: number);
    insertParticleInBlock(particle: BABYLON.SolidParticle, row: number, col: number): boolean;
    getBlocksAt(x: number, y: number): BABYLON.SolidParticle[];
}
