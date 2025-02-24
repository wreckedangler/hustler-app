// src/components/MenuButton.js
import React from "react";

function MenuButton({ toggleDropdown }) {
    return (
        <button className="menu-button" onClick={toggleDropdown} aria-label="Toggle menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span className="menu-text">Menu</span>
        </button>
    );
}

export default MenuButton;
