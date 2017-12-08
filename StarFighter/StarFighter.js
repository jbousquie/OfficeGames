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
    // Enemy material
    var enMat = new BABYLON.StandardMaterial("em", scene);
    enMat.emissiveColor = new BABYLON.Color3(1.0, 1.0, 1.0);
    enMat.diffuseColor = new BABYLON.Color3(0.4, 1.0, 0.8);
    enMat.diffuseTexture = rustyTexture;
    enMat.specularPower = 1024.0;
    SF.Materials.enemy = enMat;
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
    pointLight.intensity = 0.0;
    SF.Lights.pointLight = pointLight;
    SF.Lights.pointLightMaxIntensity = 0.6;

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

// Enemies
SF.Enemy = function(id, model, gameScene) {   
    this.id = id;
    this.model = model;                                                  // model mesh
    this.gameScene = gameScene;
    this.enemyShield = this.gameScene.enemyShield;
    this.enemySpeed = this.gameScene.enemySpeed;
    this.maxShield = 6|0 + (Math.random() * this.enemyShield)|0;             // Enemy resistance
    this.speed = this.enemySpeed * Math.random();                            // speed
    this.shield = this.maxShield;                                       // current shield value
    this.explosion = false;                                             // if the Enemy is exploding
    this.mustRebuild = false;                                           // if the sps must be rebuilt
    this.randAng = V(Math.random(), Math.random(), Math.random());      // random correction for enemy particle rotations and velocities
    this.initialParticlePositions = [];                                 // initial SPS particle positions computed with digest()
    this.enemyExplosionVelocity = this.gameScene.enemyExplosionVelocity;
    var scene = this.gameScene.scene;

    // enemy SPS
    var enemySPS = new BABYLON.SolidParticleSystem('esps' + this.id, scene);              // create a SPS per enemy
    enemySPS.digest(this.model, {facetNb: 1|0, delta: 6|0});                                                // digest the enemy model
    enemySPS.buildMesh();
    enemySPS.mesh.material = SF.Materials.enemy;
    enemySPS.mesh.hasVertexAlpha = false;
    this.sps = enemySPS;                                                             // Enemy SPS
    this.mesh = enemySPS.mesh;  
        // enemy SPS init
    for (var ep = 0|0; ep < enemySPS.nbParticles; ep++) {                       // initialize the enemy SPS particles
        var curPart = enemySPS.particles[ep];
        this.initialParticlePositions.push(curPart.position.clone());
        curPart.velocity.copyFrom(curPart.position);
        curPart.velocity.multiplyInPlace(this.randAng);
        curPart.velocity.scaleInPlace(this.enemyExplosionVelocity);
        curPart.uvs.z = 0.20;                                               // let's do a different render with the same texture as the cockpit one
        curPart.uvs.w = 0.08;
    }
    enemySPS.setParticles();                                                // set the particle once at their computed positions
    enemySPS.refreshVisibleSize();                                          // compute the bounding boxes
        // enemy explosion
    var enemy = this;
    enemySPS.updateParticle = function(p) {
        if (enemy.explosion) {
            enemy.mesh.hasVertexAlpha = true;
            p.position.addInPlace(p.velocity);
            p.rotation.x += p.velocity.z * enemy.randAng.x;
            p.rotation.y += p.velocity.x * enemy.randAng.y;
            p.rotation.z += p.velocity.y * enemy.randAng.z;
            p.color.a -= 0.01;
            SF.Lights.explosionLight.intensity -= 0.001;
            if (SF.Lights.explosionLight.intensity < 0.001) { SF.Lights.explosionLight.intensity = 0.0; }
            if (p.color.a < 0.01) {
                enemy.mustRebuild = true;
            }
        }
    };
        // set enemy initial positions in space
    enemySPS.mesh.position.z = 50.0 + Math.random() * 10.0;
    enemySPS.mesh.position.y = -4.0 + Math.random() * 8.0;
    enemySPS.mesh.position.x = -this.gameScene.enemyNb * 4.0 + this.gameScene.enemyNb * 2.0 * this.id;
    enemySPS.mesh.rotation.z = Math.random() * this.id;    
};
SF.Enemy.prototype.shoot = function() {

};

