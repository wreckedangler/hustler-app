// components/GameBoard.js
import React, { useState, useEffect } from "react";
import MultiplierButtons from "./MultiplierButtons";
import SlotMachine from "./SlotMachine";

function GameBoard({
                       selectedMultiplier,
                       selectedAmount,
                       balance,
                       setBalance,
                       isLoggedIn,
                       setSelectedMultiplier,
                       animateBalance,
                       openLoginModal,
                   }) {
    const [selectedField, setSelectedField] = useState(null);
    const [winningField, setWinningField] = useState(null);
    const [allFlipped, setAllFlipped] = useState(false);
    const [showIcons, setShowIcons] = useState(false);
    const [isRoundInProgress, setIsRoundInProgress] = useState(false);

    const handleBackClick = () => {
        setSelectedMultiplier(null);
        setSelectedField(null);
        setWinningField(null);
        setAllFlipped(false);
        setShowIcons(false);
        setIsRoundInProgress(false);
    };

    const checkBalanceAndPlay = async () => {
        const betAmount =
            selectedMultiplier === "1m"
                ? 10
                : parseFloat(selectedAmount.replace("$", ""));
        if (balance < betAmount) {
            alert("Insufficient balance for this bet.");
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/api/play", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                    betAmount,
                    betType: selectedMultiplier,
                    selectedField,
                }),
            });

            const data = await response.json();
            if (data.error) {
                alert(data.error);
                return;
            }

            setWinningField(data.winningField);
            setIsRoundInProgress(true);

            if (selectedMultiplier === "1m") {
                handleSlotMachineAnimation(data.result === "win");
            } else {
                setTimeout(() => setAllFlipped(true), 600);
                setTimeout(() => setShowIcons(true), 1200);

                setTimeout(() => {
                    const newBalance =
                        data.result === "win" ? balance + data.winnings : balance - betAmount;
                    animateBalance(balance, newBalance);
                    setBalance(newBalance);

                    setAllFlipped(false);
                    setShowIcons(false);
                    setSelectedField(null);
                    setWinningField(null);
                    setIsRoundInProgress(false);
                }, 3000);
            }
        } catch (error) {
            console.error("Error sending bet to backend:", error);
        }
    };

    const handleSlotMachineAnimation = (isWin) => {
        // Implementiere die Slot Machine Animation
        // ...
    };

    useEffect(() => {
        if (selectedField !== null) {
            checkBalanceAndPlay();
        }
    }, [selectedField]);

    return (
        <div className="game-board">
            {selectedMultiplier === "1m" ? (
                <SlotMachine
                    isRoundInProgress={isRoundInProgress}
                    setIsRoundInProgress={setIsRoundInProgress}
                    balance={balance}
                    setBalance={setBalance}
                    animateBalance={animateBalance}
                    selectedField={selectedField}
                    setSelectedField={setSelectedField}
                    openLoginModal={openLoginModal}
                />
            ) : (
                <MultiplierButtons
                    selectedMultiplier={selectedMultiplier}
                    selectedField={selectedField}
                    setSelectedField={setSelectedField}
                    winningField={winningField}
                    isRoundInProgress={isRoundInProgress}
                    allFlipped={allFlipped}
                    showIcons={showIcons}
                    setAllFlipped={setAllFlipped}
                    setShowIcons={setShowIcons}
                    balance={balance}
                    setBalance={setBalance}
                    animateBalance={animateBalance}
                    openLoginModal={openLoginModal}
                    isLoggedIn={isLoggedIn}
                />
            )}
            <button
                className="back-button"
                onClick={handleBackClick}
                disabled={isRoundInProgress}
                style={{ opacity: isRoundInProgress ? 0.5 : 1 }}
            >
                ↩
            </button>
        </div>
    );
}

export default GameBoard;
