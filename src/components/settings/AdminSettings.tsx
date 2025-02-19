import React from 'react';
import { X, Save } from 'lucide-react';
import { useLocalStorage } from '../../hooks/useLocalStorage';

interface AdminSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminSettings({ isOpen, onClose }: AdminSettingsProps) {
  const [config, setConfig] = useLocalStorage('accountpro-config', {
    makeWebhookUrl: '',
    docuClipperWebhook: '',
    zealCheckWebhook: ''
  });
  const [tempConfig, setTempConfig] = React.useState({
    makeWebhookUrl: config.makeWebhookUrl,
    docuClipperWebhook: config.docuClipperWebhook,
    zealCheckWebhook: config.zealCheckWebhook
  });

  const handleSave = () => {
    setConfig(tempConfig);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Integration Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Auto Categorize Webhook URL
            </label>
            <input
              type="url"
              value={tempConfig.makeWebhookUrl}
              onChange={(e) => setTempConfig(prev => ({ ...prev, makeWebhookUrl: e.target.value }))}
              placeholder="https://hook.com/your-webhook-url"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            <p className="mt-2 text-sm text-gray-500">
              Enter your webhook URL to enable automatic transaction categorization.
            </p>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <label className="block text-sm font-medium text-gray-700">
              File Convert Webhook URL
            </label>
            <input
              type="url"
              value={tempConfig.docuClipperWebhook}
              onChange={(e) => setTempConfig(prev => ({ ...prev, docuClipperWebhook: e.target.value }))}
              placeholder="https://hook.com/your-webhook-ur"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            <p className="mt-2 text-sm text-gray-500">
              Enter your File convert webhook URL for document conversion automation.
            </p>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <label className="block text-sm font-medium text-gray-700">
              Zeal Check Webhook URL
            </label>
            <input
              type="url"
              value={tempConfig.zealCheckWebhook}
              onChange={(e) => setTempConfig(prev => ({ ...prev, zealCheckWebhook: e.target.value }))}
              placeholder="https://hook.com/your-webhook-url"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            <p className="mt-2 text-sm text-gray-500">
              Enter your Zeal Check webhook URL for document processing.
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
