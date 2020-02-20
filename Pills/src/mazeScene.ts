import { Maze } from './maze.js';
import { MazeMap } from './mazeMap.js';
import { Partitioning } from './partitioning.js';

export class MazeScene {
    public BJSScene: BABYLON.Scene;
    public vertical: boolean = false;
    public mapName: string;
    public mazeMap: MazeMap;
    public maze: Maze;
    public width: number;
    public height: number;
    public widthNumber: number;
    public heightNumber: number;
    public wallWidth: number;
    public wallLength: number;
    public wallHeight: number;
    public wallNb: number;
    public wallPositions: BABYLON.Vector2[];
    public wallOrientations: boolean[];
    public sps: BABYLON.SolidParticleSystem;
    public partitioning: Partitioning;
    public camera: BABYLON.ArcRotateCamera;
    public hemiLight: BABYLON.HemisphericLight;
    public wallTextureURL = "images/stonewall.jpg";

    constructor(canvas: HTMLElement, engine: BABYLON.Engine,) {
        const scene = new BABYLON.Scene(engine);
        this.BJSScene = scene;

        const clearColor = new BABYLON.Color4(0.3, 0.5, 0.8);
        scene.clearColor = clearColor;
        const camera = new BABYLON.ArcRotateCamera("cam", 0, 0, 10, BABYLON.Vector3.Zero(), scene);
        camera.attachControl(canvas, true);
        console.log(camera.inputs.attached)
        camera.inputs.attached.keyboard.detachControl(canvas);
        const hl = new BABYLON.HemisphericLight('hl', BABYLON.Axis.Y, scene);
        this.camera = camera;
        this.hemiLight = hl;

    }


    public buildMaze(mapName: string, width?: number, height?: number, wallWidth?: number, wallLength?: number, wallHeight?: number, vertical?: boolean) {
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

        const model = BABYLON.MeshBuilder.CreateBox("b", {width: this.wallWidth, depth: this.wallHeight,  height: this.wallLength}, this.BJSScene);
        const sps = new BABYLON.SolidParticleSystem('walls', this.BJSScene, {particleIntersection: true, boundingSphereOnly: false});
        sps.addShape(model, this.wallNb, {positionFunction: (p, i, s) => this.setWall(p, i, s)});
        sps.buildMesh();
        model.dispose();
        sps.computeBoundingBox = true;
        sps.setParticles();

        if (!this.vertical) {
            this.camera.setPosition(new BABYLON.Vector3(0, 0, -this.height));
            this.camera.upVector = new BABYLON.Vector3(0, -1, 0.001);
            this.hemiLight.direction = new BABYLON.Vector3(0, 0, 1);
        }
        this.sps = sps;

        const wallTexture = new BABYLON.Texture(this.wallTextureURL, this.BJSScene);
        const wallMaterial = new BABYLON.StandardMaterial("wallMat", this.BJSScene);
        wallMaterial.diffuseTexture = wallTexture;
        this.sps.mesh.material = wallMaterial;

        this.partitioning = new Partitioning(sps, 10, 10);
    }

    public setWall(p: any, i: number, s: number)  {
        let pos = this.wallPositions[i];
        let orientation = this.wallOrientations[i];
        p.position.x = pos.x;
        p.position.y = pos.y;
        if (!orientation) {
            p.rotation.z = Math.PI * 0.5;
        }
    }

    public createPlayer() {
        
    }
};