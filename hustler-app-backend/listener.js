require("dotenv").config();
const { ethers } = require("ethers");
const { server } = require("server.js")

// Connect to the blockchain
const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
const contractAddress = DEPLOYED_CONTRACT_ADDRESS; // Deployed contract address
const abi = [ // ABI of the contract (only Deposit event is necessary here)
    "event Deposit(address indexed user, uint256 amount)"
];

// Create a contract instance
const contract = new ethers.Contract(contractAddress, abi, provider);

// Listen for Deposit events
contract.on("Deposit", (user, amount, event) => {
    console.log(`Deposit detected from ${user}: ${ethers.utils.formatUnits(amount, 18)} tokens`);

    // Update the database here
    updateUserBalanceInDB(user, amount);
});

// Mock function to update the database
function updateUserBalanceInDB(user, amount) {
    console.log(`Updating balance for ${user} with ${ethers.utils.formatUnits(amount, 18)} tokens`);
    // Add your DB update logic here
}
