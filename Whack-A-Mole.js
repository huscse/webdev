//Get HTML elements
const grid = document.getElementById("grid");
const scoreBoard = document.getElementById("score");
const timeLeftBoard = document.getElementById("timer");

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const restartBtn = document.getElementById("restartBtn");
const hammer = document.getElementById("hammer");
const gameGrid = document.getElementById("grid");
const countdown = document.getElementById("countdown-message");

//Load sounds
const hitSound = new Audio('hit.wav');
const missSound = new Audio('miss.mp3');
const startSound = new Audio('start.mp3');
const endSound = new Audio('end.mp3');
const countdownSound = new Audio('count.mp3');
const uiSound = new Audio('click.mp3');
const bgMusic = new Audio('gamebg.mp3');
bgMusic.loop = true;
bgMusic.volume = 0.2;

//Game state variables
let score = 0;
let timeLeft = 60;
let gameInterval = null, moleInterval = null;
let mole, currentHole;
let isPaused = false;
let speedFactor = 1.0;
let moleIsActive = false;

//Create 3x4 hole grid
function createGrid() {
  for (let r = 1; r <= 3; r++) {
    for (let c = 1; c <= 4; c++) {
      const hole = document.createElement("div");
      hole.classList.add("hole");
      hole.id = `h${c}r${r}`;

      const inner = document.createElement("div");
      inner.classList.add("hole-inner");

      hole.appendChild(inner);
      grid.appendChild(hole);
    }
  }
}

//Create mole image and attach hit event
function createMole() {
  mole = document.createElement("img");
  mole.src = "prof-gross-draft1.png";
  mole.id = "mole";
  mole.classList.add("mole-down");
  mole.addEventListener("click", hitMole);
}

//Called when mole is clicked
function hitMole(e) {
  if (mole.classList.contains("mole-up")) {
    hammer.classList.add("hit");
    setTimeout(() => hammer.classList.remove("hit"), 100);

    const elapsed = Date.now() - mole.popStart;
    let bonus = 0;
    let message = "";

    if (elapsed < 750) {
      bonus = 10;
      message = "+10 (Quick hammer hit!)";
    } else {
      bonus = 5;
      message = "+5 (Normal hit)";
    }

    hitSound.currentTime = 0;
    hitSound.play();

    score += bonus;
    showPopup(message, mole.closest(".hole"), true);
    mole.classList.remove("mole-up");
    mole.classList.add("mole-down");
    updateScore();
  }
  e.stopPropagation();
}

//Update score display
function updateScore() {
  scoreBoard.textContent = score;
}

//Update time display
function updateTime() {
  timeLeftBoard.textContent = timeLeft;
}

//Schedule next mole popup
function scheduleNextMole(){
  if (timeLeft <= 0 || isPaused) return;
  const randomDelay = 500 + Math.random() * 1500;
  moleInterval = setTimeout(() => {
    popUpMole();
    scheduleNextMole();
  }, randomDelay);
}

//Start a new game
function startGame() {
  clearInterval(gameInterval);
  clearInterval(moleInterval);
  gameInterval = null;
  moleInterval = null;

  score = 0;
  timeLeft = 60;
  isPaused = false;
  speedFactor = 1.0;
  pauseBtn.textContent = "Pause";
  startBtn.textContent = "Start"; //Reset label to "Start"
  updateScore();
  updateTime();

  if (mole.parentNode) mole.parentNode.removeChild(mole);

  showCountdown(() => {
    scheduleNextMole();

    //Speed up mole every 12 seconds
    setInterval(() =>{
      speedFactor += 0.1;
    }, 12000);

    gameInterval = setInterval(() => {
      timeLeft--;
      updateTime();
      if (timeLeft <= 0) {
        clearInterval(gameInterval);
        clearInterval(moleInterval);
        gameInterval = null;
        moleInterval = null;
        endSound.currentTime = 0;
        endSound.play();

        setTimeout(() => {
          alert("Game Over!");
          startBtn.textContent = "Play Again"; // Change label after game over
        }, 500);
      }
    }, 1000);
  });
}

