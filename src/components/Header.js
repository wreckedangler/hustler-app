import React, { useState, useRef, useEffect } from "react";
import UserInfo from "./UserInfo";
import MenuButton from "./MenuButton";
import DropdownMenu from "./DropdownMenu";
import DepositModal from "./DepositModal";
import WithdrawModal from "./WithdrawModal";
import InfoModal from "./InfoModal";
import ReferralDashboard from "./ReferralDashboard"; // Referral-Dashboard importieren

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
                    setIsDropdownVisible
                }) {

    const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [isReferralDashboardOpen, setIsReferralDashboardOpen] = useState(false); // Neu: Referral Dashboard Zustand
    const dropdownRef = useRef(null);

    const toggleDropdown = () => {
        setIsDropdownVisible((prev) => !prev);
    };

    // Close the dropdown if clicked outside
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

    const openInfoModal = () => {
        setIsInfoModalOpen(true);
        setIsDropdownVisible(false); // Close dropdown
    };

    const openDepositModal = () => {
        setIsDepositModalOpen(true);
        setIsDropdownVisible(false); // Close dropdown
    };


    const openReferralDashboard = () => {
        setIsReferralDashboardOpen(true);
        setIsDropdownVisible(false); // Close dropdown
    };

    // Close Modals
    const closeDepositModal = () => setIsDepositModalOpen(false);
    const closeInfoModal = () => setIsInfoModalOpen(false);
    const closeWithdrawModal = () => setIsWithdrawModalOpen(false);
    const closeReferralDashboard = () => setIsReferralDashboardOpen(false);

    return (
        <header>
            <UserInfo isLoggedIn={isLoggedIn} username={username} />
            <div className="title">HUSTLER</div>

            <div className="right-header">
                {isLoggedIn ? (
                    <>
                        <div className="balance">
                            <span>${parseFloat(displayBalance).toFixed(2)}</span>
                        </div>
                        <MenuButton toggleDropdown={toggleDropdown} />
                    </>
                ) : (
                    <>
                        <button className="login-button" onClick={openLoginModal}>
                            Login
                        </button>

                        <button className="sign-in-button" onClick={openRegisterModal}>
                            Sign up
                        </button>
                    </>
                )}
            </div>

            {isDropdownVisible && (
                <DropdownMenu
                    handleLogout={handleLogout}
                    isLoggedIn={isLoggedIn}
                    openLoginModal={openLoginModal}
                    openRegisterModal={openRegisterModal}
                    openDepositModal={openDepositModal}
                    openWithdrawModal={openWithdrawModal}
                    openInfoModal={openInfoModal}
                    openReferralDashboard={openReferralDashboard} // Referral-Dashboard öffnen
                    ref={dropdownRef}
                />
            )}

            {isInfoModalOpen && (
                <InfoModal closeModal={closeInfoModal} />
            )}

            {isDepositModalOpen && (
                <DepositModal
                    walletAddress="0xYourWalletAddressHere"
                    closeModal={closeDepositModal}
                />
            )}

            {isWithdrawModalOpen && (
                <WithdrawModal
                    closeModal={closeWithdrawModal}
                    submitWithdraw={submitWithdraw}
                />
            )}

            {isReferralDashboardOpen && (
                <ReferralDashboard closeModal={closeReferralDashboard} /> // Referral Dashboard Modal
            )}
        </header>
    );
}

export default Header;
