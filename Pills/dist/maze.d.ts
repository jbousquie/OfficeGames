import { MazeMap } from './mazeMap';
export declare class Maze {
    wallPositions: BABYLON.Vector2[];
    wallNb: number;
    defaultWidth: number;
    defaultHeight: number;
    width: number;
    height: number;
    /**
     * Creates a logical maze (coordinates) from the map
     * @param mapObject
     * @param width
     * @param height
     */
    constructor(mapObject: MazeMap, width?: number, height?: number);
}
