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
// find bullet image first
// bulletImage.src = '#';


// GET HERO AND MONSTER IMAGES HERE

// INITIALIZE HERO AND MONSTER GAME OBJECTS


var render = function() {
  if (bgReady) {
    ctx.drawImage(bgImage, 0, 0, window.innerWidth, window.innerHeight);
  }
}

var main = function() {
  var now = Date.now();
  var delta = now - then;

  // update();
  render();

  then = now;

  requestAnimationFrame(main);
}

var w = window;
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

var then = Date.now();
// reset();
main();


//change canvas size on screen resize
window.addEventListener('resize', function() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
})
