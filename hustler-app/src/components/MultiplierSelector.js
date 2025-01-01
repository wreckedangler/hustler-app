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
                    <img
                        src="/2x.jpg"
                        alt="2x"
                        className="button-image"
                    />
                </button>
                <button className="box-button" onClick={() => handleMultiplierClick("5x")}>
                    <img
                        src="/5x.jpg"
                        alt="2x"
                        className="button-image"
                    />
                </button>
                <button className="box-button" onClick={() => handleMultiplierClick("10x")}>
                    <img
                        src="/10x.jpg"
                        alt="2x"
                        className="button-image"
                    />
                </button>
            </div>

            {/* Second Row of Buttons */}
            <div className="box-buttons">
                <button className="box-button" onClick={() => handleMultiplierClick("20k")}>
                    <img
                        src="/epic.jpg"
                        alt="20k $"
                        className="button-image"
                    />
                </button>
                <button className="box-button" onClick={() => handleMultiplierClick("50k")}>
                    <img
                        src="/mystic.jpg"
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
