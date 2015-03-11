function Animation(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse, angle, registry) {
    this.spriteSheet = spriteSheet;
    this.startX = startX;
    this.startY = startY;
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = frameHeight;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.reverse = reverse;
	this.angle = angle;
	this.registry = registry || 0;
	this.cache = [];
	var cacheSource = -1;
	if (registry !== 0) {
		cacheSource = scanRegistry(this.angle, globalAngleTolerance, this.registry);
	}
	//if there is a valid source for this animation use its cache
	if (cacheSource >= 0) {
		this.cache = this.registry[cacheSource].cache;
	} else {
		//otherwise generate empty cache of rotated sprites
		for (var i = 0; i < this.frames; i++) {
			this.cache[i] = 0;
		}
	}

	
	
}

Animation.prototype.generateFrame = function (i) {
	var scaleBy = scaleBy || 1;

	index = i;
	var vindex = 0;
	if ((index + 1) * this.frameWidth + this.startX > this.spriteSheet.width) {
	index -= Math.floor((this.spriteSheet.width - this.startX) / this.frameWidth);
       	vindex++;
    }
    while ((index + 1) * this.frameWidth > this.spriteSheet.width) {
       	index -= Math.floor(this.spriteSheet.width / this.frameWidth);
       	vindex++;
    }
		
	var offscreenCanvas = document.createElement('canvas');
	
	var size = Math.max(this.frameWidth * scaleBy, this.frameHeight * scaleBy);
	offscreenCanvas.width = size;
	offscreenCanvas.height = size;
	var offscreenCtx = offscreenCanvas.getContext('2d');
	offscreenCtx.save();
	
	offscreenCtx.translate(size / 2, size / 2);
		
	offscreenCtx.rotate(this.angle);
	offscreenCtx.translate(0, 0);
	var offset = vindex === 0 ? this.startX : 0;
	offscreenCtx.drawImage(this.spriteSheet, index * this.frameWidth + offset, vindex * this.
				frameHeight + this.startY,  // source from sheet
				this.frameWidth, this.frameHeight,
				-(this.frameWidth / 2), -(this.frameWidth / 2),
				this.frameWidth * scaleBy,
				this.frameHeight * scaleBy);

	offscreenCtx.restore();
	this.cache[i] = offscreenCanvas;
}

//returns boolean of whether all sprites in the cache have been generated
Animation.prototype.completeCache = function () {
	for (var i = 0; i < this.frames; i++) {
		if (this.cache[i] === 0) {
			return false;
		}
	}
	return true;
}

Animation.prototype.drawFrame = function (tick, ctx, x, y, scaleBy) {
    var scaleBy = scaleBy || 1;
    this.elapsedTime += tick;
    if (this.loop) {
        if (this.isDone()) {
            this.elapsedTime = 0;
        }
    } else if (this.isDone()) {
        return;
    }
    var index = this.reverse ? this.frames - this.currentFrame() - 1 : this.currentFrame();
    var vindex = 0;
    if ((index + 1) * this.frameWidth + this.startX > this.spriteSheet.width) {
        index -= Math.floor((this.spriteSheet.width - this.startX) / this.frameWidth);
        vindex++;
    }
    while ((index + 1) * this.frameWidth > this.spriteSheet.width) {
        index -= Math.floor(this.spriteSheet.width / this.frameWidth);
        vindex++;
    }

    var locX = x;
    var locY = y;
    var offset = vindex === 0 ? this.startX : 0;
	if (this.cache[this.currentFrame()] === 0) {
		this.generateFrame(this.currentFrame());
	}
	ctx.drawImage(this.cache[this.currentFrame()], 0, 0, this.frameHeight, this.frameWidth, 
					locX, locY, this.frameWidth*scaleBy, this.frameHeight*scaleBy);
}

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}


function Message(game, message, x, y, color, fade, duration, fontsize) {
	this.message = message;
	this.alpha = 1;
	this.fontType = " Verdana";
	this.fontSize = fontsize || "8pt";
	this.fade = fade || false;
	this.duration = duration * 60;
	this.color = color || "white";
	this.x = x;
	this.y = y;
	
	Entity.call(this, game, this.x, this.y);
}

Message.prototype = new Entity();
Message.prototype.constructor = Message;

Message.prototype.update = function () {
    this.alpha = this.alpha - .03;
    if (this.duration) this.duration--;
    
	
    if (this.fade && this.alpha < 0) {
        this.removeFromWorld = true;
    }
    if (this.duration && this.duration <= 1) {
        this.removeFromWorld = true;
    }
}

Message.prototype.draw = function () {
	this.game.ctx.save();
	this.game.ctx.font = this.fontSize + this.fontType;
	if (this.fade) this.game.ctx.globalAlpha = this.alpha;
	this.game.ctx.fillStyle = this.color;
    this.game.ctx.fillText(this.message, this.x, this.y);
	this.game.ctx.restore();
}

function clickExplode(game) {
    this.animation = new Animation(ASSET_MANAGER.getAsset("./img/clickExplode.png"), 0, 0, 66.7, 66.7, 0.03, 32, false, false);
    var sound

    //check if shiftkey is pressed to eliminate the audio pollution
    if (!game.click.shiftKey) {
        sound = new Audio("./audio/boom.wav");
    } else {
        sound = ASSET_MANAGER.getAsset("./audio/boom.wav");
    }

    sound.volume = .1;
    if (!game.music.isMute) sound.play();
	this.game = game;
	this.x = -200;
	this.y = -200;
    Entity.call(this, game, this.x, this.y);
}

clickExplode.prototype = new Entity();
clickExplode.prototype.constructor = clickExplode;

