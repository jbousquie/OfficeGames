import { MazeMap } from './mazeMap';

export class Maze {

    public wallPositions: BABYLON.Vector2[] = [];
    public wallNb = 0;
    public defaultWidth = 100;
    public defaultHeight = 100;
    public width = 100;
    public height = 100;

    /**
     * Creates a logical maze (coordinates) from the map
     * @param mapObject 
     * @param width 
     * @param height 
     */

    constructor(mapObject: MazeMap, width?: number, height?: number) {

        const mazeWidth = (width) ? width : this.defaultWidth;
        const mazeHeight = (height) ? height : this.defaultWidth;
        const map = mapObject.map;
        const wallTag = mapObject.wallTag;
        this.width = mazeWidth;
        this.height = mazeHeight;

        const rowNb = map.length;
        const colNb = map[0].length;
        const rowStep = mazeWidth / rowNb;
        const colStep = mazeHeight / colNb;
        for (let rowIdx = 0; rowIdx < rowNb; rowIdx++) {
            let row = map[rowIdx];
            for (let colIdx = 0; colIdx < colNb; colIdx++) {
                let col = row[colIdx];
                if (col == wallTag) {
                    let x = colIdx * colStep - mazeWidth * 0.5;
                    let y = rowIdx * rowStep - mazeHeight * 0.5;
                    this.wallPositions.push(new BABYLON.Vector2(x, y));
                    this.wallNb++;
                }
            }
        }
    }
};