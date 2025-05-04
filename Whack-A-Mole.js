var totalGameTime = 60;
var popUpMoleTime = 1500;
var amountOfMolesAtOnce = 1;
let isPaused = false;
var timeAtLastPause;
let startTime; // To store the start time of the real game timer
let moleInterval; // Declare a global variable to store the interval
let isMoleIntervalActive = false; // Flag to track if mole interval is active

console.log('WHACK-A-MOLE STARTING...');
IntializeTimer();

function IntializeTimer() {
  //Function that creates the 3 second timer, appends it to the front-end, waits 3-4 seconds, and then removes it, and start the real 60 second timer.
  var ThreeSecTimer = document.createElement('div');
  ThreeSecTimer.id = 'TSecondTimer';
  var FrontEndTimer = document.createElement('div');
  FrontEndTimer.id = 'IntroTimer';
  ThreeSecTimer.appendChild(FrontEndTimer);
  document.body.appendChild(ThreeSecTimer);

  let startTime = Date.now();

  let interval = setInterval(() => {
    let elapsed = (Date.now() - startTime) / 1000;
    FrontEndTimer.textContent = `${parseInt(4 - elapsed.toFixed(1))}`;

    if (elapsed >= 3) {
      FrontEndTimer.textContent = `GO!`;
      if (elapsed > 4) {
        clearInterval(interval);
        ThreeSecTimer.remove();
        StartRealTimer();
      }
    }
  }, 100);
}

function StartRealTimer() {
  //This function starts the main 60 second timer (time can be changed in totalGameTime value above.)
  // Will also start inializing the game logic (pop up a mole at a random whole every second)
  var actualTimer = document.createElement('div');
  actualTimer.id = 'actualTimer';
  document.getElementById('TIMER').appendChild(actualTimer);

  let startTime = Date.now();

  if (!isPaused) {
    let interval = setInterval(() => {
      let elapsed = (Date.now() - startTime) / 1000;
      if (document.getElementById('actualTimer')) {
        document.getElementById('actualTimer').innerHTML = `${parseInt(
          totalGameTime + 1 - elapsed.toFixed(1),
        )}`;
      }

      if (elapsed >= totalGameTime) {
        document.getElementById('TIMER').innerHTML = `TIME'S UP!`;
        clearInterval(interval);
        isPaused = true;
        var finalScore = document.createElement('div');
        finalScore.id = 'FinalScore';
        finalScore.innerHTML =
          'FINAL SCORE: ' + document.getElementById('ActualScore').innerHTML;
        document.body.appendChild(finalScore);
        document.body.style.justifyContent = 'center';
        document.body.style.display = 'flex';
        document.getElementById('gameBoard').remove();
      }
      document.getElementById('PAUSE').onclick = function () {
        if (document.getElementById('actualTimer')) {
          timeAtLastPause = document.getElementById('actualTimer').innerHTML;
        }
        Pause(interval);
      };
    }, 100);
    for (let d = 0; d < amountOfMolesAtOnce; d++) {
      // Create the mole image
      var mole = document.createElement('img');
      mole.id = 'mole';
      mole.src = '/prof-gross-draft1.png'; /* Path to your professor image */
      mole.alt = 'Professor';

      // Add mole to a hole
      const randomHole = document.querySelector('.hole'); // Or select a random hole
      randomHole.appendChild(mole);

      // To make the mole appear
      function showMole() {
        mole.classList.add('mole-up');
      }

      // To hide the mole
      function hideMole() {
        mole.classList.remove('mole-up');
      }
      mole.onclick = function (event) {
        CheckMolePosition(mole, event);
      };
      GameLogic(mole);
    }
  }
  document
    .getElementById('gameBoard')
    .addEventListener('click', function (event) {
      // Only count as a miss if clicking directly on the gameBoard (not on a mole)
      if (
        event.target.id === 'gameBoard' ||
        event.target.className === 'hole'
      ) {
        MoleMissed(event);
      }
    });
}
function Pause(interval) {
  isPaused = !isPaused;
  if (isPaused) {
    document.getElementById('PAUSE').innerHTML = 'Resume Button';
    document.getElementById('TIMER').innerHTML = 'PAUSED';
    clearInterval(interval); // Stop the timer

    document.body.scrollTop = document.body.scrollHeight; // Scroll to bottom (For Safari)
    document.documentElement.scrollTop = document.documentElement.scrollHeight; // Scroll to bottom (For other browsers)
  } else {
    if (!document.getElementById('actualTimer')) {
    }
    // When resumed, calculate the remaining time and continue from where we left off
    document.getElementById('PAUSE').innerHTML = 'Pause Button';
    document.getElementById('TIMER').innerHTML = 'Time Left:';

    // Calculate how much time is remaining
    let remainingTime = totalGameTime - timeAtLastPause;

    // Update startTime based on remaining time
    startTime = Date.now() - remainingTime * 1000; // Adjust startTime to continue from where it left off

    // Restart the game timer
    StartRealTimer();
  }
}
function GameLogic(molee) {
  if (isMoleIntervalActive) {
    return; // If the mole interval is already running, do nothing
  }

  // Start the mole interval
  isMoleIntervalActive = true;

  let moleInterval = setInterval(() => {
    if (!isPaused) {
      PopUpMole(molee);
    }
  }, popUpMoleTime);
}

