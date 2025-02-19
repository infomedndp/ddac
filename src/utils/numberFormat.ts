export const formatNumber = (value: number): string => {
  const absValue = Math.abs(value);
  const formattedNumber = absValue.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return formattedNumber;
};

export const formatCurrency = (amount: number, isNegative?: boolean): string => {
  const formattedNumber = formatNumber(amount);
  if (isNegative || amount < 0) {
    return `($${formattedNumber})`;
  }
  return `$${formattedNumber}`;
};
