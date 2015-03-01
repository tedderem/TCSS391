//In place for now for grid system later on for towers
var GameGrid = function (game) {
    this.game = game;
    this.rows = 10;
    this.columns = 10;
    this.emptySpot = ' ';
    this.takenSpot = 'X';
    this.spots = [];

    for (var i = 0; i < this.rows; i++) {
        this.spots.push([]);
        for (var j = 0; j < this.columns; j++) {
            this.spots(i).push(this.emptySpot);
        }
    }
}

GameGrid.prototype.draw = function (ctx) {

}

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
    var sound = new Audio("./audio/boom.wav");

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
    Entity.prototype.draw.call(this);
}

clickExplode.prototype.update = function() {
	if(this.game.click != null) {
		this.x = this.game.click.layerX - this.animation.frameWidth*.9/2;
		this.y = this.game.click.layerY - this.animation.frameHeight*.9/2;
		Entity.prototype.update.call(this);
	}
	if(this.animation.isDone()) this.removeFromWorld = true;
}

var displayRadius = true;

var zScale = .4;
globalAngleTolerance = 3;	//angle limit which entities will look the same in degrees
//in order to add registries to a entity:
//1. add specific global registries for each animation as empty arrays outside the constructor
//2. pass the specific global registry(s) to the animation(s) in the constructor
//3. add logic for adding to the registries when the entities are destroyed or complete.
zombieWalkRegistry = [];
zombieAttackRegistry = [];

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

function Zombie(game, x, y) {    
    this.attacking = false;
    this.scale = .4;
    this.radius = 100;
	this.maxHealth = 2;
	this.health = this.maxHealth;
	this.attackTimer = 90;
	this.coinWorth = 25;
	this.damage = 1;
	this.x = x;
	this.y = y;
	this.targetX = 375;
	this.targetY = 380;
	//calculate angle to target, 400,400 to center for now
	var difX = this.targetX - this.x; // x,y of vector to center
	var difY = this.targetY - this.y;
	var magnitude = Math.sqrt(difX*difX+difY*difY);
	this.angle = 4/2 * Math.PI - Math.atan(difX/ difY);
	if (this.y < this.targetY) {
		this.angle += Math.PI;
	}
	this.unitX = difX/magnitude; //x,y of unit vector to center
	this.unitY = difY/magnitude;
	this.speed = .2 * game.speedModifier; //speed to modify unit vector
	this.range = 75 / this.speed;
	this.toCollide = (magnitude) / this.speed;//steps to hit castle
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
	//user clicked on the screen
	if (this.game.click && !this.game.gameOver) { 		
		//calculate the difference in x and y of the click to this entity's x/y
	    var diffx = Math.abs(this.game.click.layerX - (this.x + (64 * this.scale)));
	    var diffy = Math.abs(this.game.click.layerY - (this.y + (64 * this.scale)));
		
		//see if the difference is within a certain range
	    if (diffx <= (70 * this.scale) && diffy <= (70 * this.scale)) {
			//decrement health
	        this.health--;
	        this.game.addTopEntity(new clickExplode(this.game));
			//add new message entity to the game
			if (this.health > 0){
				this.game.addTopEntity(new Message(this.game, "Health: " + this.health + "/" + this.maxHealth , this.game.click.layerX - 25, this.game.click.layerY - 25, null, true));
			}
		}
	}

	if (this.health <= 0) {
	    this.game.scoreBoard.updateScore(this.coinWorth);
	    this.game.addTopEntity(new Message(this.game, "+" + this.coinWorth + " Coins", this.x, this.y - (this.animation.frameWidth * this.scale / 2), null, true));
	    this.removeFromWorld = true;
	    this.game.monstersKilled.zombies++;
		//add animations to respective registries if there is space and the animation is completely cached
		if (this.animation.completeCache() && scanRegistry(this.angle, globalAngleTolerance, zombieWalkRegistry) === -1) {
			zombieWalkRegistry.push(this.animation);
		}
		if (this.attackingAnimation.completeCache() && scanRegistry(this.angle, globalAngleTolerance, zombieAttackRegistry) === -1) {
			zombieAttackRegistry.push(this.attackingAnimation);
		}
	}
	
	//if/else to manage attack animation reset and movement of zombie
	if (this.attacking) {
	    new AttackSound(this.game);
		this.attackTimer--;
        if (this.attackingAnimation.isDone()) {
            this.attackingAnimation.elapsedTime = 0;
            this.animation.elapsedTime = 0;
        }
		if (this.attackTimer === 0) {
			this.game.castleHealth -= this.damage;
			this.attackTimer = 90;
		}
    } else {
        if (this.toCollide > this.range) {
		    this.y += this.unitY * this.speed;
		    this.x += this.unitX * this.speed;
		    this.toCollide--;
		    
        } else {
            this.attacking = true;
        }
	}
	
    Entity.prototype.update.call(this);
}

