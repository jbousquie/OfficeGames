export declare class Partitioning {
    Hsize: number;
    Vsize: number;
    Hnb: number;
    Vnb: number;
    maximum: BABYLON.Vector3;
    minimum: BABYLON.Vector3;
    precision: number;
    quads: BABYLON.SolidParticle[][][];
    constructor(sps: BABYLON.SolidParticleSystem, Hnb?: number, Vnb?: number);
}
