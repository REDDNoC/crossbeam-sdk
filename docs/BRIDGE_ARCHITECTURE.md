# Bridge Architecture

## Overview

The Crossbeam SDK implements a lock-and-mint bridge architecture for cross-chain token transfers. This document explains how bridges work and how to integrate them.

## Lock-and-Mint Mechanism

### 1. Locking Phase (Source Chain)

When a user wants to transfer tokens from Chain A to Chain B:

1. User approves the bridge contract to spend tokens
2. User calls `lockTokens()` with:
   - Token address
   - Amount
   - Target chain identifier
   - Recipient address on target chain
3. Bridge contract:
   - Transfers tokens from user to bridge vault
   - Increments locked balance
   - Emits `TokensLocked` event

### 2. Relay Phase (Off-chain)

Relayers monitor the source chain for lock events:

1. Relayer detects `TokensLocked` event
2. Relayer verifies transaction finality
3. Relayer submits proof to target chain

### 3. Minting/Unlocking Phase (Target Chain)

On the target chain:

1. Bridge validator verifies proof
2. Bridge contract:
   - Checks transaction hasn't been processed
   - Mints wrapped tokens (or unlocks native tokens)
   - Transfers to recipient
   - Marks transaction as processed
   - Emits `TokensUnlocked` event

## Bridge Components

### Smart Contracts

#### Ethereum Bridge Contract

```solidity
// Lock tokens
function lockTokens(
    address token,
    uint256 amount,
    string calldata targetChain,
    string calldata recipient
) external

// Unlock tokens (admin only)
function unlockTokens(
    address token,
    uint256 amount,
    address recipient,
    bytes32 sourceTxHash
) external onlyOwner
```

#### Solana Bridge Program

```rust
pub enum BridgeInstruction {
    LockTokens { amount: u64, target_chain: String },
    UnlockTokens { amount: u64, source_tx_hash: [u8; 32] },
}
```

### TypeScript SDK

```typescript
// Initialize bridge
const bridge = new EthereumBridge({
  sourceChain: ChainType.ETHEREUM,
  targetChain: ChainType.DAMA,
  rpcUrl: 'https://...',
  contractAddress: '0x...',
});

await bridge.initialize();

// Transfer tokens
const tx = await bridge.transfer(
  '1000000000000000000', // amount
  'recipient-address',
  'sender-address'
);
```

## Security Considerations

### 1. Transaction Replay Protection

Each cross-chain transaction is tracked by its hash to prevent replay attacks:

```solidity
mapping(bytes32 => bool) public processedTransactions;

require(!processedTransactions[sourceTxHash], "Already processed");
processedTransactions[sourceTxHash] = true;
```

### 2. Access Control

Only authorized validators can unlock/mint tokens:

```solidity
modifier onlyOwner() {
    require(msg.sender == owner, "Not authorized");
    _;
}
```

### 3. Liquidity Management

Track locked balances to ensure sufficient liquidity:

```solidity
mapping(address => uint256) public lockedBalances;

require(lockedBalances[token] >= amount, "Insufficient locked balance");
```

## Adding a New Chain

To add support for a new blockchain:

1. **Create Bridge Implementation**

```typescript
export class NewChainBridge extends BaseBridge {
  async initialize(): Promise<void> {
    // Initialize connection to the chain
  }

  async transfer(amount: string, recipient: string, sender: string): Promise<CrossChainTransaction> {
    // Implement transfer logic
  }

  async getTransactionStatus(txId: string): Promise<TransactionStatus> {
    // Check transaction status
  }

  async getLiquidity(): Promise<{ available: string; total: string }> {
    // Get liquidity info
  }
}
```

2. **Deploy Smart Contract**

Deploy the bridge contract on the new chain following the lock-and-mint pattern.

3. **Update SDK Configuration**

```typescript
const sdk = new CrossbeamSDK({
  bridges: {
    newchain: {
      sourceChain: ChainType.NEWCHAIN,
      targetChain: ChainType.DAMA,
      rpcUrl: 'https://...',
      contractAddress: '0x...',
    },
  },
});
```

## Best Practices

1. **Always check transaction finality** before processing cross-chain transfers
2. **Use multi-signature wallets** for bridge admin operations
3. **Implement rate limiting** to prevent bridge drainage
4. **Monitor bridge balances** and set up alerts for low liquidity
5. **Regular security audits** of bridge contracts
6. **Gradual rollout** with transfer limits during initial deployment

## Monitoring

Monitor these key metrics:

- Total locked value (TVL)
- Transaction volume
- Average transaction time
- Failed transaction rate
- Bridge balance vs locked amount

## Troubleshooting

### Transaction Stuck in Pending

1. Check source chain transaction status
2. Verify relayer is running
3. Check target chain for confirmation
4. Verify sufficient gas/fees

### Insufficient Liquidity

1. Check bridge balance on target chain
2. Add liquidity if needed
3. Contact bridge administrators

### Failed Unlock

1. Verify transaction wasn't already processed
2. Check signature validity
3. Ensure sufficient bridge balance