clickExplode.prototype.draw = function(ctx) {
	this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y, .9);
    //Entity.prototype.draw.call(this);
}

clickExplode.prototype.update = function() {
	if(this.game.click != null) {
		this.x = this.game.click.layerX - this.animation.frameWidth*.9/2;
		this.y = this.game.click.layerY - this.animation.frameHeight*.9/2;
		Entity.prototype.update.call(this);
	}
	if(this.animation.isDone()) this.removeFromWorld = true;
}

//boolean to denote whether the range of towers/castle is displayed
var displayRadius = true;

globalAngleTolerance = 3;	//angle limit which entities will look the same in degrees
//in order to add registries to a entity:

//global method for determining whether an animation should be added to a registry
//returns index of acceptable animation or -1 if there is none, given
//angle of animation to add, angleTolerance the space between animations allowable in the registry, registry to add to
scanRegistry = function(angle, angleTolerance, registry) {
	for (var i = 0; i < registry.length; i++) {
		var angleDif = (angle - registry[i].angle) * 180 / Math.PI;
		if (angleDif <= angleTolerance && angleDif >= -angleTolerance) {
			return i;
		}
	}
	return -1;
}

//Method to manage monster's behavior each update cycle
function monsterUpdateBehavior(monster, walkRegistry, attackRegistry) {
    //get name of the monster
    var name = monster.constructor.name;

    //user clicked on the screen
    if (monster.game.click && !monster.game.gameOver) {
        //calculate the difference in x and y of the click to this entity's x/y
        var diffx = Math.abs(monster.game.click.layerX - (monster.x + (64 * monster.scale)));
        var diffy = Math.abs(monster.game.click.layerY - (monster.y + (64 * monster.scale)));

        //see if the difference is within a certain range
        if (diffx <= (70 * monster.scale) && diffy <= (70 * monster.scale) || monster.game.click.shiftKey) {
            //decrement health
            monster.health--;
            monster.game.addTopEntity(new clickExplode(monster.game));
            //add new message entity to the game
            //if (monster.health > 0) {
            //    monster.game.addTopEntity(new Message(monster.game, "Health: " + monster.health + "/" + monster.maxHealth, monster.game.click.layerX - (monster.game.ctx.measureText("Health: " + monster.health + "/" + monster.maxHealth).width / 2), monster.game.click.layerY - 25, null, true));
            //}
        }
    }

    //monster is dead
    if (monster.health <= 0) {
        //update the scoreboard to reflect the coin increase
        monster.game.scoreBoard.updateScore(monster.coinWorth);
        //show a new message to notify user of coin-worth
        monster.game.addTopEntity(new Message(monster.game, "+" + monster.coinWorth + " Coins", monster.x, monster.y - (monster.animation.frameWidth * monster.scale / 2), null, true));
        monster.removeFromWorld = true;
        //increase the log of this particular monster killed
        if (name === "Zombie") {
            monster.game.monstersKilled.Zombies++;
        } else if (name === "Archer") {
            monster.game.monstersKilled.Archers++;
        } else if (name === "Warrior") {
            monster.game.monstersKilled.Warriors++;
        } else {
            monster.game.monstersKilled.Berserkers++;
        }
        
        //add animations to respective registries if there is space and the animation is completely cached
        if (monster.animation.completeCache() && scanRegistry(monster.angle, globalAngleTolerance, walkRegistry) === -1) {
            walkRegistry.push(monster.animation);
        }
        if (monster.attackingAnimation.completeCache() && scanRegistry(monster.angle, globalAngleTolerance, attackRegistry) === -1) {
            attackRegistry.push(monster.attackingAnimation);
        }
    }

    //if/else to manage attack animation reset and movement of monster
    if (monster.attacking) {
        //if monster is not an archer, play attack sound
        if (name !== "Archer") new AttackSound(monster.game);
        monster.attackTimer--;
        //attacking animation reset
        if (monster.attackingAnimation.isDone()) {
            monster.attackingAnimation.elapsedTime = 0;
            monster.animation.elapsedTime = 0;
        }
        //monster is ready to deal its damage
        if (monster.attackTimer === 0) {
            //if not an Archer just apply damage directly
            if (name !== "Archer") {
                monster.target.health -= monster.damage;
            } else { //is Archer so fire a new arrow
                monster.game.addTopEntity(new ArrowAttack(monster.game, monster.x + (monster.attackingAnimation.frameWidth * monster.scale / 2), monster.y + (monster.attackingAnimation.frameHeight * monster.scale / 2), 400, 400));
            }
            //reset timer
            monster.attackTimer = monster.defaultAttackTimer;
        }
    } else { //check and update the range of the monster towards it's target
        if (monster.toCollide > monster.range) { //not yet reached it's attack range
            monster.y += monster.unitY * monster.speed;
            monster.x += monster.unitX * monster.speed;
            monster.toCollide--;
        } else { //is in range, attack
            monster.attacking = true;
        }
    }
}

