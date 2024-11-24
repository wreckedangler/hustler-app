const gameLogic = require("../hustler-app-backend/gameAlgorithm");

function simulateGames(initialPot, numberOfGames) {
    const betTypes = ["2x", "4x", "8x", "50x", "500x", "Jackpot"];
    let pot = initialPot;
    let totalBets = 0;
    let totalWinnings = 0;
    let totalGames = 0;
    let betStats = {
        "2x": { count: 0, totalBet: 0, totalWin: 0 },
        "4x": { count: 0, totalBet: 0, totalWin: 0 },
        "8x": { count: 0, totalBet: 0, totalWin: 0 },
        "50x": { count: 0, totalBet: 0, totalWin: 0 },
        "500x": { count: 0, totalBet: 0, totalWin: 0 },
        "Jackpot": { count: 0, totalBet: 0, totalWin: 0 },
    };

    // Wahrscheinlichkeiten für die normalen Einsätze
    const betAmounts = [
        { value: 1, probability: 0.15 },
        { value: 2, probability: 0.1 },
        { value: 5, probability: 0.4 },
        { value: 10, probability: 0.2 },
        { value: 25, probability: 0.05 },
        { value: 50, probability: 0.04 },
        { value: 100, probability: 0.03 },
        { value: 200, probability: 0.02 },
        { value: 500, probability: 0.009 },
        { value: 1000, probability: 0.001 }
    ];

    const getBetAmount = () => {
        const random = Math.random();
        let cumulativeProbability = 0;
        for (const bet of betAmounts) {
            cumulativeProbability += bet.probability;
            if (random <= cumulativeProbability) {
                return bet.value;
            }
        }
        return betAmounts[betAmounts.length - 1].value;
    };

    for (let i = 0; i < numberOfGames; i++) {
        const isJackpot = Math.random() <= 0.8; // 80% Wahrscheinlichkeit für Jackpot
        const betType = isJackpot ? "Jackpot" : betTypes[Math.floor(Math.random() * (betTypes.length - 1))];

        let betAmount = getBetAmount();
        let totalFields = 12;
        if (betType === "2x") totalFields = 2;
        if (betType === "4x") totalFields = 6;
        if (betType === "Jackpot") betAmount = 10; // Jackpot kostet immer 10

        const selectedField = Math.floor(Math.random() * totalFields) + 1;
        pot += betAmount;

        const result = gameLogic.processBet(betAmount, betType, selectedField);

        totalBets += betAmount;
        totalGames++;
        betStats[betType].count++;
        betStats[betType].totalBet += betAmount;

        if (result.result === "win") {
            totalWinnings += result.winnings;
            betStats[betType].totalWin += result.winnings;
            pot -= result.winnings;
        }
    }

    return {
        totalGames,
        totalBets,
        totalWinnings,
        finalPot: pot,
        betStats,
    };
}

const initialPot = 10000;
const numberOfGames = 1000000000;

const simulationResults = simulateGames(initialPot, numberOfGames);

console.log(`Anzahl Spiele: ${simulationResults.totalGames}`);
console.log(`Gesamteinsätze ($): ${simulationResults.totalBets}`);
console.log(`Gesamtgewinne ($): ${simulationResults.totalWinnings}`);
console.log(`Endstand Pot ($): ${simulationResults.finalPot}`);
console.log(`Gewinn für Hustler: ${Math.round((simulationResults.totalBets - simulationResults.totalWinnings) / simulationResults.totalBets * 100)}%`);
console.log("Details nach Spielmodus:");
console.log(simulationResults.betStats);

module.exports = simulateGames;
