// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract BatchTransfer is Ownable {
    IERC20 public token;

    event FundsCollected(address indexed wallet, uint256 amount);
    event Withdrawal(address indexed recipient, uint256 amount);

    constructor(address _tokenAddress, address _initialOwner) Ownable(_initialOwner) {
        token = IERC20(_tokenAddress);
    }

    /**
     * @notice Batch-Einsammeln von Token-Guthaben von mehreren Wallets
     * @param wallets Die Liste der Wallet-Adressen, deren Guthaben eingesammelt werden soll
     */
    function batchCollect(address[] memory wallets) external onlyOwner {
        uint256 totalCollected = 0;

        for (uint256 i = 0; i < wallets.length; i++) {
            uint256 balance = token.balanceOf(wallets[i]);
            if (balance > 0) {
                require(token.transferFrom(wallets[i], address(this), balance), "Transfer failed");
                totalCollected += balance;

                emit FundsCollected(wallets[i], balance); // Logge die Sammlung von Geldern
            }
        }

        require(totalCollected > 0, "No funds collected from wallets");
    }

    /**
     * @notice Auszahlung von Tokens von der Main-Wallet
     * @param recipient Die Zieladresse für die Auszahlung
     * @param amount Der auszuzahlende Betrag
     */
    function withdrawTokens(address recipient, uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be greater than zero");
        require(token.transfer(recipient, amount), "Withdraw failed");

        emit Withdrawal(recipient, amount); // Logge die Auszahlung
    }

    /**
     * @notice Prüft das Guthaben einer Wallet
     * @param wallet Die Adresse der Wallet
     * @return Das Guthaben der Wallet
     */
    function checkBalance(address wallet) external view returns (uint256) {
        return token.balanceOf(wallet);
    }
}
