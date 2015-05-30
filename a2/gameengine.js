// This game shell was happily copied from Googler Seth Ladd's "Bad Aliens" game and his Google IO talk in 2011
//var socket = io.connect("http://76.28.150.193:8888");


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

    var that = this;

 /*    socket.on("load", function (data) {       
        //that.creatureEntities = data.creatures;        
        that.feedTimer = data.data.feedTimer;
        that.creatureEntities = [];
        for (var i = 0; i < data.data.creatures.length; i++) {
            var oldCreature = data.data.creatures[i];

            var creature = new Creature(that);

            creature.color = oldCreature.color;
            creature.radius = oldCreature.radius;
            creature.speed = oldCreature.speed;
            creature.timesEaten = oldCreature.timesEaten;
            creature.x = oldCreature.x;
            creature.y = oldCreature.y;
            creature.starveTimer = oldCreature.starveTimer;
            creature.sightRange = oldCreature.sightRange;
            creature.velocity = oldCreature.velocity;


            that.addCreature(creature);
        }
        //load the various data values for food eaten, deaths, and reproductions
        that.foodEaten = data.data.foodEaten;
        that.deaths = data.data.deaths;
        that.reproductions = data.data.reproductions;

        console.log("Game loaded");
        console.log(data.data);
    }); */
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

	/* function save() {
	    var saveName = prompt("Enter a name to save this game");

	    if (saveName) {
	        console.log("Saving game with state name: " + saveName);

	        var creatureInfo = [];
	        //iterate through all creatures
	        for (var i = 0; i < that.creatureEntities.length; i++) {
	            var creature = {};
	            //store all info from that creature
	            creature.color = that.creatureEntities[i].color;
	            creature.radius = that.creatureEntities[i].radius;
	            creature.speed = that.creatureEntities[i].speed;
	            creature.timesEaten = that.creatureEntities[i].timesEaten;
	            creature.x = that.creatureEntities[i].x;
	            creature.y = that.creatureEntities[i].y;
	            creature.starveTimer = that.creatureEntities[i].starveTimer;
	            creature.sightRange = that.creatureEntities[i].sightRange;
	            creature.velocity = that.creatureEntities[i].velocity;

	            creatureInfo.push(creature);
	        }

	        socket.emit('save', { studentname: "Erik Tedder", statename: "test", data: { creatures: creatureInfo, feedTimer: that.feedTimer, deaths: that.deaths, reproductions: that.reproductions, foodEaten: that.foodEaten } });
	    }
	} */
    
	/* function load() {
	    var loadName = prompt("Enter the name of the game to load");
	    if (loadName) {
	        console.log("Loading game with state name: " + loadName);
	        socket.emit('load', { studentname: "Erik Tedder", statename: "test" });
	    }
	} */

    this.ctx.canvas.addEventListener("click", function (e) {
        e.preventDefault();
       /*  if (e.layerX > 750 && e.layerY > 0 && e.layerY < 15) {
            save();
        } else if (e.layerX > 750 && e.layerY > 15 && e.layerY < 35) {
            load();
        } else { */
            that.addFood(new Food(that, e.layerX, e.layerY));
       // }
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

	//display information about game
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

    //display save and load "buttons"
	/* this.ctx.save();
	this.ctx.fillStyle = "black";
	this.ctx.font = "bold 15px Verdana";
	this.ctx.fillText("Save", 750, 15);
	this.ctx.fillText("Load", 750, 35);
	this.ctx.restore(); */
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
