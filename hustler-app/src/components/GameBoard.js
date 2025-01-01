import React, { useState, useEffect } from "react";
import MultiplierButtons from "./MultiplierButtons";
import { useNotification } from "../contexts/NotificationContext";


function GameBoard({
                       selectedMultiplier,
                       selectedAmount,
                       setSelectedAmount, // Add this prop to dynamically update the amount
                       setBalance,
                       isLoggedIn,
                       setSelectedMultiplier,
                       animateBalance,
                       openLoginModal,
                       username,
                   }) {
    const [balance, setLocalBalance] = useState(0); // State for the balance
    const [selectedField, setSelectedField] = useState(null);
    const [winningField, setWinningField] = useState(null);
    const [allFlipped, setAllFlipped] = useState(false);
    const [showIcons, setShowIcons] = useState(false);
    const [isRoundInProgress, setIsRoundInProgress] = useState(false);
    let [previousAmount] = useState(selectedAmount); // Store the previous amount
    const {showNotification} = useNotification()
    // Dynamically set the selectedAmount if the multiplier is 20k, 50k, or 100k
    useEffect(() => {
        if (["20k", "50k", "100k"].includes(selectedMultiplier)) {
            setSelectedAmount("10$"); // Set selectedAmount to $10
        }
    }, [selectedMultiplier, selectedAmount, setSelectedAmount]);

    const handleBackClick = () => {
        setSelectedMultiplier(null);
        setSelectedAmount(previousAmount); // Restore the previous amount
        setSelectedField(null);
        setWinningField(null);
        setAllFlipped(false);
        setShowIcons(false);
        setIsRoundInProgress(false);
    };

    // Fetch balance from the backend
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
            setLocalBalance(data.balance);
            setBalance(data.balance); // Optionally set the global balance
        } catch (error) {
            console.error("Error fetching balance from backend:", error);
        }
    };

    const checkBalanceAndPlay = async () => {
        const betAmount = parseFloat(selectedAmount.replace("$", ""));

        // Balance-Prüfung überspringen, wenn der Benutzer "Hustler" ist
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
        } catch (error) {
            showNotification("Error sending bet to backend:" + error, "error");
        }
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
