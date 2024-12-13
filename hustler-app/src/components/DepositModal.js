// components/DepositModal.js
import React, { useState } from 'react';

const DepositModal = ({ walletAddress, closeModal }) => {
    const copyToClipboard = () => {
        navigator.clipboard.writeText(walletAddress);
        alert('Wallet address copied to clipboard!');
    };

    return (
        <div className="modal-backdrop" onClick={closeModal}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <h2>Deposit</h2>
                <p>Send funds to the following address:</p>
                <input type="text" value={walletAddress} readOnly />
                <button onClick={copyToClipboard}>Copy to Clipboard</button>
                <button className="close-button" onClick={closeModal}>Close</button>
            </div>
        </div>
    );
};

export default DepositModal;