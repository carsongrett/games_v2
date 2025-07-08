// MLB Stats Showdown - Compare 2025 Player Stats

let gameState = {
    positionPlayers: [],
    pitchers: [],
    currentQuestion: 1,
    totalQuestions: 10,
    score: 0,
    currentComparison: null,
    isLoading: false
};

// Available stats for comparison
const HITTING_STATS = ['r', 'h', 'd', 't', 'hr', 'rbi', 'sb', 'bb', 'so'];
const PITCHING_STATS = ['w', 'l', 'era', 'g', 'gs', 'sv', 'ip', 'h', 'er', 'bb', 'so'];

const STAT_LABELS = {
    // Hitting stats
    'r': 'Runs',
    'h': 'Hits', 
    'd': 'Doubles',
    't': 'Triples',
    'hr': 'Home Runs',
    'rbi': 'RBIs',
    'sb': 'Stolen Bases',
    'bb': 'Walks',
    'so': 'Strikeouts',
    // Pitching stats
    'w': 'Wins',
    'l': 'Losses',
    'era': 'ERA',
    'g': 'Games',
    'gs': 'Games Started',
    'sv': 'Saves',
    'ip': 'Innings Pitched',
    'er': 'Earned Runs'
};

// Game initialization
window.initializeGame = function() {
    setupGameUI();
    initializeGame();
};

function setupGameUI() {
    document.getElementById('game-container').innerHTML = `
        <div id="mlb-showdown-game">
            <div class="game-header">
                <h1>MLB Stats Showdown</h1>
                <div class="game-info">
                    <span class="question-counter">Question <span id="current-question">1</span> of ${gameState.totalQuestions}</span>
                    <span class="score">Score: <span id="current-score">0</span>/${gameState.totalQuestions}</span>
                </div>
            </div>
            
            <div id="loading-screen" class="loading-screen">
                <div class="spinner"></div>
                <p>Loading 2025 MLB player data...</p>
            </div>
            
            <div id="game-content" class="game-content" style="display: none;">
                <div class="question-container">
                    <h2 id="question-text">Who has more runs in 2025?</h2>
                </div>
                
                <div class="players-comparison">
                    <div class="player-option" id="player-1-card" onclick="selectPlayer(1)">
                        <div class="player-name" id="player-1-name"></div>
                        <div class="player-team" id="player-1-team"></div>
                        <div class="player-position" id="player-1-position"></div>
                    </div>
                    
                    <div class="vs-divider">VS</div>
                    
                    <div class="player-option" id="player-2-card" onclick="selectPlayer(2)">
                        <div class="player-name" id="player-2-name"></div>
                        <div class="player-team" id="player-2-team"></div>
                        <div class="player-position" id="player-2-position"></div>
                    </div>
                </div>
                
                <div id="result-display" class="result-display" style="display: none;">
                    <div class="result-header">
                        <h3 id="result-message"></h3>
                    </div>
                    <div class="stats-reveal">
                        <div class="player-stat-box" id="player-1-stats">
                            <h4 id="player-1-result-name"></h4>
                            <div class="stat-value" id="player-1-stat-value"></div>
                        </div>
                        <div class="player-stat-box" id="player-2-stats">
                            <h4 id="player-2-result-name"></h4>
                            <div class="stat-value" id="player-2-stat-value"></div>
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
            #mlb-showdown-game {
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
                margin: 0;
                font-weight: bold;
            }
            
            .players-comparison {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 30px;
                margin-bottom: 40px;
            }
            
            .player-option {
                flex: 1;
                background: white;
                border: 3px solid #e2e8f0;
                border-radius: 16px;
                padding: 30px 20px;
                text-align: center;
                cursor: pointer;
                transition: all 0.3s ease;
                min-height: 140px;
                display: flex;
                flex-direction: column;
                justify-content: center;
            }
            
            .player-option:hover {
                border-color: #3182ce;
                transform: translateY(-4px);
                box-shadow: 0 10px 30px rgba(49, 130, 206, 0.15);
            }
            
            .player-name {
                font-size: 1.4em;
                font-weight: bold;
                color: #1a365d;
                margin-bottom: 8px;
            }
            
            .player-team {
                font-size: 1.1em;
                color: #4a5568;
                margin-bottom: 6px;
            }
            
            .player-position {
                font-size: 0.95em;
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
            
            .stats-reveal {
                display: flex;
                justify-content: space-around;
                gap: 25px;
                margin-bottom: 30px;
            }
            
            .player-stat-box {
                flex: 1;
                background: white;
                padding: 20px;
                border-radius: 12px;
                border: 2px solid #e2e8f0;
                text-align: center;
            }
            
            .player-stat-box h4 {
                margin: 0 0 15px 0;
                color: #2d3748;
                font-size: 1.2em;
            }
            
            .stat-value {
                font-size: 2.2em;
                font-weight: bold;
                color: #3182ce;
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
                .players-comparison {
                    flex-direction: column;
                    gap: 20px;
                }
                
                .vs-divider {
                    font-size: 2em;
                }
                
                .stats-reveal {
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
            }
        </style>
    `;
}

