const { ethers } = require('ethers');
const crypto = require('crypto');

// Provider to interact with the Ethereum blockchain (use Infura, Alchemy, or own node)
const provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);

// 🔥 Funktion zum Verschlüsseln des privaten Schlüssels
const encryptPrivateKey = (privateKey) => {
    try {
        if (!privateKey) throw new Error('No private key provided for encryption');

        const algorithm = 'aes-256-cbc'; // Symmetrischer Verschlüsselungsalgorithmus
        const secretKey = process.env.SECRET_KEY;

        if (!secretKey) {
            throw new Error('SECRET_KEY is not defined in .env file');
        }

        console.log('🔍 SECRET_KEY:', secretKey);
        if (secretKey.length !== 64) {
            throw new Error('SECRET_KEY must be 64 hexadecimal characters (32 bytes)');
        }

        const keyBuffer = Buffer.from(secretKey, 'hex');
        console.log('🔍 Buffer Length:', keyBuffer.length);

        const iv = crypto.randomBytes(16); // Initialisierungsvektor (IV) mit 16 Bytes
        const cipher = crypto.createCipheriv(algorithm, keyBuffer, iv);

        let encrypted = cipher.update(privateKey, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        const encryptedData = {
            iv: iv.toString('hex'),
            encryptedPrivateKey: encrypted
        };

        console.log('🟢 Private Key encrypted successfully');
        return JSON.stringify(encryptedData);
    } catch (error) {
        console.error('❌ Error encrypting private key:', error.message);
        throw new Error('Failed to encrypt private key');
    }
};

// 🟢 Funktion zum Abfragen des Wallet-Guthabens (für native ETH)
const getWalletBalance = async (walletAddress) => {
    try {
        const balance = await provider.getBalance(walletAddress);
        const formattedBalance = ethers.formatEther(balance); // Konvertierung von Wei zu ETH
        console.log(`Balance of ${walletAddress}: ${formattedBalance} ETH`);
        return parseFloat(formattedBalance);
    } catch (error) {
        console.error(`Error fetching balance for ${walletAddress}:`, error);
        throw new Error('Failed to fetch wallet balance');
    }
};

// 🟢 Funktion zum Abfragen des Token-Guthabens (USDT) für eine Wallet
const getTokenBalance = async (walletAddress) => {
    try {
        const tokenAddress = process.env.USDT_CONTRACT_ADDRESS;

        if (!tokenAddress || !ethers.isAddress(tokenAddress)) {
            throw new Error('USDT_CONTRACT_ADDRESS is not defined or invalid in .env file');
        }

        if (!walletAddress || !ethers.isAddress(walletAddress)) {
            throw new Error('Invalid wallet address');
        }

        const abi = [
            "function balanceOf(address owner) view returns (uint256)"
        ];

        const contract = new ethers.Contract(tokenAddress, abi, provider);
        const balance = await contract.balanceOf(walletAddress);
        const formattedBalance = ethers.formatUnits(balance, 6); // USDT hat 6 Dezimalstellen
        console.log(`🟢 USDT Balance of ${walletAddress}: ${formattedBalance} USDT`);
        return parseFloat(formattedBalance);
    } catch (error) {
        console.error(`❌ Error fetching token balance for ${walletAddress}:`, error.message);
        throw new Error('Failed to fetch token balance');
    }
};

// 🛠️ Funktion zum Erstellen einer neuen Wallet
const createWallet = () => {
    try {
        const wallet = ethers.Wallet.createRandom(); // 🟢 Neue Wallet generieren
        console.log('🟢 Wallet created:', wallet.address);
        return {
            address: wallet.address, // 🟢 Wallet-Adresse
            privateKey: wallet.privateKey // 🟢 Privater Schlüssel
        };
    } catch (error) {
        console.error('❌ Error generating wallet:', error.message);
        throw new Error('Failed to create wallet');
    }
};

// 🛠️ Exportiere die Funktion
module.exports = {
    createWallet, // 🔥 WICHTIG
    getWalletBalance,
    getTokenBalance,
    encryptPrivateKey,
};
