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
      var mole = document.createElement('div');
      mole.id = 'mole';
      mole.onclick = function () {
        CheckMolePosition(mole);
      };
      GameLogic(mole);
    }
  }
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
  //Function to move a specific mole up from its hole and start moving the mole down after half of the popUpMoleTime

  var randomRow = parseInt(Math.random() * 3 + 1);
  var randomHole = parseInt(Math.random() * 3 + 1);
  molee.style.display = 'block';
  molee.style.bottom = '0';
  molee.classList.add('Up');
  molee.classList.remove('Down');
  document.getElementById(`h${randomHole}r${randomRow}`).appendChild(molee);

  // tiny delay to let browser catch style change
  setTimeout(() => {
    molee.style.bottom = '50px'; // Move mole up
  }, 10);

  setTimeout(() => {
    PopDownMole(molee);
  }, popUpMoleTime / 2);
}

function PopDownMole(molee) {
  //Function to move a specifc mole down from its hole
  molee.classList.add('Down');
  molee.classList.remove('Up');
  molee.style.bottom = '0';

  setTimeout(() => {
    molee.style.display = 'none';
  }, 300);
}
function CheckMolePosition(molee) {
  console.log(molee.classList);
  if (molee.classList.contains('Up')) {
    MoleClickedGood(molee);
  } else if (molee.classList.contains('Down')) {
    MoleClickedMedium();
  } else {
    MoleMissed();
  }
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
function MoleMissed() {
  //Function that runs when the user clicks on anywhere that isnt a mole and is in the gameBoard.
  //Missing the mole means lose 5 points
}
