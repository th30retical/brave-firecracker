// initialize the canvas and put it on the screen
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.setAttribute('id','background');
document.body.appendChild(canvas);

// init img variables
var bgReady = false;
var bgImage = new Image();
var heroReady = false;
var heroImage = new Image();
var monsterReady = false;
var monsterImage = new Image();
var bulletReady = false;
var bulletImage = new Image();

// initialize images here
bgImage.onload = function() {
  bgReady = true;
}
bgImage.src = 'images/background.png';

heroImage.onload = function() {
  heroReady = true;
}
heroImage.src = 'images/hero.png';

monsterImage.onload = function() {
  monsterReady = true;
}
monsterImage.src = 'images/monster.png';

bulletImage.onload = function() {
  bulletReady = true;
}
bulletImage.src = 'images/bullet.png';


// INITIALIZE HERO, MONSTER, AND BULLET GAME OBJECTS
var hero = {
  x: 0,
  y: window.innerHeight/2
};

var monster = function(y) {
  this.x = window.innerWidth;
  this.y = y;
  this.speed = 256;
}
// change this to local storage after
var monstersDead = 0, monstersPassed = 0;
var monsters = [];

var bullet = function(xSpeed, ySpeed) {
  this.x = 0;
  this.y = window.innerHeight/2;
  this.speed = 300;
  this.xSpeed = xSpeed*this.speed;
  this.ySpeed = ySpeed*this.speed;
}
var bullets = [];

var fire = function(x, y) {
  if (bulletReady) {
    var dir = Math.atan((y - (window.innerHeight/2))/x);
    bullets.push(new bullet(Math.cos(dir), Math.sin(dir)));
  }
}

// INPUT CONTROLS
addEventListener("click", function(e) {
  fire(e.clientX, e.clientY);
  console.log('boom');
});


// SPAWN NIGGAS
var spawn = function() {
  var y = Math.random() * (window.innerHeight - monsterImage.height);
  monsters.push(new monster(y));
}

var update = function(modifier) {
  var i;
  if (monsters.length) {
    for (i = 0; i < monsters.length; i++) {
      monsters[i].x -= monsters[i].speed * modifier;
    }
    i = 0;
    do {
      if ( monsters[i].x < 0 ) {
        ctx.clearRect(monsters[i].x, monsters[i].y, monsters[i].x + monsterImage.width, monsters[i].y + monsterImage.height);
        monsters.splice(i,1);
      } else {
        i++;
      }
    } while ( i < monsters.length );
  }

  if (bullets.length) {
    for (var i = 0; i < bullets.length; i++) {
      bullets[i].x += bullets[i].xSpeed * modifier;
      bullets[i].y += bullets[i].ySpeed * modifier;
    }
    i = 0;
    do {
      // impossible to shoot a bullet backwards
      if (bullets[i].x > window.innerWidth || bullets[i].y < 0 || bullets[i].y > window.innerHeight) {
        // clear bullet from screen
        ctx.clearRect(bullets[i].x, bullets[i].y, bullets[i].x + bulletImage.width, bullets[i].y + bulletImage.height);
        bullets.splice(i,1);
      } else {
        i++;
      }
    } while (i < bullets.length);
  }
}

var render = function() {
  if (bgReady) {
    ctx.drawImage(bgImage, 0, 0, window.innerWidth, window.innerHeight);
  }

  if (heroReady) {
    ctx.drawImage(heroImage, hero.x, hero.y);
  }

  if (monsterReady) {
    if (monsters.length) {
      for (var i = 0; i < monsters.length; i++) {
        ctx.drawImage(monsterImage, monsters[i].x, monsters[i].y);
      }
    }
  }

  if (bulletReady) {
    if (bullets.length) {
      for (var i = 0; i < bullets.length; i++) {
        ctx.drawImage(bulletImage, bullets[i].x, bullets[i].y);
      }
    }
  }
}

var main = function() {
  var now = Date.now();
  var delta = now - then;

  update(delta / 1000);
  render();

  then = now;

  requestAnimationFrame(main);
}

var w = window;
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

var then = Date.now();
// reset();
main();
window.setInterval(spawn, 3000);

//change canvas size on screen resize
window.addEventListener('resize', function() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
})
