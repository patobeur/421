    calculateScore(dice) {
        const sortedDice = [...dice].sort((a, b) => b - a);
        const diceString = sortedDice.join('');

        // 421
        if (diceString === '421') {
            return 10;
        }

        // Brelans (Triplets)
        if (sortedDice[0] === sortedDice[1] && sortedDice[1] === sortedDice[2]) {
            if (sortedDice[0] === 1) {
                return 7; // Brelan d'as
            }
            return sortedDice[0]; // Brelan de 2 à 6
        }

        // Fiches (Pairs of aces)
        if (sortedDice[0] === 1 && sortedDice[1] === 1) {
            return sortedDice[2];
        }

        // Suites (Straights)
        if (sortedDice[0] - 1 === sortedDice[1] && sortedDice[1] - 1 === sortedDice[2]) {
            return 2;
        }

        // Nénette
        if (diceString === '221') {
            return 1;
        }

        // Autres
        return 1;
    }
