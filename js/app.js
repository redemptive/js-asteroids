$(document).ready(function() {

	var gameHeight = 700;
	var gameWidth = 700;

	const gameArea = {
		canvas : document.createElement("canvas"),
		start : function () {
			//Initiate the game area
			this.canvas.width = gameHeight;
			this.canvas.height = gameWidth;
			this.context = this.canvas.getContext("2d");
			document.body.insertBefore(this.canvas,document.body.childNodes[0]);
			this.interval = setInterval(updateGameArea, 20);
		},
		clear : function () {
			//Clear the canvas to avoid drawing over the last frame
			this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
			this.draw(this.canvas.height,this.canvas.width,0,0,"black");
		},
		draw : function (height,width,x,y,color,rotation = 0) {
			//Draw function with rotation if provided
			this.context.save();
			this.context.fillStyle = color;
			this.context.translate(x,y);
			this.context.rotate(rotation);
			this.context.fillRect(0, 0, width, height);
			this.context.restore();
		},
		drawText : function (theString, x, y, size = 16) {
			//Draw function for text
			this.context.save();
			this.context.font = size + "px Verdana";
			this.context.fillText(theString, x, y);
			this.context.restore();
		},
		drawImg : function (width, height, x, y, image, rotation = 0) {
			//Draw an image with the given parameters
			this.context.save();
			this.context.drawImage(image, x, y, width, height);
			this.context.restore();
		}
	};
	//87 & 38 = up, 68 & 39 = right, 65 & 40 = down, 83 & 37 = left, 80 = pause
	var keyMap = {87: false, 38: false, 68: false, 39: false, 65: false, 40: false, 83: false, 37: false, 80: false};
	var asteroids = [];
	var asteroidImg;
	var asteroidNum = 7;
	var paused = false;
	var maxAsteroids = 10;
	
	$(document).keydown(function(e) {
		if (e.keyCode in keyMap) {
			keyMap[e.keyCode] = true;
			if (paused && e.keyCode == 80) {
				paused = false;
			} else if (!paused && e.keyCode == 80){
				paused = true;
			}
		}
	}).keyup(function(e) {
		if (e.keyCode in keyMap) {
			keyMap[e.keyCode] = false;
		}
	});

	var player = {
		x: 50,
		y: 50,
		height: 50,
		width: 50,
		speed: 2,
		rotation: 0,
		img: [],
		lives: 2,
		draw: function() {
			gameArea.drawImg(this.width, this.height, this.x, this.y, this.img[this.lives], this.rotation);
		},
		init: function() {
			this.img.src = "assets/player.png";
		}
	}

	function asteroid(x, y, xSpeed, ySpeed, height, width, collided = false) {
		this.x = x;
		this.y = y;
		this.collided = collided;
		this.height = height;
		this.width = width;
		this.xSpeed = xSpeed;
		this.ySpeed = ySpeed;
		this.draw = function() {
			gameArea.drawImg(this.width, this.height, this.x, this.y, asteroidImg);
		},
		this.move = function() {
			if (this.x < 0 || this.x > gameWidth || this.y < 0 || this.y > gameHeight) {
				this.reset();
			} else {
				this.x += this.xSpeed;
				this.y += this.ySpeed;
			}
		},
		this.reset = function() {
			if (asteroids.length < maxAsteroids) {
				this.x = Math.floor(Math.random() * gameWidth);
				this.y = Math.floor(Math.random() * gameHeight);
				this.xSpeed = Math.floor(Math.random() * 6) - 3;
				this.ySpeed = Math.floor(Math.random() * 6) - 3;
				this.height = 50;
				this.width = 50;
				this.collided = false;
			} else {
				this.die();
			}
		},
		this.split = function() {
			if (!this.collided) {
				asteroids.push(new asteroid(this.x, this.y, this.xSpeed, this.ySpeed, this.height / 2, this.width /2, true));
				this.height /= 2;
				this.width /= 2;
			}
		},
		this.die = function() {
			asteroids.splice(asteroids.indexOf(this),1);
		}
	}

	function initGame() {
		player.init();
		player.img[0] = new Image();
		player.img[0].src = "assets/playerDam2.png"
		player.img[1] = new Image();
		player.img[1].src = "assets/playerDam1.png"
		player.img[2] = new Image();
		player.img[2].src = "assets/player.png"
		asteroidImg = new Image();
		asteroidImg.src = "assets/asteroid.png";
		for (var i = 0; i < asteroidNum; i++) {
			asteroids[i] = new asteroid(Math.floor(Math.random() * gameWidth), Math.floor(Math.random() * gameHeight), Math.floor(Math.random() * 6) - 3, Math.floor(Math.random() * 6) - 3, 50, 50);
		}
		console.log(asteroids);
	}

	function collission(x1,y1,w1,h1,x2,y2,w2,h2) {
		var r1 = w1 + x1;
		var b1 = h1 + y1;
		var r2 = w2 + x2;
		var b2 = h2 + y2;
						
		if (x1 < r2 && r1 > x2 && y1 < b2 && b1 > y2) {
			return true;
		} else {
			return false;
		}
	}

	function checkKeys() {
		//up
		if (keyMap[87] || keyMap[38]) {
			player.y -= player.speed;
		}
		//Right
		if (keyMap[68] || keyMap[39]) {
			player.x += player.speed;
			//player.rotation += 0.1;
		}
		//Left
		if (keyMap[65] || keyMap[40]) {
			player.x -= player.speed;
			//player.rotation -= 0.1;
		}
		//Down
		if (keyMap[83] || keyMap[37]) {
			player.y += player.speed;
		}
	}

	function updateGameArea() {
		gameArea.clear();
		checkKeys();
		player.draw();
		if (asteroids.length > maxAsteroids) {
			asteroids.splice(0,maxAsteroids - asteroids.length);
		}
		for (var i = 0; i < asteroids.length; i++) {
			if (collission(player.x, player.y, player.width, player.height, asteroids[i].x, asteroids[i].y, asteroids[i].width, asteroids[i].height)) {
				if (asteroids[i].collided === false && player.lives > 0) {
					player.lives --;
				}
				asteroids[i].split();
				asteroids[i].collided = true;
			}
			asteroids[i].move();
			asteroids[i].draw();
		}
	}

	gameArea.start();
	initGame();

});