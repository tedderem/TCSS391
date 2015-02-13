function Animation(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse, angle) {
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

	this.cache = [];
	//var times = 0;
//generate cache of rotated sprites
	for (var i = 0; i < this.frames; i++) {
		var scaleBy = scaleBy || 1;

		index = i;
		//times++;
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
		//offscreenCtx.drawImage(image, -(image.width / 2), -(image.height / 2));
		var offset = vindex === 0 ? this.startX : 0;
		/*offscreenCtx.drawImage(this.spriteSheet, index * this.frameWidth + offset, vindex * this.frameHeight + this.startY, this.frameWidth, this,frameHeight, -(this.frameWidth / 2), -(this.frameWidth / 2), 100, 100);*/
		offscreenCtx.drawImage(this.spriteSheet, index * this.frameWidth + offset, vindex * this.frameHeight + this.startY,  // source from sheet
                  this.frameWidth, this.frameHeight,
                  -(this.frameWidth / 2), -(this.frameWidth / 2),
                  this.frameWidth * scaleBy,
                  this.frameHeight * scaleBy);

		offscreenCtx.restore();
		//offscreenCtx.strokeStyle = "red";
		//offscreenCtx.strokeRect(0,0,size,size);
		//this.cache[i] = offscreenCanvas;
		this.cache.push(offscreenCanvas);
		//times++;
	}
	//console.log(times);
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
    /*ctx.drawImage(this.spriteSheet,
                  index * this.frameWidth + offset, vindex * this.frameHeight + this.startY,  // source from sheet
                  this.frameWidth, this.frameHeight,
                  locX, locY,
                  this.frameWidth * scaleBy,
                  this.frameHeight * scaleBy);*/

	/*ctx.drawImage(this.cache[this.currentFrame()], locX - (this.frameWidth/2)*scaleBy, locY - (this.frameHeight/2)*scaleBy);*/
	ctx.drawImage(this.cache[this.currentFrame()], 0, 0, this.frameHeight, this.frameWidth, locX /*- (this.frameHeight/2)*scaleBy*/, locY /*- (this.frameHeight/2)*scaleBy*/, this.frameWidth*scaleBy, this.frameHeight*scaleBy);
	//console.log(this.currentFrame());
}

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}


function Message(game, message, x, y) {
	this.message = message;
	this.alpha = 1;
	this.x = x;
	this.y = y;
	
	Entity.call(this, game, this.x, this.y);
}

Message.prototype = new Entity();
Message.prototype.constructor = Message;

Message.prototype.update = function () {
	this.alpha = this.alpha - .03;
	
	if (this.alpha < 0) this.removeFromWorld = true;
}

Message.prototype.draw = function () {
	this.game.ctx.save();
	this.game.ctx.font = "10px Verdana";
	this.game.ctx.fillStyle = "rgba(255, 255, 255, " + this.alpha + ")";
    this.game.ctx.fillText(this.message, this.x, this.y);
	this.game.ctx.restore();
}

