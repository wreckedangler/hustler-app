import React from "react";

const CloseButton = ({ onClick }) => {
    return (
        <button className="close-button-cross" onClick={onClick}>
            ✖
        </button>
    );
};

export default CloseButton;
