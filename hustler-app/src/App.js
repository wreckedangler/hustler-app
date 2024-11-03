// App.js
import React, { useState, useEffect, useRef } from "react";
import "./App.css";

function App() {
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
    const [isRegisterMode, setIsRegisterMode] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [balance, setBalance] = useState(0.0); // Ensure initial balance is a number
    const [wonAmount, setWonAmount] = useState(null);
    const [selectedAmount, setSelectedAmount] = useState("1$");
    const [selectedMultiplier, setSelectedMultiplier] = useState(null);
    const [selectedField, setSelectedField] = useState(null);
    const [winningField, setWinningField] = useState(null);

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
                setBalance(parseFloat(data.user.balance) || 0); // Ensure balance is parsed as a float
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
        setSelectedMultiplier(multiplier);
        setSelectedField(null);
        setWinningField(null);
    };

    const handleBackClick = () => {
        setSelectedMultiplier(null);
        setSelectedField(null);
        setWinningField(null);
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

            if (data.result === "win") {
                setWonAmount(`+${data.winnings} $`);
                setBalance(balance + data.winnings);
            } else {
                setWonAmount(null);
                setBalance(balance - betAmount);
            }

            setTimeout(() => {
                setSelectedField(null);
                setWinningField(null);
                setWonAmount(null);
            }, data.result === "win" ? 3000 : 2000);
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
        const count = selectedMultiplier === "2x" ? 3 : selectedMultiplier === "4x" ? 6 : 12;
        const containerClass = `dynamic-buttons-container dynamic-${count}`;

        return (
            <div className={containerClass}>
                {Array.from({ length: count }, (_, i) => {
                    const fieldNumber = i + 1;
                    const isWinningField = fieldNumber === winningField;
                    const isLosingField = fieldNumber === selectedField && !isWinningField && winningField !== null;

                    return (
                        <button
                            key={i}
                            className={`dynamic-button ${isWinningField ? "winning-field" : ""} ${isLosingField ? "losing-field" : ""}`}
                            onClick={() => setSelectedField(fieldNumber)}
                            disabled={winningField !== null}
                        >
                            {winningField !== null ? (isWinningField ? "Win!" : "") : "?"}
                        </button>
                    );
                })}
                <button className="back-button" onClick={handleBackClick}>Back</button>
            </div>
        );
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownVisible(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="App">
            <header>
                <div className="user-name">{username}</div>
                <div className="title">HUSTLER</div>
                <div className="copyR">®</div>

                <div className="balance">
                    {wonAmount ? (
                        <span className="congratulations">{wonAmount}</span>
                    ) : (
                        <span>Balance: ${parseFloat(balance).toFixed(2) || '0.00'}</span> // Fallback to 0.00
                    )}
                </div>

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
