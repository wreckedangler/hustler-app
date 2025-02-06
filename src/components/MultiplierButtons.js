import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

function MultiplierButtons({
                               selectedMultiplier,
                               selectedField,
                               setSelectedField,
                               winningField,
                               isRoundInProgress,
                               allFlipped,
                               showIcons,
                               openLoginModal,
                               isLoggedIn,
                           }) {
    const [wiggleComplete, setWiggleComplete] = useState(false);
    const rotationYRef = useRef(0);
    const [isRotationComplete, setIsRotationComplete] = useState(false);

    // Map multipliers to front and back image paths
    const multiplierImages = {
        front: {
            "2x": "/default.jpg",
            "5x": "/default.jpg",
            "10x": "/default.jpg",
            "20k": "/default.jpg",
            "50k": "/default.jpg",
            "100k": "/default.jpg",
        },
        back: "/nothing.jpg", // Standard-Bild für die Rückseite
    };

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

    // Reset-Funktion für ein neues Spiel
    useEffect(() => {
        if (winningField === null) {
            setTimeout(() => {
                setSelectedField(null);
                setWiggleComplete(false);
                setIsRotationComplete(false);
                rotationYRef.current = 0;
            }, 0);
        }
    }, [winningField]);


    const count =
        selectedMultiplier === "2x"
            ? 2
            : selectedMultiplier === "5x"
                ? 6
                : selectedMultiplier === "10x"
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
        flipToReveal: {
            rotateY: 180,
            transition: {
                rotateY: { duration: 1, delay: 0.4 },
            },
        },
        highlight: {
            boxShadow: "0 0 10px 5px yellow",
            animation: "blink 0.5s ease-in-out infinite alternate",
            transition: { duration: 0.3, ease: "easeInOut", delay: 0 },
        },
    };

    return (
        <div className={containerClass}>
            {Array.from({ length: count }, (_, i) => {
                const fieldNumber = i + 1;
                const isWinningField = fieldNumber === winningField;
                const isSelected = fieldNumber === selectedField;

                // Neue Logik: Sobald wiggleComplete true ist, flippen ALLE Buttons gleichzeitig.
                let animateSequence;
                if (wiggleComplete) {
                    animateSequence =
                        isRotationComplete && isWinningField
                            ? ["flipToReveal", "highlight"]
                            : "flipToReveal";
                } else {
                    animateSequence = isSelected ? "wiggle" : "initial";
                }



                return (
                    <motion.button
                        key={i}
                        className="dynamic-button"
                        onClick={() => handleButtonClick(fieldNumber)}
                        disabled={winningField !== null && !allFlipped}
                        initial="initial"
                        animate={animateSequence}
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
                        {showIcons && winningField !== null ? (
                            isWinningField ? (
                                <img
                                    src="/win.jpg"
                                    alt={`${selectedMultiplier} icon`}
                                    className="button-image"
                                />
                            ) : isSelected && !isWinningField ? (
                                <img src="/nothing.jpg" alt="" />
                            ) : (
                                <img src="/nothing.jpg" alt="Default icon" />
                            )
                        ) : (
                            <img
                                src="/default.jpg"
                                alt={`${selectedMultiplier} icon`}
                            />
                        )}
                    </motion.button>
                );
            })}
        </div>
    );
}

export default MultiplierButtons;
