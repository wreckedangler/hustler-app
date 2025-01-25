// App.js
import React, {useEffect, useRef, useState} from "react";
import Header from "./components/Header";
import MainContent from "./components/MainContent";
import LoginModal from "./components/LoginModal";
import WithdrawModal from "./components/WithdrawModal";
import {NotificationProvider} from "./contexts/NotificationContext";
import "./App.css";

function App() {
    // Global state
    const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
    const [isWithdrawModalVisible, setIsWithdrawModalVisible] = useState(false);
    const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
    const [isRegisterMode, setIsRegisterMode] = useState(false);
    const [username, setUsername] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [balance, setBalance] = useState(0.0);
    const [displayBalance, setDisplayBalance] = useState(0.0);
    const [defaultWithdrawAddress, setDefaultWithdrawAddress] = useState(""); // Store the default withdrawal address
    const inactivityTimer = useRef(null);
    const [isDropdownVisible, setIsDropdownVisible] = useState(false)

    /**
     * 🔥 Get expiration time from JWT Token
     * @param {string} token
     * @returns {number} expiration timestamp in milliseconds
     */
    const getTokenExpiration = (token) => {
        if (!token) return null;
        const [, payload] = token.split(".");
        const decodedPayload = JSON.parse(atob(payload));
        return decodedPayload.exp * 1000; // Convert to milliseconds
    };

    /**
     * 🔥 Refresh the token using the refresh token
     */
    const refreshToken = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/refresh-token", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refreshToken: localStorage.getItem("refreshToken") }),
            });

            if (!response.ok) {
                throw new Error("Failed to refresh token");
            }

            const data = await response.json();
            localStorage.setItem("token", data.token); // Save new token
            console.log("🔄 Token successfully refreshed");
            startTokenExpirationWatcher(data.token); // Restart the watcher
            return data.token;
        } catch (error) {
            console.error("❌ Error refreshing token:", error);
            await handleLogout(); // If token can't be refreshed, log out
        }
    };

    /**
     * 🔥 Start token expiration watcher to refresh token before it expires
     * @param {string} token
     */
    const startTokenExpirationWatcher = (token) => {
        const expirationTime = getTokenExpiration(token);
        if (!expirationTime) return;

        const timeUntilExpiration = expirationTime - Date.now();
        console.log(`⏳ Token expires in ${timeUntilExpiration / 1000} seconds.`);

        // Refresh token 5 minutes before it expires
        setTimeout(async () => {
            console.log("🔄 Refreshing token before expiration...");
            await refreshToken();
        }, timeUntilExpiration - 5 * 60 * 1000); // 5 minutes before expiration
    };

    // 🟢 Handle Logout
    const handleLogout = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/logout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            if (!response.ok) {
                console.log("Failed to log out from server");
            }

            localStorage.removeItem("token"); // Remove token from local storage
            setIsLoggedIn(false); // Set local login status to false
            closeDropdown()
        } catch (error) {
            console.log("Error during logout:", error.message);
        }
    };

    // 🟢 Fetch Login State from Server
    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                const response = await fetch("http://localhost:5000/api/check-login", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });

                if (!response.ok) {
                    throw new Error("Failed to check login status");
                }

                const data = await response.json();
                if (data.isLoggedIn) {
                    setIsLoggedIn(true);
                    setUsername(data.username);
                    setBalance(data.balance);
                    setDisplayBalance(data.balance);
                    console.log("✅ User is logged in:", data.username);
                } else {
                    console.log("🚪 User is not logged in");
                }
            } catch (error) {
                console.error("❌ Error checking login status:", error.message);
            }
        };

        checkLoginStatus();
    }, []);

    // 🟢 Inactivity Timer Setup
    useEffect(() => {
        const handleUserActivity = () => {
            console.log("🕹️ User activity detected, resetting timer...");
            resetInactivityTimer();
        };

        // Events to track user activity
        window.addEventListener("mousemove", handleUserActivity);
        window.addEventListener("keydown", handleUserActivity);
        window.addEventListener("click", handleUserActivity);
        window.addEventListener("scroll", handleUserActivity);

        // Start the inactivity timer
        startInactivityTimer();

        return () => {
            window.removeEventListener("mousemove", handleUserActivity);
            window.removeEventListener("keydown", handleUserActivity);
            window.removeEventListener("click", handleUserActivity);
            window.removeEventListener("scroll", handleUserActivity);
            clearTimeout(inactivityTimer.current);
        };
    }, [isLoggedIn]);

    // Start the Inactivity Timer
    const startInactivityTimer = () => {
        if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
        inactivityTimer.current = setTimeout(() => {
            console.log("⏳ User inactive for 30 minutes. Logging out...");
            handleLogout();
        }, 1800000); // 30 minutes = 30 * 60 * 1000 ms
    };

    // Reset the Inactivity Timer
    const resetInactivityTimer = () => {
        if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
        startInactivityTimer();
    };

    // Fetch default withdrawal address
    const getDefaultWithdrawAddress = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/get-default-withdraw-address", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch default withdraw address");
            }

            const data = await response.json();
            return data.defaultAddress;
        } catch (error) {
            console.error("❌ Error fetching default withdraw address:", error.message);
            return "";
        }
    };

    const saveDefaultWithdrawAddress = async (address) => {
        try {
            const response = await fetch("http://localhost:5000/api/save-default-withdraw-address", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`, // Token hinzufügen
                },
                body: JSON.stringify({ withdrawAddress: address }), // Adresse korrekt übergeben
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Unknown error occurred.");
            }

            return await response.json(); // Antwort zurückgeben
        } catch (error) {
            throw error;
        }
    };


    // Handle withdrawal submission
    const handleWithdraw = async (address, amount) => {
        try {
            const response = await fetch("http://localhost:5000/api/withdraw", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ address, amount }),
            });

            if (!response.ok) {
                throw new Error("Failed to process withdrawal");
            }

            const data = await response.json();
            setBalance(data.newBalance); // Update balance
            setDisplayBalance(data.newBalance);
            console.log("✅ Withdrawal successful");
        } catch (error) {
            console.error("❌ Error during withdrawal:", error.message);
        }
    };

    // Modal control functions
    const openLoginModal = () => {
        setIsLoginModalVisible(true);
        setIsRegisterMode(false);
    };

    const openRegisterModal = () => {
        setIsLoginModalVisible(true);
        setIsRegisterMode(true);
    };

    const closeLoginModal = () => {
        setIsLoginModalVisible(false);
    };

    const openWithdrawModal = async () => {
        const defaultAddress = await getDefaultWithdrawAddress();
        setDefaultWithdrawAddress(defaultAddress);
        setIsWithdrawModalVisible(true);
    };


    const closeWithdrawModal = () => {
        setIsWithdrawModalVisible(false);
    };

    const closeDropdown = () => {
        setIsDropdownVisible(false);
    };

    // Balance animation
    const animateBalance = (start, end) => {
        const duration = 1000;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const currentBalance = start + (end - start) * progress;
            setDisplayBalance(currentBalance.toFixed(2));

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        requestAnimationFrame(animate);
    };

    return (
        <NotificationProvider>
            <div className="App">
                <Header
                    isLoggedIn={isLoggedIn}
                    setIsLoggedIn={setIsLoggedIn}
                    username={username}
                    displayBalance={displayBalance}
                    openLoginModal={openLoginModal}
                    openRegisterModal={openRegisterModal}
                    balance={balance}
                    openWithdrawModal={openWithdrawModal}
                    handleLogout={handleLogout}
                    submitWithdraw={handleWithdraw}
                    isDropdownVisible={isDropdownVisible}
                    setIsDropdownVisible={setIsDropdownVisible}
                />
                <MainContent
                    isLoggedIn={isLoggedIn}
                    balance={balance}
                    setBalance={setBalance}
                    displayBalance={displayBalance}
                    setDisplayBalance={setDisplayBalance}
                    openLoginModal={openLoginModal}
                    animateBalance={animateBalance}
                    username={username}
                />
                {isLoginModalVisible && (
                    <LoginModal
                        isRegisterMode={isRegisterMode}
                        closeLoginModal={closeLoginModal}
                        setIsLoggedIn={setIsLoggedIn}
                        setUsername={setUsername}
                        setBalance={setBalance}
                        setDisplayBalance={setDisplayBalance}
                        openRegisterModal={openRegisterModal}
                        startTokenExpirationWatcher={startTokenExpirationWatcher}
                    />
                )}
                {isWithdrawModalVisible && (
                    <WithdrawModal
                        closeModal={closeWithdrawModal}
                        submitWithdraw={handleWithdraw}
                        availableBalance={balance}
                        getDefaultAddress={getDefaultWithdrawAddress}
                        saveDefaultAddress={saveDefaultWithdrawAddress}
                    />
                )}
            </div>
        </NotificationProvider>
    );
}

export default App;