SF.Enemy.prototype.explode = function() {
    this.explosion = true;
};
SF.Enemy.prototype.rebuild = function() {
    this.explosion = false;
    this.mesh.hasVertexAlpha = false;
    this.mustRebuild = false;
    this.shield = this.maxShield;
    for (var ip = 0|0; ip < this.sps.nbParticles; ip++) {
        this.sps.particles[ip].position.copyFrom(this.initialParticlePositions[ip]);
        this.sps.particles[ip].color.a = 1.0;
        this.sps.particles[ip].rotation.x = 0.0;
        this.sps.particles[ip].rotation.y = 0.0;
        this.sps.particles[ip].rotation.z = 0.0;
        this.sps.particles[ip].velocity.copyFrom(this.sps.particles[ip].position);
        this.sps.particles[ip].velocity.scaleInPlace(Math.random() * this.enemyExplosionVelocity);
    } 
    this.sps.setParticles();  
};
SF.Enemies = function(gameScene) {
    this.gameScene = gameScene;
    this.enemyNb = this.gameScene.enemyNb;
    this.pool = [];
    var scene = this.gameScene.scene;
    // Enemy model
    var disc1 = BABYLON.MeshBuilder.CreateCylinder('', { height: 0.1, tessellation: 16|0, diameter: 3.2 }, scene);    
    var disc2 = BABYLON.MeshBuilder.CreateCylinder('', { height: 0.1, tessellation: 16|0, diameter: 3.2 }, scene);
    var cyl = BABYLON.MeshBuilder.CreateCylinder('', { diameter: 0.5, height: 4.0, subdivisions: 2|0 }, scene);
    var sph = BABYLON.MeshBuilder.CreateSphere('', { diameter: 2.0, segments: 4|0}, scene);
    cyl.rotation.z = this.gameScene.halfPI;
    disc1.rotation.z = this.gameScene.halfPI;      
    disc2.rotation.z = -this.gameScene.halfPI;
    disc1.position.x = 2.0;
    disc2.position.x = -2.0;        
    var enemyModel = BABYLON.Mesh.MergeMeshes([cyl, sph, disc1, disc2], true, true);

    for (var e = 0; e < this.enemyNb; e++) {  
        this.pool[e] = new SF.Enemy(e, enemyModel, this.gameScene);
    }
    enemyModel.dispose();
};
SF.Enemies.prototype.animate = function() {
    var EnemyLimitX = 0.0;
    var EnemyLimitY = 0.0;
    var k = 0.0;
    var sign = 1.0;
    for (var e = 0|0; e < this.enemyNb; e++) {
        var en = this.pool[e];
        if (en.explosion) {             // if currently exploding
            en.mesh.hasVertexAlpha = true;
            if (en.mustRebuild) {       // if explosion just finished, then rebuild and reset the Enemy
                en.rebuild();
                en.randAng.multiplyByFloats(Math.random(), Math.random(), Math.random());
            }
            else {
                en.sps.setParticles();
            }
        } else {
            // Ennnemy flying around, tmp behavior : sinusoidal trajectory
            sign = (e % 2 === 0) ? 1.0 : -1.0;
            k = Date.now() * 0.0001 * sign * en.speed;
                // keep the enemy around the frustum
            EnemyLimitY = en.mesh.position.z * this.gameScene.cameraFov * 2.0;
            EnemyLimitX = EnemyLimitY * this.gameScene.aspectRatio;
            if (en.mesh.position.x < -EnemyLimitX) { en.mesh.position.x = -EnemyLimitX; }
            if (en.mesh.position.x > EnemyLimitX)  { en.mesh.position.x = EnemyLimitX; }
            if (en.mesh.position.y < -EnemyLimitY) { en.mesh.position.y = -EnemyLimitY; }
            if (en.mesh.position.y > EnemyLimitY)  { en.mesh.position.y = EnemyLimitY; }

            en.mesh.rotation.z += Math.sin(k) / (10.0 + e * 5.0) * en.speed;
            en.mesh.rotation.y += (Math.sin(k) / (10.0 + e * 5.0)) / 8.0;
            en.mesh.position.z = this.gameScene.sightDistance + this.gameScene.distance * (1.0 + Math.sin(k + e));
            en.mesh.position.x += Math.cos(k - e) / 5.0;
            en.mesh.position.y += Math.sin(k + e / 2.0) / 8.0;
        }
        en.mesh.position.x -= this.gameScene.pointerDistance.x * en.mesh.position.z  / this.gameScene.distance;
        en.mesh.position.y -= this.gameScene.pointerDistance.y * en.mesh.position.z  / this.gameScene.distance;

        // shooting
        if (Math.random() < this.enemyFireFrequency && en.mesh.position.z > this.enemyFireLimit && !en.explosion) {
            en.shoot();
        }
    }

};
SF.EnemyLasers = function(gameScene) {
    var scene = this.gameScene.scene;
    this.enemyLaserNb = this.gameScene.enemyLaserNb;
    this.enemyLaserSpeed = this.gameScene.enemyLaserSpeed;
    this.enemyLaserInitialColor = this.gameScene.enemyLaserInitialColor;
    
    var enemyLaserModel = BABYLON.MeshBuilder.CreatePlane("elm", {size: 0.2}, scene);
    var enemyLaserSPS = new BABYLON.SolidParticleSystem('elsps', scene);
    enemyLaserSPS.addShape(enemyLaserModel, this.enemyLaserNb);
    enemyLaserSPS.buildMesh();
    this.sps = enemyLaserSPS;
    this.mesh = enemyLaserSPS.mesh;
    enemyLaserSPS.mesh.material = SF.Materials.star;
    for (var l = 0; l < this.enemyLaserNb; l++) {
        var laser = enemyLaserSPS.particles[l];
        laser.isVisible = false;
        laser.color.copyFrom(this.enemyLaserInitialColor);    
    }
    enemyLaserSPS.setParticles();
    enemyLaserSPS.isAlwaysVisible = true;
    enemyLaserSPS.computeParticleTexture = false;
    
    // enemy laser SPS behavior
    var pointerDistance = this.gameScene.pointerDistance;
    var distance = this.gameScene.distance;
    var cockpitArea = this.gameScene.cockpitArea;
    enemyLaserSPS.updateParticle= function(p) {
        if (p.isVisible) {
            p.position.addInPlace(p.velocity);
            p.position.x += pointerDistance.x * p.position.z * p.velocity.z / distance;
            p.position.y += pointerDistance.y * p.position.z * p.velocity.z / distance;
            p.rotation.z += 0.66;
            p.scaling.x = 2.0 + cockpitArea.z / p.position.z * 4.0;
            p.scaling.y = 4.0 * p.scaling.x;
            p.color.a += 0.005;
            p.color.r += 0.01;
            p.color.g += 0.01;
            if (p.color.a > 0.9) { p.color.a = 0.9; }
            if (p.color.r > 1.0) { p.color.r = 1.0; }
            if (p.color.g < 0.0) { p.color.g = 0.0; }
        }
    };

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
    this.distance = this.gameScene.distance;
    this.canRadius = this.gameScene.canRadius;
    this.canLength = this.gameScene.canLength;
    this.laserNb = this.gameScene.laserNb;
    this.laserSpeed = this.gameScene.laserSpeed;
    this.ballRadius = this.canRadius * 8.0;          // ball initial radius
    this.ballPos = V(0.0, 0.0, 0.0);                 // tmp ball position to be added to its cannon
    this.targetAxis = V(0.0, 0.0, 0.0);              // tmp cross vector target/camera
    this.axis2 = V(0.0, 0.0, 0.0);                   // tmp cross vector laser/targetAxis
    this.axis3 = V(0.0, 0.0, 0.0);                   // tmp cross vector laser/targetAxis 
    this.fired = false;                                 // fire trigger pushed ?
    this.cannons = this.gameScene.weapons.cannons;
    this.cannonHeats = this.gameScene.weapons.cannonHeats;
    this.cannonDirections = this.gameScene.weapons.cannonDirections;
    this.fireHeat = this.gameScene.fireHeat;
    this.pointerDistance = this.gameScene.pointerDistance;
    this.sight = this.gameScene.weapons.sight;
    this.camera = this.gameScene.camera;
    this.fovCorrection = this.gameScene.fovCorrection;
    this.laserLightInitialColor = this.gameScene.laserLightInitialColor;
    this.lightDistance = this.gameScene.lightDistance;
    this.ballFovCorrection = this.gameScene.ballFovCorrection;

    // laser model
    var positions = [-this.canRadius * 2, -1.0, 0.0, this.canRadius * 2, -1.0, 0.0, 0.0, 0.0, 0.0];
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
    laserSPS.addShape(laserModel, this.laserNb);
    laserSPS.addShape(ballModel, this.laserNb);
    laserSPS.buildMesh();
    laserModel.dispose();
    ballModel.dispose();
    laserSPS.isAlwaysVisible = true;
    laserSPS.computeParticleColor = false;
    laserSPS.computeParticleTexture = false;
    laserSPS.mesh.hasVertexAlpha = true;
    laserSPS.mesh.material = SF.Materials.laser;

    // laser lights in the distance SPS
    var laserLightModel = BABYLON.MeshBuilder.CreatePlane("llmd", {size: 0.2}, scene);
    var laserLightSPS = new BABYLON.SolidParticleSystem("llsps", scene);
    laserLightSPS.addShape(laserLightModel, this.laserNb);
    laserLightSPS.buildMesh();
    laserLightModel.dispose();
    laserLightSPS.isAlwaysVisible = true;
    laserLightSPS.computeParticleTexture = false;
    laserLightSPS.mesh.hasVertexAlpha = true;
    laserLightSPS.mesh.material = SF.Materials.star;
    for (var i = 0|0; i < this.laserNb; i++) {
        var p = laserLightSPS.particles[i];
        p.isVisible = false;
        p.position.z = this.lightDistance;
        p.velocity.z = 0.5;
        p.color.copyFrom(this.laserLightInitialColor);
        p.scaling.x = this.distance / this.lightDistance * 1.2;
        p.scaling.y = p.scaling.x;
    }
    laserLightSPS.setParticles();
    var pointerDistance = this.pointerDistance;   // vars for closure
    var distance = this.distance;
    laserLightSPS.updateParticle = function(p) {
        if (p.isVisible) {
            p.position.z += p.velocity.z;
            p.position.x -= pointerDistance.x * p.position.z * p.velocity.z / distance;
            p.position.y -= pointerDistance.y * p.position.z * p.velocity.z / distance;
            if (p.position.z > distance) {
                p.isVisible = false;
            }
        }        
    };

    var laser;              // current laser object reference 
    var ball;
    var lasers = [];        // laser pool populated with laserNb lasers and laserNb laser balls
    for (var l = 0|0; l < this.laserNb * 2|0; l++) {
        laser = new SF.LogicalLaser(laserSPS, l);
        laser.mesh.isVisible = false;
        laser.mesh.scaling.y = 0.0;
        laser.mesh.scaling.x = 0.0;
        laser.mesh.position.z = this.sightDistance;
        lasers.push(laser);
    }

    // laser behavior
    var laserNb = this.laserNb;
    var laserSpeed = this.laserSpeed;
    var canLength = this.canLength;
    var ballPos = this.ballPos;
    var cannons = this.cannons;
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
    this.laserLightSPS = laserLightSPS;
    this.mesh = laserSPS.mesh
};
SF.ShipLasers.prototype.animate = function() {
    var l = 0|0;
    var search = true;
    var can = (Math.random() * 4|0)|0;
    var pointLight = SF.Lights.pointLight;
    pointLight.intensity -= 0.1;
    if (pointLight.intensity < 0.0) { pointLight.intensity = 0.0; }
    if (this.fired && this.cannonHeats[can] == 0|0) {
        this.cannonHeats[can] = this.fireHeat;
        while (l < this.laserNb && search) {
            var laser = this.pool[l];                  // current laser
            var ball = this.pool[l + this.laserNb];         // current laser ball
            var laserLights = this.laserLightSPS.particles;
            if (!laser.fired) { 
                var lg = this.starNb + l;       // related light index in the star SPS particle array
                laser.fired = true;             // activate the laser object
                laser.mesh.isVisible = true;    // activate the related laser mesh 
                ball.mesh.isVisible = true;     // activate the related laser ball
                laser.cannon = can;             // store the laser fired cannon
                ball.cannon = can;              // store the ball fired cannon
                laser.screenTarget.copyFromFloats(this.pointerDistance.x, this.pointerDistance.y);
                laser.target.copyFrom(this.sight.position);              // store the laser target position
                laser.direction.copyFrom(this.cannonDirections[can]);    // store the laser direction from its cannon
                laser.scaling = laser.direction.length();             // store the laser scale
                laser.direction.normalize();
                laser.mesh.position.copyFrom(laser.target);                     // set the laser mesh position
                laser.target.subtractToRef(this.camera.position, this.targetAxis);        // compute a cross vector from the direction and cam axis 
                BABYLON.Vector3.CrossToRef(laser.direction, this.targetAxis, this.axis3);
                BABYLON.Vector3.CrossToRef(this.targetAxis, this.axis3, this.axis2);
                BABYLON.Vector3.RotationFromAxisToRef(this.axis3, this.axis2, this.targetAxis, laser.mesh.rotation);    // rotate the laser mesh
                laser.mesh.scaling.y = laser.scaling * this.fovCorrection / this.laserSpeed;                          // scale the laser mesh triangle
                laser.mesh.scaling.x = 1.0;
                ball.mesh.scaling.x = this.ballRadius * (1.2 - Math.random() * 0.8);                           // scale the laser ball
                ball.mesh.scaling.y = ball.mesh.scaling.x;
                laser.direction.scaleToRef(this.canLength + Math.random() * 0.05, this.ballPos);                  // set the ball position from the cannon and the laser direction
                ball.mesh.position.copyFrom(this.ballPos.addInPlace(this.cannons[can].position));
                // laser lights in the distance
                laserLights[l].isVisible = true;                                                                       // activate the related laser light in the star sps
                laserLights[l].position.x = this.pointerDistance.x * this.ballFovCorrection * this.gameScene.aspectRatio;                    // set the laser light position in the distance with a correction
                laserLights[l].position.y = this.pointerDistance.y * this.ballFovCorrection;
                laserLights[l].position.z = this.lightDistance;
                // laser lightning the scene
                pointLight.position.copyFrom(ball.mesh.position);
                pointLight.intensity = SF.Lights.pointLightMaxIntensity;
                search = false;                                 // a free laser is just got from the pool, don't search further
            } else {
                l++;
            }
        }
    }
    this.sps.setParticles();  
    this.laserLightSPS.setParticles(); 
};

