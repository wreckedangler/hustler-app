import React from "react";

const DropdownMenu = React.forwardRef(({ openLoginModal, openDepositModal, openWithdrawModal, isLoggedIn, handleLogout, openInfoModal }, ref) => {
    return (
        <div className="dropdown-menu" ref={ref}>
            <ul>
                {isLoggedIn ? (
                    <>
                        <li onClick={openDepositModal}>
                            <svg width="16" height="16" fill="currentColor" className="bi bi-cash" viewBox="0 0 16 16">
                                <path d="M8.5 0a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-1 0V.5a.5.5 0 0 1 .5-.5zM8 2a6 6 0 1 0 0 12 6 6 0 0 0 0-12zM8 1a5 5 0 1 1 0 10A5 5 0 0 1 8 1z"/>
                                <path d="M8 4a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-1 0V4.5A.5.5 0 0 1 8 4zM8 7a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-1 0V7.5A.5.5 0 0 1 8 7zM8 10a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-1 0v-1A.5.5 0 0 1 8 10z"/>
                            </svg>
                            Deposit
                        </li>
                        <li onClick={openWithdrawModal}>
                            <svg width="16" height="16" fill="currentColor" className="bi bi-arrow-down-circle" viewBox="0 0 16 16">
                                <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm0 1a7 7 0 1 1 0 14A7 7 0 0 1 8 1z"/>
                                <path fillRule="evenodd" d="M8.5 4a.5.5 0 0 1 .5.5v3.793l2.146-2.147a.5.5 0 0 1 .708.708l-3.5 3.5a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 0 1 .708-.708L8 8.293V4.5a.5.5 0 0 1 .5-.5z"/>
                            </svg>
                            Withdraw
                        </li>
                        <li onClick={openInfoModal}>
                            <svg width="16" height="16" fill="currentColor" className="bi bi-info-circle" viewBox="0 0 16 16">
                                <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm0 1a7 7 0 1 1 0 14A7 7 0 0 1 8 1z"/>
                                <path d="M8 4a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-1 0V4.5A.5.5 0 0 1 8 4zM8 7a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V7.5A.5.5 0 0 1 8 7z"/>
                            </svg>
                            Info
                        </li>
                        <li onClick={handleLogout}>
                            <svg width="16" height="16" fill="currentColor" className="bi bi-box-arrow-right" viewBox="0 0 16 16">
                                <path fillRule="evenodd" d="M10.5 0a.5.5 0 0 1 .5.5v4.5h-1V1H1v14h10v-3h1v4.5a.5.5 0 0 1-.5.5H1a.5.5 0 0 1-.5-.5V.5A.5.5 0 0 1 1 0h9.5zM15 8a.5.5 0 0 1 0 1H5.707l2.146 2.146a.5.5 0 0 1-.708.708l-3.5-3.5a.5.5 0 0 1 0-.708l3.5-3.5a.5.5 0 0 1 .708.708L5.707 7H15z"/>
                            </svg>
                            Logout
                        </li>
                    </>
                ) : (
                    <li onClick={openLoginModal}>
                        <svg width="16" height="16" fill="currentColor" className="bi bi-person" viewBox="0 0 16 16">
                            <path d="M3 14s-1 0-1-1 1-1 1-1h10s1 0 1 1-1 1-1 1H3zm8-9a3 3 0 1 0-6 0 3 3 0 0 0 6 0z"/>
                        </svg>
                        Login
                    </li>
                )}
            </ul>
        </div>
    );
});

export default DropdownMenu;