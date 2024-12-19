import React, { useState } from "react";

function MultiplierSelector({ setSelectedMultiplier, isLoggedIn, openLoginModal }) {
    const [showJackpotButtons, setShowJackpotButtons] = useState(null); // Track which jackpot is currently visible

    // Handle normal multiplier click
    const handleMultiplierClick = (multiplier) => {
        if (!isLoggedIn) {
            openLoginModal();
            return;
        }
        setSelectedMultiplier(multiplier);
    };

    // Handle jackpot button click to show/hide the jackpots for each main button
    const handleJackpotClick = (jackpot) => {
        if (!isLoggedIn) {
            openLoginModal();
            return;
        }
        setShowJackpotButtons((prev) => (prev === jackpot ? null : jackpot)); // Toggle jackpot buttons
    };

    return (
        <>
            {/* Existing Row of Buttons */}
            <div className="box-buttons">
                <button className="box-button" onClick={() => handleMultiplierClick("2x")}>
                    2x
                </button>
                <button className="box-button" onClick={() => handleMultiplierClick("5x")}>
                    5x
                </button>
                <button className="box-button" onClick={() => handleMultiplierClick("10x")}>
                    10x
                </button>
            </div>

            {/* New Row of Buttons (Jackpot Triggers) */}
            <div className="box-buttons">
                <button
                    className="box-button"
                    onClick={() => handleJackpotClick("jackpot1")}
                >
                    Jackpot A
                </button>
                <button
                    className="box-button"
                    onClick={() => handleJackpotClick("jackpot2")}
                >
                    Jackpot B
                </button>
                <button
                    className="box-button"
                    onClick={() => handleJackpotClick("jackpot3")}
                >
                    Jackpot C
                </button>
            </div>
        </>
    );
}

export default MultiplierSelector;
