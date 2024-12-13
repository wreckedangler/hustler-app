const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("./db");
const cors = require("cors");
const gameAlgorithm = require("./gameAlgorithm");
require("dotenv").config();
const { createWallet, encryptPrivateKey } = require('./wallet'); // Import des Wallet-Moduls

const app = express();
const PORT = 5000;
app.use(express.json());
app.use(cors({ origin: "http://localhost:3000" }));

// Registration
app.post("/api/register", async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const userCheck = await pool.query("SELECT * FROM users WHERE username = $1 OR email = $2", [username, email]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ error: "Username or email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const { address: walletAddress, privateKey } = createWallet();
        if (!walletAddress || !privateKey) {
            throw new Error('Wallet creation failed');
        }

        const encryptedPrivateKey = encryptPrivateKey(privateKey);
        if (!encryptedPrivateKey) {
            throw new Error('Failed to encrypt private key');
        }

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

        const token = jwt.sign({ id: user.rows[0].id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.json({ token, user: { username: user.rows[0].username, balance: user.rows[0].balance } });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ error: "Login failed" });
    }
});

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
