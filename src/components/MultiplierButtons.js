import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import RouletteJackpot from "./RouletteJackpot";

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
  // Optional: falls du den Balance-Refresh oder ähnliches machen willst,
  // kannst du hier auch setBalance, etc. empfangen
}) {
  const [wiggleComplete, setWiggleComplete] = useState(false);
  const rotationYRef = useRef(0);
  const [isRotationComplete, setIsRotationComplete] = useState(false);

  // Falls "20k", "50k" oder "100k" gewählt ist → Jackpot-Roulette
  const isJackpotMultiplier = ["20k", "50k", "100k"].includes(selectedMultiplier);

  // Wenn einer dieser Multiplikatoren gewählt ist, zeige Roulette
  if (isJackpotMultiplier) {
    return (
      <div style={{ width: "100%", textAlign: "center" }}>
        <RouletteJackpot
          betType={selectedMultiplier}
          betAmount="10"       // Beispiel: fix auf 10$, ggf. dynamisch anpassen
          isLoggedIn={isLoggedIn}
          openLoginModal={openLoginModal}
          onSpinResult={(data) => {
            console.log("Spin finished, server response:", data);
            // Hier könntest du setBalance(data.newBalance) etc. aufrufen,
            // falls du diese Props reingereicht hast.
          }}
        />
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────
  // 2x, 5x, 10x → Alte Button-Logik
  // ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (winningField === null) {
      setTimeout(() => {
        setSelectedField(null);
        setWiggleComplete(false);
        setIsRotationComplete(false);
        rotationYRef.current = 0;
      }, 0);
    }
  }, [winningField, setSelectedField]);

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

  return (
    <div className={containerClass}>
      {Array.from({ length: count }, (_, i) => {
        const fieldNumber = i + 1;
        const isWinningField = fieldNumber === winningField;
        const isSelected = fieldNumber === selectedField;

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
                <img src="/win.jpg" alt={`${selectedMultiplier} icon`} />
              ) : isSelected && !isWinningField ? (
                <img src="/nothing.jpg" alt="not winning" />
              ) : (
                <img src="/nothing.jpg" alt="default icon" />
              )
            ) : (
              <img src="/default.jpg" alt={`${selectedMultiplier} icon`} />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

export default MultiplierButtons;
