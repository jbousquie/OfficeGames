/// <reference path="/var/www/html/BJS/Babylon.js/dist/preview release/babylon.d.ts" />
"use strict";

// Shortener function for new BABYLON.Vector3
var V = function(x, y, z) { return new BABYLON.Vector3(+x, +y, +z); }; 

// StarFighter game object
var SF = {};

// Assets
SF.Assets = {
    flareURL: "assets/flarealpha.png",
    sightURL : "assets/viseur.png",
    rustyURL: "assets/rusty.jpg"
};

// Materials
SF.CreateMaterials = function(scene) {
    SF.Materials = {};
    // Textures
    var flare = new BABYLON.Texture(SF.Assets.flareURL, scene);
    flare.hasAlpha = true;
    var sightTexture = new BABYLON.Texture(SF.Assets.sightURL, scene);
    var rustyTexture = new BABYLON.Texture(SF.Assets.rustyURL, scene);
    // Star material
    var starMat = new BABYLON.StandardMaterial("sm", scene);
    starMat.emissiveColor = BABYLON.Color3.White();
    starMat.diffuseColor = BABYLON.Color3.White();
    starMat.diffuseTexture = flare;
    starMat.useAlphaFromDiffuseTexture = true;
    starMat.freeze(); 
    SF.Materials.star = starMat;
    // Sight material
    var sightMat = new BABYLON.StandardMaterial("sm", scene);
    sightTexture.hasAlpha = true;
    sightMat.emissiveTexture = sightTexture;
    sightMat.diffuseTexture = sightTexture;
    sightMat.useAlphaFromDiffuseTexture = true;
    sightMat.freeze();
    SF.Materials.sight = sightMat;
    // Starship material : cannons & cockpit
    var canMat = new BABYLON.StandardMaterial("cm", scene);
    canMat.diffuseTexture = rustyTexture;
    SF.Materials.ship = canMat;
    // Shield material
    var shieldMat = new BABYLON.StandardMaterial("shm", scene);
    shieldMat.alpha = 0.5;
    shieldMat.diffuseColor = BABYLON.Color3.Green();
    SF.Materials.shield = shieldMat;
    // Laser material
    var laserMat = new BABYLON.StandardMaterial("lm", scene);
    laserMat.emissiveColor = BABYLON.Color3.White();
    laserMat.freeze();
    SF.Materials.laser = laserMat;
};

// Lights
SF.CreateLights = function(scene) {
    SF.Lights = {};
    var light = new BABYLON.HemisphericLight('light1', V(0.0, 1.0, -0.75), scene);
    var lightInitialIntensity = 0.80;
    light.intensity = lightInitialIntensity;
    SF.Lights.light = light;

    // Point light used for the lasers
    var pointLight = new BABYLON.PointLight('pointLight', V(0.0, 0.0, 0.0), scene);
    pointLight.diffuse = new BABYLON.Color3(0.0, 0.0, 1.0);
    pointLight.specular = new BABYLON.Color3(0.5, 0.5, 1);
    var plIntensity = 0.6;
    pointLight.intensity = 0.0;
    SF.Lights.pointLight = pointLight;

    // Point light used for the explosions
    var explosionLight = new BABYLON.PointLight('explosionLight', V(0.0, 0.0, 0.0), scene);
    explosionLight.diffuse = new BABYLON.Color3(1.0, 1.0, 0.6);
    explosionLight.specular = new BABYLON.Color3(1.0, 1.0, 0.8);
    var explLghtIntensity = 1.0;
    explosionLight.intensity = 0.0;  
    SF.Lights.explosionLight = explosionLight;
};

