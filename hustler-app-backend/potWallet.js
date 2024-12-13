const pool = require('./db');
const { createWallet, encryptPrivateKey, decryptPrivateKey } = require('./wallet');

// **Erstellt eine neue Pot-Wallet**
const createPotWallet = async () => {
    try {
        // 1. Wallet erstellen
        const { address: walletAddress, privateKey } = createWallet();
        if (!walletAddress || !privateKey) {
            throw new Error('Failed to create pot wallet');
        }

        // 2. Verschlüsselung des privaten Schlüssels
        const encryptedPrivateKey = encryptPrivateKey(privateKey);

        // 3. Wallet in die DB speichern
        const result = await pool.query(
            `INSERT INTO pot_wallets (wallet_address, encrypted_private_key) 
             VALUES ($1, $2) 
             RETURNING id, wallet_address`,
            [walletAddress, encryptedPrivateKey]
        );

        console.log(`Pot wallet created: ${result.rows[0].wallet_address}`);
        return result.rows[0];
    } catch (error) {
        console.error('Error creating pot wallet:', error.message);
        throw new Error('Failed to create pot wallet');
    }
};

//  **Legt eine bestehende Wallet als aktive Pot-Wallet fest**
const setActivePotWallet = async (walletAddress) => {
    try {
        // 1. Alle anderen Wallets als "nicht aktiv" markieren
        await pool.query(`UPDATE pot_wallets SET is_active = FALSE WHERE is_active = TRUE`);

        // 2. Neue aktive Pot-Wallet festlegen
        const result = await pool.query(
            `UPDATE pot_wallets 
             SET is_active = TRUE 
             WHERE wallet_address = $1 
             RETURNING id, wallet_address, is_active`,
            [walletAddress]
        );

        if (result.rows.length === 0) {
            throw new Error('No wallet found with this address');
        }

        console.log(`Pot wallet set as active: ${result.rows[0].wallet_address}`);
        return result.rows[0];
    } catch (error) {
        console.error('Error setting active pot wallet:', error.message);
        throw new Error('Failed to set active pot wallet');
    }
};

// **Holt die aktive Pot-Wallet aus der Datenbank**
const getActivePotWallet = async () => {
    try {
        const result = await pool.query(
            `SELECT wallet_address, encrypted_private_key 
             FROM pot_wallets 
             WHERE is_active = TRUE LIMIT 1`
        );

        if (result.rows.length === 0) {
            throw new Error('No active pot wallet found');
        }

        const wallet = result.rows[0];
        console.log('Active pot wallet:', wallet.wallet_address);
        return wallet;
    } catch (error) {
        console.error('Error getting active pot wallet:', error.message);
        throw new Error('Failed to get active pot wallet');
    }
};

// **Listet alle Pot-Wallets auf**
const listAllPotWallets = async () => {
    try {
        const result = await pool.query(`SELECT * FROM pot_wallets`);
        return result.rows;
    } catch (error) {
        console.error('Error listing pot wallets:', error.message);
        throw new Error('Failed to list pot wallets');
    }
};

// Exporte der Funktionen
module.exports = {
    createPotWallet,
    setActivePotWallet,
    getActivePotWallet,
    listAllPotWallets
};
