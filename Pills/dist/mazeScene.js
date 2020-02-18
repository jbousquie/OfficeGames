import { Maze } from './maze.js';
import { MazeMap } from './mazeMap.js';
export class MazeScene {
    constructor(canvas, engine) {
        this.vertical = false;
        const scene = new BABYLON.Scene(engine);
        this.BJSScene = scene;
        const clearColor = new BABYLON.Color4(0.3, 0.5, 0.8);
        scene.clearColor = clearColor;
        const camera = new BABYLON.ArcRotateCamera("cam", 0, 0, 10, BABYLON.Vector3.Zero(), scene);
        camera.attachControl(canvas, true);
        const hl = new BABYLON.HemisphericLight('hl', BABYLON.Axis.Y, scene);
    }
    buildMaze(mapName, width, height, wallWidth, wallLength, wallHeight, vertical) {
        this.vertical = vertical ? true : false;
        this.mazeMap = new MazeMap(mapName);
        this.maze = new Maze(this.mazeMap, width, height);
        this.wallNb = this.maze.wallNb;
        this.wallPositions = this.maze.wallPositions;
        this.width = this.maze.width;
        this.height = this.maze.height;
        this.wallWidth = wallWidth ? wallWidth : this.width * 0.1;
        this.wallLength = wallLength ? wallLength : this.height * 0.1;
        this.wallHeight = wallHeight ? wallHeight : this.wallWidth;
        const model = BABYLON.MeshBuilder.CreateBox("b", { width: this.wallWidth * 0.5, depth: this.wallLength * 0.5 }, this.BJSScene);
        const sps = new BABYLON.SolidParticleSystem('walls', this.BJSScene);
        sps.addShape(model, this.wallNb, { positionFunction: (p, i, s) => this.setWall(p, i, s) });
        sps.buildMesh();
        model.dispose();
    }
    setWall(p, i, s) {
        let pos = this.wallPositions[i];
        p.position.x = pos.x;
        p.position.z = pos.y;
    }
}
;
//# sourceMappingURL=mazeScene.js.map