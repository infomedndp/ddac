import React, { useState } from 'react';
import { Download, Edit2, Save, X, Plus, Trash2 } from 'lucide-react';
import { Transaction } from '../types';

interface TransactionListProps {
  transactions: Transaction[];
  onExport: () => void;
  onUpdateTransaction: (index: number, updatedTransaction: Transaction | null) => void;
}

export function TransactionList({ transactions, onExport, onUpdateTransaction }: TransactionListProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTransaction, setNewTransaction] = useState<Transaction>({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: 0
  });

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditingTransaction({ ...transactions[index] });
  };

  const handleSave = (index: number) => {
    if (editingTransaction) {
      onUpdateTransaction(index, editingTransaction);
      setEditingIndex(null);
      setEditingTransaction(null);
    }
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setEditingTransaction(null);
  };

  const handleDelete = (index: number) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      onUpdateTransaction(index, null);
    }
  };

  const handleAddTransaction = () => {
    if (newTransaction.description.trim() === '') {
      alert('Please enter a description');
      return;
    }
    
    onUpdateTransaction(-1, newTransaction);
    setShowAddForm(false);
    setNewTransaction({
      date: new Date().toISOString().split('T')[0],
      description: '',
      amount: 0
    });
  };

  // Calculate total amount
  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-semibold">Extracted Transactions</h2>
          {transactions.length > 0 && (
            <div className="mt-1 text-sm text-gray-600">
              <span className="font-medium">{transactions.length}</span> transaction{transactions.length !== 1 ? 's' : ''} found
              {' • '}
              Total: <span className="font-medium">${totalAmount.toFixed(2)}</span>
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
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-semibold mb-3">Add New Transaction</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Date</label>
              <input
                type="date"
                value={newTransaction.date}
                onChange={(e) => setNewTransaction(prev => ({ ...prev, date: e.target.value }))}
                className="w-full px-2 py-1 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Description</label>
              <input
                type="text"
                value={newTransaction.description}
                onChange={(e) => setNewTransaction(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-2 py-1 border rounded"
                placeholder="Enter description"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Amount</label>
              <input
                type="number"
                value={newTransaction.amount}
                onChange={(e) => setNewTransaction(prev => ({ ...prev, amount: Number(e.target.value) }))}
                className="w-full px-2 py-1 border rounded"
                step="0.01"
              />
            </div>
          </div>
          <div className="flex justify-end mt-4 gap-2">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleAddTransaction}
              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Add Transaction
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Date</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Description</th>
              <th className="px-4 py-2 text-right text-sm font-semibold text-gray-600">Amount</th>
              <th className="px-4 py-2 text-right text-sm font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {transactions.map((transaction, index) => (
              <tr key={index} className="hover:bg-gray-50">
                {editingIndex === index ? (
                  <>
                    <td className="px-4 py-2">
                      <input
                        type="date"
                        value={editingTransaction?.date || ''}
                        onChange={(e) => setEditingTransaction(prev => prev ? { ...prev, date: e.target.value } : null)}
                        className="w-full px-2 py-1 border rounded"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={editingTransaction?.description || ''}
                        onChange={(e) => setEditingTransaction(prev => prev ? { ...prev, description: e.target.value } : null)}
                        className="w-full px-2 py-1 border rounded"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        value={editingTransaction?.amount || 0}
                        onChange={(e) => setEditingTransaction(prev => prev ? { ...prev, amount: Number(e.target.value) } : null)}
                        className="w-full px-2 py-1 border rounded text-right"
                        step="0.01"
                      />
                    </td>
                    <td className="px-4 py-2 text-right space-x-2">
                      <button
                        onClick={() => handleSave(index)}
                        className="text-green-600 hover:text-green-800"
                      >
                        <Save size={16} />
                      </button>
                      <button
                        onClick={handleCancel}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X size={16} />
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-2 text-sm text-gray-900">{transaction.date}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{transaction.description}</td>
                    <td className="px-4 py-2 text-sm text-gray-900 text-right">
                      ${transaction.amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(index)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}