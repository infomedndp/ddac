import React from 'react';
import { Plus, X, Trash } from 'lucide-react';
import { CategoryRule } from '../../types/transactions';

interface CategoryRulesProps {
  rules: CategoryRule[];
  onAddRule: (rule: CategoryRule) => void;
  onDeleteRule?: (ruleId: string) => void;
  onClose: () => void;
}

export function CategoryRules({ rules, onAddRule, onDeleteRule, onClose }: CategoryRulesProps) {
  const [newPattern, setNewPattern] = React.useState('');
  const [patterns, setPatterns] = React.useState<string[]>([]);
  const [category, setCategory] = React.useState('');
  const [editingRule, setEditingRule] = React.useState<CategoryRule | null>(null);

  const handleAddPattern = () => {
    if (newPattern) {
      if (editingRule) {
        const updatedPatterns = [...editingRule.patterns, newPattern];
        setEditingRule({ ...editingRule, patterns: updatedPatterns });
        onAddRule({ ...editingRule, patterns: updatedPatterns });
      } else {
        setPatterns(prev => [...prev, newPattern]);
      }
      setNewPattern('');
    }
  };

  const handleRemovePattern = (pattern: string) => {
    if (editingRule) {
      const updatedPatterns = editingRule.patterns.filter(p => p !== pattern);
      setEditingRule({ ...editingRule, patterns: updatedPatterns });
      onAddRule({ ...editingRule, patterns: updatedPatterns });
    } else {
      setPatterns(prev => prev.filter(p => p !== pattern));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (patterns.length > 0 && category) {
      const newRule: CategoryRule = {
        id: `rule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        patterns,
        category
      };
      onAddRule(newRule);
      setPatterns([]);
      setCategory('');
    }
  };

  const handleDeleteRule = (ruleId: string) => {
    if (onDeleteRule) {
      onDeleteRule(ruleId);
      if (editingRule?.id === ruleId) {
        setEditingRule(null);
      }
    }
  };

  const startEditing = (rule: CategoryRule) => {
    setEditingRule(rule);
    setCategory(rule.category);
  };

  const stopEditing = () => {
    setEditingRule(null);
    setCategory('');
    setPatterns([]);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          {editingRule ? 'Edit Category Rule' : 'Auto-Categorization Rules'}
        </h3>
        <button
          onClick={editingRule ? stopEditing : onClose}
          className="text-gray-400 hover:text-gray-500"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        {editingRule && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Category: {editingRule.category}
            </label>
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Add Keywords
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newPattern}
              onChange={(e) => setNewPattern(e.target.value)}
              placeholder="Enter keyword"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            <button
              type="button"
              onClick={handleAddPattern}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!editingRule && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Enter category"
              className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        )}

        {!editingRule && (
          <button
            type="submit"
            disabled={patterns.length === 0 || !category}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Rule
          </button>
        )}
      </form>

      <div className="overflow-hidden border border-gray-200 sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Keywords</th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rules.map((rule) => (
              <tr key={rule.id} className={editingRule?.id === rule.id ? 'bg-blue-50' : ''}>
                <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                  {rule.category}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div className="flex flex-wrap gap-2">
                    {rule.patterns.map((pattern, index) => (
                      <span
                        key={`${rule.id}-pattern-${index}`}
                        className="inline-flex items-center px-2 py-1 text-sm bg-gray-100 rounded-md"
                      >
                        {pattern}
                        {editingRule?.id === rule.id && (
                          <button
                            type="button"
                            onClick={() => handleRemovePattern(pattern)}
                            className="ml-1 text-gray-500 hover:text-gray-700"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => editingRule?.id === rule.id ? stopEditing() : startEditing(rule)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      {editingRule?.id === rule.id ? 'Done' : 'Edit'}
                    </button>
                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash className="w-4 h-4" />
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
