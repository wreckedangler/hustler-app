const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("./db");
const cors = require("cors");
const gameAlgorithm = require("./gameAlgorithm");
const { createPotWallet, setActivePotWallet, getActivePotWallet, listAllPotWallets } = require('./potWallet');
const { createWallet, encryptPrivateKey, getTokenBalance} = require('./wallet'); // Import des Wallet-Moduls
require("dotenv").config();

const app = express();
const PORT = 5000;
app.use(express.json());
app.use(cors({ origin: "http://localhost:3000" }));


// Middleware
const authenticateToken = (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Access denied" });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: "Invalid token" });
        req.user = user;
        next();
    });
};

// Funktion zum Abrufen der Wallet-Adresse des Benutzers
app.get("/api/get-wallet-address", authenticateToken, async (req, res) => {
    const userId = req.user.id; // Die Benutzer-ID aus dem Auth-Token abrufen

    try {
        const result = await pool.query(
            "SELECT wallet_address FROM users WHERE id = $1",
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const walletAddress = result.rows[0].wallet_address;
        res.status(200).json({ walletAddress });
    } catch (error) {
        console.error("Error fetching wallet address:", error.message);
        res.status(500).json({ error: "Failed to fetch wallet address" });
    }
});

app.get("/api/get-balance", authenticateToken, async (req, res) => {
    const userId = req.user.id;

    try {
        const result = await pool.query(
            "SELECT balance FROM users WHERE id = $1",
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const balance = result.rows[0].balance;
        res.status(200).json({ balance });
    } catch (error) {
        console.error("Error fetching user balance:", error.message);
        res.status(500).json({ error: "Failed to fetch balance" });
    }
});


app.get("/api/list-pot-wallets", async (req, res) => {
    try {
        const wallets = await listAllPotWallets();
        res.status(200).json({ message: "Pot wallets listed", wallets });
    } catch (error) {
        res.status(500).json({ error: "Failed to list pot wallets", details: error.message });
    }
});


app.get("/api/get-active-pot-wallet", async (req, res) => {
    try {
        const wallet = await getActivePotWallet();
        res.status(200).json({ message: "Active pot wallet", wallet });
    } catch (error) {
        res.status(500).json({ error: "Failed to get active pot wallet", details: error.message });
    }
});


app.post("/api/set-active-pot-wallet", async (req, res) => {
    const { walletAddress } = req.body;

    try {
        const wallet = await setActivePotWallet(walletAddress);
        res.status(200).json({ message: "Active pot wallet set", wallet });
    } catch (error) {
        res.status(500).json({ error: "Failed to set active pot wallet", details: error.message });
    }
});


app.post("/api/create-pot-wallet", async (req, res) => {
    try {
        const wallet = await createPotWallet();
        res.status(201).json({ message: "Pot wallet created", wallet });
    } catch (error) {
        res.status(500).json({ error: "Failed to create pot wallet", details: error.message });
    }
});


// Function to synchronize user balance with wallet balance
const syncUserBalance = async (userId) => {
    try {
        const userResult = await pool.query(
            "SELECT wallet_address FROM users WHERE id = $1",
            [userId]
        );

        if (userResult.rows.length === 0) {
            throw new Error("User not found");
        }

        const walletAddress = userResult.rows[0].wallet_address;

        // 🔥 Get the balance of the wallet (for ETH or USDT)
        const usdtAddress = process.env.USDT_CONTRACT_ADDRESS; // ERC-20 token address for USDT
        const balance = await getTokenBalance(walletAddress, usdtAddress); // Use getTokenBalance for USDT

        // Update the user's balance in the database
        await pool.query(
            "UPDATE users SET balance = $1 WHERE id = $2",
            [balance, userId]
        );

        return balance;
    } catch (error) {
        console.error("Error during balance synchronization:", error.message);
        throw new Error('Failed to synchronize balance');
    }
};

// Check if email is already in use
app.get("/api/check-email", async (req, res) => {
    const { email } = req.query;

    try {
        const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (result.rows.length > 0) {
            return res.json({ available: false });
        } else {
            return res.json({ available: true });
        }
    } catch (error) {
        console.error("Error checking email:", error.message);
        res.status(500).json({ error: "Failed to check email" });
    }
});


app.get("/api/check-username", async (req, res) => {
    const { username } = req.query;
    try {
        const result = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
        if (result.rows.length > 0) {
            res.json({ available: false });
        } else {
            res.json({ available: true });
        }
    } catch (error) {
        console.error("Error checking username:", error.message);
        res.status(500).json({ error: "Failed to check username" });
    }
});


// 🛠️ Registrierungsroute
app.post("/api/register", async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const userCheck = await pool.query("SELECT * FROM users WHERE username = $1 OR email = $2", [username, email]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ error: "Username or email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // 🟢 1. Wallet erstellen
        const wallet = createWallet(); // 🔥 Ruft createWallet auf
        if (!wallet || !wallet.privateKey) {
            throw new Error('Wallet creation failed');
        }

        const { address: walletAddress, privateKey } = wallet;

        // 🟢 2. Privaten Schlüssel verschlüsseln
        const encryptedPrivateKey = encryptPrivateKey(privateKey); // 🔥 Verschlüssele den privaten Schlüssel
        if (!encryptedPrivateKey) {
            throw new Error('Failed to encrypt private key');
        }

        // 🟢 3. Speichere den Benutzer in der Datenbank
        const result = await pool.query(
            `INSERT INTO users (username, email, password, wallet_address, encrypted_private_key)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, username, balance, wallet_address`,
            [username, email, hashedPassword, walletAddress, encryptedPrivateKey]
        );

        res.status(201).json({
            message: "Registration successful",
            user: {
                id: result.rows[0].id,
                username: result.rows[0].username,
                balance: result.rows[0].balance,
                walletAddress: result.rows[0].wallet_address
            }
        });

    } catch (error) {
        console.error("Error during registration:", error.message);
        res.status(500).json({ error: "User registration failed", details: error.message });
    }
});


// Login
app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
        if (user.rows.length === 0) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.rows[0].password);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const userId = user.rows[0].id;

        // 🔥 Synchronize balance on login
        const newBalance = await syncUserBalance(userId);

        const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.json({
            token,
            user: {
                id: userId,
                username: user.rows[0].username,
                balance: newBalance
            }
        });
    } catch (error) {
        console.error("Error during login:", error.message);
        res.status(500).json({ error: "Login failed", details: error.message });
    }
});


