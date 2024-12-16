const { ethers } = require("ethers");
const pool = require("./db"); // PostgreSQL-Verbindung
require("dotenv").config();

// ABI für USDT (ERC-20 Token)
const USDT_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)",
];

// Provider zum Verbinden mit Ethereum Blockchain
const provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);

/**
 * Sendet USDT von einer Wallet-Adresse an eine Empfängeradresse und speichert die Transaktion in der DB.
 *
 * @param {string} senderPrivateKey - Der private Key der Sender-Wallet.
 * @param {string} senderAddress - Die Wallet-Adresse des Senders.
 * @param {string} recipientAddress - Die Wallet-Adresse des Empfängers.
 * @param {number} amount - Der Betrag in USDT.
 * @param {number} userId - Die User-ID des Senders (für die DB-Verknüpfung).
 */
const sendUSDT = async (senderPrivateKey, senderAddress, recipientAddress, amount, userId) => {
    let client;
    try {
        const wallet = new ethers.Wallet(senderPrivateKey, provider);

        if (wallet.address.toLowerCase() !== senderAddress.toLowerCase()) {
            throw new Error("Sender address does not match private key.");
        }

        const USDTContract = new ethers.Contract(process.env.USDT_CONTRACT_ADDRESS, USDT_ABI, wallet);
        const amountInWei = ethers.parseUnits(amount.toString(), 6);

        console.log(`🔄 Estimating Gas Fees for ${amount} USDT to ${recipientAddress}...`);

        // Gasfee berechnen
        const gasEstimate = await USDTContract.transfer.estimateGas(recipientAddress, amountInWei);
        const gasPrice = await provider.getFeeData();

        const gasFeeETH = ethers.formatEther(gasEstimate * gasPrice.gasPrice);
        console.log(`⚡ Estimated Gas Fee: ${gasFeeETH} ETH`);

        // Transaktion senden
        const tx = await USDTContract.transfer(recipientAddress, amountInWei, {
            gasLimit: gasEstimate,
            gasPrice: gasPrice.gasPrice,
        });

        console.log("⏳ Transaction sent. Waiting for confirmation...");
        await tx.wait();
        console.log(`✅ Transaction successful! Hash: ${tx.hash}`);

        // Transaktion und Gasfee in DB speichern
        client = await pool.connect();
        await client.query(
            `INSERT INTO transactions (user_id, transaction_type, amount, created_at, status, gas_fee)
             VALUES ($1, $2, $3, NOW(), $4, $5)`,
            [userId, "USDT Transfer", amount, "success", gasFeeETH]
        );

        return { success: true, txHash: tx.hash };
    } catch (error) {
        console.error("❌ Error sending USDT:", error.message);
        if (client) {
            await client.query(
                `INSERT INTO transactions (user_id, transaction_type, amount, created_at, status, gas_fee)
                 VALUES ($1, $2, $3, NOW(), $4, $5)`,
                [userId, "USDT Transfer", amount, "fail", null]
            );
        }
        return { success: false, error: error.message };
    } finally {
        if (client) client.release();
    }
};

module.exports = { sendUSDT };