// Starship
SF.Starship = function(gameScene) {
    var scene = gameScene.scene;
    this.gameScene = gameScene;
    // Cockpit : two tubes and one ribbon merged together
    var path1 = [V(-1.5, 0.8, 0.0), V(-0.5, -0.8, 3.0)];
    var path2 = [V(1.5, 0.8, 0.0), V(0.5, -0.8, 3.0)];
    var tube1 = BABYLON.MeshBuilder.CreateTube('t1', {path: path1, radius: 0.03}, scene); 
    var tube2 = BABYLON.MeshBuilder.CreateTube('t2', {path: path2, radius: 0.03}, scene);
    this.rpath1 = [];
    this.rpath2 = [];
    this.rpath3 = [];
    this.initialRpath3 = [];
    var cockpitHeight = 0.14;
    for (var r = 0; r <= 10; r ++) {
        var t = r / 10; 
        this.rpath1.push( V(-0.5 + t, -0.05 * Math.cos(r * Math.PI / 5.0) - 0.75, 3.1) );
        this.rpath2.push( V(-0.5 + t, -1.0, 0.0 ) );
        this.rpath3.push( V(this.rpath1[r].x, this.rpath1[r].y + cockpitHeight, this.rpath1[r].z) );
        this.initialRpath3.push( V(this.rpath1[r].x, this.rpath1[r].y + cockpitHeight, this.rpath1[r].z) );
    }
    this.rpath3[0|0].y = this.rpath1[0|0].y;
    this.rpath3[10|0].y = this.rpath1[10|0].y;
    this.initialRpath3[0|0].y = this.rpath3[0|0].y;
    this.initialRpath3[10|0].y = this.rpath1[10|0].y;
    var rib = BABYLON.MeshBuilder.CreateRibbon('rb', { pathArray: [this.rpath1, this.rpath2] }, scene);
    this.cockpit = BABYLON.Mesh.MergeMeshes([tube1, tube2, rib], true, true);
    this.cockpit.alwaysSelectAsActiveMesh = true;                            // the cockpit is always in the frustum
    this.cockpit.material = SF.Materials.ship;
    this.cockpit.freezeWorldMatrix();                                        // and never moves
    rib = tube1 = tube2 = null;

    // Shield
    this.pathArray = [this.rpath3, this.rpath1];
    this.shieldMesh = BABYLON.MeshBuilder.CreateRibbon('sh', {pathArray: this.pathArray, updatable: true}, scene);
    this.shieldMesh.material = SF.Materials.shield;
    this.shieldMesh.freezeWorldMatrix();
    this.shieldMesh.alwaysSelectAsActiveMesh = true;

    this.maxShield = gameScene.maxShield;
    this.shield = this.maxShield; 
};
SF.Starship.prototype.resetShield = function() {
    if (this.shield < 0) {
        this.gameScene.alive = false;
        if ( window.confirm("You're dead...\n\nSCORE = "+score+"\n\nRetry ?\n\n") ) {
            this.shield = this.maxShield;
            SF.Materials.shield.diffuseColor.r = 0.0;
            SF.Materials.shield.diffuseColor.g = 1.0;
            SF.Materials.shield.alpha = 0.5;
            this.gameScene.score = 0|0;
            for (var i = 0|0; i < this.initialRpath3.length; i++) {
                this.rpath3[i].copyFrom(this.initialRpath3[i]);
            }
            BABYLON.MeshBuilder.CreateRibbon(null, {pathArray: this.pathArray, instance: this.shieldMesh} );
            this.gameScene.alive = true;
        }
    } 
};

