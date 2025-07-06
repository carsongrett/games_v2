// Navigation function for games
function navigateToGame(gameName) {
    // Change URL to /home/gamename format
    window.location.href = `/home/${gameName}`;
}

// Handle back navigation and URL routing
window.addEventListener('popstate', function(event) {
    handleRoute();
});

function handleRoute() {
    const path = window.location.pathname;
    
    // Check if we're on a game page
    if (path.startsWith('/home/') && path !== '/home/') {
        const gameName = path.split('/home/')[1];
        loadGame(gameName);
    }
}

function loadGame(gameName) {
    // This function will be expanded when individual games are created
    // For now, just show a placeholder
    document.body.innerHTML = `
        <div class="container">
            <header>
                <h1>${gameName.charAt(0).toUpperCase() + gameName.slice(1)}</h1>
                <button onclick="goHome()" style="padding: 10px 20px; background: white; border: 2px solid black; cursor: pointer;">
                    Back to Home
                </button>
            </header>
            <main style="display: flex; justify-content: center; align-items: center; min-height: 400px;">
                <div style="text-align: center; border: 2px solid black; padding: 40px;">
                    <h2>Game Coming Soon</h2>
                    <p>The ${gameName} game will be built here.</p>
                </div>
            </main>
        </div>
    `;
}

function goHome() {
    window.location.href = '/';
}

// Initialize routing when page loads
document.addEventListener('DOMContentLoaded', function() {
    handleRoute();
}); 