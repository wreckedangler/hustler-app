const hre = require("hardhat");

async function main() {
    // Deploy the MockUSDT contract
    const MockUSDT = await hre.ethers.getContractFactory("MockUSDT");
    const usdt = await MockUSDT.deploy();

    // Wait for the deployment to complete
    await usdt.waitForDeployment();

    const usdtAddress = await usdt.getAddress();
    console.log("MockUSDT deployed to:", usdtAddress);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
