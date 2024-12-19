// components/MainContent.js
import React, { useState } from "react";
import BetAmountBanner from "./BetAmountBanner";
import DollarAmountSelector from "./DollarAmountSelector";
import MultiplierSelector from "./MultiplierSelector";
import GameBoard from "./GameBoard";


function MainContent({
                         isLoggedIn,
                         balance,
                         setBalance,
                         openLoginModal,
                         animateBalance,
                     }) {
    const [selectedMultiplier, setSelectedMultiplier] = useState(null);
    const [selectedAmount, setSelectedAmount] = useState("1$");

    return (
        <main>
            {selectedMultiplier && (
                <BetAmountBanner
                    selectedMultiplier={selectedMultiplier}
                    selectedAmount={selectedAmount}
                />
            )}
            {!selectedMultiplier ? (
                <>
                    <DollarAmountSelector
                        selectedAmount={selectedAmount}
                        setSelectedAmount={setSelectedAmount}
                    />
                    <MultiplierSelector
                        setSelectedMultiplier={setSelectedMultiplier}
                        isLoggedIn={isLoggedIn}
                        openLoginModal={openLoginModal}
                    />
                </>
            ) : (
                <GameBoard
                    selectedMultiplier={selectedMultiplier}
                    selectedAmount={selectedAmount}
                    setSelectedAmount={setSelectedAmount}
                    balance={balance}
                    setBalance={setBalance}
                    isLoggedIn={isLoggedIn}
                    setSelectedMultiplier={setSelectedMultiplier}
                    animateBalance={animateBalance}
                    openLoginModal={openLoginModal}
                />
            )}
        </main>
    );
}

export default MainContent;