// components/WithdrawModal.js
import React, { useState } from 'react';

const WithdrawModal = ({ closeModal, submitWithdraw }) => {
    const [withdrawAddress, setWithdrawAddress] = useState('');
    const [withdrawAmount, setWithdrawAmount] = useState('');

    const handleWithdraw = () => {
        submitWithdraw(withdrawAddress, withdrawAmount);
    };

    return (
        <div className="modal-backdrop" onClick={closeModal}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <h2>Withdraw</h2>
                <input
                    type="text"
                    placeholder="Enter wallet address"
                    value={withdrawAddress}
                    onChange={(e) => setWithdrawAddress(e.target.value)}
                />
                <input
                    type="number"
                    placeholder="Enter amount"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                />
                <button onClick={handleWithdraw}>Submit Withdraw</button>
                <button className="close-button" onClick={closeModal}>Close</button>
            </div>
        </div>
    );
};

export default WithdrawModal;