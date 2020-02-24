import { MazeMap } from './mazeMap';
export declare class Maze {
    wallPositions: BABYLON.Vector2[];
    wallOrientations: boolean[];
    wallNb: number;
    defaultWidth: number;
    defaultHeight: number;
    width: number;
    height: number;
    widthNumber: number;
    heightNumber: number;
    playerInitialPosition: BABYLON.Vector2;
    /**
     * Creates a logical maze (coordinates) from the map
     * @param mapObject
     * @param width
     * @param height
     */
    constructor(mapObject: MazeMap, width?: number, height?: number);
}
