import React, { useState } from 'react';
import { Plus, Download, Edit2, Trash2, Check, X } from 'lucide-react';
import { Transaction } from '../types';

interface TransactionListProps {
  transactions: Transaction[];
  onExport: () => void;
  onUpdateTransaction: (index: number, transaction: Transaction | null) => void;
  onAddTransaction: (transaction: Transaction) => void;
}

export function TransactionList({ transactions, onExport, onUpdateTransaction, onAddTransaction }: TransactionListProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTransaction, setNewTransaction] = useState<Transaction>({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: 0,
    category: 'Uncategorized'
  });

  const totalAmount = transactions.reduce((sum, tx) => sum + tx.amount, 0);

  const handleEdit = (index: number) => {
    setEditingTransaction({ ...transactions[index] });
    setEditingIndex(index);
  };

  const handleSave = () => {
    if (editingTransaction && editingIndex !== null) {
      onUpdateTransaction(editingIndex, editingTransaction);
      setEditingIndex(null);
      setEditingTransaction(null);
    }
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setEditingTransaction(null);
  };

  const handleAdd = () => {
    onAddTransaction(newTransaction);
    setNewTransaction({
      date: new Date().toISOString().split('T')[0],
      description: '',
      amount: 0,
      category: 'Uncategorized'
    });
    setShowAddForm(false);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-semibold">Extracted Transactions</h2>
          {transactions.length > 0 && (
            <div className="mt-1 text-sm text-gray-600">
              <span className="font-medium">{transactions.length}</span> transaction{transactions.length !== 1 ? 's' : ''} found
              {' • '}
              Total: <span className="font-medium">${Math.abs(totalAmount).toFixed(2)}</span>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <Plus size={16} />
            Add
          </button>
          <button
            onClick={onExport}
            disabled={!transactions.length}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="mb-4 p-4 border border-gray-300 rounded">
          <h3 className="text-sm font-semibold">Add New Transaction</h3>
          <input
            type="date"
            value={newTransaction.date}
            onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
            className="border p-1 rounded w-full mb-2"
          />
          <input
            type="text"
            placeholder="Description"
            value={newTransaction.description}
            onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
            className="border p-1 rounded w-full mb-2"
          />
          <input
            type="number"
            placeholder="Amount"
            value={newTransaction.amount}
            onChange={(e) => setNewTransaction({ ...newTransaction, amount: parseFloat(e.target.value) })}
            className="border p-1 rounded w-full mb-2"
          />
          <button
            onClick={handleAdd}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Add Transaction
          </button>
          <button
            onClick={() => setShowAddForm(false)}
            className="ml-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Cancel
          </button>
        </div>
      )}

      <div className="flex-1 overflow-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.map((transaction, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {transaction.date}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {transaction.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600">
                  ${Math.abs(transaction.amount).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleEdit(index)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => onUpdateTransaction(index, null)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 