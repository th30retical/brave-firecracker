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
var shotSound = new Audio('sounds/shot.mp3');
var death = new Audio('sounds/death.mp3');
var bgMusic = new Audio('sounds/newMusic.mp3');
var escaped = new Audio('sounds/escaped_v2.mp3');
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
  y: window.innerHeight/2,
  height:32,
  width:32
};

var monster = function(y) {
  this.x = window.innerWidth;
  this.y = y;
  this.speed = 256;
  this.width = monsterImage.width;
  this.height = monsterImage.height;
}
var monsters = [];
var supercreep = [];

var bullet = function(xSpeed, ySpeed) {
  this.x = 0;
  this.y = window.innerHeight/2;
  this.speed = 350;
  this.xSpeed = xSpeed*this.speed;
  this.ySpeed = ySpeed*this.speed;
  this.width = bulletImage.width;
  this.height = bulletImage.height;
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
if (!localStorage.total) {
  localStorage.total = 0;
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
  if (localStorage.total != 0 && localStorage.total%20 == 0) {
    var creep = new monster(y);
    creep.height = 50;
    creep.width = 50;
    creep.health = 10;
    creep.speed = 200;
    supercreep.push(creep);
  } else {
    monsters.push(new monster(y));
  }
  localStorage.total++;
}

var collide = function(monster, bullet) {
	if (monster != undefined && bullet != undefined) {
		return (monster.x < bullet.x + bullet.width &&
monster.x + monster.width > bullet.x &&
monster.y < bullet.y + bullet.height &&
monster.y + monster.height > bullet.y);
	}
	return false;
}

var collide_v2 = function(monster, hero) {
  return (monster.x < hero.width &&
monster.y < hero.y + hero.height &&
monster.y + monster.height > hero.y);
}

var clearScreen =  function(obj, type) {
  ctx.clearRect(obj.x, obj.y, obj.x + obj.width, obj.y + obj.height);
  if (type === 'escaped') {
    localStorage.monstersEscaped++;
    escaped.play();
  } else if (type === 'killed') {
    localStorage.monstersKilled++;
    death.play();
  }
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
        clearScreen(monsters[i], 'escaped');
        monsters.splice(i,1);
      } else if ( collide_v2(monsters[i], hero)) {
        clearScreen(monsters[i], 'killed');
        monsters.splice(i,1);
        localStorage.bulletsFired++;
      } else {
        i++;
      }
    } while ( i < monsters.length );
  }

  if (supercreep.length) {
    supercreep[0].x -= supercreep[0].speed * modifier;
    if ( supercreep[0].x < 0 ) {
      clearScreen(supercreep[0], 'escaped');
      supercreep.pop();
    } else if (collide_v2(supercreep[0], hero)) {
      clearScreen(supercreep[0], 'killed');
      supercreep.pop();
      localStorage.bulletsFired++;
    }
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
        clearScreen(bullets[i], 'bullet');
        bullets.splice(i,1);
      } else {
        i++;
      }
    } while (i < bullets.length);
  }

  if (supercreep.length && bullet.length) {
    i = 0;
    do {
      if (collide(supercreep[0], bullets[i])) {
        if (supercreep[0].health === 0) {

          clearScreen(supercreep[0], 'killed');
          supercreep.pop();
          // localStorage.monstersKilled += 9 isn't working..
          for (var j = 0; j < 9; j++) {
            localStorage.monstersKilled++;
          }
        } else {
          supercreep[0].health--;
        }
        clearScreen(bullets[i], 'bullet');
        bullets.splice(j,1);
      } else {
        i++;
      }
    } while (i < bullets.length && supercreep.length);
  }

  // if there are monsters and bullets on screen
  if (monsters.length && bullets.length) {
    var j = 0;
    var del = false;
    i = 0;
    do {
      do {
        if (collide(monsters[i], bullets[j])) {
          clearScreen(monsters[i], 'killed');
          monsters.splice(i,1);
          clearScreen(bullets[j], 'bullet');
          bullets.splice(j,1);
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
    if (supercreep.length) {
      ctx.drawImage(monsterImage, supercreep[0].x, supercreep[0].y, supercreep[0].width, supercreep[0].height);
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
  if (localStorage.bulletsFired == 0) { acc = 100; }
  else { acc = Math.floor((localStorage.monstersKilled/localStorage.bulletsFired) * 100); }
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
