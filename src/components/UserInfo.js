import React, { useEffect, useState } from "react";

function UserInfo({ isLoggedIn, username }) {
    const [level, setLevel] = useState(1);
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
                    setEP(data.ep);
                })
                .catch(error => console.error("Error fetching level data:", error));
        }
    }, [isLoggedIn]);

    const epPercentage = Math.min((ep / 100) * 100, 100);

    return (
        <div className="user-info">
            {isLoggedIn ? (
                <div className="user-content">
                    <span className="user-name">{username}</span>
                    <div className="level-container">
                        <span className="user-level">LV {level}</span>
                        <div className="ep-bar">
                            <div className="ep-fill" style={{ width: `${epPercentage}%` }}></div>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}

export default UserInfo;
