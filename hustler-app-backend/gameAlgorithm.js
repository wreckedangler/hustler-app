// gameAlgorithm.js
module.exports = {
    processBet: (betAmount, betType, selectedField) => {
        console.log(`Processing bet: Amount = ${betAmount}, Type = ${betType}, Field = ${selectedField}`);

        let maxNumber;
        let multiplier;

        switch (betType) {
            case "2x": // 1 of 3
                maxNumber = 3;
                multiplier = 2;
                break;
            case "4x": // 1 of 6
                maxNumber = 6;
                multiplier = 5;
                break;
            case "8x": // 1 of 12
                maxNumber = 12;
                multiplier = 10;
                break;
            default:
                return { success: false, message: "Invalid bet type" };
        }

        const winningField = Math.floor(Math.random() * maxNumber) + 1;
        const isWin = selectedField === winningField;
        const winnings = isWin ? betAmount * multiplier : 0;

        return {
            success: true,
            result: isWin ? "win" : "lose",
            winnings: winnings,
            winningField: winningField,
            multiplier: multiplier // Ensure multiplier is returned here
        };
    }
};
