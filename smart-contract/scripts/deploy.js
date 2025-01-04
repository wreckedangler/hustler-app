require("dotenv").config(); // Load environment variables
const hre = require("hardhat");

async function main() {
    console.log("Deploying contract...");

    // Read token and initial owner addresses from .env
    const tokenAddress = process.env.USDT_CONTRACT_ADDRESS;
    const initialOwner = process.env.OWNER_ADDRESS;

    if (!tokenAddress || !initialOwner) {
        throw new Error("Missing token or owner address in .env");
    }

    // Get the ContractFactory
    const BatchTransfer = await hre.ethers.getContractFactory("BatchTransfer");

    // Deploy the contract
    const batchTransfer = await BatchTransfer.deploy(tokenAddress, initialOwner);




    console.log("BatchTransfer deployed.");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
