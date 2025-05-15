// Get HTML elements
const grid = document.getElementById('grid');
const scoreBoard = document.getElementById('score');
const timeLeftBoard = document.getElementById('timer');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const restartBtn = document.getElementById('restartBtn');
const hammer = document.getElementById('hammer');
const gameGrid = document.getElementById('grid');
const countdown = document.getElementById('countdown-message');

// Load sound
const hitSound = new Audio('hit.wav');
const missSound = new Audio('miss.mp3');
const startSound = new Audio('start.mp3');
const endSound = new Audio('end.mp3');
const countdownSound = new Audio('count.mp3');
const uiSound = new Audio('click.mp3');
const bgMusic = new Audio('gamebg.mp3');
bgMusic.loop = true;
bgMusic.volume = 0.2;

// Game state variables
let score = 0;
let highScore = sessionStorage.getItem('highScore') || 0; // Load high score from session
// Set initial high score display
document.getElementById('highscore').textContent = highScore;
let timeLeft = 60;
let gameInterval = null,
  moleInterval = null;
let currentHole;
let isPaused = false;
let speedFactor = 1.0;
const MAX_SPEED_FACTOR = 2.5; // Increased max speed factor
let moleIsActive = false;
let isGameRunning = false;
let speedUpInterval = null;
let isInCountdown = false;

// Generate a 3x4 grid of holes with doors and hidden professors
function createGrid() {
  const positions = [
    { top: 25, left: 20 },
    { top: 25, left: 160 },
    { top: 25, left: 300 },
    { top: 25, left: 440 },

    { top: 145, left: 20 },
    { top: 145, left: 160 },
    { top: 145, left: 300 },
    { top: 145, left: 440 },

    { top: 265, left: 20 },
    { top: 265, left: 160 },
    { top: 265, left: 300 },
    { top: 265, left: 440 },
  ];

  positions.forEach((pos) => {
    const hole = document.createElement('div');
    hole.classList.add('hole');
    hole.style.top = pos.top + 'px';
    hole.style.left = pos.left + 'px';

    const inner = document.createElement('div');
    inner.classList.add('hole-inner');

    const door = document.createElement('img');
    door.src = 'door_close_pix.png';
    door.classList.add('door');

    const professor = document.createElement('img');
    professor.src = 'prof-gross-draft1.png';
    professor.classList.add('professor');
    professor.style.display = 'none';

    // When professor is clicked, award points
    professor.addEventListener('click', (e) => {
      if (!isGameRunning || isPaused) return;

      hammer.classList.add('hit');
      setTimeout(() => hammer.classList.remove('hit'), 100);

      hitSound.currentTime = 0;
      hitSound.play();

      score += 5;
      updateScore();
      showPopup('+5 (Hit!)', hole, true);

      professor.style.display = 'none';
      e.stopPropagation();
    });

    inner.appendChild(door);
    inner.appendChild(professor);
    hole.appendChild(inner);
    grid.appendChild(hole);
  });
}

// Update score display and save high score
function updateScore() {
  scoreBoard.textContent = score;
  if (score > highScore) {
    highScore = score;
    sessionStorage.setItem('highScore', highScore);
    document.getElementById('highscore').textContent = highScore;
  }
}

// Update countdown timer on screen
function updateTime() {
  timeLeftBoard.textContent = timeLeft;
}

let animationInProgress = false; // Prevents overlapping animations

// Main mole appearance logic with door opening and professor popping out
function popUpMole() {
  if (isPaused || moleIsActive || !isGameRunning || animationInProgress) return;

  animationInProgress = true;
  moleIsActive = true;

  const holes = document.querySelectorAll('.hole');
  const index = Math.floor(Math.random() * holes.length);
  const hole = holes[index];

  if (hole === currentHole) {
    moleIsActive = false;
    animationInProgress = false;
    return;
  }

  currentHole = hole;
  const inner = hole.querySelector('.hole-inner');
  const door = inner.querySelector('.door');
  const professor = inner.querySelector('.professor');

  door.src = 'door_close_pix.png';
  professor.style.display = 'none';

  setTimeout(() => {
    door.src = 'opening_gif.gif';

    setTimeout(() => {
      door.src = 'door_open_pix.png';
      professor.style.display = 'block';

      // Calculate visible time based on speed factor - adjusted for faster gameplay
      // More aggressive decrease but with reasonable minimum
      const visibleTime = Math.max(500, 1200 - speedFactor * 350);

      setTimeout(() => {
        professor.style.display = 'none';
        door.src = 'closing_gif.gif';

        setTimeout(() => {
          door.src = 'door_close_pix.png';
          moleIsActive = false;
          animationInProgress = false;
        }, 400);
      }, visibleTime);
    }, 400);
  }, 100);
}

