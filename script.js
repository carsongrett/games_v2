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

function loadGame(gameName) {
    if (gameName === 'snake') {
        loadSnakeGame();
    } else if (gameName === 'pong') {
        loadPongGame();
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
    window.location.hash = '';
}

function showHomepage() {
    document.body.innerHTML = `
        <div class="container">
            <header>
                <h1>Games Hub</h1>
                <p>Choose your game</p>
            </header>
            
            <main>
                <div class="games-grid">
                    <div class="game-card" onclick="navigateToGame('snake')">
                        <h2>Snake</h2>
                        <p>Classic snake game</p>
                    </div>
                    
                    <div class="game-card" onclick="navigateToGame('tetris')">
                        <h2>Tetris</h2>
                        <p>Block puzzle game</p>
                    </div>
                    
                    <div class="game-card" onclick="navigateToGame('pong')">
                        <h2>Pong</h2>
                        <p>Retro paddle game</p>
                    </div>
                    
                    <div class="game-card" onclick="navigateToGame('breakout')">
                        <h2>Breakout</h2>
                        <p>Brick breaking game</p>
                    </div>
                    
                    <div class="game-card" onclick="navigateToGame('memory')">
                        <h2>Memory</h2>
                        <p>Card matching game</p>
                    </div>
                </div>
            </main>
            
            <footer>
                <p>&copy; 2024 Games Hub</p>
            </footer>
        </div>
    `;
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

// Pong Game Implementation
function loadPongGame() {
    document.body.innerHTML = `
        <div class="container">
            <header>
                <h1>Pong</h1>
                <button onclick="goHome()" style="padding: 10px 20px; background: white; border: 2px solid black; cursor: pointer; margin-bottom: 20px;">
                    Back to Home
                </button>
            </header>
            <main style="display: flex; flex-direction: column; align-items: center; min-height: 400px;">
                <div style="margin-bottom: 20px; display: flex; justify-content: space-between; width: 500px;">
                    <div style="text-align: center;">
                        <span style="font-size: 1.5rem; font-weight: bold;">Player: <span id="playerScore">0</span></span>
                    </div>
                    <div style="text-align: center;">
                        <span style="font-size: 1.2rem;" id="pongStatus">Press W/S to move. First to 5 wins!</span>
                    </div>
                    <div style="text-align: center;">
                        <span style="font-size: 1.5rem; font-weight: bold;">AI: <span id="aiScore">0</span></span>
                    </div>
                </div>
                <canvas id="pongCanvas" width="500" height="300" style="border: 2px solid black; background: white;"></canvas>
                <div style="margin-top: 20px;">
                    <button id="restartPongBtn" onclick="restartPong()" style="padding: 10px 20px; background: white; border: 2px solid black; cursor: pointer;">
                        Restart Game
                    </button>
                </div>
                <div style="margin-top: 10px; text-align: center;">
                    <p style="font-size: 0.9rem;">Controls: W/S keys to move paddle up/down</p>
                </div>
            </main>
        </div>
    `;
    
    initPongGame();
}

let pongGame, pongRunning;

function initPongGame() {
    const canvas = document.getElementById('pongCanvas');
    const ctx = canvas.getContext('2d');
    const playerScoreElement = document.getElementById('playerScore');
    const aiScoreElement = document.getElementById('aiScore');
    const statusElement = document.getElementById('pongStatus');
    
    const CANVAS_WIDTH = 500;
    const CANVAS_HEIGHT = 300;
    const PADDLE_WIDTH = 10;
    const PADDLE_HEIGHT = 60;
    const BALL_SIZE = 8;
    
    // Game objects
    class Paddle {
        constructor(x, y, isPlayer = false) {
            this.x = x;
            this.y = y;
            this.width = PADDLE_WIDTH;
            this.height = PADDLE_HEIGHT;
            this.speed = 5;
            this.isPlayer = isPlayer;
        }
        
        update() {
            // AI paddle logic
            if (!this.isPlayer) {
                const ballCenter = pongGame.ball.y + BALL_SIZE / 2;
                const paddleCenter = this.y + this.height / 2;
                
                if (ballCenter < paddleCenter - 10) {
                    this.y -= this.speed * 0.7; // AI is slightly slower
                } else if (ballCenter > paddleCenter + 10) {
                    this.y += this.speed * 0.7;
                }
            }
            
            // Keep paddle within bounds
            if (this.y < 0) this.y = 0;
            if (this.y > CANVAS_HEIGHT - this.height) {
                this.y = CANVAS_HEIGHT - this.height;
            }
        }
        
        draw() {
            ctx.fillStyle = 'black';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
        
        moveUp() {
            if (this.isPlayer) {
                this.y -= this.speed;
            }
        }
        
        moveDown() {
            if (this.isPlayer) {
                this.y += this.speed;
            }
        }
    }
    
    class Ball {
        constructor() {
            this.reset();
        }
        
        reset() {
            this.x = CANVAS_WIDTH / 2;
            this.y = CANVAS_HEIGHT / 2;
            this.speedX = Math.random() > 0.5 ? 3 : -3;
            this.speedY = (Math.random() - 0.5) * 4;
            this.size = BALL_SIZE;
        }
        
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            
            // Ball collision with top and bottom walls
            if (this.y <= 0 || this.y >= CANVAS_HEIGHT - this.size) {
                this.speedY = -this.speedY;
            }
            
            // Ball collision with paddles
            if (this.x <= pongGame.playerPaddle.x + pongGame.playerPaddle.width &&
                this.x >= pongGame.playerPaddle.x &&
                this.y <= pongGame.playerPaddle.y + pongGame.playerPaddle.height &&
                this.y >= pongGame.playerPaddle.y) {
                this.speedX = -this.speedX;
                this.speedX *= 1.05; // Slight speed increase
                // Add angle based on where ball hits paddle
                const paddleCenter = pongGame.playerPaddle.y + pongGame.playerPaddle.height / 2;
                this.speedY += (this.y - paddleCenter) * 0.1;
            }
            
            if (this.x >= pongGame.aiPaddle.x - this.size &&
                this.x <= pongGame.aiPaddle.x + pongGame.aiPaddle.width &&
                this.y <= pongGame.aiPaddle.y + pongGame.aiPaddle.height &&
                this.y >= pongGame.aiPaddle.y) {
                this.speedX = -this.speedX;
                this.speedX *= 1.05; // Slight speed increase
                // Add angle based on where ball hits paddle
                const paddleCenter = pongGame.aiPaddle.y + pongGame.aiPaddle.height / 2;
                this.speedY += (this.y - paddleCenter) * 0.1;
            }
            
            // Ball goes off screen - scoring
            if (this.x < 0) {
                pongGame.aiScore++;
                aiScoreElement.textContent = pongGame.aiScore;
                this.reset();
                pongGame.checkGameOver();
            } else if (this.x > CANVAS_WIDTH) {
                pongGame.playerScore++;
                playerScoreElement.textContent = pongGame.playerScore;
                this.reset();
                pongGame.checkGameOver();
            }
        }
        
        draw() {
            ctx.fillStyle = 'black';
            ctx.fillRect(this.x, this.y, this.size, this.size);
        }
    }
    
    class PongGameClass {
        constructor() {
            this.playerScore = 0;
            this.aiScore = 0;
            this.gameOver = false;
            this.winner = null;
            
            // Create paddles
            this.playerPaddle = new Paddle(20, CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2, true);
            this.aiPaddle = new Paddle(CANVAS_WIDTH - 30, CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2, false);
            
            // Create ball
            this.ball = new Ball();
            
            // Input handling
            this.keys = {};
            this.setupInput();
        }
        
        setupInput() {
            document.addEventListener('keydown', (e) => {
                this.keys[e.key.toLowerCase()] = true;
                e.preventDefault();
            });
            
            document.addEventListener('keyup', (e) => {
                this.keys[e.key.toLowerCase()] = false;
                e.preventDefault();
            });
        }
        
        update() {
            if (this.gameOver) return;
            
            // Handle input
            if (this.keys['w']) {
                this.playerPaddle.moveUp();
            }
            if (this.keys['s']) {
                this.playerPaddle.moveDown();
            }
            
            // Update game objects
            this.playerPaddle.update();
            this.aiPaddle.update();
            this.ball.update();
        }
        
        draw() {
            // Clear canvas
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            
            // Draw center line
            ctx.strokeStyle = 'black';
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(CANVAS_WIDTH / 2, 0);
            ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
            ctx.stroke();
            ctx.setLineDash([]);
            
            // Draw game objects
            this.playerPaddle.draw();
            this.aiPaddle.draw();
            this.ball.draw();
        }
        
        checkGameOver() {
            if (this.playerScore >= 5) {
                this.gameOver = true;
                this.winner = 'Player';
                statusElement.textContent = 'You Win! Press Restart to play again';
                pongRunning = false;
            } else if (this.aiScore >= 5) {
                this.gameOver = true;
                this.winner = 'AI';
                statusElement.textContent = 'AI Wins! Press Restart to play again';
                pongRunning = false;
            }
        }
    }
    
    // Initialize game
    pongGame = new PongGameClass();
    pongRunning = true;
    
    // Game loop
    function gameLoop() {
        pongGame.update();
        pongGame.draw();
        
        if (pongRunning) {
            requestAnimationFrame(gameLoop);
        }
    }
    
    // Start game
    gameLoop();
}

function restartPong() {
    initPongGame();
    document.getElementById('playerScore').textContent = '0';
    document.getElementById('aiScore').textContent = '0';
    document.getElementById('pongStatus').textContent = 'Press W/S to move. First to 5 wins!';
}

// Initialize routing when page loads
document.addEventListener('DOMContentLoaded', function() {
    handleRoute();
}); 