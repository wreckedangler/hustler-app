// components/MultiplierSelector.js
import React from "react";

function MultiplierSelector({ setSelectedMultiplier, isLoggedIn, openLoginModal }) {
    const handleMultiplierClick = (multiplier) => {
        if (!isLoggedIn) {
            openLoginModal();
            return;
        }
        setSelectedMultiplier(multiplier);
    };

    return (
        <>
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
            <div className="box-buttons">
                <button className="box-button" onClick={() => handleMultiplierClick("50x")}>
                    50x
                </button>
                <button className="box-button" onClick={() => handleMultiplierClick("500x")}>
                    500x
                </button>
                <button className="box-button" onClick={() => handleMultiplierClick("1m")}>
                    1m
                </button>
            </div>
        </>
    );
}

export default MultiplierSelector;
