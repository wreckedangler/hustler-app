import React from "react";

function MultiplierSelector({ setSelectedMultiplier, isLoggedIn, openLoginModal }) {
    // Handle normal multiplier click
    const handleMultiplierClick = (multiplier) => {
        if (!isLoggedIn) {
            openLoginModal();
            return;
        }
        setSelectedMultiplier(multiplier);
    };

    return (
        <>
            {/* First Row of Buttons */}
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

            {/* Second Row of Buttons */}
            <div className="box-buttons">
                <button className="box-button" onClick={() => handleMultiplierClick("20k")}>
                    <img
                        src="/epic.jpeg"
                        alt="20k $"
                        className="button-image"
                    />
                </button>
                <button className="box-button" onClick={() => handleMultiplierClick("50k")}>
                    <img
                        src="/mystic.jpeg"
                        alt="50k $"
                        className="button-image"
                    />
                </button>
                <button className="box-button" onClick={() => handleMultiplierClick("100k")}>
                    <img
                        src="/legend.jpeg"
                        alt="100k $"
                        className="button-image"
                    />
                </button>
            </div>
        </>
    );
}

export default MultiplierSelector;
