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
    this.creatureEntities = [];
	this.foodEntities = [];
	this.feedTimer = 60;
	this.gameTimer = 0;
	this.reproductions = 0;
	this.foodEaten = 0;
	this.deaths = 0;
    this.showOutlines = false;
    this.ctx = null;
    this.click = null;
    this.mouse = null;
    this.wheel = null;
    this.surfaceWidth = null;
    this.surfaceHeight = null;
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
	
	this.ctx.canvas.addEventListener("keypress", function (e) {
		if (String.fromCharCode(e.which) === 'x') {
			that.feedTimer++;
		} else if (String.fromCharCode(e.which) === 'z') {
			that.feedTimer--;
			if (that.feedTimer < 10) that.feedTimer = 10;
		}
		e.preventDefault();
    }, false);

    this.ctx.canvas.addEventListener("click", function (e) {
		e.preventDefault();
        that.addFood(new Food(that, e.layerX, e.layerY));
    }, false);

    this.ctx.canvas.addEventListener("contextmenu", function (e) {
		e.preventDefault();
        that.addCreature(new Creature(that));
    }, false);

    console.log('Input started');
}

GameEngine.prototype.addCreature = function (entity) {
    console.log('added creature to world');
    this.creatureEntities.push(entity);
}

GameEngine.prototype.addFood = function (entity) {
    console.log('added food to world');
    this.foodEntities.push(entity);
}

GameEngine.prototype.draw = function () {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
	this.ctx.save();
	for (var i = 0; i < this.foodEntities.length; i++) {
        this.foodEntities[i].draw(this.ctx);
    }
    for (var i = 0; i < this.creatureEntities.length; i++) {
        this.creatureEntities[i].draw(this.ctx);
    }
    this.ctx.restore();
	
	this.ctx.save();
	this.ctx.fillStyle = "black";
	this.ctx.font = "italic bold 15px Verdana";
	this.ctx.fillText("Creature Info", 30, 735);
	this.ctx.font = "15px Verdana";
	this.ctx.fillText("Creatures Alive: " + this.creatureEntities.length, 3, 755);
	this.ctx.fillText("Asexual Reproductions: " + this.reproductions, 3, 775);
	this.ctx.fillText("Creature Deaths: " + this.deaths, 3, 795);
	this.ctx.font = "italic bold 15px Verdana";
	this.ctx.fillText("Food Info", 685, 735);
	this.ctx.font = "15px Verdana";
	this.ctx.fillText("Timer: " + this.feedTimer, 660, 755);
	this.ctx.fillText("Food in World: " + this.foodEntities.length, 660, 775);
	this.ctx.fillText("Food Eaten: " + this.foodEaten, 660, 795);
	this.ctx.restore();
}

GameEngine.prototype.update = function () {
    var creatureEntitiesCount = this.creatureEntities.length;

    for (var i = 0; i < creatureEntitiesCount; i++) {
        var entity = this.creatureEntities[i];

        if (!entity.removeFromWorld) {
            entity.update();
        }
    }

    for (var i = this.creatureEntities.length - 1; i >= 0; --i) {
        if (this.creatureEntities[i].removeFromWorld) {
            this.creatureEntities.splice(i, 1);
        }
    }
	
	var foodEntitiesCount = this.foodEntities.length;

    for (var i = 0; i < foodEntitiesCount; i++) {
        var entity = this.foodEntities[i];

        if (!entity.removeFromWorld) {
            entity.update();
        }
    }

    for (var i = this.foodEntities.length - 1; i >= 0; --i) {
        if (this.foodEntities[i].removeFromWorld) {
            this.foodEntities.splice(i, 1);
        }
    }
	
	if (Math.floor(this.gameTimer % this.feedTimer) === 0) {
		this.addFood(new Food(this));
	}
}

GameEngine.prototype.loop = function () {
    this.clockTick = this.timer.tick();
	this.gameTimer++;
    this.update();
    this.draw();
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
