import React, { useState, useEffect } from 'react';
import { Search, Ban, Trash2, Mail, CheckCircle, RefreshCw, Loader2 } from 'lucide-react';
import { admin } from '../../services/api';

const UserManagement: React.FC = () => {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Fetch Users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await admin.getUsers({ search });
      setUsers(data);
    } catch (error) {
      console.error("Fetch Users Failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search]); // Re-fetch on search change (debounce recommended in production)

  // Toggle User Status
  const handleStatusToggle = async (id: string, currentStatus: string) => {
    if (!window.confirm(`Are you sure you want to ${currentStatus === 'active' ? 'suspend' : 'activate'} this user?`)) return;

    setProcessingId(id);
    try {
      const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
      // Assume api.updateUserStatus exists or use updateRole logic
      // If endpoint differs, add to api.ts
      await admin.updateUserStatus(id, newStatus); 
      setUsers(users.map(u => u._id === id ? { ...u, status: newStatus } : u));
    } catch (error) {
      alert("Failed to update status");
    } finally {
      setProcessingId(null);
    }
  };

  // Delete User
  const handleDelete = async (id: string) => {
    if (!window.confirm("This action cannot be undone. Delete user?")) return;

    setProcessingId(id);
    try {
      await admin.deleteUser(id);
      setUsers(users.filter(u => u._id !== id));
    } catch (error) {
      alert("Failed to delete user");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <div className="flex space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button 
            onClick={fetchUsers}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        {loading && users.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">User</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Plan</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Joined</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold uppercase shrink-0">
                          {user.name.charAt(0)}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${
                        user.plan === 'enterprise' ? 'bg-purple-100 text-purple-700' :
                        user.plan === 'pro' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {user.plan || 'Free'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 capitalize">
                      {user.role}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${
                        user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {user.status || 'active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <a 
                          href={`mailto:${user.email}`}
                          className="p-2 text-gray-400 hover:bg-blue-50 rounded-lg hover:text-blue-600 transition-colors" 
                          title="Email User"
                        >
                          <Mail className="w-4 h-4" />
                        </a>
                        <button 
                          onClick={() => handleStatusToggle(user._id, user.status || 'active')}
                          disabled={processingId === user._id}
                          className={`p-2 rounded-lg transition-colors ${
                            user.status === 'active' 
                              ? 'text-gray-400 hover:bg-red-50 hover:text-red-600' 
                              : 'text-gray-400 hover:bg-green-50 hover:text-green-600'
                          }`}
                          title={user.status === 'active' ? "Suspend User" : "Activate User"}
                        >
                          {user.status === 'active' ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        </button>
                        <button 
                          onClick={() => handleDelete(user._id)}
                          disabled={processingId === user._id}
                          className="p-2 text-gray-400 hover:bg-red-50 rounded-lg hover:text-red-600 transition-colors" 
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No users found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;