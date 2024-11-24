module.exports = {
    processBet: (betAmount, betType, selectedField) => {
        let multiplier;
        let winningField;
        let winnings = 0;
        let isWin = false;
        let winningSymbols = []; // For the slot machine

        switch (betType) {
            case "2x": // 1 of 2 fields
                multiplier = 2;
                if (Math.random() <= 0.49) { // Player wins
                    winningField = selectedField;
                } else {
                    winningField = selectedField === 1 ? 2 : 1; // Alternate field wins
                }
                isWin = selectedField === winningField;
                winnings = isWin ? betAmount * multiplier : 0;
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
                isWin = selectedField === winningField;
                winnings = isWin ? betAmount * multiplier : 0;
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
                isWin = selectedField === winningField;
                winnings = isWin ? betAmount * multiplier : 0;
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
                isWin = selectedField === winningField;
                winnings = isWin ? betAmount * multiplier : 0;
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
                isWin = selectedField === winningField;
                winnings = isWin ? betAmount * multiplier : 0;
                break;

            case "1m": // Fixed jackpot for the slot machine
                const jackpotChance = 0.000003; // Minimal chance for jackpot

                // Slot symbols
                const slotSymbols = ["🍒", "🍋", "🔔", "⭐", "💎"];

                if (Math.random() <= jackpotChance) {
                    // Player wins
                    winningSymbols = ["💎", "💎", "💎"]; // Three diamonds
                    isWin = true;
                    winnings = 1000000;
                } else {
                    // Player loses
                    do {
                        // Generate random symbols, ensuring not all the same
                        winningSymbols = [];
                        for (let i = 0; i < 3; i++) {
                            const randomSymbol = slotSymbols[Math.floor(Math.random() * slotSymbols.length)];
                            winningSymbols.push(randomSymbol);
                        }
                    } while (
                        winningSymbols[0] === winningSymbols[1] &&
                        winningSymbols[1] === winningSymbols[2]
                        );
                    isWin = false;
                    winnings = 0;
                }

                return {
                    success: true,
                    result: isWin ? "win" : "lose",
                    winnings: winnings,
                    winningSymbols: winningSymbols,
                    isWin: isWin,
                };

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
