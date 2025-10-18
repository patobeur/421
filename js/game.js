class Game {
    constructor(updateUI, aiRollCallback) {
        this.updateUI = updateUI;
        this.aiRoll = aiRollCallback;
        this.players = [];
        this.tokens = 11;
        this.currentPlayerIndex = 0;
        this.phase = 'charge';
        this.turnRolls = 0;
        this.lastRoll = [];
        this.keptDice = [];
        this.turnScores = [];
        this.isGameInProgress = false;
        this.message = "Configurez votre partie pour commencer.";
        this.diceValue = "";
    }

    start() {
        this.isGameInProgress = true;
        this.currentPlayerIndex = 0;
        this.turnScores = new Array(this.players.length).fill(null);
        this.takeTurn();
    }

    addPlayer() {
        if (this.isGameInProgress) return;
        this.players.push({ name: `Joueur ${this.players.filter(p => !p.isAI).length + 1}`, score: 0, isAI: false });
        this.updateUI(this.getState());
    }

    removePlayer() {
        if (this.isGameInProgress || this.players.filter(p => !p.isAI).length <= 1) return;
        const index = this.players.findIndex(p => !p.isAI);
        if (index > -1) this.players.splice(index, 1);
        this.updateUI(this.getState());
    }

    addAI() {
        if (this.isGameInProgress) return;
        this.players.push({ name: `IA ${this.players.filter(p => p.isAI).length + 1}`, score: 0, isAI: true });
        this.updateUI(this.getState());
    }

    removeAI() {
        if (this.isGameInProgress || this.players.filter(p => p.isAI).length <= 0) return;
        const index = this.players.findIndex(p => p.isAI);
        if (index > -1) this.players.splice(index, 1);
        this.updateUI(this.getState());
    }

    renamePlayer(index, newName) {
        if (this.isGameInProgress) return;
        this.players[index].name = newName;
        this.updateUI(this.getState());
    }

    takeTurn() {
        this.turnRolls = 0;
        this.keptDice = [];
        const currentPlayer = this.players[this.currentPlayerIndex];
        this.message = `C'est au tour de ${currentPlayer.name}.`;
        this.diceValue = "";
        this.updateUI(this.getState());

        if (currentPlayer.isAI) {
            this.playAITurn();
        }
    }

    handleRollResult(diceValues) {
        this.lastRoll = diceValues.sort((a, b) => b - a);
        const combination = this.evaluateCombination(this.lastRoll);
        this.diceValue = `${combination.name} (${this.getTokensForCombination(combination)} fiches)`;

        if (this.players[this.currentPlayerIndex].isAI || this.turnRolls >= 3) {
            this.endTurn();
        }
        this.updateUI(this.getState());
    }

    endTurn() {
        const combination = this.evaluateCombination(this.lastRoll);
        this.turnScores[this.currentPlayerIndex] = combination;
        this.message = `${this.players[this.currentPlayerIndex].name} termine son tour avec un ${combination.name}.`;

        this.currentPlayerIndex++;
        if (this.currentPlayerIndex >= this.players.length) {
            this.endRound();
        } else {
            this.takeTurn();
        }
    }

    endRound() {
        this.message = "Fin du tour de table. Calcul des scores...";
        let highestScore = { rank: -1, playerIndex: -1 };
        let lowestScore = { rank: Infinity, playerIndex: -1 };

        this.turnScores.forEach((score, index) => {
            if (score.rank > highestScore.rank) highestScore = { ...score, playerIndex: index };
            if (score.rank < lowestScore.rank) lowestScore = { ...score, playerIndex: index };
        });

        const tokens = this.getTokensForCombination(highestScore);
        const loser = this.players[lowestScore.playerIndex];
        const winner = this.players[highestScore.playerIndex];

        if (this.phase === 'charge') {
            const tokensToTake = Math.min(tokens, this.tokens);
            loser.score += tokensToTake;
            this.tokens -= tokensToTake;
            this.message = `${loser.name} prend ${tokensToTake} jetons.`;
            if (this.tokens <= 0) {
                this.phase = 'decharge';
                this.message += " La phase de décharge commence !";
            }
        } else { // decharge phase
            const tokensToGive = Math.min(tokens, winner.score);
            winner.score -= tokensToGive;
            loser.score += tokensToGive;
            this.message = `${winner.name} donne ${tokensToGive} jetons à ${loser.name}.`;
        }

        this.currentPlayerIndex = 0;
        this.turnScores.fill(null);
        this.updateUI(this.getState());
        this.saveState();
        setTimeout(() => this.takeTurn(), 2000);
    }

    playAITurn() {
        console.log("AI is thinking...");
        this.turnRolls++;

        if (this.turnRolls > 1) {
            const counts = {};
            this.lastRoll.forEach(d => counts[d] = (counts[d] || 0) + 1);
            this.keptDice = this.decideBestDiceToKeep(this.lastRoll, counts);
        }

        setTimeout(() => {
            this.aiRoll(this.keptDice);
        }, 1500);
    }

    decideBestDiceToKeep(dice, counts) {
        if (dice.includes(4) && dice.includes(2) && dice.includes(1)) return [4, 2, 1];
        for (const [val, count] of Object.entries(counts)) {
            if (count === 3) return [parseInt(val)];
        }
        if (counts[1] >= 2) return [1, 1];
        if (counts[1]) return [1];
        for (const [val, count] of Object.entries(counts)) {
            if (count === 2) return [parseInt(val), parseInt(val)];
        }
        return [Math.max(...dice)];
    }

    saveState() {
        if (!this.isGameInProgress) return;
        const gameState = {
            players: this.players,
            tokens: this.tokens,
            currentPlayerIndex: this.currentPlayerIndex,
            phase: this.phase,
            isGameInProgress: this.isGameInProgress,
        };
        localStorage.setItem('421gameState', JSON.stringify(gameState));
    }

    loadState() {
        const savedState = localStorage.getItem('421gameState');
        if (savedState) {
            const gameState = JSON.parse(savedState);
            this.players = gameState.players;
            this.tokens = gameState.tokens;
            this.currentPlayerIndex = gameState.currentPlayerIndex;
            this.phase = gameState.phase;
            this.isGameInProgress = gameState.isGameInProgress;
            return true;
        }
        return false;
    }

    getState() {
        return {
            players: this.players,
            currentPlayerIndex: this.currentPlayerIndex,
            message: this.message,
            isGameInProgress: this.isGameInProgress,
            turnRolls: this.turnRolls,
            diceValue: this.diceValue,
        };
    }

    evaluateCombination(dice) {
        dice.sort((a, b) => b - a);
        const [d1, d2, d3] = dice;
        if (d1 === 4 && d2 === 2 && d3 === 1) return { name: "421", rank: 1000 };
        if (d1 === d2 && d2 === d3) {
            if (d1 === 1) return { name: "Brelan d'As", rank: 900 };
            return { name: `Brelan de ${d1}`, rank: 800 + d1 };
        }
        if (d2 === 1 && d3 === 1) return { name: `Fiche de ${d1}`, rank: 700 + d1 };
        if (d1 === d2 + 1 && d2 === d3 + 1) return { name: "Suite", rank: 600 };
        if (d1 === 2 && d2 === 2 && d3 === 1) return { name: "Nénette", rank: 100 };
        return { name: `Classique ${d1}${d2}${d3}`, rank: d1 * 100 + d2 * 10 + d3 };
    }

    getTokensForCombination(combination) {
        if (combination.rank === 1000) return 10;
        if (combination.rank >= 900) return 7;
        if (combination.rank >= 800) return combination.rank - 800;
        if (combination.rank >= 700) return combination.rank - 700;
        if (combination.rank >= 600) return 2;
        if (combination.rank === 100) return 4;
        return 1;
    }
}

export default Game;