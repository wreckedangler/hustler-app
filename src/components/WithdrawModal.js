import React, { useState, useEffect } from 'react';
import {NotificationProvider, useNotification} from "../contexts/NotificationContext";

const WithdrawModal = ({ closeModal, submitWithdraw, availableBalance = 0, getDefaultAddress, saveDefaultAddress }) => {
    const [withdrawAddress, setWithdrawAddress] = useState('');
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [defaultAddress, setDefaultAddress] = useState('');
    const [isValid, setIsValid] = useState(false);
    const [addressError, setAddressError] = useState('');
    const [amountError, setAmountError] = useState('');
    const { showNotification } = useNotification();

    // Load the default address when the modal loads
    useEffect(() => {
        const fetchDefaultAddress = async () => {
            if (getDefaultAddress) {
                const address = await getDefaultAddress();
                setDefaultAddress(address);
                setWithdrawAddress(address); // Pre-fill the input with the default address
            }
        };

        fetchDefaultAddress();
    }, [getDefaultAddress]);

    useEffect(() => {
        // Validate the address
        if (!withdrawAddress || withdrawAddress.trim() === '') {
            setAddressError('Address is required.');
        } else if (!/^0x[a-fA-F0-9]{40}$/.test(withdrawAddress.trim())) {
            setAddressError('❌ Invalid wallet address format.');
        } else {
            setAddressError('');
        }

        // Validate the amount
        if (withdrawAmount === '' || withdrawAmount < 10) {
            setAmountError('Amount must be at least $10.');
        } else if (withdrawAmount > Number(availableBalance || 0)) {
            setAmountError(`❌ Amount cannot exceed available balance of $${Number(availableBalance || 0).toFixed(2)}.`);
        } else {
            setAmountError('');
        }

        // Set overall form validity
        setIsValid(!addressError && !amountError);
    }, [withdrawAddress, withdrawAmount, availableBalance, addressError, amountError]);


    const handleSaveDefaultAddress = async () => {
        if (saveDefaultAddress) {
            console.log("Übergebene Adresse:", withdrawAddress); // Debugging-Log
            try {
                const response = await saveDefaultAddress(withdrawAddress); // Adresse an die Funktion übergeben
                if (response && response.message) {
                    showNotification(response.message, "success");
                } else {
                    showNotification('Default address maybe saved successfully.', "info");
                }
                setDefaultAddress(withdrawAddress);
            } catch (error) {
                if (error.response && error.response.message) {
                    showNotification(error.response.message, "error");
                } else {
                    showNotification('Failed to save default address.', "error");
                }
            }
        }
    };



    const handleWithdraw = () => {
        if (!isValid) return;
        submitWithdraw(withdrawAddress, withdrawAmount);
    };

    return (
        <div className="modal-backdrop" onClick={closeModal}>
            <div className="modal withdraw-modal" onClick={(e) => e.stopPropagation()}>
                <h2>Withdraw</h2>
                <p>
                    <strong>
                        <big>
                            Available Balance: $
                            {!isNaN(Number(availableBalance)) ? Number(availableBalance).toFixed(2) : '0.00'}
                        </big>
                    </strong>
                </p>


                {/* Fehleranzeige für die Adresse */}
                {addressError && (
                    <p className="error">
                        <em>{addressError}</em>
                    </p>
                )}

                {/* Wallet Address Input */}
                <input
                    type="text"
                    className="wallet-address-input" // Gleiche Klasse wie im Deposit Modal
                    placeholder="Wallet address"
                    value={withdrawAddress}
                    onChange={(e) => setWithdrawAddress(e.target.value)}
                />

                {/* Fehleranzeige für den Betrag */}
                {amountError && (
                    <p className="error">
                        <em>{amountError}</em>
                    </p>
                )}

                {/* Betragseingabe */}
                <input
                    type="number"
                    className="wallet-amount-input"
                    placeholder="Amount"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                />
                <p></p>

                {/* Aktionen */}
                <button onClick={handleWithdraw} disabled={!isValid}>
                    Submit
                </button>
                <button className="close-button" onClick={closeModal}>
                    Close
                </button>
                <button onClick={handleSaveDefaultAddress}>Save as Default Address</button>
            </div>
        </div>

    );

};

export default WithdrawModal;
