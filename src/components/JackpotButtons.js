import React from "react";
import { motion } from "framer-motion";

function JackpotButtons({ isSubJackpotSelected, setSelectedJackpot, goBack }) {
    const handleSubJackpotClick = (subJackpot) => {
        setSelectedJackpot(subJackpot);
    };

    return (
        <div className="jackpot-container">
            {!isSubJackpotSelected ? (
                <div className="box-buttons">
                    <motion.button
                        className="box-button"
                        whileHover={{ scale: 1.05 }}
                        onClick={() => setSelectedJackpot("jackpotA")}
                    >
                        Jackpot A
                    </motion.button>
                    <motion.button
                        className="box-button"
                        whileHover={{ scale: 1.05 }}
                        onClick={() => setSelectedJackpot("jackpotB")}
                    >
                        Jackpot B
                    </motion.button>
                    <motion.button
                        className="box-button"
                        whileHover={{ scale: 1.05 }}
                        onClick={() => setSelectedJackpot("jackpotC")}
                    >
                        Jackpot C
                    </motion.button>
                </div>
            ) : (
                <>
                    <div className="box-buttons">
                        <motion.button
                            className="box-button"
                            whileHover={{ scale: 1.05 }}
                            onClick={() => handleSubJackpotClick("subA1")}
                        >
                            Sub A1
                        </motion.button>
                        <motion.button
                            className="box-button"
                            whileHover={{ scale: 1.05 }}
                            onClick={() => handleSubJackpotClick("subA2")}
                        >
                            Sub A2
                        </motion.button>
                        <motion.button
                            className="box-button"
                            whileHover={{ scale: 1.05 }}
                            onClick={() => handleSubJackpotClick("subA3")}
                        >
                            Sub A3
                        </motion.button>
                    </div>
                    <div className="back-button-container">
                        <button className="back-button" onClick={goBack}>
                            ↩
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export default JackpotButtons;
