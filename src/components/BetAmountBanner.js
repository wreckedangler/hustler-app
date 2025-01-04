// components/BetAmountBanner.js
import React from "react";

function BetAmountBanner({ selectedMultiplier, selectedAmount }) {
    const betAmount = selectedMultiplier === "1m" ? "$10" : selectedAmount;

    return <div className="bet-amount-banner">{betAmount}</div>;
}

export default BetAmountBanner;