Zombie.prototype.draw = function (ctx) {
    if (this.attacking) {
        this.attackingAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.scale);
    } else {
        this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.scale);
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
    this.attackTimer = 80;
    this.coinWorth = 50;
    this.x = x;
    this.y = y;
    this.targetX = 370;
    this.targetY = 385;
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
   //user clicked on the screen
    if (this.game.click && !this.game.gameOver) {
        //calculate the difference in x and y of the click to this entity's x/y
        var diffx = Math.abs(this.game.click.layerX - (this.x + (64 * this.scale)));
        var diffy = Math.abs(this.game.click.layerY - (this.y + (64 * this.scale)));

        //see if the difference is within a certain range
        if (diffx <= (70 * this.scale) && diffy <= (70 * this.scale)) {
            //decrement health
            this.health--;
            this.game.addTopEntity(new clickExplode(this.game));
            //add new message entity to the game
            if (this.health > 0) {
				this.game.addTopEntity(new Message(this.game, "Health: " + this.health + "/" + 
							this.maxHealth, this.game.click.layerX - 25, this.game.click.layerY - 25, null, true));
				
			}
        }
    }

    if (this.health <= 0) {
        this.game.scoreBoard.updateScore(this.coinWorth);
        this.game.addTopEntity(new Message(this.game, "+" + this.coinWorth + " Coins", this.x, this.y - (this.animation.frameWidth * this.scale / 2), null, true));
        this.removeFromWorld = true;
        this.game.monstersKilled.archers++;
		
		if (this.animation.completeCache() && scanRegistry(this.angle, globalAngleTolerance, archerWalkRegistry) === -1) {
			archerWalkRegistry.push(this.animation);
		}
		if (this.attackingAnimation.completeCache() && scanRegistry(this.angle, globalAngleTolerance, archerAttackRegistry) === -1) {
			archerAttackRegistry.push(this.attackingAnimation);
		}
    }

    //if/else to manage attack animation reset and movement of monster
    if (this.attacking) {
        this.attackTimer--;
         if (this.attackingAnimation.isDone()) {
            this.attackingAnimation.elapsedTime = 0;
            this.animation.elapsedTime = 0;
         }
         if (this.attackTimer === 0) {
            this.game.addTopEntity(new ArrowAttack(this.game, this.x + (this.attackingAnimation.frameWidth * this.scale / 2), this.y + (this.attackingAnimation.frameHeight * this.scale / 2), 400, 400));
            this.attackTimer = 60;
         }
        } else {
            if (this.toCollide > this.range) {
            this.y += this.unitY * this.speed;
            this.x += this.unitX * this.speed;
            this.toCollide--;
        } else {
            this.attacking = true;
        }
    }

    Entity.prototype.update.call(this);
}

Archer.prototype.draw = function (ctx) {
    if (this.attacking) {
        this.attackingAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.scale);
    } else {
        this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.scale);
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
    this.attackTimer = 50;
    this.coinWorth = 100;
    this.damage = 1;
    this.x = x;
    this.y = y;
    this.targetX = 375;
    this.targetY = 380;
    //calculate angle to target, 400,400 to center for now
    var difX = this.targetX - this.x; // x,y of vector to center
    var difY = this.targetY - this.y;
    var magnitude = Math.sqrt(difX * difX + difY * difY);
    this.angle = 4 / 2 * Math.PI - Math.atan(difX / difY);
    if (this.y < this.targetY) {
        this.angle += Math.PI;
    }
    this.unitX = difX / magnitude; //x,y of unit vector to center
    this.unitY = difY / magnitude;
    this.speed = .4 * game.speedModifier; //speed to modify unit vector
    this.range = 75 / this.speed;
    this.toCollide = (magnitude) / this.speed;//steps to hit castle

    this.animation = new Animation(ASSET_MANAGER.getAsset("./img/warriorwalk.png"), 0, 0, 127, 127, 0.05, 24, true, false, this.angle, warriorWalkRegistry);
    this.attackingAnimation = new Animation(ASSET_MANAGER.getAsset("./img/warriorattack.png"), 0, 0, 195, 195, 0.15, 14, true, false, this.angle, warriorAttackRegistry);


    Entity.call(this, game, this.x, this.y);
}