function clickExplode(game) {
	this.animation = new Animation(ASSET_MANAGER.getAsset("./img/clickExplode.png"), 0, 0, 66.7, 66.7, 0.03, 32, false, false);
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



var zScale = .4;

function Zombie(game, x, y) {
    
    this.attacking = false;
    this.radius = 100;
	this.maxHealth = 5;
	this.health = this.maxHealth;
	this.attackTimer = 90;
	this.coinWorth = 20;
	this.damage = 1;
	this.x = x;
	this.y = y;
	this.targetX = 400;
	this.targetY = 400;
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
	this.speed = .2; //speed to modify unit vector
	this.toCollide = (magnitude - 50) / .2;//steps to hit castle

	this.animation = new Animation(ASSET_MANAGER.getAsset("./img/zombie.png"), 0, 0, 128, 128, 0.05, 30, true, false, this.angle);
    this.attackingAnimation = new Animation(ASSET_MANAGER.getAsset("./img/zombie.png"), 384, 384, 128, 128, 0.05, 40, true, false, this.angle);


    Entity.call(this, game, this.x, this.y);
}

Zombie.prototype = new Entity();
Zombie.prototype.constructor = Zombie;

Zombie.prototype.update = function () {
	//user clicked on the screen
	if (this.game.click) { 		
		//calculate the difference in x and y of the click to this entity's x/y
		var diffx = Math.abs(this.game.click.layerX - (this.x + (64 * zScale)));
		var diffy = Math.abs(this.game.click.layerY - (this.y + (64 * zScale)));
		
		//see if the difference is within a certain range (30 in this case)
		//Multiplies by the zScale to ensure it fluctuates with size
		if (diffx <= (70 * zScale) && diffy <= (70 * zScale) || this.game.click.shiftKey) {
			//decrement health
			this.health--;
			//add new message entity to the game
			if (this.health > 0)this.game.addTopEntity(new Message(this.game, "Health: " + this.health + "/" + this.maxHealth , this.game.click.layerX - 25, this.game.click.layerY - 25));
			//zombie is dead
		}
	}

	if (this.health <= 0) {
	    this.game.scoreBoard.updateScore(this.coinWorth);
	    this.game.addTopEntity(new Message(this.game, "+" + this.coinWorth + " Coins", this.x, this.y - (this.animation.frameWidth * zScale / 2)));
	    this.removeFromWorld = true;
	}
	
	//if/else to manage attack animation reset and movement of zombie
    if (this.attacking) {
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
        if (this.toCollide > 0) {
            //this.y -= (.5 * zScale);
		this.y += this.unitY * this.speed;
		this.x += this.unitX * this.speed;
		this.toCollide--;
		//console.log(this.x + " " + this.y);
        } else {
            this.attacking = true;
        }
		/*if (this.y < (400)) this.y = this.game.ctx.canvas.height + (128 * zScale);*/
	}
	
    Entity.prototype.update.call(this);
}

Zombie.prototype.draw = function (ctx) {
    if (this.attacking) {
        this.attackingAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y, zScale);
    } else {
        this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y, zScale);
    }
	
    Entity.prototype.draw.call(this);
}

function Archer(game, x, y) {
    this.scale = .5;
    this.attacking = false;
    this.radius = 100;
    this.maxHealth = 5;
    this.health = this.maxHealth;
    this.attackTimer = 60;
    this.coinWorth = 40;
    //this.damage = 2;
    this.x = x;
    this.y = y;
    this.targetX = 400;
    this.targetY = 400;
    this.range = 1500;
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
    this.speed = .25; //speed to modify unit vector
    this.toCollide = (magnitude - 50) / .2;//steps to hit castle

    this.animation = new Animation(ASSET_MANAGER.getAsset("./img/archerwalk.png"), 0, 0, 128, 128, 0.05, 18, true, false, this.angle);
    this.attackingAnimation = new Animation(ASSET_MANAGER.getAsset("./img/archerattack.png"), 0, 0, 128, 128, 0.1, 20, true, false, this.angle);


    Entity.call(this, game, this.x, this.y);
}

Archer.prototype = new Entity();
Archer.prototype.constructor = Archer;

