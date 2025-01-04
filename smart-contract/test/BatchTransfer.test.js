const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BatchTransfer", function () {
    it("should deploy and transfer tokens in batch", async function () {
        const [owner, addr1, addr2] = await ethers.getSigners();

        // Mock Token
        const Token = await ethers.getContractFactory("ERC20Mock");
        const token = await Token.deploy("MockToken", "MTK", owner.address, 1000);
        await token.deployed();

        // Deploy BatchTransfer
        const BatchTransfer = await ethers.getContractFactory("BatchTransfer");
        const batchTransfer = await BatchTransfer.deploy(token.address);
        await batchTransfer.deployed();

        // Approve and transfer tokens
        await token.transfer(batchTransfer.address, 500);
        await batchTransfer.batchTransfer([addr1.address, addr2.address], [200, 300]);

        expect(await token.balanceOf(addr1.address)).to.equal(200);
        expect(await token.balanceOf(addr2.address)).to.equal(300);
    });
});