//Method for finding the closest target for necessary monsters
function findTarget(monster, game) {
    var target = {index: null, distance: null};

    //check all buildings to find the closest
    for (var i = 0; i < game.buildingEntities.length; i++) {
        var building = game.buildingEntities[i];
        var dx = (monster.x + (monster.animation.frameWidth * monster.scale / 2)) - (building.buildX + (building.image.width * building.scale / 2));
        var dy = (monster.y + (monster.animation.frameHeight * monster.scale / 2)) - (building.buildY + (building.image.width * building.scale / 2));

        var distance = Math.sqrt(dx * dx + dy * dy);

        if (!target.index && target.index !== 0 || target.distance && target.distance > distance) {
            target.index = i;
            target.distance = distance;
        } 
    }

    //set monster's target and target's X and Y coordinate
    monster.target = game.buildingEntities[target.index];
    
    monster.targetX = monster.target.buildX + (monster.target.image.width * monster.target.scale / 2);
    monster.targetY = monster.target.buildY + (monster.target.image.height * monster.target.scale / 2);
    
    var difX = monster.targetX - (monster.x + (monster.animation.frameWidth * monster.scale / 2)); // x,y of vector to center
    var difY = monster.targetY - (monster.y + (monster.animation.frameHeight * monster.scale / 2));
    monster.magnitude = Math.sqrt(difX * difX + difY * difY);
    monster.angle = 4 / 2 * Math.PI - Math.atan(difX / difY);
    if (monster.y < monster.targetY) {
        monster.angle += Math.PI;
    }
    monster.unitX = difX / monster.magnitude; //x,y of unit vector to center
    monster.unitY = difY / monster.magnitude;

    //calculate range that monster attacks at
    monster.range = ((Math.max(monster.target.image.width, monster.target.image.height)  / 2 * monster.target.scale) / monster.speed) + 25;

    monster.toCollide = (monster.magnitude) / monster.speed;//steps to hit castle
}

//MONSTERS

//1. add specific global registries for each animation as empty arrays outside the constructor
//2. pass the specific global registry(s) to the animation(s) in the constructor
//3. add logic for adding to the registries when the entities are destroyed or complete.
zombieWalkRegistry = [];
zombieAttackRegistry = [];

function Zombie(game, x, y) {    
    this.attacking = false;
    this.scale = .4;
    this.radius = 100;
	this.maxHealth = 2;
	this.health = this.maxHealth;
	this.defaultAttackTimer = 90;
	this.attackTimer = this.defaultAttackTimer;
	this.coinWorth = 50;
	this.damage = 1;
	this.x = x;
	this.y = y;
	this.speed = .2 * game.speedModifier; //speed to modify unit vector
	this.angle = 0;

    //used twice to get the frame widths for better calculations, will be changed after findTarget call
	this.animation = new Animation(ASSET_MANAGER.getAsset("./img/zombie.png"), 0, 0, 128, 128, 0.05, 30, true, false, this.angle, zombieWalkRegistry);
	this.attackingAnimation = new Animation(ASSET_MANAGER.getAsset("./img/zombie.png"), 384, 384, 128, 128, 0.05, 40, true, false, this.angle, zombieAttackRegistry);


	findTarget(this, game, this.speed);

	
	/*
	if (scanRegistry(this.angle, globalAngleTolerance, zombieWalkingRegistry) !== -1 && this.animation.completeCache()) {
		zombieWalkingRegistry.push(this.animation);
	}
	if (scanRegistry(this.angle, globalAngleTolerance, zombieAttackingRegistry) !== -1 && this.attackingAnimation.completeCache()) {
		zombieAttackRegisty.push(this.attackingAnimation);
	}
	*/
	
	this.animation = new Animation(ASSET_MANAGER.getAsset("./img/zombie.png"), 0, 0, 128, 128, 0.05, 30, true, false, this.angle, zombieWalkRegistry);
	this.attackingAnimation = new Animation(ASSET_MANAGER.getAsset("./img/zombie.png"), 384, 384, 128, 128, 0.05, 40, true, false, this.angle, zombieAttackRegistry);



	Entity.call(this, game, this.x, this.y);	
	
}

Zombie.prototype = new Entity();
Zombie.prototype.constructor = Zombie;

Zombie.prototype.update = function () {
    monsterUpdateBehavior(this, zombieWalkRegistry, zombieAttackRegistry);

	if (this.target.health <= 0 || !this.target) {
	    findTarget(this, this.game);
	    this.attacking = false;
	    this.animation = new Animation(ASSET_MANAGER.getAsset("./img/zombie.png"), 0, 0, 128, 128, 0.05, 30, true, false, this.angle, zombieWalkRegistry);
	    this.attackingAnimation = new Animation(ASSET_MANAGER.getAsset("./img/zombie.png"), 384, 384, 128, 128, 0.05, 40, true, false, this.angle, zombieAttackRegistry);
	}
	
    Entity.prototype.update.call(this);
}

Zombie.prototype.draw = function (ctx) {
    if (this.attacking) {
        this.attackingAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.scale);
        this.width = this.attackingAnimation.frameWidth * this.scale;
    } else {
        this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.scale);
        this.width = this.animation.frameWidth * this.scale;
    }
	
    Entity.prototype.draw.call(this);
}

archerWalkRegistry = [];
archerAttackRegistry = [];

function Archer(game, x, y) {
    this.scale = .5;
    this.attacking = false;
    this.radius = 100;
    this.maxHealth = 5;
    this.health = this.maxHealth;
    this.defaultAttackTimer = 80;
    this.attackTimer = this.defaultAttackTimer;
    this.coinWorth = 100;
    this.x = x;
    this.y = y;
    this.target = game.buildingEntities[0];
    this.targetX = this.target.buildX + (this.target.image.width * this.target.scale / 2);
    this.targetY = this.target.buildY + (this.target.image.height * this.target.scale / 2);
    //calculate angle to target, 400,400 to center for now
    var difX = this.targetX - this.x; // x,y of vector to center
    var difY = this.targetY - this.y;
    var magnitude = Math.sqrt(difX * difX + difY * difY);
    this.angle = 4 / 2 * Math.PI - Math.atan(difX / difY);
    if (this.y < this.targetY) {
        this.angle += Math.PI;
    }
    this.angle += Math.PI/2;
    this.unitX = difX / magnitude; //x,y of unit vector to center
    this.unitY = difY / magnitude;
    this.speed = .25 * game.speedModifier; //speed to modify unit vector
    this.range = 200 / this.speed;
    this.toCollide = (magnitude) / this.speed;//steps to hit castle

    this.animation = new Animation(ASSET_MANAGER.getAsset("./img/archerwalk.png"), 0, 0, 127, 127, 0.05, 24, true, false, this.angle, archerWalkRegistry);
    this.attackingAnimation = new Animation(ASSET_MANAGER.getAsset("./img/archerattack.png"), 0, 0, 127, 127, 0.1, 26, true, false, this.angle, archerAttackRegistry);


    Entity.call(this, game, this.x, this.y);
}

