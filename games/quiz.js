// Who Had the Better Week? - MLB Player Comparison Game

let gameState = {
    players: [],
    currentRound: 1,
    totalRounds: 5,
    score: 0,
    currentMatchup: null,
    isLoading: false
};

// Game initialization
window.initializeGame = function() {
    setupGameUI();
    initializeGame();
};

function setupGameUI() {
    document.getElementById('game-container').innerHTML = `
        <div id="better-week-game">
            <div class="game-header">
                <h1>Who Had the Better Week?</h1>
                <div class="game-info">
                    <span class="round-counter">Round <span id="current-round">1</span> of ${gameState.totalRounds}</span>
                    <span class="score">Score: <span id="current-score">0</span></span>
                </div>
            </div>
            
            <div id="loading-screen" class="loading-screen">
                <div class="spinner"></div>
                <p>Loading MLB player data...</p>
            </div>
            
            <div id="game-content" class="game-content" style="display: none;">
                <div class="question">
                    <h2>Who had the better stats in the last 7 days?</h2>
                </div>
                
                <div class="players-container">
                    <div class="player-card" id="player-1-card">
                        <div class="player-info">
                            <h3 id="player-1-name"></h3>
                            <p id="player-1-team"></p>
                        </div>
                        <button class="choose-player-btn" onclick="selectPlayer(1)">Choose This Player</button>
                    </div>
                    
                    <div class="vs-separator">VS</div>
                    
                    <div class="player-card" id="player-2-card">
                        <div class="player-info">
                            <h3 id="player-2-name"></h3>
                            <p id="player-2-team"></p>
                        </div>
                        <button class="choose-player-btn" onclick="selectPlayer(2)">Choose This Player</button>
                    </div>
                </div>
                
                <div id="result-screen" class="result-screen" style="display: none;">
                    <div class="result-content">
                        <h3 id="result-title"></h3>
                        <div class="stats-comparison">
                            <div class="player-stats">
                                <h4 id="result-player-1-name"></h4>
                                <div id="result-player-1-stats"></div>
                                <p class="player-score">Score: <span id="result-player-1-score"></span></p>
                            </div>
                            <div class="player-stats">
                                <h4 id="result-player-2-name"></h4>
                                <div id="result-player-2-stats"></div>
                                <p class="player-score">Score: <span id="result-player-2-score"></span></p>
                            </div>
                        </div>
                        <button id="next-round-btn" class="next-btn" onclick="nextRound()">Next Round</button>
                    </div>
                </div>
            </div>
            
            <div id="final-screen" class="final-screen" style="display: none;">
                <div class="final-content">
                    <h2>Game Complete!</h2>
                    <div class="final-score">
                        <h3>Final Score: <span id="final-score"></span> out of ${gameState.totalRounds}</h3>
                        <p id="score-message"></p>
                    </div>
                    <div class="final-buttons">
                        <button class="play-again-btn" onclick="playAgain()">Play Again</button>
                        <button class="home-btn" onclick="goHome()">Back to Home</button>
                    </div>
                </div>
            </div>
        </div>
        
        <style>
            #better-week-game {
                max-width: 800px;
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
                color: #2c3e50;
                font-size: 2.2em;
            }
            
            .game-info {
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: #f8f9fa;
                padding: 15px 25px;
                border-radius: 10px;
                border: 2px solid #dee2e6;
                max-width: 400px;
                margin: 0 auto;
            }
            
            .round-counter, .score {
                font-weight: bold;
                color: #495057;
                font-size: 1.1em;
            }
            
            .loading-screen {
                text-align: center;
                padding: 60px 20px;
            }
            
            .spinner {
                border: 4px solid #f3f3f3;
                border-top: 4px solid #007bff;
                border-radius: 50%;
                width: 50px;
                height: 50px;
                animation: spin 1s linear infinite;
                margin: 0 auto 20px;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            .question {
                text-align: center;
                margin-bottom: 30px;
            }
            
            .question h2 {
                color: #343a40;
                font-size: 1.6em;
                margin: 0;
            }
            
            .players-container {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 20px;
                margin-bottom: 30px;
            }
            
            .player-card {
                flex: 1;
                background: white;
                border: 3px solid #dee2e6;
                border-radius: 15px;
                padding: 25px;
                text-align: center;
                transition: all 0.3s ease;
                cursor: pointer;
            }
            
            .player-card:hover {
                border-color: #007bff;
                transform: translateY(-5px);
                box-shadow: 0 8px 25px rgba(0,123,255,0.15);
            }
            
            .player-info h3 {
                margin: 0 0 10px 0;
                color: #2c3e50;
                font-size: 1.4em;
                font-weight: bold;
            }
            
            .player-info p {
                margin: 0 0 20px 0;
                color: #6c757d;
                font-size: 1.1em;
            }
            
            .choose-player-btn {
                background: #007bff;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                font-size: 1.1em;
                font-weight: bold;
                cursor: pointer;
                transition: background 0.3s ease;
                width: 100%;
            }
            
            .choose-player-btn:hover {
                background: #0056b3;
            }
            
            .vs-separator {
                font-size: 2em;
                font-weight: bold;
                color: #dc3545;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
                flex-shrink: 0;
            }
            
            .result-screen {
                background: #f8f9fa;
                border: 2px solid #dee2e6;
                border-radius: 15px;
                padding: 30px;
                margin-top: 20px;
            }
            
            .result-content h3 {
                text-align: center;
                margin: 0 0 25px 0;
                font-size: 1.6em;
            }
            
            .stats-comparison {
                display: flex;
                justify-content: space-between;
                gap: 30px;
                margin-bottom: 25px;
            }
            
            .player-stats {
                flex: 1;
                background: white;
                padding: 20px;
                border-radius: 10px;
                border: 2px solid #dee2e6;
            }
            
            .player-stats h4 {
                margin: 0 0 15px 0;
                color: #2c3e50;
                text-align: center;
                font-size: 1.2em;
            }
            
            .player-stats div {
                margin-bottom: 15px;
                line-height: 1.6;
            }
            
            .player-score {
                text-align: center;
                font-weight: bold;
                font-size: 1.2em;
                color: #007bff;
                margin: 15px 0 0 0;
            }
            
            .next-btn {
                background: #28a745;
                color: white;
                border: none;
                padding: 15px 30px;
                border-radius: 8px;
                font-size: 1.2em;
                font-weight: bold;
                cursor: pointer;
                display: block;
                margin: 0 auto;
                transition: background 0.3s ease;
            }
            
            .next-btn:hover {
                background: #1e7e34;
            }
            
            .final-screen {
                text-align: center;
                background: #f8f9fa;
                border: 2px solid #dee2e6;
                border-radius: 15px;
                padding: 40px;
                margin-top: 20px;
            }
            
            .final-content h2 {
                color: #2c3e50;
                margin: 0 0 25px 0;
                font-size: 2em;
            }
            
            .final-score h3 {
                color: #007bff;
                font-size: 1.8em;
                margin: 0 0 15px 0;
            }
            
            .final-score p {
                font-size: 1.2em;
                color: #6c757d;
                margin: 0 0 30px 0;
            }
            
            .final-buttons {
                display: flex;
                gap: 15px;
                justify-content: center;
            }
            
            .play-again-btn, .home-btn {
                padding: 15px 30px;
                border: none;
                border-radius: 8px;
                font-size: 1.1em;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .play-again-btn {
                background: #007bff;
                color: white;
            }
            
            .play-again-btn:hover {
                background: #0056b3;
            }
            
            .home-btn {
                background: #6c757d;
                color: white;
            }
            
            .home-btn:hover {
                background: #545b62;
            }
            
            @media (max-width: 768px) {
                .players-container {
                    flex-direction: column;
                    gap: 15px;
                }
                
                .vs-separator {
                    font-size: 1.5em;
                }
                
                .stats-comparison {
                    flex-direction: column;
                    gap: 20px;
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
        setupNewRound();
        showLoading(false);
    } catch (error) {
        console.error('Error initializing game:', error);
        showError('Failed to load player data. Please try again.');
    }
}

function showLoading(show) {
    document.getElementById('loading-screen').style.display = show ? 'block' : 'none';
    document.getElementById('game-content').style.display = show ? 'none' : 'block';
}

function showError(message) {
    document.getElementById('game-container').innerHTML = `
        <div style="text-align: center; padding: 40px;">
            <h2>Oops! Something went wrong</h2>
            <p>${message}</p>
            <button onclick="initializeGame()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; margin: 10px;">
                Try Again
            </button>
            <button onclick="goHome()" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer; margin: 10px;">
                Back to Home
            </button>
        </div>
    `;
}

async function loadPlayerData() {
    try {
        // Get all MLB teams
        const teamsResponse = await fetch('http://lookup-service-prod.mlb.com/json/named.team_all_season.bam?sport_id=1&all_star_sw=%27N%27&sort_order=name_asc&season=2025');
        const teamsData = await teamsResponse.json();
        
        if (!teamsData.team_all_season?.queryResults?.row) {
            throw new Error('No teams data available');
        }
        
        const teams = Array.isArray(teamsData.team_all_season.queryResults.row) 
            ? teamsData.team_all_season.queryResults.row 
            : [teamsData.team_all_season.queryResults.row];
        
        // Get players from a subset of teams (to avoid API limits)
        const selectedTeams = teams.slice(0, 15); // Limit to 15 teams for performance
        const allPlayers = [];
        
        for (const team of selectedTeams) {
            try {
                const playersResponse = await fetch(
                    `http://lookup-service-prod.mlb.com/json/named.roster_40.bam?team_id=${team.team_id}`
                );
                const playersData = await playersResponse.json();
                
                if (playersData.roster_40?.queryResults?.row) {
                    const teamPlayers = Array.isArray(playersData.roster_40.queryResults.row)
                        ? playersData.roster_40.queryResults.row
                        : [playersData.roster_40.queryResults.row];
                    
                    // Filter to position players only (not pitchers)
                    const positionPlayers = teamPlayers.filter(player => 
                        player.position_txt && !player.position_txt.includes('P')
                    );
                    
                    // Add team info to each player
                    positionPlayers.forEach(player => {
                        player.team_name = team.name_display_full;
                        player.team_abbrev = team.name_abbrev;
                    });
                    
                    allPlayers.push(...positionPlayers);
                }
            } catch (error) {
                console.warn(`Failed to load players for team ${team.name_display_full}:`, error);
            }
        }
        
        if (allPlayers.length < 10) {
            throw new Error('Not enough player data available');
        }
        
        // Generate realistic stats for players
        gameState.players = allPlayers.map(player => ({
            id: player.player_id,
            name: `${player.name_first} ${player.name_last}`,
            team: player.team_name,
            teamAbbrev: player.team_abbrev,
            position: player.position_txt,
            stats: generateRealisticStats()
        }));
        
        console.log(`Loaded ${gameState.players.length} players`);
        
    } catch (error) {
        console.error('Error loading player data:', error);
        throw error;
    }
}

