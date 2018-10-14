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
