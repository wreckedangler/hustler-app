// components/UserInfo.js
import React from "react";

function UserInfo({ isLoggedIn, username }) {
    return (
        <div className="user-info">
            {isLoggedIn ? (
                <>
                    <span className="logged-in-icon">🔓</span>
                    <span className="user-name">{username}</span>
                </>
            ) : (
                <span className="logged-out-icon">🔒</span>
            )}
        </div>
    );
}

export default UserInfo;
