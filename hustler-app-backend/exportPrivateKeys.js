const pool = require('./db');
const decryptPrivateKey = require('./wallet').decryptPrivateKey; // Import the decryption function

const exportPrivateKeys = async () => {
    let client;

    try {
        client = await pool.connect();

        // 1️⃣ **Export User Wallets**
        const userResult = await client.query('SELECT id, username, wallet_address, encrypted_private_key FROM users');
        console.log('\n📢 **User Wallets** 📢');
        userResult.rows.forEach((row) => {
            const decryptedKey = decryptPrivateKey(row.encrypted_private_key);
            console.log(`
                🔹 Username: ${row.username}
                🔹 Wallet Address: ${row.wallet_address}
                🔑 Private Key: ${decryptedKey}
            `);
        });

        // 2️⃣ **Export Pot Wallets**
        const potResult = await client.query('SELECT id, wallet_address, encrypted_private_key FROM pot_wallets');
        console.log('\n📢 **Pot Wallets** 📢');
        potResult.rows.forEach((row) => {
            const decryptedKey = decryptPrivateKey(row.encrypted_private_key);
            console.log(`
                🔹 Wallet Address: ${row.wallet_address}
                🔑 Private Key: ${decryptedKey}
            `);
        });

    } catch (error) {
        console.error('❌ Error exporting private keys:', error.message);
    } finally {
        if (client) client.release();
        pool.end();
    }
};

exportPrivateKeys();
