// src/pages/admin/UserManagement.tsx

import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, Ban, Trash2, Mail, CheckCircle, RefreshCw,
  Loader2, AlertCircle, Users,
  UserX, UserCheck, XCircle, ArrowRightLeft
} from 'lucide-react';
import api, { admin } from '../../services/api';
import toast from 'react-hot-toast';

// ============================================
// TYPES
// ============================================
interface Organization {
  id: string;
  name: string;
  role: string;
}

interface User {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  avatar?: string | null;
  status: string;
  emailVerified?: boolean;
  createdAt: string;
  lastLoginAt?: string | null;
  organizations?: Organization[];
}

interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

// Safe string helper
const safeString = (value: string | null | undefined, fallback: string = ''): string => {
  return value ?? fallback;
};

// Get user display name
const getUserDisplayName = (user: User): string => {
  const firstName = safeString(user.firstName);
  const lastName = safeString(user.lastName);

  if (firstName || lastName) {
    return `${firstName} ${lastName}`.trim();
  }
  return user.email?.split('@')[0] || 'Unknown User';
};

// Get user initials
const getUserInitials = (user: User): string => {
  const firstName = safeString(user.firstName);
  const lastName = safeString(user.lastName);

  if (firstName && lastName) {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }
  if (firstName) {
    return firstName.charAt(0).toUpperCase();
  }
  return user.email?.charAt(0).toUpperCase() || 'U';
};

// Format date safely
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A';

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return 'N/A';
  }
};

// Format relative time
const formatRelativeTime = (dateString: string | null | undefined): string => {
  if (!dateString) return 'Never';

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid';

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateString);
  } catch {
    return 'N/A';
  }
};

// ============================================
// STATUS BADGE COMPONENT
// ============================================
interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusConfig = (status: string) => {
    const normalizedStatus = (status || 'UNKNOWN').toUpperCase();

    switch (normalizedStatus) {
      case 'ACTIVE':
        return {
          bg: 'bg-green-100',
          text: 'text-green-700',
          icon: CheckCircle,
          label: 'Active'
        };
      case 'SUSPENDED':
        return {
          bg: 'bg-red-100',
          text: 'text-red-700',
          icon: Ban,
          label: 'Suspended'
        };
      case 'PENDING_VERIFICATION':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-700',
          icon: AlertCircle,
          label: 'Pending'
        };
      case 'INACTIVE':
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-700',
          icon: UserX,
          label: 'Inactive'
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-700',
          icon: Users,
          label: status || 'Unknown'
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </span>
  );
};

// ============================================
// TOAST NOTIFICATION
// ============================================
interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

const ToastNotification: React.FC<{ toast: Toast; onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const bgColor = toast.type === 'success' ? 'bg-green-500' : toast.type === 'error' ? 'bg-red-500' : 'bg-blue-500';

  return (
    <div className={`${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center justify-between min-w-[300px]`}>
      <span>{toast.message}</span>
      <button onClick={() => onDismiss(toast.id)} className="ml-3 hover:opacity-80">
        <XCircle className="w-5 h-5" />
      </button>
    </div>
  );
};

