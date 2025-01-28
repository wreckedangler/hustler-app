require("dotenv").config();
const hre = require("hardhat");
const fs = require("fs");

async function main() {
    console.log("Deploying BatchTransfer contract...");

    const tokenAddress = process.env.USDT_CONTRACT_ADDRESS;
    const initialOwner = process.env.OWNER_ADDRESS;

    if (!tokenAddress || !initialOwner) {
        throw new Error("Missing token or owner address in .env");
    }

    // Contract-Factory laden
    const BatchTransfer = await hre.ethers.getContractFactory("BatchTransfer");

    // Contract deployen
    const batchTransfer = await BatchTransfer.deploy(tokenAddress, initialOwner);

    // Auf die vollständige Bereitstellung warten
    await batchTransfer.waitForDeployment();

    // Die Contract-Adresse abrufen
    const deployedAddress = await batchTransfer.getAddress();
    console.log("BatchTransfer deployed to:", deployedAddress);

    // Adresse in der .env speichern
    fs.writeFileSync(".env", `\nBATCH_TRANSFER_ADDRESS=${deployedAddress}`, { flag: "a" });
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
