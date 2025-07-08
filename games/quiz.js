// MLB Record Showdown - Compare 2025 Team Records

let gameState = {
    teams: [],
    currentQuestion: 1,
    totalQuestions: 10,
    score: 0,
    currentComparison: null,
    isLoading: false
};

// Game initialization
window.initializeGame = function() {
    setupGameUI();
    initializeGame();
};

function setupGameUI() {
    document.getElementById('game-container').innerHTML = `
        <div id="mlb-record-game">
            <div class="game-header">
                <h1>MLB Record Showdown</h1>
                <div class="game-info">
                    <span class="question-counter">Question <span id="current-question">1</span> of ${gameState.totalQuestions}</span>
                    <span class="score">Score: <span id="current-score">0</span>/${gameState.totalQuestions}</span>
                </div>
            </div>
            
            <div id="loading-screen" class="loading-screen">
                <div class="spinner"></div>
                <p>Loading 2025 MLB standings...</p>
            </div>
            
            <div id="game-content" class="game-content" style="display: none;">
                <div class="question-container">
                    <h2>Which team has a better record in 2025?</h2>
                    <p class="instruction">Choose the team with more wins (or better win % if tied)</p>
                </div>
                
                <div class="teams-comparison">
                    <div class="team-option" id="team-1-card" onclick="selectTeam(1)">
                        <div class="team-name" id="team-1-name"></div>
                        <div class="team-division" id="team-1-division"></div>
                    </div>
                    
                    <div class="vs-divider">VS</div>
                    
                    <div class="team-option" id="team-2-card" onclick="selectTeam(2)">
                        <div class="team-name" id="team-2-name"></div>
                        <div class="team-division" id="team-2-division"></div>
                    </div>
                </div>
                
                <div id="result-display" class="result-display" style="display: none;">
                    <div class="result-header">
                        <h3 id="result-message"></h3>
                    </div>
                    <div class="records-reveal">
                        <div class="team-record-box" id="team-1-record">
                            <h4 id="team-1-result-name"></h4>
                            <div class="record-stats">
                                <div class="wins-losses" id="team-1-record-text"></div>
                                <div class="win-pct" id="team-1-win-pct"></div>
                                <div class="games-back" id="team-1-games-back"></div>
                            </div>
                        </div>
                        <div class="team-record-box" id="team-2-record">
                            <h4 id="team-2-result-name"></h4>
                            <div class="record-stats">
                                <div class="wins-losses" id="team-2-record-text"></div>
                                <div class="win-pct" id="team-2-win-pct"></div>
                                <div class="games-back" id="team-2-games-back"></div>
                            </div>
                        </div>
                    </div>
                    <button id="next-question-btn" class="next-btn" onclick="nextQuestion()">Next Question</button>
                </div>
            </div>
            
            <div id="final-screen" class="final-screen" style="display: none;">
                <div class="final-content">
                    <h2>Game Complete!</h2>
                    <div class="final-score">
                        <h3>Final Score: <span id="final-score-display"></span></h3>
                        <p id="performance-message"></p>
                    </div>
                    <div class="final-buttons">
                        <button class="play-again-btn" onclick="playAgain()">Play Again</button>
                        <button class="home-btn" onclick="goHome()">Back to Home</button>
                    </div>
                </div>
            </div>
        </div>
        
        <style>
            #mlb-record-game {
                max-width: 900px;
                margin: 0 auto;
                padding: 20px;
                font-family: 'Arial', sans-serif;
            }
            
            .game-header {
                text-align: center;
                margin-bottom: 30px;
            }
            
            .game-header h1 {
                margin: 0 0 15px 0;
                color: #1a365d;
                font-size: 2.5em;
                font-weight: bold;
            }
            
            .game-info {
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: #f7fafc;
                padding: 15px 30px;
                border-radius: 12px;
                border: 2px solid #e2e8f0;
                max-width: 450px;
                margin: 0 auto;
            }
            
            .question-counter, .score {
                font-weight: bold;
                color: #2d3748;
                font-size: 1.1em;
            }
            
            .loading-screen {
                text-align: center;
                padding: 80px 20px;
            }
            
            .spinner {
                border: 4px solid #e2e8f0;
                border-top: 4px solid #3182ce;
                border-radius: 50%;
                width: 60px;
                height: 60px;
                animation: spin 1s linear infinite;
                margin: 0 auto 25px;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            .question-container {
                text-align: center;
                margin-bottom: 40px;
            }
            
            .question-container h2 {
                color: #2d3748;
                font-size: 1.8em;
                margin: 0 0 10px 0;
                font-weight: bold;
            }
            
            .instruction {
                color: #718096;
                font-size: 1.1em;
                margin: 0;
                font-style: italic;
            }
            
            .teams-comparison {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 30px;
                margin-bottom: 40px;
            }
            
            .team-option {
                flex: 1;
                background: white;
                border: 3px solid #e2e8f0;
                border-radius: 16px;
                padding: 35px 25px;
                text-align: center;
                cursor: pointer;
                transition: all 0.3s ease;
                min-height: 150px;
                display: flex;
                flex-direction: column;
                justify-content: center;
            }
            
            .team-option:hover {
                border-color: #3182ce;
                transform: translateY(-4px);
                box-shadow: 0 10px 30px rgba(49, 130, 206, 0.15);
            }
            
            .team-name {
                font-size: 1.5em;
                font-weight: bold;
                color: #1a365d;
                margin-bottom: 12px;
                line-height: 1.2;
            }
            
            .team-division {
                font-size: 1em;
                color: #718096;
                font-style: italic;
            }
            
            .vs-divider {
                font-size: 2.5em;
                font-weight: bold;
                color: #e53e3e;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
                flex-shrink: 0;
            }
            
            .result-display {
                background: #f7fafc;
                border: 2px solid #e2e8f0;
                border-radius: 16px;
                padding: 30px;
                margin-top: 30px;
            }
            
            .result-header h3 {
                text-align: center;
                margin: 0 0 25px 0;
                font-size: 1.6em;
            }
            
            .records-reveal {
                display: flex;
                justify-content: space-around;
                gap: 25px;
                margin-bottom: 30px;
            }
            
            .team-record-box {
                flex: 1;
                background: white;
                padding: 25px;
                border-radius: 12px;
                border: 2px solid #e2e8f0;
                text-align: center;
            }
            
            .team-record-box h4 {
                margin: 0 0 15px 0;
                color: #2d3748;
                font-size: 1.2em;
                font-weight: bold;
            }
            
            .record-stats {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            
            .wins-losses {
                font-size: 1.8em;
                font-weight: bold;
                color: #3182ce;
            }
            
            .win-pct {
                font-size: 1.2em;
                color: #4a5568;
            }
            
            .games-back {
                font-size: 1em;
                color: #718096;
                font-style: italic;
            }
            
            .next-btn {
                background: #48bb78;
                color: white;
                border: none;
                padding: 15px 35px;
                border-radius: 10px;
                font-size: 1.2em;
                font-weight: bold;
                cursor: pointer;
                display: block;
                margin: 0 auto;
                transition: background 0.3s ease;
            }
            
            .next-btn:hover {
                background: #38a169;
            }
            
            .final-screen {
                text-align: center;
                background: #f7fafc;
                border: 2px solid #e2e8f0;
                border-radius: 16px;
                padding: 50px;
                margin-top: 30px;
            }
            
            .final-content h2 {
                color: #1a365d;
                margin: 0 0 30px 0;
                font-size: 2.2em;
            }
            
            .final-score h3 {
                color: #3182ce;
                font-size: 2em;
                margin: 0 0 15px 0;
            }
            
            .final-score p {
                font-size: 1.3em;
                color: #4a5568;
                margin: 0 0 35px 0;
            }
            
            .final-buttons {
                display: flex;
                gap: 20px;
                justify-content: center;
            }
            
            .play-again-btn, .home-btn {
                padding: 15px 30px;
                border: none;
                border-radius: 10px;
                font-size: 1.1em;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .play-again-btn {
                background: #3182ce;
                color: white;
            }
            
            .play-again-btn:hover {
                background: #2c5aa0;
            }
            
            .home-btn {
                background: #718096;
                color: white;
            }
            
            .home-btn:hover {
                background: #4a5568;
            }
            
            @media (max-width: 768px) {
                .teams-comparison {
                    flex-direction: column;
                    gap: 20px;
                }
                
                .vs-divider {
                    font-size: 2em;
                }
                
                .records-reveal {
                    flex-direction: column;
                    gap: 15px;
                }
                
                .game-info {
                    flex-direction: column;
                    gap: 10px;
                }
                
                .final-buttons {
                    flex-direction: column;
                    align-items: center;
                }
                
                .team-name {
                    font-size: 1.3em;
                }
            }
        </style>
    `;
}

