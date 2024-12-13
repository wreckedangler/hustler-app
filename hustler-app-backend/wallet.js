const { ethers } = require('ethers');
const crypto = require('node:crypto');

// Funktion zur Erstellung einer Wallet
const createWallet = () => {
    try {
        const wallet = ethers.Wallet.createRandom();
        console.log('Generated Wallet:', wallet); // 🛠️ Debug-Ausgabe
        return {
            address: wallet.address,
            privateKey: wallet.privateKey
        };
    } catch (error) {
        console.error('Error generating wallet:', error);
        throw new Error('Failed to create wallet');
    }
};

// Funktion zur Verschlüsselung des privaten Schlüssels mit AES-256
const encryptPrivateKey = (privateKey) => {
    try {
        // AES-256-CTR benötigt 32-Byte-Schlüssel und 16-Byte-IV
        const secretKey = process.env.SECRET_KEY.slice(0, 32); // AES-256 benötigt genau 32 Byte Schlüssel
        const iv = crypto.randomBytes(16); // 16-Byte Initialisierungs-Vektor (IV)

        const cipher = crypto.createCipheriv('aes-256-ctr', secretKey, iv);
        let encrypted = cipher.update(privateKey, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        // IV wird benötigt, um den verschlüsselten Text zu entschlüsseln
        const encryptedData = {
            iv: iv.toString('hex'),
            encrypted: encrypted
        };

        return JSON.stringify(encryptedData);
    } catch (error) {
        console.error('Error encrypting private key:', error);
        throw new Error('Failed to encrypt private key');
    }
};

// Exporte der Funktionen
module.exports = {
    createWallet,
    encryptPrivateKey
};
