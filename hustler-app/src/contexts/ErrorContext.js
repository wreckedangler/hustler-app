// contexts/ErrorContext.js
import React, { createContext, useContext, useState } from "react";

const ErrorContext = createContext();

export const useError = () => {
    return useContext(ErrorContext);
};

export const ErrorProvider = ({ children }) => {
    const [errorMessage, setErrorMessage] = useState("");
    const [isVisible, setIsVisible] = useState(false);

    const showError = (message) => {
        setErrorMessage(message);
        setIsVisible(true);
    };

    const hideError = () => {
        setIsVisible(false);
        setErrorMessage("");
    };

    return (
        <ErrorContext.Provider value={{ showError, hideError }}>
            {children}
            {isVisible && (
                <div className="error-modal">
                    <div className="error-content">
                        <h3>Error</h3>
                        <p>{errorMessage}</p>
                        <button onClick={hideError}>Close</button>
                    </div>
                </div>
            )}
        </ErrorContext.Provider>
    );
};