Warrior.prototype = new Entity();
Warrior.prototype.constructor = Warrior;

Warrior.prototype.update = function () {
    //user clicked on the screen
    if (this.game.click && !this.game.gameOver) {
        //calculate the difference in x and y of the click to this entity's x/y
        var diffx = Math.abs(this.game.click.layerX - (this.x + (64 * this.scale)));
        var diffy = Math.abs(this.game.click.layerY - (this.y + (64 * this.scale)));

        //see if the difference is within a certain range
        if (diffx <= (70 * this.scale) && diffy <= (70 * this.scale)) {
            //decrement health
            this.health--;
            this.game.addTopEntity(new clickExplode(this.game));
            //add new message entity to the game
            if (this.health > 0) {
                this.game.addTopEntity(new Message(this.game, "Health: " + this.health + "/" + this.maxHealth, this.game.click.layerX - 25, this.game.click.layerY - 25, null, true));
            }
        }
    }

    if (this.health <= 0) {
        this.game.scoreBoard.updateScore(this.coinWorth);
        this.game.addTopEntity(new Message(this.game, "+" + this.coinWorth + " Coins", this.x, this.y - (this.animation.frameWidth * this.scale / 2), null, true));
        this.removeFromWorld = true;
        this.game.monstersKilled.warriors++;

        //add animations to respective registries if there is space and the animation is completely cached
        if (this.animation.completeCache() && scanRegistry(this.angle, globalAngleTolerance, warriorWalkRegistry) === -1) {
            warriorWalkRegistry.push(this.animation);
        }
        if (this.attackingAnimation.completeCache() && scanRegistry(this.angle, globalAngleTolerance, warriorAttackRegistry) === -1) {
            warriorAttackRegistry.push(this.attackingAnimation);
        }
    }

    //if/else to manage attack animation reset and movement of monster
    if (this.attacking) {
        new AttackSound(this.game);
        this.attackTimer--;
        if (this.attackingAnimation.isDone()) {
            this.attackingAnimation.elapsedTime = 0;
            this.animation.elapsedTime = 0;
        }
        if (this.attackTimer === 0) {
            this.game.castleHealth -= this.damage;
            this.attackTimer = 90;
        }
    } else {
        if (this.toCollide > this.range) {
            this.y += this.unitY * this.speed;
            this.x += this.unitX * this.speed;
            this.toCollide--;

        } else {
            this.attacking = true;
        }
    }

    Entity.prototype.update.call(this);
}

Warrior.prototype.draw = function (ctx) {
    if (this.attacking) {
        this.attackingAnimation.drawFrame(this.game.clockTick, ctx, this.x - 30, this.y - 30, this.scale);
    } else {
        this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.scale);
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
    this.attackTimer = 50;
    this.coinWorth = 250;
    this.damage = 5;
    this.x = x;
    this.y = y;
    this.targetX = 375;
    this.targetY = 380;
    //calculate angle to target, 400,400 to center for now
    var difX = this.targetX - this.x; // x,y of vector to center
    var difY = this.targetY - this.y;
    var magnitude = Math.sqrt(difX * difX + difY * difY);
    this.angle = 4 / 2 * Math.PI - Math.atan(difX / difY);
    if (this.y < this.targetY) {
        this.angle += Math.PI;
    }
    this.unitX = difX / magnitude; //x,y of unit vector to center
    this.unitY = difY / magnitude;
    this.speed = .15 * game.speedModifier; //speed to modify unit vector
    this.range = 75 / this.speed;
    this.toCollide = (magnitude) / this.speed;//steps to hit castle

    this.animation = new Animation(ASSET_MANAGER.getAsset("./img/bigdudewalk.png"), 0, 0, 127, 127, 0.1, 24, true, false, this.angle, dudeWalkRegistry);
    this.attackingAnimation = new Animation(ASSET_MANAGER.getAsset("./img/bigdudeattack.png"), 0, 0, 192, 191, 0.15, 30, true, false, this.angle, dudeAttackRegistry);


    Entity.call(this, game, this.x, this.y);
}

