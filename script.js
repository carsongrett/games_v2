// Games list
const games = [
    { id: "nfl-player-guess", name: "Guess the NFL Player", description: "Guess the NFL player based on 2024 stats" },
    { id: "mlb-player-guess", name: "Guess the MLB Player", description: "Guess the MLB player based on 2025 stats" },
    { id: "breakout", name: "Guess the NBA Player", description: "Guess the NBA player based on 2024-25 stats" },
    { id: "quiz", name: "MLB Stat Shuffle", description: "Coming Soon - Guess the player from their single-game statline" },
    { id: "math", name: "Math Trivia", description: "Numbers and equations" }
];

// Navigation function for games
function navigateToGame(gameName) {
    // Change URL to #/home/gamename format (hash routing)
    window.location.hash = `/home/${gameName}`;
}

// Handle back navigation and URL routing
window.addEventListener('hashchange', function(event) {
    handleRoute();
});

function handleRoute() {
    const hash = window.location.hash;
    
    // Check if we're on a game page
    if (hash.startsWith('#/home/') && hash !== '#/home/') {
        const gameName = hash.split('#/home/')[1];
        loadGame(gameName);
    } else if (hash === '' || hash === '#' || hash === '#/') {
        // Show homepage
        showHomepage();
    }
}

// Dynamic game loading system
function loadGame(gameName) {
    // Check if game exists
    const game = games.find(g => g.id === gameName);
    if (!game) {
        // Game not found, redirect to homepage
        window.location.hash = '';
        return;
    }
    
    // Show loading placeholder
    showGamePlaceholder(game);
    
    // Try to load game dynamically
    loadGameScript(gameName);
}

function showGamePlaceholder(game) {
    document.body.innerHTML = `
        <div class="container">
            <header>
                <h1>${game.name}</h1>
                <button onclick="goHome()" style="padding: 10px 20px; background: white; border: 2px solid black; cursor: pointer; margin-bottom: 20px;">
                    Back to Home
                </button>
            </header>
            <main style="display: flex; justify-content: center; align-items: center; min-height: 400px;">
                <div id="game-container" style="text-align: center; border: 2px solid black; padding: 40px;">
                    <h2>Loading Game...</h2>
                    <p>The ${game.name} game is loading.</p>
                </div>
            </main>
        </div>
    `;
}

function loadGameScript(gameName) {
    // Special handling for coming soon games
    if (gameName === 'quiz') {
        showComingSoon(gameName);
        return;
    }
    
    // Check if script already exists
    const existingScript = document.querySelector(`script[src*="${gameName}"]`);
    if (existingScript) {
        existingScript.remove();
    }
    
    // Load game script dynamically
    const script = document.createElement('script');
    script.src = `games/${gameName}.js`;
    script.onload = () => {
        console.log(`${gameName} game loaded successfully`);
        // Game script should call window.initializeGame() when loaded
    };
    script.onerror = () => {
        console.error(`Failed to load ${gameName} game`);
        showGameError(gameName);
    };
    document.head.appendChild(script);
}

function showGameError(gameName) {
    document.getElementById('game-container').innerHTML = `
        <h2>Game Coming Soon</h2>
        <p>The ${gameName} game is under development.</p>
        <p style="margin-top: 20px;">
            <button onclick="goHome()" style="padding: 10px 20px; background: white; border: 2px solid black; cursor: pointer;">
                Back to Home
            </button>
        </p>
    `;
}

function showComingSoon(gameName) {
    const game = games.find(g => g.id === gameName);
    document.getElementById('game-container').innerHTML = `
        <h2>🚧 Coming Soon 🚧</h2>
        <h3>${game ? game.name : gameName}</h3>
        <p style="font-size: 18px; margin: 20px 0; color: #666;">This exciting game is currently under development!</p>
        <p style="margin: 20px 0;">Stay tuned for updates. We're working hard to bring you an amazing gaming experience.</p>
        <p style="margin-top: 30px;">
            <button onclick="goHome()" style="padding: 15px 30px; background: white; border: 2px solid black; cursor: pointer; font-size: 16px;">
                ← Back to Home
            </button>
        </p>
    `;
}

function goHome() {
    window.location.hash = '';
}

function showHomepage() {
    const gameCards = games.map(game => `
        <div class="game-card" onclick="navigateToGame('${game.id}')">
            <h2>${game.name}</h2>
            <p>${game.description}</p>
        </div>
    `).join('');
    
    document.body.innerHTML = `
        <div class="container">
            <header>
                <h1>Games</h1>
                <p>Choose your game</p>
            </header>
            
            <main>
                <div class="games-grid">
                    ${gameCards}
                </div>
            </main>
            
            <footer>
                <p>&copy; 2024 Games</p>
            </footer>
        </div>
    `;
}

// Initialize routing when page loads
document.addEventListener('DOMContentLoaded', function() {
    handleRoute();
}); 