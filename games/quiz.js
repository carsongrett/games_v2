// General Quiz Game - Modular Implementation
(function() {
    // Initialize the game when this script loads
    window.initializeGame = function() {
        showQuizGame();
    };
    
    function showQuizGame() {
        document.getElementById('game-container').innerHTML = `
            <div style="text-align: center; max-width: 600px;">
                <h2>General Quiz</h2>
                <div style="margin-bottom: 20px;">
                    <span style="font-size: 1.5rem; font-weight: bold;">Score: <span id="quizScore">0</span></span>
                    <span style="margin-left: 40px; font-size: 1.2rem;">Question <span id="questionNumber">1</span> of 10</span>
                </div>
                <div id="quizContent" style="border: 2px solid black; padding: 30px; background: white;">
                    <div id="questionText" style="font-size: 1.3rem; margin-bottom: 30px; font-weight: bold;">
                        Loading quiz questions...
                    </div>
                    <div id="answersContainer" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        <!-- Answers will be loaded here -->
                    </div>
                </div>
                <div style="margin-top: 20px;">
                    <button onclick="restartQuiz()" style="padding: 10px 20px; background: white; border: 2px solid black; cursor: pointer; margin-right: 10px;">
                        Restart Quiz
                    </button>
                    <button onclick="goHome()" style="padding: 10px 20px; background: white; border: 2px solid black; cursor: pointer;">
                        Back to Home
                    </button>
                </div>
            </div>
        `;
        
        initQuizGame();
    }
    
    let quizGame;
    
    function initQuizGame() {
        // This would load from a CSV file or API in the future
        document.getElementById('questionText').textContent = 'Quiz system loading...';
        document.getElementById('quizScore').textContent = '0';
        document.getElementById('questionNumber').textContent = '1';
        
        // Simulate loading questions
        setTimeout(() => {
            document.getElementById('questionText').textContent = 'Quiz questions will be loaded from external data source';
            document.getElementById('answersContainer').innerHTML = `
                <div style="padding: 15px; background: #f0f0f0; border: 2px solid black; text-align: center;">
                    <p>External data integration coming soon!</p>
                    <p>Questions will be loaded from:</p>
                    <p>• CSV files</p>
                    <p>• APIs</p>
                    <p>• JSON data</p>
                </div>
            `;
        }, 1000);
    }
    
    // Global restart function
    window.restartQuiz = function() {
        initQuizGame();
    };
    
    // Auto-initialize when script loads
    if (window.initializeGame) {
        window.initializeGame();
    }
})(); 