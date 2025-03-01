'use strict';

require('dotenv').config();
const express = require("express");
const helmet = require('helmet');
const hpp = require('hpp');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("./db");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const gameAlgorithm = require("./gameAlgorithm");
const { createPotWallet, setActivePotWallet, getActivePotWallet, listAllPotWallets } = require('./potWallet');
const { createWallet, encryptPrivateKey, getTokenBalance, decryptPrivateKey } = require('./wallet');
const Web3 = require("web3").default;
const { abi } = require("../smart-contract/contracts/BatchTransferABI.json");
const app = express();
const PORT = process.env.PORT || 5000;

// ─────────────────────────────────────────────────────────────
// Sicherheits-Middleware
// ─────────────────────────────────────────────────────────────
app.use(helmet());
app.use(hpp());
app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    optionsSuccessStatus: 200
}));
app.use(express.json());

const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 Minuten
    max: 100,
    message: "Too many requests from this IP, please try again later."
});
app.use(globalLimiter);

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: "Too many login attempts, please try again later."
});

// ─────────────────────────────────────────────────────────────
// Web3-Initialisierung und Konfiguration
// ─────────────────────────────────────────────────────────────

const web3 = new Web3(process.env.WEB3_PROVIDER_URL);
const contractAddress = process.env.DEPLOYED_CONTRACT_ADDRESS;
const privateKey = process.env.PRIVATE_KEY;
// const contract = new web3.eth.Contract(abi, contractAddress);
const ownerAddress = process.env.OWNER_WALLET_ADDRESS;

// ─────────────────────────────────────────────────────────────
// Middleware zur Authentifizierung (JWT)
// ─────────────────────────────────────────────────────────────

const authenticateToken = (req, res, next) => {
    const authHeader = req.header("Authorization");
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Access denied" });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: "Invalid token" });
        req.user = user;
        next();
    });
};

// ─────────────────────────────────────────────────────────────
// Socket.IO Integration
// ─────────────────────────────────────────────────────────────

const http = require("http");
const { Socket } = require('dgram');
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);
    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
    });
});

// Funktion zum Broadcasten eines neuen Gewinns
function broadcastNewWin(winData) {
    io.emit("newWin", winData);
}

// Helferfunktion zur Fehlerbehandlung (im Produktionsmodus keine internen Details preisgeben)
const handleError = (res, error, message = "An error occurred") => {
    console.error(error);
    const isProduction = process.env.NODE_ENV === 'production';
    return res.status(500).json({ error: isProduction ? message : error.message });
};

// ─────────────────────────────────────────────────────────────
// API-Endpunkte
// ─────────────────────────────────────────────────────────────

app.post("/api/batch-collect", authenticateToken, async (req, res) => {
    const { wallets } = req.body;

    try {
        if (!wallets || !Array.isArray(wallets) || wallets.length === 0) {
            return res.status(400).json({ error: "Invalid wallets array." });
        }

        // Hier muss batchCollect sicher definiert sein!
        const receipt = await batchCollect(wallets);
        return res.status(200).json({
            message: "Batch collect successful.",
            transactionHash: receipt.transactionHash,
        });
    } catch (error) {
        console.error("Batch collect error:", error);
        return handleError(res, error, "Batch collect failed.");
    }
});

