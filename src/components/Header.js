import React, { useState, useRef, useEffect } from "react";
import UserInfo from "./UserInfo";
import MenuButton from "./MenuButton";
import DropdownMenu from "./DropdownMenu";
import DepositModal from "./DepositModal";
import WithdrawModal from "./WithdrawModal";
import InfoModal from "./InfoModal";
import ReferralDashboard from "./ReferralDashboard";

function Header({
    isLoggedIn,
    username,
    displayBalance,
    openLoginModal,
    openRegisterModal,
    handleLogout,
    openWithdrawModal,
    submitWithdraw,
    isDropdownVisible,
    setIsDropdownVisible,
    refreshTrigger
}) {
    const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [isReferralDashboardOpen, setIsReferralDashboardOpen] = useState(false);
    const dropdownRef = useRef(null);
    

    const toggleDropdown = () => {
        setIsDropdownVisible((prev) => !prev);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target) &&
                event.target.className !== "menu-button"
            ) {
                setIsDropdownVisible(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <header className="header">
            <div className="header-left">
                {/* UserInfo bekommt refreshTrigger zur Aktualisierung */}
                <UserInfo isLoggedIn={isLoggedIn} username={username} refreshTrigger={refreshTrigger} />
            </div>

            <div className="header-center">
                <div className="title">HUSTLER</div>
            </div>

            <div className="header-right">
                {isLoggedIn ? (
                    <>
                        <div className="balance">
                            <span>${parseFloat(displayBalance).toFixed(2)}</span>
                        </div>
                        <MenuButton toggleDropdown={toggleDropdown} />
                    </>
                ) : (
                    <>
                        <button className="login-button" onClick={openLoginModal}>Login</button>
                        <button className="sign-in-button" onClick={openRegisterModal}>Sign up</button>
                    </>
                )}
            </div>

            
            {isDropdownVisible && (
                <DropdownMenu
                    handleLogout={handleLogout}
                    isLoggedIn={isLoggedIn}
                    openLoginModal={openLoginModal}
                    openRegisterModal={openRegisterModal}
                    openDepositModal={() => setIsDepositModalOpen(true)}
                    openWithdrawModal={openWithdrawModal}
                    openInfoModal={() => setIsInfoModalOpen(true)}
                    openReferralDashboard={() => setIsReferralDashboardOpen(true)}
                    ref={dropdownRef}
                />
            )}

            {isInfoModalOpen && <InfoModal closeModal={() => setIsInfoModalOpen(false)} />}
            {isDepositModalOpen && <DepositModal closeModal={() => setIsDepositModalOpen(false)} />}
            {isWithdrawModalOpen && <WithdrawModal closeModal={() => setIsWithdrawModalOpen(false)} submitWithdraw={submitWithdraw} />}
            {isReferralDashboardOpen && <ReferralDashboard closeModal={() => setIsReferralDashboardOpen(false)} />}
        </header>
    );
}

export default Header;
