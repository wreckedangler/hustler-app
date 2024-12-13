// components/GameBoard.js
import React, { useState, useEffect } from "react";
import MultiplierButtons from "./MultiplierButtons";
import SlotMachine from "./SlotMachine";


function GameBoard({
                       selectedMultiplier,
                       selectedAmount,

                       setBalance,
                       isLoggedIn,
                       setSelectedMultiplier,
                       animateBalance,
                       openLoginModal,
                   }) {
    const [balance, setLocalBalance] = useState(0); // State für die Balance
    const [selectedField, setSelectedField] = useState(null);
    const [winningField, setWinningField] = useState(null);
    const [allFlipped, setAllFlipped] = useState(false);
    const [showIcons, setShowIcons] = useState(false);
    const [isRoundInProgress, setIsRoundInProgress] = useState(false);
    const [slotResult, setSlotResult] = useState(null); // State to hold slot machine result

    const handleBackClick = () => {
        setSelectedMultiplier(null);
        setSelectedField(null);
        setWinningField(null);
        setAllFlipped(false);
        setShowIcons(false);
        setIsRoundInProgress(false);
        setSlotResult(null); // Reset slot machine result
    };

    // 🛠️ **Balance vom Backend abrufen**
    const fetchBalanceFromDB = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/get-balance", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch balance from server');
            }

            const data = await response.json();
            console.log('Balance from DB:', data.balance); // Debugging
            setLocalBalance(data.balance);
            setBalance(data.balance); // Optional: falls du die Balance global setzen willst
        } catch (error) {
            console.error("Error fetching balance from backend:", error);
        }
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
            console.log("Received data from backend:", data); // Debugging line

            if (data.error) {
                alert(data.error);
                return;
            }

            setWinningField(data.winningField);
            setIsRoundInProgress(true);

            if (selectedMultiplier === "1m") {
                handleSlotMachineAnimation(data);
            } else {
                // Existing logic for other games
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

    const handleSlotMachineAnimation = (data) => {
        // Pass the entire data object to setSlotResult
        setSlotResult({
            isWin: data.result === "win",
            winningSymbols: data.winningSymbols,
            result: data.result,
            winnings: data.winnings,
        });
    };

    useEffect(() => {
        if (selectedField !== null) {
            checkBalanceAndPlay();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedField]);

    return (
        <div className="game-board">
            {selectedMultiplier === "1m" ? (
                <>
                    <SlotMachine
                        isRoundInProgress={isRoundInProgress}
                        setIsRoundInProgress={setIsRoundInProgress}
                        balance={balance}
                        setBalance={setBalance}
                        animateBalance={animateBalance}
                        selectedField={selectedField}
                        setSelectedField={setSelectedField}
                        openLoginModal={openLoginModal}
                        slotResult={slotResult}
                        setSlotResult={setSlotResult}
                    />
                    <button
                        className="back-button"
                        onClick={handleBackClick}
                        disabled={isRoundInProgress}
                        style={{ opacity: isRoundInProgress ? 0.5 : 1 }}
                    >
                        ↩
                    </button>
                </>
            ) : (
                <div className="dynamic-buttons-wrapper">
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
                    <button
                        className="back-button"
                        onClick={handleBackClick}
                        disabled={isRoundInProgress}
                        style={{ opacity: isRoundInProgress ? 0.5 : 1 }}
                    >
                        ↩
                    </button>
                </div>
            )}
        </div>
    );
}

export default GameBoard;
