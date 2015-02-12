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
    this.isBuilding = false;
	this.entities = [];
	this.monsterEntities = [];
	this.topEntities = [];
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

GameEngine.prototype.addBuildings = function (buildings) {
    this.buildings = buildings;
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

GameEngine.prototype.addTopEntity = function (entity) {
    console.log('added message');
    this.topEntities.push(entity);
}

GameEngine.prototype.addEntity = function (entity) {
    console.log('added entity');
    this.entities.push(entity);
}

GameEngine.prototype.addMonsterEntity = function (entity) {
    console.log('added monster entity');
    this.monsterEntities.push(entity);
}


GameEngine.prototype.startInput = function () {
    console.log('Starting input');
    var that = this;

    var checkBuild = function (e) {
        var build = false;
        if (e.layerX > that.ctx.canvas.width - that.buildings.archerIcon.width && e.layerY < 120 && that.scoreBoard.score >= 500) {
            build = true;
            that.isBuilding = true;
            that.addTopEntity(new Tower(that));
        }

        return build;
    }

    this.ctx.canvas.addEventListener("mousemove", function (e) {
        if (that.isBuilding) that.mouse = e;
    }, false);

    this.ctx.canvas.addEventListener("click", function (e) {
        that.click = e;
        if (!that.isBuilding) {
            if (!checkBuild(e)) that.addTopEntity(new clickExplode(that));
        } else {
            that.scoreBoard.updateScore(-500);
            that.isBuilding = false;
            that.mouse = null;
        }
            
        e.preventDefault();
    }, false);
	
    console.log('Input started');
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
    for (var i = 0; i < this.topEntities.length; i++) {
        this.topEntities[i].draw(this.ctx);
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
    var messageCount = this.topEntities.length;

    for (var i = 0; i < messageCount; i++) {
        var entity = this.topEntities[i];

        if (!entity.removeFromWorld) {
            entity.update();
        }
    }

    for (var i = this.topEntities.length - 1; i >= 0; --i) {
        if (this.topEntities[i].removeFromWorld) {
            this.topEntities.splice(i, 1);
        }
    }
}

GameEngine.prototype.populate = function () {
    var entitiesCount = this.monsterEntities.length;
	if (entitiesCount === 0 && this.castleHealth !== 0) {
	    this.round++;
		for (var i = 0; i < this.round * 1; i++) {
			var startx = 0 + Math.random() * (800);
			var starty = 800 + Math.random() * 200;
			this.addMonsterEntity(new Zombie(this, startx, starty));
			startx = 0 + Math.random() * (800);
			starty = 0 + Math.random() * -200;
			this.addMonsterEntity(new Zombie(this, startx, starty));
			startx = 800 + Math.random() * 200;
			starty = 0 + Math.random() * 800;
			this.addMonsterEntity(new Zombie(this, startx, starty));
			startx = 0 + Math.random() * -200;
			starty = 0 + Math.random() * 800;
			this.addMonsterEntity(new Zombie(this, startx, starty));




		}
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
	this.mouse = null;
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