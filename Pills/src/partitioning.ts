export class Partitioning {
    public Hsize: number;
    public Vsize: number;
    public Hnb: number = 10;
    public Vnb: number = 10;
    public maximum: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    public minimum: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    public precision: number = 1.0;
    public quads: BABYLON.SolidParticle[][][] = [];

    constructor(sps: BABYLON.SolidParticleSystem, Hnb?: number, Vnb?: number) {
        const bBox = sps.mesh.getBoundingInfo().boundingBox;
        bBox.minimum.scaleToRef(this.precision, this.minimum);
        bBox.maximum.scaleToRef(this.precision, this.maximum);
        const hMin = this.minimum.x;
        const hMax = this.maximum.x;
        const vMin = this.minimum.y;
        const vMax = this.maximum.y;
        this.Hsize = hMax - hMin;
        this.Vsize = vMax - vMin;
        if (Hnb) {
            this.Hnb = Hnb;
        }
        if (Vnb) {
            this.Vnb = Vnb;
        }
        const hBlock = Hnb / this.Hsize;
        const vBlock = Vnb / this.Vsize;
        const quads = this.quads;

        for (let i = 0; i < sps.nbParticles; i++) {
            let particle = sps.particles[i];
            let particleBBox = particle._boundingInfo.boundingBox;
            let rowMin = Math.floor((particleBBox.minimum.x - hMin) * hBlock);
            let colMin = Math.floor((particleBBox.minimum.y - vMin) * vBlock);
            let rowMax = Math.floor((particleBBox.maximum.x - hMin) * hBlock);
            let colMax = Math.floor((particleBBox.maximum.y - vMin) * vBlock);
            if (!quads[rowMin]) {
                quads[rowMin] = [];
            }
            if (!quads[rowMin][colMin]) {
                quads[rowMin][colMin] = [];
            }
            quads[rowMin][colMin].push(particle);
            if (rowMax != rowMin || colMax != colMin) {
                if (!quads[rowMax]) {
                    quads[rowMax] = [];
                }
                if (!quads[rowMax][colMax]) {
                    quads[rowMax][colMax] = [];
                }
                quads[rowMax][colMax].push(particle);
            }
        }
    }
}