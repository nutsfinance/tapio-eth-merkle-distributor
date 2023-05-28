// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

interface IRewardCollector {
    function distribute(address target, address[] memory _tokens, uint256[] memory _amounts) external;
}