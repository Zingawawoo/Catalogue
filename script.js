let videoGames = [];
let selectedGame = null;
let remainingHintTypes = [];
let hintInterval = null;

// --- Navigation Functions ---

// Show the category selection when "Play" is clicked.
document.getElementById("playButton").addEventListener("click", () => {
  document.getElementById("startMenu").style.display = "none";
  document.getElementById("categorySelection").style.display = "block";
});

// Add event listeners to category buttons.
const categoryButtons = document.querySelectorAll(".categoryBtn");
categoryButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const category = btn.getAttribute("data-category");
    if (category === "videoGames") {
      document.getElementById("categorySelection").style.display = "none";
      document.getElementById("gameContainer").style.display = "block";
      loadGames();
    } else {
      alert("This category is coming soon!");
    }
  });
});

// --- Game Setup Functions ---

// Load the game list from the JSON file.
function loadGames() {
  fetch('games.json')
    .then(response => response.json())
    .then(data => {
      videoGames = data;
      pickRandomGame();
    })
    .catch(error => console.error('Error loading games:', error));
}

// Select a random game from the list and initialize hint types.
function pickRandomGame() {
  const randomIndex = Math.floor(Math.random() * videoGames.length);
  selectedGame = videoGames[randomIndex];
  // Initialize remaining hint types from the selected game
  remainingHintTypes = Object.keys(selectedGame.hints);
  
  // Clear previous UI elements
  document.getElementById('hints').innerText = "";
  document.getElementById('hintOptions').innerHTML = "";
  document.getElementById('result').innerText = "";
  document.getElementById('guessInput').value = "";
  
  console.log("Selected game:", selectedGame.name); // for debugging

  // Clear any previous hint interval
  if (hintInterval) {
    clearInterval(hintInterval);
  }
  
  // Start showing hint options at regular intervals (every 10 seconds)
  hintInterval = setInterval(showHintOptions, 10000);
  // Immediately show the first set of hint options
  showHintOptions();
}

// --- Hint Functions ---

// Display hint option buttons. Randomly select up to three hint types from remainingHintTypes.
function showHintOptions() {
  // If no hints remain, stop the interval.
  if (remainingHintTypes.length === 0) {
    clearInterval(hintInterval);
    return;
  }
  
  const hintOptionsDiv = document.getElementById("hintOptions");
  // Clear any previous hint options.
  hintOptionsDiv.innerHTML = "";
  
  // Determine how many hint buttons to show (max 3).
  const numOptions = Math.min(3, remainingHintTypes.length);
  // Clone remainingHintTypes so we can randomly select without modifying the original yet.
  const availableHints = [...remainingHintTypes];
  
  for (let i = 0; i < numOptions; i++) {
    const randIndex = Math.floor(Math.random() * availableHints.length);
    const hintType = availableHints[randIndex];
    // Remove the chosen hint type from the temporary array.
    availableHints.splice(randIndex, 1);
    
    // Create a button for the hint type.
    const btn = document.createElement("button");
    // Capitalize the hint type for display.
    btn.innerText = hintType.charAt(0).toUpperCase() + hintType.slice(1);
    btn.addEventListener("click", function() {
      // When clicked, display the hint text.
      displayHint(hintType);
      // Remove the hint type so it won’t appear again.
      remainingHintTypes = remainingHintTypes.filter(h => h !== hintType);
      // Clear the hint options.
      hintOptionsDiv.innerHTML = "";
    });
    hintOptionsDiv.appendChild(btn);
  }
}

// Append the selected hint text to the hints display area.
function displayHint(hintType) {
  const hintText = selectedGame.hints[hintType];
  const hintsDiv = document.getElementById("hints");
  hintsDiv.innerText += hintText + "\n";
}

// --- Guess Checking ---

function checkGuess() {
  const userGuess = document.getElementById('guessInput').value.trim().toLowerCase();
  if (userGuess === selectedGame.name.toLowerCase()) {
    document.getElementById('result').innerText = "Correct! You guessed the game.";
    clearInterval(hintInterval);
  } else {
    document.getElementById('result').innerText = "Incorrect guess. Try again!";
  }
}

// Event listeners for guess submission.
document.getElementById('submitGuess').addEventListener('click', checkGuess);
document.getElementById('guessInput').addEventListener('keypress', function(e) {
  if (e.key === 'Enter') {
    checkGuess();
  }
});
