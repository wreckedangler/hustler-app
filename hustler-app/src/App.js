// App.js
import React, { useState } from "react";
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