Archer.prototype = new Entity();
Archer.prototype.constructor = Archer;

Archer.prototype.update = function () {
    monsterUpdateBehavior(this, archerWalkRegistry, archerAttackRegistry);

    Entity.prototype.update.call(this);
}

Archer.prototype.draw = function (ctx) {
    if (this.attacking) {
        this.attackingAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.scale);
        this.width = this.attackingAnimation.frameWidth * this.scale;
    } else {
        this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.scale);
        this.width = this.animation.frameWidth * this.scale;
    }

    Entity.prototype.draw.call(this);
}

warriorWalkRegistry = [];
warriorAttackRegistry = [];

function Warrior(game, x, y) {
    this.scale = .5;
    this.attacking = false;
    this.radius = 100;
    this.maxHealth = 10;
    this.health = this.maxHealth;
    this.defaultAttackTimer = 50;
    this.attackTimer = this.defaultAttackTimer;
    this.coinWorth = 150;
    this.damage = 1;
    this.x = x;
    this.y = y;
    
    this.speed = .4 * game.speedModifier; //speed to modify unit vector
    this.angle = 0;

    //used twice, will be overwritten once findTarget is called
    this.animation = new Animation(ASSET_MANAGER.getAsset("./img/warriorwalk.png"), 0, 0, 127, 127, 0.05, 24, true, false, this.angle, warriorWalkRegistry);
    this.attackingAnimation = new Animation(ASSET_MANAGER.getAsset("./img/warriorattack.png"), 0, 0, 195, 195, 0.15, 14, true, false, this.angle, warriorAttackRegistry);


    findTarget(this, game, this.speed);


    this.animation = new Animation(ASSET_MANAGER.getAsset("./img/warriorwalk.png"), 0, 0, 127, 127, 0.05, 24, true, false, this.angle, warriorWalkRegistry);
    this.attackingAnimation = new Animation(ASSET_MANAGER.getAsset("./img/warriorattack.png"), 0, 0, 195, 195, 0.15, 14, true, false, this.angle, warriorAttackRegistry);


    Entity.call(this, game, this.x, this.y);
}

Warrior.prototype = new Entity();
Warrior.prototype.constructor = Warrior;

Warrior.prototype.update = function () {
    monsterUpdateBehavior(this, warriorWalkRegistry, warriorAttackRegistry);

    if (this.target.health <= 0 || !this.target) {
        findTarget(this, this.game);
        this.attacking = false;
        this.animation = new Animation(ASSET_MANAGER.getAsset("./img/warriorwalk.png"), 0, 0, 127, 127, 0.05, 24, true, false, this.angle, warriorWalkRegistry);
        this.attackingAnimation = new Animation(ASSET_MANAGER.getAsset("./img/warriorattack.png"), 0, 0, 195, 195, 0.15, 14, true, false, this.angle, warriorAttackRegistry);
    }

    Entity.prototype.update.call(this);
}

Warrior.prototype.draw = function (ctx) {
    if (this.attacking) {
        this.attackingAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.scale);
        this.width = this.attackingAnimation.frameWidth * this.scale;
    } else {
        this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.scale);
        this.width = this.animation.frameWidth * this.scale;
    }

    Entity.prototype.draw.call(this);
}

dudeWalkRegistry = [];
dudeAttackRegistry = [];

//Mercenary enemy, larger and hits harder
function Berserker(game, x, y) {
    this.scale = .6;
    this.attacking = false;
    this.radius = 100;
    this.maxHealth = 40;
    this.health = this.maxHealth;
    this.defaultAttackTimer = 50;
    this.attackTimer = this.defaultAttackTimer;
    this.coinWorth = 400;
    this.damage = 5;
    this.x = x;
    this.y = y;
    
    this.speed = .15 * game.speedModifier; //speed to modify unit vector
    this.angle = 0;

    //constructed twice, but used for now to obtain width and height
    this.animation = new Animation(ASSET_MANAGER.getAsset("./img/bigdudewalk.png"), 0, 0, 127, 127, 0.1, 24, true, false, this.angle, dudeWalkRegistry);
    this.attackingAnimation = new Animation(ASSET_MANAGER.getAsset("./img/bigdudeattack.png"), 0, 0, 192, 191, 0.15, 30, true, false, this.angle, dudeAttackRegistry);


    findTarget(this, game, this.speed);

    this.animation = new Animation(ASSET_MANAGER.getAsset("./img/bigdudewalk.png"), 0, 0, 127, 127, 0.1, 24, true, false, this.angle, dudeWalkRegistry);
    this.attackingAnimation = new Animation(ASSET_MANAGER.getAsset("./img/bigdudeattack.png"), 0, 0, 192, 191, 0.15, 30, true, false, this.angle, dudeAttackRegistry);


    Entity.call(this, game, this.x, this.y);
}

Berserker.prototype = new Entity();
Berserker.prototype.constructor = Berserker;

