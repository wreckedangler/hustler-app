const gameLogic = require("../hustler-app-backend/gameAlgorithm");

function simulateStrategyPlayer(initialBalance, initialPot, goal) {
    const betAmounts = [1, 2, 5, 10, 25, 50, 100, 200, 500, 1000];
    const betType = "2x";
    const totalFields = 2;
    let balance = initialBalance;
    let pot = initialPot;
    let currentBetIndex = 0; // Start with the smallest bet
    let totalBets = 0;
    let totalWinnings = 0;
    let totalGames = 0;

    while (balance > 0 && pot > 0 && balance < goal) {
        const betAmount = betAmounts[currentBetIndex];

        if (betAmount > balance) {
            // Reset to the smallest bet if the current bet is unaffordable
            currentBetIndex = 0;
            continue;
        }

        if (betAmount > pot) {
            console.log(`Pot cannot cover the next bet (${betAmount}) with current pot (${pot}).`);
            break; // Stop playing if the pot cannot cover the bet
        }

        // Place the bet
        const selectedField = Math.floor(Math.random() * totalFields) + 1; // Random field selection
        totalBets += betAmount;
        balance -= betAmount; // Deduct the bet from the player's balance
        pot += betAmount; // Add the bet to the pot

        const result = gameLogic.processBet(betAmount, betType, selectedField);

        totalGames++;

        if (result.result === "win") {
            // Player wins, reset to the smallest bet and add winnings to balance
            balance += result.winnings;
            totalWinnings += result.winnings;
            pot -= result.winnings; // Subtract winnings from the pot
            currentBetIndex = 0; // Reset to smallest bet
        } else {
            // Player loses, move to the next bet amount
            currentBetIndex = Math.min(currentBetIndex + 1, betAmounts.length - 1);
        }
    }

    return {
        finalBalance: balance,
        finalPot: pot,
        totalBets,
        totalWinnings,
        totalGames,
        goalReached: balance >= goal,
    };
}

function runSimulations(times, initialBalance, initialPot, goal) {
    let goalReachedCount = 0;

    for (let i = 0; i < times; i++) {
        const result = simulateStrategyPlayer(initialBalance, initialPot, goal);
        if (result.goalReached) goalReachedCount++;
    }

    console.log("Overall Simulation Results:");
    console.log(`Number of Simulations: ${times}`);
    console.log(`Goal Reached: ${goalReachedCount} times (${((goalReachedCount / times) * 100).toFixed(2)}%)`);
    console.log(`Goal Not Reached: ${times - goalReachedCount} times (${(((times - goalReachedCount) / times) * 100).toFixed(2)}%)`);
}

// Simulation parameters
const initialBalance = 1000; // Starting balance for the player
const initialPot = 10000; // Starting amount in the pot
const goal = 2000; // Player's goal balance
const simulationCount = 100000; // Number of simulations to run

runSimulations(simulationCount, initialBalance, initialPot, goal);