async function initializeGame() {
    gameState.isLoading = true;
    showLoading(true);
    
    try {
        await loadStandingsData();
        setupNewQuestion();
        showLoading(false);
    } catch (error) {
        console.error('Error initializing game:', error);
        showError('Failed to load MLB standings data. Please try again.');
    }
}

function showLoading(show) {
    document.getElementById('loading-screen').style.display = show ? 'block' : 'none';
    document.getElementById('game-content').style.display = show ? 'none' : 'block';
}

function showError(message) {
    document.getElementById('game-container').innerHTML = `
        <div style="text-align: center; padding: 60px 20px;">
            <h2>Oops! Something went wrong</h2>
            <p>${message}</p>
            <button onclick="initializeGame()" style="padding: 12px 24px; background: #3182ce; color: white; border: none; border-radius: 8px; cursor: pointer; margin: 15px;">
                Try Again
            </button>
            <button onclick="goHome()" style="padding: 12px 24px; background: #718096; color: white; border: none; border-radius: 8px; cursor: pointer; margin: 15px;">
                Back to Home
            </button>
        </div>
    `;
}

async function loadStandingsData() {
    try {
        const response = await fetch('https://statsapi.mlb.com/api/v1/standings?season=2025&leagueId=103,104&standingsTypes=regularSeason');
        const data = await response.json();
        
        if (!data.records || data.records.length === 0) {
            throw new Error('No standings data available');
        }
        
        // Parse all teams from both leagues
        gameState.teams = [];
        
        data.records.forEach(record => {
            const divisionName = record.division?.name || record.league?.name || 'Unknown Division';
            
            if (record.teamRecords) {
                record.teamRecords.forEach(teamRecord => {
                    const team = {
                        id: teamRecord.team.id,
                        name: teamRecord.team.name,
                        wins: teamRecord.wins,
                        losses: teamRecord.losses,
                        winningPercentage: parseFloat(teamRecord.winningPercentage),
                        gamesBack: teamRecord.gamesBack,
                        divisionRank: teamRecord.divisionRank,
                        wildCardRank: teamRecord.wildCardRank,
                        division: divisionName
                    };
                    gameState.teams.push(team);
                });
            }
        });
        
        console.log(`Loaded ${gameState.teams.length} MLB teams`);
        
        if (gameState.teams.length < 4) {
            throw new Error('Not enough teams data available');
        }
        
    } catch (error) {
        console.error('Error loading standings data:', error);
        throw error;
    }
}

