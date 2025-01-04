import React, { useEffect, useState } from 'react';
import QRCodeGenerator from './QRCodeGenerator'; // Import QRCodeGenerator component

const DepositModal = ({ closeModal }) => {
    const [walletAddress, setWalletAddress] = useState('');

    // 🟢 Wallet-Adresse beim Öffnen des Modals abrufen
    useEffect(() => {
        const fetchWalletAddress = async () => {
            try {
                const response = await fetch("http://localhost:5000/api/get-wallet-address", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch wallet address from server');
                }

                const data = await response.json();
                setWalletAddress(data.walletAddress);
            } catch (error) {
                console.error("Error fetching wallet address from backend:", error);
            }
        };

        fetchWalletAddress();
    }, []);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(walletAddress);
        alert('📋 Wallet address copied to clipboard!');
    };

    return (
        <div className="modal-backdrop" onClick={closeModal}>
            <div className="modal deposit-modal" onClick={(e) => e.stopPropagation()}>
                <h1>Your Address</h1>

                {/* 🟢 QR-Code Generator */}
                <div className="qr-code-container">
                    <QRCodeGenerator walletAddress={walletAddress} size={180} />
                </div>

                <p>
                    <strong><big>Your USDT-Address</big></strong><br/>
                    <br/>
                    Use this address to deposit USDT (ERC-20) to your account.<br/>
                    <br/>
                    <small><em>Sending any other tokens or coins may result in permanent loss of funds.</em></small>
                </p>


                <div className="wallet-address-container">
                    <div className="input-icon">
                        <img src="/tether-usdt-logo.svg" alt="wallet-icon" />
                    </div>
                    <input
                        type="text"
                        value={walletAddress}
                        readOnly
                        className="wallet-address-input"
                    />
                </div>

                <div className="button-container">
                    <button
                        onClick={copyToClipboard}
                        className="copy-button"
                    >
                        Copy address
                    </button>

                    <button className="close-button" onClick={closeModal}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DepositModal;
