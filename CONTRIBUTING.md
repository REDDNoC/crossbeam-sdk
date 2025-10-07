# Contributing to Crossbeam SDK

Thank you for your interest in contributing to Crossbeam SDK! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git
- TypeScript knowledge
- Familiarity with blockchain concepts

### Setup Development Environment

1. **Fork the repository**

```bash
git clone https://github.com/YOUR_USERNAME/crossbeam-sdk.git
cd crossbeam-sdk
```

2. **Install dependencies**

```bash
npm install
```

3. **Build the project**

```bash
npm run build
```

4. **Run tests**

```bash
npm test
```

## Development Workflow

### Branch Naming

Use descriptive branch names:

- `feature/add-polygon-bridge` - New features
- `fix/ethereum-gas-estimation` - Bug fixes
- `docs/update-api-reference` - Documentation updates
- `refactor/oracle-architecture` - Code refactoring

### Commit Messages

Follow conventional commits:

```
feat: add Polygon bridge support
fix: correct Solana transaction parsing
docs: update API reference
refactor: simplify oracle caching logic
test: add integration tests for XRPL bridge
```

### Code Style

- Use TypeScript for all new code
- Follow existing code formatting
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Keep functions small and focused

### Running Linter

```bash
npm run lint
```

## Adding New Features

### Adding a New Blockchain

To add support for a new blockchain:

1. **Create Bridge Implementation**

Create `src/bridges/NewChainBridge.ts`:

```typescript
import { BaseBridge } from './BaseBridge';
import { BridgeConfig, CrossChainTransaction, TransactionStatus } from '../types';

export class NewChainBridge extends BaseBridge {
  async initialize(): Promise<void> {
    // Initialize connection
  }

  async transfer(
    amount: string,
    recipient: string,
    sender: string
  ): Promise<CrossChainTransaction> {
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

2. **Add to Chain Types**

Update `src/types/index.ts`:

```typescript
export enum ChainType {
  DAMA = 'dama',
  ETHEREUM = 'ethereum',
  SOLANA = 'solana',
  XRPL = 'xrpl',
  NEWCHAIN = 'newchain', // Add new chain
}
```

3. **Export from Index**

Update `src/bridges/index.ts`:

```typescript
export { NewChainBridge } from './NewChainBridge';
```

4. **Update SDK**

Update `src/core/CrossbeamSDK.ts` to support the new chain.

5. **Add Tests**

Create `src/bridges/NewChainBridge.test.ts`.

6. **Update Documentation**

- Update README.md
- Add examples
- Update API reference

### Adding Oracle Sources

1. Create `src/oracles/NewOracle.ts`
2. Extend `BaseOracle`
3. Implement required methods
4. Add tests
5. Update documentation

## Testing

### Unit Tests

```bash
npm test
```

### Integration Tests

```bash
npm run test:integration
```

### Test Coverage

```bash
npm run test:coverage
```

### Writing Tests

```typescript
import { EthereumBridge } from '../EthereumBridge';
import { ChainType } from '../../types';

describe('EthereumBridge', () => {
  let bridge: EthereumBridge;

  beforeEach(() => {
    bridge = new EthereumBridge({
      sourceChain: ChainType.ETHEREUM,
      targetChain: ChainType.DAMA,
      rpcUrl: 'http://localhost:8545',
    });
  });

  it('should initialize successfully', async () => {
    await expect(bridge.initialize()).resolves.not.toThrow();
  });

  it('should transfer tokens', async () => {
    const tx = await bridge.transfer('1000000', 'recipient', 'sender');
    expect(tx.amount).toBe('1000000');
  });
});
```

## Documentation

### API Documentation

- Use JSDoc comments for all public APIs
- Include examples in documentation
- Keep README.md up to date

### Example Format

```typescript
/**
 * Transfer tokens between chains
 * 
 * @param sourceChain - Source blockchain
 * @param targetChain - Target blockchain
 * @param amount - Amount in base units
 * @param sender - Sender address
 * @param recipient - Recipient address
 * @returns Transaction object
 * 
 * @example
 * ```typescript
 * const tx = await sdk.transfer(
 *   ChainType.ETHEREUM,
 *   ChainType.DAMA,
 *   '1000000000000000000',
 *   '0xSender',
 *   'recipient'
 * );
 * ```
 */
async transfer(
  sourceChain: ChainType,
  targetChain: ChainType,
  amount: string,
  sender: string,
  recipient: string
): Promise<CrossChainTransaction>
```

## Pull Request Process

1. **Create a feature branch**

```bash
git checkout -b feature/your-feature-name
```

2. **Make your changes**

- Write clean, documented code
- Add tests
- Update documentation

3. **Test your changes**

```bash
npm run build
npm test
npm run lint
```

4. **Commit your changes**

```bash
git add .
git commit -m "feat: add your feature"
```

5. **Push to your fork**

```bash
git push origin feature/your-feature-name
```

6. **Create Pull Request**

- Use a descriptive title
- Fill out the PR template
- Link related issues
- Request reviews

### PR Checklist

- [ ] Code follows project style guidelines
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] Build passes
- [ ] All tests pass
- [ ] No linting errors
- [ ] Commit messages follow conventions

## Smart Contract Development

### Solidity Contracts

- Follow Solidity best practices
- Add comprehensive tests
- Use OpenZeppelin when possible
- Get security audits for mainnet contracts

### Rust Programs (Solana)

- Follow Rust conventions
- Add tests with `cargo test-bpf`
- Document all public functions
- Handle errors properly

## Release Process

1. Update version in `package.json`
2. Update CHANGELOG.md
3. Create release PR
4. Tag release after merge
5. Publish to npm

## Getting Help

- 💬 Join our Discord
- 📧 Email: dev@crossbeam.io
- 🐛 Open an issue

## Recognition

Contributors will be:

- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Eligible for bounties (if applicable)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Crossbeam SDK! 🚀