// Weapons
SF.Weapons = function(gameScene) {
    var scene = gameScene.scene;
    var sightDistance = gameScene.sightDistance;
    var canLength = gameScene.canLength;
    var canRadius = gameScene.canRadius;
    this.gameScene = gameScene;

    // sight mesh
    this.sight = BABYLON.MeshBuilder.CreatePlane("sight", {size: 0.2}, scene);
    this.sight.position = V(0.0, 0.0, sightDistance);
    this.sight.material = SF.Materials.sight;
    this.sight.alwaysSelectAsActiveMesh = true;
    // cannons : 4 tube instances
    var canPos = new BABYLON.Vector3(-1.5, -1, 2.2);
    var canPath = [V(0.0, 0.0, 0.0), V(0.0, 0.0, canLength * .80), V(0.0, 0.0, canLength * .80), V(0.0, 0.0, canLength)];
    var radiusFunction = function(i, dist) {
        var rad = canRadius;
        if (i == 2) { rad *= 1.25; }
        if (i == 3) { rad *= 0.8; }
        return rad;
    };
    var cannon0 = BABYLON.MeshBuilder.CreateTube("c0", {path: canPath, radiusFunction: radiusFunction }, scene);
    cannon0.material = SF.Materials.ship;
    cannon0.position = canPos;
    var cannon1 = cannon0.createInstance("c1", scene);
    cannon1.position.x = -cannon0.position.x;
    var cannon2 = cannon0.createInstance("c2", scene);
    cannon2.position.y = -cannon0.position.y;
    var cannon3 = cannon0.createInstance("c3", scene);
    cannon3.position.y = cannon2.position.y;
    cannon3.position.x = cannon1.position.x;

    // all the cannons are always in the frustum
    cannon0.alwaysSelectAsActiveMesh = true;
    cannon1.alwaysSelectAsActiveMesh = true;
    cannon2.alwaysSelectAsActiveMesh = true;
    cannon3.alwaysSelectAsActiveMesh = true;

    // cannon pools : cannons, cannon directions, cannon heats
    this.cannons = [cannon0, cannon1, cannon2, cannon3];
    this.cannonDirections = [V(0.0, 0.0, 0.0), V(0.0, 0.0, 0.0), V(0.0, 0.0, 0.0), V(0.0, 0.0, 0.0)]; 
    this.cannonHeats = [0|0, 0|0, 0|0, 0|0];
};
SF.Weapons.prototype.animate = function() {
    // sight position
    var gs = this.gameScene;
    this.sight.position.x = gs.pointerDistance.x * gs.fovCorrection * gs.aspectRatio;
    this.sight.position.y = gs.pointerDistance.y * gs.fovCorrection;
    // cannon rotation and direction
    for(var i = 0|0; i < this.cannons.length; i++) {
        this.sight.position.subtractToRef(this.cannons[i].position, this.cannonDirections[i]);
        this.cannons[i].rotation.y = Math.atan2(this.cannonDirections[i].x, this.cannonDirections[i].z);
        this.cannons[i].rotation.x =  -Math.atan2(this.cannonDirections[i].y  * Math.cos(this.cannons[i].rotation.y), this.cannonDirections[i].z);
        if (this.cannonHeats[i] > 0|0) { this.cannonHeats[i]--; }   // cannon cooling
    }
};
 
