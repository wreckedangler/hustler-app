// App.js
import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import MainContent from "./components/MainContent";
import LoginModal from "./components/LoginModal";
import "./App.css";

function App() {
    // Globaler Zustand
    const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
    const [isRegisterMode, setIsRegisterMode] = useState(false);
    const [username, setUsername] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [balance, setBalance] = useState(0.0);
    const [displayBalance, setDisplayBalance] = useState(0.0);

    // 🟢 **Fetch Login State from Server**
    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/check-login', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to check login status');
                }

                const data = await response.json();
                if (data.isLoggedIn) {
                    setIsLoggedIn(true);
                    setUsername(data.username);
                    setBalance(data.balance);
                    setDisplayBalance(data.balance);
                    console.log('✅ User is logged in:', data.username);
                } else {
                    console.log('🚪 User is not logged in');
                }
            } catch (error) {
                console.error('❌ Error checking login status:', error.message);
            }
        };

        checkLoginStatus();
    }, []);

    // Funktionen zum Öffnen/Schließen von Modalen
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

    // Funktion zum Aktualisieren des Balances mit Animation
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
        <div className="App">
            <Header
                isLoggedIn={isLoggedIn}
                setIsLoggedIn={setIsLoggedIn}
                username={username}
                displayBalance={displayBalance}
                openLoginModal={openLoginModal}
                openRegisterModal={openRegisterModal}
                balance={balance}
            />
            <MainContent
                isLoggedIn={isLoggedIn}
                balance={balance}
                setBalance={setBalance}
                displayBalance={displayBalance}
                setDisplayBalance={setDisplayBalance}
                openLoginModal={openLoginModal}
                animateBalance={animateBalance}
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
                />
            )}
        </div>
    );
}

export default App;
