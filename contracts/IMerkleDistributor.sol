// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

/**
 * @title Merkle distributor
 */
interface IMerkleDistributor {
    event RootProposed(
        uint256 indexed cycle,
        bytes32 indexed root,
        bytes32 indexed contentHash,
        uint256 startBlock,
        uint256 endBlock,
        uint256 timestamp,
        uint256 blockNumber
    );
    event RootUpdated(
        uint256 indexed cycle,
        bytes32 indexed root,
        bytes32 indexed contentHash,
        uint256 startBlock,
        uint256 endBlock,
        uint256 timestamp,
        uint256 blockNumber
    );
    event Claimed(
        address indexed user,
        address indexed token,
        uint256 amount,
        uint256 indexed cycle,
        uint256 timestamp,
        uint256 blockNumber,
        address claimer
    );
    event ClaimFailed(
        address indexed user,
        address indexed token,
        uint256 amount,
        uint256 indexed cycle,
        uint256 timestamp,
        uint256 blockNumber,
        address claimer,
        string errorReason,
        bytes errorData
    );
}
