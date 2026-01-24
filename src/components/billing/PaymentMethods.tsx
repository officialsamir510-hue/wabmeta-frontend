import React from 'react';
import { Trash2, Plus } from 'lucide-react';

const PaymentMethods: React.FC = () => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Payment Methods</h3>
        <button className="flex items-center space-x-2 text-sm text-primary-600 font-medium hover:text-primary-700">
          <Plus className="w-4 h-4" />
          <span>Add Method</span>
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center">
              <span className="font-bold text-gray-600 text-xs">VISA</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">Visa ending in 4242</p>
              <p className="text-sm text-gray-500">Expires 12/25</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
              Default
            </span>
            <button className="text-gray-400 hover:text-red-500 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center">
              <span className="font-bold text-gray-600 text-xs">MC</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">Mastercard ending in 8899</p>
              <p className="text-sm text-gray-500">Expires 08/24</p>
            </div>
          </div>
          <button className="text-gray-400 hover:text-red-500 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethods;