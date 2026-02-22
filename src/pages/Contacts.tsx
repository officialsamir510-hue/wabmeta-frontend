// 📁 src/pages/Contacts.tsx - COMPLETE WITH WHATSAPP PROFILE STATUS

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Upload,
  Download,
  Users,
  UserCheck,
  UserX,
  Clock,
  RefreshCw,
  AlertCircle,
  Loader2,
  CheckCircle,
  MessageCircle,
  Search,
  MoreVertical,
  Edit2,
  Trash2,
  Mail,
  Tag,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  Square,
  AlertTriangle,
} from 'lucide-react';

import AddContactModal from '../components/contacts/AddContactModal';
import ImportUploader from '../components/contacts/ImportUploader';
import api from '../services/api';
import { useApp } from '../context/AppContext';
import { formatPhoneForDisplay, validateIndianPhone } from '../utils/csvContacts';

// ============================================
// TYPES
// ============================================

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  company: string;
  address: string;
  status: 'active' | 'inactive' | 'pending';
  tags: string[];
  notes: string;
  lastContacted: string;
  createdAt: string;
  // WhatsApp Profile Fields
  whatsappProfileFetched: boolean;
  whatsappProfileName: string | null;
  lastProfileFetchAt: string | null;
  profileFetchAttempts: number;
}

interface ContactsMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ContactStatsApi {
  total: number;
  active: number;
  blocked: number;
  unsubscribed: number;
  recentlyAdded: number;
  withMessages: number;
  whatsappVerified: number;
  pendingVerification: number;
}

// ============================================
// WHATSAPP STATUS BADGE COMPONENT
// ============================================

const WhatsAppStatusBadge: React.FC<{
  fetched: boolean;
  profileName: string | null;
  attempts: number;
}> = ({ fetched, profileName, attempts }) => {
  if (fetched && profileName) {
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircle className="w-3 h-3 mr-1" />
        WhatsApp Verified
      </span>
    );
  }

  if (attempts > 0 && !fetched) {
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
        <AlertTriangle className="w-3 h-3 mr-1" />
        Verification Failed
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
      <Clock className="w-3 h-3 mr-1" />
      Pending Verification
    </span>
  );
};

// ============================================
// CONTACT STATUS BADGE COMPONENT
// ============================================

const ContactStatusBadge: React.FC<{ status: Contact['status'] }> = ({ status }) => {
  const styles = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-red-100 text-red-800',
    pending: 'bg-yellow-100 text-yellow-800',
  };

  const labels = {
    active: 'Active',
    inactive: 'Inactive',
    pending: 'Pending',
  };

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
};

// ============================================
// CONTACT ROW COMPONENT
// ============================================

const ContactRow: React.FC<{
  contact: Contact;
  selected: boolean;
  onSelect: (id: string) => void;
  onEdit: (contact: Contact) => void;
  onDelete: (id: string) => void;
  onRefreshProfile: (id: string) => void;
}> = ({ contact, selected, onSelect, onEdit, onDelete, onRefreshProfile }) => {
  const [showMenu, setShowMenu] = useState(false);

  const displayName = contact.whatsappProfileName ||
    `${contact.firstName} ${contact.lastName}`.trim() ||
    'Unknown';

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      {/* Checkbox */}
      <td className="px-4 py-3">
        <button onClick={() => onSelect(contact.id)}>
          {selected ? (
            <CheckSquare className="w-5 h-5 text-primary-600" />
          ) : (
            <Square className="w-5 h-5 text-gray-400" />
          )}
        </button>
      </td>

      {/* Contact Info */}
      <td className="px-4 py-3">
        <div className="flex items-center space-x-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold">
            {displayName.charAt(0).toUpperCase()}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium text-gray-900">{displayName}</p>
              {contact.whatsappProfileName && contact.whatsappProfileName !== contact.firstName && (
                <span className="text-xs text-gray-400">
                  (was: {contact.firstName})
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 font-mono">
              {formatPhoneForDisplay(contact.phone)}
            </p>
          </div>
        </div>
      </td>

      {/* Email */}
      <td className="px-4 py-3">
        {contact.email ? (
          <div className="flex items-center text-sm text-gray-600">
            <Mail className="w-4 h-4 mr-1 text-gray-400" />
            {contact.email}
          </div>
        ) : (
          <span className="text-gray-400 text-sm">—</span>
        )}
      </td>

      {/* WhatsApp Status */}
      <td className="px-4 py-3">
        <WhatsAppStatusBadge
          fetched={contact.whatsappProfileFetched}
          profileName={contact.whatsappProfileName}
          attempts={contact.profileFetchAttempts}
        />
      </td>

      {/* Contact Status */}
      <td className="px-4 py-3">
        <ContactStatusBadge status={contact.status} />
      </td>

      {/* Tags */}
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1">
          {contact.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-primary-100 text-primary-700"
            >
              <Tag className="w-3 h-3 mr-1" />
              {tag}
            </span>
          ))}
          {contact.tags.length > 2 && (
            <span className="text-xs text-gray-400">
              +{contact.tags.length - 2}
            </span>
          )}
        </div>
      </td>

      {/* Last Contacted */}
      <td className="px-4 py-3">
        <div className="flex items-center text-sm text-gray-500">
          <Calendar className="w-4 h-4 mr-1" />
          {contact.lastContacted}
        </div>
      </td>

      {/* Actions */}
      <td className="px-4 py-3 relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <MoreVertical className="w-4 h-4 text-gray-500" />
        </button>

        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-200 z-20">
              <button
                onClick={() => {
                  onEdit(contact);
                  setShowMenu(false);
                }}
                className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit Contact
              </button>

              {!contact.whatsappProfileFetched && (
                <button
                  onClick={() => {
                    onRefreshProfile(contact.id);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Verify WhatsApp
                </button>
              )}

              <Link
                to={`/dashboard/inbox?contact=${contact.phone}`}
                className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Send Message
              </Link>

              <hr className="my-1" />

              <button
                onClick={() => {
                  onDelete(contact.id);
                  setShowMenu(false);
                }}
                className="w-full flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </button>
            </div>
          </>
        )}
      </td>
    </tr>
  );
};

