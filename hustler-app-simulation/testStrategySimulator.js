const gameLogic = require("../hustler-app-backend/gameAlgorithm");

function simulateStrategyPlayer(initialBalance, initialPot, goal) {
    const betAmounts = [1, 2, 5, 10, 25, 50];
    const betType = "2x";
    const totalFields = 2;
    let balance = initialBalance;
    let pot = initialPot;
    let currentBetIndex = 0; // Start with the smallest bet
    let totalBets = 0;
    let totalWinnings = 0;
    let totalGames = 0;
    let goalReached;

    while (balance > 0 && pot > 0 && balance < goal) {
        const betAmount = betAmounts[currentBetIndex];

        if (betAmount > balance) {
            currentBetIndex = 0; // Reset to the smallest bet if the current bet is unaffordable
            continue;
        }

        // Place the bet
        const selectedField = Math.floor(Math.random() * totalFields) + 1; // Random field selection
        totalBets += betAmount;
        balance -= betAmount; // Deduct the bet from the player's balance
        pot += betAmount; // Add the bet to the pot

        const result = gameLogic.processBet(betAmount, betType, selectedField);

        totalGames++;

        if (result.result === "win") {
            const winnings = result.winnings;

            if (winnings > pot) {
                goalReached = true
                console.log("Pot got fucked")

            }

            pot -= winnings; // Subtract winnings from the pot
            balance += winnings; // Add winnings to the player's balance
            totalWinnings += winnings;
            currentBetIndex = 0; // Reset to the smallest bet
        } else {
            currentBetIndex = Math.min(currentBetIndex + 1, betAmounts.length - 1); // Move to the next bet amount
        }
    }


    return {
        finalBalance: balance,
        finalPot: pot,
        totalBets,
        totalWinnings,
        totalGames,
        goalReached,
    };
}

function runSimulations(times, initialBalance, initialPot, goal) {
    let goalReachedCount = 0;
    let totalBets = 0;
    let totalWinnings = 0;
    let totalGames = 0;

    for (let i = 0; i < times; i++) {
        const result = simulateStrategyPlayer(initialBalance, initialPot, goal);
        totalBets += result.totalBets;
        totalWinnings += result.totalWinnings;
        totalGames += result.totalGames;
        if (result.goalReached) goalReachedCount++;
    }

    console.log("Overall Simulation Results:");
    console.log(`Number of Simulations: ${times}`);
    console.log(`Pot fucked: ${goalReachedCount} times (${((goalReachedCount / times) * 100).toFixed(2)}%)`);
    console.log(`Goal Not Reached: ${times - goalReachedCount} times (${(((times - goalReachedCount) / times) * 100).toFixed(2)}%)`);
    console.log(`Total Bets Placed: ${totalBets}`);
    console.log(`Total Winnings: ${totalWinnings}`);
    console.log(`Total Games Played: ${totalGames}`);
}

// Simulation parameters
const initialBalance = 1000; // Starting balance for the player
const initialPot = 1000; // Starting amount in the pot
const goal = 2000; // Player's goal balance
const simulationCount = 1; // Number of simulations to run

runSimulations(simulationCount, initialBalance, initialPot, goal);
