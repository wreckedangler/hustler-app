import React, { useState } from "react";

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
    const [isLoading, setIsLoading] = useState(false); // 🟢 Loading state
    const [showModal, setShowModal] = useState(true); // 🟢 Control modal visibility

    // 🟢 Validate Username
    const validateUsername = (username) => {
        const regex = /^[a-zA-Z0-9_]{3,16}$/;
        if (!regex.test(username)) {
            return "❌ Username must be 3-16 characters long and only contain letters, numbers, or underscores.";
        }
        return "";
    };

    // 🟢 Check Username Availability
    const handleUsernameCheck = async (username) => {
        const validationError = validateUsername(username);
        if (validationError) {
            setUsernameError(validationError);
            setUsernameStatus(null);
            return;
        }
        setUsernameError("");

        try {
            const response = await fetch(
                `http://localhost:5000/api/check-username?username=${username}`
            );
            const data = await response.json();
            setUsernameStatus(data.available ? "✅ Username is available" : "❌ Username is already taken");
        } catch (error) {
            console.error("Error checking username:", error);
            setUsernameStatus("⚠️ Error checking username availability.");
        }
    };

    // 🟢 Validate Email
    const validateEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email regex
        return regex.test(email) ? "" : "❌ Invalid email format.";
    };

    // 🟢 Check Email Availability
    const handleEmailCheck = async (email) => {
        const validationError = validateEmail(email);
        if (validationError) {
            setEmailError(validationError);
            setEmailStatus(null);
            return;
        }
        setEmailError("");

        try {
            const response = await fetch(`http://localhost:5000/api/check-email?email=${email}`);
            const data = await response.json();
            setEmailStatus(data.available ? "✅ Email is available" : "❌ Email is already in use.");
        } catch (error) {
            console.error("Error checking email:", error);
            setEmailStatus("⚠️ Error checking email availability.");
        }
    };

    // 🟢 Handle Login
    const handleLogin = async () => {
        setIsLoading(true); // 🟢 Show loading
        setShowModal(false); // 🟢 Hide modal
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
                alert("Login failed: " + data.error);
            }
        } catch (error) {
            alert("An error occurred during login.");
        } finally {
            setIsLoading(false); // 🟢 Hide loading
        }
    };

    // 🟢 Handle Register
    const handleRegister = async () => {
        if (password !== passwordConfirm) {
            alert("Passwords do not match!");
            return;
        }

        if (usernameError || emailError) {
            alert("Please fix the validation errors before proceeding.");
            return;
        }

        setIsLoading(true); // 🟢 Show loading
        setShowModal(false); // 🟢 Hide modal
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
            setIsLoading(false); // 🟢 Hide loading
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
                    <h2>{isRegisterMode ? "Register" : "Login"}</h2>

                    {isRegisterMode ? (
                        <>
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    handleEmailCheck(e.target.value);
                                }}
                            />
                            <input
                                type="text"
                                placeholder="Username"
                                value={usernameInput}
                                onChange={(e) => {
                                    setUsernameInput(e.target.value);
                                    handleUsernameCheck(e.target.value);
                                }}
                            />
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
                                {isLoading ? 'Registering...' : 'Register'}
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
                                {isLoading ? 'Logging in...' : 'Login'}
                            </button>
                        </>
                    )}

                    <button className="close-button" onClick={closeLoginModal}>
                        Close
                    </button>
                </div>
            )}
        </div>
    );
}

export default LoginModal;
