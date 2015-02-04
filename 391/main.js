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

var zScale = .4;

function Zombie(game, x, y) {
    this.animation = new Animation(ASSET_MANAGER.getAsset("./img/zombie.png"), 0, 0, 128, 128, 0.05, 30, true, false);
    this.attackingAnimation = new Animation(ASSET_MANAGER.getAsset("./img/zombie.png"), 384, 384, 128, 128, 0.05, 40, true, false);
    this.attacking = false;
    this.radius = 100;
	this.health = 5;
	this.maxHealth = 5;
	this.coinWorth = 5;
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
		var diffx = Math.abs(this.game.click.x - (this.x + (64 * zScale)));
		var diffy = Math.abs(this.game.click.y - (this.y + (64 * zScale)));
		
		//see if the difference is within a certain range (30 in this case)
		//Multiplies by the zScale to ensure it fluctuates with size
		if (diffx <= (30 * zScale) && diffy <= (30 * zScale) || this.game.click.shiftKey) {
			//decrement health
			this.health--;
			//add new message entity to the game
			if (this.health !== 0)this.game.addEntity(new Message(this.game, "Health: " + this.health + "/" + this.maxHealth , this.game.click.x, this.game.click.y));
			//zombie is dead
			if (this.health === 0) {
				this.game.scoreBoard.updateScore(this.coinWorth);
				this.game.addEntity(new Message(this.game, "+" + this.coinWorth + " Coins" , this.game.click.x, this.game.click.y));
				this.removeFromWorld = true;				
			}
		}
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
        //this.game.ctx.save();
        //this.game.ctx.translate(64, 64);
        //this.game.ctx.rotate(180 * (Math.PI / 180));
        //this.game.ctx.translate(0, 0);
        //this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y, zScale);
        //this.game.ctx.restore();
        this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y, zScale);
    }
	
    Entity.prototype.draw.call(this);
}

function Blob(game, x, y) {
    this.animation = new Animation(ASSET_MANAGER.getAsset("./img/blob.png"), 0, 0, 94, 93, 0.05, 210, true, false);
    this.radius = 100;
    this.x = x;
    this.y = y;
    Entity.call(this, game, this.x, this.y);
}

Blob.prototype = new Entity();
Blob.prototype.constructor = Blob;

Blob.prototype.update = function () {
    
    Entity.prototype.update.call(this);
}

Blob.prototype.draw = function (ctx) {
    this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y, zScale);
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

function Background(game) {
    this.image = new Image();

    this.image.src = "./img/background.gif";
    Entity.call(this, game, 0, 0);
}

Background.prototype = new Entity();
Background.prototype.constructor = Background;

Background.prototype.draw = function () {
    this.game.ctx.drawImage(this.image, -10, -50, this.game.ctx.canvas.width + 50, this.game.ctx.canvas.height + 250);
}

function Castle(game) {
    this.image = new Image();
    this.health = 100;
    this.timeBetweenAttack = 60;
    this.scale = 1.25;

    this.image.src = "./img/castle.png";
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


// the "main" code begins here

var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./img/zombie.png");
ASSET_MANAGER.queueDownload("./img/background.gif");
ASSET_MANAGER.queueDownload("./img/castle.png");
ASSET_MANAGER.queueDownload("./img/blob.png");


ASSET_MANAGER.downloadAll(function () {
    console.log("Starting Zombie Test Simulator");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');
	
    var gameEngine = new GameEngine();

    var scoreBoard = new ScoreBoard(gameEngine);
    gameEngine.addScoreBoard(scoreBoard);
   
    gameEngine.addEntity(new Background(gameEngine));
    gameEngine.addEntity(scoreBoard);
    gameEngine.addEntity(new Castle(gameEngine));
    
	gameEngine.init(ctx);
    gameEngine.start();
		
    
});


