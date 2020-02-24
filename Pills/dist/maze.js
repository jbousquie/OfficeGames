export class Maze {
    /**
     * Creates a logical maze (coordinates) from the map
     * @param mapObject
     * @param width
     * @param height
     */
    constructor(mapObject, width, height) {
        this.wallPositions = [];
        this.wallOrientations = []; // true = horizontal, false = vertical
        this.wallNb = 0;
        this.defaultWidth = 100;
        this.defaultHeight = 100;
        this.width = 100;
        this.height = 100;
        this.widthNumber = 0;
        this.heightNumber = 0;
        this.playerInitialPosition = BABYLON.Vector2.Zero();
        this.pillPositions = [];
        this.pillNb = 0;
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
}
;
//# sourceMappingURL=maze.js.map