import { 
  doc, 
  collection,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  DocumentData,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { Company, CompanyData } from '../types/company';
import { Transaction } from '../types/transactions';
import { ChartOfAccount } from '../types/chartOfAccounts';
import { CategoryRule } from '../types/transactions';

// Soft delete function that moves items to a deleted collection
async function moveToDeleted(companyId: string, itemType: string, item: any) {
  const deletedRef = collection(db, 'companies', companyId, 'deleted');
  await addDoc(deletedRef, {
    ...item,
    itemType,
    deletedAt: serverTimestamp(),
    originalId: item.id
  });
}

// Transaction Operations
export async function deleteTransaction(companyId: string, transaction: Transaction) {
  try {
    // Move to deleted collection first
    await moveToDeleted(companyId, 'transaction', transaction);

    // Update company document
    const companyRef = doc(db, 'companies', companyId);
    const companyDoc = await getDoc(companyRef);
    
    if (companyDoc.exists()) {
      const data = companyDoc.data();
      const updatedTransactions = (data.transactions || []).filter(
        (tx: Transaction) => tx.id !== transaction.id
      );

      // If the transaction was categorized, update account balance
      if (transaction.category && transaction.category !== 'Uncategorized') {
        const updatedAccounts = (data.accounts || []).map((account: ChartOfAccount) => {
          if (account.accountNumber === transaction.category) {
            return {
              ...account,
              balance: (account.balance || 0) - transaction.amount
            };
          }
          return account;
        });

        await updateDoc(companyRef, {
          transactions: updatedTransactions,
          accounts: updatedAccounts
        });
      } else {
        await updateDoc(companyRef, {
          transactions: updatedTransactions
        });
      }
    }
  } catch (error) {
    console.error('Error deleting transaction:', error);
    throw error;
  }
}

// Account Operations
export async function deleteAccount(companyId: string, account: ChartOfAccount) {
  try {
    // Move to deleted collection first
    await moveToDeleted(companyId, 'account', account);

    // Update company document
    const companyRef = doc(db, 'companies', companyId);
    const companyDoc = await getDoc(companyRef);
    
    if (companyDoc.exists()) {
      const data = companyDoc.data();
      
      // Remove account from accounts array
      const updatedAccounts = (data.accounts || []).filter(
        (acc: ChartOfAccount) => acc.id !== account.id
      );

      // Update transactions with this account to Uncategorized
      const updatedTransactions = (data.transactions || []).map((tx: Transaction) => {
        if (tx.category === account.accountNumber) {
          return { ...tx, category: 'Uncategorized' };
        }
        return tx;
      });

      await updateDoc(companyRef, {
        accounts: updatedAccounts,
        transactions: updatedTransactions
      });
    }
  } catch (error) {
    console.error('Error deleting account:', error);
    throw error;
  }
}

// Category Rule Operations
export async function deleteCategoryRule(companyId: string, rule: CategoryRule) {
  try {
    // Move to deleted collection first
    await moveToDeleted(companyId, 'categoryRule', rule);

    // Update company document
    const companyRef = doc(db, 'companies', companyId);
    const companyDoc = await getDoc(companyRef);
    
    if (companyDoc.exists()) {
      const data = companyDoc.data();
      const updatedRules = (data.categoryRules || []).filter(
        (r: CategoryRule) => r.id !== rule.id
      );

      await updateDoc(companyRef, {
        categoryRules: updatedRules
      });
    }
  } catch (error) {
    console.error('Error deleting category rule:', error);
    throw error;
  }
}

// Update Operations
export async function updateTransaction(companyId: string, transaction: Transaction) {
  try {
    const companyRef = doc(db, 'companies', companyId);
    const companyDoc = await getDoc(companyRef);
    
    if (companyDoc.exists()) {
      const data = companyDoc.data();
      const updatedTransactions = (data.transactions || []).map((tx: Transaction) => 
        tx.id === transaction.id ? transaction : tx
      );

      await updateDoc(companyRef, {
        transactions: updatedTransactions
      });
    }
  } catch (error) {
    console.error('Error updating transaction:', error);
    throw error;
  }
}

export async function updateAccount(companyId: string, account: ChartOfAccount) {
  try {
    const companyRef = doc(db, 'companies', companyId);
    const companyDoc = await getDoc(companyRef);
    
    if (companyDoc.exists()) {
      const data = companyDoc.data();
      const updatedAccounts = (data.accounts || []).map((acc: ChartOfAccount) => 
        acc.id === account.id ? account : acc
      );

      await updateDoc(companyRef, {
        accounts: updatedAccounts
      });
    }
  } catch (error) {
    console.error('Error updating account:', error);
    throw error;
  }
}

export async function updateCategoryRule(companyId: string, rule: CategoryRule) {
  try {
    const companyRef = doc(db, 'companies', companyId);
    const companyDoc = await getDoc(companyRef);
    
    if (companyDoc.exists()) {
      const data = companyDoc.data();
      const updatedRules = (data.categoryRules || []).map((r: CategoryRule) => 
        r.id === rule.id ? rule : r
      );

      await updateDoc(companyRef, {
        categoryRules: updatedRules
      });
    }
  } catch (error) {
    console.error('Error updating category rule:', error);
    throw error;
  }
}

// Restore from deleted collection
export async function restoreDeletedItem(companyId: string, itemId: string) {
  try {
    const deletedRef = doc(db, 'companies', companyId, 'deleted', itemId);
    const deletedDoc = await getDoc(deletedRef);
    
    if (deletedDoc.exists()) {
      const deletedItem = deletedDoc.data();
      const companyRef = doc(db, 'companies', companyId);
      const companyDoc = await getDoc(companyRef);
      
      if (companyDoc.exists()) {
        const data = companyDoc.data();
        
        // Remove from deleted collection
        await deleteDoc(deletedRef);
        
        // Restore based on item type
        switch (deletedItem.itemType) {
          case 'transaction':
            await updateDoc(companyRef, {
              transactions: [...(data.transactions || []), deletedItem]
            });
            break;
          case 'account':
            await updateDoc(companyRef, {
              accounts: [...(data.accounts || []), deletedItem]
            });
            break;
          case 'categoryRule':
            await updateDoc(companyRef, {
              categoryRules: [...(data.categoryRules || []), deletedItem]
            });
            break;
        }
      }
    }
  } catch (error) {
    console.error('Error restoring deleted item:', error);
    throw error;
  }
}
