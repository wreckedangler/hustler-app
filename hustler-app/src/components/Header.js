import React, { useState, useRef, useEffect } from "react";
import UserInfo from "./UserInfo";
import MenuButton from "./MenuButton";
import DropdownMenu from "./DropdownMenu";
import DepositModal from "./DepositModal";
import WithdrawModal from "./WithdrawModal";

function Header({
                    isLoggedIn,
                    username,
                    displayBalance,
                    openLoginModal,
                    openRegisterModal,
                }) {
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
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

    // Open Deposit Modal
    const openDepositModal = () => {
        setIsDepositModalOpen(true);
        setIsDropdownVisible(false); // Close dropdown
    };

    // Open Withdraw Modal
    const openWithdrawModal = () => {
        setIsWithdrawModalOpen(true);
        setIsDropdownVisible(false); // Close dropdown
    };

    // Close Deposit Modal
    const closeDepositModal = () => setIsDepositModalOpen(false);

    // Close Withdraw Modal
    const closeWithdrawModal = () => setIsWithdrawModalOpen(false);

    const submitWithdraw = (withdrawAddress, withdrawAmount) => {
        alert(`Withdraw request sent to address: ${withdrawAddress} for amount: $${withdrawAmount}`);
        closeWithdrawModal();
    };

    return (
        <header>
            <UserInfo isLoggedIn={isLoggedIn} username={username} />
            <div className="title">HUSTLER</div>

            <div className="right-header">
                {isLoggedIn && (
                    <div className="balance">
                        <span>${displayBalance}</span>
                    </div>
                )}
                <MenuButton toggleDropdown={toggleDropdown} />
            </div>

            {isDropdownVisible && (
                <DropdownMenu
                    openLoginModal={openLoginModal}
                    openRegisterModal={openRegisterModal}
                    openDepositModal={openDepositModal}
                    openWithdrawModal={openWithdrawModal}
                    ref={dropdownRef}
                />
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
        </header>
    );
}

export default Header;
