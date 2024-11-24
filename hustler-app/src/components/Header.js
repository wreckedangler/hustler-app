// components/Header.js
import React, { useState, useRef, useEffect } from "react";
import UserInfo from "./UserInfo";
import MenuButton from "./MenuButton";
import DropdownMenu from "./DropdownMenu";

function Header({
                    isLoggedIn,
                    username,
                    displayBalance,
                    openLoginModal,
                    openRegisterModal,
                    balance,
                }) {
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const dropdownRef = useRef(null);

    const toggleDropdown = () => {
        setIsDropdownVisible((prev) => !prev);
    };

    // Schließen des Dropdowns, wenn außerhalb geklickt wird
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
        <header>
            <UserInfo isLoggedIn={isLoggedIn} username={username} />
            <div className="title">HUSTLER</div>
            {isLoggedIn && (
                <div className="balance">
                    <span>${displayBalance}</span>
                </div>
            )}
            <MenuButton toggleDropdown={toggleDropdown} />
            {isDropdownVisible && (
                <DropdownMenu
                    openLoginModal={openLoginModal}
                    openRegisterModal={openRegisterModal}
                    ref={dropdownRef}
                />
            )}
        </header>
    );
}

export default Header;