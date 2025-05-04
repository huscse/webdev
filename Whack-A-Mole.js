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

function Pause(interval) {
  //Function to pause the game when the user clicks on the Pause button, it turns the button into a resume button, and sets off a global boolean variable that
  //pauses (or unpauses) the game.
  isPaused = !isPaused;

  //if the user paused the game (isPaused starts as false)
  if (isPaused) {
    document.getElementById('PAUSE').innerHTML = 'Resume Button';
    document.getElementById('TIMER').innerHTML = 'PAUSED';
    clearInterval(interval); // Stop the timer
  } else {
    // When resumed, calculate the remaining time and continue from where we left off
    document.getElementById('PAUSE').innerHTML = 'Pause Button';
    document.getElementById('TIMER').innerHTML = 'Time Left:';

    // Calculate how much time is remaining
    let remainingTime = totalGameTime - timeAtLastPause;

    // Update startTime based on remaining time
    var newstartTime = remainingTime * 1000;

    // Restart the game timer
    StartRealTimer(newstartTime);
  }
}

function StartRealTimer(startTime) {
  //This function starts the main 60 second timer (time can be changed in totalGameTime value above.)
  // Will also start inializing the game logic (pop up a mole at a random whole every second)

  var actualTimer = document.createElement('div');
  actualTimer.id = 'actualTimer';
  document.getElementById('TIMER').appendChild(actualTimer);

  //If the function came with a startTime, then it came from resuming the pause function.
  if (!startTime) {
    //startTime did not come with the function, meaning it was called to start the main timer.
    startTime = Date.now();
  } else {
    //the start time will not be the the function was called, but the time the function was called minus the amount of time spent. (in milliseconds)
    startTime = Date.now() - startTime;
  }

  //Run only if the game is not paused
  if (!isPaused) {
    let interval = setInterval(() => {
      //calculate how much time is left
      let elapsed = (Date.now() - startTime) / 1000;

      //append how much time is left to the front-end.
      actualTimer.innerHTML = `${parseInt(
        totalGameTime + 1 - elapsed.toFixed(1),
      )}`;

      //If the user went over the total game time (AKA THEY LOSE LOL)
      if (elapsed > totalGameTime) {
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

      //Create the Pause functionality since StartRealTimer is associated with starting the game again.
      document.getElementById('PAUSE').onclick = function () {
        timeAtLastPause = actualTimer.innerHTML;
        Pause(interval);
      };
    }, 100); // end of each second interval

    //Create a Mole that pops up,
    //this can be edited based on the amount of moles wanted with the variable amountOfMolesAtOnce
    for (let d = 0; d < amountOfMolesAtOnce; d++) {
      //create a mole
      var mole = document.createElement('img');
      mole.id = 'mole';
      mole.src = 'public/prof-gross-draft1.png'; // Change this to the actual path of your image
      mole.alt = 'Mole';

      //When the user clicks on the molee, give them the right amount of points
      mole.addEventListener('click', CheckMolePosition);

      //If the user clicked on the gameBoard, that means they missed, minus 5 points
      document
        .getElementById('gameBoard')
        .addEventListener('click', MoleMissed);

      //Start the GameLogic for that specific mole
      GameLogic(mole);
    }
  }
}
function GameLogic(molee) {
  //Function that does the game logic for a mole named molee
  //Currently, every popUpMoleTime, it pops up the mole
  //PopUpMole() takes care of popping down the mole from the hole

  // If the mole interval is already running, do nothing
  // This is for the case when the user resumes the game and it causes there to be a duplicate mole on the board.
  if (isMoleIntervalActive) {
    return;
  }

  // Start the mole interval
  isMoleIntervalActive = true;

  //Pop up the mole every popUpMoleTime
  setInterval(() => {
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
function CheckMolePosition(event) {
  //Function that checks where the mole is and what amount of points to give it or take away.
  var clickedMole = event.currentTarget;

  if (clickedMole.classList.contains('Up')) {
    MoleClickedGood(event);
  } else if (clickedMole.classList.contains('Down')) {
    MoleClickedMedium(event);
  }
}
function MoleClickedGood(event) {
  //Function that runs when the mole is clicked (when it is raised)
  //raised means give 10 points

  //amount of points you want them to gain
  var amountofPoints = 10;

  //prevent multiple moleClicked functions from running
  event.stopPropagation();

  //create the effect
  const effect = document.createElement('div');
  effect.className = 'score-effect';
  effect.style.left = `${event.clientX}px`;
  effect.style.top = `${event.clientY}px`;
  effect.style.color = 'green';
  effect.textContent = `+${amountofPoints}`;
  document.body.appendChild(effect);

  // Remove after animation
  setTimeout(() => {
    effect.remove();
  }, 1000);

  //Actually change the score on the front-end
  document.getElementById('ActualScore').innerHTML =
    Number(document.getElementById('ActualScore').innerHTML) + amountofPoints;
}
function MoleClickedMedium(event) {
  //Function that runs when the mole is clicked (when it is not-raised) (meaning too early or too late)
  //not-raised means give 5 points

  //amount of points you want them to gain
  var amountofPoints = 5;

  //prevent multiple moleClicked functions from running
  event.stopPropagation();

  //create the effect
  const effect = document.createElement('div');
  effect.className = 'score-effect';
  effect.style.left = `${event.clientX}px`;
  effect.style.top = `${event.clientY}px`;
  effect.style.color = 'yellow';
  effect.textContent = `+${amountofPoints}`;
  document.body.appendChild(effect);

  // Remove after animation
  setTimeout(() => {
    effect.remove();
  }, 1000);

  //Actually change the score on the front-end
  document.getElementById('ActualScore').innerHTML =
    Number(document.getElementById('ActualScore').innerHTML) + amountofPoints;
}
function MoleMissed(event) {
  //Function that runs when the user clicks on anywhere that isnt a mole and is in the gameBoard.
  //Missing the mole means lose 5 points

  //amount of points you want them to lose
  var amountofPoints = 5;

  //create the effect
  const effect = document.createElement('div');
  effect.className = 'score-effect';
  effect.style.left = `${event.clientX}px`;
  effect.style.top = `${event.clientY}px`;
  effect.style.color = 'red';
  effect.textContent = `-${amountofPoints}`;
  document.body.appendChild(effect);

  // Remove after animation
  setTimeout(() => {
    effect.remove();
  }, 1000);

  //Actually change the score on the front-end
  document.getElementById('ActualScore').innerHTML =
    Number(document.getElementById('ActualScore').innerHTML) - amountofPoints;
}

function addHammerCursor() {
  const hammer = document.createElement('img');
  hammer.src = 'public/hammer.png';
  hammer.id = 'hammerCursor';
  hammer.style.position = 'absolute';
  hammer.style.pointerEvents = 'none';
  hammer.style.width = '120px'; // Adjust size as needed
  hammer.style.height = 'auto';
  hammer.style.transform = 'translate(-50%, -50%)'; // Center at cursor position
  hammer.style.zIndex = '9999'; // Make sure it's always on top
  document.body.appendChild(hammer);

  // Move hammer with cursor
  document.addEventListener('mousemove', (e) => {
    hammer.style.left = e.clientX + 'px';
    hammer.style.top = e.clientY + 'px';
  });

  // Optional: Add hammer swing animation on click
  document.addEventListener('mousedown', () => {
    hammer.style.transform = 'translate(-50%, -50%) rotate(30deg)';
    setTimeout(() => {
      hammer.style.transform = 'translate(-50%, -50%)';
    }, 200);
  });
}

addHammerCursor();
