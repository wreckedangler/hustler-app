// components/DropdownMenu.js
import React from "react";

const DropdownMenu = React.forwardRef(({ openLoginModal, openRegisterModal, openDepositModal, openWithdrawModal }, ref) => {
    return (
        <div className="dropdown-menu" ref={ref}>
            <ul>
                <li onClick={openDepositModal}>Deposit</li>
                <li onClick={openWithdrawModal}>Withdraw</li>
                <li onClick={openLoginModal}>Login</li>
            </ul>
        </div>
    );
});

export default DropdownMenu;