import React, { createContext, useContext, useState } from "react";

const NotificationContext = createContext();

export const useNotification = () => {
    return useContext(NotificationContext);
};

export const NotificationProvider = ({ children }) => {
    const [notification, setNotification] = useState({
        message: "",
        type: "", // "success", "error", "warning", "info"
        isVisible: false,
    });

    const showNotification = (message, type = "info") => {
        setNotification({ message, type, isVisible: true });

        // Hide notification automatically after 3 seconds
        setTimeout(() => {
            setNotification((prev) => ({ ...prev, isVisible: false }));
        }, 3000);
    };

    const hideNotification = () => {
        setNotification({ ...notification, isVisible: false });
    };

    return (
        <NotificationContext.Provider value={{ showNotification, hideNotification }}>
            {children}
            {notification.isVisible && (
                <div className={`notification-banner notification-${notification.type}`}>
                    <p>{notification.message}</p>
                </div>
            )}
        </NotificationContext.Provider>
    );
};
