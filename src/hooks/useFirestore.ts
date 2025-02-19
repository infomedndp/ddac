import { useCallback } from 'react';
import { useCompany } from '../context/CompanyContext';
import * as firestoreService from '../services/firestore';
import { Transaction } from '../types/transactions';
import { ChartOfAccount } from '../types/chartOfAccounts';
import { CategoryRule } from '../types/transactions';

export function useFirestore() {
  const { selectedCompany, updateCompanyData } = useCompany();

  const handleDelete = useCallback(async (
    item: Transaction | ChartOfAccount | CategoryRule,
    type: 'transaction' | 'account' | 'categoryRule'
  ) => {
    if (!selectedCompany?.id) return;

    try {
      switch (type) {
        case 'transaction':
          await firestoreService.deleteTransaction(selectedCompany.id, item as Transaction);
          break;
        case 'account':
          await firestoreService.deleteAccount(selectedCompany.id, item as ChartOfAccount);
          break;
        case 'categoryRule':
          await firestoreService.deleteCategoryRule(selectedCompany.id, item as CategoryRule);
          break;
      }
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      throw error;
    }
  }, [selectedCompany?.id]);

  const handleUpdate = useCallback(async (
    item: Transaction | ChartOfAccount | CategoryRule,
    type: 'transaction' | 'account' | 'categoryRule'
  ) => {
    if (!selectedCompany?.id) return;

    try {
      switch (type) {
        case 'transaction':
          await firestoreService.updateTransaction(selectedCompany.id, item as Transaction);
          break;
        case 'account':
          await firestoreService.updateAccount(selectedCompany.id, item as ChartOfAccount);
          break;
        case 'categoryRule':
          await firestoreService.updateCategoryRule(selectedCompany.id, item as CategoryRule);
          break;
      }
    } catch (error) {
      console.error(`Error updating ${type}:`, error);
      throw error;
    }
  }, [selectedCompany?.id]);

  const handleRestore = useCallback(async (itemId: string) => {
    if (!selectedCompany?.id) return;

    try {
      await firestoreService.restoreDeletedItem(selectedCompany.id, itemId);
    } catch (error) {
      console.error('Error restoring item:', error);
      throw error;
    }
  }, [selectedCompany?.id]);

  return {
    deleteItem: handleDelete,
    updateItem: handleUpdate,
    restoreItem: handleRestore
  };
}
