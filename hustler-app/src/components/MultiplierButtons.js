// components/MultiplierButtons.js
import React, { useState, useRef } from "react";
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
    const rotationYRef = useRef(0);
    const [isRotationComplete, setIsRotationComplete] = useState(false);

    const handleButtonClick = (fieldNumber) => {
        if (!isLoggedIn) {
            openLoginModal();
            return;
        }
        if (!isRoundInProgress) {
            setSelectedField(fieldNumber);
            setWiggleComplete(false);
            setTimeout(() => setWiggleComplete(true), 400);
            setIsRotationComplete(false);
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
                    : "#ff00ff", // Standard
            transition: {
                rotateY: { duration: 0.6, delay: 0.4 },
                backgroundColor: { delay: 0.6 },
            },
        }),
        highlight: {
            boxShadow: "0 0 10px 5px yellow",
            animation: "blink 0.5s ease-in-out infinite alternate",
            transition: { duration: 0.3, ease: "easeInOut", delay: 0 }
        }
    };

    return (
        <div className={containerClass}>
            {Array.from({ length: count }, (_, i) => {
                const fieldNumber = i + 1;
                const isWinningField = fieldNumber === winningField;
                const isSelected = fieldNumber === selectedField;

                let animateSequence;
                if (isSelected) {
                    // Der ausgewählte Button
                    if (wiggleComplete) {
                        // Nach dem Wiggle in den Flip-State
                        animateSequence = isRotationComplete && isWinningField
                            ? ["flipToReveal", "highlight"]
                            : "flipToReveal";
                    } else {
                        // Zuerst Wiggle, bevor geflippt wird
                        animateSequence = "wiggle";
                    }
                } else {
                    // Nicht ausgewählter Button
                    if (allFlipped && winningField !== null) {
                        animateSequence = isRotationComplete && isWinningField
                            ? ["flipToReveal", "highlight"]
                            : "flipToReveal";
                    } else {
                        animateSequence = "initial";
                    }
                }

                return (
                    <motion.button
                        key={i}
                        className="dynamic-button"
                        onClick={() => handleButtonClick(fieldNumber)}
                        disabled={winningField !== null && !allFlipped}
                        initial="initial"
                        animate={animateSequence}
                        custom={{
                            isWinningField,
                            isSelected,
                            rotationProgress: rotationYRef.current
                        }}
                        variants={buttonVariants}
                        whileHover={{ scale: 1.05 }}
                        onUpdate={(latest) => {
                            if (latest.rotateY !== undefined) {
                                rotationYRef.current = latest.rotateY;
                                if (latest.rotateY >= 179 && !isRotationComplete) {
                                    setTimeout(() => setIsRotationComplete(true), 50);
                                }
                            }
                        }}
                    >
                        {showIcons && winningField !== null
                            ? isWinningField
                                ? "💸"
                                : isSelected && !isWinningField
                                    ? ""
                                    : ""
                            : "💸"}
                    </motion.button>
                );
            })}
        </div>
    );
}

export default MultiplierButtons;