Berserker.prototype.update = function () {
    monsterUpdateBehavior(this, dudeWalkRegistry, dudeAttackRegistry);

    if (this.target.health <= 0 || !this.target) {
        findTarget(this, this.game);
        this.attacking = false;
        this.animation = new Animation(ASSET_MANAGER.getAsset("./img/bigdudewalk.png"), 0, 0, 127, 127, 0.1, 24, true, false, this.angle, dudeWalkRegistry);
        this.attackingAnimation = new Animation(ASSET_MANAGER.getAsset("./img/bigdudeattack.png"), 0, 0, 192, 191, 0.15, 30, true, false, this.angle, dudeAttackRegistry);
    }

    Entity.prototype.update.call(this);
}

Berserker.prototype.draw = function (ctx) {
    if (this.attacking) {
        this.attackingAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.scale);
        this.width = this.attackingAnimation.frameWidth * this.scale;
    } else {
        this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.scale);
        this.width = this.animation.frameWidth * this.scale;
    }

    Entity.prototype.draw.call(this);
}

//BUILDINGS

function Castle(game) {
    this.health = 100;
    this.scale = 1.25;
    
    this.image = ASSET_MANAGER.getAsset("./img/castle.png");

    this.buildX = 400 - (this.image.width / 2 * this.scale);
    this.buildY = 400 - (this.image.height / 2 * this.scale);

    Entity.call(this, game, this.x, this.y);
}

Castle.prototype = new Entity();
Castle.prototype.constructor = Castle;

Castle.prototype.update = function () {
    this.game.castleHealth = this.health;
}

Castle.prototype.draw = function () {
    this.game.ctx.drawImage(this.image, this.buildX, this.buildY, this.image.width * this.scale, this.image.height * this.scale);
}

function Tower(game) {  
    this.scale = .8;
    this.maxHealth = 25;
    this.health = this.maxHealth;
    this.placed = false;
    this.range = 200;
    this.attackTimer = 90;

    this.image = ASSET_MANAGER.getAsset("./img/tower.png");
    this.width = this.image.width * this.scale;
    Entity.call(this, game, -400, -400);
}

Tower.prototype = new Entity();
Tower.prototype.constructor = Tower;

Tower.prototype.update = function () {
    if (this.placed && !this.game.gameOver) {
        var length = this.game.monsterEntities.length;
        this.attackTimer--;

        var closestTarget = { index: null, distance: this.range + 1 };

        for (var i = 0; i < length && this.attackTimer <= 0; i++) {
            var dx = this.x + (this.image.width * this.scale / 2) - (this.game.monsterEntities[i].x + (this.game.monsterEntities[i].animation.frameWidth * this.game.monsterEntities[i].scale / 2));
            var dy = this.y + (this.image.height * this.scale / 2) - (this.game.monsterEntities[i].y + (this.game.monsterEntities[i].animation.frameHeight * this.game.monsterEntities[i].scale / 2));
            
            var distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= this.range && distance < closestTarget.distance) {
                closestTarget.index = i;
                closestTarget.distance = distance;
            }
        }

        if (closestTarget.index || closestTarget.index === 0) {
            var targetLoc = {};
            targetLoc.x = this.game.monsterEntities[closestTarget.index].x + (this.game.monsterEntities[closestTarget.index].animation.frameWidth * this.game.monsterEntities[closestTarget.index].scale / 2);
            targetLoc.y = this.game.monsterEntities[closestTarget.index].y + (this.game.monsterEntities[closestTarget.index].animation.frameHeight * this.game.monsterEntities[closestTarget.index].scale / 2);
            this.game.addTopEntity(new ArrowAttack(this.game, this.x + 20, this.y + 40, targetLoc.x, targetLoc.y, this.game.monsterEntities[closestTarget.index]));
        }

        if (this.attackTimer === 0) this.attackTimer = 90;
    }
    
    if (this.health <= 0) {
        this.removeFromWorld = true;
    }
}

Tower.prototype.draw = function () {
    if (this.game.mouse && this.game.isBuilding && !this.placed) {
        this.x = this.game.mouse.layerX - (this.image.width * this.scale / 2);
        this.y = this.game.mouse.layerY - (this.image.height * this.scale / 2);
    }
    
    this.game.ctx.drawImage(this.image, this.x, this.y, this.image.width * this.scale, this.image.height * this.scale);
    //draw radius for tower
    if (displayRadius) {
        this.game.ctx.beginPath();
        this.game.ctx.save();
        this.game.ctx.globalAlpha = .3;
        this.game.ctx.strokeStyle = "white";
        this.game.ctx.arc(this.x + this.image.width / 2, this.y + this.image.height / 2, this.range, 0, Math.PI * 2, false);
        this.game.ctx.stroke();
        this.game.ctx.closePath();
        this.game.ctx.restore();
    }        
    
    if (this.game.click && !this.game.mouse) this.placed = true;

    Entity.prototype.draw.call(this);
}

function Cannon(game) {
    this.scale = .8;
    this.placed = false;
    this.range = 300;
    this.attackTimer = 180;
    this.maxHealth = 25;
    this.health = this.maxHealth;

    this.image = ASSET_MANAGER.getAsset("./img/cannon.png");
    this.width = this.image.width * this.scale;
    Entity.call(this, game, -400, -400);
}

Cannon.prototype = new Entity();
Cannon.prototype.constructor = Cannon;

