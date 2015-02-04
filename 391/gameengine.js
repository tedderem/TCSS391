// This game shell was happily copied from Googler Seth Ladd's "Bad Aliens" game and his Google IO talk in 2011

window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (/* function */ callback, /* DOMElement */ element) {
                window.setTimeout(callback, 1000 / 60);
            };
})();


function Timer() {
    this.gameTime = 0;
    this.maxStep = 0.05;
    this.wallLastTimestamp = 0;
}

Timer.prototype.tick = function () {
    var wallCurrent = Date.now();
    var wallDelta = (wallCurrent - this.wallLastTimestamp) / 1000;
    this.wallLastTimestamp = wallCurrent;

    var gameDelta = Math.min(wallDelta, this.maxStep);
    this.gameTime += gameDelta;
    return gameDelta;
}

function GameEngine() {
    this.round = 0;
	this.castleHealth = 100;
	this.entities = [];
	this.monsterEntities = [];
	this.messages = [];
    this.showOutlines = false;
    this.ctx = null;
    this.click = null;
    this.mouse = null;
    this.wheel = null;
    this.surfaceWidth = null;
    this.surfaceHeight = null;
}

GameEngine.prototype.addScoreBoard = function (scoreboard) {
    this.scoreBoard = scoreboard;
}

GameEngine.prototype.init = function (ctx) {
    this.ctx = ctx;
    this.surfaceWidth = this.ctx.canvas.width;
    this.surfaceHeight = this.ctx.canvas.height;
    this.startInput();
    this.timer = new Timer();
    console.log('game initialized');
}

GameEngine.prototype.start = function () {
    console.log("starting game");
    var that = this;
    (function gameLoop() {
        that.loop();
        requestAnimFrame(gameLoop, that.ctx.canvas);
    })();
}

GameEngine.prototype.startInput = function () {
    console.log('Starting input');
    var that = this;

    this.ctx.canvas.addEventListener("click", function (e) {
        that.click = e;
        e.preventDefault();
    }, false);
	
	this.ctx.canvas.addEventListener("keypress", function (e) {
        if (String.fromCharCode(e.which) === ' ') that.space = true;
        e.preventDefault();
    }, false);

    console.log('Input started');
}

GameEngine.prototype.addEntity = function (entity) {
    console.log('added entity');
    this.entities.push(entity);
}

GameEngine.prototype.addMonsterEntity = function (entity) {
    console.log('added monster entity');
    this.monsterEntities.push(entity);
}

GameEngine.prototype.addMessage = function (entity) {
    console.log('added message');
    this.messages.push(entity);
}

GameEngine.prototype.draw = function () {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.save();
    for (var i = 0; i < this.entities.length; i++) {
        this.entities[i].draw(this.ctx);
    }
    for (var i = 0; i < this.monsterEntities.length; i++) {
        this.monsterEntities[i].draw(this.ctx);
    }
    for (var i = 0; i < this.messages.length; i++) {
        this.messages[i].draw(this.ctx);
    }
    this.ctx.restore();
}

GameEngine.prototype.update = function () {
    var entitiesCount = this.entities.length;

    for (var i = 0; i < entitiesCount; i++) {
        var entity = this.entities[i];

        if (!entity.removeFromWorld) {
            entity.update();
        }
    }

    for (var i = this.entities.length - 1; i >= 0; --i) {
        if (this.entities[i].removeFromWorld) {
            this.entities.splice(i, 1);
        }
    }

    var monsterEntitiesCount = this.monsterEntities.length;

    for (var i = 0; i < monsterEntitiesCount; i++) {
        var entity = this.monsterEntities[i];

        if (!entity.removeFromWorld) {
            entity.update();
        }
    }

    for (var i = this.monsterEntities.length - 1; i >= 0; --i) {
        if (this.monsterEntities[i].removeFromWorld) {
            this.monsterEntities.splice(i, 1);
        }
    }
    
    var messageCount = this.messages.length;

    for (var i = 0; i < messageCount; i++) {
        var entity = this.messages[i];

        if (!entity.removeFromWorld) {
            entity.update();
        }
    }

    for (var i = this.messages.length - 1; i >= 0; --i) {
        if (this.messages[i].removeFromWorld) {
            this.messages.splice(i, 1);
        }
    }
}

GameEngine.prototype.populate = function () {
    var entitiesCount = this.monsterEntities.length;
	if (entitiesCount === 0) {
	    this.round++;
		for (var i = 0; i < this.round * this.round; i++) {
			var startx = 300 + Math.random() * (120);
		    //var starty = Math.random() * this.ctx.canvas.height;
			var starty = 600 + Math.random() * 600;
			this.addMonsterEntity(new Zombie(this, startx, starty));
		}
		//for (var i = 0; i < 10; i++) {
		//    var startx = Math.random() * (this.ctx.canvas.width - 64);
		//    var starty = Math.random() * this.ctx.canvas.height;
		//    this.addMonsterEntity(new Blob(this, startx, starty));
		//}
	}

	
    
}

GameEngine.prototype.loop = function () {
    this.clockTick = this.timer.tick();
	this.ctx.save();
	this.update();
    this.draw();
	this.populate();
	this.ctx.restore();
    this.click = null;
	this.space = null;
}

function Entity(game, x, y) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.removeFromWorld = false;
}

Entity.prototype.update = function () {
}

Entity.prototype.draw = function (ctx) {
    if (this.game.showOutlines && this.radius) {
        this.game.ctx.beginPath();
        this.game.ctx.strokeStyle = "green";
        this.game.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.game.ctx.stroke();
        this.game.ctx.closePath();
    }
}

Entity.prototype.rotateAndCache = function (image, angle) {
    var offscreenCanvas = document.createElement('canvas');
    var size = Math.max(image.width, image.height);
    offscreenCanvas.width = size;
    offscreenCanvas.height = size;
    var offscreenCtx = offscreenCanvas.getContext('2d');
    offscreenCtx.save();
    offscreenCtx.translate(size / 2, size / 2);
    offscreenCtx.rotate(angle);
    offscreenCtx.translate(0, 0);
    offscreenCtx.drawImage(image, -(image.width / 2), -(image.height / 2));
    offscreenCtx.restore();
    //offscreenCtx.strokeStyle = "red";
    //offscreenCtx.strokeRect(0,0,size,size);
    return offscreenCanvas;
}