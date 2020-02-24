export class MazeMap {
    public map: string[];
    public HWallTag: string;
    public VWallTag: string;
    public playerTag: string;

    public static PacMan: { HWallTag: string, VWallTag: string, playerTag: string, map: string[] } =
     { 
        HWallTag: "-",
        VWallTag: "!",
        playerTag: "o",
        map:  [
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
    }


    public static Folder = {
        "PacMan": MazeMap.PacMan
    };
    constructor(name: string) {
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