// Game scene
SF.GameScene = function(canvas, engine) {

    // Global parameters

        // stars
    this.starNb = 150|0;                            // star total number in the pool
    this.distance = 60.0;                           // star emitter distance from the screen
    this.starSpeed = 1.0;                           // star speed on Z axis
    this.starEmitterSize = this.distance / 1.2      // size width of the particle emitter square surface
        // sight, laser, weapons and cockpit
    this.sightDistance = 5.0;                       // sight distance     
    this.canLength = 0.4;                           // cannon length
    this.canRadius = 0.04;                          // cannon radius    
    this.maxShield = 6.0;                           // initial cockpit resistance
    this.laserNb = 12|0;                            // number of avalaible lasers in the pool, suitable value around 8 (2 * 4 cannons)
    this.laserSpeed = 0.52;                         // laser decrease speed, suitable value = 0.6, the lower, the faster
    this.fireHeat = 15|0;                           // nb of frame before a cannon can fire again after a shoot, around 15 
    this.cockpitArea = V(1.0, 1.0, 2.5);            // cockpit sensitive area (-x to x, -y to y, fixed z)
    this.laserLightInitialColor = new BABYLON.Color4(0.4, 0.4, 1.0, 0.8);
        // enemies
    this.enemyNb = 10|0;                            // Max number of enemies
    this.enemySpeed = 3.0;                          // enemy max speed
    this.enemyExplosionVelocity = 1.15;             // enemy particle max velocity
    this.enemyLaserNb = 60|0;                       // enemy laser max number
    this.enemyLaserSpeed = 2.0;                     // enemy laser speed
    this.enemyShield = 8|0;                         // enemy shield = 6 + random * enemyShield
    this.enemyFireFrequency = 0.15;                 // between 0 and 1 : each frame for each enemy
    this.enemyFireLimit = 4.0 * this.sightDistance; // enemy doesn't fire under this z limit
    this.enemyLaserInitialColor = new BABYLON.Color4(0.8, 0.0, 0.0, 0.5);
    this.impactInitialColor = new BABYLON.Color4(0.6, 0.6, 1.0, 0.85); // as their names suggest it
    this.explosionInitialColor = new BABYLON.Color4(1.0, 1.0, 0.0, 0.98);
    
    // members
    this.canvas = canvas;
    this.scene = null;
    this.camera = null;
    this.engine = engine;

    this.alive = true;                              // is the player alive ?
    this.score = 0|0;                               // game score   
    this.fovCorrection = 0.0;                       // sight projection ratio from the screen space 
    this.aspectRatio = 0.0;                         //  aspect ratio from width/height screen size
    this.halfPI = Math.PI * 0.5;
    this.lightDistance = this.distance * 0.66;      // distance from where the laser lights are emitted
    this.ballFovCorrection = 0.0;                   // FOV correction for the balls in the distance
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
    this.keys = {
        CTRL: 17|0,
        SHIFT: 16|0
    };

    this.pointer = {left: false};
    var keyboard = this.keyboard;                                       // vars for closure
    var pointer = this.pointer;
    var keys = this.keys
    function updateInput(event, boolVal) {
        if (event.keyCode == keys.CTRL)  { keyboard[keys.CTRL] = boolVal; }
        if (event.keyCode == keys.SHIFT) { keyboard[keys.SHIFT] = boolVal; }
        if (event.button === 0) { pointer.left = boolVal; }
    }    
    window.addEventListener('keydown', function(event) { updateInput(event, true); });
    window.addEventListener('keyup', function(event)   { updateInput(event, false);});
    window.addEventListener('pointerdown', function(event) { updateInput(event, true); });
    window.addEventListener('pointerup', function(event)   { updateInput(event, false);});


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
    this.ballFovCorrection = cameraFov * this.lightDistance; 

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
    light.excludedMeshes.push(this.shipLasers.laserLightSPS.mesh);

    // Star creation
    this.stars = new SF.Stars(this);
    light.excludedMeshes.push(this.stars.mesh);

    // Enemy creation
    this.enemies = new SF.Enemies(this);

    var stars = this.stars;             // vars for closure
    var weapons = this.weapons;
    var shipLasers = this.shipLasers;
    var enemies = this.enemies;
    var gameScene = this;
    scene.registerBeforeRender(function(){
        gameScene.setCamera();
        gameScene.getInputs();
        stars.animate();
        weapons.animate();
        shipLasers.animate();
        enemies.animate();
    });

};
SF.GameScene.prototype.getInputs = function() {
    this.shipLasers.fired = (this.keyboard[this.keys.SHIFT] || this.pointer.left) ? true : false;
};
SF.GameScene.prototype.setCamera = function() {
    this.aspectRatio = this.engine.getAspectRatio(this.camera);
}


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