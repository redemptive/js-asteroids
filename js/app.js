$(document).ready(function() {

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
			this.context.fillStyle = "white";
			this.context.font = size + "px Verdana";
			this.context.fillText(theString, x, y);
			this.context.restore();
		},
		drawImg : function (width, height, x, y, image, rotation = 0) {
			//Draw an image with the given parameters
			this.context.save();
			if (rotation !== 0) {
				this.context.translate(x +(width/2),y +(height/2));
				this.context.rotate(rotation);
				this.context.drawImage(image, -width/2, -height/2, width, height);
			} else {
				this.context.drawImage(image, x, y, width, height);
			}
			this.context.restore();
		}
	};
	var gameHeight = 700;
	var gameWidth = 700;
	//87 & 38 = up, 68 & 39 = right, 65 & 40 = down, 83 & 37 = left, 71 = g, 69 = e 80 = pause
	var keyMap = {87: false, 38: false, 68: false, 39: false, 65: false, 40: false, 83: false, 37: false, 71: false, 69:false, 80: false};
	var asteroids = [];
	var bullets = [];
	var asteroidImg;
	var asteroidNum = 7;
	var paused = false;
	var maxAsteroids = 10;
	var maxBullets = 3;
	var playing = false;
	var splashImg;
	
	$(document).keydown(function(e) {
		if (e.keyCode in keyMap) {
			keyMap[e.keyCode] = true;
			if (paused && e.keyCode == 80) {
				paused = false;
			} else if (!paused && e.keyCode == 80){
				paused = true;
			}
			if (!playing && e.keyCode == 69) {
				playing = true;
			}
		}
	}).keyup(function(e) {
		if (e.keyCode in keyMap) {
			keyMap[e.keyCode] = false;
		}
	});

	var player = {
		x: gameWidth / 2,
		y: gameHeight / 2,
		height: 50,
		width: 50,
		score: 0,
		speed: 4,
		maxSpeed: 3,
		rotation: 0,
		img: [],
		lives: 2,
		draw: function() {
			gameArea.drawImg(this.width, this.height, this.x, this.y, this.img[this.lives], this.rotation);
		},
		init: function() {
			this.img.src = "assets/player.png";
		},
		fire: function() {
			bullets.push(new bullet(this.x,this.y + (this.height/2),this.rotation));
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
			} else if (this.xSpeed === 0 && this.ySpeed === 0){
				this.xSpeed = Math.floor(Math.random() * 6) - 3;
				this.ySpeed = Math.floor(Math.random() * 6) - 3;
			} else {
				this.x += this.xSpeed;
				this.y += this.ySpeed;
			}
		},
		this.reset = function() {
			if (asteroids.length < maxAsteroids) {
				switch (Math.floor(Math.random() * 4)) {
					case 0:
						this.x = 1;
						this.y = Math.floor(Math.random() * gameHeight);
						this.xSpeed = Math.floor(Math.random() * 3);
						this.ySpeed = Math.floor(Math.random() * 6) - 3;
						break;
					case 1:
						this.x = Math.floor(Math.random() * gameWidth);
						this.y = gameHeight - 1;
						this.xSpeed = Math.floor(Math.random() * 6) - 3;
						this.ySpeed = Math.floor(Math.random() * 3);
						break;
					case 2:
						this.x = gameHeight - 1;
						this.y = Math.floor(Math.random() * gameHeight);
						this.xSpeed = Math.floor(Math.random() * 3) - 3;
						this.ySpeed = Math.floor(Math.random() * 6) - 3;
						break;
					case 3:
						this.x = Math.floor(Math.random() * gameWidth);
						this.y = 1;
						this.xSpeed = Math.floor(Math.random() * 6) - 3;
						this.ySpeed = Math.floor(Math.random() * 6) - 3;
						break;
				}
				this.height = 50;
				this.width = 50;
				this.collided = false;
			} else {
				this.die();
			}
		},
		this.split = function() {
			if (!this.collided) {
				asteroids.push(new asteroid(this.x, this.y, -this.xSpeed, -this.ySpeed, this.height / 2, this.width /2, true));
				this.height /= 2;
				this.width /= 2;
			}
		},
		this.die = function() {
			asteroids.splice(asteroids.indexOf(this),1);
		}
	}

	function bullet(x, y, rotation) {
		//Add an amount to x and y so the bullet doesn't hit the shooter
		this.x = x + (Math.cos(rotation));
		this.y = y + (Math.sin(rotation));
		this.size = 5;
		this.speed = 6;
		this.rotation = rotation;
		
		this.move = function() {
			//Keep bullet going at the same speed on a diagonal path
			this.x -= this.speed * Math.cos(this.rotation);
			this.y -= this.speed * Math.sin(this.rotation);
			if (this.x > gameWidth || this.x < 0 || this.y > gameHeight || this.y < 0) {
				this.die();
			}
		},
		this.draw = function() {
			gameArea.draw(this.size,this.size,this.x,this.y,"red",this.rotation);
		},
		this.die = function() {
			//Remove from bullets array
			bullets.splice(bullets.indexOf(this),1);
		}
	}

	function initGame() {
		player.init();
		player.img[0] = new Image();
		player.img[0].src = "assets/playerDam2.png";
		player.img[1] = new Image();
		player.img[1].src = "assets/playerDam1.png";
		player.img[2] = new Image();
		player.img[2].src = "assets/player.png";
		asteroidImg = new Image();
		asteroidImg.src = "assets/asteroid.png";
		splashImg = new Image();
		splashImg.src = "assets/splash.png";
		for (var i = 0; i < asteroidNum; i++) {
			asteroids[i] = new asteroid(Math.floor(Math.random() * gameWidth), Math.floor(Math.random() * gameHeight), Math.floor(Math.random() * 6) - 3, Math.floor(Math.random() * 6) - 3, 50, 50);
		}
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
		if ((keyMap[87] || keyMap[38]) && player.x - player.speed * Math.cos(player.rotation) > 0 && player.x - player.speed * Math.cos(player.rotation) < gameWidth - player.width && player.y - player.speed * Math.sin(player.rotation) > 0 && player.y - player.speed * Math.sin(player.rotation) < gameHeight - player.height) {
			player.x -= player.speed * Math.cos(player.rotation);
			player.y -= player.speed * Math.sin(player.rotation);
		}
		//Right
		if (keyMap[68] || keyMap[39]) {
			player.rotation += 0.1;
		}
		//Left
		if (keyMap[65] || keyMap[40]) {
			player.rotation -= 0.1;
		}
		//Down
		if ((keyMap[83] || keyMap[37]) && player.x + player.speed * Math.cos(player.rotation) > 0 && player.x + player.speed * Math.cos(player.rotation) < gameWidth - player.width && player.y + player.speed * Math.sin(player.rotation) > 0 && player.y + player.speed * Math.sin(player.rotation) < gameHeight - player.height) {
			player.x += player.speed * Math.cos(player.rotation);
			player.y += player.speed * Math.sin(player.rotation);
		}
		//G
		if (keyMap[71] && bullets.length < maxBullets) {
			player.fire();
		}
	}

	function drawHud() {
		gameArea.drawText("Score: " + player.score, 10, 20);
		gameArea.drawText("Lives: ", 10, 40);
		for (var i = 0; i < player.lives; i++) {
			gameArea.drawText("*", 60 + (10*i), 40);
		}
	}

	function startScreen() {
		gameArea.clear();
		gameArea.drawImg(gameWidth - 20,gameHeight,0, 0, splashImg);
		gameArea.drawText("Press E to play!", gameWidth/2, (gameHeight/2) + 20);
	}

	function endScreen() {
		gameArea.clear();
		gameArea.drawText("Game Over!", gameWidth/2 - 100, gameHeight/2, 46);
		gameArea.drawText("Score: " + player.score, gameWidth/2 - 50, gameHeight/2 + 40, 24);
	}

	function updateGameArea() {
		if (!playing) {
			if (player.lives < 0) {
				endScreen();
			} else {
				startScreen();
			}
		} else {
			gameArea.clear();
			checkKeys();
			drawHud();
			player.draw();
			if (asteroids.length > maxAsteroids) {
				asteroids.splice(0,maxAsteroids - asteroids.length);
			}
			for (var i = 0; i < bullets.length; i++) {
				bullets[i].move();
				if (bullets[i]) {
					bullets[i].draw();
				}
			}
			for (var i = 0; i < asteroids.length; i++) {
				for (var j = 0; j < bullets.length; j++) {
					if (collission(bullets[j].x, bullets[j].y, bullets[j].size, bullets[j].size, asteroids[i].x, asteroids[i].y, asteroids[i].width, asteroids[i].height)) {
						player.score++;
						bullets[j].die();
						asteroids[i].split();
					}
				}
				if (collission(player.x, player.y, player.width, player.height, asteroids[i].x, asteroids[i].y, asteroids[i].width, asteroids[i].height)) {
					if (asteroids[i].collided === false && player.lives > -1) {
						player.lives --;
					}
					asteroids[i].split();
					asteroids[i].collided = true;
				} else if (asteroids[i].collided){
					asteroids[i].collided = false;
				} else if (asteroids[i].height < 10) {
					asteroids[i].die();
					continue;
				}
				asteroids[i].move();
				asteroids[i].draw();
			}
			if (player.lives < 0) {
				playing = false;
			}
		}
	}

	gameArea.start();
	initGame();

});