// Stars
SF.Stars = function(gameScene) {
    this.starNb = gameScene.starNb;
    this.starEmitterSize = gameScene.starEmitterSize;
    this.distance = gameScene.distance;
    this.starZLimit = gameScene.sightDistance;
    this.moderation= gameScene.moderation;
    this.pointerDistance = gameScene.pointerDistance;
    this.ang = gameScene.ang;
    this.rotMatrix = gameScene.rotMatrix;
    this.speedVector = gameScene.speedVector;
    this.tmpSpeed = gameScene.tmpSpeed;
    this.canvas = gameScene.canvas;
    this.material = SF.Materials.star;
    var scene = gameScene.scene;

    // Star SPS
    var stars = new BABYLON.SolidParticleSystem("stars", scene);
    var model = BABYLON.MeshBuilder.CreatePlane("p", {size: 0.2}, scene);
    stars.addShape(model, this.starNb);   
    model.dispose();
    stars.buildMesh();
    this.sps = stars;
    this.mesh = this.sps.mesh;

    // SPS behavior
    stars.mesh.material = this.material;
    stars.mesh.hasVertexAlpha = true;
    stars.mesh.freezeNormals();
    stars.mesh.freezeWorldMatrix();
    stars.isAlwaysVisible = true;
    stars.computeParticleRotation = false;
    stars.computeParticleTexture = false;
    // initial positions
    var p = stars.particles;
    for (var i = 0; i < this.starNb; i++) {
            p[i].position.x = this.starEmitterSize * (Math.random() - 0.5);
            p[i].position.y = this.starEmitterSize * (Math.random() - 0.5);
            p[i].position.z = this.distance * Math.random();  
            p[i].velocity.z = 1.1 - Math.random() * 0.2;
    } 
    stars.setParticles();

    // vars for closures
    var distance = this.distance;      
    var starZLimit = this.starZLimit; 
    var starEmitterSize = this.starEmitterSize;                
    var pointerDistance = this.pointerDistance;
    var canvas = this.canvas;
    var ang = this.ang;
    var moderation = 1 / this.moderation;
    var rotMatrix = this.rotMatrix;
    var speedVector = this.speedVector;
    var tmpSpeed = this.tmpSpeed;
    
    // Compute once per frame the global rotation
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
        BABYLON.Matrix.RotationYawPitchRollToRef(ang.y * moderation, ang.x * moderation, 0.0, rotMatrix);
        BABYLON.Vector3.TransformCoordinatesToRef(speedVector, rotMatrix, tmpSpeed);  
    };

    // Every frame update
    stars.updateParticle = function(p) {
        // move
        p.position.addInPlace(tmpSpeed);
        p.position.x -= pointerDistance.x * p.position.z * p.velocity.z / distance;
        p.position.y -= pointerDistance.y * p.position.z * p.velocity.z / distance;
        // recycle
        if (p.position.z < starZLimit) {
            p.position.z = distance * (1.0 - Math.random() * 0.25);
            p.position.x = starEmitterSize * (Math.random() - 0.5) + distance * pointerDistance.x * 0.5;
            p.position.y = starEmitterSize * (Math.random() - 0.5) + distance * pointerDistance.y * 0.5;
            p.scaling.x = 1.1 - Math.random() * 0.2;
            p.scaling.y = p.scaling.x;
            p.velocity.z = 1.1 - Math.random() * 0.2;
        }
    };

}
SF.Stars.prototype.animate = function() {
    this.sps.setParticles();
};