// Schedule the next mole to pop up
function scheduleNextMole() {
  if (timeLeft <= 0 || isPaused) return;
  clearTimeout(moleInterval);

  // Adjusted delay calculation for faster gameplay
  const minDelay = 600; // Decreased from 800
  const maxDelay = 1600; // Decreased from 1800
  const speedAdjustedRange = maxDelay - minDelay;
  const randomFactor = Math.random() * speedAdjustedRange;
  const delay = Math.max(minDelay, maxDelay - speedFactor * 350 + randomFactor);

  moleInterval = setTimeout(() => {
    popUpMole();
    scheduleNextMole();
  }, delay);
}

// Starts the game and handles all initial and timers
function startGame() {
  if (isInCountdown || isGameRunning) return;
  clearAllTimers();
  score = 0;
  timeLeft = 60;
  isPaused = false;
  speedFactor = 1.0;
  pauseBtn.textContent = 'Pause';
  startBtn.textContent = 'Start';
  updateScore();
  updateTime();
  isInCountdown = true;
  showCountdown(() => {
    isInCountdown = false;
    isGameRunning = true;
    scheduleNextMole();

    // Speed increases more frequently and by a larger amount
    speedUpInterval = setInterval(() => {
      if (speedFactor < MAX_SPEED_FACTOR) {
        speedFactor += 0.15; // Increased from 0.1
      }
    }, 10000); // Decreased from 15000 to 10000

    gameInterval = setInterval(() => {
      timeLeft--;
      updateTime();
      if (timeLeft <= 0) {
        endGame();
      }
    }, 1000);
  });
}

// Ends the game and shows alert
function endGame() {
  clearAllTimers();
  isGameRunning = false;
  endSound.currentTime = 0;
  endSound.play();
  setTimeout(() => {
    alert('Game Over!');
    startBtn.textContent = 'Play Again';
  }, 500);
}

// Clears all timers
function clearAllTimers() {
  clearInterval(gameInterval);
  clearTimeout(moleInterval);
  clearInterval(speedUpInterval);
  gameInterval = null;
  moleInterval = null;
  speedUpInterval = null;
}

// Pauses the game/resumes it
function pauseGame() {
  if (!isGameRunning && !isInCountdown) return;
  if (isInCountdown) {
    clearAllTimers();
    isInCountdown = false;
    countdown.textContent = '';
    return;
  }
  isPaused = !isPaused;
  pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
  if (isPaused) {
    pauseTimers();
  } else {
    resumeTimers();
  }
}

// Stops the timers when game is paused
function pauseTimers() {
  clearInterval(gameInterval);
  clearTimeout(moleInterval);
  clearInterval(speedUpInterval);
}