Cannon.prototype.update = function () {
    if (this.placed && !this.game.gameOver) {
        var length = this.game.monsterEntities.length;
        var attacked = false;
        this.attackTimer--;

        for (var i = 0; i < length && !attacked && this.attackTimer <= 0; i++) {
            var dx = this.x + (this.image.width * this.scale / 2) - (this.game.monsterEntities[i].x + (this.game.monsterEntities[i].animation.frameWidth * this.game.monsterEntities[i].scale / 2));
            var dy = this.y + (this.image.height * this.scale / 2) - (this.game.monsterEntities[i].y + (this.game.monsterEntities[i].animation.frameHeight * this.game.monsterEntities[i].scale / 2));

            var distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= this.range) {
                attacked = true;
                var targetLoc = {};
                targetLoc.x = this.game.monsterEntities[i].x + (this.game.monsterEntities[i].animation.frameWidth * this.game.monsterEntities[i].scale / 2);
                targetLoc.y = this.game.monsterEntities[i].y + (this.game.monsterEntities[i].animation.frameHeight * this.game.monsterEntities[i].scale / 2);
                this.game.addTopEntity(new CannonAttack(this.game, this.x + 20, this.y + 40, targetLoc.x, targetLoc.y, this.game.monsterEntities[i]));
            }
        }

        if (this.attackTimer === 0) this.attackTimer = 180;
    }

    if (this.health <= 0) {
        this.removeFromWorld = true;
    }
}

Cannon.prototype.draw = function () {    
    if (this.game.mouse && this.game.isBuilding && !this.placed) {
        this.x = this.game.mouse.layerX - (this.image.width * this.scale / 2);
        this.y = this.game.mouse.layerY - (this.image.height * this.scale / 2);
    }
    
    this.game.ctx.drawImage(this.image, this.x, this.y, this.image.width * this.scale, this.image.height * this.scale);
    if (displayRadius) {
        this.game.ctx.beginPath();
        this.game.ctx.save();
        this.game.ctx.globalAlpha = .3;
        this.game.ctx.strokeStyle = "white";
        this.game.ctx.arc(this.x + this.image.width / 2, this.y + this.image.height / 2, this.range, 0, Math.PI * 2, false);
        this.game.ctx.stroke();
        this.game.ctx.closePath();
        this.game.ctx.restore();
    }        
    
    if (this.game.click && !this.game.mouse) this.placed = true;

    Entity.prototype.draw.call(this);
}

//ATTACKS

function ArrowAttack(game, startx, starty, targetx, targety, enemy) {
    //var sound = ASSET_MANAGER.getAsset("./audio/arrow.mp3");
    var sound;
    
    //try to segment the number of noises being sent out at later levels
    if (game.buildingsUp.arrow > 40) {
        sound = Math.random() < .05 ? new Audio("./audio/arrow.mp3") : ASSET_MANAGER.getAsset("./audio/arrow.mp3"); ASSET_MANAGER.getAsset("./audio/arrow.mp3");
    } else if (game.buildingsUp.arrow > 20) {
        sound = Math.random() < .25 ? new Audio("./audio/arrow.mp3") : ASSET_MANAGER.getAsset("./audio/arrow.mp3");
    } else if (game.buildingsUp.arrow > 10) {
        sound = Math.random() < .5 ? new Audio("./audio/arrow.mp3") : ASSET_MANAGER.getAsset("./audio/arrow.mp3");
    } else {
        sound = new Audio("./audio/arrow.mp3");
    }

    if (!enemy) {
        sound = ASSET_MANAGER.getAsset("./audio/arrow.mp3");
    }
    sound.volume = .1;

    if (!game.music.isMute) sound.play();

    this.x = startx;
    this.y = starty;
    this.damage = 1;
    this.target = enemy;
    this.targetx = targetx;
    this.targety = targety;
    this.speed = 10;
    this.update();
    this.image = this.rotateAndCache(ASSET_MANAGER.getAsset("./img/arrow.png"), this.angle);
    //this.image = new Animation(ASSET_MANAGER.getAsset("./img/arrow.png"), 0, 0, this.image.frameWidth, this.image.frameHeight, 0.025, 1, false, false, this.angle);

    Entity.call(this, game, this.x, this.y);
}

ArrowAttack.prototype = new Entity();
ArrowAttack.prototype.constructor = ArrowAttack;

ArrowAttack.prototype.update = function () {
    var dx = this.targetx - this.x;
    var dy = this.targety - this.y;

    var distance = Math.sqrt(dx * dx + dy * dy);

    this.x += (dx / distance) * this.speed;
    this.y += (dy / distance) * this.speed;

    this.angle = -Math.atan2(dx, dy) + Math.PI;
    
    if (distance < 10) {
        if (this.target) {
            this.target.health -= this.damage;
        } else {
            this.game.buildingEntities[0].health -= this.damage;
        }
        this.removeFromWorld = true;
    }
}

ArrowAttack.prototype.draw = function () {
    this.game.ctx.drawImage(this.image, this.x - (this.image.width / 2), this.y - (this.image.width / 4), this.image.width, this.image.height);
}

function CannonAttack(game, startx, starty, targetx, targety, enemy) {
    var sound;    

    if (game.buildingsUp.cannon > 40) {
        sound = Math.random() < .05 ? new Audio("./audio/cannon.mp3") : ASSET_MANAGER.getAsset("./audio/cannon.mp3");
    } else if (game.buildingsUp.cannon > 20) {
        sound = Math.random() < .25 ? new Audio("./audio/cannon.mp3") : ASSET_MANAGER.getAsset("./audio/cannon.mp3");
    } else if (game.buildingsUp.cannon > 10) {
        sound = Math.random() < .5 ? new Audio("./audio/cannon.mp3") : ASSET_MANAGER.getAsset("./audio/cannon.mp3");
    } else {
        sound = new Audio("./audio/cannon.mp3");
    }
    sound.volume = .1;

    if (!game.music.isMute) sound.play();

    this.radius = 3;
    this.x = startx;
    this.y = starty;
    this.damage = 2;
    this.target = enemy;
    this.targetx = targetx;
    this.targety = targety;
    this.speed = 10;
    this.update();

    Entity.call(this, game, this.x, this.y);
}

