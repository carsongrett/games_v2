// MLB Stat Shuffle Game - Guess player from single-game statline
(function() {
    let allPlayers = [];
    let currentGame = null;
    let guesses = [];
    let gameOver = false;
    let gameWon = false;
    const maxGuesses = 6;
    let gameCache = null;
    let isLoading = false;
    
    // CORS proxy to access MLB Stats API
    const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';
    const MLB_API_BASE = 'https://statsapi.mlb.com/api/v1';
    
    // Initialize the game when this script loads
    window.initializeGame = function() {
        showMLBStatShuffleGame();
    };
    
    function showMLBStatShuffleGame() {
        document.getElementById('game-container').innerHTML = `
            <div style="text-align: center; max-width: 800px; margin: 0 auto;" id="gameContainer">
                <h2>MLB Stat Shuffle</h2>
                <p style="margin-bottom: 20px; color: #666;">Guess the MLB player from their single-game statline</p>
                
                <div id="loadingContainer" style="display: block;">
                    <div style="padding: 40px;">
                        <div style="font-size: 18px; margin-bottom: 10px;">🔄 Loading MLB data...</div>
                        <div style="color: #666; font-size: 14px;">Fetching 2025 season games and player data</div>
                        <div style="margin-top: 10px;">
                            <div style="width: 100%; background: #f0f0f0; border-radius: 10px; height: 8px;">
                                <div id="loadingBar" style="width: 0%; background: #007bff; height: 100%; border-radius: 10px; transition: width 0.3s;"></div>
                            </div>
                        </div>
                        <div style="margin-top: 15px; color: #888; font-size: 12px;">
                            Note: If loading takes too long, the CORS proxy may need activation at 
                            <a href="https://cors-anywhere.herokuapp.com/corsdemo" target="_blank">cors-anywhere.herokuapp.com/corsdemo</a>
                        </div>
                    </div>
                </div>
                
                <div id="gameContent" style="display: none;">
                    <div id="gameInfo" style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                        <!-- Game details will be populated here -->
                    </div>
                    
                    <div id="guessSection" style="margin-bottom: 20px;">
                        <div style="position: relative; display: inline-block; width: 100%; max-width: 400px;">
                            <input type="text" id="playerInput" placeholder="Search for a player..." 
                                   style="width: 100%; padding: 12px; font-size: 16px; border: 2px solid #ddd; border-radius: 8px; box-sizing: border-box;"
                                   autocomplete="off">
                            <div id="playerDropdown" style="display: none; position: absolute; top: 100%; left: 0; right: 0; background: white; border: 2px solid #ddd; border-top: none; border-radius: 0 0 8px 8px; max-height: 200px; overflow-y: auto; z-index: 1000;"></div>
                        </div>
                        <button onclick="makeGuess()" id="guessButton" style="margin-left: 10px; padding: 12px 24px; font-size: 16px; background: #007bff; color: white; border: none; border-radius: 8px; cursor: pointer;">Guess</button>
                    </div>
                    
                    <div id="feedback" style="margin-bottom: 20px; min-height: 20px; font-weight: bold;"></div>
                    
                    <div id="guessList" style="margin-bottom: 20px;">
                        <!-- Previous guesses will be displayed here -->
                    </div>
                    
                    <div id="gameEndContainer" style="display: none;">
                        <div id="revealSection" style="background: #e8f5e8; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                            <!-- Player reveal will be shown here -->
                        </div>
                        <button onclick="startNewGame()" style="padding: 12px 24px; font-size: 16px; background: #28a745; color: white; border: none; border-radius: 8px; cursor: pointer;">Play Again</button>
                    </div>
                </div>
            </div>
        `;
        
        initializeMLBGame();
    }
    
    async function initializeMLBGame() {
        isLoading = true;
        updateLoadingProgress(10, "Fetching 2025 season schedule...");
        
        try {
            // First, check if we have cached data
            const cachedData = getCachedData();
            if (cachedData && cachedData.players && cachedData.games) {
                allPlayers = cachedData.players;
                await selectRandomGame(cachedData.games);
                finishLoading();
                return;
            }
            
            // Load players first
            updateLoadingProgress(30, "Loading active MLB players...");
            await loadAllPlayers();
            
            // Then load games
            updateLoadingProgress(60, "Fetching 2025 games...");
            const games = await load2025Games();
            
            updateLoadingProgress(80, "Selecting random game...");
            await selectRandomGame(games);
            
            // Cache the data
            setCachedData({
                players: allPlayers,
                games: games,
                timestamp: Date.now()
            });
            
            updateLoadingProgress(100, "Ready to play!");
            setTimeout(finishLoading, 500);
            
        } catch (error) {
            console.error('Failed to initialize MLB game:', error);
            showError('Failed to load MLB data. Please try again or check your internet connection.');
        }
    }
    
    function updateLoadingProgress(percent, message) {
        const loadingBar = document.getElementById('loadingBar');
        const loadingContainer = document.getElementById('loadingContainer');
        
        if (loadingBar) {
            loadingBar.style.width = percent + '%';
        }
        
        if (loadingContainer && message) {
            const messageDiv = loadingContainer.querySelector('div');
            if (messageDiv) {
                messageDiv.innerHTML = `🔄 ${message}`;
            }
        }
    }
    
    function finishLoading() {
        document.getElementById('loadingContainer').style.display = 'none';
        document.getElementById('gameContent').style.display = 'block';
        
        setupSearchableDropdown();
        displayGameInfo();
        isLoading = false;
    }
    
    function showError(message) {
        document.getElementById('game-container').innerHTML = `
            <div style="text-align: center; max-width: 600px; margin: 0 auto;">
                <h2>MLB Stat Shuffle</h2>
                <div style="background: #f8d7da; color: #721c24; padding: 20px; border-radius: 10px; margin: 20px 0;">
                    <h3>⚠️ Unable to Load Game</h3>
                    <p>${message}</p>
                    <div style="margin-top: 15px; font-size: 14px;">
                        <p><strong>Possible solutions:</strong></p>
                        <ul style="text-align: left; display: inline-block;">
                            <li>Enable CORS proxy at <a href="https://cors-anywhere.herokuapp.com/corsdemo" target="_blank">cors-anywhere.herokuapp.com/corsdemo</a></li>
                            <li>Check your internet connection</li>
                            <li>Try refreshing the page</li>
                        </ul>
                    </div>
                    <button onclick="initializeMLBGame()" style="margin-top: 15px; padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">Try Again</button>
                </div>
            </div>
        `;
    }
    
    async function loadAllPlayers() {
        try {
            // Get all MLB teams first
            const teamsResponse = await fetch(`${CORS_PROXY}${MLB_API_BASE}/teams?sportId=1`);
            if (!teamsResponse.ok) throw new Error('Failed to fetch teams');
            const teamsData = await teamsResponse.json();
            
            const allPlayersData = [];
            
            // Get rosters for each team
            for (const team of teamsData.teams) {
                try {
                    const rosterResponse = await fetch(`${CORS_PROXY}${MLB_API_BASE}/teams/${team.id}/roster?rosterType=active`);
                    if (!rosterResponse.ok) continue;
                    const rosterData = await rosterResponse.json();
                    
                    // Get detailed player info for position players only
                    const positionPlayers = rosterData.roster.filter(p => 
                        p.position.type !== 'Pitcher' && p.person
                    );
                    
                    if (positionPlayers.length > 0) {
                        const playerIds = positionPlayers.map(p => p.person.id).join(',');
                        const playersResponse = await fetch(`${CORS_PROXY}${MLB_API_BASE}/people?personIds=${playerIds}&hydrate=currentTeam`);
                        
                        if (playersResponse.ok) {
                            const playersData = await playersResponse.json();
                            allPlayersData.push(...playersData.people.map(player => ({
                                id: player.id,
                                fullName: player.fullName,
                                firstName: player.firstName,
                                lastName: player.lastName,
                                primaryPosition: player.primaryPosition?.abbreviation || 'OF',
                                team: player.currentTeam?.name || team.name,
                                teamId: player.currentTeam?.id || team.id,
                                birthCountry: player.birthCountry || 'USA'
                            })));
                        }
                    }
                } catch (error) {
                    console.warn(`Failed to load roster for team ${team.name}:`, error);
                }
            }
            
            allPlayers = allPlayersData;
            console.log(`Loaded ${allPlayers.length} active position players`);
            
        } catch (error) {
            console.error('Failed to load players:', error);
            throw error;
        }
    }
    
    async function load2025Games() {
        try {
            // Get 2025 regular season schedule
            const scheduleResponse = await fetch(`${CORS_PROXY}${MLB_API_BASE}/schedule?sportId=1&season=2025&gameType=R&hydrate=team`);
            if (!scheduleResponse.ok) throw new Error('Failed to fetch schedule');
            const scheduleData = await scheduleResponse.json();
            
            const games = [];
            for (const date of scheduleData.dates) {
                games.push(...date.games.filter(game => game.status.statusCode === 'F')); // Only completed games
            }
            
            console.log(`Found ${games.length} completed 2025 games`);
            return games;
            
        } catch (error) {
            console.error('Failed to load 2025 games:', error);
            throw error;
        }
    }
    
    async function selectRandomGame(games) {
        if (!games || games.length === 0) {
            throw new Error('No completed games found');
        }
        
        let attempts = 0;
        const maxAttempts = 10;
        
        while (attempts < maxAttempts) {
            const randomGame = games[Math.floor(Math.random() * games.length)];
            
            try {
                // Get box score for this game
                const boxscoreResponse = await fetch(`${CORS_PROXY}${MLB_API_BASE}/game/${randomGame.gamePk}/boxscore`);
                if (!boxscoreResponse.ok) {
                    attempts++;
                    continue;
                }
                
                const boxscoreData = await boxscoreResponse.json();
                
                // Find a position player with interesting stats
                const interestingPlayers = findInterestingPlayers(boxscoreData);
                
                if (interestingPlayers.length > 0) {
                    const selectedPlayer = interestingPlayers[Math.floor(Math.random() * interestingPlayers.length)];
                    
                    // Get detailed player info
                    const playerResponse = await fetch(`${CORS_PROXY}${MLB_API_BASE}/people/${selectedPlayer.id}?hydrate=currentTeam`);
                    if (!playerResponse.ok) {
                        attempts++;
                        continue;
                    }
                    
                    const playerData = await playerResponse.json();
                    const player = playerData.people[0];
                    
                    currentGame = {
                        gamePk: randomGame.gamePk,
                        date: randomGame.gameDate,
                        homeTeam: randomGame.teams.home.team.name,
                        awayTeam: randomGame.teams.away.team.name,
                        player: {
                            id: player.id,
                            fullName: player.fullName,
                            team: player.currentTeam?.name || selectedPlayer.team,
                            position: player.primaryPosition?.abbreviation || selectedPlayer.position,
                            birthCountry: player.birthCountry || 'USA'
                        },
                        stats: selectedPlayer.stats,
                        statline: selectedPlayer.statline
                    };
                    
                    console.log('Selected game:', currentGame);
                    return;
                }
            } catch (error) {
                console.warn(`Failed to process game ${randomGame.gamePk}:`, error);
            }
            
            attempts++;
        }
        
        throw new Error('Could not find suitable game after multiple attempts');
    }
    
    function findInterestingPlayers(boxscoreData) {
        const interestingPlayers = [];
        
        ['home', 'away'].forEach(side => {
            const team = boxscoreData.teams[side];
            if (!team.players) return;
            
            Object.values(team.players).forEach(playerData => {
                const player = playerData.person;
                const stats = playerData.stats?.batting;
                
                if (!stats || !player) return;
                
                // Skip pitchers
                if (playerData.allPositions?.some(pos => pos.type === 'Pitcher')) return;
                
                // Check for interesting performance
                const hits = parseInt(stats.hits) || 0;
                const homeRuns = parseInt(stats.homeRuns) || 0;
                const rbi = parseInt(stats.rbi) || 0;
                const stolenBases = parseInt(stats.stolenBases) || 0;
                const atBats = parseInt(stats.atBats) || 0;
                
                if (hits >= 2 || homeRuns >= 1 || rbi >= 2 || stolenBases >= 1) {
                    // Create statline
                    let statline = `${hits}-for-${atBats}`;
                    const extraStats = [];
                    
                    if (homeRuns > 0) extraStats.push(`${homeRuns} HR`);
                    if (rbi > 0) extraStats.push(`${rbi} RBI`);
                    if (stolenBases > 0) extraStats.push(`${stolenBases} SB`);
                    
                    if (extraStats.length > 0) {
                        statline += `, ${extraStats.join(', ')}`;
                    }
                    
                    interestingPlayers.push({
                        id: player.id,
                        team: team.team.name,
                        position: playerData.position?.abbreviation || 'OF',
                        stats: stats,
                        statline: statline
                    });
                }
            });
        });
        
        return interestingPlayers;
    }
    
    function displayGameInfo() {
        if (!currentGame) return;
        
        const gameDate = new Date(currentGame.date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        document.getElementById('gameInfo').innerHTML = `
            <h3>🔍 Guess This Player</h3>
            <div style="font-size: 18px; font-weight: bold; margin: 10px 0; color: #007bff;">
                ${currentGame.statline}
            </div>
            <div style="color: #666; margin-bottom: 10px;">
                ${gameDate}: ${currentGame.awayTeam} @ ${currentGame.homeTeam}
            </div>
            <div style="font-size: 14px; color: #888;">
                Guesses remaining: <span id="guessesRemaining">${maxGuesses}</span>
            </div>
        `;
    }
    
    function setupSearchableDropdown() {
        const input = document.getElementById('playerInput');
        const dropdown = document.getElementById('playerDropdown');
        
        input.addEventListener('input', function() {
            const query = this.value.toLowerCase().trim();
            
            if (query.length < 2) {
                dropdown.style.display = 'none';
                return;
            }
            
            const matches = allPlayers.filter(player => 
                player.fullName.toLowerCase().includes(query) ||
                player.team.toLowerCase().includes(query) ||
                player.primaryPosition.toLowerCase().includes(query)
            ).slice(0, 10);
            
            if (matches.length > 0) {
                dropdown.innerHTML = matches.map(player => 
                    `<div onclick="selectPlayer('${player.fullName}')" style="padding: 10px; cursor: pointer; border-bottom: 1px solid #eee;" onmouseover="this.style.background='#f0f0f0'" onmouseout="this.style.background='white'">
                        <strong>${player.fullName}</strong> - ${player.team} (${player.primaryPosition})
                    </div>`
                ).join('');
                dropdown.style.display = 'block';
            } else {
                dropdown.style.display = 'none';
            }
        });
        
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                makeGuess();
            }
        });
        
        // Hide dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!input.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.style.display = 'none';
            }
        });
    }
    
    window.selectPlayer = function(playerName) {
        document.getElementById('playerInput').value = playerName;
        document.getElementById('playerDropdown').style.display = 'none';
    };
    
    function makeGuess() {
        if (gameOver || isLoading) return;
        
        const playerName = document.getElementById('playerInput').value.trim();
        if (!playerName) return;
        
        const guessedPlayer = allPlayers.find(p => 
            p.fullName.toLowerCase() === playerName.toLowerCase()
        );
        
        if (!guessedPlayer) {
            showFeedback('❌ Player not found. Please select from the dropdown.', 'error');
            return;
        }
        
        if (guesses.some(g => g.player.id === guessedPlayer.id)) {
            showFeedback('❌ You already guessed this player!', 'error');
            return;
        }
        
        const isCorrect = guessedPlayer.id === currentGame.player.id;
        
        const feedback = {
            team: guessedPlayer.team === currentGame.player.team,
            position: guessedPlayer.primaryPosition === currentGame.player.position,
            nationality: guessedPlayer.birthCountry === currentGame.player.birthCountry
        };
        
        guesses.push({
            player: guessedPlayer,
            feedback: feedback,
            correct: isCorrect
        });
        
        displayGuesses();
        
        if (isCorrect) {
            gameWon = true;
            gameOver = true;
            showFeedback('🎉 Correct! Great job!', 'success');
            endGame();
        } else if (guesses.length >= maxGuesses) {
            gameOver = true;
            showFeedback(`❌ Out of guesses! The answer was ${currentGame.player.fullName}`, 'error');
            endGame();
        } else {
            const remaining = maxGuesses - guesses.length;
            showFeedback(`❌ Incorrect. ${remaining} guess${remaining !== 1 ? 'es' : ''} remaining.`, 'error');
            document.getElementById('guessesRemaining').textContent = remaining;
        }
        
        document.getElementById('playerInput').value = '';
        document.getElementById('playerDropdown').style.display = 'none';
    }
    
    function displayGuesses() {
        const guessList = document.getElementById('guessList');
        
        if (guesses.length === 0) {
            guessList.innerHTML = '';
            return;
        }
        
        guessList.innerHTML = `
            <h4>Your Guesses:</h4>
            <div style="display: grid; gap: 10px;">
                ${guesses.map((guess, index) => `
                    <div style="background: ${guess.correct ? '#d4edda' : '#f8f9fa'}; padding: 12px; border-radius: 8px; border-left: 4px solid ${guess.correct ? '#28a745' : '#6c757d'};">
                        <div style="font-weight: bold; margin-bottom: 5px;">
                            ${index + 1}. ${guess.player.fullName}
                        </div>
                        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                            <span style="background: ${guess.feedback.team ? '#28a745' : '#dc3545'}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px;">
                                Team: ${guess.feedback.team ? '✅' : '❌'}
                            </span>
                            <span style="background: ${guess.feedback.position ? '#28a745' : '#dc3545'}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px;">
                                Position: ${guess.feedback.position ? '✅' : '❌'}
                            </span>
                            <span style="background: ${guess.feedback.nationality ? '#28a745' : '#dc3545'}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px;">
                                Nationality: ${guess.feedback.nationality ? '✅' : '❌'}
                            </span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    function showFeedback(message, type) {
        const feedback = document.getElementById('feedback');
        feedback.textContent = message;
        feedback.style.color = type === 'success' ? '#28a745' : '#dc3545';
        
        setTimeout(() => {
            if (feedback.textContent === message) {
                feedback.textContent = '';
            }
        }, 3000);
    }
    
    function endGame() {
        document.getElementById('guessSection').style.display = 'none';
        document.getElementById('gameEndContainer').style.display = 'block';
        
        const revealSection = document.getElementById('revealSection');
        revealSection.innerHTML = `
            <h3>${gameWon ? '🎉 Congratulations!' : '😔 Game Over'}</h3>
            <div style="margin: 15px 0;">
                <strong>Answer: ${currentGame.player.fullName}</strong>
            </div>
            <div style="color: #666; margin-bottom: 10px;">
                Team: ${currentGame.player.team}<br>
                Position: ${currentGame.player.position}<br>
                Nationality: ${currentGame.player.birthCountry}
            </div>
            <div style="font-size: 16px; font-weight: bold; color: #007bff;">
                Final Statline: ${currentGame.statline}
            </div>
            <div style="margin-top: 10px; color: #666;">
                Game: ${currentGame.awayTeam} @ ${currentGame.homeTeam}
            </div>
        `;
    }
    
    function startNewGame() {
        guesses = [];
        gameOver = false;
        gameWon = false;
        currentGame = null;
        
        document.getElementById('guessSection').style.display = 'block';
        document.getElementById('gameEndContainer').style.display = 'none';
        document.getElementById('guessList').innerHTML = '';
        document.getElementById('feedback').textContent = '';
        document.getElementById('playerInput').value = '';
        
        // Reload with cached data or fresh if needed
        initializeMLBGame();
    }
    
    // Caching functions
    function getCachedData() {
        try {
            const cached = localStorage.getItem('mlbStatShuffleCache');
            if (!cached) return null;
            
            const data = JSON.parse(cached);
            const oneHour = 60 * 60 * 1000;
            
            if (Date.now() - data.timestamp > oneHour) {
                localStorage.removeItem('mlbStatShuffleCache');
                return null;
            }
            
            return data;
        } catch (error) {
            return null;
        }
    }
    
    function setCachedData(data) {
        try {
            localStorage.setItem('mlbStatShuffleCache', JSON.stringify(data));
        } catch (error) {
            console.warn('Failed to cache data:', error);
        }
    }
    
    // Global functions
    window.makeGuess = makeGuess;
    window.startNewGame = startNewGame;
    
})(); 