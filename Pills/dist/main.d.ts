export declare class Renderer {
    engine: BABYLON.Engine;
    canvas: HTMLCanvasElement;
    fpsMeterCounter: number;
    fpsMeterPeriod: number;
    fpsElem: Element;
    lastFrameStamp: number;
    constructor();
    render(scene: BABYLON.Scene, cappedFPS: number): Renderer;
    private _renderFrame;
}
