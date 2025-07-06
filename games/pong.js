// Pong Game - Modular Implementation
(function() {
    // Initialize the game when this script loads
    window.initializeGame = function() {
        showPongGame();
    };
    
    function showPongGame() {
        document.getElementById('game-container').innerHTML = `
            <div style="text-align: center;">
                <h2>Pong Game</h2>
                <div style="margin-bottom: 20px;">
                    <span style="font-size: 1.5rem; font-weight: bold;">Player: <span id="playerScore">0</span></span>
                    <span style="margin-left: 40px; font-size: 1.2rem;">First to 5 wins!</span>
                    <span style="margin-left: 40px; font-size: 1.5rem; font-weight: bold;">AI: <span id="aiScore">0</span></span>
                </div>
                <canvas id="pongCanvas" width="500" height="300" style="border: 2px solid black; background: white;"></canvas>
                <div style="margin-top: 20px;">
                    <button onclick="restartPong()" style="padding: 10px 20px; background: white; border: 2px solid black; cursor: pointer; margin-right: 10px;">
                        Restart Game
                    </button>
                    <button onclick="goHome()" style="padding: 10px 20px; background: white; border: 2px solid black; cursor: pointer;">
                        Back to Home
                    </button>
                </div>
                <div style="margin-top: 10px;">
                    <p style="font-size: 0.9rem;">Controls: W/S keys to move paddle up/down</p>
                </div>
            </div>
        `;
        
        initPongGame();
    }
    
    let pongGame, pongRunning;
    
    function initPongGame() {
        const canvas = document.getElementById('pongCanvas');
        const ctx = canvas.getContext('2d');
        
        // Simple placeholder implementation
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, 500, 300);
        
        ctx.fillStyle = 'black';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Pong Game Loading...', 250, 150);
        
        pongRunning = true;
        
        // Update scores
        document.getElementById('playerScore').textContent = '0';
        document.getElementById('aiScore').textContent = '0';
        
        // Basic demo - just show placeholder
        setTimeout(() => {
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, 500, 300);
            
            ctx.fillStyle = 'black';
            ctx.fillText('Pong Game Ready!', 250, 120);
            ctx.fillText('Press W/S to play', 250, 150);
            ctx.fillText('(Full game coming soon)', 250, 180);
        }, 1000);
    }
    
    // Global restart function
    window.restartPong = function() {
        initPongGame();
    };
    
    // Auto-initialize when script loads
    if (window.initializeGame) {
        window.initializeGame();
    }
})(); 