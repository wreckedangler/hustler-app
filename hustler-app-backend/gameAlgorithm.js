module.exports = {
    processBet: (betAmount, betType, selectedField) => {
        console.log(`Processing bet: Amount = ${betAmount}, Type = ${betType}, Selected Field = ${selectedField}`);

        let multiplier;
        let winningField;

        switch (betType) {
            case "2x": // 1 of 2, with a 49.5% chance of winning
                multiplier = 2;

                // Determine winning field with a 49.9% chance of being the selected field
                if (Math.random() <= 0.495) {
                    winningField = selectedField; // User wins 49.5% of the time
                } else {
                    winningField = selectedField === 1 ? 2 : 1; // Otherwise, it's the other field (1 or 2)
                }

                // Confirming the winningField is either 1 or 2
                console.log(`2x Bet: Selected Field = ${selectedField}, Winning Field = ${winningField}`);
                break;

            case "4x": // 1 of 6
                multiplier = 5;
                winningField = Math.floor(Math.random() * 6) + 1;
                console.log(`4x Bet: Selected Field = ${selectedField}, Winning Field = ${winningField}`);
                break;

            case "8x": // 1 of 12
                multiplier = 10;
                winningField = Math.floor(Math.random() * 12) + 1;
                console.log(`8x Bet: Selected Field = ${selectedField}, Winning Field = ${winningField}`);
                break;

            case "50x":
                multiplier = 50;
                if (Math.random() <= 0.015) {
                    winningField = selectedField; // Player wins
                } else {
                    // Get a random field that is not the selectedField (1 to 12)
                    do {
                        winningField = Math.floor(Math.random() * 12) + 1; // Fields are numbered from 1 to 12
                    } while (winningField === selectedField);
                }
                break;

            case "500x":
                multiplier = 500;
                if (Math.random() <= 0.0015) {
                    winningField = selectedField; // Player wins
                } else {
                    // Get a random field that is not the selectedField (1 to 12)
                    do {
                        winningField = Math.floor(Math.random() * 12) + 1; // Fields are numbered from 1 to 12
                    } while (winningField === selectedField);
                }
                break;

            case "1000x":
                multiplier = 1000;
                if (Math.random() <= 0.0006) {
                    winningField = selectedField; // Player wins
                } else {
                    // Get a random field that is not the selectedField (1 to 12)
                    do {
                        winningField = Math.floor(Math.random() * 12) + 1; // Fields are numbered from 1 to 12
                    } while (winningField === selectedField);
                }
                break;


            default:
                console.log("Invalid bet type");
                return { success: false, message: "Invalid bet type" };
        }

        // Check if the selected field is the winning field and calculate winnings
        const isWin = selectedField === winningField;
        const winnings = isWin ? betAmount * multiplier : 0;

        // Log the final result and winnings for verification
        console.log(`Result: ${isWin ? "Win" : "Lose"}, Winnings: ${winnings}, Multiplier: ${multiplier}`);

        return {
            success: true,
            result: isWin ? "win" : "lose",
            winnings: winnings,
            winningField: winningField,
            multiplier: multiplier
        };
    }
};