function setupNewQuestion() {
    if (gameState.currentQuestion > gameState.totalQuestions) {
        showFinalScreen();
        return;
    }
    
    // Update UI
    document.getElementById('current-question').textContent = gameState.currentQuestion;
    document.getElementById('current-score').textContent = gameState.score;
    
    // Select two different teams randomly
    const shuffled = [...gameState.teams].sort(() => 0.5 - Math.random());
    const team1 = shuffled[0];
    const team2 = shuffled[1];
    
    // Store comparison data
    gameState.currentComparison = {
        team1,
        team2
    };
    
    // Update team cards
    document.getElementById('team-1-name').textContent = team1.name;
    document.getElementById('team-1-division').textContent = team1.division;
    
    document.getElementById('team-2-name').textContent = team2.name;
    document.getElementById('team-2-division').textContent = team2.division;
    
    // Hide result display
    document.getElementById('result-display').style.display = 'none';
    
    // Show team cards
    document.querySelectorAll('.team-option').forEach(card => {
        card.style.display = 'flex';
        card.style.pointerEvents = 'auto';
        card.style.opacity = '1';
    });
    document.querySelector('.question-container').style.display = 'block';
}

function selectTeam(teamNumber) {
    const { team1, team2 } = gameState.currentComparison;
    const selectedTeam = teamNumber === 1 ? team1 : team2;
    const otherTeam = teamNumber === 1 ? team2 : team1;
    
    // Determine which team has better record
    // First by wins, then by winning percentage
    let betterTeam;
    if (team1.wins > team2.wins) {
        betterTeam = team1;
    } else if (team2.wins > team1.wins) {
        betterTeam = team2;
    } else {
        // Tied on wins, use winning percentage
        betterTeam = team1.winningPercentage >= team2.winningPercentage ? team1 : team2;
    }
    
    const isCorrect = selectedTeam.id === betterTeam.id;
    
    if (isCorrect) {
        gameState.score++;
    }
    
    showResult(selectedTeam, otherTeam, isCorrect, betterTeam);
}

