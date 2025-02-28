import React from "react";
import { LogIn, LogOut, Upload, Download, Users, Info } from "lucide-react"; 

const DropdownMenu = React.forwardRef(({ openLoginModal, openDepositModal, openWithdrawModal, openReferralDashboard, isLoggedIn, handleLogout, openInfoModal }, ref) => {
    return (
        <div className="dropdown-menu" ref={ref}>
            <ul>
                {isLoggedIn ? (
                    <>
                        <li onClick={openDepositModal}>
                            <Upload className="icon" size={20} />
                            Deposit
                        </li>
                        <li onClick={openWithdrawModal}>
                            <Download className="icon" size={20} />
                            Withdraw
                        </li>
                        <li onClick={openReferralDashboard}>
                            <Users className="icon" size={20} />
                            Referral Program
                        </li>
                        <li onClick={openInfoModal}>
                            <Info className="icon" size={20} />
                            Info
                        </li>
                        <li onClick={handleLogout} className="logout">
                            <LogOut className="icon" size={20} />
                            Logout
                        </li>
                    </>
                ) : (
                    <li onClick={openLoginModal}>
                        <LogIn className="icon" size={20} />
                        Login
                    </li>
                )}
            </ul>
        </div>
    );
});

export default DropdownMenu;
