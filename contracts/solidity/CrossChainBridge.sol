// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title CrossChainBridge
 * @dev Bridge contract for cross-chain token transfers
 */
contract CrossChainBridge {
    // Events
    event TokensLocked(
        address indexed token,
        address indexed sender,
        uint256 amount,
        string targetChain,
        string recipient
    );
    
    event TokensUnlocked(
        address indexed token,
        address indexed recipient,
        uint256 amount,
        bytes32 indexed sourceTxHash
    );

    // State variables
    mapping(address => uint256) public lockedBalances;
    mapping(bytes32 => bool) public processedTransactions;
    address public owner;
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev Lock tokens for cross-chain transfer
     * @param token Token address to lock
     * @param amount Amount to lock
     * @param targetChain Target blockchain identifier
     * @param recipient Recipient address on target chain
     */
    function lockTokens(
        address token,
        uint256 amount,
        string calldata targetChain,
        string calldata recipient
    ) external {
        require(amount > 0, "Amount must be greater than 0");
        
        // Transfer tokens to this contract
        (bool success, ) = token.call(
            abi.encodeWithSignature(
                "transferFrom(address,address,uint256)",
                msg.sender,
                address(this),
                amount
            )
        );
        require(success, "Transfer failed");
        
        lockedBalances[token] += amount;
        
        emit TokensLocked(token, msg.sender, amount, targetChain, recipient);
    }

    /**
     * @dev Unlock tokens after cross-chain transfer verification
     * @param token Token address to unlock
     * @param amount Amount to unlock
     * @param recipient Recipient address
     * @param sourceTxHash Transaction hash from source chain
     */
    function unlockTokens(
        address token,
        uint256 amount,
        address recipient,
        bytes32 sourceTxHash
    ) external onlyOwner {
        require(!processedTransactions[sourceTxHash], "Transaction already processed");
        require(lockedBalances[token] >= amount, "Insufficient locked balance");
        
        processedTransactions[sourceTxHash] = true;
        lockedBalances[token] -= amount;
        
        // Transfer tokens to recipient
        (bool success, ) = token.call(
            abi.encodeWithSignature(
                "transfer(address,uint256)",
                recipient,
                amount
            )
        );
        require(success, "Transfer failed");
        
        emit TokensUnlocked(token, recipient, amount, sourceTxHash);
    }

    /**
     * @dev Get locked balance for a token
     * @param token Token address
     * @return Locked balance
     */
    function getLockedBalance(address token) external view returns (uint256) {
        return lockedBalances[token];
    }
}
