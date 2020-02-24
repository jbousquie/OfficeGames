export class Player {
    constructor(size, mazeScene) {
        this.direction = BABYLON.Vector3.Zero();
        this.min = BABYLON.Vector3.Zero();
        this.max = BABYLON.Vector3.Zero();
        this.tmpPosition = BABYLON.Vector3.Zero();
        this.tmpMin = BABYLON.Vector3.Zero();
        this.tmpMax = BABYLON.Vector3.Zero();
        this.alive = true;
        this.speed = 30;
        this.velocity = BABYLON.Vector3.Zero();
        this.mazeScence = mazeScene;
        this.wallPartitioning = mazeScene.wallPartitioning;
        this.size = size;
        const scene = mazeScene.BJSScene;
        const playerMesh = BABYLON.MeshBuilder.CreateBox("player", { size: size }, scene);
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
                        case 38: // UP
                            this.direction.copyFromFloats(0, 1, 0);
                            break;
                        case 40: // DOWN
                            this.direction.copyFromFloats(0, -1, 0);
                            break;
                        case 37: // LEFT
                            this.direction.copyFromFloats(-1, 0, 0);
                            break;
                        case 39: // RIGHT
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
    move(deltaTime) {
        if (!this.alive) {
            return;
        }
        const pos = this.mesh.position;
        const tmpPos = this.tmpPosition;
        const tmpMin = this.tmpMin;
        const tmpMax = this.tmpMax;
        const deltaLength = this.speed * deltaTime;
        this.direction.scaleToRef(deltaLength, this.velocity);
        this.velocity.addToRef(pos, tmpPos);
        this.min.addToRef(tmpPos, tmpMin);
        this.max.addToRef(tmpPos, tmpMax);
        let intersect = false;
        const blocks = this.wallPartitioning.getBlocksAt(tmpPos.x, tmpPos.y);
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
//# sourceMappingURL=player.js.map