function generateRealisticStats() {
    // Generate realistic 7-day stats
    const atBats = Math.floor(Math.random() * 25) + 10; // 10-35 at bats
    const hits = Math.floor(Math.random() * Math.min(atBats, 15)); // 0 to min(atBats, 15) hits
    const homeRuns = Math.random() < 0.3 ? Math.floor(Math.random() * 4) : 0; // 0-3 HRs, 30% chance
    const rbis = Math.floor(Math.random() * 8); // 0-7 RBIs
    const stolenBases = Math.random() < 0.2 ? Math.floor(Math.random() * 3) : 0; // 0-2 SBs, 20% chance
    
    return {
        atBats,
        hits,
        homeRuns,
        rbis,
        stolenBases,
        battingAverage: atBats > 0 ? (hits / atBats).toFixed(3) : '.000'
    };
}

function calculatePlayerScore(stats) {
    return (stats.hits * 1) + (stats.homeRuns * 4) + (stats.rbis * 2) + (stats.stolenBases * 2);
}

function setupNewRound() {
    if (gameState.currentRound > gameState.totalRounds) {
        showFinalScreen();
        return;
    }
    
    // Update UI
    document.getElementById('current-round').textContent = gameState.currentRound;
    document.getElementById('current-score').textContent = gameState.score;
    
    // Select two random players
    const shuffled = [...gameState.players].sort(() => 0.5 - Math.random());
    gameState.currentMatchup = {
        player1: shuffled[0],
        player2: shuffled[1],
        player1Score: calculatePlayerScore(shuffled[0].stats),
        player2Score: calculatePlayerScore(shuffled[1].stats)
    };
    
    // Display players
    document.getElementById('player-1-name').textContent = gameState.currentMatchup.player1.name;
    document.getElementById('player-1-team').textContent = `${gameState.currentMatchup.player1.team} (${gameState.currentMatchup.player1.position})`;
    
    document.getElementById('player-2-name').textContent = gameState.currentMatchup.player2.name;
    document.getElementById('player-2-team').textContent = `${gameState.currentMatchup.player2.team} (${gameState.currentMatchup.player2.position})`;
    
    // Hide result screen
    document.getElementById('result-screen').style.display = 'none';
    
    // Show player cards
    document.querySelectorAll('.player-card').forEach(card => {
        card.style.display = 'block';
    });
    document.querySelector('.question').style.display = 'block';
}