Berserker.prototype = new Entity();
Berserker.prototype.constructor = Berserker;

Berserker.prototype.update = function () {
    //user clicked on the screen
    if (this.game.click && !this.game.gameOver) {
        //calculate the difference in x and y of the click to this entity's x/y
        var diffx = Math.abs(this.game.click.layerX - (this.x + (64 * this.scale)));
        var diffy = Math.abs(this.game.click.layerY - (this.y + (64 * this.scale)));

        //see if the difference is within a certain range
        if (diffx <= (70 * this.scale) && diffy <= (70 * this.scale)) {
            //decrement health
            this.health--;
            this.game.addTopEntity(new clickExplode(this.game));
            //add new message entity to the game
            if (this.health > 0) {
                this.game.addTopEntity(new Message(this.game, "Health: " + this.health + "/" + this.maxHealth, this.game.click.layerX - 25, this.game.click.layerY - 25, null, true));
            }
        }
    }

    if (this.health <= 0) {
        this.game.scoreBoard.updateScore(this.coinWorth);
        this.game.addTopEntity(new Message(this.game, "+" + this.coinWorth + " Coins", this.x, this.y - (this.animation.frameWidth * this.scale / 2), null, true));
        this.removeFromWorld = true;
        this.game.monstersKilled.berserkers++;

        //add animations to respective registries if there is space and the animation is completely cached
        if (this.animation.completeCache() && scanRegistry(this.angle, globalAngleTolerance, dudeWalkRegistry) === -1) {
            dudeWalkRegistry.push(this.animation);
        }
        if (this.attackingAnimation.completeCache() && scanRegistry(this.angle, globalAngleTolerance, dudeAttackRegistry) === -1) {
            dudeAttackRegistry.push(this.attackingAnimation);
        }
    }

    //if/else to manage attack animation reset and movement of monster
    if (this.attacking) {
        new AttackSound(this.game);
        this.attackTimer--;
        if (this.attackingAnimation.isDone()) {
            this.attackingAnimation.elapsedTime = 0;
            this.animation.elapsedTime = 0;
        }
        if (this.attackTimer === 0) {
            this.game.castleHealth -= this.damage;
            this.attackTimer = 90;
        }
    } else {
        if (this.toCollide > this.range) {
            this.y += this.unitY * this.speed;
            this.x += this.unitX * this.speed;
            this.toCollide--;

        } else {
            this.attacking = true;
        }
    }

    Entity.prototype.update.call(this);
}

Berserker.prototype.draw = function (ctx) {
    if (this.attacking) {
        this.attackingAnimation.drawFrame(this.game.clockTick, ctx, this.x - 30, this.y - 30, this.scale);
    } else {
        this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.scale);
    }

    Entity.prototype.draw.call(this);
}

