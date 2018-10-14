<<<<<<< HEAD
$(document).ready(function() {

	const gameArea = {
		canvas : document.createElement("canvas"),
		start : function () {
			//Initiate the game area
			this.canvas.width = gameWidth;
			this.canvas.height = gameHeight;
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
			this.context.font = size + "px Courier New";
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
	var gameHeight = $(window).height() - 20;
	var gameWidth = $(window).width() - 20;
	//87 & 38 = up, 68 & 39 = right, 65 & 40 = down, 83 & 37 = left, 71 = g, 69 = e 80 = pause
	var keyMap = {87: false, 38: false, 68: false, 39: false, 65: false, 40: false, 83: false, 37: false, 71: false, 69:false, 80: false};
	var asteroids = [];
	var bullets = [];
	var asteroidImgs = [];
	var asteroidNum = 7;
	var paused = false;
	var maxAsteroids = 10;
	var maxBullets = 5;
	var playing = false;
	var splashImg;
	
	//Handle keys, keyMap[key] will be true it the button is currently pressed, and false otherwise
	$(document).keydown(function(e) {
		if (e.keyCode in keyMap) {
			keyMap[e.keyCode] = true;
			if (paused && e.keyCode == 80) {
				paused = false;
			} else if (!paused && e.keyCode == 80){
				paused = true;
			}
			if (!playing && e.keyCode == 69 && player.lives > 0) {
				playing = true;
			}
		}
	}).keyup(function(e) {
		if (e.keyCode in keyMap) {
			keyMap[e.keyCode] = false;
			if (player.fired) {
				player.fired = false;
			}
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
		fired: false,
		draw: function() {
			gameArea.drawImg(this.width, this.height, this.x, this.y, this.img[this.lives], this.rotation);
		},
		init: function() {
			this.img.src = "assets/player.png";
		},
		fire: function() {
			if (!this.fired) {
				bullets.push(new bullet(this.x,this.y + (this.height/2),this.rotation));
				this.fired = true;
			}
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
		this.image = Math.floor(Math.random() * 3);
		this.draw = function() {
			gameArea.drawImg(this.width, this.height, this.x, this.y, asteroidImgs[this.image]);
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
			//Make the asteroid come from a random side of the screen
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
						this.x = gameWidth - 1;
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
			//Keep bullet going at the same speed on a diagonal path with maths
			this.x -= this.speed * Math.cos(this.rotation);
			this.y -= this.speed * Math.sin(this.rotation);
			//remove from array if out of bounds
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
		//Grab all sprites required
		player.img[0] = new Image();
		player.img[0].src = "assets/playerDam2.png";
		player.img[1] = new Image();
		player.img[1].src = "assets/playerDam1.png";
		player.img[2] = new Image();
		player.img[2].src = "assets/player.png";
		asteroidImgs[0] = new Image();
		asteroidImgs[0].src = "assets/asteroid.png";
		asteroidImgs[1] = new Image();
		asteroidImgs[1].src = "assets/asteroid1.png";
		asteroidImgs[2] = new Image();
		asteroidImgs[2].src = "assets/asteroid2.png";
		splashImg = new Image();
		splashImg.src = "assets/splash.png";
		//Populate the asteroids array
		for (var i = 0; i < maxAsteroids; i++) {
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

	function randBounds(min, max) {
		return Math.floor(Math.random() * (max + min + 1)) - min;
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
			gameArea.drawText("*", 80 + (10*i), 40);
		}
	}

	function startScreen() {
		gameArea.clear();
		gameArea.drawImg(gameWidth - 20,gameHeight,0, 0, splashImg);
		gameArea.drawText("Press E to play!", gameWidth/2 - 40, (gameHeight/2) + 60);
	}

	function endScreen() {
		gameArea.clear();
		gameArea.drawText("Game Over!", gameWidth/2 - 100, gameHeight/2, 46);
		gameArea.drawText("Score: " + player.score, gameWidth/2 - 50, gameHeight/2 + 40, 24);
	}

	function updateGameArea() {
		if (!playing) {
			//Display the start screen or end screen depending on how many lives the player has
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
			//Move and draw all the bullets
			for (var i = 0; i < bullets.length; i++) {
				bullets[i].move();
				if (bullets[i]) {
					bullets[i].draw();
				}
			}
			for (var i = 0; i < asteroids.length; i++) {
				for (var j = 0; j < bullets.length; j++) {
					//Check collissions between all bullets and all asteroids
					if (collission(bullets[j].x, bullets[j].y, bullets[j].size, bullets[j].size, asteroids[i].x, asteroids[i].y, asteroids[i].width, asteroids[i].height)) {
						player.score++;
						bullets[j].die();
						asteroids[i].split();
					}
				}
				//Check collission between the player and all asteroids
				if (collission(player.x, player.y, player.width, player.height, asteroids[i].x, asteroids[i].y, asteroids[i].width, asteroids[i].height)) {
					if (asteroids[i].collided === false && player.lives > -1) {
						player.lives --;
					}
					asteroids[i].split();
					asteroids[i].collided = true;
				} else if (asteroids[i].collided){
					asteroids[i].collided = false;
				} else if (asteroids[i].height < 10) {
					//If asteroid is too small delete it and skip moving and drawing it
					asteroids[i].die();
					continue;
				}
				asteroids[i].move();
				asteroids[i].draw();
			}
			//End the game if the player has no lives left
			if (player.lives < 0) {
				playing = false;
			}
		}
	}

	gameArea.start();
	initGame();

});
=======
$(document).ready(() => {

  const gameHeight = $(window).height() - 40;
  const gameWidth = $(window).width() - 40;
  const maxAsteroids = 10;
  const maxBullets = 3;
  // 87 & 38 = up, 68 & 39 = right, 65 & 40 = down, 83 & 37 = left, 71 = g, 69 = e 80 = pause
  const keyMap = {
    87: false, 38: false, 68: false, 39: false, 65: false, 40: false, 83: false, 37: false, 71: false, 69: false, 80: false,
  };

  $(document).keydown((e) => {
    if (e.keyCode in keyMap) {
      keyMap[e.keyCode] = true;
      if (gameArea.paused && e.keyCode === 80) {
        gameArea.paused = false;
      } else if (!gameArea.paused && e.keyCode === 80) {
        gameArea.paused = true;
      }
      if (!gameArea.playing && e.keyCode === 69) {
        gameArea.playing = true;
      }
    }
  }).keyup((e) => {
    if (e.keyCode in keyMap) {
      keyMap[e.keyCode] = false;
    }
  });

  class GameArea {
    constructor() {
      this.update = this.update.bind(this);
      this.clear = this.clear.bind(this);
      this.startScreen = this.startScreen.bind(this);
      this.canvas = document.createElement('canvas');
      this.canvas.width = $(window).width() - 40;
      this.canvas.height = $(window).height() - 40;
      this.context = this.canvas.getContext('2d');
      document.body.insertBefore(this.canvas, document.body.childNodes[0]);
      this.interval = setInterval(this.update, 20);

      this.paused = false;
      this.playing = false;

      this.asteroids = [];
      this.bullets = [];

      this.asteroidImg = new Image();
      this.asteroidImg.src = 'assets/asteroid.png';
      this.player = new Player();
      this.splashImg = new Image();
      this.splashImg.src = 'assets/splash.png';
      for (let i = 0; i < maxAsteroids; i++) {
        this.asteroids[i] = new Asteroid(Math.floor(Math.random() * gameWidth), Math.floor(Math.random() * gameHeight), Math.floor(Math.random() * 6) - 3, Math.floor(Math.random() * 6) - 3, 50, 50);
      }
    }

    clear() {
      // Clear the canvas to avoid drawing over the last frame
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.draw(this.canvas.height, this.canvas.width, 0, 0, 'black');
    }

    draw(height, width, x, y, color, rotation) {
      // Draw function with rotation
      this.context.save();
      this.context.fillStyle = color;
      this.context.translate(x, y);
      this.context.rotate(rotation);
      this.context.fillRect(0, 0, width, height);
      this.context.restore();
    }

    drawText(theString, x, y, size) {
      // Draw function for text
      this.context.save();
      this.context.fillStyle = 'white';
      this.context.font = `${size}px Verdana`;
      this.context.fillText(theString, x, y);
      this.context.restore();
    }

    drawImg(width, height, x, y, image, rotation) {
      // Draw an image with the given parameters
      this.context.save();
      if (rotation !== 0) {
        this.context.translate(x + (width / 2), y + (height / 2));
        this.context.rotate(rotation);
        this.context.drawImage(image, -width / 2, -height / 2, width, height);
      } else {
        this.context.drawImage(image, x, y, width, height);
      }
      this.context.restore();
    }

    checkKeys() {
      // up
      if ((keyMap[87] || keyMap[38]) && this.player.x - this.player.speed * Math.cos(this.player.rotation) > 0 && this.player.x - this.player.speed * Math.cos(this.player.rotation) < gameWidth - this.player.width && this.player.y - this.player.speed * Math.sin(this.player.rotation) > 0 && this.player.y - this.player.speed * Math.sin(this.player.rotation) < gameHeight - this.player.height) {
        this.player.x -= this.player.speed * Math.cos(this.player.rotation);
        this.player.y -= this.player.speed * Math.sin(this.player.rotation);
      }
      // Right
      if (keyMap[68] || keyMap[39]) {
        this.player.rotation += 0.1;
      }
      // Left
      if (keyMap[65] || keyMap[40]) {
        this.player.rotation -= 0.1;
      }
      // Down
      if ((keyMap[83] || keyMap[37]) && this.player.x + this.player.speed * Math.cos(this.player.rotation) > 0 && this.player.x + this.player.speed * Math.cos(this.player.rotation) < gameWidth - this.player.width && this.player.y + this.player.speed * Math.sin(this.player.rotation) > 0 && this.player.y + this.player.speed * Math.sin(this.player.rotation) < gameHeight - this.player.height) {
        this.player.x += this.player.speed * Math.cos(this.player.rotation);
        this.player.y += this.player.speed * Math.sin(this.player.rotation);
      }
      // G
      if (keyMap[71] && this.bullets.length < maxBullets) {
        this.player.fire();
      }
    }

    drawHud() {
      gameArea.drawText(`Score: ${this.player.score}`, 10, 20, 15);
      gameArea.drawText('Lives: ', 10, 40, 15);
      for (let i = 0; i < this.player.lives; i++) {
        gameArea.drawText('*', 60 + (10 * i), 40, 15);
      }
    }

    startScreen() {
      gameArea.clear();
      gameArea.drawImg(gameWidth - 20, gameHeight, 0, 0, this.splashImg);
      gameArea.drawText('Press E to play!', gameWidth / 2 - 40, (gameHeight / 2) + 60);
    }

    endScreen() {
      gameArea.clear();
      gameArea.drawText('Game Over!', gameWidth / 2 - 100, gameHeight / 2, 46);
      gameArea.drawText(`Score: ${this.player.score}`, gameWidth / 2 - 50, gameHeight / 2 + 40, 24);
    }

    update() {
      if (!this.playing) {
        if (this.player.lives < 0) {
			    this.endScreen();
        } else {
			    this.startScreen();
        }
      } else {
        this.clear();
        this.checkKeys();
        this.drawHud();
        this.player.draw();
        if (this.asteroids.length > maxAsteroids) {
			    this.asteroids.splice(0, maxAsteroids - this.asteroids.length);
        }
        for (let i = 0; i < this.bullets.length; i++) {
          this.bullets[i].move();
          if (this.bullets[i]) {
            this.bullets[i].draw();
          }
        }
        for (let i = 0; i < this.asteroids.length; i++) {
          for (let j = 0; j < this.bullets.length; j++) {
            if (this.bullets[j].collission(this.asteroids[i])) {
              this.player.score++;
              this.bullets[j].die();
              this.asteroids[i].split();
            }
          }
          if (this.player.collission(this.asteroids[i])) {
            if (this.asteroids[i].collided === false && this.player.lives > -1) {
              this.player.lives--;
            }
            if (this.player.lives < 0) {
              this.playing = false;
              continue;
            }
            this.asteroids[i].split();
            this.asteroids[i].collided = true;
          } else if (this.asteroids[i].collided) {
            this.asteroids[i].collided = false;
          } else if (this.asteroids[i].height < 10) {
            this.asteroids[i].die();
            continue;
          }
          this.asteroids[i].move();
          this.asteroids[i].draw();
        }
      }
	  }
  }

  class GameObject {
    constructor(x, y, width, height, rotation) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.rotation = rotation;
    }

    setPos(x, y) {
      this.x = x;
      this.y = y;
    }

    checkBounds() {
      if (this.x > 0 && (this.x + this.width) < gameWidth && this.y > 0 && (this.y + this.height) < gameHeight) {
        return true;
      } else {
        return false;
      }
    }

    collission(gameObject) {
      // Standard bounding box collission detection
      let r1 = this.width + this.x;
      let b1 = this.height + this.y;
      let r2 = gameObject.width + gameObject.x;
      let b2 = gameObject.height + gameObject.y;

      if (this.x < r2 && r1 > gameObject.x && this.y < b2 && b1 > gameObject.y) {
		    return true;
      }
      return false;
    }
    
    randInBounds(min, max) {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
  }

  class Player extends GameObject {
    constructor() {
      super(gameWidth / 2, gameHeight / 2, 50, 50, 0);
      this.score = 0;
      this.speed = 4;
      this.maxSpeed = 3;
      this.img = [];
      this.lives = 2;
      this.img[0] = new Image();
      this.img[0].src = 'assets/playerDam2.png';
      this.img[1] = new Image();
      this.img[1].src = 'assets/playerDam1.png';
      this.img[2] = new Image();
      this.img[2].src = 'assets/player.png';
    }

    draw() {
      gameArea.drawImg(this.width, this.height, this.x, this.y, this.img[this.lives], this.rotation);
    }

    fire() {
      gameArea.bullets.push(new Bullet(this.x, this.y + (this.height / 2), this.rotation));
    }
  }

  class Asteroid extends GameObject {
    constructor(x, y, xSpeed, ySpeed, height, width, collided = false) {
      super(x, y, width, height, 0);
      this.collided = collided;
      this.xSpeed = xSpeed;
      this.ySpeed = ySpeed;
      this.maxSpeed = 3
    }

    draw() {
      gameArea.drawImg(this.width, this.height, this.x, this.y, gameArea.asteroidImg, this.rotation);
    }

    move() {
      if (this.x < 0 || this.x > gameWidth || this.y < 0 || this.y > gameHeight) {
        this.reset();
      } else if (this.xSpeed === 0 && this.ySpeed === 0) {
        this.setSpeed(this.randInBounds(-3, 3), this.randInBounds(-3, 3));
      } else {
        this.x += this.xSpeed;
        this.y += this.ySpeed;
      }
    }

    setVector(x, y, xSpeed, ySpeed) {
      this.setPos(x, y);
      this.setSpeed(xSpeed, ySpeed);
    }

    setSpeed(xSpeed, ySpeed) {
      this.xSpeed = xSpeed;
      this.ySpeed = ySpeed;
    }

    reset() {
      if (gameArea.asteroids.length < maxAsteroids) {
        switch (this.randInBounds(1, 3)) {
          case 0:
            this.setPos(1, this.randInBounds(0, gameHeight));
            this.setSpeed(this.randInBounds(0, this.maxSpeed), this.randInBounds(-this.maxSpeed, this.maxSpeed));
            break;
          case 1:
            this.setPos(this.randInBounds(0, gameWidth), gameHeight - 1);
            this.setSpeed(this.randInBounds(-this.maxSpeed, this.maxSpeed), this.randInBounds(0, this.maxSpeed));
            break;
          case 2:
            this.setPos(gameWidth - 1, Math.floor(Math.random() * gameHeight));
            this.setSpeed(Math.floor(Math.random() * 3) - 3, Math.floor(Math.random() * 6) - 3);
            break;
          case 3:
            this.setPos(Math.floor(Math.random() * gameWidth), 1);
            this.setSpeed(Math.floor(Math.random() * 6) - 3, Math.floor(Math.random() * 6) - 3);
            break;
        }
        this.height = 50;
        this.width = 50;
        this.collided = false;
      } else {
        this.die();
      }
    }

    split() {
      if (!this.collided) {
        gameArea.asteroids.push(new Asteroid(this.x, this.y, -this.xSpeed, -this.ySpeed, this.height / 2, this.width / 2, true));
        this.height /= 2;
        this.width /= 2;
      }
    }

    die() {
      gameArea.asteroids.splice(gameArea.asteroids.indexOf(this), 1);
    }
  }

  class Bullet extends GameObject {
    constructor(x, y, rotation) {
      // Add an amount to x and y so the bullet doesn't hit the shooter
      super(x + (Math.cos(rotation)), y + (Math.sin(rotation)), 5, 5, rotation);
      this.speed = 6;
    }

    move() {
      // Keep bullet going at the same speed on a diagonal path
      this.x -= this.speed * Math.cos(this.rotation);
      this.y -= this.speed * Math.sin(this.rotation);
      if (this.x > gameWidth || this.x < 0 || this.y > gameHeight || this.y < 0) {
        this.die();
      }
    }

    draw() {
      gameArea.draw(this.height, this.width, this.x, this.y, 'red', this.rotation);
    }

    die() {
      // Remove from bullets array
      gameArea.bullets.splice(gameArea.bullets.indexOf(this), 1);
    }
  }

  let gameArea = new GameArea();

});
>>>>>>> dev