app.post("/api/withdraw", authenticateToken, async (req, res) => {
    const { recipient, amount } = req.body;
    const userId = req.user.id;

    try {
        if (!web3.utils.isAddress(recipient)) {
            return res.status(400).json({ error: "Invalid recipient address." });
        }
        if (isNaN(amount) || parseFloat(amount) <= 0) {
            return res.status(400).json({ error: "Invalid amount." });
        }

        // Hole den aktuellen Saldo des Benutzers
        const userResult = await pool.query("SELECT balance FROM users WHERE id = $1", [userId]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: "User not found." });
        }
        const userBalance = parseFloat(userResult.rows[0].balance);
        if (userBalance < amount) {
            return res.status(400).json({ error: "Insufficient balance." });
        }

        const tokenAmount = web3.utils.toWei(amount.toString(), "ether");

        // Führe die Blockchain-Transaktion aus (sicher implementierte Funktion vorausgesetzt)
        const receipt = await withdrawTokens(recipient, tokenAmount);

        // Datenbank-Transaktion: Hole einen Client aus dem Pool
        const client = await pool.connect();
        try {
            await client.query("BEGIN");
            await client.query("UPDATE users SET balance = balance - $1 WHERE id = $2", [amount, userId]);
            await client.query(
                `INSERT INTO transactions (user_id, wallet_address, amount, type, tx_hash, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
                [userId, recipient, amount, "withdrawal", receipt.transactionHash]
            );
            await client.query("COMMIT");
        } catch (dbError) {
            await client.query("ROLLBACK");
            throw dbError;
        } finally {
            client.release();
        }

        return res.status(200).json({
            message: "Withdrawal successful.",
            transactionHash: receipt.transactionHash,
            newBalance: userBalance - amount,
        });
    } catch (error) {
        console.error("Withdrawal error:", error);
        return handleError(res, error, "Withdrawal failed.");
    }
});

app.post("/api/save-default-withdraw-address", authenticateToken, async (req, res) => {
    const { withdrawAddress } = req.body;
    const userId = req.user.id;

    if (!withdrawAddress || !/^0x[a-fA-F0-9]{40}$/.test(withdrawAddress.trim())) {
        return res.status(400).json({ error: "Invalid wallet address format." });
    }

    try {
        await pool.query("UPDATE users SET default_withdraw_address = $1 WHERE id = $2", [withdrawAddress, userId]);
        return res.status(200).json({ message: "Default withdraw address saved successfully." });
    } catch (error) {
        console.error("Error saving default withdraw address:", error);
        return handleError(res, error, "Failed to save default withdraw address.");
    }
});

app.get("/api/get-default-withdraw-address", authenticateToken, async (req, res) => {
    const userId = req.user.id;
    try {
        const result = await pool.query("SELECT default_withdraw_address FROM users WHERE id = $1", [userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "User not found." });
        }
        return res.status(200).json({ defaultAddress: result.rows[0].default_withdraw_address });
    } catch (error) {
        console.error("Error fetching default withdraw address:", error);
        return handleError(res, error, "Failed to fetch default withdraw address.");
    }
});

app.get("/api/get-wallet-address", authenticateToken, async (req, res) => {
    const userId = req.user.id;
    try {
        const result = await pool.query("SELECT wallet_address FROM users WHERE id = $1", [userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        return res.status(200).json({ walletAddress: result.rows[0].wallet_address });
    } catch (error) {
        console.error("Error fetching wallet address:", error);
        return handleError(res, error, "Failed to fetch wallet address");
    }
});

app.get("/api/get-balance", authenticateToken, async (req, res) => {
    const userId = req.user.id;
    try {
        const result = await pool.query("SELECT balance FROM users WHERE id = $1", [userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "User not found." });
        }
        return res.status(200).json({ balance: result.rows[0].balance });
    } catch (error) {
        console.error("Error fetching user balance:", error);
        return handleError(res, error, "Failed to fetch balance");
    }
});

app.get("/api/list-pot-wallets", async (req, res) => {
    try {
        const wallets = await listAllPotWallets();
        return res.status(200).json({ message: "Pot wallets listed", wallets });
    } catch (error) {
        console.error("Error listing pot wallets:", error);
        return handleError(res, error, "Failed to list pot wallets");
    }
});

app.get("/api/get-active-pot-wallet", async (req, res) => {
    try {
        const wallet = await getActivePotWallet();
        return res.status(200).json({ message: "Active pot wallet", wallet });
    } catch (error) {
        console.error("Error getting active pot wallet:", error);
        return handleError(res, error, "Failed to get active pot wallet");
    }
});

app.post("/api/set-active-pot-wallet", async (req, res) => {
    const { walletAddress } = req.body;
    try {
        const wallet = await setActivePotWallet(walletAddress);
        return res.status(200).json({ message: "Active pot wallet set", wallet });
    } catch (error) {
        console.error("Error setting active pot wallet:", error);
        return handleError(res, error, "Failed to set active pot wallet");
    }
});

app.post("/api/create-pot-wallet", async (req, res) => {
    try {
        const wallet = await createPotWallet();
        return res.status(201).json({ message: "Pot wallet created", wallet });
    } catch (error) {
        console.error("Error creating pot wallet:", error);
        return handleError(res, error, "Failed to create pot wallet");
    }
});

app.get("/api/check-email", async (req, res) => {
    const { email } = req.query;
    try {
        const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        return res.json({ available: result.rows.length === 0 });
    } catch (error) {
        console.error("Error checking email:", error);
        return handleError(res, error, "Failed to check email");
    }
});

app.get("/api/check-username", async (req, res) => {
    const { username } = req.query;
    try {
        const result = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
        return res.json({ available: result.rows.length === 0 });
    } catch (error) {
        console.error("Error checking username:", error);
        return handleError(res, error, "Failed to check username");
    }
});


app.post("/api/register", async (req, res) => {
    const { username, email, password, referralCode } = req.body;
    try {
        // Basisvalidierung
        if (!username || !email || !password) {
            return res.status(400).json({ error: "Missing required fields." });
        }

        // Prüfe, ob Benutzername oder E-Mail bereits existiert
        const userCheck = await pool.query("SELECT * FROM users WHERE username = $1 OR email = $2", [username, email]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ error: "Username or email already exists" });
        }

        // Verwende erhöhte Salt-Rounds für bcrypt
        const hashedPassword = await bcrypt.hash(password, 12);

        // 1. Wallet erstellen
        const wallet = createWallet();
        if (!wallet || !wallet.privateKey) {
            throw new Error("Wallet creation failed");
        }
        const { address: walletAddress, privateKey: rawPrivateKey } = wallet;

        // 2. Privaten Schlüssel verschlüsseln
        const encryptedPrivateKey = encryptPrivateKey(rawPrivateKey);
        if (!encryptedPrivateKey) {
            throw new Error("Failed to encrypt private key");
        }

        // 3. Referral-Code generieren
        const generateReferralCode = () => {
            console.log("Inside refcode gen")
            return Math.random().toString(36).substr(2, 8).toUpperCase();
        };
        const generatedCode = generateReferralCode();

        console.log("After refcode gen. Code is:" + generatedCode)

        let referrerId = null;
        if (referralCode) {
            const referrer = await pool.query("SELECT id FROM users WHERE referral_code = $1", [referralCode]);
            if (referrer.rows.length > 0) {
                referrerId = referrer.rows[0].id;
            }
        }

        // 4. Benutzer in der Datenbank speichern
        const result = await pool.query(
            `INSERT INTO users (username, email, password, wallet_address, encrypted_private_key, referral_code, referred_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, username, balance, wallet_address, referral_code`,
            [username, email, hashedPassword, walletAddress, encryptedPrivateKey, generatedCode, referrerId]
        );

        const newUserId = result.rows[0].id;

        // Falls es einen Werber gibt, Referral-Eintrag in DB setzen
        if (referrerId) {
            await pool.query(
                `INSERT INTO referrals (referrer_id, referred_id) VALUES ($1, $2)`,
                [referrerId, newUserId]
            );
        }

        return res.status(201).json({
            message: "Registration successful",
            user: {
                id: result.rows[0].id,
                username: result.rows[0].username,
                balance: result.rows[0].balance,
                walletAddress: result.rows[0].wallet_address,
                referralCode: result.rows[0].referral_code, // Referral-Code zurückgeben
            },
        });

    } catch (error) {
        console.error("Registration error:", error);
        return handleError(res, error, "User registration failed");
    }
});


app.post('/api/logout', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    try {
        await pool.query('UPDATE users SET is_logged_in = FALSE WHERE id = $1', [userId]);
        return res.json({ message: 'User logged out successfully' });
    } catch (error) {
        console.error("Logout error:", error);
        return handleError(res, error, "Logout failed");
    }
});

app.get('/api/check-login', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    try {
        const userResult = await pool.query('SELECT username, balance, is_logged_in FROM users WHERE id = $1', [userId]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ isLoggedIn: false, message: 'User not found' });
        }
        const user = userResult.rows[0];
        return res.json({
            isLoggedIn: user.is_logged_in,
            username: user.username,
            balance: user.balance,
        });
    } catch (error) {
        console.error("Check login error:", error);
        return handleError(res, error, "Failed to check login status");
    }
});

app.post("/api/login", loginLimiter, async (req, res) => {
    const { username, password } = req.body;
    try {
        const userQuery = "SELECT id, username, password, balance FROM users WHERE username = $1";
        const userResult = await pool.query(userQuery, [username]);

        if (userResult.rows.length === 0) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const user = userResult.rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const userId = user.id;
        await pool.query('UPDATE users SET last_login = NOW(), is_logged_in = TRUE WHERE id = $1', [userId]);

        const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "1h" });

        return res.json({
            token,
            user: {
                id: userId,
                username: user.username,
                balance: parseFloat(user.balance),
            }
        });
    } catch (error) {
        console.error("Login error:", error);
        return handleError(res, error, "Login failed");
    }
});

app.post("/api/play", authenticateToken, async (req, res) => {
    let { betAmount, betType, selectedField } = req.body;
    const userId = req.user.id;
  
    // Sicherstellen, dass betAmount eine Zahl ist
    betAmount = typeof betAmount === 'string' ? parseFloat(betAmount.replace('$', '')) : betAmount;
  
    try {
      // Aktuelle Benutzerdaten inklusive username abrufen
      const userResult = await pool.query(
        "SELECT username, balance, ep, level, prestige FROM users WHERE id = $1",
        [userId]
      );
      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }
  
      let { username, balance: currentBalance, ep, level, prestige } = userResult.rows[0];
  
      // Sicherstellen, dass alle Werte numerisch sind
      currentBalance = parseFloat(currentBalance);
      ep = parseInt(ep) || 0;
      level = parseInt(level) || 1;
      prestige = parseInt(prestige) || 0;
  
      if (currentBalance < betAmount) {
        return res.status(400).json({ error: "Insufficient balance" });
      }
  
      const gameResult = gameAlgorithm.processBet(betAmount, betType, selectedField);
      if (!gameResult.success) {
        return res.status(400).json({ error: gameResult.message });
      }
  
      let newBalance = currentBalance;
      if (gameResult.result === "win") {
        newBalance += gameResult.winnings;
        // broadcastNewWin verwendet nun den abgefragten username
        broadcastNewWin({ username, amount: gameResult.winnings });
      } else {
        newBalance -= betAmount;
      }
  
      // EP-Update: 1 EP pro gesetztem Dollar
      ep += Math.floor(betAmount);
      while (ep >= 100) {
        ep -= 100;
        level += 1;
        // Prestige-Upgrade: Bei Überschreiten von Level 50
        if (level > 50) {
          level = 1;
          if (prestige < 10) {
            prestige += 1;
          }
        }
      }
  
      // Benutzer-Datenbank aktualisieren
      await pool.query(
        "UPDATE users SET balance = $1, ep = $2, level = $3, prestige = $4 WHERE id = $5",
        [newBalance, ep, level, prestige, userId]
      );
  
      // Spieltransaktion speichern
      await pool.query(
        `INSERT INTO game_transactions 
        (user_id, bet_amount, multiplier, selected_field, winning_field, winnings, result) 
        VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [userId, betAmount, gameResult.multiplier, selectedField, gameResult.winningField, gameResult.winnings, gameResult.result]
      );
  
      // Referral-Wager Tracking (falls implementiert)
      await updateReferralProgress(userId, betAmount);
  
      return res.json({
        result: gameResult.result,
        winningField: gameResult.winningField,
        winnings: gameResult.winnings,
        newBalance,
        ep,
        level,
        prestige
      });
    } catch (error) {
      console.error("Gameplay error:", error);
      return handleError(res, error, "Game data saving failed");
    }
  });  



