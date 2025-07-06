// Snake Game - Modular Implementation
(function() {
    // Initialize the game when this script loads
    window.initializeGame = function() {
        showSnakeGame();
    };
    
    function showSnakeGame() {
        document.getElementById('game-container').innerHTML = `
            <div style="text-align: center;">
                <h2>Snake Game</h2>
                <div style="margin-bottom: 20px;">
                    <span style="font-size: 1.5rem; font-weight: bold;">Score: <span id="snakeScore">0</span></span>
                    <span style="margin-left: 40px; font-size: 1.2rem;" id="snakeStatus">Use arrow keys to play</span>
                </div>
                <canvas id="snakeCanvas" width="400" height="400" style="border: 2px solid black; background: white;"></canvas>
                <div style="margin-top: 20px;">
                    <button onclick="restartSnake()" style="padding: 10px 20px; background: white; border: 2px solid black; cursor: pointer; margin-right: 10px;">
                        Restart Game
                    </button>
                    <button onclick="goHome()" style="padding: 10px 20px; background: white; border: 2px solid black; cursor: pointer;">
                        Back to Home
                    </button>
                </div>
            </div>
        `;
        
        initSnakeGame();
    }
    
    let snake, food, gameState, gameRunning;
    
    function initSnakeGame() {
        const canvas = document.getElementById('snakeCanvas');
        const ctx = canvas.getContext('2d');
        const scoreElement = document.getElementById('snakeScore');
        const statusElement = document.getElementById('snakeStatus');
        
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
                if (this.direction.x === 0 && this.direction.y === 0) return;
                
                // Update direction
                this.direction = { ...this.newDirection };
                
                // Move snake
                const head = { ...this.body[0] };
                head.x += this.direction.x * GRID_SIZE;
                head.y += this.direction.y * GRID_SIZE;
                
                this.body.unshift(head);
                
                // Check if food eaten
                if (head.x === food.x && head.y === food.y) {
                    gameState.score++;
                    scoreElement.textContent = gameState.score;
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
        
        // Game state
        gameState = {
            score: 0,
            gameOver: false
        };
        
        // Initialize game objects
        snake = new Snake();
        food = new Food();
        gameRunning = true;
        
        // Game loop
        function gameLoop() {
            if (!gameRunning) return;
            
            snake.update();
            
            if (snake.checkCollision()) {
                gameState.gameOver = true;
                statusElement.textContent = 'Game Over! Press Restart to play again';
                gameRunning = false;
                return;
            }
            
            // Clear canvas
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
            
            // Draw game elements
            snake.draw();
            food.draw();
            
            setTimeout(gameLoop, 150);
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
    
    // Global restart function
    window.restartSnake = function() {
        initSnakeGame();
        document.getElementById('snakeScore').textContent = '0';
        document.getElementById('snakeStatus').textContent = 'Use arrow keys to play';
    };
    
    // Auto-initialize when script loads
    if (window.initializeGame) {
        window.initializeGame();
    }
})(); 