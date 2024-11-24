// components/DollarAmountSelector.js
import React from "react";

function DollarAmountSelector({ selectedAmount, setSelectedAmount }) {
    const dollarAmounts = [
        "1$",
        "2$",
        "5$",
        "10$",
        "25$",
        "50$",
        "100$",
        "200$",
        "500$",
        "1000$",
    ];

    return (
        <div className="dollar-buttons">
            {dollarAmounts.map((amount) => (
                <button
                    key={amount}
                    className={`dollar-button ${selectedAmount === amount ? "selected" : ""}`}
                    onClick={() => setSelectedAmount(amount)}
                >
                    {amount}
                </button>
            ))}
        </div>
    );
}

export default DollarAmountSelector;
