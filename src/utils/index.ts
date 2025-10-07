/**
 * Format token amount with decimals
 */
export function formatAmount(amount: string, decimals: number = 18): string {
  const value = BigInt(amount);
  const divisor = BigInt(10 ** decimals);
  const integerPart = value / divisor;
  const fractionalPart = value % divisor;
  
  return `${integerPart}.${fractionalPart.toString().padStart(decimals, '0')}`;
}

/**
 * Parse token amount to base units
 */
export function parseAmount(amount: string, decimals: number = 18): string {
  const [integerPart, fractionalPart = '0'] = amount.split('.');
  const paddedFractional = fractionalPart.padEnd(decimals, '0').slice(0, decimals);
  const value = BigInt(integerPart) * BigInt(10 ** decimals) + BigInt(paddedFractional);
  
  return value.toString();
}

/**
 * Validate address for different chain types
 */
export function validateAddress(address: string, chainType: string): boolean {
  switch (chainType) {
    case 'ethereum':
      return /^0x[a-fA-F0-9]{40}$/.test(address);
    case 'solana':
      return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
    case 'xrpl':
      return /^r[1-9A-HJ-NP-Za-km-z]{24,34}$/.test(address);
    default:
      return false;
  }
}

/**
 * Generate transaction ID
 */
export function generateTxId(): string {
  return `tx_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

/**
 * Calculate exchange rate
 */
export function calculateExchangeRate(
  amountA: string,
  amountB: string,
  decimalsA: number = 18,
  decimalsB: number = 18
): number {
  const valueA = parseFloat(formatAmount(amountA, decimalsA));
  const valueB = parseFloat(formatAmount(amountB, decimalsB));
  
  return valueB / valueA;
}
