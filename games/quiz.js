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
    
    // Initialize the game when this script loads
    window.initializeGame = function() {
        showMLBStatShuffleGame();
    };
    
    function showMLBStatShuffleGame() {
        document.getElementById('game-container').innerHTML = `
            <div style="text-align: center; max-width: 800px; margin: 0 auto;" id="gameContainer">
                <h2>MLB Stat Shuffle</h2>
                <p style="margin-bottom: 20px; color: #666;">Guess the MLB player from their single-game statline!</p>
                
                <div id="loadingContainer" style="display: block; margin: 40px 0;">
                    <div style="font-size: 18px; margin-bottom: 10px;">🔄 Loading game data...</div>
                    <div style="color: #666;">Fetching 2025 season data from MLB API</div>
                </div>
                
                <div id="gameContent" style="display: none;">
                    <div id="statlineContainer" style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px; border: 2px solid #007cba;">
                        <div id="gameDate" style="font-size: 14px; color: #666; margin-bottom: 10px;"></div>
                        <div id="teamMatchup" style="font-size: 16px; font-weight: bold; color: #333; margin-bottom: 15px;"></div>
                        <div id="statline" style="font-size: 20px; font-weight: bold; color: #007cba;"></div>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <div style="margin-bottom: 10px; position: relative;">
                            <label for="playerInput" style="display: block; margin-bottom: 5px; font-weight: bold;">Guess the player:</label>
                            <input 
                                id="playerInput" 
                                type="text" 
                                placeholder="Type player name..."
                                style="width: 300px; padding: 10px; font-size: 16px; border: 2px solid #ccc; border-radius: 4px;"
                                autocomplete="off"
                            />
                            <div id="playerDropdown" style="position: absolute; top: 100%; left: 0; right: 0; background: white; border: 2px solid #ccc; border-top: none; border-radius: 0 0 4px 4px; max-height: 200px; overflow-y: auto; display: none; z-index: 1000;">
                            </div>
                        </div>
                        <button id="guessButton" onclick="makeGuess()" disabled style="padding: 10px 20px; background: #007cba; color: white; border: none; cursor: not-allowed; font-size: 16px; margin-top: 10px; border-radius: 4px;">
                            Make Guess
                        </button>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <span style="font-size: 1.2rem; font-weight: bold;">Guesses: <span id="guessCount">0</span> / ${maxGuesses}</span>
                    </div>
                    
                    <div id="gameStatus" style="margin-bottom: 20px; font-size: 1.1rem; font-weight: bold;"></div>
                    
                    <div id="guessesContainer" style="margin-bottom: 20px;">
                        <div id="guessesHeader" style="display: none;">
                            <h3>Your Guesses:</h3>
                            <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 10px; margin-bottom: 10px; font-weight: bold; background: #f0f0f0; padding: 10px; border-radius: 5px;">
                                <div>Player</div>
                                <div>Team</div>
                                <div>Position</div>
                                <div>Nationality</div>
                            </div>
                        </div>
                        <div id="guessesList"></div>
                    </div>
                    
                    <div style="margin-top: 20px;">
                        <button id="newGameButton" onclick="startNewGame()" style="padding: 10px 20px; background: white; border: 2px solid black; cursor: pointer; margin-right: 10px; font-size: 16px; border-radius: 4px;">
                            New Game
                        </button>
                        <button onclick="goHome()" style="padding: 10px 20px; background: white; border: 2px solid black; cursor: pointer; font-size: 16px; border-radius: 4px;">
                            Back to Home
                        </button>
                    </div>
                </div>
                
                <div style="margin-top: 20px; font-size: 0.9rem; color: #666;">
                    <p><strong>How to play:</strong> Look at the statline and try to guess which MLB player achieved it!</p>
                    <p>🟢 <strong>Green:</strong> Correct match | ⬜ <strong>Gray:</strong> Wrong match</p>
                </div>
            </div>
        `;
        
        initializeGame();
    }
    
    async function initializeGame() {
        try {
            isLoading = true;
            await loadPlayersData();
            await loadRandomGame();
            
            document.getElementById('loadingContainer').style.display = 'none';
            document.getElementById('gameContent').style.display = 'block';
            
            setupSearchableDropdown();
            displayGameInfo();
            isLoading = false;
        } catch (error) {
            console.error('Error initializing game:', error);
            showError('Failed to load game data. Please try again.');
        }
    }
    
    function showError(message) {
        document.getElementById('loadingContainer').innerHTML = `
            <div style="color: red; font-size: 18px; margin-bottom: 10px;">❌ Error</div>
            <div style="color: #666;">${message}</div>
            <button onclick="location.reload()" style="margin-top: 15px; padding: 10px 20px; background: #007cba; color: white; border: none; border-radius: 4px; cursor: pointer;">
                Try Again
            </button>
        `;
    }
    
    async function loadPlayersData() {
        try {
            // Check if we have cached players data
            const cachedPlayers = localStorage.getItem('mlbPlayers2025');
            if (cachedPlayers) {
                allPlayers = JSON.parse(cachedPlayers);
                return;
            }
            
            // Fetch all MLB teams
            const teamsResponse = await fetch('https://statsapi.mlb.com/api/v1/teams?sportId=1');
            const teamsData = await teamsResponse.json();
            
            const players = [];
            
            // Fetch roster for each team
            for (const team of teamsData.teams) {
                try {
                    const rosterResponse = await fetch(`https://statsapi.mlb.com/api/v1/teams/${team.id}/roster/fullseason`);
                    const rosterData = await rosterResponse.json();
                    
                    // Filter for position players (not pitchers)
                    const positionPlayers = rosterData.roster.filter(player => 
                        player.position.type !== 'Pitcher'
                    );
                    
                    if (positionPlayers.length > 0) {
                        const playerIds = positionPlayers.map(p => p.person.id).join(',');
                        const playersResponse = await fetch(`https://statsapi.mlb.com/api/v1/people?personIds=${playerIds}`);
                        const playersData = await playersResponse.json();
                        
                        for (const player of playersData.people) {
                            const rosterPlayer = positionPlayers.find(p => p.person.id === player.id);
                            players.push({
                                id: player.id,
                                name: player.fullName,
                                team: team.abbreviation,
                                teamName: team.name,
                                position: rosterPlayer.position.abbreviation,
                                nationality: player.birthCountry || 'USA'
                            });
                        }
                    }
                } catch (error) {
                    console.warn(`Failed to load roster for ${team.name}:`, error);
                }
            }
            
            allPlayers = players;
            // Cache for 24 hours
            localStorage.setItem('mlbPlayers2025', JSON.stringify(allPlayers));
            localStorage.setItem('mlbPlayersTimestamp', Date.now().toString());
            
        } catch (error) {
            console.error('Error loading players:', error);
            throw new Error('Failed to load player data');
        }
    }
    
    async function loadRandomGame() {
        try {
            // Check if we have cached games
            const cachedGames = localStorage.getItem('mlbGames2025');
            const cacheTimestamp = localStorage.getItem('mlbGamesTimestamp');
            const oneHour = 60 * 60 * 1000;
            
            let games = [];
            
            if (cachedGames && cacheTimestamp && (Date.now() - parseInt(cacheTimestamp)) < oneHour) {
                games = JSON.parse(cachedGames);
            } else {
                // Fetch 2025 regular season games
                const scheduleResponse = await fetch('https://statsapi.mlb.com/api/v1/schedule?sportId=1&season=2025&gameType=R');
                const scheduleData = await scheduleResponse.json();
                
                games = [];
                scheduleData.dates.forEach(date => {
                    date.games.forEach(game => {
                        if (game.status.statusCode === 'F') { // Only completed games
                            games.push({
                                gamePk: game.gamePk,
                                date: game.officialDate,
                                homeTeam: game.teams.home.team.abbreviation,
                                awayTeam: game.teams.away.team.abbreviation
                            });
                        }
                    });
                });
                
                // Cache for 1 hour
                localStorage.setItem('mlbGames2025', JSON.stringify(games));
                localStorage.setItem('mlbGamesTimestamp', Date.now().toString());
            }
            
            if (games.length === 0) {
                throw new Error('No completed games found for 2025 season');
            }
            
            // Try to find a good game with interesting stats
            let attempts = 0;
            const maxAttempts = 10;
            
            while (attempts < maxAttempts) {
                const randomGame = games[Math.floor(Math.random() * games.length)];
                const gameData = await loadGameData(randomGame.gamePk);
                
                if (gameData) {
                    currentGame = {
                        ...randomGame,
                        ...gameData
                    };
                    return;
                }
                
                attempts++;
            }
            
            throw new Error('Could not find a suitable game');
            
        } catch (error) {
            console.error('Error loading game:', error);
            throw new Error('Failed to load game data');
        }
    }
    
    async function loadGameData(gamePk) {
        try {
            const boxscoreResponse = await fetch(`https://statsapi.mlb.com/api/v1/game/${gamePk}/boxscore`);
            const boxscoreData = await boxscoreResponse.json();
            
            const allBatters = [];
            
            // Collect all batters from both teams
            ['home', 'away'].forEach(side => {
                const batters = boxscoreData.teams[side].batters || [];
                batters.forEach(batterId => {
                    const batterStats = boxscoreData.teams[side].players[`ID${batterId}`];
                    if (batterStats && batterStats.stats.batting) {
                        const stats = batterStats.stats.batting;
                        // Filter for interesting performances
                        if (stats.hits >= 2 || stats.homeRuns >= 1 || stats.rbi >= 2 || stats.stolenBases >= 1) {
                            allBatters.push({
                                playerId: batterId,
                                playerName: batterStats.person.fullName,
                                team: boxscoreData.teams[side].team.abbreviation,
                                position: batterStats.position?.abbreviation || 'OF',
                                stats: stats
                            });
                        }
                    }
                });
            });
            
            if (allBatters.length === 0) {
                return null; // No interesting performances
            }
            
            // Pick a random interesting batter
            const selectedBatter = allBatters[Math.floor(Math.random() * allBatters.length)];
            
            // Get player nationality
            let nationality = 'USA';
            try {
                const playerResponse = await fetch(`https://statsapi.mlb.com/api/v1/people/${selectedBatter.playerId}`);
                const playerData = await playerResponse.json();
                nationality = playerData.people[0].birthCountry || 'USA';
            } catch (error) {
                console.warn('Could not fetch player nationality');
            }
            
            // Format statline
            const stats = selectedBatter.stats;
            const statlineParts = [];
            
            if (stats.atBats > 0) {
                statlineParts.push(`${stats.hits}-for-${stats.atBats}`);
            }
            if (stats.homeRuns > 0) {
                statlineParts.push(`${stats.homeRuns} HR`);
            }
            if (stats.rbi > 0) {
                statlineParts.push(`${stats.rbi} RBI`);
            }
            if (stats.stolenBases > 0) {
                statlineParts.push(`${stats.stolenBases} SB`);
            }
            if (stats.runs > 0) {
                statlineParts.push(`${stats.runs} R`);
            }
            
            return {
                playerId: selectedBatter.playerId,
                playerName: selectedBatter.playerName,
                playerTeam: selectedBatter.team,
                playerPosition: selectedBatter.position,
                playerNationality: nationality,
                statline: statlineParts.join(', ')
            };
            
        } catch (error) {
            console.error('Error loading game data:', error);
            return null;
        }
    }
    
    let selectedPlayerIndex = null;
    let filteredPlayers = [];
    let highlightedIndex = -1;
    
    function setupSearchableDropdown() {
        const input = document.getElementById('playerInput');
        const dropdown = document.getElementById('playerDropdown');
        
        // Sort players alphabetically
        const sortedPlayers = allPlayers
            .map((player, originalIndex) => ({ player, originalIndex }))
            .sort((a, b) => a.player.name.localeCompare(b.player.name));
        
        // Input event for filtering
        input.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            
            if (searchTerm.length === 0) {
                hideDropdown();
                clearSelection();
                return;
            }
            
            // Filter players based on name
            filteredPlayers = sortedPlayers.filter(({ player }) => 
                player.name.toLowerCase().includes(searchTerm)
            );
            
            highlightedIndex = -1;
            showFilteredResults();
        });
        
        // Focus event
        input.addEventListener('focus', function() {
            if (this.value.length > 0) {
                showFilteredResults();
            }
        });
        
        // Keyboard navigation
        input.addEventListener('keydown', function(e) {
            if (filteredPlayers.length === 0) return;
            
            switch(e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    highlightedIndex = Math.min(highlightedIndex + 1, filteredPlayers.length - 1);
                    updateHighlight();
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    highlightedIndex = Math.max(highlightedIndex - 1, -1);
                    updateHighlight();
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (highlightedIndex >= 0) {
                        selectPlayer(filteredPlayers[highlightedIndex]);
                    }
                    break;
                case 'Escape':
                    hideDropdown();
                    break;
            }
        });
        
        // Click outside to close
        document.addEventListener('click', function(e) {
            if (!input.contains(e.target) && !dropdown.contains(e.target)) {
                hideDropdown();
            }
        });
    }
    
    function showFilteredResults() {
        const dropdown = document.getElementById('playerDropdown');
        
        if (filteredPlayers.length === 0) {
            dropdown.innerHTML = '<div style="padding: 10px; color: #666;">No players found</div>';
        } else {
            dropdown.innerHTML = filteredPlayers.slice(0, 10).map(({ player, originalIndex }, index) => 
                `<div class="player-option" data-index="${originalIndex}" data-highlight-index="${index}" style="padding: 10px; cursor: pointer; border-bottom: 1px solid #eee;">
                    ${player.name} <span style="color: #666;">(${player.team} ${player.position})</span>
                </div>`
            ).join('');
            
            // Add click listeners to options
            dropdown.querySelectorAll('.player-option').forEach(option => {
                option.addEventListener('click', function() {
                    const originalIndex = parseInt(this.dataset.index);
                    const playerData = allPlayers[originalIndex];
                    selectPlayer({ player: playerData, originalIndex });
                });
                
                option.addEventListener('mouseenter', function() {
                    highlightedIndex = parseInt(this.dataset.highlightIndex);
                    updateHighlight();
                });
            });
        }
        
        dropdown.style.display = 'block';
    }
    
    function updateHighlight() {
        const dropdown = document.getElementById('playerDropdown');
        const options = dropdown.querySelectorAll('.player-option');
        
        options.forEach((option, index) => {
            if (index === highlightedIndex) {
                option.style.background = '#007cba';
                option.style.color = 'white';
            } else {
                option.style.background = 'white';
                option.style.color = 'black';
            }
        });
    }
    
    function selectPlayer({ player, originalIndex }) {
        const input = document.getElementById('playerInput');
        
        input.value = player.name;
        selectedPlayerIndex = originalIndex;
        hideDropdown();
        updateGuessButton();
    }
    
    function hideDropdown() {
        document.getElementById('playerDropdown').style.display = 'none';
        highlightedIndex = -1;
    }
    
    function clearSelection() {
        selectedPlayerIndex = null;
        updateGuessButton();
    }
    
    function updateGuessButton() {
        const guessButton = document.getElementById('guessButton');
        if (selectedPlayerIndex !== null && !gameOver && !isLoading) {
            guessButton.disabled = false;
            guessButton.style.cursor = 'pointer';
            guessButton.style.background = '#007cba';
        } else {
            guessButton.disabled = true;
            guessButton.style.cursor = 'not-allowed';
            guessButton.style.background = '#ccc';
        }
    }
    
    function displayGameInfo() {
        if (!currentGame) return;
        
        const gameDate = new Date(currentGame.date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        document.getElementById('gameDate').textContent = gameDate;
        document.getElementById('teamMatchup').textContent = `${currentGame.awayTeam} @ ${currentGame.homeTeam}`;
        document.getElementById('statline').textContent = currentGame.statline;
    }
    
    function makeGuess() {
        if (selectedPlayerIndex === null || gameOver || isLoading) return;
        
        const guessedPlayer = allPlayers[selectedPlayerIndex];
        
        // Check if already guessed
        if (guesses.some(g => g.name === guessedPlayer.name)) {
            alert('You already guessed that player!');
            return;
        }
        
        guesses.push(guessedPlayer);
        updateGuessesDisplay();
        
        // Check for win
        if (guessedPlayer.name === currentGame.playerName) {
            gameWon = true;
            gameOver = true;
            showGameResult(true);
        } else {
            if (guesses.length >= maxGuesses) {
                gameOver = true;
                showGameResult(false);
            }
        }
        
        updateGuessCount();
        
        // Reset input
        document.getElementById('playerInput').value = '';
        selectedPlayerIndex = null;
        hideDropdown();
        updateGuessButton();
    }
    
    function updateGuessesDisplay() {
        const header = document.getElementById('guessesHeader');
        const list = document.getElementById('guessesList');
        
        if (guesses.length > 0) {
            header.style.display = 'block';
        }
        
        // Clear and rebuild the list
        list.innerHTML = '';
        
        guesses.forEach(guess => {
            const row = document.createElement('div');
            row.style.cssText = 'display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 10px; margin-bottom: 5px; padding: 10px; border-radius: 5px; border: 1px solid #ddd;';
            
            // Player name
            row.appendChild(createCell(guess.name, '#f8f9fa'));
            
            // Team
            const teamMatch = guess.team === currentGame.playerTeam;
            row.appendChild(createCell(guess.team, teamMatch ? '#90EE90' : '#D3D3D3'));
            
            // Position
            const positionMatch = guess.position === currentGame.playerPosition;
            row.appendChild(createCell(guess.position, positionMatch ? '#90EE90' : '#D3D3D3'));
            
            // Nationality
            const nationalityMatch = guess.nationality === currentGame.playerNationality;
            row.appendChild(createCell(guess.nationality, nationalityMatch ? '#90EE90' : '#D3D3D3'));
            
            list.appendChild(row);
        });
    }
    
    function createCell(content, backgroundColor) {
        const cell = document.createElement('div');
        cell.textContent = content;
        cell.style.cssText = `background: ${backgroundColor}; padding: 8px; text-align: center; border-radius: 3px; font-weight: bold;`;
        return cell;
    }
    
    function updateGuessCount() {
        document.getElementById('guessCount').textContent = guesses.length;
    }
    
    function showGameResult(won) {
        const statusDiv = document.getElementById('gameStatus');
        if (won) {
            statusDiv.innerHTML = `🎉 <span style="color: green;">Congratulations! You guessed ${currentGame.playerName}!</span>`;
        } else {
            statusDiv.innerHTML = `😔 <span style="color: red;">Game Over! The answer was ${currentGame.playerName} (${currentGame.playerTeam} ${currentGame.playerPosition})</span>`;
        }
        updateNewGameButton();
    }
    
    function updateNewGameButton() {
        const newGameButton = document.getElementById('newGameButton');
        if (gameOver) {
            newGameButton.style.background = '#28a745';
            newGameButton.style.color = 'white';
            newGameButton.style.border = 'none';
        } else {
            newGameButton.style.background = 'white';
            newGameButton.style.color = 'black';
            newGameButton.style.border = '2px solid black';
        }
    }
    
    async function startNewGame() {
        // Reset game state
        guesses = [];
        gameWon = false;
        gameOver = false;
        selectedPlayerIndex = null;
        
        // Clear UI
        document.getElementById('guessesList').innerHTML = '';
        document.getElementById('guessesHeader').style.display = 'none';
        document.getElementById('gameStatus').innerHTML = '';
        document.getElementById('guessCount').textContent = '0';
        document.getElementById('playerInput').value = '';
        
        // Show loading
        document.getElementById('gameContent').style.display = 'none';
        document.getElementById('loadingContainer').style.display = 'block';
        document.getElementById('loadingContainer').innerHTML = `
            <div style="font-size: 18px; margin-bottom: 10px;">🔄 Loading new game...</div>
            <div style="color: #666;">Finding an interesting statline...</div>
        `;
        
        try {
            isLoading = true;
            await loadRandomGame();
            displayGameInfo();
            
            document.getElementById('loadingContainer').style.display = 'none';
            document.getElementById('gameContent').style.display = 'block';
            
            hideDropdown();
            updateGuessButton();
            updateNewGameButton();
            isLoading = false;
        } catch (error) {
            console.error('Error starting new game:', error);
            showError('Failed to load new game. Please try again.');
        }
    }
    
    // Global functions
    window.makeGuess = makeGuess;
    window.startNewGame = startNewGame;
})(); 