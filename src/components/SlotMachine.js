// components/SlotMachine.js
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

function SlotMachine({
                         isRoundInProgress,
                         setIsRoundInProgress,
                         balance,
                         setBalance,
                         animateBalance,
                         selectedField,
                         setSelectedField,
                         openLoginModal,
                         slotResult,
                         setSlotResult,
                     }) {
    const [reels, setReels] = useState([
        ["❓"],
        ["❓"],
        ["❓"],
    ]);
    const [isSpinning, setIsSpinning] = useState(false);

    const slotSymbols = ["🍒", "🍋", "🔔", "⭐", "💎"];

    const handleSpin = () => {
        if (!isRoundInProgress && !isSpinning) {
            if (balance < 10) {
                alert("Insufficient balance for this bet.");
                return;
            }
            setSelectedField(1); // Trigger the game logic in GameBoard
        }
    };

    useEffect(() => {
        if (slotResult && slotResult.winningSymbols) {
            startSpinAnimation(slotResult.winningSymbols);
        } else if (slotResult) {
            console.error("winningSymbols is undefined in slotResult:", slotResult);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [slotResult]);

    const startSpinAnimation = (winningSymbols) => {
        setIsSpinning(true);
        let spins = 0;
        const totalSpins = 20; // Total number of spin cycles
        const spinInterval = setInterval(() => {
            spins += 1;
            setReels([
                [getRandomSymbol()],
                [getRandomSymbol()],
                [getRandomSymbol()],
            ]);

            if (spins >= totalSpins) {
                clearInterval(spinInterval);
                // Display the winning symbols one at a time
                revealWinningSymbols(winningSymbols);
            }
        }, 100);

        setIsRoundInProgress(true);
    };

    const getRandomSymbol = () => {
        return slotSymbols[Math.floor(Math.random() * slotSymbols.length)];
    };

    const revealWinningSymbols = (winningSymbols) => {
        if (!winningSymbols || !Array.isArray(winningSymbols)) {
            console.error("Invalid winningSymbols:", winningSymbols);
            // Reset states and exit
            setIsSpinning(false);
            setIsRoundInProgress(false);
            setSlotResult(null);
            return;
        }

        let index = 0;
        const revealInterval = setInterval(() => {
            setReels((prevReels) => {
                const newReels = [...prevReels];
                newReels[index] = [winningSymbols[index]];
                return newReels;
            });
            index += 1;
            if (index >= winningSymbols.length) {
                clearInterval(revealInterval);
                setTimeout(() => {
                    finalizeGameState(slotResult.isWin);
                }, 1000);
            }
        }, 500); // Reveal each symbol every 500ms
    };

    const finalizeGameState = (isWin) => {
        const betAmount = 10; // Fixed bet amount for slot machine
        const newBalance = isWin ? balance + 1000000 : balance - betAmount;
        animateBalance(balance, newBalance);
        setBalance(newBalance);

        setIsRoundInProgress(false);
        setIsSpinning(false);
        setSlotResult(null);
        setSelectedField(null);
    };

    const handleBackClick = () => {
        if (isRoundInProgress || isSpinning) return;
        setSelectedField(null);
        setSlotResult(null);
        setIsSpinning(false);
        setIsRoundInProgress(false);
        // Reset the reels
        setReels([["❓"], ["❓"], ["❓"]]);
    };

    return (
        <div className="slot-machine-container">
            <div className="slot-machine">
                {reels.map((symbols, index) => (
                    <div key={index} className="slot-machine-reel">
                        {symbols.map((symbol, idx) => (
                            <motion.div
                                key={idx}
                                className="slot-symbol"
                                initial={{ y: -100 }}
                                animate={{ y: 0 }}
                                transition={{ duration: 0.1 }}
                            >
                                {symbol}
                            </motion.div>
                        ))}
                    </div>
                ))}
            </div>
            <motion.button
                key="jackpot"
                className="dynamic-button large-jackpot-button"
                onClick={handleSpin}
                disabled={isRoundInProgress || isSpinning}
            >
                Spin
            </motion.button>
            <button
                className="back-button"
                onClick={handleBackClick}
                disabled={isRoundInProgress || isSpinning}
                style={{ opacity: isRoundInProgress || isSpinning ? 0.5 : 1 }}
            >
                ↩
            </button>
        </div>
    );
}

export default SlotMachine;
