import React from 'react'; // React importieren
import { QRCodeSVG } from 'qrcode.react'; // QRCode-Generator

const QRCodeGenerator = ({ walletAddress, size = 128 }) => {
    if (!walletAddress) {
        return <p>Loading QR Code...</p>;
    }

    return (
            <QRCodeSVG value={walletAddress} size={size} />
    );
};

export default QRCodeGenerator;