// Lasers
SF.LogicalLaser = function(laserSPS, i) {
    this.mesh = laserSPS.particles[i];              // reference to the laser sps i-th particle
    this.target = V(0.0, 0.0, 0.0);                 // world target coordinates, in the sight plane
    this.direction = V(0.0, 0.0, 0.0);              // vector : laser cannon - target
    this.fired = false;                             // laser fired ?
    this.cannon = 0;                                // index of the fired cannon in the array "cannons"
    this.scaling = 0.0;                             // current scaling
    this.screenTarget = BABYLON.Vector2.Zero();     // target coordinates in the screen space
};
SF.ShipLasers = function(gameScene) {
    this.gameScene = gameScene;
    var scene = this.gameScene.scene;
    var canRadius = this.gameScene.canRadius;
    var canLength = this.gameScene.canLength;
    var laserNb = this.gameScene.laserNb;
    var laserSpeed = this.gameScene.laserSpeed;
    this.ballRadius = canRadius * 8.0;          // ball initial radius
    this.ballPos = V(0.0, 0.0, 0.0);            // tmp ball position to be added to its cannon
    this.fired = false;
    this.cannonHeats = this.gameScene

    // laser model
    var positions = [-canRadius * 2, -1.0, 0.0, canRadius * 2, -1.0, 0.0, 0.0, 0.0, 0.0];
    var indices = [0|0, 1|0, 2|0];
    var normals = [];
    BABYLON.VertexData.ComputeNormals(positions, indices, normals);
    var colors = [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0];
    var vertexData = new BABYLON.VertexData();
    vertexData.positions = positions;
    vertexData.indices = indices;
    vertexData.normals = normals;
    vertexData.colors = colors;
    var laserModel = new BABYLON.Mesh("l", scene);
    vertexData.applyToMesh(laserModel);

    // laser ball model
    var tess = 24|0;
    var ballModel = BABYLON.MeshBuilder.CreateDisc('lb', {radius: 1, tessellation: tess, updatable: true}, scene);
    var ballColors = new Float32Array(4|0 * (tess + 3|0)); // a closed circle has tess + 3 vertices
    ballColors[0] = 0.5;            // disc center
    ballColors[1] = 0.5;
    ballColors[2] = 1.0;
    ballColors[3] = 0.8;
    for (var c = 1|0; c <= tess + 2; c++) {
        ballColors[c * 4|0] = 0.5;
        ballColors[c * 4|0 + 1|0] = 0.5;
        ballColors[c * 4|0 + 2|0] = 1.0;
        ballColors[c * 4|0 + 3|0] = 0.7;
    }
    ballModel.setVerticesData(BABYLON.VertexBuffer.ColorKind, ballColors);
    
    // laser SPS : laser triangles and balls in the same system 
    var laserSPS = new BABYLON.SolidParticleSystem("lsps", scene);
    laserSPS.addShape(laserModel, laserNb);
    laserSPS.addShape(ballModel, laserNb);
    laserSPS.buildMesh();
    laserModel.dispose();
    ballModel.dispose();
    laserSPS.isAlwaysVisible = true;
    laserSPS.computeParticleColor = false;
    laserSPS.computeParticleTexture = false;
    laserSPS.mesh.hasVertexAlpha = true;
    laserSPS.mesh.material = SF.Materials.laser;

    var laser;              // current laser object reference 
    var ball;
    var lasers = [];        // laser pool populated with laserNb lasers and laserNb laser balls
    for (var l = 0|0; l < laserNb * 2|0; l++) {
        laser = new SF.LogicalLaser(laserSPS, l);
        laser.mesh.visible = false;
        laser.mesh.scaling.y = 0.0;
        laser.mesh.scaling.x = 0.0;
        laser.mesh.position.z = this.sightDistance;
        lasers.push(laser);
    }

    // laser behavior
    laserSPS.updateParticle = function(p) {
       // process done once for the laser and its ball in the same call
       if (p.isVisible && p.idx < laserNb) {
            // move or scale lasers and balls
            laser = lasers[p.idx];                  // current laser
            ball = lasers[p.idx + laserNb];         // current related laser ball
            p.scaling.y *= laserSpeed;              // scale laser
            p.scaling.x *= laserSpeed;
            ball.mesh.scaling.x *= laserSpeed;      // scale ball
            if (ball.mesh.scaling.x < 0.02) {         
                ball.mesh.scaling.x = 0.0; 
            } else {                                // move ball on laser direction
                laser.direction.scaleToRef(canLength + 0.03 * (1.0 - Math.random() * 0.5) / p.scaling.x, ballPos);
                ball.mesh.position.copyFrom(ballPos.addInPlace(cannons[laser.cannon].position));     
            }
            ball.mesh.scaling.y = ball.mesh.scaling.x;  
            if (p.scaling.y <= 0.01) {                // target "reached" by laser
                // recycle laser
                p.scaling.y = 0.0;
                laser.fired = false;
                ball.fired = false;
                p.isVisible = false; 
                // check enemy hit here ... 
            }  
        }    
    };

    this.pool = lasers;
    this.sps = laserSPS;
    this.mesh = laserSPS.mesh
};
SF.ShipLasers.prototype.animate = function() {
    var l = 0|0;
    var search = true;
    var can = (Math.random() * 4|0)|0;
    var pointLight = SF.Lights.pointLight;
    var cannonHeats = this.gameScene.weapons.cannonHeats;
    pointLight.intensity -= 0.1;
    if (pointLight.intensity < 0.0) { pointLight.intensity = 0.0; }
    if (fired && cannonHeats[can] == 0|0) {
        cannonHeats[can] = fireHeat;
        while (l < laserNb && search) {
            laser = lasers[l];                  // current laser
            ball = lasers[l + laserNb];         // current laser ball
            if (!laser.fired) { 
                lg = starNb + l;                // related light index in the star SPS particle array
                laser.fired = true;             // activate the laser object
                laser.mesh.alive = true;        // activate the related laser mesh 
                ball.mesh.alive = true;         // activate the related laser ball
                laser.cannon = can;             // store the laser fired cannon
                ball.cannon = can;              // store the ball fired cannon
                laser.screenTarget.copyFromFloats(pointerDistanceX, pointerDistanceY);
                laser.target.copyFrom(sight.position);              // store the laser target position
                laser.direction.copyFrom(cannonDirections[can]);    // store the laser direction from its cannon
                laser.scaling = laser.direction.length();             // store the laser scale
                laser.direction.normalize();
                laser.mesh.position.copyFrom(laser.target);                     // set the laser mesh position
                laser.target.subtractToRef(camera.position, targetAxis);        // compute a cross vector from the direction and cam axis 
                BABYLON.Vector3.CrossToRef(laser.direction, targetAxis, axis3);
                BABYLON.Vector3.CrossToRef(targetAxis, axis3, axis2);
                BABYLON.Vector3.RotationFromAxisToRef(axis3, axis2, targetAxis, laser.mesh.rotation);    // rotate the laser mesh
                laser.mesh.scaling.y = laser.scaling * fovCorrection / laserSpeed;                          // scale the laser mesh triangle
                laser.mesh.scaling.x = 1.0;
                ball.mesh.scaling.x = ballRadius * (1.2 - Math.random() * 0.8);                           // scale the laser ball
                ball.mesh.scaling.y = ball.mesh.scaling.x;
                laser.direction.scaleToRef(canLength + Math.random() * 0.05, ballPos);                  // set the ball position from the cannon and the laser direction
                ball.mesh.position.copyFrom(ballPos.addInPlace(cannons[can].position));
                stars.particles[lg].alive = true;                                                                       // activate the related laser light in the star sps
                stars.particles[lg].position.x = pointerDistanceX * ballFovCorrection * aspectRatio;                    // set the laser light position in the distance with a correction
                stars.particles[lg].position.y = pointerDistanceY * ballFovCorrection;
                stars.particles[lg].position.z = lightDistance;
                stars.particles[lg].isVisible = true;                                                                   // make the laser light visible
                pointLight.position.copyFrom(ball.mesh.position);
                pointLight.intensity = plIntensity;
                search = false;                                 // a free laser is just got from the pool, don't search further
            } else {
                l++;
            }
        }
    }
    laserMesh.setParticles();   
};

