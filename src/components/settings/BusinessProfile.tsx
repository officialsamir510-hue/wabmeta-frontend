import React, { useState } from 'react';
import { Building2, Globe, Mail, MapPin, Save, Loader2, Upload } from 'lucide-react';
import type { BusinessProfile as BusinessProfileType } from '../../types/settings';

const BusinessProfile: React.FC = () => {
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<BusinessProfileType>({
    name: 'WabMeta Business',
    category: 'Professional Services',
    description: 'The best WhatsApp marketing platform for growing businesses.',
    address: '123 Tech Park, Bangalore, India',
    email: 'support@wabmeta.com',
    websites: ['https://wabmeta.com', 'https://blog.wabmeta.com'],
    profilePicture: 'https://via.placeholder.com/150'
  });

  const handleSave = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSaving(false);
    // Add toast success
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">WhatsApp Business Profile</h3>
        <p className="text-gray-500 text-sm mt-1">
          This information will be visible to your WhatsApp contacts.
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Profile Picture */}
        <div className="flex items-center space-x-6">
          <div className="relative group">
            <img
              src={profile.profilePicture}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
            />
            <button className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Upload className="w-6 h-6 text-white" />
            </button>
          </div>
          <div>
            <h4 className="font-medium text-gray-900">Profile Photo</h4>
            <p className="text-sm text-gray-500 mb-2">
              Recommended size: 640x640px. Max size: 5MB.
            </p>
            <div className="flex space-x-3">
              <button className="text-sm text-primary-600 font-medium hover:text-primary-700">
                Upload New
              </button>
              <button className="text-sm text-red-600 font-medium hover:text-red-700">
                Remove
              </button>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display Name
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={profile.category}
              onChange={(e) => setProfile({ ...profile, category: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            >
              <option>Professional Services</option>
              <option>Retail</option>
              <option>Finance</option>
              <option>Education</option>
              <option>Healthcare</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={profile.description}
              onChange={(e) => setProfile({ ...profile, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={profile.address}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Websites
            </label>
            <div className="space-y-3">
              {profile.websites.map((site, index) => (
                <div key={index} className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="url"
                    value={site}
                    onChange={(e) => {
                      const newSites = [...profile.websites];
                      newSites[index] = e.target.value;
                      setProfile({ ...profile, websites: newSites });
                    }}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              ))}
              {profile.websites.length < 2 && (
                <button
                  onClick={() => setProfile({ ...profile, websites: [...profile.websites, ''] })}
                  className="text-sm text-primary-600 font-medium hover:text-primary-700"
                >
                  + Add another website
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center space-x-2 px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default BusinessProfile;