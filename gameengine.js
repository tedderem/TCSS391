// This game shell was modified and adapted from Seth Ladd's "Bad Aliens" template

var version = 'v1.2.0';

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
    this.gameStarted = false;
    this.round = 0;
    this.castleHealth = 100;
    this.maxCastleHealth = 100;
    this.speedModifier = 1;
    this.buildDuration = 30;
    this.intermission = false;
    this.intermissionCancel = false;
    this.monstersKilled = { Zombies: 0, Archers: 0, Warriors: 0, Berserkers: 0 };
    this.buildingsUp = { arrow: 0, cannon: 0 };
    this.gameOver = false;
    this.isBuilding = false;
	this.monsterEntities = [];
	this.buildingEntities = [];
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

GameEngine.prototype.addMusic = function (music) {
    this.music = music;
}

GameEngine.prototype.addTopEntity = function (entity) {
    //console.log('added message');
    this.topEntities.push(entity);
}

GameEngine.prototype.addBuilding = function (entity) {
    //console.log('added entity');
    this.buildingEntities.push(entity);
}

GameEngine.prototype.addMonsterEntity = function (entity) {
    //console.log('added monster entity');
    this.monsterEntities.push(entity);
}

GameEngine.prototype.restart = function (entity) {
    this.round = 0;
    this.buildingEntities[0].health = 100;
    this.maxCastleHealth = this.buildingEntities[0].health;
    this.gameOver = false;
    this.speedModifier = 1;
    this.intermission = false;
    this.intermissionCancel = false;
    this.gameOver = false;
    this.isBuilding = false;
    this.monsterEntities = [];
    this.topEntities = [];
    this.monstersKilled = { Zombies: 0, Archers: 0, Warriors: 0, Berserkers: 0 };
    this.buildingsUp = { arrow: 0, cannon: 0 };

    var sb = new ScoreBoard(this);
    this.addScoreBoard(sb);
}


