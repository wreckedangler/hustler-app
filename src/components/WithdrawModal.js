import React, { useState, useEffect } from 'react';

const WithdrawModal = ({ closeModal, submitWithdraw, availableBalance = 0, getDefaultAddress, saveDefaultAddress }) => {
    const [withdrawAddress, setWithdrawAddress] = useState('');
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [defaultAddress, setDefaultAddress] = useState('');
    const [isValid, setIsValid] = useState(false);
    const [addressError, setAddressError] = useState('');
    const [amountError, setAmountError] = useState('');

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

    // Validate the address and amount in real-time
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
        } else if (withdrawAmount > availableBalance) {
            setAmountError(`❌ Amount cannot exceed available balance of $${availableBalance.toFixed(2)}.`);
        } else {
            setAmountError('');
        }

        // Set overall form validity
        setIsValid(!addressError && !amountError);
    }, [withdrawAddress, withdrawAmount, availableBalance, addressError, amountError]);

    const handleSaveDefaultAddress = () => {
        if (saveDefaultAddress) {
            saveDefaultAddress(withdrawAddress);
            setDefaultAddress(withdrawAddress); // Update the local default address
            alert('Default address saved successfully.');
        }
    };

    const handleWithdraw = () => {
        if (!isValid) return;
        submitWithdraw(withdrawAddress, withdrawAmount);
    };

    return (
        <div className="modal-backdrop" onClick={closeModal}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <h2>Withdraw</h2>
                <p>
                    <strong><big>Available Balance: ${parseFloat(availableBalance).toFixed(2)}</big></strong>
                </p>
                {addressError && <p className="error"><em>{addressError} </em></p>}
                {/* Wallet Address Input */}
                <input
                    type="text"
                    placeholder="Wallet address"
                    value={withdrawAddress}
                    onChange={(e) => setWithdrawAddress(e.target.value)}
                />

                {amountError && <p className="error"><em>{amountError}</em></p>}
                {/* Amount Input */}
                <input
                    type="number"
                    placeholder="Amount"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                />
                <p></p>

                {/* Submit Button */}
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
