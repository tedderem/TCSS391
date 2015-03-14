function distance(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function Food(game, x, y) {
	this.radius = 5;
	this.color = "red";
	this.x = this.radius + x - this.radius * 2 || this.radius + Math.random() * (800 - this.radius * 2);
	this.y = this.radius + y - this.radius * 2 || this.radius + Math.random() * (800 - this.radius * 2);
	Entity.call(this, game, this.x, this.y);
}

Food.prototype = new Entity();
Food.prototype.constructor = Food;

Food.prototype.update = function () {
	
}

Food.prototype.draw = function (ctx) {
	ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();
}

var colors = ["aqua", "black", "blue", "fuchsia", "gray", "green", "lime", "maroon", "navy", "olive", "orange", "purple", "silver", "teal", "yellow"];

var defaultSpeed = 50;
var maxSpeed = defaultSpeed * 2;
var foodToReproduce = 10;
var initSight = 200;
var maxSight = initSight * 2;
var maxRadius = 40;

function Creature(game, color, x, y, radius, speed, sight) {
	this.radius = radius || 20;
	this.starveTimer = 60;
	this.speed = speed || defaultSpeed;
    this.sightRange = sight || initSight;
	this.showRange = false;
	this.timesEaten = 0;
	this.color = color || colors[Math.floor(Math.random() * colors.length)];
	this.x = x || this.radius + Math.random() * (800 - this.radius * 2);
	this.y = y || this.radius + Math.random() * (800 - this.radius * 2);
    Entity.call(this, game, this.x, this.y);

	var directionx = Math.random() < .5 ? -1 : 1;
	var directiony = Math.random() < .5 ? -1 : 1;
    this.velocity = { x: directionx, y: directiony };
};

Creature.prototype = new Entity();
Creature.prototype.constructor = Creature;

Creature.prototype.collide = function (other) {
    return distance(this, other) < this.radius + other.radius;
};

Creature.prototype.collideLeft = function () {
    return (this.x - this.radius) < 0;
};

Creature.prototype.collideRight = function () {
    return (this.x + this.radius) > 800;
};

Creature.prototype.collideTop = function () {
    return (this.y - this.radius) < 0;
};

Creature.prototype.collideBottom = function () {
    return (this.y + this.radius) > 800;
};

Creature.prototype.update = function () {
    Entity.prototype.update.call(this);

    // this.x += this.velocity.x * this.game.clockTick;
    // this.y += this.velocity.y * this.game.clockTick;

    if (this.collideLeft() || this.collideRight()) {
        this.velocity.x = -this.velocity.x;
        if (this.collideLeft()) this.x = this.radius;
        if (this.collideRight()) this.x = 800 - this.radius;
        this.x += this.velocity.x * this.speed * this.game.clockTick;
        this.y += this.velocity.y * this.speed * this.game.clockTick;
    }

    if (this.collideTop() || this.collideBottom()) {
        this.velocity.y = -this.velocity.y;
        if (this.collideTop()) this.y = this.radius;
        if (this.collideBottom()) this.y = 800 - this.radius;
        this.x += this.velocity.x * this.speed * this.game.clockTick;
        this.y += this.velocity.y * this.speed * this.game.clockTick;
    }

    for (var i = 0; i < this.game.creatureEntities.length; i++) {
        var ent = this.game.creatureEntities[i];
        if (ent !== this && this.collide(ent)) {
            var temp = { x: this.velocity.x, y: this.velocity.y };

            var dist = distance(this, ent);
            var delta = this.radius + ent.radius - dist;
            var difX = (this.x - ent.x)/dist;
            var difY = (this.y - ent.y)/dist;

            this.x += difX * delta / 2;
            this.y += difY * delta / 2;
            ent.x -= difX * delta / 2;
            ent.y -= difY * delta / 2;
			
			this.velocity.x = ent.velocity.x;
			this.velocity.y = ent.velocity.y;
			ent.velocity.x = temp.x;
			ent.velocity.y = temp.y;
			
            // this.x += this.velocity.x * this.speed * this.game.clockTick;
            // this.y += this.velocity.y * this.speed * this.game.clockTick;
            // ent.x += ent.velocity.x * this.speed * this.game.clockTick;
            // ent.y += ent.velocity.y * this.speed * this.game.clockTick;
        }
    }
	
	var closestFood = { distance: this.sightRange * 2 };
	
	for (var i = 0; i < this.game.foodEntities.length; i++) {
		var food = this.game.foodEntities[i];
		var dist = distance(this, food);
        if (dist <= this.sightRange && dist < closestFood.distance) {
			closestFood.index = i;
			closestFood.distance = dist;
        }
    }
	
	if (closestFood.index || closestFood.index === 0) {
		var food = this.game.foodEntities[closestFood.index];
		if (closestFood.distance - this.radius - food.radius <= 0) {
			food.removeFromWorld = true;
			this.game.foodEaten++;
			this.timesEaten++;
			this.speed = this.speed < defaultSpeed - 5 ? defaultSpeed : this.speed + 5;
			this.speed = this.speed > maxSpeed ? maxSpeed : this.speed;
			this.sightRange = this.sightRange > maxSight ? maxSight : this.sightRange;
			this.radius = this.radius < 18 ? 20 : this.radius + 2;
			this.radius = this.radius >= maxRadius ? maxRadius : this.radius;
		}
		var difX = (food.x - this.x);
		var difY = (food.y - this.y);
		this.velocity.x = difX / closestFood.distance;
		this.velocity.y = difY / closestFood.distance;
		
		// this.x += this.velocity.x * this.speed * this.game.clockTick;
		// this.y += this.velocity.y * this.speed * this.game.clockTick;
	}
	
	if (this.timesEaten === foodToReproduce) {
		this.game.reproductions++;
		this.timesEaten = 0;
		this.game.addCreature(new Creature(this.game, this.color, this.x + this.radius * 2, this.y + this.radius * 2, this.radius, this.speed, this.sightRange));
	}
	
	this.x += this.velocity.x * this.speed * this.game.clockTick;
	this.y += this.velocity.y * this.speed * this.game.clockTick;
	
	this.starveTimer--;
	if (this.starveTimer === 0) {
		this.starveTimer = 60;
		this.radius -= .5;
		this.speed--;
		
		if (this.radius <= 1) {
			this.removeFromWorld = true;
			this.game.deaths++;
		}
	}
};

Creature.prototype.draw = function (ctx) {
	ctx.save();
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();
	
	if (this.showRange) {
		ctx.beginPath();
		ctx.strokeStyle = this.color;
		ctx.globalAlpha = .5;
		ctx.arc(this.x, this.y, this.sightRange, 0, Math.PI * 2, false);
		ctx.stroke();
		ctx.closePath();
		ctx.restore();
	}
};


function start() {
	console.log("Beginning simulation");
	var canvas = document.getElementById("world");
	var ctx = canvas.getContext('2d');

	var gameEngine = new GameEngine();
	
	var initColors = ["orange", "green", "blue"];
	
	for (var i = 0; i < initColors.length; i++) {
		gameEngine.addCreature(new Creature(gameEngine, initColors[i]));
	}
    
    gameEngine.init(ctx);
    gameEngine.start();
}


document.addEventListener("DOMContentLoaded", start, false);