Archer.prototype.update = function () {
   //user clicked on the screen
    if (this.game.click) {
        //calculate the difference in x and y of the click to this entity's x/y
        var diffx = Math.abs(this.game.click.layerX - (this.x + (64 * this.scale)));
        var diffy = Math.abs(this.game.click.layerY - (this.y + (64 * this.scale)));

        //see if the difference is within a certain range (30 in this case)
        //Multiplies by the zScale to ensure it fluctuates with size
        if (diffx <= (70 * this.scale) && diffy <= (70 * this.scale) || this.game.click.shiftKey) {
            //decrement health
            this.health--;
            //add new message entity to the game
            if (this.health > 0) this.game.addTopEntity(new Message(this.game, "Health: " + this.health + "/" + this.maxHealth, this.game.click.layerX - 25, this.game.click.layerY - 25));
            //zombie is dead
        }
    }

    if (this.health <= 0) {
        this.game.scoreBoard.updateScore(this.coinWorth);
        this.game.addTopEntity(new Message(this.game, "+" + this.coinWorth + " Coins", this.x, this.y - (this.animation.frameWidth * this.scale / 2)));
        this.removeFromWorld = true;
    }

    //if/else to manage attack animation reset and movement of zombie
    if (this.attacking) {
        this.attackTimer--;
        if (this.attackingAnimation.isDone()) {
            this.attackingAnimation.elapsedTime = 0;
            this.animation.elapsedTime = 0;
        }
        if (this.attackTimer === 0) {
            this.game.addTopEntity(new ArrowAttack(this.game, this.x + (this.attackingAnimation.frameWidth / 2), this.y + (this.attackingAnimation.frameHeight / 4), 400, 400));
            //this.game.castleHealth -= this.damage;
            this.attackTimer = 60;
        }
    } else {
        if (this.toCollide > this.range) {
            //this.y -= (.5 * zScale);
            this.y += this.unitY * this.speed;
            this.x += this.unitX * this.speed;
            this.toCollide--;
            //console.log(this.x + " " + this.y);
        } else {
            this.attacking = true;
        }
        /*if (this.y < (400)) this.y = this.game.ctx.canvas.height + (128 * zScale);*/
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


function ScoreBoard(game) {
	this.score = 0;
	
	Entity.call(this, game, 180, 17);
}

ScoreBoard.prototype = new Entity();
ScoreBoard.prototype.constructor = ScoreBoard;

ScoreBoard.prototype.updateScore = function (amount) {
	this.score += amount;
}

ScoreBoard.prototype.draw = function () {
	this.game.ctx.font = "18px Verdana";
	this.game.ctx.fillStyle = "rgba(255, 255, 255)";
    this.game.ctx.fillText("BitCoins: " + this.score, 2, 17);
	this.game.ctx.fillStyle = "black";
	this.game.ctx.fillText("Round: " + this.game.round, 2, 34);
	this.game.ctx.fillStyle = "darkred";
    this.game.ctx.fillText("Health: " + this.game.castleHealth, 2, 51);
	
}

function Castle(game) {
    this.scale = 1.25;

    this.image = ASSET_MANAGER.getAsset("./img/castle.png");
    Entity.call(this, game, 0, 0);
}

Castle.prototype = new Entity();
Castle.prototype.constructor = Castle;

Castle.prototype.draw = function () {
    var xLoc = (this.game.ctx.canvas.width / 2) - (this.image.width * this.scale / 2);
    var yLoc = (this.game.ctx.canvas.height / 2) - (this.image.height * this.scale / 2);
    this.game.ctx.drawImage(this.image, xLoc, yLoc, this.image.width * this.scale, this.image.height * this.scale);
}

function Tower(game) {  
    this.scale = 1;
    this.placed = false;
    this.showRange = true;
    this.range = 300;
    //this.damage = 1;
    this.attackTimer = 180;

    this.image = ASSET_MANAGER.getAsset("./img/tower.png");
    Entity.call(this, game, 0, 0);
}

Tower.prototype = new Entity();
Tower.prototype.constructor = Tower;

Tower.prototype.update = function () {
    if (this.placed) {
        var length = this.game.monsterEntities.length;
        var attacked = false;
        this.attackTimer--;

        for (var i = 0; i < length && !attacked && this.attackTimer <= 0; i++) {
            var dx = this.buildX + (this.image.width * this.scale / 2) - this.game.monsterEntities[i].x;
            var dy = this.buildY + (this.image.height * this.scale / 2) - this.game.monsterEntities[i].y;

            var distance = Math.sqrt(dx * dx + dy * dy);
            //var distance = Math.sqrt(Math.pow(this.buildX - this.game.monsterEntities[i].x, 2) + Math.pow(this.buildY - this.game.monsterEntities[i].y, 2));
            
            if (distance <= this.range) {
                //console.log("Tower Attacking at distance: " + distance);
                attacked = true;
                this.game.addTopEntity(new ArrowAttack(this.game, this.buildX + 20, this.buildY + 40, this.game.monsterEntities[i].x + 64 * zScale, this.game.monsterEntities[i].y + 64 * zScale, this.game.monsterEntities[i]));
                //this.game.monsterEntities[i].health -= this.damage;
            }
        }

        if (this.attackTimer === 0) this.attackTimer = 120;
    }
}

Tower.prototype.draw = function () {
    if (this.game.mouse && this.game.isBuilding && !this.placed) {
        this.buildX = this.game.mouse.layerX - (this.image.width * this.scale / 2);
        this.buildY = this.game.mouse.layerY - (this.image.height * this.scale / 2);
    }
    if (this.buildY && this.buildX) {
        this.game.ctx.drawImage(this.image, this.buildX, this.buildY, this.image.width * this.scale, this.image.height * this.scale);
        if (this.showRange) {
            this.game.ctx.beginPath();
            this.game.ctx.save();
            this.game.ctx.globalAlpha = .5;
            this.game.ctx.strokeStyle = "red";
            this.game.ctx.arc(this.buildX + this.image.width / 2, this.buildY + this.image.height / 2, this.range, 0, Math.PI * 2, false);
            this.game.ctx.stroke();
            this.game.ctx.closePath();
            this.game.ctx.restore();
        }
    }
    if (this.game.click && !this.game.mouse) this.placed = true;
}

function ArrowAttack(game, startx, starty, targetx, targety, enemy) {
    
    //this.radius = 3;
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
    
    //console.log("position: " + this.x + ", " + this.y);
    //console.log("difference: " + dx + ", " + dy);
    //console.log("distance: " + distance);
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
    //this.game.ctx.beginPath();
    //this.game.ctx.fillStyle = "black";
    //this.game.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    //this.game.ctx.fill();
    //this.game.ctx.closePath();
    //this.image.drawFrame(this.game.clockTick, this.game.ctx, this.x, this.y, this.scale);
    this.game.ctx.drawImage(this.image, this.x - (this.image.width / 2), this.y - (this.image.width / 4), this.image.width, this.image.height);
}

function Buildings(game) {
    this.archerIcon = ASSET_MANAGER.getAsset("./img/towerIcon.png");
    this.archerPrice = 500;
    Entity.call(this, game, 0, 0);
}

Buildings.prototype = new Entity();
Buildings.prototype.constructor = Buildings;

Buildings.prototype.draw = function () {
    if (this.game.scoreBoard.score >= this.archerPrice) {
        this.game.ctx.drawImage(this.archerIcon, this.game.ctx.canvas.width - this.archerIcon.width - 10, 5, this.archerIcon.width, this.archerIcon.height);
    } else {
        this.game.ctx.save();
        this.game.ctx.globalAlpha = .5;
        this.game.ctx.drawImage(this.archerIcon, this.game.ctx.canvas.width - this.archerIcon.width - 10, 5, this.archerIcon.width, this.archerIcon.height);
        this.game.ctx.restore();
    }
    this.game.ctx.fillStyle = "black";
    this.game.ctx.fillText("Price: " + this.archerPrice, this.game.ctx.canvas.width - this.archerIcon.width - 5, this.archerIcon.height + 20);
}


// the "main" code begins here

var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./img/zombie.png");
ASSET_MANAGER.queueDownload("./img/castle.png");
ASSET_MANAGER.queueDownload("./img/clickExplode.png");
ASSET_MANAGER.queueDownload("./img/tower.png");
ASSET_MANAGER.queueDownload("./img/towerIcon.png");
ASSET_MANAGER.queueDownload("./img/archerwalk.png");
ASSET_MANAGER.queueDownload("./img/archerattack.png");
ASSET_MANAGER.queueDownload("./img/arrow.png");



ASSET_MANAGER.downloadAll(function () {
    console.log("Starting Zombie Test Simulator");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');
	
    var gameEngine = new GameEngine();

    var scoreBoard = new ScoreBoard(gameEngine);
    gameEngine.addScoreBoard(scoreBoard);
   
    gameEngine.addEntity(scoreBoard);
    gameEngine.addEntity(new Castle(gameEngine));

    var buildings = new Buildings(gameEngine);
    gameEngine.addTopEntity(buildings);
    gameEngine.addBuildings(buildings);
    
	gameEngine.init(ctx);
    gameEngine.start();
		
    
});

