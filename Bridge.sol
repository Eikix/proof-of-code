// Imported from Remix.
// Either include this code in a Hardhat, Foundry or Truffle app, or use it in Remix online IDE

// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract Bridge {
    address private owner;
    uint private chainId;

    constructor(address _owner, uint _chainId) {
        owner = _owner;
        chainId = _chainId;
    }

    event Lock(address from, uint amount);

    event Release(address from, address to, uint amount);

    modifier onlyOwner() {
        require(
            msg.sender == owner,
            "Function call is protected, caller is not the owner"
        );
        _;
    }

    function lock(address to) public payable {
        require(msg.value > 0, "Please send money");
        emit Lock(msg.sender, to, msg.value);
    }

    receive() external payable {}

    function release(
        address from,
        address to,
        uint amount
    ) external onlyOwner {
        to.transfer(amount);
        emit Release(from, to, amount);
    }
}
