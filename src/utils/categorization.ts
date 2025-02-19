import { Transaction, CategoryRule } from '../types/transactions';

export function extractKeywords(description: string): string[] {
  // Clean up the description and return it as a single pattern
  const cleanDescription = description
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, '') // Remove special characters except spaces
    .trim();

  return cleanDescription ? [cleanDescription] : [];
}

export function findMatchingRule(description: string, rules: CategoryRule[]): CategoryRule | undefined {
  const upperDescription = description.toUpperCase();
  
  return rules.find(rule => 
    rule.patterns.some(pattern => 
      upperDescription.includes(pattern.toUpperCase())
    )
  );
}

export function autoCategorizeTransaction(
  transaction: Transaction,
  rules: CategoryRule[],
  existingTransactions: Transaction[]
): string {
  // Only categorize if there's a matching rule
  const matchingRule = findMatchingRule(transaction.description, rules);
  return matchingRule ? matchingRule.category : 'Uncategorized';
}
