// Game categories data structure
const gameCategories = {
    keyboard: {
        name: "Keyboard Games",
        games: [
            { id: "snake", name: "Snake", description: "Classic snake game" },
            { id: "pong", name: "Pong", description: "Retro paddle game" },
            { id: "breakout", name: "Breakout", description: "Brick breaking game" }
        ]
    },
    puzzle: {
        name: "Puzzle Games",
        games: [
            { id: "tetris", name: "Tetris", description: "Block puzzle game" },
            { id: "memory", name: "Memory", description: "Card matching game" }
        ]
    }
};

// Navigation function for games
function navigateToGame(gameName) {
    // Change URL to #/home/gamename format (hash routing)
    window.location.hash = `/home/${gameName}`;
}

// Navigation function for categories
function navigateToCategory(categoryName) {
    window.location.hash = `/category/${categoryName}`;
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
    } else if (hash.startsWith('#/category/') && hash !== '#/category/') {
        const categoryName = hash.split('#/category/')[1];
        showCategory(categoryName);
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
    } else if (gameName === 'breakout') {
        loadBreakoutGame();
    } else {
        // Show placeholder for other games
        const gameCategory = findGameCategory(gameName);
        const categoryButton = gameCategory ? 
            `<button onclick="navigateToCategory('${gameCategory}')" style="padding: 10px 20px; background: white; border: 2px solid black; cursor: pointer;">
                Back to ${gameCategories[gameCategory].name}
            </button>` : '';
        
        document.body.innerHTML = `
            <div class="container">
                <header>
                    <h1>${gameName.charAt(0).toUpperCase() + gameName.slice(1)}</h1>
                    <div style="margin-bottom: 20px;">
                        <button onclick="goHome()" style="padding: 10px 20px; background: white; border: 2px solid black; cursor: pointer; margin-right: 10px;">
                            Back to Home
                        </button>
                        ${categoryButton}
                    </div>
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

// Helper function to find which category a game belongs to
function findGameCategory(gameName) {
    for (const [categoryKey, category] of Object.entries(gameCategories)) {
        if (category.games.some(game => game.id === gameName)) {
            return categoryKey;
        }
    }
    return null;
}

function goHome() {
    window.location.hash = '';
}

function showHomepage() {
    document.body.innerHTML = `
        <div class="container">
            <header>
                <h1>Games Hub</h1>
                <p>Choose your category</p>
            </header>
            
            <main>
                <div class="games-grid">
                    <div class="game-card" onclick="navigateToCategory('keyboard')">
                        <h2>Keyboard Games</h2>
                        <p>Classic action games</p>
                    </div>
                    
                    <div class="game-card" onclick="navigateToCategory('puzzle')">
                        <h2>Puzzle Games</h2>
                        <p>Brain teasing challenges</p>
                    </div>
                </div>
            </main>
            
            <footer>
                <p>&copy; 2024 Games Hub</p>
            </footer>
        </div>
    `;
}

function showCategory(categoryName) {
    const category = gameCategories[categoryName];
    
    if (!category) {
        // Category not found, redirect to homepage
        window.location.hash = '';
        return;
    }
    
    const gameCards = category.games.map(game => `
        <div class="game-card" onclick="navigateToGame('${game.id}')">
            <h2>${game.name}</h2>
            <p>${game.description}</p>
        </div>
    `).join('');
    
    document.body.innerHTML = `
        <div class="container">
            <header>
                <h1>${category.name}</h1>
                <button onclick="goHome()" style="padding: 10px 20px; background: white; border: 2px solid black; cursor: pointer; margin-bottom: 20px;">
                    Back to Home
                </button>
            </header>
            
            <main>
                <div class="games-grid">
                    ${gameCards}
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
                <div style="margin-bottom: 20px;">
                    <button onclick="goHome()" style="padding: 10px 20px; background: white; border: 2px solid black; cursor: pointer; margin-right: 10px;">
                        Back to Home
                    </button>
                    <button onclick="navigateToCategory('keyboard')" style="padding: 10px 20px; background: white; border: 2px solid black; cursor: pointer;">
                        Back to Keyboard
                    </button>
                </div>
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
                <div style="margin-bottom: 20px;">
                    <button onclick="goHome()" style="padding: 10px 20px; background: white; border: 2px solid black; cursor: pointer; margin-right: 10px;">
                        Back to Home
                    </button>
                    <button onclick="navigateToCategory('keyboard')" style="padding: 10px 20px; background: white; border: 2px solid black; cursor: pointer;">
                        Back to Keyboard
                    </button>
                </div>
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

// Breakout Game Implementation
function loadBreakoutGame() {
    document.body.innerHTML = `
        <div class="container">
            <header>
                <h1>Breakout</h1>
                <div style="margin-bottom: 20px;">
                    <button onclick="goHome()" style="padding: 10px 20px; background: white; border: 2px solid black; cursor: pointer; margin-right: 10px;">
                        Back to Home
                    </button>
                    <button onclick="navigateToCategory('keyboard')" style="padding: 10px 20px; background: white; border: 2px solid black; cursor: pointer;">
                        Back to Keyboard
                    </button>
                </div>
            </header>
            <main style="display: flex; flex-direction: column; align-items: center; min-height: 400px;">
                <div style="margin-bottom: 20px; display: flex; justify-content: space-between; width: 600px;">
                    <div style="text-align: center;">
                        <span style="font-size: 1.5rem; font-weight: bold;">Score: <span id="breakoutScore">0</span></span>
                    </div>
                    <div style="text-align: center;">
                        <span style="font-size: 1.2rem;" id="breakoutStatus">Use arrow keys or A/D to move paddle</span>
                    </div>
                    <div style="text-align: center;">
                        <span style="font-size: 1.5rem; font-weight: bold;">Lives: <span id="breakoutLives">3</span></span>
                    </div>
                </div>
                <canvas id="breakoutCanvas" width="600" height="400" style="border: 2px solid black; background: white;"></canvas>
                <div style="margin-top: 20px;">
                    <button id="restartBreakoutBtn" onclick="restartBreakout()" style="padding: 10px 20px; background: white; border: 2px solid black; cursor: pointer;">
                        Restart Game
                    </button>
                </div>
                <div style="margin-top: 10px; text-align: center;">
                    <p style="font-size: 0.9rem;">Controls: Arrow Keys or A/D to move paddle</p>
                </div>
            </main>
        </div>
    `;
    
    initBreakoutGame();
}

let breakoutGame, breakoutRunning;

function initBreakoutGame() {
    const canvas = document.getElementById('breakoutCanvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('breakoutScore');
    const livesElement = document.getElementById('breakoutLives');
    const statusElement = document.getElementById('breakoutStatus');
    
    const CANVAS_WIDTH = 600;
    const CANVAS_HEIGHT = 400;
    const PADDLE_WIDTH = 80;
    const PADDLE_HEIGHT = 10;
    const BALL_SIZE = 8;
    const BRICK_WIDTH = 60;
    const BRICK_HEIGHT = 20;
    const BRICK_ROWS = 5;
    const BRICK_COLS = 9;
    
    // Paddle class
    class Paddle {
        constructor() {
            this.width = PADDLE_WIDTH;
            this.height = PADDLE_HEIGHT;
            this.x = CANVAS_WIDTH / 2 - this.width / 2;
            this.y = CANVAS_HEIGHT - 30;
            this.speed = 8;
        }
        
        update() {
            // Keep paddle within bounds
            if (this.x < 0) this.x = 0;
            if (this.x > CANVAS_WIDTH - this.width) {
                this.x = CANVAS_WIDTH - this.width;
            }
        }
        
        draw() {
            ctx.fillStyle = 'black';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
        
        moveLeft() {
            this.x -= this.speed;
        }
        
        moveRight() {
            this.x += this.speed;
        }
    }
    
    // Ball class
    class Ball {
        constructor() {
            this.reset();
        }
        
        reset() {
            this.x = CANVAS_WIDTH / 2;
            this.y = CANVAS_HEIGHT - 60;
            this.speedX = (Math.random() - 0.5) * 4;
            this.speedY = -4;
            this.size = BALL_SIZE;
        }
        
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            
            // Ball collision with walls
            if (this.x <= 0 || this.x >= CANVAS_WIDTH - this.size) {
                this.speedX = -this.speedX;
            }
            if (this.y <= 0) {
                this.speedY = -this.speedY;
            }
            
            // Ball collision with paddle
            if (this.x <= breakoutGame.paddle.x + breakoutGame.paddle.width &&
                this.x >= breakoutGame.paddle.x &&
                this.y <= breakoutGame.paddle.y + breakoutGame.paddle.height &&
                this.y >= breakoutGame.paddle.y) {
                this.speedY = -this.speedY;
                // Add angle based on where ball hits paddle
                const paddleCenter = breakoutGame.paddle.x + breakoutGame.paddle.width / 2;
                this.speedX += (this.x - paddleCenter) * 0.1;
                // Limit speed
                this.speedX = Math.max(-6, Math.min(6, this.speedX));
            }
            
            // Ball collision with bricks
            for (let i = 0; i < breakoutGame.bricks.length; i++) {
                const brick = breakoutGame.bricks[i];
                if (this.x <= brick.x + brick.width &&
                    this.x >= brick.x &&
                    this.y <= brick.y + brick.height &&
                    this.y >= brick.y) {
                    this.speedY = -this.speedY;
                    breakoutGame.bricks.splice(i, 1);
                    breakoutGame.score += 10;
                    scoreElement.textContent = breakoutGame.score;
                    break;
                }
            }
            
            // Ball goes off bottom - lose life
            if (this.y > CANVAS_HEIGHT) {
                breakoutGame.lives--;
                livesElement.textContent = breakoutGame.lives;
                if (breakoutGame.lives <= 0) {
                    breakoutGame.gameOver = true;
                    statusElement.textContent = 'Game Over! Press Restart to play again';
                    breakoutRunning = false;
                } else {
                    this.reset();
                    statusElement.textContent = 'Life lost! Use arrow keys to move paddle';
                }
            }
        }
        
        draw() {
            ctx.fillStyle = 'black';
            ctx.fillRect(this.x, this.y, this.size, this.size);
        }
    }
    
    // Brick class
    class Brick {
        constructor(x, y, row) {
            this.x = x;
            this.y = y;
            this.width = BRICK_WIDTH;
            this.height = BRICK_HEIGHT;
            this.row = row;
        }
        
        draw() {
            ctx.fillStyle = 'black';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            // Draw brick outline
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x, this.y, this.width, this.height);
        }
    }
    
    // Game class
    class BreakoutGameClass {
        constructor() {
            this.score = 0;
            this.lives = 3;
            this.gameOver = false;
            this.gameWon = false;
            
            // Create paddle
            this.paddle = new Paddle();
            
            // Create ball
            this.ball = new Ball();
            
            // Create bricks
            this.bricks = [];
            this.createBricks();
            
            // Input handling
            this.keys = {};
            this.setupInput();
        }
        
        createBricks() {
            const offsetX = (CANVAS_WIDTH - (BRICK_COLS * BRICK_WIDTH + (BRICK_COLS - 1) * 5)) / 2;
            const offsetY = 50;
            
            for (let row = 0; row < BRICK_ROWS; row++) {
                for (let col = 0; col < BRICK_COLS; col++) {
                    const x = offsetX + col * (BRICK_WIDTH + 5);
                    const y = offsetY + row * (BRICK_HEIGHT + 5);
                    this.bricks.push(new Brick(x, y, row));
                }
            }
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
             if (this.gameOver || this.gameWon) return;
             
             // Handle input - support both arrow keys and A/D keys
             if (this.keys['arrowleft'] || this.keys['a']) {
                 this.paddle.moveLeft();
             }
             if (this.keys['arrowright'] || this.keys['d']) {
                 this.paddle.moveRight();
             }
             
             // Update game objects
             this.paddle.update();
             this.ball.update();
             
             // Check win condition
             if (this.bricks.length === 0) {
                 this.gameWon = true;
                 statusElement.textContent = 'You Win! Press Restart to play again';
                 breakoutRunning = false;
             }
         }
        
        draw() {
            // Clear canvas
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            
            // Draw game objects
            this.paddle.draw();
            this.ball.draw();
            
            // Draw bricks
            this.bricks.forEach(brick => brick.draw());
        }
    }
    
    // Initialize game
    breakoutGame = new BreakoutGameClass();
    breakoutRunning = true;
    
    // Game loop
    function gameLoop() {
        breakoutGame.update();
        breakoutGame.draw();
        
        if (breakoutRunning) {
            requestAnimationFrame(gameLoop);
        }
    }
    
    // Start game
    gameLoop();
}

function restartBreakout() {
    initBreakoutGame();
    document.getElementById('breakoutScore').textContent = '0';
    document.getElementById('breakoutLives').textContent = '3';
    document.getElementById('breakoutStatus').textContent = 'Use arrow keys or A/D to move paddle';
}

// Initialize routing when page loads
document.addEventListener('DOMContentLoaded', function() {
    handleRoute();
}); 