// Game scene
SF.GameScene = function(canvas, engine) {

    // Global parameters
    this.starNb = 150|0;                            // star total number in the pool
    this.distance = 60.0;                           // star emitter distance from the screen
    this.starSpeed = 1.0;                           // star speed on Z axis
    this.sightDistance = 5.0;                       // sight distance     
    this.starEmitterSize = this.distance / 1.2      // size width of the particle emitter square surface
    this.canLength = 0.4;                           // cannon length
    this.canRadius = 0.04;                          // cannon radius    
    this.maxShield = 6.0;                           // initial cockpit resistance
    this.laserNb = 12|0;                            // number of avalaible lasers in the pool, suitable value around 8 (2 * 4 cannons)
    this.laserSpeed = 0.52;                         // laser decrease speed, suitable value = 0.6, the lower, the faster
    this.fireHeat = 15|0;                           // nb of frame before a cannon can fire again after a shoot, around 15 
    this.score = 0|0;                               // game score
    this.alive = true;                              // is the player alive ?

    this.canvas = canvas;
    this.scene = null;
    this.camera = null;

    this.fovCorrection = 0.0;                       // sight projection ratio from the screen space 
    this.aspectRatio = 0.0;                         //  aspect ratio from width/height screen size
    this.halfPI = Math.PI * 0.5;
    this.rotMatrix = BABYLON.Matrix.Zero();                              // rotation matrix
    this.ang = BABYLON.Vector2.Zero();                                                     // rotation angle around Y and X
    this.moderation = 6.0;                                               // moderator for max angle computation : +/- PI/2 / moderation 
    this.pointerDistance = BABYLON.Vector2.Zero()                        // pointer x and y distance to the canvas center
    this.speedVector = V(0.0, 0.0, - this.starSpeed);                    // star initial velocity vector
    this.tmpSpeed = V(0.0, 0.0, 0.0);                              	     // particle computed velocity vector
    this.canPos = new BABYLON.Vector3(-1.5, -1, 2.2);                    // Cannon0 initial position
    this.angShift = Math.atan(this.canPos.y / this.distance);            // initial angle shift due to cannon y position     
    this.keyboard = [];                                                  // input array
    this.pressedPointer = [];

    // Keyboard and mouse inputs
    var CTRL = 17|0;
    var SHIFT = 16|0;
    this.pressedPointer[0] = false;
    var keyboard = this.keyboard;                                       // vars for closure
    var pressedPointer = this.pressedPointer;
    function updateInput(event, boolVal) {
        if (event.keyCode == CTRL) { keyboard[CTRL] = boolVal; }
        if (event.keyCode == SHIFT) { keyboard[SHIFT] = boolVal; }
    }    
    window.addEventListener('keydown', function(event) { updateInput(event, true); });
    window.addEventListener('keyup', function(event) { updateInput(event, false); });
    window.addEventListener('mousedown', function(e) { pressedPointer[0] = true; });
    window.addEventListener('mouseup', function(e) { pressedPointer[0] = false; });


    // BJS Scene
    var scene = new BABYLON.Scene(engine);
    scene.clearColor = BABYLON.Color3.Black();
    this.scene = scene;
    // Camera : fixed, looking toward +Z
    var camera = new BABYLON.TargetCamera("camera", V(0.0, 0.0, 0.0), scene);
    camera.direction = V(0.0, 0.0, 1.0);
    var cameraFov = Math.tan(camera.fov * 0.5);  
    this.camera = camera;                       
    this.fovCorrection = cameraFov * this.sightDistance;                
    this.aspectRatio = engine.getAspectRatio(camera);                    

    // Light creation
    SF.CreateLights(scene);
    var light = SF.Lights.light;

    // Material creation
    SF.CreateMaterials(scene);
 
    // Starship creation
    this.starship = new SF.Starship(this);

    // Weapon creation
    this.weapons = new SF.Weapons(this);
    light.excludedMeshes = [this.weapons.sight];

    // Laser creation
    this.shipLasers = new SF.ShipLasers(this);
    light.excludedMeshes.push(this.shipLasers.mesh);

    // Star creation
    this.stars = new SF.Stars(this);
    light.excludedMeshes.push(this.stars.mesh);

    var stars = this.stars;             // vars for closure
    var weapons = this.weapons;
    scene.registerBeforeRender(function(){
        stars.animate();
        weapons.animate();
    });


};
SF.GameScene.prototype.getInputs = function() {
    this.shipLasers.fired = (this.keyboard[SHIFT] || this.pressedPointer[0]) ? true : false;
};



// Init
var init = function(game) {
    var canvas = document.querySelector('#renderCanvas');
    var engine = new BABYLON.Engine(canvas, true);
    var gameScene = new game.GameScene(canvas, engine);
    var scene =  gameScene.scene;
    window.addEventListener("resize", function() {
      engine.resize();
    });
  
    engine.runRenderLoop(function(){
      scene.render();
    });
  };