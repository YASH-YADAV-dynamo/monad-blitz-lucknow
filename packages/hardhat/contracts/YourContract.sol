// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PaymentContract {
    address public owner;

    mapping(bytes32 => address[]) public groups;
    mapping(bytes32 => mapping(address => bool)) public groupMembers;
    mapping(bytes32 => uint) public groupBalances;

    event PaymentProcessed(address indexed from, address indexed to, uint amount);
    event GroupCreated(bytes32 groupHash, address creator, string groupName);
    event MemberAdded(bytes32 groupHash, address indexed member, address indexed addedBy);
    event FundsAdded(bytes32 groupHash, address indexed user, uint amount);
    event GroupFundsTransferred(bytes32 groupHash, address indexed to, uint amount);
    event SplitRequestCreated(bytes32 groupHash, address indexed from, address indexed to, uint amount, string message);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    function processPayment(address _to, uint _amount) public payable {
        require(_amount > 0, "Amount must be greater than 0");
        require(msg.value == _amount, "Sent value must match amount");

        (bool sent, ) = _to.call{value: _amount}("");
        require(sent, "Failed to send Ether");

        emit PaymentProcessed(msg.sender, _to, _amount);
    }

    function createGroup(string memory _groupName) public returns (bytes32) {
        // Use a deterministic hash that doesn't depend on block.timestamp
        bytes32 groupHash = keccak256(abi.encodePacked(_groupName, msg.sender));
        groupMembers[groupHash][msg.sender] = true;
        groups[groupHash].push(msg.sender);
        emit GroupCreated(groupHash, msg.sender, _groupName);
        return groupHash;
    }

    function addToGroup(bytes32 _groupHash, address _member) public {
        require(groupMembers[_groupHash][msg.sender], "Only group member can add");
        if (!groupMembers[_groupHash][_member]) {
            groups[_groupHash].push(_member);
            groupMembers[_groupHash][_member] = true;
            emit MemberAdded(_groupHash, _member, msg.sender);
        }
    }

    function addFundsToGroup(bytes32 _groupHash) public payable {
        require(groupMembers[_groupHash][msg.sender], "Only group member can add funds");
        groupBalances[_groupHash] += msg.value;
        emit FundsAdded(_groupHash, msg.sender, msg.value);
    }

    function createSplitRequest(bytes32 _groupHash, address _member, uint _amount, string memory _message) public {
        require(groupMembers[_groupHash][msg.sender], "Only group member can create split request");
        require(groupMembers[_groupHash][_member], "Member must be in the group");
        emit SplitRequestCreated(_groupHash, msg.sender, _member, _amount, _message);
    }

    function distributeFunds(bytes32 _groupHash) public onlyOwner {
        uint balance = groupBalances[_groupHash];
        require(balance > 0, "No funds to distribute");

        address[] memory members = groups[_groupHash];
        uint amountPerMember = balance / members.length;

        for (uint i = 0; i < members.length; i++) {
            (bool sent, ) = members[i].call{value: amountPerMember}("");
            require(sent, "Failed to send Ether");
        }

        groupBalances[_groupHash] = 0;
    }

    // function: Send total group funds to any external address
    function sendGroupFundsTo(bytes32 _groupHash, address _to) public onlyOwner {
        uint balance = groupBalances[_groupHash];
        require(balance > 0, "No funds to send");

        groupBalances[_groupHash] = 0;

        (bool sent, ) = _to.call{value: balance}("");
        require(sent, "Transfer failed");

        emit GroupFundsTransferred(_groupHash, _to, balance);
    }

    receive() external payable {}
}
