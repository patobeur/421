import { bus } from './eventbus.js';
import AI from './ai.js';

class Game {
    constructor() {
        this.players = [];
        this.currentPlayerIndex = 0;
        this.tokens = 11;
        this.dice = [];
        bus.on('startGame', this.startGame.bind(this));
        bus.on('diceRollComplete', this.handleDiceRoll.bind(this));
        this.load();
    }

    save() {
        const gameState = {
            players: this.players.map(p => ({ name: p.name, type: p.type || 'human' })),
            currentPlayerIndex: this.currentPlayerIndex,
            tokens: this.tokens,
        };
        localStorage.setItem('421game', JSON.stringify(gameState));
    }

    load() {
        const savedState = localStorage.getItem('421game');
        if (savedState) {
            const gameState = JSON.parse(savedState);
            this.players = gameState.players.map(p => {
                if (p.type === 'ai') {
                    return new AI(p.name);
                }
                return p;
            });
            this.currentPlayerIndex = gameState.currentPlayerIndex;
            this.tokens = gameState.tokens;
            console.log('Game loaded:', this.getState());
        }
    }

    startGame(playerData) {
        this.players = playerData.players.map(p => {
            if (p.type === 'ai') {
                return new AI(p.name);
            }
            return p;
        });
        console.log('Game started with:', this.players);
        this.nextTurn();
    }

    nextTurn() {
        this.rollsLeft = 3;
        this.updateUI();
        const currentPlayer = this.players[this.currentPlayerIndex];
        if (currentPlayer instanceof AI) {
            const action = currentPlayer.playTurn({ dice: this.dice, ...this.getState() });
            // Handle AI action
        }
    }

    endTurn() {
        const currentPlayer = this.players[this.currentPlayerIndex];
        currentPlayer.score = this.calculateScore(this.dice);

        if (this.currentPlayerIndex === this.players.length - 1) {
            this.endRound();
        }

        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        this.save();
        this.nextTurn();
    }

    endRound() {
        let loser = this.players[0];
        let winner = this.players[0];

        this.players.forEach(p => {
            if (p.score < loser.score) loser = p;
            if (p.score > winner.score) winner = p;
        });

        const tokensToTransfer = Math.min(this.tokens, winner.score === 1000 ? 4 : 1);
        loser.tokens = (loser.tokens || 0) + tokensToTransfer;
        this.tokens -= tokensToTransfer;

        if (loser.tokens >= 11) {
            alert(`${loser.name} has lost the game!`);
            this.resetGame();
        } else if (this.tokens <= 0) {
            alert(`${winner.name} has won the game!`);
            this.resetGame();
        }
    }

    resetGame() {
        this.tokens = 11;
        this.players.forEach(p => p.tokens = 0);
        this.currentPlayerIndex = 0;
    }

    getState() {
        return {
            players: this.players,
            currentPlayerIndex: this.currentPlayerIndex,
            tokens: this.tokens,
        };
    }

    rollDice() {
        bus.emit('rollDice');
    }

    handleDiceRoll(results) {
        console.log('Dice roll results:', results);
        this.dice = results.sort((a, b) => b - a);
        this.rollsLeft--;
        this.updateUI();
    }

    calculateScore(dice) {
        if (!dice || dice.length < 3) return 0;
        const sortedDice = [...dice].sort((a, b) => b - a);
        const d_str = sortedDice.join('');

        // 421
        if (d_str === '421') return 1000;

        // Fiches (deux as)
        if (sortedDice[0] === 1 && sortedDice[1] === 1) {
            return 800 + sortedDice[2]; // 1,1,6 -> 806
        }

        // Baraques (brelans)
        if (sortedDice[0] === sortedDice[1] && sortedDice[1] === sortedDice[2]) {
            if (sortedDice[0] === 1) return 707; // 1,1,1 vaut 7 points, le plus fort des brelans
            return 700 + sortedDice[0]; // 6,6,6 -> 706
        }

        // Tierces (suites)
        if (sortedDice[0] - 1 === sortedDice[1] && sortedDice[1] - 1 === sortedDice[2]) {
            return 600;
        }

        // Nénette
        if (d_str === '221') return 1;

        // Autres combinaisons
        return parseInt(d_str, 10);
    }

    updateUI() {
        const playersInfo = document.getElementById('players-info');
        playersInfo.innerHTML = this.players.map((p, i) => `
            <div class="${i === this.currentPlayerIndex ? 'active' : ''}">
                ${p.name}: ${p.tokens || 0} tokens
            </div>
        `).join('');

        const gameState = document.getElementById('game-state');
        gameState.innerHTML = `Tokens restants: ${this.tokens}`;

        const rollInfo = document.getElementById('roll-info');
        rollInfo.innerHTML = `Lancers restants: ${this.rollsLeft}`;
    }
}

const game = new Game();
export default game;

document.addEventListener('DOMContentLoaded', () => {
    const rollDiceButton = document.getElementById('roll-dice');
    rollDiceButton.addEventListener('click', () => {
        if (game.rollsLeft > 0) {
            game.rollDice();
        }
    });

    const endTurnButton = document.getElementById('end-turn');
    endTurnButton.addEventListener('click', () => {
        game.endTurn();
    });
});
