// components/UserInfo.js
import React from "react";

function UserInfo({ isLoggedIn, username }) {
    return (
        <div className="user-info">
            {isLoggedIn ? (
                <>
                    <span className="user-name">{username}</span>
                </>
            ) : (
                <span className="user-name"></span>
            )}
        </div>
    );
}

export default UserInfo;
