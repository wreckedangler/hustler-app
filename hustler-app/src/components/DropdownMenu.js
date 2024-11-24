// components/DropdownMenu.js
import React from "react";

const DropdownMenu = React.forwardRef(({ openLoginModal, openRegisterModal }, ref) => {
    return (
        <div className="dropdown-menu" ref={ref}>
            <ul>
                <li>Deposit</li>
                <li>Withdraw</li>
                <li onClick={openLoginModal}>Login</li>
                <li onClick={openRegisterModal}>Register</li>
            </ul>
        </div>
    );
});

export default DropdownMenu;
