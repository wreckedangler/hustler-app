// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract BatchTransfer is Ownable {
    IERC20 public token;

    constructor(address _tokenAddress, address _initialOwner) Ownable(_initialOwner) {
        token = IERC20(_tokenAddress);
    }

    function batchTransfer(address[] memory recipients, uint256[] memory amounts) external onlyOwner {
        require(recipients.length == amounts.length, "Mismatched arrays");
        for (uint256 i = 0; i < recipients.length; i++) {
            require(token.transfer(recipients[i], amounts[i]), "Transfer failed");
        }
    }

    function withdrawTokens(address recipient, uint256 amount) external onlyOwner {
        require(token.transfer(recipient, amount), "Withdraw failed");
    }
}
