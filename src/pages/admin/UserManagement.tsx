// src/pages/admin/UserManagement.tsx

import React, { useState, useEffect } from 'react';
import { 
  Search, Ban, Trash2, Mail, CheckCircle, RefreshCw, 
  Loader2, Monitor, Smartphone, Globe, AlertCircle 
} from 'lucide-react';
import { admin } from '../../services/api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: string;
  createdAt: string;
  lastLoginAt?: string;
  organizations?: { id: string; name: string; role: string }[];
}

const UserManagement: React.FC = () => {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });

  // Fetch Users
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await admin.getUsers({ 
        search: search || undefined,
        page: pagination.page,
        limit: pagination.limit
      });
      
      console.log('📥 Users Response:', response.data);
      
      // Handle response structure
      const usersData = response.data?.data || response.data?.users || [];
      const total = response.data?.meta?.total || usersData.length;
      
      setUsers(usersData);
      setPagination(prev => ({ ...prev, total }));
      
    } catch (err: any) {
      console.error("❌ Fetch Users Failed:", err);
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchUsers();
    }, 300);
    
    return () => clearTimeout(debounce);
  }, [search, pagination.page]);

  // Suspend User
  const handleSuspend = async (id: string) => {
    if (!window.confirm('Are you sure you want to suspend this user?')) return;

    setProcessingId(id);
    try {
      await admin.suspendUser(id);
      setUsers(users.map(u => u.id === id ? { ...u, status: 'SUSPENDED' } : u));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to suspend user');
    } finally {
      setProcessingId(null);
    }
  };

  // Activate User
  const handleActivate = async (id: string) => {
    if (!window.confirm('Are you sure you want to activate this user?')) return;

    setProcessingId(id);
    try {
      await admin.activateUser(id);
      setUsers(users.map(u => u.id === id ? { ...u, status: 'ACTIVE' } : u));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to activate user');
    } finally {
      setProcessingId(null);
    }
  };

  // Delete User
  const handleDelete = async (id: string) => {
    if (!window.confirm('This action cannot be undone. Delete user?')) return;

    setProcessingId(id);
    try {
      await admin.deleteUser(id);
      setUsers(users.filter(u => u.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setProcessingId(null);
    }
  };

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-700';
      case 'SUSPENDED':
        return 'bg-red-100 text-red-700';
      case 'PENDING_VERIFICATION':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 text-sm">Manage all registered users</p>
        </div>
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
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <div>
            <p className="text-red-700 font-medium">Error loading users</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">×</button>
        </div>
      )}

      {/* Users Table */}
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
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Organizations</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Joined</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold uppercase shrink-0">
                          {(user.firstName || user.email || 'U').charAt(0)}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {user.organizations && user.organizations.length > 0 ? (
                          user.organizations.slice(0, 2).map((org) => (
                            <span 
                              key={org.id}
                              className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-full"
                            >
                              {org.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400 text-sm">No organizations</span>
                        )}
                        {user.organizations && user.organizations.length > 2 && (
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                            +{user.organizations.length - 2} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(user.status)}`}>
                        {user.status || 'ACTIVE'}
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
                        
                        {user.status?.toUpperCase() === 'ACTIVE' ? (
                          <button 
                            onClick={() => handleSuspend(user.id)}
                            disabled={processingId === user.id}
                            className="p-2 text-gray-400 hover:bg-red-50 rounded-lg hover:text-red-600 transition-colors disabled:opacity-50"
                            title="Suspend User"
                          >
                            {processingId === user.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Ban className="w-4 h-4" />
                            )}
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleActivate(user.id)}
                            disabled={processingId === user.id}
                            className="p-2 text-gray-400 hover:bg-green-50 rounded-lg hover:text-green-600 transition-colors disabled:opacity-50"
                            title="Activate User"
                          >
                            {processingId === user.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                          </button>
                        )}
                        
                        <button 
                          onClick={() => handleDelete(user.id)}
                          disabled={processingId === user.id}
                          className="p-2 text-gray-400 hover:bg-red-50 rounded-lg hover:text-red-600 transition-colors disabled:opacity-50" 
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                
                {users.length === 0 && !loading && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="text-gray-400">
                        <Search className="w-10 h-10 mx-auto mb-3 opacity-50" />
                        <p className="font-medium">No users found</p>
                        <p className="text-sm">Try adjusting your search</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.total > pagination.limit && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} users
            </p>
            <div className="flex space-x-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="px-3 py-1 text-sm border border-gray-200 rounded-lg disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page * pagination.limit >= pagination.total}
                className="px-3 py-1 text-sm border border-gray-200 rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;