//Make a mole appear in a random hole
function popUpMole() {
  if (isPaused || moleIsActive){
    return;
  }

  moleIsActive = true;

  const holes = document.querySelectorAll(".hole");
  const index = Math.floor(Math.random() * holes.length);
  const hole = holes[index];

  if (hole === currentHole){
    moleIsActive = false;
    return;
  }

  currentHole = hole;
  const inner = hole.querySelector(".hole-inner");
  if (mole.parentNode){
    mole.parentNode.removeChild(mole);
  }
  inner.appendChild(mole);

  setTimeout(() => {
    mole.classList.add("mole-up");
    mole.classList.remove("mole-down");
    mole.popStart = Date.now();

    const visibleTime = Math.max(300, 1000 / speedFactor);
    setTimeout(() => {
      mole.classList.remove("mole-up");
      mole.classList.add("mole-down");
      moleIsActive = false;
    }, visibleTime);
  }, 100);
}

//Toggle pause/resume
function pauseGame() {
  isPaused = !isPaused;
  pauseBtn.textContent = isPaused ? "Resume" : "Pause";
  if (isPaused){
    pauseTimers();
  }else{
    resumeTimers();
  }
}
//Stop timers when paused
function pauseTimers(){
  clearInterval(gameInterval);
  clearTimeout(moleInterval);
  gameInterval = null;
  moleInterval = null;
}
//Resume timers after pause
function resumeTimers(){
  scheduleNextMole();

  gameInterval = setInterval(() =>{
    timeLeft--;
    updateTime();

    if (timeLeft <= 0){
      pauseTimers();
      endSound.currentTime = 0;
      endSound.play();
      
      setTimeout(() =>{
        alert("Game Over!");
        startBtn.textContent = "Play Again";
      }, 500);
    }
  }, 1000);
}

//Show countdown before game starts
function showCountdown(callback) {
  countdownSound.currentTime = 0;
  countdownSound.play();

  countdown.textContent = "3";

  setTimeout(() => {
    countdown.textContent = "2";
  }, 1000);

  setTimeout(() => {
    countdown.textContent = "1";
  }, 2000);

  setTimeout(() => {
    countdown.textContent = "Go!";
    startSound.currentTime = 0;
    startSound.play();
    callback();
  }, 3000);

  setTimeout(() => {
    countdown.textContent = "";
  }, 3500);
}

//Show +10, -5 popup text
function showPopup(text, hole, isPositive = true) {
  const popup = document.createElement("div");
  popup.textContent = text;
  popup.className = "score-popup";
  popup.style.color = isPositive ? "limegreen" : "crimson";
  popup.style.fontWeight = "bold";
  popup.style.fontSize = "20px";
  popup.style.left = "50%";
  popup.style.top = "0";
  popup.style.transform = "translate(-50%, -100%)";
  popup.style.pointerEvents = "none";
  hole.appendChild(popup);

  setTimeout(() => {
    popup.remove();
  }, 1000);
}

//Button event handlers
startBtn.addEventListener("click", () => {
  uiSound.currentTime = 0;
  uiSound.play();
  startGame();
});

pauseBtn.addEventListener("click", () => {
  uiSound.currentTime = 0;
  uiSound.play();
  pauseGame();
});

restartBtn.addEventListener("click", () => {
  restartGame();
});

//For restart the game
function restartGame() {
  uiSound.currentTime = 0;
  uiSound.play();
  startGame();
}

//Miss click
grid.addEventListener("click", (e) => {
  if (e.target.classList.contains("hole-inner")) {
    missSound.currentTime = 0;
    missSound.play();

    score -= 5;
    showPopup("-5 (Miss!)", e.target.parentNode, false);
    updateScore();
  }
});

//Hammer movement
gameGrid.addEventListener("mouseenter", () => {
  hammer.style.display = "block";
});

gameGrid.addEventListener("mouseleave", () => {
  hammer.style.display = "none";
});

gameGrid.addEventListener("mousemove", (e) => {
  hammer.style.left = e.pageX + "px";
  hammer.style.top = e.pageY + "px";
});

//Initialize
createGrid();
createMole();
bgMusic.play();
