import React from "react";

const InfoModal = ({ closeModal }) => {
    return (
        <div className="modal-backdrop" onClick={closeModal}>
            <div className="modal info-modal" onClick={(e) => e.stopPropagation()}>
                <h1>Game Rules & Important Information</h1>

                <div className="info-content">
                    {/* SECTION 1: Game Overview */}
                    <section>
                        <h2>Welcome to Hustler</h2>
                        <p>
                            Hustler is a raw, fast-paced betting game where you can multiply your wager based on a selected multiplier or jackpot and luck.
                            The game is designed to be transparent and fair, offering multiple play modes.
                        </p>
                    </section>

                    {/* SECTION 2: Game Modes & Odds */}
                    <section>
                        <h2>Game Modes & Odds</h2>
                        <p>Choose from the following multiplier options:</p>
                        <ul>
                            <li>
                                <strong>2x Mode</strong>: 42% chance to win.
                            </li>
                            <li>
                                <strong>5x Mode</strong>: 1 in 6 chance to win.
                            </li>
                            <li>
                                <strong>10x Mode</strong>: 1 in 12 chance to win.
                            </li>
                        </ul>
                        <p>
                            The odds are fixed and ensure fair gameplay.
                        </p>
                    </section>

                    {/* SECTION 3: How to Play */}
                    <section>
                        <h2>How to Play</h2>
                        <ol>
                            <li>
                                <strong>Deposit Funds:</strong> Transfer USDT to your assigned wallet address.
                            </li>
                            <li>
                                <strong>Place Your Bet:</strong> Choose your stake, select a multiplier mode, and pick your field.
                            </li>
                            <li>
                                <strong>Outcome & Payout:</strong> A winning field is randomly drawn. If your chosen field wins, your bet is multiplied accordingly.
                            </li>
                        </ol>
                    </section>

                    {/* SECTION 4: Fees & Withdrawals */}
                    <section>
                        <h2>Fees & Withdrawals</h2>
                        <p>
                            The operator covers all gas fees <em>except</em> for deposits.
                        </p>
                        <p>
                            Withdrawals are limited to one per user per day with a minimum withdrawal amount of <strong>$10</strong>. Withdrawals are processed only to your registered wallet.
                        </p>
                    </section>

                    {/* SECTION 5: Responsible Gaming */}
                    <section>
                        <h2>Responsible Gaming</h2>
                        <p>
                            Gambling should be entertaining and not lead to financial strain. Play responsibly and only bet what you can afford to lose. 
                            If you experience gambling-related issues, consider taking a break or seeking professional help.
                        </p>
                        <p>Helpful resources:</p>
                        <ul>
                            <li>
                                <a href="https://www.begambleaware.org/" target="_blank" rel="noopener noreferrer">
                                    BeGambleAware
                                </a>
                            </li>
                            <li>
                                <a href="https://www.responsiblegambling.org/" target="_blank" rel="noopener noreferrer">
                                    Responsible Gambling Council
                                </a>
                            </li>
                        </ul>
                    </section>

                    {/* SECTION 6: Liability Disclaimer */}
                    <section>
                        <h2>Liability Disclaimer</h2>
                        <p>
                            This game is provided <strong>"as is"</strong> without warranties of any kind. 
                            All outcomes are determined randomly, and there is <strong>no guarantee of winning</strong>. 
                            The operator is not responsible for any financial losses incurred while playing.
                        </p>
                    </section>

                    {/* SECTION 7: Terms & Conditions */}
                    <section>
                        <h2>Terms & Conditions</h2>
                        <ul>
                            <li>You must be at least <strong>18 years old</strong> to play.</li>
                            <li>All transactions are conducted in <strong>USDT (Tether)</strong>.</li>
                            <li>One withdrawal per user per day, with a minimum of <strong>$10</strong>.</li>
                            <li>The operator covers all gas fees except for deposits.</li>
                            <li>Game rules and terms are subject to change at the operator’s discretion.</li>
                            <li>For support, contact our customer service team.</li>
                        </ul>
                    </section>

                    {/* SECTION 8: Privacy Policy */}
                    <section>
                        <h2>Privacy Policy</h2>
                        <p>
                            We respect your privacy. Your personal information is never shared or sold. 
                            All transactions and account details are securely stored and encrypted.
                        </p>
                        <p>
                            You may request account deletion or data review by contacting support.
                        </p>
                    </section>
                </div>

                {/* Close Button */}
                <div className="button-container">
                    <button className="info-modal" onClick={closeModal}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InfoModal;