CannonAttack.prototype = new Entity();
CannonAttack.prototype.constructor = CannonAttack;

CannonAttack.prototype.update = function () {
    var dx = this.targetx - this.x;
    var dy = this.targety - this.y;

    var distance = Math.sqrt(dx * dx + dy * dy);

    this.x += (dx / distance) * this.speed;
    this.y += (dy / distance) * this.speed;

    this.angle = -Math.atan2(dx, dy) + Math.PI;

    if (distance < 10) {
        this.target.health -= this.damage;
        this.removeFromWorld = true;
    }
}

CannonAttack.prototype.draw = function () {
    this.game.ctx.beginPath();
    this.game.ctx.fillStyle = "black";
    this.game.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    this.game.ctx.fill();
    this.game.ctx.closePath();
}

//DISPLAYS

function ScoreBoard(game) {
    this.score = 500;
    this.lifetimeScore = 500;

    this.soundOn = ASSET_MANAGER.getAsset("./img/soundon.png");
    this.soundOff = ASSET_MANAGER.getAsset("./img/soundoff.png");

    Entity.call(this, game, 180, 17);
}

ScoreBoard.prototype = new Entity();
ScoreBoard.prototype.constructor = ScoreBoard;

ScoreBoard.prototype.update = function () {
    if (this.game.click) {
        if (this.game.click.layerX >= 795 - this.soundOn.width * .5 && this.game.click.layerX <= 795 && this.game.click.layerY >= 2 && this.game.click.layerY <= 2 + this.soundOn.height * .5) {
            this.game.music.mute();
        }
    }
}

ScoreBoard.prototype.updateScore = function (amount) {
    this.score += amount;
    if (amount > 0) this.lifetimeScore += amount;
}

ScoreBoard.prototype.draw = function () {
    //display basic information in upper-left (coins/round/health)
    this.game.ctx.font = "18px Verdana";
    this.game.ctx.fillStyle = "rgba(255, 255, 255)";
    this.game.ctx.fillText("BitCoins: " + this.score, 2, 17);
    this.game.ctx.fillStyle = "black";
    this.game.ctx.fillText("Round: " + this.game.round, 2, 34);
    this.game.ctx.fillText("Enemies: " + this.game.monsterEntities.length, 2, 51);
    this.game.ctx.fillStyle = "darkred";
    this.game.ctx.fillText("Health: " + this.game.castleHealth + "/" + this.game.maxCastleHealth, 2, 68);

    //display radius information in the upper-right
    this.game.ctx.font = "bold 15px Verdana";
    this.game.ctx.fillStyle = "black";
    var labelWidth = this.game.ctx.measureText("Radius Display (r)").width;
    this.game.ctx.fillText("Radius Display (r)", 790 - labelWidth - this.soundOn.width * .5, 16);
    this.game.ctx.font = "15px Verdana";
    this.game.ctx.fillStyle = displayRadius ? "green" : "red";
    var text = displayRadius ? "On" : "Off";
    this.game.ctx.fillText(text, 790 - (labelWidth / 2) - (this.game.ctx.measureText(text).width / 2) - this.soundOn.width * .5, 32);

    //display sound/mute information
    if (!this.game.music.isMute) {
        this.game.ctx.drawImage(this.soundOn, 795 - this.soundOn.width * .5, 2, this.soundOn.width * .5, this.soundOn.height * .5);
    } else {
        this.game.ctx.drawImage(this.soundOff, 795 - this.soundOn.width * .5, 2, this.soundOn.width * .5, this.soundOn.height * .5);
    }
}

function Fog(game) {
    this.image = ASSET_MANAGER.getAsset("./img/fog.png");
    Entity.call(this, game, 0, 0);
}

Fog.prototype = new Entity();
Fog.prototype.constructor = Fog;

Fog.prototype.draw = function () {
    this.game.ctx.globalAlpha = .6;
    this.game.ctx.drawImage(this.image, 0, 0, this.image.width, this.image.height);
}

function StartScreen(game) {
    this.image = ASSET_MANAGER.getAsset("./img/prevail.png");
    Entity.call(this, game, 0, 0);
}

StartScreen.prototype = new Entity();
StartScreen.prototype.constructor = StartScreen;

StartScreen.prototype.draw = function () {
    this.game.ctx.drawImage(this.image, 0, 0, this.image.width, this.image.height);
}

function GameOverScreen(game) {
    this.image = ASSET_MANAGER.getAsset("./img/gameoverscreen.png");
    Entity.call(this, game, 0, 0);
}

GameOverScreen.prototype = new Entity();
GameOverScreen.prototype.constructor = GameOverScreen;

