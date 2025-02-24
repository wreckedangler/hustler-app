import React, { useEffect, useState } from "react";

const ReferralDashboard = ({ closeModal }) => {
    const [stats, setStats] = useState({
        totalReferrals: 0,
        played20: 0,
        played50: 0,
        totalRewards: 0,
        totalPoints: 0,
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch("http://localhost:5000/api/get-referral-data", {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                const data = await response.json();
                setStats({
                    totalReferrals: data.totalReferrals,
                    played20: data.played20,
                    played50: data.played50,
                    totalRewards: data.totalRewards,
                    totalPoints: data.totalPoints,
                });
            } catch (error) {
                console.error("Error fetching referral data:", error);
            }
        };
        fetchData();
    }, []);

    const getPercentage = (value) => {
        return stats.totalReferrals > 0 ? (value / stats.totalReferrals) * 100 : 0;
    };

    return (
        <div className="modal-backdrop" onClick={closeModal}>
            <div className="modal referral-modal" onClick={(e) => e.stopPropagation()}>
                <h2>Referral Dashboard</h2>
                <h1>{stats.totalReferrals} Registrations</h1>

                <div className="progress-container">
                    <p>Users who played $20</p>
                    <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${getPercentage(stats.played20)}%` }}></div>
                    </div>
                    <span>{stats.played20}</span>
                </div>

                <div className="progress-container">
                    <p>Users who played $50</p>
                    <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${getPercentage(stats.played50)}%` }}></div>
                    </div>
                    <span>{stats.played50}</span>
                </div>

                <div className="progress-container">
                    <p>Total Referral Rewards ($)</p>
                    <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${getPercentage(stats.totalRewards)}%` }}></div>
                    </div>
                    <span>${stats.totalRewards}</span>
                </div>

                <div className="progress-container">
                    <p>Total Gamification Points</p>
                    <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${getPercentage(stats.totalPoints)}%` }}></div>
                    </div>
                    <span>{stats.totalPoints} Points</span>
                </div>

                <button className="close-button" onClick={closeModal}>Close</button>
            </div>
        </div>
    );
};

export default ReferralDashboard;
