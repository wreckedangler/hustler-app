// components/MultiplierButtons.js
import React, { useState } from "react";
import { motion } from "framer-motion";

function MultiplierButtons({
                               selectedMultiplier,
                               selectedField,
                               setSelectedField,
                               winningField,
                               isRoundInProgress,
                               allFlipped,
                               showIcons,
                               setAllFlipped,
                               setShowIcons,
                               balance,
                               setBalance,
                               animateBalance,
                               openLoginModal,
                               isLoggedIn,
                           }) {
    const [wiggleComplete, setWiggleComplete] = useState(false);
    const [rotationY, setRotationY] = useState(0); // Aktuelle Rotation in Grad (0 - 180)

    const handleButtonClick = (fieldNumber) => {
        if (!isLoggedIn) {
            openLoginModal();
            return;
        }
        if (!isRoundInProgress) {
            setSelectedField(fieldNumber);
            setWiggleComplete(false);
            setTimeout(() => setWiggleComplete(true), 400);
        }
    };

    const count =
        selectedMultiplier === "2x"
            ? 2
            : selectedMultiplier === "5x"
                ? 6
                : selectedMultiplier === "10x"
                    ? 12
                    : selectedMultiplier === "50x"
                        ? 12
                        : selectedMultiplier === "500x"
                            ? 12
                            : 1;

    const containerClass = `dynamic-buttons-container dynamic-${count}`;

    const buttonVariants = {
        initial: { rotateY: 0, scale: 1 },
        wiggle: {
            rotate: [0, -10, 10, -10, 10, 0],
            scale: 1.1,
            transition: { duration: 0.4 },
        },
        flipToReveal: (custom) => ({
            rotateY: 180,
            backgroundColor: custom.isWinningField
                ? "#28a745" // Grün für Gewinner
                : custom.isSelected
                    ? "#d71212" // Rot für Verlierer
                    : "#ff00ff", // Standardfarbe
            transition: {
                rotateY: { duration: 0.6, delay: 0.4 },
                backgroundColor: { delay: 0.6 },

            },
        }),
    };

    return (
        <div className={containerClass}>
            {Array.from({ length: count }, (_, i) => {
                const fieldNumber = i + 1;
                const isWinningField = fieldNumber === winningField;
                const isSelected = fieldNumber === selectedField;

                return (
                    <motion.button
                        key={i}
                        className="dynamic-button"
                        onClick={() => handleButtonClick(fieldNumber)}
                        disabled={winningField !== null && !allFlipped}
                        initial="initial"
                        animate={
                            isSelected
                                ? wiggleComplete
                                    ? "flipToReveal"
                                    : "wiggle"
                                : allFlipped && winningField !== null
                                    ? "flipToReveal"
                                    : "initial"
                        }
                        custom={{
                            isWinningField,
                            isSelected,
                            rotationProgress: rotationY
                        }}
                        variants={buttonVariants}
                        whileHover={{ scale: 1.05 }}
                        onUpdate={(latest) => {
                            if (latest.rotateY !== undefined) {
                                setRotationY(latest.rotateY); // Speichere die Rotation in rotationY
                            }
                        }}
                        style={{
                            boxShadow:
                                rotationY >= 90 && isSelected && isWinningField
                                    ? "0 0 10px 5px yellow"
                                    : "none",
                            animation:
                                rotationY >= 90 && isSelected && isWinningField
                                    ? "blink 0.5s ease-in-out infinite alternate"
                                    : "none",
                        }}
                    >
                        {showIcons && winningField !== null
                            ? isWinningField
                                ? "💸" // Gewinnsymbol
                                : isSelected && !isWinningField
                                    ? "" // Verlierersymbol
                                    : ""
                            : "💸"}
                    </motion.button>
                );
            })}
        </div>
    );
}

export default MultiplierButtons;
