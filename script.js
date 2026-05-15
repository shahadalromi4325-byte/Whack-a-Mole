/* ═══════════════════════════════════════════════════════
   CONSTANTS  –  immutable game settings
═══════════════════════════════════════════════════════ */
const GAME_DURATION = 30;     // seconds per round
const MOLE_INTERVAL = 1200;   // ms between mole moves
const SCORE_PER_HIT = 10;     // points awarded per whack
const TOTAL_HOLES   = 6;      // number of holes on the board
let score     = 0;
let timeLeft  = GAME_DURATION;
let isPlaying = false;
let lastHole  = -1;
let gameTimer = null;
let moleTimer = null;

//   ARRAYS  –  DOM node collection (NodeList → Array)
const moles = Array.from(document.querySelectorAll('.mole-img'));

  // AUDIO
const bonkSound = new Audio('Sounds/bonk.mp3');

   //HELPER – reset every mole image to the empty hole
function resetAllMoles() {
    /* DELETION: clears the 'active' class from every element
       in the moles array, preventing stale click targets      */
    moles.forEach(function(mole) {
        mole.src = 'Media/hole-empty.png';
        mole.classList.remove('active');
    });
}

   //START / RESTART
document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('modal-restart-btn').addEventListener('click', function() {
    document.getElementById('game-over-modal').classList.add('hidden');
    startGame();
});

function startGame() {
    /* TRANSACTION: multiple state variables reset atomically
       so the game always starts from a clean, consistent state */
    clearInterval(gameTimer);
    clearInterval(moleTimer);
    resetAllMoles();

    score     = 0;
    timeLeft  = GAME_DURATION;
    isPlaying = true;
    lastHole  = -1;

    document.getElementById('score').textContent    = score;
    document.getElementById('time').textContent     = timeLeft;
    document.getElementById('start-btn').textContent = 'Restart';

    gameTimer = setInterval(countDown,      1000);
    moleTimer = setInterval(showRandomMole, MOLE_INTERVAL);
}

   //COUNTDOWN  –  called every second by gameTimer
function countDown() {
    /* EDITING: updates the timeLeft variable each tick */
    timeLeft--;
    document.getElementById('time').textContent = timeLeft;

    if (timeLeft <= 0) {
        endGame();
    }
}

  // SHOW RANDOM MOLE  –  called every MOLE_INTERVAL ms
function showRandomMole() {
    resetAllMoles();
  let randomIndex;
    do {
        randomIndex = Math.floor(Math.random() * TOTAL_HOLES);
    } while (randomIndex === lastHole);
    lastHole = randomIndex;
   moles[randomIndex].src = 'Media/mole-happy.png';
    moles[randomIndex].classList.add('active');
}
moles.forEach(function(mole) {
    mole.addEventListener('click', function() {
        if (!isPlaying) return;

        if (this.classList.contains('active')) {
            /* TRANSACTION: score increment + image swap + class
               removal all happen together as one atomic action  */
            score += SCORE_PER_HIT;
            document.getElementById('score').textContent = score;

            bonkSound.currentTime = 0;
            bonkSound.play();

            /* EDITING: swap the mole image to its dead state */
            this.src = 'Media/mole-dead.png';

            /* DELETION: remove 'active' so it cannot be double-hit */
            this.classList.remove('active');
        }
    });
});

/* ═══════════════════════════════════════════════════════
   END GAME
═══════════════════════════════════════════════════════ */
function endGame() {
    /* TRANSACTION: stop both timers + clear board + show modal
       as a single coordinated state change                       */
    isPlaying = false;
    clearInterval(gameTimer);
    clearInterval(moleTimer);
    resetAllMoles();

    document.getElementById('start-btn').textContent = 'Play New Game!';

    const msg = score === 0
        ? "YOU LOST! Too slow!<br>Final Score: " + score
        : "Great job!<br>Final Score: "           + score;

    document.getElementById('final-score').innerHTML = msg;
    document.getElementById('game-over-modal').classList.remove('hidden');
}