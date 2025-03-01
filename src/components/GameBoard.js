import React, { useState, useEffect } from "react";
import MultiplierButtons from "./MultiplierButtons";
import { useNotification } from "../contexts/NotificationContext";
import WinPopup from "./WinPopup";

function GameBoard({
  selectedMultiplier,
  selectedAmount,
  setSelectedAmount,
  setBalance,
  balance,
  isLoggedIn,
  setSelectedMultiplier,
  animateBalance,
  openLoginModal,
  username,
  setRefreshTrigger
}) {
  const [selectedField, setSelectedField] = useState(null);
  const [winningField, setWinningField] = useState(null);
  const [allFlipped, setAllFlipped] = useState(false);
  const [showIcons, setShowIcons] = useState(false);
  const [isRoundInProgress, setIsRoundInProgress] = useState(false);
  const [showWinPopup, setShowWinPopup] = useState(false);
  const [winAmount, setWinAmount] = useState(0);
  const { showNotification } = useNotification();
  let [previousAmount] = useState(selectedAmount);

  useEffect(() => {
    if (["20k", "50k", "100k"].includes(selectedMultiplier)) {
      setSelectedAmount("10$");
    }
  }, [selectedMultiplier, setSelectedAmount]);

  const handleBackClick = () => {
    setSelectedMultiplier(null);
    setSelectedAmount(previousAmount);
    setSelectedField(null);
    setWinningField(null);
    setAllFlipped(false);
    setShowIcons(false);
    setIsRoundInProgress(false);
  };

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
        throw new Error("Failed to fetch balance from server");
      }
      const data = await response.json();
      setBalance(data.balance);
    } catch (error) {
      console.error("Error fetching balance from backend:", error);
    }
  };

  const checkBalanceAndPlay = async () => {
    const betAmount = parseFloat(selectedAmount.replace("$", ""));
    if (username !== "Hustler") {
      await fetchBalanceFromDB();
      if (balance < betAmount) {
        showNotification("Insufficient balance for this bet.", "error");
        return;
      }
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
        showNotification(data.error, "error");
        return;
      }
      setWinningField(data.winningField);
      setIsRoundInProgress(true);
      setTimeout(() => setAllFlipped(true), 600);
      setTimeout(() => setShowIcons(true), 1200);
      if (data.result === "win") {
        setWinAmount(data.winnings);
        setShowWinPopup(true);
      }
      setTimeout(() => {
        const newBalance = data.result === "win" ? balance + data.winnings : balance - betAmount;
        animateBalance(balance, newBalance);
        setBalance(newBalance);
        setAllFlipped(false);
        setShowIcons(false);
        setSelectedField(null);
        setWinningField(null);
        setIsRoundInProgress(false);
        setRefreshTrigger((prev) => prev + 1);
      }, 3000);
    } catch (error) {
      showNotification("Error sending bet to backend: " + error.message, "error");
    }
  };

  useEffect(() => {
    if (selectedField !== null) {
      checkBalanceAndPlay();
    }
  }, [selectedField]);

  return (
    <div className="game-board">
      <WinPopup
        isVisible={showWinPopup}
        delay={2500}
        winnings={winAmount}
        onClose={() => setShowWinPopup(false)}
      />
      {selectedMultiplier === "1m" ? (
        <></>
      ) : (
        <div className="game-controls" style={{ display: "flex", alignItems: "flex-start" }}>
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
        </div>
      )}
    </div>
  );
}

export default GameBoard;
