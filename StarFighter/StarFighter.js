/// <reference path="/var/www/html/BJS/Babylon.js/dist/preview release/babylon.d.ts" />
"use strict";

// Shortener function for new BABYLON.Vector3
var V = function(x, y, z) { return new BABYLON.Vector3(+x, +y, +z); }; 

// Stars SPS
var createStars = function(params, scene) {
    var starNb = params.starNb;
    var starEmitterSize = params.starEmitterSize;
    var distance = params.distance;
    var moderation= params.moderation;
    var pointerDistance = params.pointerDistance;
    var ang = params.ang;
    var rotMatrix = params.rotMatrix;
    var speedVector = params.speedVector;
    var tmpSpeed = params.tmpSpeed;

    console.log(params);

    var stars = new BABYLON.SolidParticleSystem("stars", scene);
    var model = BABYLON.MeshBuilder.CreatePlane("p", {size: 0.2}, scene);
    stars.addShape(model, starNb);   
    model.dispose();
    stars.buildMesh();
    stars.mesh.hasVertexAlpha = true;
    var p = stars.particles;
    for (var i = 0|0; i < starNb; i++) {
            p[i].position.x = starEmitterSize * (Math.random() - 0.5);
            p[i].position.y = starEmitterSize * (Math.random() - 0.5);
            p[i].position.z = distance * Math.random();  
            p[i].velocity.z = 1.1 - Math.random() * 0.2;
    } 

    stars.beforeUpdateParticles = function() {  
        // update pointerDistance : coordinates of the pointer in the screen space
        // update also angX and angY, X and Y rotation angles, atan(pointerS)  
        if (scene.pointerX) {
            pointerDistance.x = 2.0 * scene.pointerX / canvas.width - 1;
             ang.y = Math.atan(pointerDistance.x);
        }
        if (scene.pointerY) {
            pointerDistance.y =  1.0 - 2.0 * scene.pointerY / canvas.height;
            ang.x = Math.atan(pointerDistance.y); 
        }
        // Speed vector rotation
        BABYLON.Matrix.RotationYawPitchRollToRef(ang.y / moderation, ang.x / moderation, 0.0, rotMatrix);
        BABYLON.Vector3.TransformCoordinatesToRef(speedVector, rotMatrix, tmpSpeed);  
 };
    return stars;
};



// Scene
var createScene = function(canvas, engine) {

    // Assets
    var flareURL = "assets/flarealpha.png";


    // Global parameters
    var starNb = 150|0;                         // star total number in the pool
    var distance = 60.0;                        // star emitter distance from the screen
    var starSpeed = 1.0;                        // star speed on Z axis
    var sightDistance = 5.0;                    // sight distance 
    
    var fired = false; // global boolean

    // Keyboard and mouse inputs
    var CTRL = 17|0;
    var SHIFT = 16|0;
    var keyboard = [];                                                  // input array
    var pressedPointer = false;
    function updateInput(event, boolVal) {
        if (event.keyCode == CTRL) { keyboard[CTRL] = boolVal; }
        if (event.keyCode == SHIFT) { keyboard[SHIFT] = boolVal; }
    }    
    window.addEventListener('keydown', function(event) { updateInput(event, true); });
    window.addEventListener('keyup', function(event) { updateInput(event, false); });
    window.addEventListener('mousedown', function(e) { pressedPointer = true; });
    window.addEventListener('mouseup', function(e) { pressedPointer = false; });
    var getInputs = function() {
        fired = (keyboard[SHIFT] || pressedPointer) ? true : false;
    }; 


    // Scene
    var scene = new BABYLON.Scene(engine);
    scene.clearColor = BABYLON.Color3.Black();
    // Camera : fixed, looking toward +Z
    var camera = new BABYLON.TargetCamera("camera", V(0.0, 0.0, 0.0), scene);
    camera.direction = V(0.0, 1.0, 1.0);
    var cameraFov = Math.tan(camera.fov * 0.5);                             //  camera FOV ratio
    var fovCorrection = cameraFov * sightDistance;              // sight projection ratio from the screen space 
    var aspectRatio = engine.getAspectRatio(camera); //  aspect ratio from width/height screen size    

    // Global light
    var light = new BABYLON.HemisphericLight('light1', V(0.0, 1.0, -0.75), scene);
    var lightInitialIntensity = 0.80;
    light.intensity = lightInitialIntensity;

    // Point light used for the lasers
    var pointLight = new BABYLON.PointLight('pointLight', V(0.0, 0.0, 0.0), scene);
    pointLight.diffuse = new BABYLON.Color3(0.0, 0.0, 1.0);
    pointLight.specular = new BABYLON.Color3(0.5, 0.5, 1);
    var plIntensity = 0.6;
    pointLight.intensity = 0.0;

    // Point light used for the explosions
    var explosionLight = new BABYLON.PointLight('explosionLight', V(0.0, 0.0, 0.0), scene);
    explosionLight.diffuse = new BABYLON.Color3(1.0, 1.0, 0.6);
    explosionLight.specular = new BABYLON.Color3(1.0, 1.0, 0.8);
    var explLghtIntensity = 1.0;
    explosionLight.intensity = 0.0; 

   // Textures & Materials
   var flare = new BABYLON.Texture(flareURL, scene);
   flare.hasAlpha = true;

   var starMat = new BABYLON.StandardMaterial("sm", scene);
   starMat.emissiveColor = BABYLON.Color3.White();
   starMat.diffuseColor = BABYLON.Color3.White();
   starMat.diffuseTexture = flare;
   starMat.useAlphaFromDiffuseTexture = true;
   starMat.freeze();   

    // Global variables
    var starEmitterSize = distance / 1.2                                // size width of the particle emitter square surface
    var rotMatrix = BABYLON.Matrix.Zero();                              // rotation matrix
    var ang = BABYLON.Vector2.Zero();                                                     // rotation angle around Y and X
    var moderation = 6.0;                                               // moderator for max angle computation : +/- PI/2 / moderation 
    var pointerDistance = BABYLON.Vector2.Zero()                        // pointer x and y distance to the canvas center
    var speedVector = V(0.0, 0.0, - starSpeed);                         // star initial velocity vector
    var tmpSpeed = V(0.0, 0.0, 0.0);                              	    // particle computed velocity vector
    var starZLimit = sightDistance;                                     // z limit for particle recycling
    var canPos = new BABYLON.Vector3(-1.5, -1, 2.2);                    // Cannon0 initial position
    var angShift = Math.atan(canPos.y / distance);                      // initial angle shift due to cannon y position     
    var starParams = {
        starNb: starNb,
        starEmitterSize: starEmitterSize,
        distance: distance,
        moderation: moderation,
        pointerDistance: pointerDistance,
        ang: ang,
        rotMatrix: rotMatrix,
        speedVector: speedVector,
        tmpSpeed: tmpSpeed
    };

    // Stars
    var stars = createStars(starParams, scene);
    stars.mesh.material = starMat;
    light.excludedMeshes.push(stars.mesh);

    // test
    stars.setParticles();
    return scene;
};


// Init
var init = function() {
    var canvas = document.querySelector('#renderCanvas');
    var engine = new BABYLON.Engine(canvas, true);
    var scene = createScene(canvas, engine);
    window.addEventListener("resize", function() {
      engine.resize();
    });
  
    engine.runRenderLoop(function(){
      scene.render();
    });
  };