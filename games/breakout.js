// Breakout Game - Modular Implementation
(function() {
    // Initialize the game when this script loads
    window.initializeGame = function() {
        showBreakoutGame();
    };
    
    function showBreakoutGame() {
        document.getElementById('game-container').innerHTML = `
            <div style="text-align: center;">
                <h2>Breakout Game</h2>
                <div style="margin-bottom: 20px;">
                    <span style="font-size: 1.5rem; font-weight: bold;">Score: <span id="breakoutScore">0</span></span>
                    <span style="margin-left: 40px; font-size: 1.5rem; font-weight: bold;">Lives: <span id="breakoutLives">3</span></span>
                </div>
                <canvas id="breakoutCanvas" width="600" height="400" style="border: 2px solid black; background: white;"></canvas>
                <div style="margin-top: 20px;">
                    <button onclick="restartBreakout()" style="padding: 10px 20px; background: white; border: 2px solid black; cursor: pointer; margin-right: 10px;">
                        Restart Game
                    </button>
                    <button onclick="goHome()" style="padding: 10px 20px; background: white; border: 2px solid black; cursor: pointer;">
                        Back to Home
                    </button>
                </div>
                <div style="margin-top: 10px;">
                    <p style="font-size: 0.9rem;">Controls: Arrow Keys or A/D to move paddle</p>
                </div>
            </div>
        `;
        
        initBreakoutGame();
    }
    
    let breakoutGame, breakoutRunning;
    
    function initBreakoutGame() {
        const canvas = document.getElementById('breakoutCanvas');
        const ctx = canvas.getContext('2d');
        
        // Simple placeholder implementation
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, 600, 400);
        
        ctx.fillStyle = 'black';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Breakout Game Loading...', 300, 200);
        
        breakoutRunning = true;
        
        // Update scores
        document.getElementById('breakoutScore').textContent = '0';
        document.getElementById('breakoutLives').textContent = '3';
        
        // Basic demo - just show placeholder
        setTimeout(() => {
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, 600, 400);
            
            ctx.fillStyle = 'black';
            ctx.fillText('Breakout Game Ready!', 300, 180);
            ctx.fillText('Use arrow keys to play', 300, 210);
            ctx.fillText('(Full game coming soon)', 300, 240);
        }, 1000);
    }
    
    // Global restart function
    window.restartBreakout = function() {
        initBreakoutGame();
    };
    
    // Auto-initialize when script loads
    if (window.initializeGame) {
        window.initializeGame();
    }
})(); 