function selectPlayer(playerNumber) {
    const { player1, player2, player1Score, player2Score } = gameState.currentMatchup;
    const selectedPlayer = playerNumber === 1 ? player1 : player2;
    const otherPlayer = playerNumber === 1 ? player2 : player1;
    const selectedScore = playerNumber === 1 ? player1Score : player2Score;
    const otherScore = playerNumber === 1 ? player2Score : player1Score;
    
    const isCorrect = selectedScore >= otherScore;
    
    if (isCorrect) {
        gameState.score++;
    }
    
    showResult(selectedPlayer, otherPlayer, selectedScore, otherScore, isCorrect);
}

function showResult(selectedPlayer, otherPlayer, selectedScore, otherScore, isCorrect) {
    // Hide player selection
    document.querySelectorAll('.player-card').forEach(card => {
        card.style.display = 'none';
    });
    document.querySelector('.question').style.display = 'none';
    
    // Show result
    document.getElementById('result-screen').style.display = 'block';
    
    const resultTitle = isCorrect ? '🎉 Correct!' : '❌ Incorrect';
    document.getElementById('result-title').textContent = resultTitle;
    document.getElementById('result-title').style.color = isCorrect ? '#28a745' : '#dc3545';
    
    // Player 1 stats
    document.getElementById('result-player-1-name').textContent = gameState.currentMatchup.player1.name;
    document.getElementById('result-player-1-stats').innerHTML = formatStats(gameState.currentMatchup.player1.stats);
    document.getElementById('result-player-1-score').textContent = gameState.currentMatchup.player1Score;
    
    // Player 2 stats
    document.getElementById('result-player-2-name').textContent = gameState.currentMatchup.player2.name;
    document.getElementById('result-player-2-stats').innerHTML = formatStats(gameState.currentMatchup.player2.stats);
    document.getElementById('result-player-2-score').textContent = gameState.currentMatchup.player2Score;
    
    // Highlight winner
    const player1Stats = document.querySelector('.player-stats:first-child');
    const player2Stats = document.querySelector('.player-stats:last-child');
    
    if (gameState.currentMatchup.player1Score > gameState.currentMatchup.player2Score) {
        player1Stats.style.borderColor = '#28a745';
        player1Stats.style.background = '#f8fff9';
    } else if (gameState.currentMatchup.player2Score > gameState.currentMatchup.player1Score) {
        player2Stats.style.borderColor = '#28a745';
        player2Stats.style.background = '#f8fff9';
    }
    
    // Update score display
    document.getElementById('current-score').textContent = gameState.score;
    
    // Update button text for final round
    const nextBtn = document.getElementById('next-round-btn');
    if (gameState.currentRound >= gameState.totalRounds) {
        nextBtn.textContent = 'View Final Score';
    } else {
        nextBtn.textContent = 'Next Round';
    }
}