const updateReferralProgress = async (userId, betAmount) => {
    const referral = await pool.query(
        "SELECT referrer_id, total_wagered, first_bonus_granted, second_bonus_granted FROM referrals WHERE referred_id = $1",
        [userId]
    );

    if (referral.rows.length === 0) return;

    let { referrer_id, total_wagered, first_bonus_granted, second_bonus_granted } = referral.rows[0];
    total_wagered += betAmount;

    let reward = 0;
    if (total_wagered >= 20 && !first_bonus_granted) {
        reward += 5;
        first_bonus_granted = true;
    }
    if (total_wagered >= 50 && !second_bonus_granted) {
        reward += 10;
        second_bonus_granted = true;
    }

    await pool.query(
        `UPDATE referrals SET total_wagered = $1, first_bonus_granted = $2, second_bonus_granted = $3 WHERE referred_id = $4`,
        [total_wagered, first_bonus_granted, second_bonus_granted, userId]
    );

    if (reward > 0) {
        await pool.query(
            "UPDATE users SET balance = balance + $1 WHERE id = $2",
            [reward, referrer_id]
        );
        console.log(`💰 ${reward}$ an Referrer ${referrer_id} ausgezahlt`);
    }
};

app.post("/api/update-referral", authenticateToken, async (req, res) => {
    const { betAmount } = req.body;
    const userId = req.user.id;

    try {
        await updateReferralProgress(userId, betAmount);
        res.status(200).json({ message: "Referral progress updated" });
    } catch (error) {
        console.error("Referral update error:", error);
        res.status(500).json({ error: "Failed to update referral progress" });
    }
});


