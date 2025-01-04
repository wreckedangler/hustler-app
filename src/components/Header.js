import React, { useState, useRef, useEffect } from "react";
import UserInfo from "./UserInfo";
import MenuButton from "./MenuButton";
import DropdownMenu from "./DropdownMenu";
import DepositModal from "./DepositModal";
import WithdrawModal from "./WithdrawModal";

function Header({
                    isLoggedIn,
                    setIsLoggedIn,
                    username,
                    displayBalance,
                    openLoginModal,
                    openRegisterModal
                }) {
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    const dropdownRef = useRef(null);

    const toggleDropdown = () => {
        setIsDropdownVisible((prev) => !prev);
    };

    // 🟢 **handleLogout Funktion**
    const handleLogout = async () => {
        console.log('🚪 Logging out...');

        try {
            const response = await fetch('http://localhost:5000/api/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to log out from server');
            }

            localStorage.removeItem('token'); // Remove token from local storage
            setIsLoggedIn(false); // Set local login status to false
            setIsDropdownVisible(false); // Close dropdown menu

            console.log('🟢 User has been logged out successfully');
        } catch (error) {
            console.error('❌ Error during logout:', error.message);
        }
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
                {isLoggedIn ? (
                    <>
                        <div className="balance">
                            <span>${parseFloat(displayBalance).toFixed(2)}</span>
                        </div>
                        <MenuButton toggleDropdown={toggleDropdown}/>
                    </>
                ) : (
                    <button
                        className="login-button"
                        onClick={openLoginModal}
                    >
                        Login
                    </button>
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
