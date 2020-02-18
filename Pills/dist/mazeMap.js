export class MazeMap {
    constructor(name) {
        let n = "PacMan";
        if (MazeMap.Folder[name]) {
            n = name;
        }
        const m = MazeMap.Folder[n];
        this.map = m.map;
        this.wallTag = m.wallTag;
    }
}
MazeMap.PacMan = {
    wallTag: "x",
    map: [
        "xxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        "x            xx            x",
        "x xxxx xxxxx xx xxxxx xxxx x",
        "x x  x x   x xx x   x x  x x",
        "x xxxx xxxxx xx xxxxx xxxx x",
        "x                          x",
        "x xxxx xx xxxxxxxx xx xxxx x",
        "x xxxx xx xxxxxxxx xx xxxx x",
        "x      xx    xx    xx      x",
        "xxxxxx xxxxx xx xxxxx xxxxxx",
        "     x xxxxx xx xxxxx x     ",
        "     x xx          xx x     ",
        "xxxxxx xx xxxxxxxx xx xxxxxx",
        "          x      x          ",
        "xxxxxx xx x      x xx xxxxxx",
        "     x xx xxxxxxxx xx x     ",
        "     x xx          xx x     ",
        "     x xx xxxxxxxx xx x     ",
        "xxxxxx xx xxxxxxxx xx xxxxxx",
        "x            xx            x",
        "x xxxx xxxxx xx xxxxx xxxx x",
        "x xxxx xxxxx xx xxxxx xxxx x",
        "x   xx                xx   x",
        "xxx xx xx xxxxxxxx xx xx xxx",
        "xxx xx xx xxxxxxxx xx xx xxx",
        "x      xx    xx    xx      x",
        "x xxxxxxxxxx xx xxxxxxxxxx x",
        "x xxxxxxxxxx xx xxxxxxxxxx x",
        "x                          x",
        "xxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    ]
};
MazeMap.Folder = {
    "PacMan": MazeMap.PacMan
};
//# sourceMappingURL=mazeMap.js.map