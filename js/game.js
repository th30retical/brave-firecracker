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

//init sounds
var shotSound = new Audio ('sounds/shot.mp3');
var death = new Audio('sounds/death.mp3');
var bgMusic = new Audio('sounds/newMusic.mp3');
bgMusic.play();

// initialize images here
bgImage.onload = function() {
  bgReady = true;
}
bgImage.src = 'images/background.png';

heroImage.onload = function() {
  heroReady = true;
}
heroImage.src = 'images/hero.png';
heroImage.setAttribute("height","200px");

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
var monsters = [];

var bullet = function(xSpeed, ySpeed) {
  this.x = 0;
  this.y = window.innerHeight/2;
  this.speed = 350;
  this.xSpeed = xSpeed*this.speed;
  this.ySpeed = ySpeed*this.speed;
}
var bullets = [];


// initialize local storage variables if needed
if (!localStorage.monstersKilled) {
  localStorage.monstersKilled = 0;
}
if (!localStorage.monstersEscaped) {
  localStorage.monstersEscaped = 0;
}
if (!localStorage.bulletsFired) {
  localStorage.bulletsFired = 0;
}

var fire = function(x, y) {
  if (bulletReady) {
    var dir = Math.atan((y - (window.innerHeight/2))/x);
    bullets.push(new bullet(Math.cos(dir), Math.sin(dir)));
    localStorage.bulletsFired++;
	  shotSound.play();
  }
}


// SPAWN NIGGAS
var spawn = function() {
  var y = Math.random() * (window.innerHeight - monsterImage.height);
  monsters.push(new monster(y));
}

var collide = function(monster, bullet) {
	if (monster != undefined && bullet != undefined) {
		return (monster.x < bullet.x + bulletImage.width &&
monster.x + monsterImage.width > bullet.x &&
monster.y < bullet.y + bulletImage.height &&
monster.y + monsterImage.height > bullet.y);
	}
	return false;
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
        localStorage.monstersEscaped++;
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
      if ((bullets[i].x + bulletImage.width) > window.innerWidth || bullets[i].y < 0 || (bullets[i].y + bulletImage.height) > window.innerHeight) {
        // clear bullet from screen
        ctx.clearRect(bullets[i].x, bullets[i].y, bullets[i].x + bulletImage.width, bullets[i].y + bulletImage.height);
        bullets.splice(i,1);
      } else {
        i++;
      }
    } while (i < bullets.length);
  }

  // if there are monsters and bullets on screen
  if (monsters.length && bullets.length) {
    var j = 0;
    var del = false;
    i = 0;
    do {
      do {
        if (collide(monsters[i], bullets[j])) {
          ctx.clearRect(monsters[i].x, monsters[i].y, monsters[i].x + monsterImage.width, monsters[i].y + monsterImage.height);
          monsters.splice(i,1);
          death.play();
          ctx.clearRect(bullets[j].x, bullets[j].y, bullets[j].x + bulletImage.width, bullets[j].y + bulletImage.height);
          bullets.splice(j,1);
          localStorage.monstersKilled++;
          del = true;
        } else {
          j++;
        }
      } while (j < bullets.length);
      if (!del) {
        i++;
      }
      del = false;
    } while (i < monsters.length);
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

  // Score stuff
	ctx.fillStyle = "rgb(250, 250, 250)";
	ctx.font = "20px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("Goblins dead: " + localStorage.monstersKilled, 0, 0);
  ctx.fillText("Goblins escaped: " + localStorage.monstersEscaped, 0, 30);
  var acc;
  if (localStorage.bulletsFired == 0) {
    acc = 100;
  } else {
    acc = Math.floor((localStorage.monstersKilled/localStorage.bulletsFired) * 100);
  }
  ctx.fillText("Accuracy: " + acc + "%", 0, 60);
}

var main = function() {
  var now = Date.now();
  var delta = now - then;
  if (bgMusic.ended) { bgMusic.play(); }

  update(delta / 1000);
  render();

  then = now;

  requestAnimationFrame(main);
}

var w = window;
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

var then = Date.now();

main();
window.setInterval(spawn, 3000);

//change canvas size on screen resize
window.addEventListener('resize', function() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  hero.y = window.innerHeight/2;
})

// INPUT CONTROLS
addEventListener("click", function(e) {
  fire(e.clientX, e.clientY);
  console.log('boom');
});