// ============================================
// CONFIRMATION MODAL
// ============================================
interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  confirmColor?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen, title, message, confirmText, confirmColor = 'bg-red-500', onConfirm, onCancel, loading
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex space-x-3 justify-end">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-white rounded-xl hover:opacity-90 transition-colors disabled:opacity-50 flex items-center ${confirmColor}`}
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================
const UserManagement: React.FC = () => {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'suspend' | 'activate' | 'delete';
    user: User | null;
  }>({
    isOpen: false,
    type: 'suspend',
    user: null
  });

  // ✅ ADD DELETE OPTIONS MODAL
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    user: User | null;
    hasOrganizations: boolean;
  }>({
    isOpen: false,
    user: null,
    hasOrganizations: false,
  });

  // Toast helpers
  const addToast = useCallback((type: Toast['type'], message: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, message }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Fetch Users
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await admin.getUsers({
        search: search || undefined,
        page: pagination.page,
        limit: pagination.limit
      });

      console.log('📥 Users Response:', response.data);

      // ✅ Safe data extraction
      const data = response.data?.data || response.data;
      const usersData: User[] = Array.isArray(data)
        ? data
        : (data?.users || data?.items || []);

      const total = response.data?.meta?.total || data?.total || usersData.length;
      const totalPages = response.data?.meta?.totalPages || Math.ceil(total / pagination.limit);

      setUsers(usersData);
      setPagination(prev => ({ ...prev, total, totalPages }));

    } catch (err: any) {
      console.error("❌ Fetch Users Failed:", err);
      const message = err.response?.data?.message || 'Failed to fetch users';
      setError(message);
      addToast('error', message);
    } finally {
      setLoading(false);
    }
  }, [search, pagination.page, pagination.limit, addToast]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchUsers();
    }, 300);

    return () => clearTimeout(debounce);
  }, [fetchUsers]);

  // Handle actions
  const handleAction = async () => {
    const { type, user } = confirmModal;
    if (!user) return;

    setActionLoading(user.id);

    try {
      switch (type) {
        case 'suspend':
          await admin.updateUserStatus(user.id, 'SUSPENDED');
          setUsers(prev => prev.map(u =>
            u.id === user.id ? { ...u, status: 'SUSPENDED' } : u
          ));
          addToast('success', `${getUserDisplayName(user)} has been suspended`);
          break;

        case 'activate':
          await admin.updateUserStatus(user.id, 'ACTIVE');
          setUsers(prev => prev.map(u =>
            u.id === user.id ? { ...u, status: 'ACTIVE' } : u
          ));
          addToast('success', `${getUserDisplayName(user)} has been activated`);
          break;

        case 'delete':
          await admin.deleteUser(user.id);
          setUsers(prev => prev.filter(u => u.id !== user.id));
          addToast('success', `${getUserDisplayName(user)} has been deleted`);
          break;
      }
    } catch (err: any) {
      console.error(`❌ ${type} failed:`, err);
      addToast('error', err.response?.data?.message || `Failed to ${type} user`);
    } finally {
      setActionLoading(null);
      setConfirmModal({ isOpen: false, type: 'suspend', user: null });
    }
  };

  // ✅ UPDATE handleDelete function
  const handleDelete = async (user: User) => {
    try {
      // First, check if user owns any organizations
      const response = await api.get(`/admin/users/${user.id}`);
      const userData = response.data?.data;

      const ownsOrgs = userData?.ownedOrganizations?.length > 0;

      if (ownsOrgs) {
        // Show modal with options
        setDeleteModal({
          isOpen: true,
          user,
          hasOrganizations: true,
        });
      } else {
        // Direct delete (no organizations owned)
        if (confirm(`Delete user ${user.email}?`)) {
          await api.delete(`/admin/users/${user.id}`);
          toast.success('User deleted');
          fetchUsers();
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to check user');
    }
  };

  // ✅ ADD FORCE DELETE FUNCTION
  const handleForceDelete = async () => {
    const user = deleteModal.user;
    if (!user) return;

    try {
      await api.delete(`/admin/users/${user.id}?force=true`);
      toast.success('User and owned organizations deleted');
      setDeleteModal({ isOpen: false, user: null, hasOrganizations: false });
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Delete failed');
    }
  };

  // ✅ ADD AUTO-TRANSFER DELETE FUNCTION
  const handleTransferAndDelete = async () => {
    const user = deleteModal.user;
    if (!user) return;

    try {
      await api.delete(`/admin/users/${user.id}?transferOwnership=true`);
      toast.success('Ownership transferred and user deleted');
      setDeleteModal({ isOpen: false, user: null, hasOrganizations: false });
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Delete failed');
    }
  };

  // Open confirmation modal
  const openConfirmModal = (type: 'suspend' | 'activate' | 'delete', user: User) => {
    setConfirmModal({ isOpen: true, type, user });
  };

  // Get modal config
  const getModalConfig = () => {
    const { type, user } = confirmModal;
    const userName = user ? getUserDisplayName(user) : '';

    switch (type) {
      case 'suspend':
        return {
          title: 'Suspend User',
          message: `Are you sure you want to suspend ${userName}? They will not be able to access their account.`,
          confirmText: 'Suspend',
          confirmColor: 'bg-orange-500 hover:bg-orange-600'
        };
      case 'activate':
        return {
          title: 'Activate User',
          message: `Are you sure you want to activate ${userName}? They will regain access to their account.`,
          confirmText: 'Activate',
          confirmColor: 'bg-green-500 hover:bg-green-600'
        };
      case 'delete':
        return {
          title: 'Delete User',
          message: `Are you sure you want to permanently delete ${userName}? This action cannot be undone.`,
          confirmText: 'Delete',
          confirmColor: 'bg-red-500 hover:bg-red-600'
        };
      default:
        return {
          title: 'Confirm',
          message: 'Are you sure?',
          confirmText: 'Confirm',
          confirmColor: 'bg-primary-500'
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <ToastNotification key={toast.id} toast={toast} onDismiss={removeToast} />
        ))}
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        {...getModalConfig()}
        onConfirm={handleAction}
        onCancel={() => setConfirmModal({ isOpen: false, type: 'suspend', user: null })}
        loading={!!actionLoading}
      />

      {/* ✅ ADD DELETE OPTIONS MODAL (JSX) */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  User Owns Organizations
                </h3>
                <p className="text-sm text-gray-500">
                  {deleteModal.user?.email}
                </p>
              </div>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-6">
              This user owns one or more organizations. Choose how to proceed:
            </p>

            <div className="space-y-3">
              {/* Option 1: Transfer Ownership */}
              <button
                onClick={handleTransferAndDelete}
                className="w-full flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
              >
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center shrink-0">
                  <ArrowRightLeft className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 dark:text-white">
                    Transfer Ownership
                  </div>
                  <div className="text-sm text-gray-500">
                    Auto-transfer to first admin, then delete user
                  </div>
                </div>
              </button>

              {/* Option 2: Force Delete */}
              <button
                onClick={handleForceDelete}
                className="w-full flex items-center gap-3 p-4 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
              >
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-red-600">
                    Force Delete
                  </div>
                  <div className="text-sm text-gray-500">
                    Delete user and all owned organizations
                  </div>
                </div>
              </button>

              {/* Cancel */}
              <button
                onClick={() => setDeleteModal({ isOpen: false, user: null, hasOrganizations: false })}
                className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 text-sm mt-1">
            {pagination.total > 0
              ? `${pagination.total.toLocaleString()} registered users`
              : 'Manage all registered users'
            }
          </p>
        </div>
        <div className="flex space-x-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              className="w-full sm:w-64 pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
            />
          </div>
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-700 font-medium">Error loading users</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-600 p-1"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        {loading && users.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-64">
            <Loader2 className="w-10 h-10 text-primary-500 animate-spin mb-4" />
            <p className="text-gray-500">Loading users...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Organizations
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Last Active
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => {
                  const isProcessing = actionLoading === user.id;
                  const userStatus = (user.status || 'ACTIVE').toUpperCase();
                  const organizations = user.organizations || [];

                  return (
                    <tr
                      key={user.id}
                      className={`hover:bg-gray-50 transition-colors ${isProcessing ? 'opacity-50' : ''}`}
                    >
                      {/* User Column */}
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                            {getUserInitials(user)}
                          </div>
                          <div className="ml-3 min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {getUserDisplayName(user)}
                            </div>
                            <div className="text-sm text-gray-500 truncate">
                              {user.email || 'No email'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Organizations Column */}
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {organizations.length > 0 ? (
                            <>
                              {organizations.slice(0, 2).map((org) => (
                                <span
                                  key={org.id}
                                  className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-full truncate max-w-[120px]"
                                  title={org.name}
                                >
                                  {org.name || 'Unnamed'}
                                </span>
                              ))}
                              {organizations.length > 2 && (
                                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                                  +{organizations.length - 2}
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-gray-400 text-sm italic">No organizations</span>
                          )}
                        </div>
                      </td>

                      {/* Status Column */}
                      <td className="px-6 py-4">
                        <StatusBadge status={user.status} />
                      </td>

                      {/* Joined Column */}
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(user.createdAt)}
                      </td>

                      {/* Last Active Column */}
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatRelativeTime(user.lastLoginAt)}
                      </td>

                      {/* Actions Column */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          {/* Email Button */}
                          <a
                            href={`mailto:${user.email}`}
                            className="p-2 text-gray-400 hover:bg-blue-50 rounded-lg hover:text-blue-600 transition-colors"
                            title="Email User"
                          >
                            <Mail className="w-4 h-4" />
                          </a>

                          {/* Suspend/Activate Button */}
                          {userStatus === 'ACTIVE' ? (
                            <button
                              onClick={() => openConfirmModal('suspend', user)}
                              disabled={isProcessing}
                              className="p-2 text-gray-400 hover:bg-orange-50 rounded-lg hover:text-orange-600 transition-colors disabled:opacity-50"
                              title="Suspend User"
                            >
                              {isProcessing ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Ban className="w-4 h-4" />
                              )}
                            </button>
                          ) : (
                            <button
                              onClick={() => openConfirmModal('activate', user)}
                              disabled={isProcessing}
                              className="p-2 text-gray-400 hover:bg-green-50 rounded-lg hover:text-green-600 transition-colors disabled:opacity-50"
                              title="Activate User"
                            >
                              {isProcessing ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <UserCheck className="w-4 h-4" />
                              )}
                            </button>
                          )}

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDelete(user)}
                            disabled={isProcessing}
                            className="p-2 text-gray-400 hover:bg-red-50 rounded-lg hover:text-red-600 transition-colors disabled:opacity-50"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {/* Empty State */}
                {users.length === 0 && !loading && (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="text-gray-400">
                        <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="font-medium text-gray-600">No users found</p>
                        <p className="text-sm mt-1">
                          {search
                            ? 'Try adjusting your search criteria'
                            : 'Users will appear here once they register'
                          }
                        </p>
                        {search && (
                          <button
                            onClick={() => setSearch('')}
                            className="mt-4 text-primary-600 hover:text-primary-700 text-sm font-medium"
                          >
                            Clear search
                          </button>
                        )}
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
          <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              Showing{' '}
              <span className="font-medium text-gray-700">
                {((pagination.page - 1) * pagination.limit) + 1}
              </span>{' '}
              to{' '}
              <span className="font-medium text-gray-700">
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span>{' '}
              of{' '}
              <span className="font-medium text-gray-700">
                {pagination.total.toLocaleString()}
              </span>{' '}
              users
            </p>
            <div className="flex space-x-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: 1 }))}
                disabled={pagination.page === 1 || loading}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                First
              </button>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1 || loading}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="px-3 py-1.5 text-sm text-gray-600">
                Page {pagination.page} of {pagination.totalPages || 1}
              </span>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page >= pagination.totalPages || loading}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: pagination.totalPages }))}
                disabled={pagination.page >= pagination.totalPages || loading}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Last
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;