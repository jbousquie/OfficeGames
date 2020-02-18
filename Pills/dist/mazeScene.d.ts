import { Maze } from './maze.js';
import { MazeMap } from './mazeMap.js';
export declare class MazeScene {
    BJSScene: BABYLON.Scene;
    vertical: boolean;
    mapName: string;
    mazeMap: MazeMap;
    maze: Maze;
    width: number;
    height: number;
    wallWidth: number;
    wallLength: number;
    wallHeight: number;
    wallNb: number;
    wallPositions: BABYLON.Vector2[];
    sps: BABYLON.SolidParticleSystem;
    constructor(canvas: HTMLElement, engine: BABYLON.Engine);
    buildMaze(mapName: string, width?: number, height?: number, wallWidth?: number, wallLength?: number, wallHeight?: number, vertical?: boolean): void;
    setWall(p: any, i: number, s: number): void;
}
