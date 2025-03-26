// Global variables
let gameData = [];
let selectedItem = null;
let remainingHintTypes = [];
let hintInterval = null;

// --- Navigation Functions ---
document.getElementById("playButton").addEventListener("click", () => {
    document.getElementById("startMenu").style.display = "none";
    document.getElementById("categorySelection").style.display = "block";
});

const categoryButtons = document.querySelectorAll(".categoryBtn");
categoryButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        const category = btn.getAttribute("data-category");
        loadData(category);
        document.getElementById("categorySelection").style.display = "none";
        document.getElementById("gameContainer").style.display = "block";
    });
});

// --- Data Loading Functions ---
function loadData(category) {
    const file = category === "countries" ? "countries.json" : "games.json";
    fetch(file)
        .then(response => response.json())
        .then(data => {
            gameData = data;
            pickRandomItem();
        })
        .catch(error => console.error("Error loading data:", error));
}

function pickRandomItem() {
    const randomIndex = Math.floor(Math.random() * gameData.length);
    selectedItem = gameData[randomIndex];
    remainingHintTypes = Object.keys(selectedItem.hints);

    // Clear previous UI
    document.getElementById("hints").innerText = "";
    document.getElementById("hintOptions").innerHTML = "";
    document.getElementById("result").innerText = "";
    document.getElementById("guessInput").value = "";

    // Clear any previous hint interval
    if (hintInterval) {
        clearInterval(hintInterval);
    }

    // Start hint generation
    hintInterval = setInterval(showHintOptions, 10000);
    showHintOptions();
}

// --- Hint Functions ---
function showHintOptions() {
    const hintOptionsDiv = document.getElementById("hintOptions");
    hintOptionsDiv.innerHTML = "";

    if (remainingHintTypes.length === 0) {
        clearInterval(hintInterval);
        return;
    }

    const hintsToShow = [];
    const hintCount = Math.min(3, remainingHintTypes.length);
    const availableHints = [...remainingHintTypes];

    for (let i = 0; i < hintCount; i++) {
        const randIndex = Math.floor(Math.random() * availableHints.length);
        const hintType = availableHints.splice(randIndex, 1)[0];
        hintsToShow.push(hintType);
    }

    hintsToShow.forEach(hintType => {
        const btn = document.createElement("button");
        btn.className = "hint-button";
        btn.innerText = hintType.charAt(0).toUpperCase() + hintType.slice(1);
        btn.addEventListener("click", () => {
            displayHint(hintType);
            remainingHintTypes = remainingHintTypes.filter(h => h !== hintType);
            hintOptionsDiv.innerHTML = "";
        });
        hintOptionsDiv.appendChild(btn);
    });
}

function displayHint(hintType) {
    let hintValue = selectedItem.hints[hintType];

    if (Array.isArray(hintValue)) {
        hintValue = hintValue.join(", ");
    } else if (typeof hintValue === "object") {
        hintValue = JSON.stringify(hintValue);
    }

    const hintText = `${hintType.charAt(0).toUpperCase() + hintType.slice(1)}: ${hintValue}`;
    const hintsDiv = document.getElementById("hints");
    hintsDiv.innerText += hintText + "\n";
}

// --- Guess Checking ---
function checkGuess() {
    const userGuess = document.getElementById("guessInput").value.trim().toLowerCase();
    const correctAnswer = selectedItem.name.toLowerCase();

    if (userGuess === correctAnswer) {
        document.getElementById("result").innerText = "Correct!";
        clearInterval(hintInterval);
    } else {
        document.getElementById("result").innerText = "Try again!";
    }
}

document.getElementById("submitGuess").addEventListener("click", checkGuess);
document.getElementById("guessInput").addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        checkGuess();
    }
});