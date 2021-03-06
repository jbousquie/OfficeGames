import { Maze } from './maze.js';
import { MazeMap } from './mazeMap.js';
import { Partitioning } from './partitioning.js';
import { Player } from './player.js';
export class MazeScene {
    constructor(canvas, engine) {
        this.vertical = false;
        this.wallTextureURL = "images/stonewall.jpg";
        this.before = 0;
        const scene = new BABYLON.Scene(engine);
        this.BJSScene = scene;
        const clearColor = new BABYLON.Color4(0.3, 0.5, 0.8);
        scene.clearColor = clearColor;
        const camera = new BABYLON.ArcRotateCamera("cam", 0, 0, 10, BABYLON.Vector3.Zero(), scene);
        camera.attachControl(canvas, true);
        camera.inputs.attached.keyboard.detachControl(canvas);
        const hl = new BABYLON.HemisphericLight('hl', BABYLON.Axis.Y, scene);
        this.camera = camera;
        this.hemiLight = hl;
    }
    buildMaze(mapName, width, height, wallWidth, wallLength, wallHeight, pillSize, vertical) {
        this.vertical = vertical ? true : false;
        this.mazeMap = new MazeMap(mapName);
        this.maze = new Maze(this.mazeMap, width, height);
        this.wallNb = this.maze.wallNb;
        this.wallPositions = this.maze.wallPositions;
        this.wallOrientations = this.maze.wallOrientations;
        this.width = this.maze.width;
        this.height = this.maze.height;
        this.widthNumber = this.maze.widthNumber;
        this.heightNumber = this.maze.heightNumber;
        this.wallWidth = wallWidth ? wallWidth : this.width / (this.widthNumber - 1);
        this.wallLength = wallLength ? wallLength : this.height / (this.heightNumber - 1);
        this.wallHeight = wallHeight ? wallHeight : this.wallWidth;
        this.pillSize = pillSize ? this.pillSize : this.wallWidth * 0.1;
        this.pillNb = this.maze.pillNb;
        this.pillPositions = this.maze.pillPositions;
        this.playerInitialPosition = this.maze.playerInitialPosition;
        const wallModel = BABYLON.MeshBuilder.CreateBox("b", { width: this.wallWidth, depth: this.wallHeight, height: this.wallLength }, this.BJSScene);
        const wallSPS = new BABYLON.SolidParticleSystem('walls', this.BJSScene, { particleIntersection: true, boundingSphereOnly: false });
        wallSPS.addShape(wallModel, this.wallNb, { positionFunction: (p, i, s) => this.setWall(p, i, s) });
        wallSPS.buildMesh();
        wallModel.dispose();
        wallSPS.computeBoundingBox = true;
        wallSPS.setParticles();
        const pillModel = BABYLON.MeshBuilder.CreatePolyhedron("p", { size: this.pillSize }, this.BJSScene);
        const pillSPS = new BABYLON.SolidParticleSystem('pills', this.BJSScene, { particleIntersection: true, boundingSphereOnly: false });
        pillSPS.addShape(pillModel, this.pillNb, { positionFunction: (p, i, s) => this.setPill(p, i, s) });
        pillSPS.buildMesh();
        pillModel.dispose();
        pillSPS.computeBoundingBox = true;
        pillSPS.setParticles();
        if (!this.vertical) {
            this.camera.setPosition(new BABYLON.Vector3(0, 0, -this.height));
            this.hemiLight.direction = new BABYLON.Vector3(0, 0, -1);
        }
        this.wallSPS = wallSPS;
        this.pillSPS = pillSPS;
        const wallTexture = new BABYLON.Texture(this.wallTextureURL, this.BJSScene);
        const wallMaterial = new BABYLON.StandardMaterial("wallMat", this.BJSScene);
        wallMaterial.diffuseTexture = wallTexture;
        this.wallSPS.mesh.material = wallMaterial;
        this.wallPartitioning = new Partitioning(wallSPS, 10, 10);
    }
    setWall(p, i, s) {
        let pos = this.wallPositions[i];
        let orientation = this.wallOrientations[i];
        p.position.x = pos.x;
        p.position.y = pos.y;
        if (!orientation) {
            p.rotation.z = Math.PI * 0.5;
        }
    }
    setPill(p, i, s) {
        let pos = this.pillPositions[i];
        p.position.x = pos.x;
        p.position.y = pos.y;
    }
    init(name) {
        const blockSize = 3.6;
        this.buildMaze(name, 100, 108, blockSize, blockSize, blockSize * 0.2);
        this.player = new Player(blockSize * 0.7, this);
        const player = this.player;
        this.BJSScene.onBeforeRenderObservable.add(() => {
            const now = Date.now();
            const deltaTime = (Date.now() - this.before) * 0.001;
            this.before = now;
            player.move(deltaTime);
        });
        this.before = Date.now();
    }
}
;
//# sourceMappingURL=mazeScene.js.map