GameEngine.prototype.startInput = function () {
    console.log('Starting input');
    var that = this;

    function extractXandY(e) {
        return {x: e.layerX, y: e.layerY, shiftKey: e.shiftKey};
    }
    
    this.ctx.canvas.addEventListener("keypress", function (e) {
        e.preventDefault();
        //user hit 'space' to cancel building
        if (e.keyCode === 32 && that.isBuilding) {
            //remove the last entry in the building list
            that.buildingEntities.splice(that.buildingEntities.length - 1, 1);
            //replace building value
            that.scoreBoard.updateScore(that.currentPrice);
            that.isBuilding = false;
            that.mouse = null;
        }

        //user hit r to toggle radius display
        if (e.keyCode === 114 && that.gameStarted && !that.gameOver) {
            //if display radius is on, turn it off. If off, turn on.
            displayRadius = displayRadius ? false : true;
        }

        //user hit 'x' to cancel building phase
        if (e.keyCode === 120 && that.intermission) {
            that.intermissionCancel = true;
        }

        //Developer keypress '0' for stress-testing 
        if (e.keyCode === 48) {
            that.monsterEntities = [];
            that.scoreBoard.updateScore(10000);
            that.round += 5;
        }

        //user hit enter to start game
        if (e.keyCode === 13 && !that.gameStarted) {
            that.gameStarted = true;
        } else if (e.keyCode === 13 && that.gameStarted && that.gameOver) {
            that.restart();
        }

        if (!that.isBuilding) {
            //user hit 1 to restore health
            if (e.keyCode === 49 && that.intermission && that.scoreBoard.score >= 250) {
                if (that.castleHealth < that.maxCastleHealth) {
                    that.scoreBoard.updateScore(-250);
                    that.buildingEntities[0].health = that.maxCastleHealth;
                } else {
                    that.addTopEntity(new Message(that, "Already at full health", 335 - (that.ctx.measureText("Already at full health").width / 2), 550, "red", false, 2, "Bold 15pt"));
                }
            } else if (e.keyCode === 49 && that.intermission && that.scoreBoard.score < 250) {
                that.addTopEntity(new Message(that, "Not enough coins", 385 - (that.ctx.measureText("Not enough coins").width), 550, "red", false, 2, "Bold 15pt"));
            }

            //user hit 2 to increase max health
            if (e.keyCode === 50 && that.intermission && that.scoreBoard.score >= 500) {
                that.scoreBoard.updateScore(-500);
                that.maxCastleHealth += 50;
            } else if (e.keyCode === 50 && that.intermission && that.scoreBoard.score < 500) {
                that.addTopEntity(new Message(that, "Not enough coins", 385 - (that.ctx.measureText("Not enough coins").width), 550, "red", false, 2, "Bold 15pt"));
            }

            //user hit 3 to create archer tower
            if (e.keyCode === 51 && that.intermission && that.scoreBoard.score >= 1000) {
                if (!that.isBuilding) {
                    that.addTopEntity(new Message(that, "Move your Mouse to place Tower", 225, 400, "white", false, 2, "Bold 15pt"));
                    that.buildingsUp.arrow++;
                    that.currentPrice = 1000;
                    that.scoreBoard.updateScore(-1000);
                    that.isBuilding = true;
                    that.addBuilding(new Tower(that));
                } else {
                    that.addTopEntity(new Message(that, "Building already in progress", 385 - (that.ctx.measureText("Building already in progress").width), 550, "red", false, 2, "Bold 15pt"));
                }
            } else if (e.keyCode === 51 && that.intermission && that.scoreBoard.score < 1000) {
                that.addTopEntity(new Message(that, "Not enough coins", 385 - (that.ctx.measureText("Not enough coins").width), 550, "red", false, 2, "Bold 15pt"));
            }

            //user hit 4 to create a cannon tower 
            if (e.keyCode === 52 && that.intermission && that.scoreBoard.score >= 1500) {
                if (!that.isBuilding) {
                    that.addTopEntity(new Message(that, "Move your Mouse to place Tower", 225, 400, "white", false, 2, "Bold 15pt"));
                    that.buildingsUp.cannon++;
                    that.currentPrice = 1500;
                    that.scoreBoard.updateScore(-1500);
                    that.isBuilding = true;
                    that.addBuilding(new Cannon(that));
                } else {
                    that.addTopEntity(new Message(that, "Building already in progress", 385 - (that.ctx.measureText("Building already in progress").width), 550, "red", false, 2, "Bold 15pt"));
                }
            } else if (e.keyCode === 52 && that.intermission && that.scoreBoard.score < 1500) {
                that.addTopEntity(new Message(that, "Not enough coins", 385 - (that.ctx.measureText("Not enough coins").width), 550, "red", false, 2, "Bold 15pt"));
            }

            //user hit 5 to add a bog
            if (e.keyCode === 53 && that.intermission && that.speedModifier === 1 && that.scoreBoard.score >= 5000) {
                that.scoreBoard.updateScore(-5000);
                that.speedModifier = .75;
            } else if (e.keyCode === 53 && that.intermission && that.speedModifier !== 1) {
                that.addTopEntity(new Message(that, "Bog already purchased", 275, 550, "red", false, 2, "Bold 15pt"));
            } else if (e.keyCode === 53 && that.intermission && that.scoreBoard.score < 5000) {
                that.addTopEntity(new Message(that, "Not enough coins", 385 - (that.ctx.measureText("Not enough coins").width), 550, "red", false, 2, "Bold 15pt"));
            }
        }
    }, false);
    
    this.ctx.canvas.addEventListener("mousemove", function (e) {
        if (that.isBuilding) {
            that.canBuild = true;
            var current = that.buildingEntities[that.buildingEntities.length - 1];
            current.badPlacement = false;
            var currentCoords = {x1: current.x, y1: current.y, x2: current.x + current.image.width * current.scale, y2: current.y + current.image.height * current.scale};
            for (var i = 0; i < that.buildingEntities.length - 1; i++) {
                var thisBuilding = that.buildingEntities[i];
                var thisCoords = {x1: thisBuilding.x, y1: thisBuilding.y, x2: thisBuilding.x + thisBuilding.image.width * thisBuilding.scale, y2: thisBuilding.y + thisBuilding.image.height * thisBuilding.scale};
                if (currentCoords.x1 < thisCoords.x2 && currentCoords.x2 > thisCoords.x1 && currentCoords.y1 < thisCoords.y2 && currentCoords.y2 > thisCoords.y1) {
                    
                    current.badPlacement = true;
                    that.canBuild = false;
                } 
            }

            that.mouse = extractXandY(e);
        }
    }, false);
    
    this.ctx.canvas.addEventListener("click", function (e) {        
        that.click = extractXandY(e);
        that.scoreBoard.update();
        if (that.isBuilding && that.mouse && that.canBuild) {
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
    for (var i = 0; i < this.buildingEntities.length; i++) {
        this.buildingEntities[i].draw(this.ctx);
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
    var entitiesCount = this.buildingEntities.length;

    for (var i = 0; i < entitiesCount; i++) {
        var entity = this.buildingEntities[i];

        if (!entity.removeFromWorld) {
            entity.update();
        }
    }

    for (var i = this.buildingEntities.length - 1; i >= 0; --i) {
        if (this.buildingEntities[i].removeFromWorld) {
            this.buildingEntities.splice(i, 1);
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

    if (this.castleHealth <= 0) this.gameOver = true;
}

//Calculate the coordinates for the enemies spawning in
var CalcCoords = function (round) {
    if (Math.random() < .5) {
        var startx = Math.random() * 850;

        //50 percent change that the y coordinate will be above or below the screen
        if (Math.random() < .5) {
            var starty = Math.random() < .75 && round > 5 ? (-100 - Math.random() * 200) : -100;
        } else {
            var starty = Math.random() < .75 && round > 5 ? (900 + Math.random() * 200) : 900;
        }
    } else {
        var starty = Math.random() * 850;

        //50 percent chance x coordinate will either be off to the left or right of screen
        if (Math.random() < .5) {
            var startx = Math.random() < .75 && round > 5 ? (-100 - Math.random() * 200) : -100;
        } else {
            var startx = Math.random() < .75 && round > 5 ? (900 + Math.random() * 200) : 900;
        }
    }

    return { x: startx, y: starty };
}

GameEngine.prototype.populate = function () {
    var entitiesCount = this.monsterEntities.length;
	if (entitiesCount === 0 && !this.gameOver && !this.intermission) {
	    this.round++;

	    //Spawn zombies
	    for (var i = 0; i < this.round * 2; i++) {
	        var coords = CalcCoords(this.round);
	        this.addMonsterEntity(new Zombie(this, coords.x, coords.y));
	    }

        //spawn archers
	    for (var i = 0; i < Math.floor(this.round / 3); i++) {
	        var coords = CalcCoords(this.round);
	        this.addMonsterEntity(new Archer(this, coords.x, coords.y));
	    }

	    //spawn warriors
	    for (var i = 0; i < Math.floor(this.round / 5); i++) {
	        var coords = CalcCoords(this.round);
	        this.addMonsterEntity(new Warrior(this, coords.x, coords.y));
	    }

	    //spawn dudes/berserkers
	    for (var i = 0; i < Math.floor(this.round / 10); i++) {
            //50 percent chance that he will spawn
	        if (Math.random() < .5) {
	            var coords = CalcCoords(this.round);
	            this.addMonsterEntity(new Berserker(this, coords.x, coords.y));
            }
	    }
	}    
}

//Function called when game is over. Removes top entities and monsters to stop sounds playing. 
GameEngine.prototype.endGame = function () {
    this.monsterEntities = [];
    this.buildingEntities.splice(1, this.buildingEntities.length - 1);
    this.topEntities = [];
}

GameEngine.prototype.checkRound = function () {
    if (this.monsterEntities.length === 0 && !this.gameOver && !this.intermission && this.round > 0) {
        this.intermission = true;
        this.startTime = Date.now();
        barOffset = 0;
    }

    if (this.intermission) {
        if (!this.isBuilding) {
            barOffset = barOffset >= 200 ? 200 : barOffset + 12;
            this.ctx.drawImage(this.buildBar, 0, 800 - barOffset, this.buildBar.width, this.buildBar.height);
        } else {
            barOffset = barOffset <= -200 ? -200 : barOffset - 12;
            this.ctx.drawImage(this.buildBar, 0, 800 - barOffset, this.buildBar.width, this.buildBar.height);
        }
        this.ctx.save();
        this.ctx.font = "bold 40px arial";
        this.ctx.fillStyle = "white";
        this.ctx.fillText("Build & Repair!", 400 - this.ctx.measureText("Build & Repair!").width / 2, 115);
        var time = Math.floor((Date.now() - this.startTime) / 1000);
        this.ctx.font = "bold 60px arial";
        if (time >= this.buildDuration - 5) this.ctx.fillStyle = "red";
        this.ctx.fillText(this.buildDuration - time, 400 - this.ctx.measureText(this.buildDuration - time).width / 2, 175);

        if (this.isBuilding) {
            this.ctx.font = "bold 20px arial";
            this.ctx.fillText("Press 'spacebar' to cancel", 400 - this.ctx.measureText("Press 'spacebar' to cancel").width / 2, 600);
        }
        
        this.ctx.restore();

        if (time >= this.buildDuration) this.intermission = false;
    }
}


GameEngine.prototype.loop = function () {
    this.clockTick = this.timer.tick();
    this.music.checkDuration();
    if (this.gameStarted && !this.gameOver) {
        this.ctx.save();
        this.update();        
        this.draw();
        if (this.intermission) {
            this.ctx.save();
            this.fog.draw();
            this.ctx.restore();
        }
        if (!this.intermissionCancel) {
            this.checkRound();
        } else {
            this.intermissionCancel = false;
            this.intermission = false;
        }
        this.populate();
        this.ctx.save();
        this.ctx.globalAlpha = .25;
        this.ctx.font = "bold 20pt Arial";
        this.ctx.fillStyle = "white";
        this.ctx.fillText(version, 3, 797);
        this.ctx.restore();
        if (!this.intermission) {
            this.ctx.save();
            this.fog.draw();
            this.ctx.restore();
        }

        this.scoreBoard.draw();
        this.ctx.restore();
    } else if (!this.gameStarted && !this.gameOver) {
        this.ctx.save();
        this.update();
        this.startScreen.draw();
        this.ctx.restore();
    } else if (this.gameOver) {
        this.endGame();
        this.ctx.save();
        this.update();
        this.gameOverScreen.draw();
        this.ctx.restore();
    }
	this.click = null;
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

}

//Draws an entities health bar
Entity.prototype.drawHealth = function () {
    var barWidth = 40;
    var barHeight = 6;

    var startingSpot = this.x + (this.width / 2 - barWidth / 2);
       
    

    this.game.ctx.save();
    this.game.ctx.beginPath();
    this.game.ctx.fillStyle = "black";
    this.game.ctx.fillRect(startingSpot - 1, this.y - 6, barWidth + 2, barHeight + 2);
    this.game.ctx.fill();
    this.game.ctx.closePath();

    this.game.ctx.beginPath();
    this.game.ctx.fillStyle = "red";
    this.game.ctx.fillRect(startingSpot, this.y - 5, barWidth, barHeight);
    this.game.ctx.fill();
    this.game.ctx.closePath();

    this.game.ctx.beginPath();
    this.game.ctx.fillStyle = "green";
    var healthPercentage = barWidth * (this.health / this.maxHealth);
    this.game.ctx.fillRect(startingSpot, this.y - 5, healthPercentage, barHeight);
    this.game.ctx.fill();
    this.game.ctx.closePath();
    this.game.ctx.restore();
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