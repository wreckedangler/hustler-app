const { expect } = require("chai");
const { ethers } = require("hardhat");
require("dotenv").config();

describe("BatchTransfer", function () {
    let batchTransfer, usdt;
    let owner, addr1, addr2;

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();

        // Deploy MockUSDT contract
        const MockUSDT = await ethers.getContractFactory("MockUSDT");
        usdt = await MockUSDT.deploy();
        await usdt.waitForDeployment();

        const usdtAddress = await usdt.getAddress();
        console.log("Deployed MockUSDT to:", usdtAddress);

        // Deploy BatchTransfer contract
        const BatchTransfer = await ethers.getContractFactory("BatchTransfer");
        batchTransfer = await BatchTransfer.deploy(usdtAddress, owner.address);
        await batchTransfer.waitForDeployment();

        const batchTransferAddress = await batchTransfer.getAddress();
        console.log("Deployed BatchTransfer to:", batchTransferAddress);
    });

    it("should allow owner to withdraw tokens", async function () {
        const amount = ethers.parseUnits("50", 6); // 50 USDT

        // Fund the BatchTransfer contract
        const batchTransferAddress = await batchTransfer.getAddress();
        await usdt.connect(owner).transfer(batchTransferAddress, amount);

        const contractBalance = await usdt.balanceOf(batchTransferAddress);
        console.log(`BatchTransfer contract balance before withdrawal: ${ethers.formatUnits(contractBalance, 6)} USDT`);

        // Withdraw tokens
        await batchTransfer.connect(owner).withdrawTokens(addr1.address, amount);

        const addr1Balance = await usdt.balanceOf(addr1.address);
        console.log(`Balance of addr1 after withdrawal: ${ethers.formatUnits(addr1Balance, 6)} USDT`);
        expect(addr1Balance).to.equal(amount);
    });

    it("should collect funds from multiple wallets", async function () {
        const wallets = [addr1, addr2];
        const amounts = [
            ethers.parseUnits("100", 6), // 100 USDT
            ethers.parseUnits("50", 6),  // 50 USDT
        ];

        console.log("Wallets to collect from:", wallets.map((w) => w.address));
        console.log("Amounts:", amounts.map((a) => ethers.formatUnits(a, 6)));

        // Fund wallets and approve BatchTransfer contract
        for (let i = 0; i < wallets.length; i++) {
            await usdt.connect(owner).transfer(wallets[i].address, amounts[i]);
            await usdt.connect(wallets[i]).approve(await batchTransfer.getAddress(), amounts[i]);

            const walletBalance = await usdt.balanceOf(wallets[i].address);
            console.log(`Wallet ${wallets[i].address} balance: ${ethers.formatUnits(walletBalance, 6)} USDT`);
        }

        // Perform batchCollect
        const walletAddresses = wallets.map((w) => w.address);
        await batchTransfer.connect(owner).batchCollect(walletAddresses);

        // Validate wallet balances after collection
        for (let i = 0; i < wallets.length; i++) {
            const walletBalance = await usdt.balanceOf(wallets[i].address);
            console.log(`Wallet ${wallets[i].address} balance after collection: ${ethers.formatUnits(walletBalance, 6)} USDT`);
            expect(walletBalance).to.equal(ethers.parseUnits("0", 6));
        }

        // Validate BatchTransfer contract balance
        const contractBalance = await usdt.balanceOf(await batchTransfer.getAddress());
        console.log(`BatchTransfer contract balance after collection: ${ethers.formatUnits(contractBalance, 6)} USDT`);
        expect(contractBalance).to.equal(
            amounts.reduce((a, b) => a + b, 0n) // Use bigint addition
        );
    });
});
