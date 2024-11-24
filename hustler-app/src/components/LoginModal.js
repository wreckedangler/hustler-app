// components/LoginModal.js
import React, { useState } from "react";

function LoginModal({
                        isRegisterMode,
                        closeLoginModal,
                        setIsLoggedIn,
                        setUsername,
                        setBalance,
                        setDisplayBalance,
                        openRegisterModal,
                    }) {
    const [usernameInput, setUsernameInput] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");

    const handleLogin = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username: usernameInput, password }),
            });
            const data = await response.json();
            if (data.token) {
                localStorage.setItem("token", data.token);
                setUsername(data.user.username);
                const userBalance = parseFloat(data.user.balance) || 0;
                setBalance(userBalance);
                setDisplayBalance(userBalance);
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
                body: JSON.stringify({ username: usernameInput, email, password }),
            });
            const data = await response.json();
            if (data.message) {
                alert("Registration successful! You can now log in.");
                closeLoginModal();
            } else {
                alert("Registration failed: " + data.error);
            }
        } catch (error) {
            console.error("Error during registration:", error);
            alert("An error occurred during registration.");
        }
    };

    return (
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
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
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
                <button className="close-button" onClick={closeLoginModal}>
                    Close
                </button>
                {!isRegisterMode && (
                    <div className="register-link">
                        <button className="register-button" onClick={openRegisterModal}>
                            Register
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default LoginModal;