function PopUpMole(molee) {
  // Choose random row and hole (keep this part the same)
  var randomRow = parseInt(Math.random() * 3 + 1);
  var randomHole = parseInt(Math.random() * 3 + 1);

  // Style changes - initially position the mole fully hidden in the hole
  molee.style.display = 'block';
  molee.style.bottom = '-80px'; // Start lower to hide the mole completely
  molee.classList.add('Up');
  molee.classList.remove('Down');

  // Put the molee at that position
  document.getElementById(`h${randomHole}r${randomRow}`).appendChild(molee);

  // tiny delay to let browser catch style change
  setTimeout(() => {
    // Move the mole up to a position where only part of it is visible
    molee.style.bottom = '-30px'; // Adjust this value to control how much of the mole is visible
  }, 10);

  // After the molee has moved up, wait half of the popUpMoleTime and put that shit down
  setTimeout(() => {
    PopDownMole(molee);
  }, popUpMoleTime / 2);
}

function PopDownMole(molee) {
  // Make the mole go back down into the hole
  molee.classList.add('Down');
  molee.classList.remove('Up');
  molee.style.bottom = '-80px'; // Return to fully hidden position

  // after a lil delay actually make the molee disapear
  setTimeout(() => {
    molee.style.display = 'none';
  }, 300);
}

function MoleClickedGood(molee) {
  //Function that runs when the mole is clicked (when it is raised)
  //raised means give 10 points
  document.getElementById('ActualScore').innerHTML =
    Number(document.getElementById('ActualScore').innerHTML) + 10;
}
function MoleClickedMedium() {
  //Function that runs when the mole is clicked (when it is not-raised) (meaning too early or too late)
  //not-raised means give 5 points
  document.getElementById('ActualScore').innerHTML =
    Number(document.getElementById('ActualScore').innerHTML) + 5;
}
function MoleMissed(event) {
  // Function that runs when the user clicks on anywhere that isn't a mole in the gameBoard
  // Missing the mole means lose 5 points

  // Deduct 5 points from the score
  document.getElementById('ActualScore').innerHTML =
    Number(document.getElementById('ActualScore').innerHTML) - 5;

  // Create the floating score effect - position ABOVE the cursor
  const effect = document.createElement('div');
  effect.className = 'score-effect';
  effect.style.left = `${event.clientX}px`;
  effect.style.top = `${event.clientY - 50}px`; // Position 50px ABOVE cursor
  effect.style.color = 'red';
  effect.textContent = '-5';
  document.body.appendChild(effect);

  // Remove effect after animation
  setTimeout(() => {
    effect.remove();
  }, 1000);
}
function CheckMolePosition(molee, event) {
  // Function that checks where the mole is and what amount of points to give
  if (molee.classList.contains('Up')) {
    MoleClickedGood(molee);

    const effect = document.createElement('div');
    effect.className = 'score-effect';
    effect.style.left = `${event.clientX}px`;
    effect.style.top = `${event.clientY - 50}px`; // Position 50px ABOVE cursor
    effect.style.color = 'green';
    effect.textContent = '+10';
    document.body.appendChild(effect);

    // Remove effect after animation
    setTimeout(() => {
      effect.remove();
    }, 1000);
  } else if (molee.classList.contains('Down')) {
    MoleClickedMedium();

    const effect = document.createElement('div');
    effect.className = 'score-effect';
    effect.style.left = `${event.clientX}px`;
    effect.style.top = `${event.clientY - 80}px`; // Position 50px ABOVE cursor
    effect.style.color = 'yellow';
    effect.textContent = '+5';
    document.body.appendChild(effect);

    // Remove effect after animation
    setTimeout(() => {
      effect.remove();
    }, 1000);
  }
}

function addHammerCursor() {
  const hammer = document.createElement('img');
  hammer.src = '/hammer.png';
  hammer.id = 'hammerCursor';
  hammer.style.position = 'absolute';
  hammer.style.pointerEvents = 'none';
  hammer.style.width = '120px'; // Adjust size as needed
  hammer.style.height = 'auto';
  hammer.style.transform = 'translate(-50%, -50%)'; // Center at cursor position
  hammer.style.zIndex = '9999';
  document.body.appendChild(hammer);

  // Move hammer with cursor
  document.addEventListener('mousemove', (e) => {
    hammer.style.left = e.clientX + 'px';
    hammer.style.top = e.clientY + 'px';
  });

  document.addEventListener('mousedown', () => {
    hammer.style.transform = 'translate(-50%, -50%) rotate(30deg)';
    setTimeout(() => {
      hammer.style.transform = 'translate(-50%, -50%)';
    }, 200);
  });
}

addHammerCursor();
