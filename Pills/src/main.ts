import { MazeScene } from  './mazeScene.js';

export class Renderer {
    public engine: BABYLON.Engine;
    public canvas: HTMLCanvasElement;
    public fpsMeterCounter: number = 0;
    public fpsMeterPeriod: number = 20;
    public fpsElem: Element;
    public lastFrameStamp: number = 0;

    constructor() {
        this.canvas = <HTMLCanvasElement>document.querySelector('#renderCanvas');
        this.engine = new BABYLON.Engine(this.canvas, true);
        this.fpsElem = document.querySelector("#fps");

        window.addEventListener( "resize", () =>  this.engine.resize() );
    }

    public render(scene: BABYLON.Scene, cappedFPS: number): Renderer {
        const engine = this.engine;
        const that = this;
        if (cappedFPS == 0) {
            console.log("max framerate");
            engine.runRenderLoop(function(){
                 that._renderFrame(scene);
            });
        }    
        else {
            const delay = 1 / cappedFPS * 1000;
            console.log("capped framerate : " + cappedFPS + " fps");
            window.setInterval(function() {
                that._renderFrame(scene);
            }, delay)

        }
        return this;
    }

    private _renderFrame(scene: BABYLON.Scene) {
        scene.render();
        this.fpsMeterCounter++;        
        if (this.fpsMeterCounter == this.fpsMeterPeriod) {
            const now = performance.now();
            const fps = Math.floor(this.fpsMeterPeriod / (now - this.lastFrameStamp) * 1000);
            this.fpsElem.innerHTML = fps.toString() + " fps";
            this.fpsMeterCounter = 0;
            this.lastFrameStamp = now;
        }
    }
    
    

}

const init = () => {

    // create a renderer and a maze scene
    const renderer = new Renderer;
    const mazeScene = new MazeScene(renderer.canvas, renderer.engine);



    // init the scene rendering at the wanted framerate
    mazeScene.init("PacMan");
    const BJSScene = mazeScene.BJSScene;
    renderer.render(BJSScene, 45);

};

window.onload = init;


