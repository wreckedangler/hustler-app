const { ethers } = require('ethers');

// Provider to interact with the Ethereum blockchain (use Infura, Alchemy, or own node)
const provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);

// Function to get wallet balance (for native ETH)
const getWalletBalance = async (walletAddress) => {
    try {
        const balance = await provider.getBalance(walletAddress);
        const formattedBalance = ethers.formatEther(balance); // Convert from Wei to ETH
        console.log(`Balance of ${walletAddress}: ${formattedBalance} ETH`);
        return parseFloat(formattedBalance);
    } catch (error) {
        console.error(`Error fetching balance for ${walletAddress}:`, error);
        throw new Error('Failed to fetch wallet balance');
    }
};

// Function to get token (USDT) balance for a wallet
const getTokenBalance = async (walletAddress, tokenAddress) => {
    try {
        const abi = [
            "function balanceOf(address owner) view returns (uint256)"
        ];
        const contract = new ethers.Contract(tokenAddress, abi, provider);
        const balance = await contract.balanceOf(walletAddress);
        const formattedBalance = ethers.formatUnits(balance, 6); // USDT uses 6 decimals
        console.log(`USDT Balance of ${walletAddress}: ${formattedBalance} USDT`);
        return parseFloat(formattedBalance);
    } catch (error) {
        console.error(`Error fetching token balance for ${walletAddress}:`, error);
        throw new Error('Failed to fetch token balance');
    }
};

module.exports = {
    getWalletBalance,
    getTokenBalance
};
