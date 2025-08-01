// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/finance/PaymentSplitter.sol";

/**
 * @title MonadPaymentSplitter
 * @dev A simple contract to split incoming payments among multiple payees using OpenZeppelin's PaymentSplitter.
 * Payees must call release() to withdraw their share.
 */
contract MonadPaymentSplitter is PaymentSplitter {
    address public owner;

    event PaymentReceived(address from, uint256 amount);

    /**
     * @notice Constructor sets up payees and their share percentages.
     * @param payees List of addresses to receive payments.
     * @param shares List of shares (relative) for each payee.
     */
    constructor(address[] memory payees, uint256[] memory shares)
        PaymentSplitter(payees, shares)
    {
        require(payees.length == shares.length, "Payees and shares length mismatch");
        require(payees.length > 0, "Must have at least one payee");
        owner = msg.sender;
    }

    /**
     * @notice Fallback function to accept Ether.
     */
    receive() external payable override {
        emit PaymentReceived(msg.sender, msg.value);
    }
}
