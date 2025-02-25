import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";

const WinPopup = ({ isVisible, winnings, onClose, delay = 0 }) => {
    const [showPopup, setShowPopup] = useState(false);

    // Verzögere das Anzeigen des Popups
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                setShowPopup(true);
                triggerConfetti(); // Konfetti auslösen, wenn das Popup sichtbar wird
            }, delay);
            return () => clearTimeout(timer);
        } else {
            setShowPopup(false);
        }
    }, [isVisible, delay]);

    // Automatisches Schließen nach 3 Sekunden, sobald das Popup sichtbar ist
    useEffect(() => {
        if (showPopup) {
            const timer = setTimeout(() => {
                onClose();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [showPopup, onClose]);

    // Funktion zum Auslösen der Konfetti-Animation
    const triggerConfetti = () => {
        const duration = 3 * 1000; // Dauer der Konfetti-Animation in Millisekunden
        const end = Date.now() + duration;

        (function frame() {
            confetti({
                particleCount: 5,
                angle: 60,
                spread: 55,
                startVelocity: 30,
                decay: 0.9,
                scalar: 1.2,
                colors: ['#ff0', '#0f0', '#00f', '#f00', '#ff00ff'],
                origin: { x: Math.random(), y: Math.random() - 0.2 }
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        })();
    };

    if (!showPopup) return null;

    return (
        <div className="win-popup">
            <div className="win-popup-content">
            </div>
            <div className="confetti">
                {/* Hier kannst du Konfetti-Animationen hinzufügen */}
            </div>
        </div>
    );
};

export default WinPopup;