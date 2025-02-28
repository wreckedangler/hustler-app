import React, { useEffect, useState } from "react";

const prestigeIcons = [
    "/prestige0.svg",
    "/prestige1.svg",
    "/prestige2.svg",
    "/prestige3.svg",
    "/prestige4.svg",
    "/prestige5.svg",
    "/prestige6.svg",
    "/prestige7.svg",
    "/prestige8.svg",
    "/prestige9.svg",
    "/prestige10.svg"
];

function UserInfo({ isLoggedIn, username }) {
    const [level, setLevel] = useState(1);
    const [prestige, setPrestige] = useState(0);
    const [ep, setEP] = useState(0);

    useEffect(() => {
        if (isLoggedIn) {
            fetch("/api/get-level", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            })
                .then(res => res.json())
                .then(data => {
                    setLevel(data.level);
                    setPrestige(data.prestige);
                    setEP(data.ep);
                })
                .catch(error => console.error("Error fetching level data:", error));
        }
    }, [isLoggedIn]);

    // Fortschrittsberechnung für EP-Balken
    const epPercentage = Math.min((ep / 100) * 100, 100); // Maximal 100 %

    return (
        <div className="user-info">
            {isLoggedIn ? (
                <div className="user-header">
                    <span className="user-name">{username}</span>
                    <span className="user-level">LV {level}</span>
                    <div className="ep-bar-container">
                        <div className="ep-bar">
                            <div className="ep-fill" style={{ width: `${epPercentage}%` }}></div>
                        </div>
                    </div>
                </div>
            ) : (
                <span className="user-name"></span>
            )}
        </div>
    );
}

export default UserInfo;