GameOverScreen.prototype.draw = function () {
    //draw background image
    this.game.ctx.drawImage(this.image, 0, 0, this.image.width, this.image.height);
    this.game.ctx.save();

    //create transparent black box to hold game data
    this.game.ctx.globalAlpha = .5;
    this.game.ctx.fillStyle = "black";
    this.game.ctx.fillRect(100, 200, 600, 400);
    this.game.ctx.restore();
    this.game.ctx.font = "bold 30px Verdana";
    this.game.ctx.fillStyle = "white";

    //display statistics header centered
    this.game.ctx.fillText("Statistics:", 400 - this.game.ctx.measureText("Statistics:").width / 2, 250);
    this.game.ctx.font = "20px Verdana";
    //display round, bitcoins, and lifetime bitcoins centered
    this.game.ctx.fillText("Round:  " + this.game.round, 400 - this.game.ctx.measureText("Round:  " + this.game.round).width / 2, 300);
    this.game.ctx.fillText("BitCoins:  " + this.game.scoreBoard.score, 400 - this.game.ctx.measureText("BitCoins:  " + this.game.scoreBoard.score).width / 2, 325);
    this.game.ctx.fillText("Lifetime BitCoins:  " + this.game.scoreBoard.lifetimeScore, 400 - this.game.ctx.measureText("Lifetime BitCoins:  " + this.game.scoreBoard.lifetimeScore).width / 2, 350);

    //calculate total monsters killed
    var totalmonsters = this.game.monstersKilled.Zombies + this.game.monstersKilled.Archers + this.game.monstersKilled.Warriors + this.game.monstersKilled.Berserkers;
    
    this.game.ctx.font = "Bold 25px Verdana";

    //display total enemies killed 
    this.game.ctx.fillText("Enemies Killed - " + totalmonsters, 400 - this.game.ctx.measureText("Enemies Killed - " + totalmonsters).width / 2, 400);
    this.game.ctx.font = "20px Verdana";

    //display detailed enemy killed info
    this.game.ctx.fillText("Zombies: " + this.game.monstersKilled.Zombies, 400 - this.game.ctx.measureText("Zombies: " + this.game.monstersKilled.Zombies).width / 2, 450);
    this.game.ctx.fillText("Archers: " + this.game.monstersKilled.Archers, 400 - this.game.ctx.measureText("Archers: " + this.game.monstersKilled.Archers).width / 2, 475);
    this.game.ctx.fillText("Warriors: " + this.game.monstersKilled.Warriors, 400 - this.game.ctx.measureText("Warriors: " + this.game.monstersKilled.Warriors).width / 2, 500);
    this.game.ctx.fillText("Berserkers: " + this.game.monstersKilled.Berserkers, 400 - this.game.ctx.measureText("Berserkers: " + this.game.monstersKilled.Berserkers).width / 2, 525);

}

//SOUNDS

function Music() {
    //music named "Dark Music - Nocturnus" by Adrian von Ziegler on YouTube
    this.music = ASSET_MANAGER.getAsset("./audio/music.mp3");
    //this.music = new Audio(this.source);
    this.initVolume = .25;

    this.music.volume = this.initVolume;
    this.music.loop = true;
    this.music.play();

    this.isMute = false;
}

//function to check the current time of the music and to set it the end once the music is within 7 seconds of finishing
Music.prototype.checkDuration = function () {
    this.music.currentTime = this.music.currentTime >= this.music.duration - 7 ? 0 : this.music.currentTime;
}

Music.prototype.mute = function() {
    this.isMute = !this.isMute;

    //change volume based on mute
    if (this.isMute) {
        this.music.volume = 0;
    } else {
        this.music.volume = this.initVolume;
    }
}

function AttackSound(game) {
    var sound = ASSET_MANAGER.getAsset("./audio/monsterattack.mp3");
    sound.volume = .35;

    if (!game.music.isMute) sound.play();
}

// STARTING CODE

var ASSET_MANAGER = new AssetManager();

//Queue all Images
ASSET_MANAGER.queueImageDownload("./img/zombie.png");
ASSET_MANAGER.queueImageDownload("./img/castle.png");
ASSET_MANAGER.queueImageDownload("./img/clickExplode.png");
ASSET_MANAGER.queueImageDownload("./img/fog.png");
ASSET_MANAGER.queueImageDownload("./img/tower.png");
ASSET_MANAGER.queueImageDownload("./img/cannon.png");
ASSET_MANAGER.queueImageDownload("./img/towerIcon.png");
ASSET_MANAGER.queueImageDownload("./img/archerwalk.png");
ASSET_MANAGER.queueImageDownload("./img/archerattack.png");
ASSET_MANAGER.queueImageDownload("./img/bigdudewalk.png");
ASSET_MANAGER.queueImageDownload("./img/bigdudeattack.png");
ASSET_MANAGER.queueImageDownload("./img/warriorwalk.png");
ASSET_MANAGER.queueImageDownload("./img/warriorattack.png");
ASSET_MANAGER.queueImageDownload("./img/arrow.png");
ASSET_MANAGER.queueImageDownload("./img/prevail.png");
ASSET_MANAGER.queueImageDownload("./img/buildbar.png");
ASSET_MANAGER.queueImageDownload("./img/gameoverscreen.png");
ASSET_MANAGER.queueImageDownload("./img/soundon.png");
ASSET_MANAGER.queueImageDownload("./img/soundoff.png");

//Queue all sounds
ASSET_MANAGER.queueAudioDownload("./audio/music.mp3");
ASSET_MANAGER.queueAudioDownload("./audio/boom.wav");
ASSET_MANAGER.queueAudioDownload("./audio/arrow.mp3");
ASSET_MANAGER.queueAudioDownload("./audio/cannon.mp3");
ASSET_MANAGER.queueAudioDownload("./audio/monsterattack.mp3");

ASSET_MANAGER.downloadAll(function () {
    console.log("Starting Prevail");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');
	
    var gameEngine = new GameEngine();
    gameEngine.startScreen = new StartScreen(gameEngine);
    gameEngine.gameOverScreen = new GameOverScreen(gameEngine);
    gameEngine.buildBar = ASSET_MANAGER.getAsset("./img/buildbar.png");

    var scoreBoard = new ScoreBoard(gameEngine);
    gameEngine.addScoreBoard(scoreBoard);
    gameEngine.fog = new Fog(gameEngine);
    //gameEngine.addEntity(scoreBoard);
    gameEngine.addBuilding(new Castle(gameEngine));

    gameEngine.addMusic(new Music());
    
	gameEngine.init(ctx);
	gameEngine.start();
});

