export class MazeMap {
    constructor(name) {
        let n = "PacMan";
        if (MazeMap.Folder[name]) {
            n = name;
        }
        const m = MazeMap.Folder[n];
        this.map = m.map;
        this.HWallTag = m.HWallTag;
        this.VWallTag = m.VWallTag;
        this.playerTag = m.playerTag;
    }
}
MazeMap.PacMan = {
    HWallTag: "-",
    VWallTag: "!",
    playerTag: "o",
    map: [
        "----------------------------",
        "!            !!            !",
        "! ---- ----- !! ----- ---- !",
        "! !  ! !   ! !! !   ! !  ! !",
        "! ---- ----- !! ----- ---- !",
        "!                          !",
        "! ---- !! -------- !! ---- !",
        "! ---- !! -------- !! ---- !",
        "!      !!    !!    !!      !",
        "------ !!--- !! ---!! ------",
        "     ! !!--- !! ---!! !     ",
        "     ! !!          !! !     ",
        "------ !! -------- !! ------",
        "          !      !          ",
        "------ !! !      ! !! ------",
        "     ! !! -------- !! !     ",
        "     ! !!     o    !! !     ",
        "     ! !! -------- !! !     ",
        "------ !! -------- !! ------",
        "!            !!            !",
        "! ---- ----- !! ----- ---- !",
        "! ---- ----- !! ----- ---- !",
        "!   !!                !!   !",
        "--- !! !! -------- !! !! ---",
        "--- !! !! -------- !! !! ---",
        "!      !!    !!    !!      !",
        "! ---------- !! ---------- !",
        "! ---------- !! ---------- !",
        "!                          !",
        "----------------------------"
    ]
};
MazeMap.Folder = {
    "PacMan": MazeMap.PacMan
};
//# sourceMappingURL=mazeMap.js.map