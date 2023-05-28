// SPDX-License-Identifier: MIT

pragma solidity 0.8.4;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";

import "./IRewardCollector.sol";

/**
 * @dev Collector of rewards for merkle distributor.
 */
contract RewardCollectorAggregator is Initializable, AccessControlUpgradeable, PausableUpgradeable {
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant UNPAUSER_ROLE = keccak256("UNPAUSER_ROLE");
    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");

    using SafeERC20Upgradeable for IERC20Upgradeable;

    event TargetUpdated(address _target, bool _allowed);

    mapping(address => bool) public targets;

    function initialize(
        address admin
    ) public initializer {
        __AccessControl_init();
        __Pausable_init_unchained();
        _setupRole(DEFAULT_ADMIN_ROLE, admin); // The admin can edit all role permissions
    }

    /// @notice Admins can approve new root updaters or admins
    function _onlyAdmin() internal view {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "onlyAdmin");
    }

    function _onlyPauser() internal view {
        require(hasRole(PAUSER_ROLE, msg.sender), "onlyPauser");
    }

    function _onlyUnpauser() internal view {
        require(hasRole(UNPAUSER_ROLE, msg.sender), "onlyUnpauser");
    }

    function _onlyDistributor() internal view {
        require(hasRole(DISTRIBUTOR_ROLE, msg.sender), "onlyDistributor");
    }

    function distribute(address target, address feeAddress, address otherAddress,
        address[] memory feeTokens, uint256[] memory feeAmounts, 
        address[] memory otherTokens, uint256[] memory otherAmounts) public {
        _onlyDistributor();
        IRewardCollector feeCollector = IRewardCollector(feeAddress);
        feeCollector.distribute(target, feeTokens, feeAmounts);
        if (otherAddress != address(0)) {
            IRewardCollector otherCollector = IRewardCollector(otherAddress);
            otherCollector.distribute(target, otherTokens, otherAmounts);
        }
    }

    /// @notice Pause publishing of new roots
    function pause() external {
        _onlyPauser();
        _pause();
    }

    /// @notice Unpause publishing of new roots
    function unpause() external {
        _onlyUnpauser();
        _unpause();
    }
}