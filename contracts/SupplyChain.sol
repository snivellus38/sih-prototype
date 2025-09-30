// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SupplyChain {
    struct Batch {
        uint256 id;
        string crop;
        uint256 quantity;
        uint256 harvestDate;
        address farmer;
        address inspector;
        bool verified;
        string ipfsHash;
    }

    uint256 public nextBatchId;
    mapping(uint256 => Batch) public batches;
    mapping(address => bool) public inspectors;
    address public owner;

    event BatchRegistered(uint256 indexed id, address indexed farmer);
    event BatchVerified(uint256 indexed id, address indexed inspector);

    modifier onlyOwner() {
        require(msg.sender == owner, "only owner");
        _;
    }
    modifier onlyInspector() {
        require(inspectors[msg.sender], "only inspector");
        _;
    }

    constructor() {
        owner = msg.sender;
        inspectors[msg.sender] = true;

    function registerBatch(
        string memory crop,
        uint256 quantity,
        uint256 harvestDate,
        string memory ipfsHash
    ) public {
        uint256 id = nextBatchId;
        batches[id] = Batch(id, crop, quantity, harvestDate, msg.sender, address(0), false, ipfsHash);
        nextBatchId++;
        emit BatchRegistered(id, msg.sender);
    }

    function verifyBatch(uint256 batchId) public onlyInspector {
        require(batchId < nextBatchId, "invalid id");
        Batch storage b = batches[batchId];
        require(!b.verified, "already verified");
        b.verified = true;
        b.inspector = msg.sender;
        emit BatchVerified(batchId, msg.sender);
    }

    function getBatch(uint256 batchId) public view returns (
        uint256, string memory, uint256, uint256, address, address, bool, string memory
    ) {
        Batch memory b = batches[batchId];
        return (b.id, b.crop, b.quantity, b.harvestDate, b.farmer, b.inspector, b.verified, b.ipfsHash);
    }

    function addInspector(address who) public onlyOwner {
        inspectors[who] = true;
    }

    function isInspector(address who) public view returns (bool) {
        return inspectors[who];
    }
}