// ============================================
// MAIN CONTACTS PAGE COMPONENT
// ============================================

const Contacts: React.FC = () => {
  const navigate = useNavigate();
  const { refreshStats } = useApp();

  // State
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [meta, setMeta] = useState<ContactsMeta>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
  const [statsApi, setStatsApi] = useState<ContactStatsApi | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [, setRefreshingProfile] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [whatsappFilter, setWhatsappFilter] = useState<string>('all');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // ============================================
  // DATA FETCHING
  // ============================================

  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const res = await api.get('/contacts/stats');
      setStatsApi(res.data?.data || null);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      };

      if (searchQuery) params.search = searchQuery;
      if (statusFilter !== 'all') params.status = statusFilter.toUpperCase();
      if (whatsappFilter !== 'all') {
        params.whatsappProfileFetched = whatsappFilter === 'verified';
      }

      const res = await api.get('/contacts', { params });

      const contactsData = Array.isArray(res.data?.data) ? res.data.data : [];
      const metaData = res.data?.meta;

      if (metaData) {
        setMeta({
          page: metaData.page,
          limit: metaData.limit,
          total: metaData.total,
          totalPages: metaData.totalPages,
        });
      }

      const mappedContacts: Contact[] = contactsData.map((contact: any) => {
        const cf = contact.customFields || {};
        const backendStatus = String(contact.status || 'ACTIVE').toUpperCase();

        let uiStatus: Contact['status'] = 'active';
        if (backendStatus === 'BLOCKED' || backendStatus === 'INACTIVE') {
          uiStatus = 'inactive';
        } else if (backendStatus === 'UNSUBSCRIBED') {
          uiStatus = 'pending';
        }

        const phoneDisplay =
          contact.fullPhone ||
          (contact.countryCode ? `${contact.countryCode}${contact.phone}` : contact.phone) ||
          '';

        return {
          id: contact.id,
          firstName: contact.firstName || '',
          lastName: contact.lastName || '',
          phone: phoneDisplay,
          email: contact.email || '',
          company: cf.company || '',
          address: cf.address || '',
          notes: cf.notes || '',
          status: uiStatus,
          tags: Array.isArray(contact.tags) ? contact.tags : [],
          lastContacted: contact.lastMessageAt
            ? new Date(contact.lastMessageAt).toLocaleDateString()
            : 'Never',
          createdAt: contact.createdAt || new Date().toISOString(),
          // WhatsApp Profile
          whatsappProfileFetched: contact.whatsappProfileFetched || false,
          whatsappProfileName: contact.whatsappProfileName || null,
          lastProfileFetchAt: contact.lastProfileFetchAt || null,
          profileFetchAttempts: contact.profileFetchAttempts || 0,
        };
      });

      setContacts(mappedContacts);
      setSelectedContacts([]);
    } catch (err: any) {
      console.error('Error fetching contacts:', err);
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Failed to load contacts'
      );
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, statusFilter, whatsappFilter]);

  const fetchAll = useCallback(async () => {
    await Promise.allSettled([fetchStats(), fetchContacts()]);
    refreshStats();
  }, [fetchStats, fetchContacts, refreshStats]);

  // Initial load
  useEffect(() => {
    const token =
      localStorage.getItem('accessToken') ||
      localStorage.getItem('token') ||
      localStorage.getItem('wabmeta_token');

    if (!token) {
      navigate('/login');
      return;
    }

    fetchAll();
  }, [navigate, fetchAll]);

  // Refetch on filter changes
  useEffect(() => {
    fetchContacts();
  }, [currentPage, searchQuery, statusFilter, whatsappFilter, fetchContacts]);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, whatsappFilter]);

  // ============================================
  // HANDLERS
  // ============================================

  const handleSelectContact = (id: string) => {
    setSelectedContacts((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedContacts.length === contacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(contacts.map((c) => c.id));
    }
  };

  const handleSaveContact = async (contactData: any) => {
    try {
      // Validate Indian phone
      if (!validateIndianPhone(contactData.phone)) {
        throw new Error('Only Indian phone numbers (+91) starting with 6-9 are allowed');
      }

      const payload: any = {
        firstName: contactData.firstName || null,
        lastName: contactData.lastName || null,
        email: contactData.email || null,
        tags: contactData.tags || [],
        phone: String(contactData.phone || '').replace(/\D/g, ''),
        countryCode: '+91',
        customFields: {
          company: contactData.company || '',
          address: contactData.address || '',
          notes: contactData.notes || '',
        },
      };

      if (editingContact) {
        await api.put(`/contacts/${editingContact.id}`, payload);
      } else {
        await api.post('/contacts', payload);
      }

      await fetchAll();
      setShowAddModal(false);
      setEditingContact(null);
    } catch (err: any) {
      throw new Error(
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Failed to save contact'
      );
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) return;

    try {
      await api.delete(`/contacts/${id}`);
      await fetchAll();
    } catch (err: any) {
      alert(
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Failed to delete contact'
      );
    }
  };

  const handleRefreshProfile = async (id: string) => {
    setRefreshingProfile(id);
    try {
      await api.post(`/contacts/${id}/refresh-profile`);
      await fetchContacts();
    } catch (err: any) {
      alert(
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Failed to refresh profile'
      );
    } finally {
      setRefreshingProfile(null);
    }
  };

  const handleBulkRefreshProfiles = async () => {
    if (selectedContacts.length === 0) return;

    try {
      await api.post('/contacts/refresh-profiles/batch', {
        contactIds: selectedContacts,
      });
      await fetchContacts();
      setSelectedContacts([]);
    } catch (err: any) {
      alert(
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Failed to refresh profiles'
      );
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedContacts.length === 0) return;

    try {
      if (action === 'delete') {
        if (!window.confirm(`Delete ${selectedContacts.length} contacts?`)) return;

        await api.delete('/contacts/bulk', {
          data: { contactIds: selectedContacts },
        });
        await fetchAll();
        setSelectedContacts([]);
      } else if (action === 'refresh-profiles') {
        await handleBulkRefreshProfiles();
      }
    } catch (err: any) {
      alert(
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Bulk action failed'
      );
    }
  };

  const handleImport = async (contacts: any[], groupData?: { id?: string; name?: string }) => {
    try {
      // Now sends group info along with contacts
      const res = await api.post('/contacts/import', {
        contacts,
        groupId: groupData?.id,
        groupName: groupData?.name,
        skipDuplicates: true,
        validateWhatsApp: true,
      });

      const result = res.data?.data;
      alert(
        `✅ Import Complete!\n` +
        `Imported: ${result?.imported || 0}\n` +
        `Duplicates Skipped: ${result?.skipped || 0}\n` +
        `Added to Group: ${result?.addedToGroup || 0}`
      );

      await fetchAll();
      setShowImportModal(false);
    } catch (err: any) {
      throw new Error(
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Import failed'
      );
    }
  };

  const handleExport = async () => {
    try {
      const res = await api.get('/contacts/export', { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `contacts_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();

      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert('Export failed');
    }
  };

  // ============================================
  // STATS COMPUTATION
  // ============================================

  const stats = useMemo(() => {
    const total = statsApi?.total ?? meta.total ?? 0;
    const active = statsApi?.active ?? 0;
    const inactive = (statsApi?.blocked ?? 0) + (statsApi?.unsubscribed ?? 0);
    const verified = statsApi?.whatsappVerified ?? 0;

    return [
      {
        label: 'Total Contacts',
        value: loadingStats ? '...' : total.toLocaleString(),
        icon: Users,
        color: 'bg-blue-100 text-blue-600',
      },
      {
        label: 'Active',
        value: loadingStats ? '...' : active.toLocaleString(),
        icon: UserCheck,
        color: 'bg-green-100 text-green-600',
      },
      {
        label: 'WhatsApp Verified',
        value: loadingStats ? '...' : verified.toLocaleString(),
        icon: CheckCircle,
        color: 'bg-emerald-100 text-emerald-600',
      },
      {
        label: 'Inactive',
        value: loadingStats ? '...' : inactive.toLocaleString(),
        icon: UserX,
        color: 'bg-red-100 text-red-600',
      },
    ];
  }, [statsApi, meta.total, loadingStats]);

  // ============================================
  // RENDER
  // ============================================

  if (loading && contacts.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
      </div>
    );
  }

  const totalPages = meta.totalPages || 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
          <p className="text-gray-500 mt-1">
            Manage your contact list
            <span className="text-gray-400 ml-1">
              (Showing {contacts.length} of {meta.total.toLocaleString()})
            </span>
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchAll}
            className="p-2.5 bg-gray-100 rounded-xl hover:bg-gray-200 text-gray-700 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center space-x-2 px-4 py-2.5 bg-gray-100 rounded-xl hover:bg-gray-200 text-gray-700 font-medium transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Import</span>
          </button>

          <button
            onClick={handleExport}
            className="flex items-center space-x-2 px-4 py-2.5 bg-gray-100 rounded-xl hover:bg-gray-200 text-gray-700 font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>

          <button
            onClick={() => {
              setEditingContact(null);
              setShowAddModal(true);
            }}
            className="flex items-center space-x-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Contact</span>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-3 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="flex-1">{error}</p>
          <button onClick={fetchAll} className="underline font-medium">
            Retry
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stat.value}
                </p>
              </div>
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}
              >
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, phone, or email..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
            <option value="unsubscribed">Unsubscribed</option>
          </select>

          {/* WhatsApp Filter */}
          <select
            value={whatsappFilter}
            onChange={(e) => setWhatsappFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All WhatsApp</option>
            <option value="verified">Verified</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedContacts.length > 0 && (
        <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CheckSquare className="w-5 h-5 text-primary-600" />
            <span className="font-medium text-primary-900">
              {selectedContacts.length} contact(s) selected
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleBulkRefreshProfiles}
              className="px-3 py-1.5 bg-white border border-primary-300 text-primary-700 rounded-lg hover:bg-primary-100 text-sm font-medium transition-colors"
            >
              <RefreshCw className="w-4 h-4 inline mr-1" />
              Verify WhatsApp
            </button>
            <button
              onClick={() => handleBulkAction('delete')}
              className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm font-medium transition-colors"
            >
              <Trash2 className="w-4 h-4 inline mr-1" />
              Delete
            </button>
            <button
              onClick={() => setSelectedContacts([])}
              className="px-3 py-1.5 text-gray-600 hover:text-gray-900 text-sm"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {meta.total === 0 && !error && !loading && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">No Contacts Yet</h3>
          <p className="text-gray-500 mt-2 mb-6">
            Add your first contact to get started with WhatsApp messaging.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors"
            >
              <Plus className="w-4 h-4 inline mr-1" />
              Add Contact
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
            >
              <Upload className="w-4 h-4 inline mr-1" />
              Import CSV
            </button>
          </div>
        </div>
      )}

      {/* Contacts Table */}
      {contacts.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 w-10">
                    <button onClick={handleSelectAll}>
                      {selectedContacts.length === contacts.length ? (
                        <CheckSquare className="w-5 h-5 text-primary-600" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    WhatsApp
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Tags
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Last Contact
                  </th>
                  <th className="px-4 py-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {contacts.map((contact) => (
                  <ContactRow
                    key={contact.id}
                    contact={contact}
                    selected={selectedContacts.includes(contact.id)}
                    onSelect={handleSelectContact}
                    onEdit={(c) => {
                      setEditingContact(c);
                      setShowAddModal(true);
                    }}
                    onDelete={handleDeleteContact}
                    onRefreshProfile={handleRefreshProfile}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200">
          <span className="text-sm text-gray-500">
            Page {meta.page} of {totalPages} • {meta.total.toLocaleString()} total contacts
          </span>
          <div className="flex gap-2">
            <button
              disabled={meta.page === 1}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className="flex items-center px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </button>
            <button
              disabled={meta.page === totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              className="flex items-center px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit Contact Modal */}
      <AddContactModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingContact(null);
        }}
        onSave={handleSaveContact}
        editContact={editingContact}
      />

      {/* Import Modal */}
      <ImportUploader
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImport}
      />
    </div>
  );
};

export default Contacts;