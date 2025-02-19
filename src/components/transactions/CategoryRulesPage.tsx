import React from 'react';
import { Search, Plus, X, Settings } from 'lucide-react';
import { useCompany } from '../../context/CompanyContext';
import { useLocalStorage } from '../../hooks/useLocalStorage';

export function CategoryRulesPage() {
  const { companyData, updateCompanyData } = useCompany();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [editingAccount, setEditingAccount] = React.useState<string | null>(null);
  const [newKeyword, setNewKeyword] = React.useState('');
  const [showSettings, setShowSettings] = React.useState(false);
  const [config, setConfig] = useLocalStorage('accountpro-config', {
    makeWebhookUrl: '',
  });
  const [tempUrl, setTempUrl] = React.useState(config.makeWebhookUrl);

  const accounts = Array.isArray(companyData?.accounts) ? companyData.accounts : [];
  const categoryRules = Array.isArray(companyData?.categoryRules) ? companyData.categoryRules : [];

  const filteredAccounts = React.useMemo(() => {
    if (!Array.isArray(accounts)) return [];

    const filtered = !searchTerm 
      ? [...accounts]
      : accounts.filter(account => 
          account.accountNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          account.accountName.toLowerCase().includes(searchTerm.toLowerCase())
        );
    
    // Sort by account number, treating them as numbers when possible
    return filtered.sort((a, b) => {
      const numA = parseInt(a.accountNumber);
      const numB = parseInt(b.accountNumber);
      
      // If both are valid numbers, compare numerically
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      }
      
      // Otherwise, fall back to string comparison
      return a.accountNumber.localeCompare(b.accountNumber);
    });
  }, [accounts, searchTerm]);

  const handleSaveSettings = () => {
    setConfig({ ...config, makeWebhookUrl: tempUrl });
    setShowSettings(false);
  };

  const getAccountKeywords = (accountNumber: string) => {
    const rule = categoryRules.find(r => r.category === accountNumber);
    return rule?.patterns || [];
  };

  const handleAddKeyword = (accountNumber: string) => {
    if (!newKeyword.trim()) return;

    const existingRule = categoryRules.find(r => r.category === accountNumber);
    const updatedRules = categoryRules.filter(r => r.category !== accountNumber);

    const newRule = {
      id: existingRule?.id || `rule-${Date.now()}`,
      category: accountNumber,
      patterns: [...(existingRule?.patterns || []), newKeyword.trim()]
    };

    updateCompanyData({
      categoryRules: [...updatedRules, newRule]
    });

    setNewKeyword('');
  };

  const handleRemoveKeyword = (accountNumber: string, keyword: string) => {
    const existingRule = categoryRules.find(r => r.category === accountNumber);
    if (!existingRule) return;

    const updatedRules = categoryRules.filter(r => r.category !== accountNumber);
    const updatedPatterns = existingRule.patterns.filter(p => p !== keyword);

    if (updatedPatterns.length > 0) {
      updateCompanyData({
        categoryRules: [...updatedRules, { ...existingRule, patterns: updatedPatterns }]
      });
    } else {
      updateCompanyData({ categoryRules: updatedRules });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Category Rules</h1>
          <p className="mt-1 text-sm text-gray-500">
            Add keywords to accounts for automatic transaction categorization
          </p>
        </div>
        <button
          onClick={() => setShowSettings(true)}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          <Settings className="w-4 h-4 mr-2" />
          Automation Settings
        </button>
      </div>

      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Automation Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Make.com Webhook URL
                </label>
                <input
                  type="url"
                  value={tempUrl}
                  onChange={(e) => setTempUrl(e.target.value)}
                  placeholder="https://hook.make.com/your-webhook-url"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                <p className="mt-2 text-sm text-gray-500">
                  Enter your Make.com webhook URL to enable AI categorization.
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSettings}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search accounts..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Keywords
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAccounts.map((account) => {
                const isEditing = editingAccount === account.accountNumber;
                const keywords = getAccountKeywords(account.accountNumber);

                return (
                  <tr key={account.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {account.accountNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {account.accountName}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                          {keywords.map((keyword, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                            >
                              {keyword}
                              <button
                                type="button"
                                onClick={() => handleRemoveKeyword(account.accountNumber, keyword)}
                                className="ml-1.5 inline-flex items-center justify-center"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                          {!isEditing && (
                            <button
                              onClick={() => setEditingAccount(account.accountNumber)}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200"
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Add Keyword
                            </button>
                          )}
                        </div>
                        {isEditing && (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={newKeyword}
                              onChange={(e) => setNewKeyword(e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddKeyword(account.accountNumber);
                                }
                              }}
                              placeholder="Type keyword and press Enter"
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                handleAddKeyword(account.accountNumber);
                                setEditingAccount(null);
                              }}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                            >
                              Add
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingAccount(null)}
                              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
