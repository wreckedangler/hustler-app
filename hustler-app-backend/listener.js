require("dotenv").config();
const { ethers } = require("ethers");
const pool = require("./db");
const redis = require("redis");

const provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);
const usdtContractAddress = process.env.USDT_CONTRACT_ADDRESS;
const redisClient = redis.createClient({ url: process.env.REDIS_URL });

redisClient.on("error", (err) => console.error("Redis Client Error", err));
redisClient.connect();

// ERC20 Transfer event signature
const transferEventSignature = ethers.keccak256(
    ethers.toUtf8Bytes("Transfer(address,address,uint256)")
);

let userWallets = new Map();

async function loadUserWallets() {
    console.log("Loading user wallets from database...");
    const users = await pool.query("SELECT id, wallet_address FROM users");
    userWallets.clear();
    users.rows.forEach((user) => {
        userWallets.set(user.wallet_address.toLowerCase(), user.id);
    });
    console.log("Loaded user wallets:", userWallets.size);
}

async function processTransferEvent(log) {
    const iface = new ethers.Interface([
        "event Transfer(address indexed from, address indexed to, uint256 value)",
    ]);

    const decodedLog = iface.parseLog(log);
    const { to, value } = decodedLog.args;

    const recipientAddress = to.toLowerCase();
    const amount = ethers.formatUnits(value, 6); // USDT has 6 decimals

    if (userWallets.has(recipientAddress)) {
        const userId = userWallets.get(recipientAddress);

        console.log(`📥 Detected deposit: ${amount} USDT to wallet: ${recipientAddress}`);

        // Update user's balance in the database
        await pool.query("UPDATE users SET balance = balance + $1 WHERE id = $2", [parseFloat(amount), userId]);

        // Log the transaction
        await pool.query(
            `INSERT INTO transactions (user_id, wallet_address, amount, type, tx_hash) 
            VALUES ($1, $2, $3, 'deposit', $4)`,
            [userId, recipientAddress, parseFloat(amount), log.transactionHash]
        );

        console.log(`✅  Updated balance for user ID ${userId}`);
    }
}


async function startBlockchainListener() {
    await loadUserWallets();
    setInterval(loadUserWallets, 5 * 60 * 1000);

    console.log("Blockchain listener started!");

    const filter = {
        address: usdtContractAddress,
        topics: [transferEventSignature],
    };

    provider.on(filter, async (log) => {
        try {
            await processTransferEvent(log);
        } catch (error) {
            console.error("❌ Error processing Transfer event:", error.message);
        }
    });

    provider.on("block", (blockNumber) => {
        console.log(`New block mined: ${blockNumber}`);
    });
}

startBlockchainListener().catch((error) => {
    console.error("❌ Error starting blockchain listener:", error.message);
    process.exit(1);
});
