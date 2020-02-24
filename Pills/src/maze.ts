import { MazeMap } from './mazeMap';

export class Maze {

    public wallPositions: BABYLON.Vector2[] = [];
    public wallOrientations: boolean[] = [];          // true = horizontal, false = vertical
    public wallNb: number = 0;
    public defaultWidth: number = 100;
    public defaultHeight:number = 100;
    public width: number = 100;
    public height: number = 100;
    public widthNumber: number = 0;
    public heightNumber: number = 0;
    public playerInitialPosition: BABYLON.Vector2 = BABYLON.Vector2.Zero() ;
    public pillPositions: BABYLON.Vector2[] = [];
    public pillNb: number = 0;

    /**
     * Creates a logical maze (coordinates) from the map
     * @param mapObject 
     * @param width 
     * @param height 
     */

    constructor(mapObject: MazeMap, width?: number, height?: number) {

        const mazeWidth = (width) ? width : this.defaultWidth;
        const mazeHeight = (height) ? height : this.defaultHeight;
        const map = mapObject.map;
        const HWallTag = mapObject.HWallTag;
        const VWallTag = mapObject.VWallTag;
        const playerTag = mapObject.playerTag;
        const pillTag = mapObject.pillTag;
        this.width = mazeWidth;
        this.height = mazeHeight;

        const rowNb = map.length;
        const colNb = map[0].length;
        const rowStep = mazeHeight / rowNb;
        const colStep = mazeWidth / colNb;
        for (let rowIdx = 0; rowIdx < rowNb; rowIdx++) {
            let row = map[rowIdx];
            for (let colIdx = 0; colIdx < colNb; colIdx++) {
                let col = row[colIdx];
                let x = colIdx * colStep - mazeWidth * 0.5;
                let y = -rowIdx * rowStep + mazeHeight * 0.5;
                if (col == VWallTag || col == HWallTag) {
                    this.wallPositions.push(new BABYLON.Vector2(x, y));
                    this.wallNb++;
                    let orientation = (col == HWallTag);
                    this.wallOrientations.push(orientation);
                }
                if (col == playerTag) {
                    this.playerInitialPosition.copyFromFloats(x, y);
                }
                if (col == pillTag) {
                    this.pillPositions.push(new BABYLON.Vector2(x, y));
                    this.pillNb++;
                }
            }
        }
        this.widthNumber = colNb;
        this.heightNumber = rowNb;
    }
};