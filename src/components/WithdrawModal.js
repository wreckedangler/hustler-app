import React, { useState, useEffect } from 'react';

const WithdrawModal = ({ closeModal, submitWithdraw, availableBalance = 0, getDefaultAddress, saveDefaultAddress }) => {
    const [withdrawAddress, setWithdrawAddress] = useState('');
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [defaultAddress, setDefaultAddress] = useState('');
    const [isValid, setIsValid] = useState(false);

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

    // Validate the form inputs
    useEffect(() => {
        const isValidAddress = withdrawAddress && withdrawAddress.length > 0; // Simplified address validation
        const isValidAmount = withdrawAmount >= 10 && withdrawAmount <= availableBalance;
        setIsValid(isValidAddress && isValidAmount);
    }, [withdrawAddress, withdrawAmount, availableBalance]);

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
                <p>Available Balance: ${parseFloat(availableBalance).toFixed(2)}</p>
                <input
                    type="text"
                    placeholder="Wallet address"
                    value={withdrawAddress}
                    onChange={(e) => setWithdrawAddress(e.target.value)}
                />
                <button onClick={handleSaveDefaultAddress}>Save as Default Address</button>
                <input
                    type="number"
                    placeholder="Amount"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                />
                <button onClick={handleWithdraw} disabled={!isValid}>Submit</button>
                <button className="close-button" onClick={closeModal}>Close</button>
            </div>
        </div>
    );
};

export default WithdrawModal;
