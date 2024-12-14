// components/DepositModal.js
import React, { useEffect, useState } from 'react';

const DepositModal = ({ closeModal }) => {
    const [walletAddress, setWalletAddress] = useState('');

    // Fetch the wallet address from the server when the modal opens
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
        alert('Wallet address copied to clipboard!');
    };

    return (
        <div className="modal-backdrop" onClick={closeModal}>
            <div className="modal deposit-modal" onClick={(e) => e.stopPropagation()}>
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
