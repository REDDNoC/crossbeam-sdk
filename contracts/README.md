# Smart Contract Templates

This directory contains production-ready smart contract templates for cross-chain bridges and liquidity pools.

## Ethereum (Solidity)

### CrossChainBridge.sol

A bridge contract implementing the lock-and-mint pattern for cross-chain token transfers.

**Features:**
- Lock tokens on source chain
- Unlock tokens after verification
- Transaction replay protection
- Access control

**Deployment:**

```bash
npx hardhat run scripts/deploy-bridge.js --network mainnet
```

**Usage:**

```solidity
// User locks tokens
bridge.lockTokens(
    tokenAddress,
    1000000000000000000, // 1 token
    "solana",            // target chain
    "recipient-address"
);

// Bridge admin unlocks on target chain
bridge.unlockTokens(
    tokenAddress,
    1000000000000000000,
    recipientAddress,
    sourceTxHash
);
```

### LiquidityPool.sol

An AMM-style liquidity pool for token swaps.

**Features:**
- Add/remove liquidity
- Token swaps with 0.3% fee
- Constant product formula (x * y = k)

**Deployment:**

```bash
npx hardhat run scripts/deploy-pool.js --network mainnet
```

**Usage:**

```solidity
// Add liquidity
pool.addLiquidity(1000000, 500000); // tokenA, tokenB amounts

// Swap tokens
pool.swap(
    1000000,  // amount in
    true      // true for A->B, false for B->A
);

// Remove liquidity
pool.removeLiquidity(100000); // liquidity shares
```

## Solana (Rust)

### bridge.rs

A Solana program for cross-chain bridge operations.

**Features:**
- Lock tokens instruction
- Unlock tokens instruction
- Program-derived addresses (PDAs)

**Build:**

```bash
cd contracts/rust
cargo build-bpf
```

**Deploy:**

```bash
solana program deploy target/deploy/crossbeam_bridge_solana.so
```

**Usage:**

```rust
// Lock tokens instruction
let instruction_data = BridgeInstruction::LockTokens {
    amount: 1_000_000_000,
    target_chain: "ethereum".to_string(),
};

// Unlock tokens instruction
let instruction_data = BridgeInstruction::UnlockTokens {
    amount: 1_000_000_000,
    source_tx_hash: tx_hash,
};
```

## Contract Verification

### Ethereum (Etherscan)

```bash
npx hardhat verify --network mainnet DEPLOYED_CONTRACT_ADDRESS
```

### Solana (Solscan)

Upload the `.so` file and Rust source code to verify on Solscan.

## Security Audits

Before deploying to production:

1. **Static Analysis**: Use tools like Slither (Solidity) or Clippy (Rust)
2. **Formal Verification**: Verify critical invariants
3. **Professional Audit**: Engage a reputable security firm
4. **Bug Bounty**: Launch a bug bounty program

## Testing

### Solidity Tests

```bash
npx hardhat test
```

### Rust Tests

```bash
cd contracts/rust
cargo test-bpf
```

## Gas Optimization

### Solidity

- Use `immutable` for constructor-set variables
- Pack struct variables efficiently
- Use `calldata` instead of `memory` for read-only function parameters
- Batch operations when possible

### Solana

- Minimize account allocations
- Use zero-copy deserialization
- Optimize compute units usage

## Upgrade Patterns

### Transparent Proxy (Ethereum)

```solidity
contract BridgeProxy {
    address implementation;
    
    fallback() external payable {
        address _impl = implementation;
        assembly {
            let ptr := mload(0x40)
            calldatacopy(ptr, 0, calldatasize())
            let result := delegatecall(gas(), _impl, ptr, calldatasize(), 0, 0)
            let size := returndatasize()
            returndatacopy(ptr, 0, size)
            
            switch result
            case 0 { revert(ptr, size) }
            default { return(ptr, size) }
        }
    }
}
```

### Program Upgrades (Solana)

```bash
solana program deploy --upgrade-authority <KEYPAIR> target/deploy/program.so
```

## Multi-Chain Deployment Checklist

- [ ] Deploy to testnets first
- [ ] Verify contracts
- [ ] Test all functions
- [ ] Configure access controls
- [ ] Set up monitoring
- [ ] Document contract addresses
- [ ] Initialize with limited liquidity
- [ ] Gradually increase limits
- [ ] Monitor for anomalies
- [ ] Plan emergency shutdown procedure

## Emergency Procedures

### Pause Contract (Ethereum)

```solidity
contract PausableBridge {
    bool public paused;
    
    modifier whenNotPaused() {
        require(!paused, "Contract paused");
        _;
    }
    
    function pause() external onlyOwner {
        paused = true;
    }
}
```

### Drain Liquidity

In case of critical vulnerability:

```solidity
function emergencyWithdraw(address token) external onlyOwner {
    // Transfer all tokens to secure address
}
```

## Contract Addresses

Update this section after deployment:

### Mainnet

- Ethereum Bridge: `0x...`
- Ethereum Pool: `0x...`
- Solana Bridge: `...`

### Testnet

- Ethereum Goerli Bridge: `0x...`
- Solana Devnet Bridge: `...`
