import React from 'react';
import { Info } from 'lucide-react';

interface VariableManagerProps {
  variables: string[];
  sampleValues: Record<string, string>;
  onSampleChange: (key: string, value: string) => void;
}

const VariableManager: React.FC<VariableManagerProps> = ({
  variables,
  sampleValues,
  onSampleChange
}) => {
  const commonVariables = [
    { key: '1', label: 'Customer Name', example: 'John Doe' },
    { key: '2', label: 'Order ID', example: 'ORD-12345' },
    { key: '3', label: 'Amount', example: '₹1,999' },
    { key: '4', label: 'Date', example: '25 Dec 2024' },
    { key: '5', label: 'Product Name', example: 'iPhone 15' },
  ];

  if (variables.length === 0) {
    return (
      <div className="bg-gray-50 rounded-xl p-4 text-center">
        <Info className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-500">
          Add variables using <code className="bg-gray-200 px-1 rounded">{'{{1}}'}</code>, <code className="bg-gray-200 px-1 rounded">{'{{2}}'}</code>, etc. in your message.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">
          Variables ({variables.length})
        </label>
        <span className="text-xs text-gray-500">
          Add sample values for preview
        </span>
      </div>

      <div className="space-y-3">
        {variables.map((variable) => {
          const commonVar = commonVariables.find(v => v.key === variable);
          return (
            <div key={variable} className="flex items-center space-x-3">
              <div className="w-20 shrink-0">
                <span className="inline-flex items-center px-3 py-2 bg-primary-100 text-primary-700 rounded-lg text-sm font-mono font-medium">
                  {`{{${variable}}}`}
                </span>
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  placeholder={commonVar?.example || `Sample value for variable ${variable}`}
                  value={sampleValues[variable] || ''}
                  onChange={(e) => onSampleChange(variable, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm"
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
        <div className="flex items-start space-x-2">
          <Info className="w-4 h-4 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Variable Tips:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Variables must be numbered sequentially starting from 1</li>
              <li>You can use up to 10 variables per template</li>
              <li>Sample values are only for preview, actual values come from your contact data</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VariableManager;