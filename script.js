// Game Configuration
let gameData = [];
let selectedItem = null;
let remainingHintTypes = [];
let score = 100;
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

function updateScoreDisplay() {
    updateText("score", `Score: ${score}`);
}

// End Game
function endGame(won) {
    updateText("result", won ? "You Win!" : "You Lose!");
    setTimeout(() => {
        hideElement("gameContainer");
        updateText("result", "");
        showElement("categorySelection");
    }, 3000);
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
    document.title = `Catalogue - ${category[0].toUpperCase()}${category.slice(1)}`;
    updateText("guessTitle", `${category[0].toUpperCase()}${category.slice(1)}`);
    loadData(category);
    hideElement("categorySelection");
    showElement("gameContainer");
    updateScoreDisplay();
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
    updateText("answerLength", `Answer Length: ${selectedItem.name.length}`);
    getElement("guessInput").value = "";
    showHintOptions();
}

// Show Hint Options
function showHintOptions() {
    const hintOptionsDiv = getElement("hintOptions");
    hintOptionsDiv.innerHTML = "";
    remainingHintTypes.forEach(hintType => {
        const btn = document.createElement("button");
        btn.className = "hint-button";
        btn.innerText = hintType;
        btn.title = `Use this hint for -5 points (Current Score: ${score})`;
        btn.addEventListener("click", () => {
            useHint(hintType);
            showHintOptions(); // Refresh hint options after using one
        });
        hintOptionsDiv.appendChild(btn);
    });
    const rerollButton = document.createElement("button");
    rerollButton.className = "hint-button";
    rerollButton.innerText = "Reroll Hints";
    rerollButton.title = `Reroll all hints for -10 points (Current Score: ${score})`;
    rerollButton.addEventListener("click", rerollHints);
    hintOptionsDiv.appendChild(rerollButton);
}

// Use a Hint
function useHint(hintType) {
    score -= 5;
    updateScoreDisplay();
    displayHint(hintType);
    usedHints.push(`${hintType}: ${selectedItem.hints[hintType]}`);
    updateUsedHints();
}

// Reroll Hints
function rerollHints() {
    score -= 10;
    updateScoreDisplay();
    remainingHintTypes = Object.keys(selectedItem.hints);
    showHintOptions();
}

// Display the Hint
function displayHint(hintType) {
    const hintValue = Array.isArray(selectedItem.hints[hintType]) ? selectedItem.hints[hintType].join(", ") : String(selectedItem.hints[hintType]);
    updateText("hints", `${hintType}: ${hintValue}`);
}

// Update Used Hints Display
function updateUsedHints() {
    updateText("usedHints", "Used Hints: " + usedHints.join(", "));
}

// Check Guess
function checkGuess() {
    const userGuess = getElement("guessInput").value.trim().toLowerCase();
    pastGuesses.push(userGuess);
    updateText("pastGuesses", "Past Guesses: " + pastGuesses.join(", "));
    if (userGuess === selectedItem.name.toLowerCase()) {
        endGame(true);
    } else {
        updateText("result", "Try again!");
    }
}

// Event Listeners
getElement("submitGuess").addEventListener("click", checkGuess);
getElement("guessInput").addEventListener("keypress", (e) => {
    if (e.key === "Enter") checkGuess();
});

// Initialize the game on page load
window.onload = initializeGame;
