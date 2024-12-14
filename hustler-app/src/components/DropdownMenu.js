// components/DropdownMenu.js
import React from "react";


const DropdownMenu = React.forwardRef(({ openLoginModal, openRegisterModal, openDepositModal, openWithdrawModal, isLoggedIn, handleLogout }, ref) => {
    console.log(isLoggedIn)
    return (
        <div className="dropdown-menu" ref={ref}>
            <ul>

                {isLoggedIn ? (
                    <>
                        <li onClick={openDepositModal}>Deposit</li>
                        <li onClick={openWithdrawModal}>Withdraw</li>
                        <li onClick={handleLogout}>Logout</li>
                    </>
                ) : (
                    <li onClick={openLoginModal}>Login</li>
                )}
            </ul>
        </div>
    );
});

export default DropdownMenu;