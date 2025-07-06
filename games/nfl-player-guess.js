// NFL Player Guessing Game - Weddle Style Implementation
(function() {
    let playersData = [];
    let targetPlayer = null;
    let guesses = [];
    let gameWon = false;
    let gameOver = false;
    const maxGuesses = 8;
    
    // Initialize the game when this script loads
    window.initializeGame = function() {
        showNFLPlayerGame();
    };
    
    function showNFLPlayerGame() {
        document.getElementById('game-container').innerHTML = `
            <div style="text-align: center; max-width: 1000px; margin: 0 auto;">
                <h2>Guess the NFL Player</h2>
                <p style="margin-bottom: 20px; color: #666;">Guess the mystery NFL player in 8 tries!</p>
                
                <div style="margin-bottom: 20px;">
                    <div style="margin-bottom: 10px;">
                        <label for="playerSelect" style="display: block; margin-bottom: 5px; font-weight: bold;">Select a player:</label>
                        <select id="playerSelect" style="width: 300px; padding: 8px; font-size: 16px; border: 2px solid #ccc;">
                            <option value="">Loading players...</option>
                        </select>
                    </div>
                    <button id="guessButton" onclick="makeGuess()" disabled style="padding: 10px 20px; background: #007cba; color: white; border: none; cursor: not-allowed; font-size: 16px; margin-top: 10px;">
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
                        <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr 1fr; gap: 5px; margin-bottom: 10px; font-weight: bold; background: #f0f0f0; padding: 10px; border-radius: 5px;">
                            <div>Player</div>
                            <div>Conference</div>
                            <div>Team</div>
                            <div>Position</div>
                            <div>Rec Yds</div>
                            <div>Rush Yds</div>
                            <div>TDs</div>
                        </div>
                    </div>
                    <div id="guessesList"></div>
                </div>
                
                <div style="margin-top: 20px;">
                    <button onclick="startNewGame()" style="padding: 10px 20px; background: #28a745; color: white; border: none; cursor: pointer; margin-right: 10px; font-size: 16px;">
                        New Game
                    </button>
                    <button onclick="goHome()" style="padding: 10px 20px; background: white; border: 2px solid black; cursor: pointer; font-size: 16px;">
                        Back to Home
                    </button>
                </div>
                
                <div style="margin-top: 20px; font-size: 0.9rem; color: #666;">
                    <p><strong>How to play:</strong> Guess the mystery NFL player using the dropdown menu.</p>
                    <p>🟢 <strong>Green:</strong> Correct match | 🟡 <strong>Yellow:</strong> Close (within 3 TDs or 200 yards) | ⬜ <strong>Gray:</strong> Wrong</p>
                    <p>↑ <strong>Arrow up:</strong> Target is higher | ↓ <strong>Arrow down:</strong> Target is lower</p>
                </div>
            </div>
        `;
        
        loadPlayersData();
    }
    
    async function loadPlayersData() {
        try {
            const response = await fetch('./data/nfl_players.csv');
            const csvText = await response.text();
            
            // Parse CSV data
            const lines = csvText.trim().split('\n');
            const headers = lines[0].split(',');
            
            playersData = lines.slice(1).map(line => {
                const values = parseCSVLine(line);
                return {
                    Player: values[0],
                    Conference: values[1],
                    Team: values[2],
                    Position: values[3],
                    RecYds: parseInt(values[4]),
                    RushYds: parseInt(values[5]),
                    TDs: parseInt(values[6])
                };
            });
            
            populatePlayerDropdown();
            selectRandomTarget();
            
        } catch (error) {
            console.error('Error loading players data:', error);
            document.getElementById('playerSelect').innerHTML = '<option value="">Error loading players</option>';
        }
    }
    
    function parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        
        result.push(current);
        return result;
    }
    
    function populatePlayerDropdown() {
        const select = document.getElementById('playerSelect');
        
        // Sort players alphabetically but keep original indices
        const sortedPlayers = playersData
            .map((player, originalIndex) => ({ player, originalIndex }))
            .sort((a, b) => a.player.Player.localeCompare(b.player.Player));
        
        select.innerHTML = '<option value="">Choose a player...</option>';
        
        sortedPlayers.forEach(({ player, originalIndex }) => {
            const option = document.createElement('option');
            option.value = originalIndex; // Use original index from playersData
            option.textContent = `${player.Player} (${player.Team} ${player.Position})`;
            select.appendChild(option);
        });
        
        // Enable the guess button when a player is selected
        select.addEventListener('change', function() {
            const guessButton = document.getElementById('guessButton');
            if (this.value !== '' && !gameOver) {
                guessButton.disabled = false;
                guessButton.style.cursor = 'pointer';
                guessButton.style.background = '#007cba';
            } else {
                guessButton.disabled = true;
                guessButton.style.cursor = 'not-allowed';
                guessButton.style.background = '#ccc';
            }
        });
    }
    
    function selectRandomTarget() {
        const randomIndex = Math.floor(Math.random() * playersData.length);
        targetPlayer = playersData[randomIndex];
        console.log('Target player:', targetPlayer.Player); // For debugging
    }
    
    function makeGuess() {
        const select = document.getElementById('playerSelect');
        const selectedIndex = parseInt(select.value);
        
        if (isNaN(selectedIndex) || gameOver) return;
        
        const guessedPlayer = playersData[selectedIndex];
        
        // Check if already guessed
        if (guesses.some(g => g.Player === guessedPlayer.Player)) {
            alert('You already guessed that player!');
            return;
        }
        
        guesses.push(guessedPlayer);
        updateGuessesDisplay();
        
        // Check for win
        if (guessedPlayer.Player === targetPlayer.Player) {
            gameWon = true;
            gameOver = true;
            showGameResult(true);
        } else if (guesses.length >= maxGuesses) {
            gameOver = true;
            showGameResult(false);
        }
        
        updateGuessCount();
        
        // Reset dropdown
        select.value = '';
        document.getElementById('guessButton').disabled = true;
        document.getElementById('guessButton').style.cursor = 'not-allowed';
        document.getElementById('guessButton').style.background = '#ccc';
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
            row.style.cssText = 'display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr 1fr; gap: 5px; margin-bottom: 5px; padding: 10px; border-radius: 5px; border: 1px solid #ddd;';
            
            // Player name
            row.appendChild(createCell(guess.Player, '#f8f9fa'));
            
            // Conference
            row.appendChild(createCell(guess.Conference, getMatchColor(guess.Conference, targetPlayer.Conference)));
            
            // Team
            row.appendChild(createCell(guess.Team, getMatchColor(guess.Team, targetPlayer.Team)));
            
            // Position
            row.appendChild(createCell(guess.Position, getMatchColor(guess.Position, targetPlayer.Position)));
            
            // Receiving Yards
            row.appendChild(createCell(
                guess.RecYds + getArrow(guess.RecYds, targetPlayer.RecYds, 200),
                getNumericMatchColor(guess.RecYds, targetPlayer.RecYds, 200)
            ));
            
            // Rushing Yards
            row.appendChild(createCell(
                guess.RushYds + getArrow(guess.RushYds, targetPlayer.RushYds, 200),
                getNumericMatchColor(guess.RushYds, targetPlayer.RushYds, 200)
            ));
            
            // Touchdowns
            row.appendChild(createCell(
                guess.TDs + getArrow(guess.TDs, targetPlayer.TDs, 3),
                getNumericMatchColor(guess.TDs, targetPlayer.TDs, 3)
            ));
            
            list.appendChild(row);
        });
    }
    
    function createCell(content, backgroundColor) {
        const cell = document.createElement('div');
        cell.textContent = content;
        cell.style.cssText = `background: ${backgroundColor}; padding: 8px; text-align: center; border-radius: 3px; font-weight: bold;`;
        return cell;
    }
    
    function getMatchColor(guessValue, targetValue) {
        return guessValue === targetValue ? '#90EE90' : '#D3D3D3'; // Green or Gray
    }
    
    function getNumericMatchColor(guessValue, targetValue, threshold) {
        if (guessValue === targetValue) {
            return '#90EE90'; // Green
        } else if (Math.abs(guessValue - targetValue) <= threshold) {
            return '#FFD700'; // Yellow
        } else {
            return '#D3D3D3'; // Gray
        }
    }
    
    function getArrow(guessValue, targetValue, threshold) {
        if (guessValue === targetValue) {
            return ''; // No arrow for exact match
        } else if (Math.abs(guessValue - targetValue) <= threshold) {
            return guessValue < targetValue ? ' ↑' : ' ↓';
        } else {
            return guessValue < targetValue ? ' ↑' : ' ↓';
        }
    }
    
    function updateGuessCount() {
        document.getElementById('guessCount').textContent = guesses.length;
    }
    
    function showGameResult(won) {
        const statusDiv = document.getElementById('gameStatus');
        if (won) {
            statusDiv.innerHTML = `🎉 <span style="color: green;">Congratulations! You guessed ${targetPlayer.Player}!</span>`;
        } else {
            statusDiv.innerHTML = `😔 <span style="color: red;">Game Over! The answer was ${targetPlayer.Player} (${targetPlayer.Team} ${targetPlayer.Position})</span>`;
        }
    }
    
    function startNewGame() {
        guesses = [];
        gameWon = false;
        gameOver = false;
        
        document.getElementById('guessesList').innerHTML = '';
        document.getElementById('guessesHeader').style.display = 'none';
        document.getElementById('gameStatus').innerHTML = '';
        document.getElementById('guessCount').textContent = '0';
        document.getElementById('playerSelect').value = '';
        
        selectRandomTarget();
        
        const guessButton = document.getElementById('guessButton');
        guessButton.disabled = true;
        guessButton.style.cursor = 'not-allowed';
        guessButton.style.background = '#ccc';
    }
    
    // Global functions
    window.makeGuess = makeGuess;
    window.startNewGame = startNewGame;
    
    // Auto-initialize when script loads
    if (window.initializeGame) {
        window.initializeGame();
    }
})(); 