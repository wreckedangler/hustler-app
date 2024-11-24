// components/MenuButton.js
import React from "react";

function MenuButton({ toggleDropdown }) {
    return (
        <button className="menu-button" onClick={toggleDropdown}>
            ☰
        </button>
    );
}

export default MenuButton;
