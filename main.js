function Animation(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse) {
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
    ctx.drawImage(this.spriteSheet,
                  index * this.frameWidth + offset, vindex * this.frameHeight + this.startY,  // source from sheet
                  this.frameWidth, this.frameHeight,
                  locX, locY,
                  this.frameWidth * scaleBy,
                  this.frameHeight * scaleBy);
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
    this.animation = new Animation(ASSET_MANAGER.getAsset("./img/zombie.png"), 0, 0, 128, 128, 0.05, 30, true, false);
    this.attackingAnimation = new Animation(ASSET_MANAGER.getAsset("./img/zombie.png"), 384, 384, 128, 128, 0.05, 40, true, false);
    this.attacking = false;
    this.radius = 100;
	this.maxHealth = 5;
	this.health = this.maxHealth;
	this.coinWorth = 20;
	this.damage = 1;
	this.x = x;
	this.y = y;
    Entity.call(this, game, this.x, this.y);
}

Zombie.prototype = new Entity();
Zombie.prototype.constructor = Zombie;

Zombie.prototype.update = function () {
    if (this.game.space) this.attacking = true;
	
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
        if (this.attackingAnimation.isDone()) {
            this.attackingAnimation.elapsedTime = 0;
            this.animation.elapsedTime = 0;
            this.attacking = false;
        }
    } else {
        if (this.y > 450) {
            this.y -= (.5 * zScale);
        } else {
            this.attacking = true;
        }
		if (this.y < (400)) this.y = this.game.ctx.canvas.height + (128 * zScale);
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
    //this.image = new Image();
    this.health = 100;
    this.timeBetweenAttack = 60;
    this.scale = 1.25;

    this.image = ASSET_MANAGER.getAsset("./img/castle.png");
    Entity.call(this, game, 0, 0);
}

Castle.prototype = new Entity();
Castle.prototype.constructor = Castle;

Castle.prototype.update = function () {
    var length = this.game.monsterEntities.length;
    this.timeBetweenAttack--;

    for (var i = 0; i < length && this.timeBetweenAttack === 0; i++) {
        if (this.game.monsterEntities[i].attacking) {
            this.health -= this.game.monsterEntities[i].damage;
        }
    }
    if (this.timeBetweenAttack === 0) this.timeBetweenAttack = 60;

    this.game.castleHealth = this.health;
}

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
    this.damage = 1;
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
            var dx = this.buildX - this.game.monsterEntities[i].x;
            var dy = this.buildY - this.game.monsterEntities[i].y;

            var distance = Math.sqrt(dx * dx + dy * dy);
            //var distance = Math.sqrt(Math.pow(this.buildX - this.game.monsterEntities[i].x, 2) + Math.pow(this.buildY - this.game.monsterEntities[i].y, 2));
            
            if (distance <= this.range) {
                console.log("Tower Attacking at distance: " + distance);
                attacked = true;
                this.game.addTopEntity(new TowerAttack(this.game, this.buildX + 20, this.buildY + 40, this.game.monsterEntities[i].x + 64 * zScale, this.game.monsterEntities[i].y + 64 * zScale));
                this.game.monsterEntities[i].health -= this.damage;
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

function TowerAttack(game, startx, starty, targetx, targety) {
    this.radius = 3;
    this.x = startx;
    this.y = starty;
    this.targetx = targetx;
    this.targety = targety;
    this.speed = 10;

    Entity.call(this, game, this.x, this.y);
}

TowerAttack.prototype = new Entity();
TowerAttack.prototype.constructor = TowerAttack;

TowerAttack.prototype.update = function () {
    var dx = this.targetx - this.x;
    var dy = this.targety - this.y;

    var distance = Math.sqrt(dx * dx + dy * dy);

    this.x += (dx / distance) * this.speed;
    this.y += (dy / distance) * this.speed;
    
    console.log("position: " + this.x + ", " + this.y);
    console.log("difference: " + dx + ", " + dy);
    console.log("distance: " + distance);
    if (distance < 10) this.removeFromWorld = true;
}

TowerAttack.prototype.draw = function () {
    this.game.ctx.beginPath();
    this.game.ctx.fillStyle = "black";
    this.game.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    this.game.ctx.fill();
    this.game.ctx.closePath();
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
ASSET_MANAGER.queueDownload("./img/blob.png");
ASSET_MANAGER.queueDownload("./img/clickExplode.png");
ASSET_MANAGER.queueDownload("./img/tower.png");
ASSET_MANAGER.queueDownload("./img/towerIcon.png");

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


