import { Transaction } from '../types/transactions';
import { CategoryRule } from '../types/transactions';

export async function sendToMakeWebhook(
  transactions: Transaction[],
  categoryRules: CategoryRule[],
  companyId: string
): Promise<{ status: string; data: Array<{ id: string; category: string; status: string }> }> {
  try {
    const config = JSON.parse(localStorage.getItem('accountpro-config') || '{}');
    const webhookUrl = config.makeWebhookUrl;

    if (!webhookUrl) {
      console.warn('Make webhook URL is not configured');
      throw new Error('Webhook URL not configured. Please configure it in Admin Settings.');
    }

    if (!transactions || transactions.length === 0) {
      throw new Error('No transactions selected');
    }

    const flatTransactions = transactions.map(tx => ({
      id: tx.id,
      date: tx.date,
      description: tx.description,
      amount: tx.amount,
      category: tx.category || 'Uncategorized'
    }));

    const flatRules = categoryRules.map(rule => ({
      id: rule.id,
      patterns: rule.patterns,
      category: rule.category
    }));

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        companyId,
        transactions: flatTransactions,
        rules: flatRules,
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) {
      throw new Error(`Webhook failed with status: ${response.status}`);
    }

    return await response.json();

  } catch (error) {
    console.error('Error sending to Make webhook:', error);
    throw error instanceof Error 
      ? error 
      : new Error('Failed to communicate with auto-categorization service');
  }
}
