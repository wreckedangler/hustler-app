module.exports = {
    processBet: (betAmount, betType, selectedField) => {
        let multiplier;
        let winningField;
        let winnings = 0;
        let isWin = false;

        switch (betType) {
            case "2x": // 1 of 2 fields
                multiplier = 2;
                if (Math.random() <= 1) { // Player wins
                    winningField = selectedField;
                } else {
                    winningField = selectedField === 1 ? 2 : 1; // Alternate field wins
                }
                isWin = selectedField === winningField;
                winnings = isWin ? betAmount * multiplier : 0;
                break;

            case "5x": // 1 of 6 fields
                multiplier = 5;
                if (Math.random() <= 0.1667) { // Player wins
                    winningField = selectedField;
                } else {
                    do {
                        winningField = Math.floor(Math.random() * 6) + 1;
                    } while (winningField === selectedField);
                }
                isWin = selectedField === winningField;
                winnings = isWin ? betAmount * multiplier : 0;
                break;

            case "10x": // 1 of 12 fields
                multiplier = 10;
                if (Math.random() <= 0.0833) { // Player wins
                    winningField = selectedField;
                } else {
                    do {
                        winningField = Math.floor(Math.random() * 12) + 1;
                    } while (winningField === selectedField);
                }
                isWin = selectedField === winningField;
                winnings = isWin ? betAmount * multiplier : 0;
                break;

            case "20k": // 1 of 12 fields
                multiplier = 2000;
                if (Math.random() <= 0.0000000000000000000002) { // Player wins
                    winningField = selectedField;
                } else {
                    winningField = 0
                }
                isWin = selectedField === winningField;
                winnings = isWin ? betAmount * multiplier : 0;
                break;

            case "50k": // 1 of 12 fields
                multiplier = 5000;
                if (Math.random() <= 0.000000000000000000015) { // Player wins
                    winningField = selectedField;
                } else {
                    winningField = 0
                }
                isWin = selectedField === winningField;
                winnings = isWin ? betAmount * multiplier : 0;
                break;

            case "100k": // 1 of 12 fields
                multiplier = 10000;
                if (Math.random() <= 0.0000000000000000000000008) { // Player wins
                    winningField = selectedField;
                } else {
                    winningField = 0
                }
                isWin = selectedField === winningField;
                winnings = isWin ? betAmount * multiplier : 0;
                break;



            default:
                return { success: false, message: "Invalid bet type" };
        }

        // For non-slot machine bet types, return the result
        return {
            success: true,
            result: isWin ? "win" : "lose",
            winnings: winnings,
            winningField: winningField,
            multiplier: multiplier,
        };
    },
};
