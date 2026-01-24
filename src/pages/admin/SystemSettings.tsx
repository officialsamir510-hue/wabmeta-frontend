import React, { useState } from 'react';
import { Save, AlertTriangle, ToggleLeft, ToggleRight } from 'lucide-react';

const SystemSettings: React.FC = () => {
  const [maintenance, setMaintenance] = useState(false);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4">General Configuration</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div>
              <h4 className="font-medium text-gray-900">Maintenance Mode</h4>
              <p className="text-sm text-gray-500">Disable access for all non-admin users.</p>
            </div>
            <button 
              onClick={() => setMaintenance(!maintenance)}
              className={`transition-colors ${maintenance ? 'text-primary-600' : 'text-gray-400'}`}
            >
              {maintenance ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10" />}
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Global Message Limit (Per User/Day)</label>
            <input 
              type="number" 
              defaultValue={1000} 
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Support Email</label>
            <input 
              type="email" 
              defaultValue="support@wabmeta.com" 
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button className="flex items-center space-x-2 px-6 py-2.5 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors">
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-6 h-6 text-red-600 mt-1" />
          <div>
            <h3 className="text-lg font-bold text-red-900">Danger Zone</h3>
            <p className="text-sm text-red-700 mt-1">
              Actions here can cause data loss. Proceed with caution.
            </p>
            <div className="mt-4">
              <button className="px-4 py-2 bg-white border border-red-200 text-red-600 font-medium rounded-lg hover:bg-red-100 transition-colors">
                Clear All Cache
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;