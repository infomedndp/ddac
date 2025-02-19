import { CategoryRule } from '../types/transactions';

// Clean and normalize text for comparison
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    // Remove special characters and numbers, keeping spaces
    .replace(/[^a-z\s]/g, ' ')
    // Replace multiple spaces with single space
    .replace(/\s+/g, ' ')
    .trim();
}

// Check if a keyword matches part of a description
export function isKeywordMatch(description: string, keyword: string): boolean {
  const normalizedDesc = normalizeText(description);
  const normalizedKeyword = normalizeText(keyword);
  
  // Split into words and check each
  const descWords = normalizedDesc.split(' ');
  
  // For exact matches
  if (descWords.includes(normalizedKeyword)) {
    return true;
  }
  
  // For partial matches of longer words (e.g., "SAMSCLUB" matching "SAMS")
  return descWords.some(word => 
    word.length > 3 && normalizedKeyword.length > 3 &&
    (word.startsWith(normalizedKeyword) || normalizedKeyword.startsWith(word))
  );
}

// Find matching rule for a description
export function findMatchingRule(
  description: string,
  rules: CategoryRule[]
): CategoryRule | null {
  for (const rule of rules) {
    // Check each pattern in the rule
    for (const pattern of rule.patterns) {
      if (isKeywordMatch(description, pattern)) {
        return rule;
      }
    }
  }
  
  return null;
}