// Game Play and Pot Logic
app.post("/api/play", authenticateToken, async (req, res) => {
    let { betAmount, betType, selectedField } = req.body;
    const userId = req.user.id;

    // Ensure betAmount is numeric
    betAmount = typeof betAmount === 'string' ? parseFloat(betAmount.replace('$', '')) : betAmount;

    const gameResult = gameAlgorithm.processBet(betAmount, betType, selectedField);

    if (!gameResult.success) {
        return res.status(400).json({ error: gameResult.message });
    }

    try {
        const potResult = await pool.query("SELECT amount FROM pot LIMIT 1");
        let potAmount = parseFloat(potResult.rows[0].amount);

        if (gameResult.result === "win") {
            if (potAmount >= gameResult.winnings) {
                await pool.query("UPDATE users SET balance = balance + $1 WHERE id = $2", [gameResult.winnings, userId]);
                await pool.query("UPDATE pot SET amount = amount - $1", [gameResult.winnings]);
                potAmount -= gameResult.winnings;
            } else {
                return res.status(400).json({ error: "Insufficient pot funds for payout" });
            }
        } else {
            await pool.query("UPDATE users SET balance = balance - $1 WHERE id = $2", [betAmount, userId]);
            await pool.query("UPDATE pot SET amount = amount + $1", [betAmount]);
            potAmount += betAmount;
        }

        await pool.query(
            "INSERT INTO game_transactions (user_id, bet_amount, multiplier, selected_field, winning_field, winnings, result) VALUES ($1, $2, $3, $4, $5, $6, $7)",
            [userId, betAmount, gameResult.multiplier, selectedField, gameResult.winningField, gameResult.winnings, gameResult.result]
        );

        res.json({
            result: gameResult.result,
            winningField: gameResult.winningField,
            winnings: gameResult.winnings,
            currentPot: potAmount
        });
    } catch (error) {
        console.error("Error during gameplay:", error);
        res.status(500).json({ error: "Game data saving failed" });
    }
});

// Deposit
app.post("/api/deposit", authenticateToken, async (req, res) => {
    const { amount } = req.body;
    const userId = req.user.id;

    try {
        await pool.query("UPDATE users SET balance = balance + $1 WHERE id = $2", [amount, userId]);
        await pool.query(
            "INSERT INTO transactions (user_id, transaction_type, amount) VALUES ($1, 'deposit', $2)",
            [userId, amount]
        );
        res.json({ message: "Deposit successful", newBalance: amount });
    } catch (error) {
        console.error("Error during deposit:", error);
        res.status(500).json({ error: "Deposit failed" });
    }
});

// Withdraw
app.post("/api/withdraw", authenticateToken, async (req, res) => {
    const { amount } = req.body;
    const userId = req.user.id;

    try {
        const userResult = await pool.query("SELECT balance FROM users WHERE id = $1", [userId]);
        const userBalance = userResult.rows[0].balance;

        if (userBalance < amount) {
            return res.status(400).json({ error: "Insufficient balance" });
        }

        await pool.query("UPDATE users SET balance = balance - $1 WHERE id = $2", [amount, userId]);
        await pool.query(
            "INSERT INTO transactions (user_id, transaction_type, amount) VALUES ($1, 'withdrawal', $2)",
            [userId, amount]
        );

        res.json({ message: "Withdrawal successful", newBalance: userBalance - amount });
    } catch (error) {
        console.error("Error during withdrawal:", error);
        res.status(500).json({ error: "Withdrawal failed" });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