function ScoreBoard(game) {
    this.score = 0;
    this.lifetimeScore = 0;

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

function Castle(game) {
    this.scale = 1.5;

    this.image = ASSET_MANAGER.getAsset("./img/castle.png");
    Entity.call(this, game, 0, 0);
}

Castle.prototype = new Entity();
Castle.prototype.constructor = Castle;

Castle.prototype.draw = function () {
    var xLoc = (this.game.ctx.canvas.width / 2) - (this.image.width / 2 * this.scale);
    var yLoc = (this.game.ctx.canvas.height / 2) - (this.image.height / 2 * this.scale);
    this.game.ctx.drawImage(this.image, xLoc, yLoc, this.image.width * this.scale, this.image.height * this.scale);
}

function Tower(game) {  
    this.scale = 1;
    this.placed = false;
    //this.showRange = true;
    this.range = 200;
    //this.damage = 1;
    this.attackTimer = 90;

    this.image = ASSET_MANAGER.getAsset("./img/tower.png");
    Entity.call(this, game, 0, 0);
}

Tower.prototype = new Entity();
Tower.prototype.constructor = Tower;

Tower.prototype.update = function () {
    if (this.placed && !this.game.gameOver) {
        var length = this.game.monsterEntities.length;
        this.attackTimer--;

        var closestTarget = { index: null, distance: this.range + 1 };

        for (var i = 0; i < length && this.attackTimer <= 0; i++) {
            var dx = this.buildX + (this.image.width * this.scale / 2) - (this.game.monsterEntities[i].x + (this.game.monsterEntities[i].animation.frameWidth * this.game.monsterEntities[i].scale / 2));
            var dy = this.buildY + (this.image.height * this.scale / 2) - (this.game.monsterEntities[i].y + (this.game.monsterEntities[i].animation.frameHeight * this.game.monsterEntities[i].scale / 2));
            
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
            this.game.addTopEntity(new ArrowAttack(this.game, this.buildX + 20, this.buildY + 40, targetLoc.x, targetLoc.y, this.game.monsterEntities[closestTarget.index]));
        }

        if (this.attackTimer === 0) this.attackTimer = 90;
    }
}

Tower.prototype.draw = function () {
    if (!this.game.mouse && !this.placed && this.game.isBuilding) this.game.ctx.drawImage(this.image, 400 - (this.image.width * this.scale / 2), 400 - (this.image.height * this.scale / 2), this.image.width * this.scale, this.image.height * this.scale);

    if (this.game.mouse && this.game.isBuilding && !this.placed) {
        this.buildX = this.game.mouse.layerX - (this.image.width * this.scale / 2);
        this.buildY = this.game.mouse.layerY - (this.image.height * this.scale / 2);
    }
    if (this.buildY && this.buildX) {
        this.game.ctx.drawImage(this.image, this.buildX, this.buildY, this.image.width * this.scale, this.image.height * this.scale);
        if (displayRadius) {
            this.game.ctx.beginPath();
            this.game.ctx.save();
            this.game.ctx.globalAlpha = .3;
            this.game.ctx.strokeStyle = "white";
            this.game.ctx.arc(this.buildX + this.image.width / 2, this.buildY + this.image.height / 2, this.range, 0, Math.PI * 2, false);
            this.game.ctx.stroke();
            this.game.ctx.closePath();
            this.game.ctx.restore();
        }        
    }
    if (this.game.click && !this.game.mouse) this.placed = true;

    if (!this.buildY && !this.buildX && this.placed) {
        this.placed = true;
        this.buildX = 400 - (this.image.width * this.scale / 2);
        this.buildY = 400 - (this.image.height * this.scale / 2);
    }    
}

function Cannon(game) {
    this.scale = 1;
    this.placed = false;
    //this.showRange = true;
    this.range = 300;
    this.attackTimer = 180;

    this.image = ASSET_MANAGER.getAsset("./img/cannon.png");
    Entity.call(this, game, 0, 0);
}

Cannon.prototype = new Entity();
Cannon.prototype.constructor = Cannon;

Cannon.prototype.update = function () {
    if (this.placed && !this.game.gameOver) {
        var length = this.game.monsterEntities.length;
        var attacked = false;
        this.attackTimer--;

        for (var i = 0; i < length && !attacked && this.attackTimer <= 0; i++) {
            var dx = this.buildX + (this.image.width * this.scale / 2) - (this.game.monsterEntities[i].x + (this.game.monsterEntities[i].animation.frameWidth * this.game.monsterEntities[i].scale / 2));
            var dy = this.buildY + (this.image.height * this.scale / 2) - (this.game.monsterEntities[i].y + (this.game.monsterEntities[i].animation.frameHeight * this.game.monsterEntities[i].scale / 2));

            var distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= this.range) {
                attacked = true;
                var targetLoc = {};
                targetLoc.x = this.game.monsterEntities[i].x + (this.game.monsterEntities[i].animation.frameWidth * this.game.monsterEntities[i].scale / 2);
                targetLoc.y = this.game.monsterEntities[i].y + (this.game.monsterEntities[i].animation.frameHeight * this.game.monsterEntities[i].scale / 2);
                this.game.addTopEntity(new CannonAttack(this.game, this.buildX + 20, this.buildY + 40, targetLoc.x, targetLoc.y, this.game.monsterEntities[i]));
            }
        }

        if (this.attackTimer === 0) this.attackTimer = 180;
    }
}

