import React from "react";

const DropdownMenu = React.forwardRef(({ openLoginModal, openDepositModal, openWithdrawModal, openReferralDashboard, isLoggedIn, handleLogout, openInfoModal }, ref) => {
    return (
        <div className="dropdown-menu" ref={ref}>
            <ul>
                {isLoggedIn ? (
                    <>
                        <li onClick={openDepositModal}>
                            <svg className="icon" viewBox="0 0 16 16">
                                <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm.5 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1H9v3a.5.5 0 0 1-1 0v-3H5a.5.5 0 0 1 0-1h3v-3a.5.5 0 0 1 .5-.5z"/>
                            </svg>
                            Deposit
                        </li>
                        <li onClick={openWithdrawModal}>
                            <svg className="icon" viewBox="0 0  16 16">
                                <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm3.354 8.354a.5.5 0 0 1-.708.708L8.5 7.707V12a.5.5 0 0 1-1 0V7.707L5.354 9.062a.5.5 0 1 1-.708-.708l3-3a.5.5 0 0 1 .708 0l3 3z"/>
                            </svg>
                            Withdraw
                        </li>
                        <li onClick={openReferralDashboard}>
                            <svg className="icon" viewBox="0 0 16 16">
                                <path d="M7 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H4s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
                            </svg>
                            Referral Program
                        </li>
                        <li onClick={openInfoModal}>
                            <svg className="icon" viewBox="0 0 16 16">
                                <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm.5 7.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 1 0v2.5zm0 3a.5.5 0 0 1-1 0V8a.5.5 0 0 1 1 0v2.5z"/>
                            </svg>
                            Info
                        </li>
                        <li onClick={handleLogout} className="logout">
                            <svg className="icon" viewBox="0 0 16 16">
                                <path d="M10.5 0a.5.5 0 0 1 .5.5v4.5h-1V1H1v14h10v-3h1v4.5a.5.5 0 0 1-.5.5H1a.5.5 0 0 1-.5-.5V.5A.5.5 0 0 1 1 0h9.5zM15 8a.5.5 0 0 1 0 1H5.707l2.146 2.146a.5.5 0 0 1-.708.708l-3.5-3.5a.5.5 0 0 1 0-.708l3.5-3.5a.5.5 0 0 1 .708.708L5.707 7H15z"/>
                            </svg>
                            Logout
                        </li>
                    </>
                ) : (
                    <li onClick={openLoginModal}>
                        <svg className="icon" viewBox="0 0 16 16">
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