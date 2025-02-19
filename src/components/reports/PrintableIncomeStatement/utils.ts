export function calculatePercentage(amount: number, total: number): string {
  if (total === 0) return '0.00';
  if (amount === 0) return '0.00';
  return ((amount / Math.abs(total)) * 100).toFixed(2);
}
