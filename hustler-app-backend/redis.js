const redis = require("redis");

// Redis-Client erstellen
const redisClient = redis.createClient({
    url: process.env.REDIS_URL,
});

// Event-Handler für Redis-Client
redisClient.on("error", (err) => console.error("❌ Redis error:", err));
redisClient.on("connect", () => console.log("✅ Connected to Redis"));

(async () => {
    try {
        await redisClient.connect(); // Verbindung herstellen
    } catch (err) {
        console.error("❌ Redis connection failed:", err);
    }
})();

module.exports = redisClient;
