// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Store is Ownable {
    uint256 private value;

    event changedValue(uint256 newValue);

    function storeValue(uint256 newValue) public onlyOwner {
        value = newValue;
        emit changedValue(newValue);
    }

    function getValue() public view returns (uint256) {
        return value;
    }
}