// Resumes the game after pause
function resumeTimers() {
  scheduleNextMole();
  speedUpInterval = setInterval(() => {
    if (speedFactor < MAX_SPEED_FACTOR) {
      speedFactor += 0.15; // Increased from 0.1
    }
  }, 10000); // Decreased from 15000 to 10000

  gameInterval = setInterval(() => {
    timeLeft--;
    updateTime();
    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

// Resets game state and starts a new round
function restartGame() {
  clearAllTimers();
  if (document.querySelector('.professor')) {
    document
      .querySelectorAll('.professor')
      .forEach((p) => (p.style.display = 'none'));
  }

  isGameRunning = false;
  isPaused = false;
  isInCountdown = false;
  score = 0;
  timeLeft = 60;
  speedFactor = 1.0;
  currentHole = null;
  moleIsActive = false;
  animationInProgress = false;

  pauseBtn.textContent = 'Pause';
  startBtn.textContent = 'Start';
  updateScore();
  updateTime();

  showCountdown(() => {
    isGameRunning = true;
    scheduleNextMole();

    speedUpInterval = setInterval(() => {
      if (speedFactor < MAX_SPEED_FACTOR) {
        speedFactor += 0.15; // Increased from 0.1
      }
    }, 10000); // Decreased from 15000 to 10000

    gameInterval = setInterval(() => {
      timeLeft--;
      updateTime();
      if (timeLeft <= 0) {
        endGame();
      }
    }, 1000);
  });
}

// Show countdown numbers before game starts
function showCountdown(callback) {
  countdownSound.currentTime = 0;
  countdownSound.play();
  countdown.textContent = '3';
  const countdownTwo = setTimeout(() => (countdown.textContent = '2'), 1000);
  const countdownOne = setTimeout(() => (countdown.textContent = '1'), 2000);
  const countdownGo = setTimeout(() => {
    countdown.textContent = 'Go!';
    startSound.currentTime = 0;
    startSound.play();
    callback();
  }, 3000);
  const countdownClear = setTimeout(() => (countdown.textContent = ''), 3500);
  window.countdownTimers = [
    countdownTwo,
    countdownOne,
    countdownGo,
    countdownClear,
  ];
}

// Display a floating score popup effect
function showPopup(text, hole, isPositive = true) {
  const popup = document.createElement('div');
  popup.textContent = text;
  popup.className = 'score-popup';
  popup.style.color = isPositive ? 'limegreen' : 'crimson';
  popup.style.fontWeight = 'bold';
  popup.style.fontSize = '20px';
  popup.style.position = 'absolute'; // Add position absolute
  popup.style.left = '50%';
  popup.style.top = '0';
  popup.style.transform = 'translate(-50%, -100%)';
  popup.style.pointerEvents = 'none';
  popup.style.zIndex = '1000'; // Add z-index to ensure visibility
  hole.appendChild(popup);

  // Add animation to make popup more visible
  let opacity = 1;
  let position = 0;
  const animatePopup = setInterval(() => {
    position -= 2;
    opacity -= 0.02;
    popup.style.top = position + 'px';
    popup.style.opacity = opacity;
    if (opacity <= 0) {
      clearInterval(animatePopup);
      popup.remove();
    }
  }, 20);
}

// Bind button clicks
startBtn.addEventListener('click', () => {
  uiSound.currentTime = 0;
  uiSound.play();
  startGame();
});

pauseBtn.addEventListener('click', () => {
  uiSound.currentTime = 0;
  uiSound.play();
  pauseGame();
});

restartBtn.addEventListener('click', () => {
  if (!isGameRunning && !isPaused) return;
  uiSound.currentTime = 0;
  uiSound.play();
  restartGame();
});

// Track the number of clicks with miss penalties
grid.addEventListener('click', (e) => {
  if (!isGameRunning || isPaused) return;

  // Fix for miss detection - check for hole-inner class or if it's a parent element
  const holeInner = e.target.classList.contains('hole-inner')
    ? e.target
    : e.target.closest('.hole-inner');

  if (holeInner && !e.target.classList.contains('professor')) {
    missSound.currentTime = 0;
    missSound.play();
    score -= 5;

    // Get the parent hole element for the popup
    const holeElement = holeInner.closest('.hole');
    showPopup('-5 (Miss!)', holeElement, false);
    updateScore();
  }
});

// Control hammer visibility and position
gameGrid.addEventListener('mouseenter', () => {
  hammer.style.display = 'block';
});
gameGrid.addEventListener('mouseleave', () => {
  hammer.style.display = 'none';
});
gameGrid.addEventListener('mousemove', (e) => {
  hammer.style.left = e.pageX + 'px';
  hammer.style.top = e.pageY + 'px';
});

// Start the game
createGrid();
bgMusic.play();
