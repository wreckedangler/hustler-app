import React, { useState, useEffect } from "react";
import MultiplierButtons from "./MultiplierButtons";
import { useNotification } from "../contexts/NotificationContext";
import WinPopup from "./WinPopup"; // Importiere das WinPopup Modul

function GameBoard({
                       selectedMultiplier,
                       selectedAmount,
                       setSelectedAmount,
                       setBalance, // Globaler Saldo
                       balance, // Globaler Saldo als Prop
                       isLoggedIn,
                       setSelectedMultiplier,
                       animateBalance,
                       openLoginModal,
                       username,
                   }) {
    const [selectedField, setSelectedField] = useState(null);
    const [winningField, setWinningField] = useState(null);
    const [allFlipped, setAllFlipped] = useState(false);
    const [showIcons, setShowIcons] = useState(false);
    const [isRoundInProgress, setIsRoundInProgress] = useState(false);
    const [showWinPopup, setShowWinPopup] = useState(false);
    const [winAmount, setWinAmount] = useState(0);
    let [previousAmount] = useState(selectedAmount); // Speichert den vorherigen Betrag
    const { showNotification } = useNotification();

    // Setzt selectedAmount dynamisch, falls der Multiplikator 20k, 50k oder 100k ist
    useEffect(() => {
        if (["20k", "50k", "100k"].includes(selectedMultiplier)) {
            setSelectedAmount("10$");
        }
    }, [selectedMultiplier, selectedAmount, setSelectedAmount]);

    const handleBackClick = () => {
        setSelectedMultiplier(null);
        setSelectedAmount(previousAmount);
        setSelectedField(null);
        setWinningField(null);
        setAllFlipped(false);
        setShowIcons(false);
        setIsRoundInProgress(false);
    };

    // Balance vom Backend abrufen
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

        // Balance-Check überspringen, falls der Benutzer "Hustler" heißt
        if (username !== "Hustler") {
            await fetchBalanceFromDB();
            console.log("Current balance:", balance, "Bet amount:", betAmount);
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

            // Hier wird geprüft, ob der Spieler gewonnen hat und das WinPopup angezeigt
            if (data.result === "win") {
                setWinAmount(data.winnings);
                setShowWinPopup(true);
            }

            setTimeout(() => {
                const newBalance =
                    data.result === "win" ? balance + data.winnings : balance - betAmount;
                animateBalance(balance, newBalance);
                setBalance(newBalance);

                // Reset der Spielzustände
                setAllFlipped(false);
                setShowIcons(false);
                setSelectedField(null);
                setWinningField(null);
                setIsRoundInProgress(false);
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
            {/* WinPopup-Komponente wird hier gerendert */}
            <WinPopup
                isVisible={showWinPopup}
                delay={2500}
                winnings={winAmount}
                onClose={() => setShowWinPopup(false)}
            />
            {selectedMultiplier === "1m" ? (
                <></>
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
