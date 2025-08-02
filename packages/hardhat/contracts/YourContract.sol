// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MonadPaymentSplitter (Custom Implementation)
 * @dev Splits Ether payments among multiple payees based on their share.
 * Each payee can withdraw their share independently.
 */
contract MonadPaymentSplitter {
    address public owner;
    
    uint256 public totalShares;
    uint256 public totalReleased;

    mapping(address => uint256) public shares;
    mapping(address => uint256) public released;
    address[] public payees;

    event PaymentReceived(address indexed from, uint256 amount);
    event PaymentReleased(address indexed to, uint256 amount);

    /**
     * @notice Constructor sets payees and their share allocations.
     * @param _payees List of addresses to receive payments.
     * @param _shares List of shares (proportional) for each payee.
     */
    constructor(address[] memory _payees, uint256[] memory _shares) {
        require(_payees.length == _shares.length, "Length mismatch");
        require(_payees.length > 0, "No payees");

        owner = msg.sender;

        for (uint256 i = 0; i < _payees.length; i++) {
            address payee = _payees[i];
            uint256 share = _shares[i];

            require(payee != address(0), "Invalid payee");
            require(share > 0, "Share must be > 0");
            require(shares[payee] == 0, "Payee already exists");

            payees.push(payee);
            shares[payee] = share;
            totalShares += share;
        }
    }

    /**
     * @notice Fallback function to accept Ether.
     */
    receive() external payable {
        emit PaymentReceived(msg.sender, msg.value);
    }

    /**
     * @notice Allows a payee to withdraw their pending payments.
     */
    function release(address account) public {
        require(shares[account] > 0, "Account has no shares");

        uint256 totalReceived = address(this).balance + totalReleased;
        uint256 payment = (totalReceived * shares[account]) / totalShares - released[account];

        require(payment > 0, "No funds to release");

        released[account] += payment;
        totalReleased += payment;

        payable(account).transfer(payment);
        emit PaymentReleased(account, payment);
    }

    /**
     * @notice Returns number of payees.
     */
    function getPayeeCount() public view returns (uint256) {
        return payees.length;
    }

    /**
     * @notice Returns pending payment for a given account.
     */
    function pendingPayment(address account) public view returns (uint256) {
        if (shares[account] == 0) return 0;

        uint256 totalReceived = address(this).balance + totalReleased;
        return (totalReceived * shares[account]) / totalShares - released[account];
    }
}
