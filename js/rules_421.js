/**
 * Analyse les résultats des dés pour déterminer la combinaison, son score et son rang.
 * Un rang plus élevé est meilleur.
 * @param {number[]} dice - Un tableau de 3 nombres représentant les faces des dés.
 * @returns {{name: string, score: number, rank: number, dice: number[]}}
 */
export function getCombination(dice) {
    const sortedDice = [...dice].sort((a, b) => b - a);
    const [d1, d2, d3] = sortedDice;
    const diceStr = sortedDice.join('');

    // 421 : La plus haute combinaison
    if (diceStr === '421') {
        return { name: "421", score: 10, rank: 100, dice: sortedDice };
    }

    // Fiches : [X, 1, 1] - plus fort que n'importe quelle baraque
    if (d2 === 1 && d3 === 1 && d1 !== 1) {
        return { name: `Fiche de ${d1}`, score: d1, rank: 60 + d1, dice: sortedDice };
    }

    // Baraques : [X, X, X]
    if (d1 === d2 && d2 === d3) {
        const score = (d1 === 1) ? 7 : d1;
        const name = (d1 === 1) ? "Brelan d'As" : `Brelan de ${d1}`;
        const rank = (d1 === 1) ? 57 : 50 + d1; // Le Brelan d'As est la meilleure baraque
        return { name, score, rank, dice: sortedDice };
    }

    // Tierces : [X, X-1, X-2]
    if (d1 === d2 + 1 && d2 === d3 + 1) {
        const name = `Suite ${d1}${d2}${d3}`;
        return { name, score: 2, rank: 40 + d1, dice: sortedDice };
    }

    // Nénette : [2, 2, 1]
    if (diceStr === '221') {
        return { name: "Nénette", score: 1, rank: 20, dice: sortedDice };
    }

    // Toutes les autres combinaisons, classées par leurs chiffres
    const name = `${d1}, ${d2}, ${d3}`;
    const rank = 10 + (d1 * 100 + d2 * 10 + d3) / 100; // ex: 665 -> 16.65, 322 -> 13.22
    return { name, score: 1, rank, dice: sortedDice };
}
