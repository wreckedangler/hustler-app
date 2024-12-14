import React from 'react'; // React importieren
import { QRCodeSVG } from 'qrcode.react'; // QRCode-Generator

const QRCodeGenerator = ({ walletAddress, size = 128 }) => {
    if (!walletAddress) {
        return <p>Loading QR Code...</p>;
    }

    return (
        <div className="qr-code-container">
            <QRCodeSVG value={walletAddress} size={size} />
        </div>
    );
};

export default QRCodeGenerator;