function showResult(selectedTeam, otherTeam, isCorrect, betterTeam) {
    // Hide team selection
    document.querySelectorAll('.team-option').forEach(card => {
        card.style.pointerEvents = 'none';
        card.style.opacity = '0.7';
    });
    document.querySelector('.question-container').style.display = 'none';
    
    // Show result
    document.getElementById('result-display').style.display = 'block';
    
    const resultMessage = isCorrect ? '✅ Correct!' : '❌ Incorrect';
    document.getElementById('result-message').textContent = resultMessage;
    document.getElementById('result-message').style.color = isCorrect ? '#38a169' : '#e53e3e';
    
    // Show team records
    const { team1, team2 } = gameState.currentComparison;
    
    document.getElementById('team-1-result-name').textContent = team1.name;
    document.getElementById('team-1-record-text').textContent = `${team1.wins}-${team1.losses}`;
    document.getElementById('team-1-win-pct').textContent = `${(team1.winningPercentage * 100).toFixed(1)}%`;
    document.getElementById('team-1-games-back').textContent = team1.gamesBack === '0.0' ? 'Leading division' : `${team1.gamesBack} GB`;
    
    document.getElementById('team-2-result-name').textContent = team2.name;
    document.getElementById('team-2-record-text').textContent = `${team2.wins}-${team2.losses}`;
    document.getElementById('team-2-win-pct').textContent = `${(team2.winningPercentage * 100).toFixed(1)}%`;
    document.getElementById('team-2-games-back').textContent = team2.gamesBack === '0.0' ? 'Leading division' : `${team2.gamesBack} GB`;
    
    // Highlight better team
    const team1Box = document.getElementById('team-1-record');
    const team2Box = document.getElementById('team-2-record');
    
    if (betterTeam.id === team1.id) {
        team1Box.style.borderColor = '#38a169';
        team1Box.style.background = '#f0fff4';
    } else {
        team2Box.style.borderColor = '#38a169';
        team2Box.style.background = '#f0fff4';
    }
    
    // Update score display
    document.getElementById('current-score').textContent = gameState.score;
    
    // Update button text for final question
    const nextBtn = document.getElementById('next-question-btn');
    if (gameState.currentQuestion >= gameState.totalQuestions) {
        nextBtn.textContent = 'View Final Score';
    } else {
        nextBtn.textContent = 'Next Question';
    }
}

function nextQuestion() {
    gameState.currentQuestion++;
    setupNewQuestion();
}

function showFinalScreen() {
    document.getElementById('game-content').style.display = 'none';
    document.getElementById('final-screen').style.display = 'block';
    
    const finalScore = `${gameState.score}/${gameState.totalQuestions}`;
    document.getElementById('final-score-display').textContent = finalScore;
    
    let message = '';
    const percentage = (gameState.score / gameState.totalQuestions) * 100;
    
    if (percentage >= 90) {
        message = '🏆 Amazing! You really know MLB team records!';
    } else if (percentage >= 70) {
        message = '⚾ Great job! You\'re following the standings closely!';
    } else if (percentage >= 50) {
        message = '👍 Not bad! Keep tracking those team records!';
    } else {
        message = '📊 The standings can be tricky! Keep following the season!';
    }
    
    document.getElementById('performance-message').textContent = message;
}

function playAgain() {
    // Reset game state
    gameState = {
        teams: gameState.teams, // Keep loaded teams
        currentQuestion: 1,
        totalQuestions: 10,
        score: 0,
        currentComparison: null,
        isLoading: false
    };
    
    // Show game content and hide final screen
    document.getElementById('final-screen').style.display = 'none';
    document.getElementById('game-content').style.display = 'block';
    
    // Start new game
    setupNewQuestion();
}

function goHome() {
    window.location.hash = '';
} 