async function initializeGame() {
    gameState.isLoading = true;
    showLoading(true);
    
    try {
        await loadPlayerData();
        setupNewQuestion();
        showLoading(false);
    } catch (error) {
        console.error('Error initializing game:', error);
        showError('Failed to load MLB player data. Please try again.');
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

async function loadPlayerData() {
    try {
        // Get MLB teams
        const teamsResponse = await fetch('http://lookup-service-prod.mlb.com/json/named.team_all_season.bam?sport_id=1&all_star_sw=%27N%27&sort_order=name_asc&season=2025');
        const teamsData = await teamsResponse.json();
        
        if (!teamsData.team_all_season?.queryResults?.row) {
            throw new Error('No teams data available');
        }
        
        const teams = Array.isArray(teamsData.team_all_season.queryResults.row) 
            ? teamsData.team_all_season.queryResults.row 
            : [teamsData.team_all_season.queryResults.row];
        
        // Load players from multiple teams
        const selectedTeams = teams.slice(0, 12); // Use 12 teams for good variety
        
        for (const team of selectedTeams) {
            try {
                // Get roster
                const rosterResponse = await fetch(
                    `http://lookup-service-prod.mlb.com/json/named.roster_40.bam?team_id=${team.team_id}`
                );
                const rosterData = await rosterResponse.json();
                
                if (rosterData.roster_40?.queryResults?.row) {
                    const teamPlayers = Array.isArray(rosterData.roster_40.queryResults.row)
                        ? rosterData.roster_40.queryResults.row
                        : [rosterData.roster_40.queryResults.row];
                    
                    // Get stats for each player
                    for (const player of teamPlayers) {
                        try {
                            const statsResponse = await fetch(
                                `http://lookup-service-prod.mlb.com/json/named.sport_hitting_tm.bam?league_list_id='mlb'&game_type='R'&season='2025'&player_id='${player.player_id}'`
                            );
                            const statsData = await statsResponse.json();
                            
                            if (statsData.sport_hitting_tm?.queryResults?.row) {
                                const stats = statsData.sport_hitting_tm.queryResults.row;
                                const playerWithStats = {
                                    id: player.player_id,
                                    name: `${player.name_first} ${player.name_last}`,
                                    team: team.name_display_full,
                                    teamAbbrev: team.name_abbrev,
                                    position: player.position_txt,
                                    stats: stats
                                };
                                
                                // Separate position players from pitchers
                                if (player.position_txt && !player.position_txt.includes('P')) {
                                    gameState.positionPlayers.push(playerWithStats);
                                } else if (player.position_txt && player.position_txt.includes('P')) {
                                    // Get pitching stats for pitchers
                                    const pitchingResponse = await fetch(
                                        `http://lookup-service-prod.mlb.com/json/named.sport_pitching_tm.bam?league_list_id='mlb'&game_type='R'&season='2025'&player_id='${player.player_id}'`
                                    );
                                    const pitchingData = await pitchingResponse.json();
                                    
                                    if (pitchingData.sport_pitching_tm?.queryResults?.row) {
                                        playerWithStats.pitchingStats = pitchingData.sport_pitching_tm.queryResults.row;
                                        gameState.pitchers.push(playerWithStats);
                                    }
                                }
                            }
                        } catch (error) {
                            console.warn(`Failed to load stats for player ${player.player_id}:`, error);
                        }
                    }
                }
            } catch (error) {
                console.warn(`Failed to load roster for team ${team.name_display_full}:`, error);
            }
        }
        
        // Filter players with meaningful stats (at least 10 plate appearances for hitters, 5 games for pitchers)
        gameState.positionPlayers = gameState.positionPlayers.filter(player => 
            player.stats && parseInt(player.stats.ab || 0) >= 10
        );
        gameState.pitchers = gameState.pitchers.filter(pitcher => 
            pitcher.pitchingStats && parseInt(pitcher.pitchingStats.g || 0) >= 5
        );
        
        console.log(`Loaded ${gameState.positionPlayers.length} position players and ${gameState.pitchers.length} pitchers`);
        
        if (gameState.positionPlayers.length < 4) {
            throw new Error('Not enough position player data available');
        }
        
    } catch (error) {
        console.error('Error loading player data:', error);
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
    
    // Choose player type and stat
    const usePitchers = Math.random() < 0.3 && gameState.pitchers.length >= 2; // 30% chance for pitchers
    const playerPool = usePitchers ? gameState.pitchers : gameState.positionPlayers;
    const statPool = usePitchers ? PITCHING_STATS : HITTING_STATS;
    
    // Select two different players
    const shuffled = [...playerPool].sort(() => 0.5 - Math.random());
    const player1 = shuffled[0];
    const player2 = shuffled[1];
    
    // Select random stat
    const stat = statPool[Math.floor(Math.random() * statPool.length)];
    const statLabel = STAT_LABELS[stat];
    
    // Get stat values
    const statsToUse = usePitchers ? 'pitchingStats' : 'stats';
    const player1Value = parseFloat(player1[statsToUse][stat] || 0);
    const player2Value = parseFloat(player2[statsToUse][stat] || 0);
    
    // Store comparison data
    gameState.currentComparison = {
        player1,
        player2,
        stat,
        statLabel,
        player1Value,
        player2Value,
        isPitching: usePitchers
    };
    
    // Update question text
    document.getElementById('question-text').textContent = `Who has more ${statLabel.toLowerCase()} in 2025?`;
    
    // Update player cards
    document.getElementById('player-1-name').textContent = player1.name;
    document.getElementById('player-1-team').textContent = player1.teamAbbrev;
    document.getElementById('player-1-position').textContent = player1.position;
    
    document.getElementById('player-2-name').textContent = player2.name;
    document.getElementById('player-2-team').textContent = player2.teamAbbrev;
    document.getElementById('player-2-position').textContent = player2.position;
    
    // Hide result display
    document.getElementById('result-display').style.display = 'none';
    
    // Show player cards
    document.querySelectorAll('.player-option').forEach(card => {
        card.style.display = 'flex';
        card.style.pointerEvents = 'auto';
        card.style.opacity = '1';
    });
    document.querySelector('.question-container').style.display = 'block';
}

function selectPlayer(playerNumber) {
    const { player1, player2, player1Value, player2Value, stat, statLabel } = gameState.currentComparison;
    const selectedPlayer = playerNumber === 1 ? player1 : player2;
    const selectedValue = playerNumber === 1 ? player1Value : player2Value;
    const otherPlayer = playerNumber === 1 ? player2 : player1;
    const otherValue = playerNumber === 1 ? player2Value : player1Value;
    
    // Determine if guess is correct
    const isCorrect = selectedValue >= otherValue;
    
    if (isCorrect) {
        gameState.score++;
    }
    
    showResult(selectedPlayer, otherPlayer, selectedValue, otherValue, isCorrect, statLabel);
}

function showResult(selectedPlayer, otherPlayer, selectedValue, otherValue, isCorrect, statLabel) {
    // Hide player selection
    document.querySelectorAll('.player-option').forEach(card => {
        card.style.pointerEvents = 'none';
        card.style.opacity = '0.7';
    });
    document.querySelector('.question-container').style.display = 'none';
    
    // Show result
    document.getElementById('result-display').style.display = 'block';
    
    const resultMessage = isCorrect ? '✅ Correct!' : '❌ Incorrect';
    document.getElementById('result-message').textContent = resultMessage;
    document.getElementById('result-message').style.color = isCorrect ? '#38a169' : '#e53e3e';
    
    // Show stats
    document.getElementById('player-1-result-name').textContent = gameState.currentComparison.player1.name;
    document.getElementById('player-1-stat-value').textContent = gameState.currentComparison.player1Value;
    
    document.getElementById('player-2-result-name').textContent = gameState.currentComparison.player2.name;
    document.getElementById('player-2-stat-value').textContent = gameState.currentComparison.player2Value;
    
    // Highlight winner
    const player1Box = document.getElementById('player-1-stats');
    const player2Box = document.getElementById('player-2-stats');
    
    if (gameState.currentComparison.player1Value > gameState.currentComparison.player2Value) {
        player1Box.style.borderColor = '#38a169';
        player1Box.style.background = '#f0fff4';
    } else if (gameState.currentComparison.player2Value > gameState.currentComparison.player1Value) {
        player2Box.style.borderColor = '#38a169';
        player2Box.style.background = '#f0fff4';
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
        message = '🏆 Incredible! You\'re a true MLB stats expert!';
    } else if (percentage >= 70) {
        message = '⚾ Great job! You really know your baseball stats!';
    } else if (percentage >= 50) {
        message = '👍 Nice work! Keep following those stats!';
    } else {
        message = '📊 Keep practicing! MLB stats can be tricky!';
    }
    
    document.getElementById('performance-message').textContent = message;
}

function playAgain() {
    // Reset game state
    gameState = {
        positionPlayers: gameState.positionPlayers, // Keep loaded players
        pitchers: gameState.pitchers,
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