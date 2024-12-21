import React, { useState, useEffect } from "react";
import {useError} from "../contexts/ErrorContext";

function LoginModal({
                        isRegisterMode,
                        closeLoginModal,
                        setIsLoggedIn,
                        setUsername,
                        setBalance,
                        setDisplayBalance,
                        startTokenExpirationWatcher,
                    }) {
    const [usernameInput, setUsernameInput] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [email, setEmail] = useState("");
    const [usernameStatus, setUsernameStatus] = useState(null);
    const [usernameError, setUsernameError] = useState("");
    const [emailStatus, setEmailStatus] = useState(null);
    const [emailError, setEmailError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showModal, setShowModal] = useState(true);
    const [isRegistering, setIsRegistering] = useState(isRegisterMode);
    const {showError} = useError()

    const [usernameDebounce, setUsernameDebounce] = useState("");
    const [emailDebounce, setEmailDebounce] = useState("");

    // 🟢 Validate Username
    const validateUsername = (username) => {
        const regex = /^[a-zA-Z0-9_]{3,16}$/;
        if (!regex.test(username)) {
            return "❌ Username must be 3-16 characters long and only contain letters, numbers, or underscores.";
        }
        return "";
    };

    // 🟢 Validate Email
    const validateEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email) ? "" : "❌ Invalid email format.";
    };

    // 🟢 Username Debounce
    useEffect(() => {
        if (usernameDebounce) {
            const validationError = validateUsername(usernameDebounce);
            if (validationError) {
                setUsernameError(validationError);
                setUsernameStatus(null);
                return;
            }
            setUsernameError("");

            const timeout = setTimeout(async () => {
                try {
                    const response = await fetch(
                        `http://localhost:5000/api/check-username?username=${usernameDebounce}`
                    );
                    const data = await response.json();
                    setUsernameStatus(
                        data.available
                            ? "✅ Username is available"
                            : "❌ Username is already taken"
                    );
                } catch (error) {
                    console.error("Error checking username:", error);
                    setUsernameStatus("⚠️ Error checking username availability.");
                }
            }, 500);

            return () => clearTimeout(timeout);
        }
    }, [usernameDebounce]);

    // 🟢 Email Debounce
    useEffect(() => {
        if (emailDebounce) {
            const validationError = validateEmail(emailDebounce);
            if (validationError) {
                setEmailError(validationError);
                setEmailStatus(null);
                return;
            }
            setEmailError("");

            const timeout = setTimeout(async () => {
                try {
                    const response = await fetch(
                        `http://localhost:5000/api/check-email?email=${emailDebounce}`
                    );
                    const data = await response.json();
                    setEmailStatus(
                        data.available
                            ? "✅ Email is available"
                            : "❌ Email is already in use"
                    );
                } catch (error) {
                    console.error("Error checking email:", error);
                    setEmailStatus("⚠️ Error checking email availability.");
                }
            }, 500);

            return () => clearTimeout(timeout);
        }
    }, [emailDebounce]);

    const handleLogin = async () => {
        setIsLoading(true);
        setShowModal(false);
        try {
            const response = await fetch("http://localhost:5000/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
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
                startTokenExpirationWatcher();
            } else {
                showError("Login failed: " + data.error);
                setShowModal(true); // 🟢 Show modal again on login failure
            }
        } catch (error) {
            showError(error.message);
            setShowModal(true); // 🟢 Show modal again on error
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async () => {
        if (password !== passwordConfirm) {
            alert("Passwords do not match!");
            return;
        }

        if (usernameError || emailError) {
            alert("Please fix the validation errors before proceeding.");
            return;
        }

        setIsLoading(true);
        setShowModal(false);
        try {
            const response = await fetch("http://localhost:5000/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
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
            alert("An error occurred during registration.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="modal-backdrop">
            {isLoading && (
                <div className="loading-backdrop">
                    <div className="spinner"></div>
                </div>
            )}
            {showModal && (
                <div className="modal" onClick={(e) => e.stopPropagation()}>
                    <h2>{isRegistering ? "Register" : "Login"}</h2>

                    {isRegistering ? (
                        <>
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setEmailDebounce(e.target.value);
                                }}
                            />
                            {emailError && (
                                <p style={{ color: "red", fontSize: "0.8rem" }}>
                                    {emailError}
                                </p>
                            )}
                            {emailStatus && (
                                <p style={{ fontSize: "0.8rem" }}>{emailStatus}</p>
                            )}

                            <input
                                type="text"
                                placeholder="Username"
                                value={usernameInput}
                                onChange={(e) => {
                                    setUsernameInput(e.target.value);
                                    setUsernameDebounce(e.target.value);
                                }}
                            />
                            {usernameError && (
                                <p style={{ color: "red", fontSize: "0.8rem" }}>
                                    {usernameError}
                                </p>
                            )}
                            {usernameStatus && (
                                <p style={{ fontSize: "0.8rem" }}>{usernameStatus}</p>
                            )}

                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <input
                                type="password"
                                placeholder="Confirm Password"
                                value={passwordConfirm}
                                onChange={(e) => setPasswordConfirm(e.target.value)}
                            />
                            <button onClick={handleRegister} disabled={isLoading}>
                                {isLoading ? "Registering..." : "Register"}
                            </button>
                        </>
                    ) : (
                        <>
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
                            <button onClick={handleLogin} disabled={isLoading}>
                                {isLoading ? "Logging in..." : "Login"}
                            </button>
                        </>
                    )}

                    <button className="close-button" onClick={closeLoginModal}>
                        Close
                    </button>
                    <button
                        className="toggle-button"
                        onClick={() => setIsRegistering(!isRegistering)}
                    >
                        {isRegistering ? "I already have an account" : "Register"}
                    </button>
                </div>
            )}
        </div>
    );
}

export default LoginModal;
