// Scoreboard
let currentStreak = 0;
let maxStreak = 0;
let totalScore = 0;

const scoreHeader = document.getElementById('score');
const streakHeader = document.getElementById('streak');
const maxStreakHeader = document.getElementById('max-streak');

// Timer
let remainingTime;
let isCounting = false;
let secsRemaining = 0;
let timeInSecs = 10; // Example starting countdown time in seconds
let ticker;
let endTime;

const countdownElement = document.getElementById('countdown');

// Game state flags
let isGiveUp = false;
let isGameStarted = false;

// Pokémon-related
let pokemonName = '';
let pokemonSprite;
const pkmImg = document.getElementById('pkm-img');

// Input element
const inputElement = document.getElementById('guess-input');

// Generation tracking
const generationButtons = document.querySelectorAll('#generations .btn');
let excludedGenerations = new Set();

// Initialize event listeners
document.getElementById('reset-game').addEventListener('click', resetGame);
document.getElementById('start-game').addEventListener('click', startGame);
inputElement.addEventListener('input', isCorrect);
document.getElementById('give-up-btn').addEventListener('click', giveUpAction);

// Add event listeners for generation buttons
generationButtons.forEach(button => {
    button.addEventListener('click', toggleGeneration);
});

// Core Game Functions

function startCountDown(secs) {
    timeInSecs = parseInt(secs);
    isCounting = true;
    endTime = Date.now() + (timeInSecs * 1000);
    ticker = setInterval(tick, 100);
}

function tick() {
    const now = Date.now();
    remainingTime = endTime - now;

    if (remainingTime > 0) {
        const secs = Math.floor(remainingTime / 1000);
        const ms = Math.floor((remainingTime % 1000) / 10);
        secsRemaining = secs;
        countdownElement.innerHTML = `HP: ${secs}.${ms}`;
    } else {
        stopCountDown();
        countdownElement.innerHTML = "Time's up!";
        handleGameOver();
    }
}

function stopCountDown() {
    clearInterval(ticker);
    isCounting = false;
    const now = Date.now();
    remainingTime = endTime - now; 
    //secsRemaining = 0;
    // countdownElement.innerHTML = `HP: 0.00`;
}

async function fetchRandomPokemon() {
    await delay(1000);

    try {
        let randomId;
        const generationRanges = {
            'gen-1': [1, 151],
            'gen-2': [152, 251],
            'gen-3': [252, 386],
            'gen-4': [387, 493],
            'gen-5': [494, 649],
            'gen-6': [650, 721],
            'gen-7': [722, 809],
            'gen-8': [810, 905],
            'gen-9': [906, 1025]
        };

        const allGenerations = Object.keys(generationRanges);
        const availableGenerations = allGenerations.filter(gen => !excludedGenerations.has(gen));

        if (availableGenerations.length > 0) {
            const selectedGeneration = availableGenerations[Math.floor(Math.random() * availableGenerations.length)];
            const [minId, maxId] = generationRanges[selectedGeneration];
            randomId = Math.floor(Math.random() * (maxId - minId + 1)) + minId;
        } else {
            randomId = Math.floor(Math.random() * 1025) + 1;
        }

        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
        const data = await response.json();
        pokemonName = data.name.toLowerCase();
        pokemonSprite = data.sprites.front_default;

        pkmImg.classList.remove('show');
        pkmImg.src = pokemonSprite;

        inputElement.disabled = false; // Enable the input when a new Pokémon is fetched
        isGameStarted = true; // Game is now in progress

    } catch (err) {
        console.error(err);
    }
}

function startGame() {
    if (isGameStarted) return; // Prevent starting the game again if it's already in progress
    console.log("Game started");
    resetGame(); // Reset game state before starting a new round
    fetchRandomPokemon();
    startCountDown(10);
}

function resetGame() {
    console.log("Game reset");
    clearInput();
    stopCountDown();
    countdownElement.innerHTML = "Click Start Game";
    
    totalScore = 0;
    currentStreak = 0;
    maxStreak = 0;
    isGameStarted = false;

    scoreHeader.innerText = 'Score: 0';
    streakHeader.innerText = 'Streak: 0';
    maxStreakHeader.innerText = 'Max Streak: 0';
    inputElement.disabled = true; // Disable input until a new game starts
}



async function restartGame() {
    await delay(3000); 
    clearInput();
    fetchRandomPokemon();
    startCountDown(10);
}

function clearInput() {
    inputElement.classList.remove('correct', 'give-up');
    inputElement.value = ''; // Clear the input field
    inputElement.disabled = true; // Disable input until the next Pokémon is fetched
}

async function isCorrect() {
    const inputValue = inputElement.value.toLowerCase();
    if (inputValue === pokemonName) {
        stopCountDown();
        updateScore();
        currentStreak += 1;
        streakHeader.innerText = `Streak: ${currentStreak}`;
        inputElement.classList.add('correct');
        pkmImg.classList.add('show');
        inputElement.disabled = true; // Disable input after the correct answer is submitted
        await delay(2000);
        restartGame();
    }
}

function giveUpAction() {
    if (!isGameStarted) return; // Prevent give up action before the game starts
    stopCountDown();
    updateStreaks();
    isGiveUp = true;
    updateScore();
    inputElement.value = pokemonName;
    pkmImg.classList.add('show');
    inputElement.classList.add('give-up');
    inputElement.disabled = true; // Disable input after giving up
    restartGame();
}

function updateScore() {

    console.log(secsRemaining);
    if (isGiveUp) {
        secsRemaining = 0;
    }
    //console.log("total score: " + totalScore);
    totalScore = totalScore + secsRemaining;
    //console.log("total score: " + totalScore);
    scoreHeader.innerText = `Score: ${totalScore}`;
    secsRemaining = 0;
}

function updateStreaks() {
    if (currentStreak > maxStreak) {
        maxStreak = currentStreak;
        maxStreakHeader.innerText = `Max Streak: ${maxStreak}`;
    }
    currentStreak = 0;
    streakHeader.innerText = `Streak: ${currentStreak}`;
}

// Event listener for generation buttons
function toggleGeneration(event) {
    const generation = event.target.id;
    if (excludedGenerations.has(generation)) {
        excludedGenerations.delete(generation);
        event.target.classList.remove('selected');
    } else {
        excludedGenerations.add(generation);
        event.target.classList.add('selected');
    }
    console.log('Excluded generations:', Array.from(excludedGenerations));
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function handleGameOver() {
    // Handle the game over scenario when the timer runs out
    inputElement.disabled = true; // Disable input when the game is over
    isGameStarted = false; // Game is no longer active
}
