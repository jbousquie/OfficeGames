export class Partitioning {
    public Hsize: number;
    public Vsize: number;
    public Hnb: number = 10;
    public Vnb: number = 10;
    public maximum: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    public minimum: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    public precision: number = 1.0;
    public quads: BABYLON.SolidParticle[][][] = [];
    public hBlock: number;
    public vBlock: number;
    public tolerance: number = 0.1;

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
        this.hBlock = hBlock;
        this.vBlock = vBlock;
        const quads = this.quads;

        const vertex0 = BABYLON.Vector3.Zero();
        const vertex1  = BABYLON.Vector3.Zero();
        const vertex2  = BABYLON.Vector3.Zero();
        const vertex3  = BABYLON.Vector3.Zero();
        const vertex4  = BABYLON.Vector3.Zero();
        const vertex5  = BABYLON.Vector3.Zero();
        const vertex6  = BABYLON.Vector3.Zero();
        const vertex7  = BABYLON.Vector3.Zero();
        const vertices = [vertex0, vertex1, vertex2, vertex3, vertex4, vertex5, vertex6, vertex7];
        const tolerance = this.tolerance;
        const downTolerance = 1 - tolerance;
        const upTolerance = 1 + tolerance;

        for (let i = 0; i < sps.nbParticles; i++) {
            let particle = sps.particles[i];
            let particleBBox = particle._boundingInfo.boundingBox;
            let sizeX = particleBBox.maximum.x - particleBBox.minimum.x;
            let sizeY = particleBBox.maximum.y - particleBBox.minimum.y;
            let sizeZ = particleBBox.maximum.z - particleBBox.minimum.z;

            vertex0.copyFrom(particleBBox.minimum);
            vertex1.copyFrom(vertex0);
            vertex2.copyFrom(vertex0);
            vertex3.copyFrom(vertex0);
            vertex4.copyFrom(vertex0);
            vertex5.copyFrom(vertex0);
            vertex6.copyFrom(vertex0);
            vertex7.copyFrom(vertex0);
            vertex1.addInPlaceFromFloats(sizeX, 0, 0);
            vertex2.addInPlaceFromFloats(0, sizeY, 0);
            vertex3.addInPlaceFromFloats(0, 0, sizeZ);
            vertex4.addInPlaceFromFloats(sizeX, sizeY, 0);
            vertex5.addInPlaceFromFloats(sizeX, 0, sizeZ);
            vertex6.addInPlaceFromFloats(0, sizeY, sizeZ);
            vertex7.addInPlaceFromFloats(sizeX, sizeY, sizeZ);

            for (let v = 0; v < vertices.length; v++) {
                let vert = vertices[v];
                let x = vert.x;
                let y = vert.y;
                let row = Math.floor((x - hMin) * hBlock);
                let col = Math.floor((y - vMin) * vBlock);
                this.insertParticleInBlock(particle, row, col);  
                
                let xDown = x * downTolerance;
                let xUp = x *upTolerance;
                let yDown = y * downTolerance;
                let yUp = y * upTolerance;
                let rowDown = Math.floor((xDown - hMin) * hBlock);
                let rowUp = Math.floor((xUp - hMin) * hBlock);
                let colDown = Math.floor((yDown - vMin) * vBlock);
                let colUp = Math.floor((yUp - vMin) * vBlock);
                this.insertParticleInBlock(particle, row, colDown);
                this.insertParticleInBlock(particle, row, colUp);  
                this.insertParticleInBlock(particle, rowDown, col);
                this.insertParticleInBlock(particle, rowDown, colDown);  
                this.insertParticleInBlock(particle, rowDown, colUp);  
                this.insertParticleInBlock(particle, rowUp, col);  
                this.insertParticleInBlock(particle, rowUp, colDown);  
                this.insertParticleInBlock(particle, rowUp, colUp);  
            }
        }
    }

    insertParticleInBlock(particle: BABYLON.SolidParticle, row: number, col: number): boolean {
        const quads = this.quads;
        if (!quads[row]) {
            quads[row] = [];
        }
        if (!quads[row][col]) {
            quads[row][col] = [];
        }
        const idx = particle.idx;
        let alreadyStored = false;
        let i = 0;
        const quad = quads[row][col];
        while (!alreadyStored && i < quad.length) {
            let currentPart = quad[i];
            if (currentPart.idx == idx) {
                alreadyStored = true;
            }
            i++;
        }
        if (!alreadyStored) {
            quad.push(particle);
        }
        return alreadyStored;
    }

    getBlocksAt(x: number, y: number): BABYLON.SolidParticle[] {
        const quads = this.quads;
        const row = Math.floor((x - this.minimum.x) * this.hBlock);
        const col = Math.floor((y - this.minimum.y) * this.vBlock);
        if (quads[row] && quads[row][col]) {
            return quads[row][col]
        }
        return null;
    }
}