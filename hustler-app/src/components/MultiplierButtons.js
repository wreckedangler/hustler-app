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
    const [currentRotation, setCurrentRotation] = useState(0); // Neuen State für die Rotation hinzufügen

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
        initial: { rotateY: 0, scale: 1, backgroundColor: "#ff00ff" },
        wiggle: {
            rotate: [0, -10, 10, -10, 10, 0],
            scale: 1.1,
            transition: { duration: 0.4 },
        },
        flipToReveal: {
            rotateY: 180,
            transition: { duration: 0.6, delay: 0.4 },
        },
        winning: { backgroundColor: "#28a745" },
        losing: { backgroundColor: "#d71212" },
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
                        variants={buttonVariants}
                        whileHover={{ scale: 1.05 }}
                        onUpdate={(latest) => {
                            if (latest.rotateY !== undefined) {
                                setCurrentRotation(latest.rotateY);
                            }
                        }}
                        style={{
                            backgroundColor:
                                currentRotation >= 90
                                    ? isSelected && isWinningField
                                        ? "#28a745" // Winning green
                                        : isSelected && !isWinningField
                                            ? "#d71212" // Losing red
                                            : "#ff00ff" // Default color
                                    : "#ff00ff", // Default color before 90 degrees
                            boxShadow:
                                currentRotation >= 90 && isSelected && isWinningField
                                    ? "0 0 10px 5px yellow"
                                    : "none",
                            animation:
                                currentRotation >= 90 && isSelected && isWinningField
                                    ? "blink 0.5s ease-in-out infinite alternate"
                                    : "none",
                        }}
                    >
                        {showIcons && winningField !== null
                            ? isWinningField
                                ? "💸" // Win icon
                                : isSelected && !isWinningField
                                    ? "" // Lose icon
                                    : ""
                            : "💸"}
                    </motion.button>
                );
            })}
        </div>
    );
}

export default MultiplierButtons;
