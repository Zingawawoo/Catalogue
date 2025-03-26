// Game Configuration
let gameData = [];
let selectedItem = null;
let remainingHintTypes = [];
let hintInterval = null;
let countdownTimer = 60;
let countdownInterval = null;
let pastGuesses = [];
let usedHints = [];

// Utility Functions
function getElement(id) {
    return document.getElementById(id);
}

function showElement(id) {
    getElement(id).style.display = "block";
}

function hideElement(id) {
    getElement(id).style.display = "none";
}

function updateText(id, text) {
    getElement(id).innerText = text;
}

// Initialize Game
function initializeGame() {
    const playButton = getElement("playButton");
    playButton.addEventListener("click", () => {
        hideElement("startMenu");
        showElement("categorySelection");
    });

    const categoryButtons = document.querySelectorAll(".categoryBtn");
    categoryButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const category = btn.getAttribute("data-category");
            startGame(category);
        });
    });
}

// Dynamic Data Loading
async function loadData(category) {
    const file = `${category}.json`;
    try {
        const response = await fetch(file);
        if (!response.ok) throw new Error(`Failed to load ${file}`);
        gameData = await response.json();
        pickRandomItem();
    } catch (error) {
        console.error("Error loading data:", error);
    }
}

// Game Start
function startGame(category) {
    loadData(category);
    hideElement("categorySelection");
    showElement("gameContainer");
    startCountdown();
}

// Countdown Timer
function startCountdown() {
    countdownTimer = 60;
    updateTimerDisplay();
    countdownInterval = setInterval(() => {
        countdownTimer--;
        updateTimerDisplay();
        if (countdownTimer <= 0) endGame(false);
    }, 1000);
}

function updateTimerDisplay() {
    updateText("timer", `Time Left: ${countdownTimer}s`);
}

// End Game
function endGame(won) {
    clearInterval(hintInterval);
    clearInterval(countdownInterval);
    updateText("result", won ? "You Win!" : "You Lose!");
    setTimeout(() => {
        hideElement("gameContainer");
        showElement("categorySelection");
    }, 3000);
}

// Pick a Random Item
function pickRandomItem() {
    const randomIndex = Math.floor(Math.random() * gameData.length);
    selectedItem = gameData[randomIndex];
    remainingHintTypes = Object.keys(selectedItem.hints);
    pastGuesses = [];
    usedHints = [];
    updateText("hints", "");
    updateText("pastGuesses", "Past Guesses:");
    updateText("usedHints", "Used Hints:");
    getElement("guessInput").value = "";
    clearInterval(hintInterval);
    hintInterval = setInterval(showHintOptions, 10000);
    showHintOptions();
}

// Show Hint Options
function showHintOptions() {
    if (remainingHintTypes.length === 0) {
        clearInterval(hintInterval);
        return;
    }
    const hintOptionsDiv = getElement("hintOptions");
    hintOptionsDiv.innerHTML = "";
    const numOptions = Math.min(3, remainingHintTypes.length);
    for (let i = 0; i < numOptions; i++) {
        const hintType = remainingHintTypes.splice(Math.floor(Math.random() * remainingHintTypes.length), 1)[0];
        const btn = document.createElement("button");
        btn.className = "hint-button";
        btn.innerText = hintType;
        btn.addEventListener("click", () => {
            displayHint(hintType);
            usedHints.push(hintType);
            updateUsedHints();
            countdownTimer -= 5;
            updateTimerDisplay();
            hintOptionsDiv.innerHTML = "";
        });
        hintOptionsDiv.appendChild(btn);
    }
}

// Display the Hint
function displayHint(hintType) {
    const hintValue = Array.isArray(selectedItem.hints[hintType]) ? selectedItem.hints[hintType].join(", ") : String(selectedItem.hints[hintType]);
    updateText("hints", `${hintType}: ${hintValue}`);
}

// Update Used Hints
function updateUsedHints() {
    updateText("usedHints", "Used Hints: " + usedHints.join(", "));
}

// Check Guess
function checkGuess() {
    const userGuess = getElement("guessInput").value.trim().toLowerCase();
    pastGuesses.push(userGuess);
    updateText("pastGuesses", "Past Guesses: " + pastGuesses.join(", "));
    if (userGuess === selectedItem.name.toLowerCase()) endGame(true);
    else updateText("result", "Try again!");
}

// Event Listeners
getElement("submitGuess").addEventListener("click", checkGuess);
getElement("guessInput").addEventListener("keypress", (e) => {
    if (e.key === "Enter") checkGuess();
});

// Initialize the game on page load
window.onload = initializeGame;
