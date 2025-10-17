/**
 * Manages the game state and logic for the 421 game.
 */
import eventBus from './eventbus.js';

class Game {
    /**
     * @param {string[]} playerNames - An array of player names.
     * @param {number} initialTokens - The number of tokens to start with in the pot.
     */
    constructor(playerNames, initialTokens = 11) {
        this.players = playerNames.map(name => ({
            name: name,
            score: 0, // Tokens held by the player
            isAI: !name.toLowerCase().includes("joueur")
        }));
        this.tokens = initialTokens; // Tokens in the pot
        this.currentPlayerIndex = 0;
        this.phase = 'charge'; // 'charge' or 'decharge'
        this.turnRolls = 0;
        this.turnScores = []; // Stores the combination object for each player for the current round
        this.lastRoll = []; // Stores the dice values of the last roll
    }

    manualEndTurn() {
        if (this.players[this.currentPlayerIndex].isAI) return; // Only for human players
        this.turnScores[this.currentPlayerIndex] = this.evaluateCombination(this.lastRoll);
        this.endTurn();
    }

    /**
     * Saves the current game state to localStorage.
     */
    saveState() {
        const gameState = {
            players: this.players,
            tokens: this.tokens,
            currentPlayerIndex: this.currentPlayerIndex,
            phase: this.phase,
        };
        localStorage.setItem('gameState421', JSON.stringify(gameState));
    }

    /**
     * Loads the game state from localStorage.
     * @returns {boolean} - True if a state was loaded, false otherwise.
     */
    loadState() {
        const savedState = localStorage.getItem('gameState421');
        if (savedState) {
            const gameState = JSON.parse(savedState);
            this.players = gameState.players;
            this.tokens = gameState.tokens;
            this.currentPlayerIndex = gameState.currentPlayerIndex;
            this.phase = gameState.phase;
            return true;
        }
        return false;
    }

    start() {
        console.log("Le jeu commence !");
        this.updateUI();
        // Start the game with the first player, if it's an AI
        if (this.players[this.currentPlayerIndex].isAI) {
            this.playAITurn();
        }
    }

