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
    if (gameName === 'snake') {
        loadSnakeGame();
    } else {
        // Show placeholder for other games
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
}

function goHome() {
    window.location.href = '/';
}

// Snake Game Implementation
function loadSnakeGame() {
    document.body.innerHTML = `
        <div class="container">
            <header>
                <h1>Snake</h1>
                <button onclick="goHome()" style="padding: 10px 20px; background: white; border: 2px solid black; cursor: pointer; margin-bottom: 20px;">
                    Back to Home
                </button>
            </header>
            <main style="display: flex; flex-direction: column; align-items: center; min-height: 400px;">
                <div style="margin-bottom: 20px;">
                    <span style="font-size: 1.5rem; font-weight: bold;">Score: <span id="score">0</span></span>
                    <span style="margin-left: 40px; font-size: 1.2rem;" id="gameStatus">Use arrow keys to play</span>
                </div>
                <canvas id="gameCanvas" width="400" height="400" style="border: 2px solid black; background: white;"></canvas>
                <div style="margin-top: 20px;">
                    <button id="restartBtn" onclick="restartSnake()" style="padding: 10px 20px; background: white; border: 2px solid black; cursor: pointer;">
                        Restart Game
                    </button>
                </div>
            </main>
        </div>
    `;
    
    initSnakeGame();
}

let snake, food, game, gameRunning;

function initSnakeGame() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('score');
    const statusElement = document.getElementById('gameStatus');
    
    const GRID_SIZE = 20;
    const CANVAS_SIZE = 400;
    
    // Snake class
    class Snake {
        constructor() {
            this.body = [{ x: 200, y: 200 }];
            this.direction = { x: 0, y: 0 };
            this.newDirection = { x: 0, y: 0 };
        }
        
        update() {
            // Update direction
            this.direction = { ...this.newDirection };
            
            // Move snake
            const head = { ...this.body[0] };
            head.x += this.direction.x * GRID_SIZE;
            head.y += this.direction.y * GRID_SIZE;
            
            this.body.unshift(head);
            
            // Check if food eaten
            if (head.x === food.x && head.y === food.y) {
                game.score++;
                scoreElement.textContent = game.score;
                food.generateNew();
            } else {
                this.body.pop();
            }
        }
        
        draw() {
            ctx.fillStyle = 'black';
            this.body.forEach(segment => {
                ctx.fillRect(segment.x, segment.y, GRID_SIZE - 2, GRID_SIZE - 2);
            });
        }
        
        checkCollision() {
            const head = this.body[0];
            
            // Wall collision
            if (head.x < 0 || head.x >= CANVAS_SIZE || head.y < 0 || head.y >= CANVAS_SIZE) {
                return true;
            }
            
            // Self collision
            for (let i = 1; i < this.body.length; i++) {
                if (head.x === this.body[i].x && head.y === this.body[i].y) {
                    return true;
                }
            }
            
            return false;
        }
        
        changeDirection(newDirection) {
            // Prevent reverse direction
            if (this.direction.x === -newDirection.x && this.direction.y === -newDirection.y) {
                return;
            }
            this.newDirection = newDirection;
        }
    }
    
    // Food class
    class Food {
        constructor() {
            this.generateNew();
        }
        
        generateNew() {
            this.x = Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE)) * GRID_SIZE;
            this.y = Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE)) * GRID_SIZE;
            
            // Make sure food doesn't spawn on snake
            while (this.isOnSnake()) {
                this.x = Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE)) * GRID_SIZE;
                this.y = Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE)) * GRID_SIZE;
            }
        }
        
        isOnSnake() {
            return snake.body.some(segment => segment.x === this.x && segment.y === this.y);
        }
        
        draw() {
            ctx.fillStyle = 'black';
            ctx.fillRect(this.x + 2, this.y + 2, GRID_SIZE - 4, GRID_SIZE - 4);
        }
    }
    
    // Game class
    class Game {
        constructor() {
            this.score = 0;
            this.gameOver = false;
        }
        
        update() {
            if (this.gameOver) return;
            
            snake.update();
            
            if (snake.checkCollision()) {
                this.gameOver = true;
                statusElement.textContent = 'Game Over! Press Restart to play again';
                gameRunning = false;
            }
        }
        
        draw() {
            // Clear canvas
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
            
            // Draw game elements
            snake.draw();
            food.draw();
        }
    }
    
    // Initialize game objects
    snake = new Snake();
    food = new Food();
    game = new Game();
    gameRunning = true;
    
    // Game loop
    function gameLoop() {
        game.update();
        game.draw();
        
        if (gameRunning) {
            setTimeout(gameLoop, 150);
        }
    }
    
    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        if (!gameRunning) return;
        
        switch(e.key) {
            case 'ArrowUp':
                e.preventDefault();
                snake.changeDirection({ x: 0, y: -1 });
                break;
            case 'ArrowDown':
                e.preventDefault();
                snake.changeDirection({ x: 0, y: 1 });
                break;
            case 'ArrowLeft':
                e.preventDefault();
                snake.changeDirection({ x: -1, y: 0 });
                break;
            case 'ArrowRight':
                e.preventDefault();
                snake.changeDirection({ x: 1, y: 0 });
                break;
        }
    });
    
    // Start game
    gameLoop();
}

function restartSnake() {
    initSnakeGame();
    document.getElementById('score').textContent = '0';
    document.getElementById('gameStatus').textContent = 'Use arrow keys to play';
}

// Initialize routing when page loads
document.addEventListener('DOMContentLoaded', function() {
    handleRoute();
}); 