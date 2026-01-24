import React, { useState } from 'react';
import { X, Mail, Loader2, Check } from 'lucide-react';
import type { TeamRole, RoleDefinition } from '../../types/team';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (email: string, role: TeamRole) => void;
}

const InviteMemberModal: React.FC<InviteMemberModalProps> = ({
  isOpen,
  onClose,
  onInvite
}) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<TeamRole>('agent');
  const [loading, setLoading] = useState(false);

  const roles: RoleDefinition[] = [
    {
      value: 'admin',
      label: 'Admin',
      description: 'Full access to all features, settings, and billing.',
      color: 'border-blue-200 bg-blue-50 text-blue-700'
    },
    {
      value: 'manager',
      label: 'Manager',
      description: 'Can manage campaigns, templates, and contacts. No billing access.',
      color: 'border-orange-200 bg-orange-50 text-orange-700'
    },
    {
      value: 'agent',
      label: 'Agent',
      description: 'Can respond to chats and view assigned contacts only.',
      color: 'border-gray-200 bg-gray-50 text-gray-700'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    onInvite(email, role);
    setLoading(false);
    setEmail('');
    setRole('agent');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Invite Team Member</h2>
            <p className="text-sm text-gray-500 mt-1">Send an invitation to join your workspace</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@company.com"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Role
            </label>
            <div className="space-y-3">
              {roles.map((r) => (
                <label
                  key={r.value}
                  className={`flex items-start space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    role === r.value
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={r.value}
                    checked={role === r.value}
                    onChange={(e) => setRole(e.target.value as TeamRole)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-bold ${role === r.value ? 'text-primary-900' : 'text-gray-900'}`}>
                        {r.label}
                      </span>
                      {role === r.value && <Check className="w-4 h-4 text-primary-600" />}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{r.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-gray-700 font-medium rounded-xl hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  <span>Send Invite</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteMemberModal;