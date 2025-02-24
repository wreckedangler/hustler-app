import React, { useEffect, useState } from "react";

const ReferralDashboard = ({ closeModal }) => {
    const [referralStats, setReferralStats] = useState({
        totalReferrals: 0,
        referralsAt20: 0,
        referralsAt50: 0,
        totalRewards: 0,
        gamificationPoints: 0
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch("http://localhost:5000/api/get-referral-stats", {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                const data = await response.json();
                setReferralStats({
                    totalReferrals: data.totalReferrals || 0,
                    referralsAt20: data.referralsAt20 || 0,
                    referralsAt50: data.referralsAt50 || 0,
                    totalRewards: data.totalRewards || 0,
                    gamificationPoints: data.gamificationPoints || 0
                });
            } catch (error) {
                console.error("Error fetching referral data:", error);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="modal-backdrop" onClick={closeModal}>
            <div className="modal referral-dashboard" onClick={(e) => e.stopPropagation()}>
                <div className="referral-title">Referrals</div>
                <p className="total-registrations">
                    {referralStats.totalReferrals} <span>registrations</span>
                </p>

                <div className="progress-container">
                    <p>Users who played $20</p>
                    <div className="progress-wrapper">
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: referralStats.totalReferrals > 0 ? `${(referralStats.referralsAt20 / referralStats.totalReferrals) * 100}%` : "0%" }}></div>
                        </div>
                        <span className="progress-value">{referralStats.referralsAt20}</span>
                    </div>
                </div>

                <div className="progress-container">
                    <p>Users who played $50</p>
                    <div className="progress-wrapper">
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: referralStats.totalReferrals > 0 ? `${(referralStats.referralsAt50 / referralStats.totalReferrals) * 100}%` : "0%" }}></div>
                        </div>
                        <span className="progress-value">{referralStats.referralsAt50}</span>
                    </div>
                </div>

                <div className="progress-container">
                    <p>Total Referral Rewards ($)</p>
                    <div className="progress-wrapper">
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${Math.min(referralStats.totalRewards / 100, 1) * 100}%` }}></div>
                        </div>
                        <span className="progress-value">${referralStats.totalRewards.toFixed(2)}</span>
                    </div>
                </div>

                <div className="progress-container">
                    <p>Total Gamification Points</p>
                    <div className="progress-wrapper">
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${Math.min(referralStats.gamificationPoints / 1000, 1) * 100}%` }}></div>
                        </div>
                        <span className="progress-value">{referralStats.gamificationPoints}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReferralDashboard;
