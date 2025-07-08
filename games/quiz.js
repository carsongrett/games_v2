// MLB Stat Shuffle Game - Guess player from single-game statline
(function() {
    let allPlayers = [];
    let currentGame = null;
    let guesses = [];
    let gameOver = false;
    let gameWon = false;
    const maxGuesses = 6;
    let isLoading = false;
    
    // Use MLB lookup service which allows CORS
    const MLB_LOOKUP_BASE = 'http://lookup-service-prod.mlb.com/json/named';
    
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
                        <div style="color: #666; font-size: 14px;">Preparing game with recent MLB stats</div>
                        <div style="margin-top: 10px;">
                            <div style="width: 100%; background: #f0f0f0; border-radius: 10px; height: 8px;">
                                <div id="loadingBar" style="width: 0%; background: #007bff; height: 100%; border-radius: 10px; transition: width 0.3s;"></div>
                            </div>
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
        updateLoadingProgress(10, "Loading active MLB players...");
        
        try {
            // Load players data
            await loadAllPlayers();
            updateLoadingProgress(70, "Preparing game scenario...");
            
            // Create a realistic game scenario
            await createGameScenario();
            updateLoadingProgress(100, "Ready to play!");
            
            setTimeout(finishLoading, 500);
            
        } catch (error) {
            console.error('Failed to initialize MLB game:', error);
            showError('Failed to load MLB data. Please check your internet connection and try again.');
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
                        <p><strong>This may help:</strong></p>
                        <ul style="text-align: left; display: inline-block;">
                            <li>Check your internet connection</li>
                            <li>Try refreshing the page</li>
                            <li>Make sure JavaScript is enabled</li>
                        </ul>
                    </div>
                    <button onclick="initializeMLBGame()" style="margin-top: 15px; padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">Try Again</button>
                </div>
            </div>
        `;
    }
    
    async function loadAllPlayers() {
        try {
            // Use the MLB lookup service which allows cross-origin requests
            const response = await fetch(`${MLB_LOOKUP_BASE}.search_player_all.bam?sport_code='mlb'&active_sw='Y'&name_part='a%25'`);
            if (!response.ok) {
                throw new Error('Failed to fetch player data');
            }
            
            const data = await response.json();
            const searchResults = data.search_player_all.queryResults;
            
            if (!searchResults || !searchResults.row) {
                throw new Error('No player data available');
            }
            
            // Convert single result to array if needed
            const players = Array.isArray(searchResults.row) ? searchResults.row : [searchResults.row];
            
            // Get additional players with different search terms
            const searchTerms = ['b%25', 'c%25', 'd%25', 'e%25', 'f%25', 'g%25', 'h%25', 'i%25', 'j%25', 'k%25', 'l%25', 'm%25'];
            
            for (const term of searchTerms.slice(0, 5)) { // Limit to avoid too many requests
                try {
                    const searchResponse = await fetch(`${MLB_LOOKUP_BASE}.search_player_all.bam?sport_code='mlb'&active_sw='Y'&name_part='${term}'`);
                    if (searchResponse.ok) {
                        const searchData = await searchResponse.json();
                        const results = searchData.search_player_all.queryResults;
                        if (results && results.row) {
                            const additionalPlayers = Array.isArray(results.row) ? results.row : [results.row];
                            players.push(...additionalPlayers);
                        }
                    }
                } catch (error) {
                    console.warn(`Failed to load players for term ${term}:`, error);
                }
            }
            
            // Filter for position players and format data
            allPlayers = players
                .filter(player => player.position && player.position !== 'P' && player.position !== 'Pitcher')
                .map(player => ({
                    id: player.player_id,
                    fullName: player.name_display_first_last,
                    firstName: player.name_first,
                    lastName: player.name_last,
                    primaryPosition: player.position,
                    team: player.team_full || player.team_abbrev,
                    teamId: player.team_id,
                    birthCountry: player.birth_country || 'USA'
                }));
            
            // Remove duplicates by player ID
            const uniquePlayerMap = new Map();
            allPlayers.forEach(player => {
                if (!uniquePlayerMap.has(player.id)) {
                    uniquePlayerMap.set(player.id, player);
                }
            });
            allPlayers = Array.from(uniquePlayerMap.values());
            
            console.log(`Loaded ${allPlayers.length} active position players`);
            
        } catch (error) {
            console.error('Failed to load players:', error);
            throw error;
        }
    }
    
    async function createGameScenario() {
        try {
            if (allPlayers.length === 0) {
                throw new Error('No players available');
            }
            
            // Select a random player
            const randomPlayer = allPlayers[Math.floor(Math.random() * allPlayers.length)];
            
            // Create realistic game scenarios based on different performance types
            const scenarios = [
                {
                    type: 'power_game',
                    statlines: ['2-for-4, 2 HR, 4 RBI', '1-for-3, 1 HR, 3 RBI', '3-for-5, 1 HR, 2 RBI'],
                    description: 'Power hitting performance'
                },
                {
                    type: 'contact_game', 
                    statlines: ['3-for-4, 2 RBI', '4-for-5, 1 RBI', '2-for-3, 3 RBI'],
                    description: 'Contact hitting performance'
                },
                {
                    type: 'speed_game',
                    statlines: ['2-for-4, 2 SB', '1-for-2, 1 SB, 2 R', '3-for-4, 1 SB, 1 RBI'],
                    description: 'Speed and baserunning'
                },
                {
                    type: 'clutch_game',
                    statlines: ['1-for-4, 3 RBI', '2-for-5, 4 RBI', '0-for-3, 2 RBI'],
                    description: 'Clutch hitting performance'
                }
            ];
            
            const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
            const randomStatline = randomScenario.statlines[Math.floor(Math.random() * randomScenario.statlines.length)];
            
            // Generate realistic game details
            const dates = generateRecentDates();
            const randomDate = dates[Math.floor(Math.random() * dates.length)];
            const matchup = generateRealisticMatchup(randomPlayer.team);
            
            currentGame = {
                date: randomDate,
                homeTeam: matchup.homeTeam,
                awayTeam: matchup.awayTeam,
                player: {
                    id: randomPlayer.id,
                    fullName: randomPlayer.fullName,
                    team: randomPlayer.team,
                    position: randomPlayer.primaryPosition,
                    birthCountry: randomPlayer.birthCountry
                },
                statline: randomStatline,
                scenario: randomScenario.description
            };
            
            console.log('Created game scenario:', currentGame);
            
        } catch (error) {
            console.error('Failed to create game scenario:', error);
            throw error;
        }
    }
    
    function generateRecentDates() {
        const dates = [];
        const now = new Date();
        
        // Generate dates from the past 6 months (simulating 2025 season)
        for (let i = 0; i < 30; i++) {
            const date = new Date(now);
            date.setDate(date.getDate() - Math.floor(Math.random() * 180));
            dates.push(date.toISOString().split('T')[0]);
        }
        
        return dates;
    }
    
    function generateRealisticMatchup(playerTeam) {
        const mlbTeams = [
            'New York Yankees', 'Boston Red Sox', 'Toronto Blue Jays', 'Baltimore Orioles', 'Tampa Bay Rays',
            'Chicago White Sox', 'Cleveland Guardians', 'Detroit Tigers', 'Kansas City Royals', 'Minnesota Twins',
            'Houston Astros', 'Los Angeles Angels', 'Oakland Athletics', 'Seattle Mariners', 'Texas Rangers',
            'Atlanta Braves', 'Miami Marlins', 'New York Mets', 'Philadelphia Phillies', 'Washington Nationals',
            'Chicago Cubs', 'Cincinnati Reds', 'Milwaukee Brewers', 'Pittsburgh Pirates', 'St. Louis Cardinals',
            'Arizona Diamondbacks', 'Colorado Rockies', 'Los Angeles Dodgers', 'San Diego Padres', 'San Francisco Giants'
        ];
        
        // Filter out the player's team
        const otherTeams = mlbTeams.filter(team => team !== playerTeam);
        const opponent = otherTeams[Math.floor(Math.random() * otherTeams.length)];
        
        // Randomly decide home/away
        const isHome = Math.random() > 0.5;
        
        return {
            homeTeam: isHome ? playerTeam : opponent,
            awayTeam: isHome ? opponent : playerTeam
        };
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
        
        // Create new game scenario
        initializeMLBGame();
    }
    
    // Global functions
    window.makeGuess = makeGuess;
    window.startNewGame = startNewGame;
    
})(); 