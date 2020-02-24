export declare class MazeMap {
    map: string[];
    HWallTag: string;
    VWallTag: string;
    playerTag: string;
    pillTag: string;
    static PacMan: {
        HWallTag: string;
        VWallTag: string;
        playerTag: string;
        pillTag: string;
        map: string[];
    };
    static Folder: {
        "PacMan": {
            HWallTag: string;
            VWallTag: string;
            playerTag: string;
            pillTag: string;
            map: string[];
        };
    };
    constructor(name: string);
}
