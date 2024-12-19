const gameLogic = require("../hustler-app-backend/gameAlgorithm");

function simulateGames(initialPot, numberOfGames) {
    const betTypes = ["2x", "5x", "10x", "20k", "50k", "100k"];
    let pot = initialPot;
    let totalBets = 0;
    let totalWinnings = 0;
    let totalGames = 0;
    let potEmptiedAtGame = null;
    let milestones = { 30000: null, 75000: null, 150000: null };
    let betStats = {
        "2x": { count: 0, totalBet: 0, totalWin: 0 },
        "5x": { count: 0, totalBet: 0, totalWin: 0 },
        "10x": { count: 0, totalBet: 0, totalWin: 0 },
        "20k": { count: 0, totalBet: 0, totalWin: 0 },
        "50k": { count: 0, totalBet: 0, totalWin: 0 },
        "100k": { count: 0, totalBet: 0, totalWin: 0 },
    };

    const betAmounts = [
        { value: 1, probability: 0.13 },
        { value: 2, probability: 0.13 },
        { value: 5, probability: 0.14 },
        { value: 10, probability: 0.2 },
        { value: 25, probability: 0.2 },
        { value: 50, probability: 0.2 },
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
        if (pot <= 0) {
            potEmptiedAtGame = i;
            break;
        }

        for (const milestone of [30000, 75000, 150000]) {
            if (pot >= milestone && milestones[milestone] === null) {
                milestones[milestone] = i;
                console.log(`Der Pot hat ${milestone} nach ${i} Spielen erreicht.`);
            }
        }

        const isFifty = Math.random() <= 0.5;
        const betType = isFifty
            ? '2x'
            : betTypes[Math.floor(Math.random() * (betTypes.length -1)) + 1];

        let betAmount = getBetAmount();
        let totalFields = 12;
        if (betType === "2x") totalFields = 2;
        if (betType === "5x") totalFields = 6;
        if (betType === "10x") totalFields = 12;
        if (betType === "20k") betAmount = 10;
        if (betType === "50k") betAmount = 10;
        if (betType === "100k") betAmount = 10;

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
        potEmptiedAtGame,
        milestones,
        betStats,
    };
}

const initialPot = 1000;
const numberOfGames = 10000;

const simulationResults = simulateGames(initialPot, numberOfGames);

console.log(`Anzahl Spiele: ${simulationResults.totalGames}`);
console.log(`Gesamteinsätze ($): ${simulationResults.totalBets}`);
console.log(`Gesamtgewinne ($): ${simulationResults.totalWinnings}`);
console.log(`Endstand Pot ($): ${simulationResults.finalPot}`);
console.log(`Gewinn für Hustler: ${Math.round((simulationResults.totalBets - simulationResults.totalWinnings) / simulationResults.totalBets * 100)}%`);
if (simulationResults.potEmptiedAtGame !== null) {
    console.log(`Der Pot wurde nach ${simulationResults.potEmptiedAtGame} Spielen geleert.`);
} else {
    console.log("Der Pot wurde nicht geleert.");
}
console.log("Details nach Spielmodus:");
console.log(simulationResults.betStats);

module.exports = simulateGames;