// 🟢 GET: Referral-Daten für das Dashboard abrufen
app.get("/api/get-referral-stats", authenticateToken, async (req, res) => {
    const userId = req.user.id; // ID des eingeloggten Nutzers

    try {
        // 🟢 Gesamtanzahl geworbener Nutzer abrufen
        const totalReferralsResult = await pool.query(
            "SELECT COUNT(*) AS total FROM referrals WHERE referrer_id = $1",
            [userId]
        );
        const totalReferrals = parseInt(totalReferralsResult.rows[0].total, 10) || 0;

        // 🟢 Anzahl der Nutzer, die $20 oder mehr gespielt haben
        const referralsAt20Result = await pool.query(
            "SELECT COUNT(*) AS count FROM referrals WHERE referrer_id = $1 AND total_wagered >= 20",
            [userId]
        );
        const referralsAt20 = parseInt(referralsAt20Result.rows[0].count, 10) || 0;

        // 🟢 Anzahl der Nutzer, die $50 oder mehr gespielt haben
        const referralsAt50Result = await pool.query(
            "SELECT COUNT(*) AS count FROM referrals WHERE referrer_id = $1 AND total_wagered >= 50",
            [userId]
        );
        const referralsAt50 = parseInt(referralsAt50Result.rows[0].count, 10) || 0;

        // 🟢 Gesamtverdiente Referral-Belohnungen abrufen
        const totalRewardsResult = await pool.query(
            "SELECT SUM(reward_amount) AS total FROM referral_rewards WHERE referrer_id = $1",
            [userId]
        );
        const totalRewards = parseFloat(totalRewardsResult.rows[0].total) || 0;

        // 🟢 Referral-Code des Nutzers abrufen
        const referralCodeResult = await pool.query(
            "SELECT referral_code FROM users WHERE id = $1",
            [userId]
        );
        const referralCode = referralCodeResult.rows[0]?.referral_code || "N/A";

        // 🟢 Gamification-Punkte berechnen (z.B. 10 Punkte pro geworbenem User)
        const gamificationPoints = totalReferrals * 10 + referralsAt20 * 20 + referralsAt50 * 50;

        // 🟢 Erfolgreiche Antwort senden
        res.json({
            totalReferrals,
            referralsAt20,
            referralsAt50,
            totalRewards,
            gamificationPoints,
            referralCode
        });

    } catch (error) {
        console.error("Error fetching referral stats:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});

app.get("/api/get-level", authenticateToken, async (req, res) => {
    const userId = req.user.id;

    try {
        const result = await pool.query(
            "SELECT level, prestige, ep FROM users WHERE id = $1",
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        return res.json(result.rows[0]);
    } catch (error) {
        return res.status(500).json({ error: "Failed to fetch level data" });
    }
});


// API zum Level-Up
app.post("/api/level-up", authenticateToken, async (req, res) => {
    const userId = req.user.id;

    try {
        const userResult = await pool.query("SELECT level, prestige FROM users WHERE id = $1", [userId]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        let { level, prestige } = userResult.rows[0];

        if (level < 50) {
            level += 1;
        } else {
            level = 1;
            if (prestige < 10) {
                prestige += 1;
            }
        }

        await pool.query("UPDATE users SET level = $1, prestige = $2 WHERE id = $3", [level, prestige, userId]);

        return res.json({ level, prestige });
    } catch (error) {
        console.error("Error leveling up user:", error);
        return res.status(500).json({ error: "Failed to level up" });
    }
});



// Optionale globale Fehlerbehandlung (fängt unvorhergesehene Fehler ab)
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ error: "An unexpected error occurred." });
});

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
