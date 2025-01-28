// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockUSDT is ERC20 {
    constructor() ERC20("MockUSDT", "USDT") {
        _mint(msg.sender, 1000000 * 10 ** decimals()); // Mint 1,000,000 USDT to the deployer
    }
}


