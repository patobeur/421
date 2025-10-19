import { bus } from './eventbus.js';

class AI {
    constructor(name) {
        this.name = name;
    }

    playTurn(gameState) {
        console.log(`${this.name} is thinking...`);

        setTimeout(() => {
            bus.emit('rollDice');
        }, 1000);

        setTimeout(() => {
            const dice = gameState.dice;
            const frozen = [false, false, false];
            const counts = {};
            dice.forEach(d => counts[d] = (counts[d] || 0) + 1);

            if (dice.includes(4) && dice.includes(2) && dice.includes(1)) {
                // We have a 421, freeze all dice
                frozen.fill(true);
            } else {
                // Freeze pairs
                for (let i = 0; i < 3; i++) {
                    if (counts[dice[i]] > 1) {
                        frozen[i] = true;
                    }
                }
            }

            bus.emit('freezeDice', frozen);

            setTimeout(() => {
                bus.emit('rollDice');
            }, 1000);

            setTimeout(() => {
                bus.emit('endTurn');
            }, 2000);

        }, 2000);
    }
}

export default AI;
