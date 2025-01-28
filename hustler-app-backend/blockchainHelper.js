const Web3 = require("web3");
const { abi } = require("/smart-contract/contracts/BatchTransferABI.json");
require("dotenv").config();

const web3 = new Web3(process.env.WEB3_PROVIDER_URL);
const contractAddress = process.env.DEPLOYED_CONTRACT_ADDRESS;
const privateKey = process.env.SECRET_KEY;
const ownerAddress = process.env.OWNER_WALLET_ADDRESS;

const contract = new web3.eth.Contract(abi, contractAddress);

/**
 * Signiert und sendet eine Blockchain-Transaktion
 * @param {string} to - Zieladresse (Smart Contract)
 * @param {string} data - Kodierte Daten (Smart Contract Methoden-Aufruf)
 * @param {number} gasLimit - Gaslimit für die Transaktion
 * @returns {Promise<Object>} - Transaktionsreceipt
 */
const sendSignedTransaction = async (to, data, gasLimit = 200000) => {
    try {
        const nonce = await web3.eth.getTransactionCount(ownerAddress, "latest");
        const tx = {
            from: ownerAddress,
            to,
            gas: gasLimit,
            nonce,
            data,
        };

        const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

        if (!receipt || !receipt.status) {
            throw new Error("Blockchain transaction failed.");
        }

        return receipt;
    } catch (error) {
        console.error("❌ Error sending signed transaction:", error.message);
        throw error;
    }
};

/**
 * Führt den BatchCollect-Aufruf auf dem Smart Contract aus
 * @param {string[]} wallets - Liste der Wallet-Adressen
 * @returns {Promise<Object>} - Transaktionsreceipt
 */
const batchCollect = async (wallets) => {
    try {
        const data = contract.methods.batchCollect(wallets).encodeABI();
        return await sendSignedTransaction(contractAddress, data, 500000);
    } catch (error) {
        console.error("❌ Error during batchCollect:", error.message);
        throw error;
    }
};

/**
 * Führt den Withdraw-Aufruf auf dem Smart Contract aus
 * @param {string} recipient - Zieladresse
 * @param {string} amount - Betrag in Wei
 * @returns {Promise<Object>} - Transaktionsreceipt
 */
const withdrawTokens = async (recipient, amount) => {
    try {
        const data = contract.methods.withdrawTokens(recipient, amount).encodeABI();
        return await sendSignedTransaction(contractAddress, data, 200000);
    } catch (error) {
        console.error("❌ Error during withdrawTokens:", error.message);
        throw error;
    }
};

module.exports = {
    batchCollect,
    withdrawTokens,
};
