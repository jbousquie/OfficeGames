import { MazeScene } from "./mazeScene";
import { Partitioning } from "./partitioning";

export class Player {
    public mesh: BABYLON.Mesh;
    public mazeScence: MazeScene;
    public size: number;
    public direction: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    public min: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    public max: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    private tmpPosition: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    private tmpMin: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    private tmpMax: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    public partitioning: Partitioning;
    public alive: boolean = true;
    public speed: number = 30;
    public velocity: BABYLON.Vector3 = BABYLON.Vector3.Zero();


    constructor(size: number, mazeScene: MazeScene) {
        this.mazeScence = mazeScene;
        this.partitioning = mazeScene.partitioning;
        this.size = size;
        const scene = mazeScene.BJSScene;
        const playerMesh = BABYLON.MeshBuilder.CreateBox("player", {size: size}, scene);
        this.mesh = playerMesh;

        const bBox = playerMesh.getBoundingInfo().boundingBox;
        this.min.copyFrom(bBox.minimum);
        this.max.copyFrom(bBox.maximum);

        const x = mazeScene.playerInitialPosition.x;
        const y = mazeScene.playerInitialPosition.y;
        playerMesh.position.copyFromFloats(x, y, 0);

        const eventType = BABYLON.KeyboardEventTypes;
        scene.onKeyboardObservable.add((kbInfo) => {
            switch (kbInfo.type) {
                case eventType.KEYDOWN:
                    const keyCode = kbInfo.event.keyCode;
                    switch (keyCode) {
                        case 38:    // UP
                            this.direction.copyFromFloats(0, 1, 0);
                            break;
                        case 40:    // DOWN
                            this.direction.copyFromFloats(0, -1, 0);
                            break;
                        case 37:    // LEFT
                            this.direction.copyFromFloats(-1, 0,  0);
                            break;
                        case 39:    // RIGHT
                            this.direction.copyFromFloats(1, 0, 0);
                            break;
                    }
                break;
                case eventType.KEYUP:
                    this.direction.copyFromFloats(0, 0, 0);
                    break;
            }
        });
    }

    public move(deltaTime: number) {
        if (!this.alive) {
            return;
        }
        const pos = this.mesh.position;
        const tmpPos = this.tmpPosition;
        const tmpMin = this.tmpMin;
        const tmpMax = this.tmpMax;
        const deltaLength  = this.speed  * deltaTime;

        this.direction.scaleToRef(deltaLength, this.velocity);

        this.velocity.addToRef(pos, tmpPos);
        this.min.addToRef(tmpPos, tmpMin);
        this.max.addToRef(tmpPos, tmpMax);

        let intersect = false;
        const blocks = this.partitioning.getBlocksAt(tmpPos.x, tmpPos.y);
        if (blocks) {
            let b = 0;
            while (b < blocks.length && !intersect) {
                let blockBBox = blocks[b]._boundingInfo.boundingBox;
                intersect = blockBBox.intersectsMinMax(tmpMin, tmpMax);
                b++;
            }
            if (!intersect) {
                pos.copyFrom(tmpPos);
            }
        }
    }
    
}