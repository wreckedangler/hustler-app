module.exports = {
    processBet: (betAmount, betType, selectedField) => {
        let multiplier;
        let winningField;

        switch (betType) {
            case "2x": // 1 of 2 fields
                multiplier = 2;
                if (Math.random() <= 0.49) { // Player wins
                    winningField = selectedField;
                } else {
                    winningField = selectedField === 1 ? 2 : 1; // Alternate field wins
                }
                break;

            case "5x": // 1 of 6 fields
                multiplier = 5;
                if (Math.random() <= 0.196) { // Player wins
                    winningField = selectedField;
                } else {
                    do {
                        winningField = Math.floor(Math.random() * 6) + 1;
                    } while (winningField === selectedField);
                }
                break;

            case "10x": // 1 of 12 fields
                multiplier = 10;
                if (Math.random() <= 0.098) { // Player wins
                    winningField = selectedField;
                } else {
                    do {
                        winningField = Math.floor(Math.random() * 12) + 1;
                    } while (winningField === selectedField);
                }
                break;

            case "50x": // 1 of 12 fields
                multiplier = 50;
                if (Math.random() <= 0.0196) { // Player wins
                    winningField = selectedField;
                } else {
                    do {
                        winningField = Math.floor(Math.random() * 12) + 1;
                    } while (winningField === selectedField);
                }
                break;

            case "500x": // 1 of 12 fields
                multiplier = 500;
                if (Math.random() <= 0.00196) { // Player wins
                    winningField = selectedField;
                } else {
                    do {
                        winningField = Math.floor(Math.random() * 12) + 1;
                    } while (winningField === selectedField);
                }
                break;

            case "1m": // Fixed jackpot
                multiplier = 0; // Multiplier not used for jackpot
                const jackpotChance = 0.000003; // Minimal chance for jackpot
                if (Math.random() <= jackpotChance) {
                    winningField = selectedField;
                } else {
                    do {
                        winningField = Math.floor(Math.random() * 12) + 1;
                    } while (winningField === selectedField);
                }
                break;

            default:
                return { success: false, message: "Invalid bet type" };
        }

        const isWin = selectedField === winningField;
        const winnings = isWin ? (betType === "Jackpot" ? 1000000 : betAmount * multiplier) : 0;

        return {
            success: true,
            result: isWin ? "win" : "lose",
            winnings: winnings,
            winningField: winningField,
            multiplier: multiplier,
        };
    },
};