    updateUI() {
        const playersContainer = document.getElementById('players-container');
        playersContainer.innerHTML = '';
        this.players.forEach((player, index) => {
            const playerDiv = document.createElement('div');
            playerDiv.className = 'player-area';
            playerDiv.innerHTML = `
                <h3>${player.name} <button class="rename-btn" data-index="${index}">✏️</button></h3>
                <p class="score">Jetons: ${player.score}</p>
            `;
            if (this.players[this.currentPlayerIndex].name === player.name) {
                playerDiv.setAttribute('data-current', 'true');
            }
            playersContainer.appendChild(playerDiv);
        });

        document.querySelectorAll('.rename-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const playerIndex = e.target.getAttribute('data-index');
                const newName = prompt("Entrez le nouveau nom :");
                if (newName) {
                    this.renamePlayer(playerIndex, newName);
                }
            });
        });

        const isHumanTurn = !this.players[this.currentPlayerIndex].isAI;
        document.getElementById('roll-dice-btn').disabled = !isHumanTurn;
        document.getElementById('end-turn-btn').disabled = !isHumanTurn;

        console.log(`Jetons restants dans la pioche: ${this.tokens}`);
    }

    renamePlayer(playerIndex, newName) {
        this.players[playerIndex].name = newName;
        this.updateUI();
        this.saveState();
    }

    rollDice(diceValues) {
        this.lastRoll = diceValues;
        this.turnRolls++;
        const combination = this.evaluateCombination(diceValues);
        console.log(`Lancer ${this.turnRolls}: ${diceValues.join(', ')} - Combinaison: ${combination.name}, Rang: ${combination.rank}`);

        const currentPlayer = this.players[this.currentPlayerIndex];
        const endOfPlayerTurn = (this.turnRolls >= 3);

        if (currentPlayer.isAI && !endOfPlayerTurn) {
            try {
                this.playAITurn(diceValues);
            } catch (error) {
                console.error("Erreur lors du tour de l'IA :", error);
                this.nextPlayer(); // Skip AI turn on error
            }
        } else if (endOfPlayerTurn) {
            this.turnScores[this.currentPlayerIndex] = combination;
            if (this.turnScores.filter(s => s).length === this.players.length) {
                this.endRound();
            } else {
                this.nextPlayer();
            }
        }
    }

    manualEndTurn() {
        if (this.players[this.currentPlayerIndex].isAI) return;
        this.turnScores[this.currentPlayerIndex] = this.evaluateCombination(this.lastRoll);
        if (this.turnScores.filter(s => s).length === this.players.length) {
            this.endRound();
        } else {
            this.nextPlayer();
        }
    }

    getTokensForCombination(combination) {
        if (combination.rank === 1000) return 10; // 421
        if (combination.rank >= 900) return 7; // Brelan d'As
        if (combination.rank >= 800) return combination.rank - 800; // Brelan
        if (combination.rank >= 700) return combination.rank - 700; // Fiche
        if (combination.rank >= 600) return 2; // Suite
        if (combination.rank === 100) return 4; // Nenette - typically worth more than 1
        return 1; // Classique
    }

    decideBestDiceToKeep(dice, counts) {
        // Always keep 421
        if (dice.includes(4) && dice.includes(2) && dice.includes(1)) {
            return [4, 2, 1];
        }

        // Keep brelans
        for (const [val, count] of Object.entries(counts)) {
            if (count === 3) return [parseInt(val)];
        }

        // Keep pairs of aces, otherwise keep single ace
        if (counts[1] >= 2) return [1, 1];
        if (counts[1]) return [1];

        // Keep other pairs
        for (const [val, count] of Object.entries(counts)) {
            if (count === 2) return [parseInt(val), parseInt(val)];
        }

        // Keep high dice
        return [Math.max(...dice)];
    }

    playAITurn(diceValues) {
        console.log(`${this.players[this.currentPlayerIndex].name} joue...`);

        if (diceValues) {
            const counts = {};
            diceValues.forEach(d => counts[d] = (counts[d] || 0) + 1);

            let toKeep = this.decideBestDiceToKeep(diceValues, counts);

            diceValues.forEach((diceValue, index) => {
                const shouldKeep = toKeep.includes(diceValue);
                // This logic needs to be improved to handle duplicate dice values
                if (shouldKeep) {
                    eventBus.publish('toggleDiceKeep', index);
                    toKeep.splice(toKeep.indexOf(diceValue), 1);
                }
            });
        }

        setTimeout(() => {
            eventBus.publish('rollDice');
        }, 1500);
    }

    endRound() {
        // All players have played, now distribute tokens
        let highestScore = { rank: -1, playerIndex: -1 };
        let lowestScore = { rank: Infinity, playerIndex: -1 };

        this.turnScores.forEach((score, index) => {
            if (score.rank > highestScore.rank) {
                highestScore = { ...score, playerIndex: index };
            }
            if (score.rank < lowestScore.rank) {
                lowestScore = { ...score, playerIndex: index };
            }
        });

        console.log(`Le plus haut score est ${highestScore.name} par ${this.players[highestScore.playerIndex].name}`);
        console.log(`Le plus bas score est ${lowestScore.name} par ${this.players[lowestScore.playerIndex].name}`);

        if (this.phase === 'charge') {
            const tokensToTake = this.getTokensForCombination(highestScore);
            this.players[lowestScore.playerIndex].score += Math.min(tokensToTake, this.tokens);
            this.tokens -= tokensToTake;
            console.log(`${this.players[lowestScore.playerIndex].name} prend ${tokensToTake} jetons.`);
            if (this.tokens <= 0) {
                this.phase = 'decharge';
                console.log("Phase de décharge commence !");
            }
        } else { // decharge phase
            const tokensToGive = this.getTokensForCombination(highestScore);
            this.players[highestScore.playerIndex].score -= tokensToGive;
            this.players[lowestScore.playerIndex].score += tokensToGive;
            console.log(`${this.players[highestScore.playerIndex].name} donne ${tokensToGive} jetons à ${this.players[lowestScore.playerIndex].name}.`);
        }

        this.turnScores = []; // Reset for next round
        this.nextPlayer();
    }

    nextPlayer() {
        eventBus.publish('resetDiceKeep');

        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        this.turnRolls = 0;
        console.log(`C'est au tour de ${this.players[this.currentPlayerIndex].name}`);
        this.updateUI();
        this.saveState(); // Save state at the beginning of each turn

        if (this.players[this.currentPlayerIndex].isAI) {
            this.playAITurn();
        }
    }

    evaluateCombination(dice) {
        dice.sort((a, b) => b - a);
        const [d1, d2, d3] = dice;

        // 421
        if (d1 === 4 && d2 === 2 && d3 === 1) return { name: "421", rank: 1000 };

        // Brelans
        if (d1 === d2 && d2 === d3) {
            if (d1 === 1) return { name: "Brelan d'As", rank: 900 };
            return { name: `Brelan de ${d1}`, rank: 800 + d1 };
        }

        // Fiches (deux as)
        if (d2 === 1 && d3 === 1) return { name: `Fiche de ${d1}`, rank: 700 + d1 };

        // Suites
        if (d1 === d2 + 1 && d2 === d3 + 1) return { name: "Suite", rank: 600 };

        // Nénette
        if (d1 === 2 && d2 === 2 && d3 === 1) return { name: "Nénette", rank: 100 };

        // Combinaisons classiques (ordre des dés)
        return { name: `Classique ${d1}${d2}${d3}`, rank: d1 * 100 + d2 * 10 + d3 };
    }
}

export default Game;