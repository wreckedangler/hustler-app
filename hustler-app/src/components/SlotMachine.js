// components/SlotMachine.js
import React, { useState } from "react";
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
                     }) {
    const slotSymbols = ["🍒", "🍋", "🔔", "⭐", "💎"];
    const [reelSymbols, setReelSymbols] = useState([
        "🍒",
        "🍋",
        "🔔",
    ]);

    const jackpotButtonVariants = {
        initial: { scale: 1, backgroundColor: "#ffcc00" },
        hover: {
            scale: 1.4,
            transition: { duration: 0.3 },
            backgroundColor: "#ffd700",
        },
        click: {
            scale: 0.9,
            backgroundColor: "#ffdd88",
        },
    };

    const handleButtonClick = () => {
        if (!isRoundInProgress) {
            setSelectedField(1); // Dummy value to trigger the game
        }
    };

    return (
        <div className="slot-machine-container">
            {Array.from({ length: 3 }, (_, reelIndex) => (
                <motion.div
                    key={reelIndex}
                    className="slot-machine-reel"
                    animate={{
                        y: isRoundInProgress ? [0, -50, -100, -150, -200, 0] : 0,
                    }}
                    transition={{
                        duration: 2,
                        repeat: isRoundInProgress ? Infinity : 0,
                    }}
                >
                    {slotSymbols.map((symbol, index) => (
                        <div key={index} className="slot-symbol">
                            {symbol}
                        </div>
                    ))}
                </motion.div>
            ))}
            <motion.button
                key="jackpot"
                className="dynamic-button large-jackpot-button"
                onClick={handleButtonClick}
                disabled={isRoundInProgress}
                variants={jackpotButtonVariants}
                initial="initial"
                whileHover="hover"
                whileTap="click"
            >
                Spin
            </motion.button>
        </div>
    );
}

export default SlotMachine;