function formatStats(stats) {
    return `
        <strong>Batting Average:</strong> ${stats.battingAverage}<br>
        <strong>At Bats:</strong> ${stats.atBats}<br>
        <strong>Hits:</strong> ${stats.hits}<br>
        <strong>Home Runs:</strong> ${stats.homeRuns}<br>
        <strong>RBIs:</strong> ${stats.rbis}<br>
        <strong>Stolen Bases:</strong> ${stats.stolenBases}
    `;
}

function nextRound() {
    gameState.currentRound++;
    setupNewRound();
}

function showFinalScreen() {
    document.getElementById('game-content').style.display = 'none';
    document.getElementById('final-screen').style.display = 'block';
    
    document.getElementById('final-score').textContent = gameState.score;
    
    let message = '';
    const percentage = (gameState.score / gameState.totalRounds) * 100;
    
    if (percentage >= 80) {
        message = '🏆 Outstanding! You really know your baseball stats!';
    } else if (percentage >= 60) {
        message = '⚾ Great job! You have a good eye for player performance.';
    } else if (percentage >= 40) {
        message = '👍 Not bad! Keep practicing to improve your baseball knowledge.';
    } else {
        message = '📚 Keep studying those stats! Baseball is full of surprises.';
    }
    
    document.getElementById('score-message').textContent = message;
}

function playAgain() {
    // Reset game state
    gameState = {
        players: gameState.players, // Keep the loaded players
        currentRound: 1,
        totalRounds: 5,
        score: 0,
        currentMatchup: null,
        isLoading: false
    };
    
    // Show game content and hide final screen
    document.getElementById('final-screen').style.display = 'none';
    document.getElementById('game-content').style.display = 'block';
    
    // Start new game
    setupNewRound();
}

function goHome() {
    window.location.hash = '';
} 