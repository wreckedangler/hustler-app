import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import "./App.css";

function App() {
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
    const [isRegisterMode, setIsRegisterMode] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [balance, setBalance] = useState(0.0);
    const [wonAmount, setWonAmount] = useState(null);
    const [selectedAmount, setSelectedAmount] = useState("1$");
    const [selectedMultiplier, setSelectedMultiplier] = useState(null);
    const [selectedField, setSelectedField] = useState(null);
    const [winningField, setWinningField] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [allFlipped, setAllFlipped] = useState(false);
    const [showIcons, setShowIcons] = useState(false);
    const [wiggleComplete, setWiggleComplete] = useState(false);
    const [isRoundInProgress, setIsRoundInProgress] = useState(false);

    const dropdownRef = useRef(null);
    const dollarAmounts = ["1$", "2$", "5$", "10$", "25$", "50$", "100$", "200$", "500$"];

    const toggleDropdown = () => {
        setIsDropdownVisible((prev) => !prev);
    };

    const openLoginModal = () => {
        setIsLoginModalVisible(true);
        setIsRegisterMode(false);
        setIsDropdownVisible(false);
    };

    const openRegisterModal = () => {
        setIsLoginModalVisible(true);
        setIsRegisterMode(true);
        setIsDropdownVisible(false);
    };

    const closeLoginModal = () => {
        setIsLoginModalVisible(false);
        setUsername("");
        setPassword("");
        setEmail("");
    };

    const handleLogin = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password }),
            });
            const data = await response.json();
            if (data.token) {
                localStorage.setItem("token", data.token);
                setUsername(data.user.username);
                setBalance(parseFloat(data.user.balance) || 0);
                setIsLoggedIn(true);
                closeLoginModal();
            } else {
                alert("Login failed: " + data.error);
            }
        } catch (error) {
            console.error("Error during login:", error);
            alert("An error occurred during login.");
        }
    };

    const handleRegister = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, email, password }),
            });
            const data = await response.json();
            if (data.message) {
                alert("Registration successful! You can now log in.");
                setIsRegisterMode(false);
                closeLoginModal();
            } else {
                alert("Registration failed: " + data.error);
            }
        } catch (error) {
            console.error("Error during registration:", error);
            alert("An error occurred during registration.");
        }
    };

    const handleMultiplierClick = (multiplier) => {
        if (!isLoggedIn) {
            openLoginModal();
            return;
        }
        setSelectedMultiplier(multiplier);
        setSelectedField(null);
        setWinningField(null);
        setAllFlipped(false);
        setShowIcons(false);
        setIsRoundInProgress(false);
    };

    const handleBackClick = () => {
        setSelectedMultiplier(null);
        setSelectedField(null);
        setWinningField(null);
        setAllFlipped(false);
        setShowIcons(false);
        setIsRoundInProgress(false);
    };

    const checkBalanceAndPlay = async () => {
        const betAmount = parseFloat(selectedAmount.replace("$", ""));
        if (balance < betAmount) {
            alert("Insufficient balance for this bet.");
            return;
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
                alert(data.error);
                return;
            }

            setWinningField(data.winningField);
            setIsRoundInProgress(true);

            setTimeout(() => setAllFlipped(true), 600);

            setTimeout(() => setShowIcons(true), 1200);

            setTimeout(() => {
                if (data.result === "win") {
                    setWonAmount(`+${data.winnings} $`);
                    setBalance((prevBalance) => prevBalance + data.winnings);
                } else {
                    setBalance((prevBalance) => prevBalance - betAmount);
                }

                if (data.result === "win") {
                    setTimeout(() => setWonAmount(null), 2000);
                }

                setAllFlipped(false);
                setShowIcons(false);
                setSelectedField(null);
                setWinningField(null);
                setIsRoundInProgress(false);
            }, 3000);
        } catch (error) {
            console.error("Error sending bet to backend:", error);
        }
    };

    useEffect(() => {
        if (selectedField !== null) {
            checkBalanceAndPlay();
        }
    }, [selectedField]);

    const renderMultiplierButtons = () => {
        const count = selectedMultiplier === "2x" ? 2 : selectedMultiplier === "4x" ? 6 : 12;
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

        const handleButtonClick = (fieldNumber) => {
            if (!isRoundInProgress) {
                setSelectedField(fieldNumber);
                setWiggleComplete(false);
                setTimeout(() => setWiggleComplete(true), 400);
            }
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
                            variants={{
                                ...buttonVariants,
                                flipToReveal: {
                                    ...buttonVariants.flipToReveal,
                                    backgroundColor:
                                        isSelected && !isWinningField
                                            ? "#d71212"
                                            : isWinningField
                                                ? "#28a745"
                                                : "#ff00ff",
                                },
                            }}
                            whileHover={{ scale: 1.05 }}
                        >
                            {showIcons && winningField !== null
                                ? isWinningField
                                    ? "💸"
                                    : isSelected && !isWinningField
                                        ? "❌"
                                        : ""
                                : "💸"}
                        </motion.button>
                    );
                })}
                <button className="back-button" onClick={handleBackClick}>
                    ↩
                </button>
            </div>
        );
    };

    return (
        <div className="App">
            <header>
                <div className="user-info">
                    {isLoggedIn ? (
                        <>
                            <span className="logged-in-icon">🔓</span>
                            <span className="user-name">{username}</span>
                        </>
                    ) : (
                        <span className="logged-out-icon">🔒</span>
                    )}
                </div>
                <div className="title">HUSTLER</div>
                <div className="copyR">®</div>

                {isLoggedIn && (
                    <div className="balance">
                        {wonAmount ? (
                            <span className="congratulations">{wonAmount}</span>
                        ) : (
                            <span>${parseFloat(balance).toFixed(2) || '0.00'}</span>
                        )}
                    </div>
                )}

                <button className="menu-button" onClick={toggleDropdown}>☰</button>
                {isDropdownVisible && (
                    <div className="dropdown-menu" ref={dropdownRef}>
                        <ul>
                            <li>Deposit</li>
                            <li>Withdraw</li>
                            <li onClick={openLoginModal}>Login</li>
                        </ul>
                    </div>
                )}
            </header>

            <main>
                {selectedMultiplier && (
                    <div className="bet-amount-banner">
                        {selectedAmount ? `${selectedAmount}` : "Kein Einsatz ausgewählt"}
                    </div>
                )}

                {!selectedMultiplier ? (
                    <>
                        <div className="dollar-buttons">
                            {dollarAmounts.map((amount) => (
                                <button
                                    key={amount}
                                    className={`dollar-button ${selectedAmount === amount ? "selected" : ""}`}
                                    onClick={() => setSelectedAmount(amount)}
                                >
                                    {amount}
                                </button>
                            ))}
                        </div>
                        <div className="box-buttons">
                            <button className="box-button" onClick={() => handleMultiplierClick("2x")}>2x</button>
                            <button className="box-button" onClick={() => handleMultiplierClick("4x")}>5x</button>
                            <button className="box-button" onClick={() => handleMultiplierClick("8x")}>10x</button>
                        </div>
                    </>
                ) : (
                    renderMultiplierButtons()
                )}
            </main>

            {isLoginModalVisible && (
                <div className="modal-backdrop" onClick={closeLoginModal}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h2>{isRegisterMode ? "Register" : "Login"}</h2>
                        {isRegisterMode && (
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        )}
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button onClick={isRegisterMode ? handleRegister : handleLogin}>
                            {isRegisterMode ? "Register" : "Login"}
                        </button>
                        <button className="close-button" onClick={closeLoginModal}>Close</button>
                        {!isRegisterMode && (
                            <div className="register-link">
                                <button className="register-button" onClick={openRegisterModal}>Register</button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
