import { MazeScene } from "./mazeScene";
import { Partitioning } from "./partitioning";
export declare class Player {
    mesh: BABYLON.Mesh;
    mazeScence: MazeScene;
    size: number;
    direction: BABYLON.Vector3;
    min: BABYLON.Vector3;
    max: BABYLON.Vector3;
    private tmpPosition;
    private tmpMin;
    private tmpMax;
    wallPartitioning: Partitioning;
    alive: boolean;
    speed: number;
    velocity: BABYLON.Vector3;
    constructor(size: number, mazeScene: MazeScene);
    move(deltaTime: number): void;
}
