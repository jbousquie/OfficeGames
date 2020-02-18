export class Maze {
    /**
     * Creates a logical maze (coordinates) from the map
     * @param mapObject
     * @param width
     * @param height
     */
    constructor(mapObject, width, height) {
        this.wallPositions = [];
        this.wallNb = 0;
        this.defaultWidth = 100;
        this.defaultHeight = 100;
        this.width = 100;
        this.height = 100;
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
}
;
//# sourceMappingURL=maze.js.map