Cannon.prototype.draw = function () {
    //place tower in center when initially selected
    if (!this.game.mouse && !this.placed && this.game.isBuilding) this.game.ctx.drawImage(this.image, 400 - (this.image.width * this.scale / 2), 400 - (this.image.height * this.scale / 2), this.image.width * this.scale, this.image.height * this.scale);

    if (this.game.mouse && this.game.isBuilding && !this.placed) {
        this.buildX = this.game.mouse.layerX - (this.image.width * this.scale / 2);
        this.buildY = this.game.mouse.layerY - (this.image.height * this.scale / 2);
    }
    if (this.buildY && this.buildX) {
        this.game.ctx.drawImage(this.image, this.buildX, this.buildY, this.image.width * this.scale, this.image.height * this.scale);
        if (displayRadius) {
            this.game.ctx.beginPath();
            this.game.ctx.save();
            this.game.ctx.globalAlpha = .3;
            this.game.ctx.strokeStyle = "white";
            this.game.ctx.arc(this.buildX + this.image.width / 2, this.buildY + this.image.height / 2, this.range, 0, Math.PI * 2, false);
            this.game.ctx.stroke();
            this.game.ctx.closePath();
            this.game.ctx.restore();
        }        
    }
    if (this.game.click && !this.game.mouse) this.placed = true;

    if (!this.buildY && !this.buildX && this.placed) {
        this.placed = true;
        this.buildX = 400 - (this.image.width * this.scale / 2);
        this.buildY = 400 - (this.image.height * this.scale / 2);
    }
    
}

function ArrowAttack(game, startx, starty, targetx, targety, enemy) {
    //var sound = ASSET_MANAGER.getAsset("./audio/arrow.mp3");
    var sound = new Audio("./audio/arrow.mp3");
    sound.volume = .1;

    if (!game.music.isMute && enemy) sound.play();

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
            this.game.castleHealth -= this.damage;
        }
        this.removeFromWorld = true;
    }
}

ArrowAttack.prototype.draw = function () {
    this.game.ctx.drawImage(this.image, this.x - (this.image.width / 2), this.y - (this.image.width / 4), this.image.width, this.image.height);
}

function CannonAttack(game, startx, starty, targetx, targety, enemy) {
    var sound = new Audio("./audio/cannon.mp3");
    sound.volume = .1;

    if (!game.music.isMute && enemy) sound.play();

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
    var totalmonsters = this.game.monstersKilled.zombies + this.game.monstersKilled.archers + this.game.monstersKilled.warriors + this.game.monstersKilled.berserkers;
    this.game.ctx.font = "Bold 25px Verdana";

    //display total enemies killed 
    this.game.ctx.fillText("Enemies Killed - " + totalmonsters, 400 - this.game.ctx.measureText("Enemies Killed - " + totalmonsters).width / 2, 400);
    this.game.ctx.font = "20px Verdana";

    //display detailed enemy killed info
    this.game.ctx.fillText("Zombies: " + this.game.monstersKilled.zombies, 400 - this.game.ctx.measureText("Zombies: " + this.game.monstersKilled.zombies).width / 2, 450);
    this.game.ctx.fillText("Archers: " + this.game.monstersKilled.archers, 400 - this.game.ctx.measureText("Archers: " + this.game.monstersKilled.archers).width / 2, 475);
    this.game.ctx.fillText("Warriors: " + this.game.monstersKilled.warriors, 400 - this.game.ctx.measureText("Warriors: " + this.game.monstersKilled.warriors).width / 2, 500);
    this.game.ctx.fillText("Berserkers: " + this.game.monstersKilled.berserkers, 400 - this.game.ctx.measureText("Berserkers: " + this.game.monstersKilled.berserkers).width / 2, 525);

}

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
    this.music.currentTime = this.music.currentTime >= this.music.duration - 7 ? this.music.duration : this.music.currentTime;
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

// the "main" code begins here

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
    gameEngine.addEntity(new Castle(gameEngine));

    gameEngine.addMusic(new Music());
    
	gameEngine.init(ctx);
	gameEngine.start();
});

