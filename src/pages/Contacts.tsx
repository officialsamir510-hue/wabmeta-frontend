import React, { useState, useEffect } from 'react';
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
  Loader2
} from 'lucide-react';
import ContactFilters from '../components/contacts/ContactFilters';
import ContactsTable from '../components/contacts/ContactsTable';
import BulkActions from '../components/contacts/BulkActions';
import AddContactModal from '../components/contacts/AddContactModal';
import api from '../services/api';
import { useApp } from '../context/AppContext';

// ✅ UI Contact Interface (keep id:number for your table)
// ✅ add apiId for backend
interface Contact {
  id: number;              // UI id (for selection/table)
  apiId: string;           // backend Contact.id (cuid)
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
}

const Contacts: React.FC = () => {
  const navigate = useNavigate();
  const { refreshStats } = useApp();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ✅ Token check
  useEffect(() => {
    const token =
      localStorage.getItem('accessToken') ||
      localStorage.getItem('token') ||
      localStorage.getItem('wabmeta_token');

    if (!token) {
      navigate('/login');
      return;
    }
    fetchContacts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  // ✅ Fetch Real Data from API
  const fetchContacts = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get('/contacts'); // baseURL already /api/v1

      // ✅ Correct: backend returns contacts array in response.data.data
      const contactsData = Array.isArray(response.data?.data) ? response.data.data : [];

      const mappedContacts: Contact[] = contactsData.map((contact: any, index: number) => {
        const cf = contact.customFields || {};

        // Backend status: ACTIVE | BLOCKED | UNSUBSCRIBED
        const uiStatus: Contact['status'] =
          String(contact.status || 'ACTIVE').toUpperCase() === 'ACTIVE' ? 'active' : 'inactive';

        return {
          id: index + 1,
          apiId: contact.id, // cuid string

          firstName: contact.firstName || '',
          lastName: contact.lastName || '',
          phone: contact.phone || '',
          email: contact.email || '',

          company: cf.company || '',
          address: cf.address || '',
          notes: cf.notes || '',

          status: uiStatus,
          tags: Array.isArray(contact.tags) ? contact.tags : [],

          lastContacted: contact.lastMessageAt ? new Date(contact.lastMessageAt).toLocaleString() : 'Never',
          createdAt: contact.createdAt || new Date().toISOString(),
        };
      });

      setContacts(mappedContacts);
      refreshStats();
    } catch (err: any) {
      console.error('Error fetching contacts:', err);
      setError(err.response?.data?.message || 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  // Stats calculation based on REAL data
  const stats = [
    { label: 'Total Contacts', value: contacts.length, icon: Users, color: 'bg-blue-100 text-blue-600' },
    { label: 'Active', value: contacts.filter(c => c.status === 'active').length, icon: UserCheck, color: 'bg-green-100 text-green-600' },
    { label: 'Inactive', value: contacts.filter(c => c.status === 'inactive').length, icon: UserX, color: 'bg-red-100 text-red-600' },
    { label: 'Pending', value: contacts.filter(c => c.status === 'pending').length, icon: Clock, color: 'bg-yellow-100 text-yellow-600' },
  ];

  // Filter Logic
  const filteredContacts = contacts.filter(contact => {
    const searchLower = searchQuery.toLowerCase();
    return (
      contact.firstName.toLowerCase().includes(searchLower) ||
      contact.lastName.toLowerCase().includes(searchLower) ||
      contact.email.toLowerCase().includes(searchLower) ||
      contact.phone.includes(searchQuery) ||
      contact.company.toLowerCase().includes(searchLower)
    );
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredContacts.length / itemsPerPage);
  const paginatedContacts = filteredContacts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleSelectContact = (id: number) => {
    setSelectedContacts(prev =>
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedContacts.length === paginatedContacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(paginatedContacts.map(c => c.id));
    }
  };

  // ✅ Create/Update contact (backend compatible)
  const handleSaveContact = async (contactData: Partial<Contact>) => {
    try {
      const payload: any = {
        firstName: contactData.firstName || '',
        lastName: contactData.lastName || '',
        email: contactData.email || null,
        tags: contactData.tags || [],
        // backend expects digits only phone; we keep same UI
        phone: (contactData.phone || '').replace(/\D/g, ''),
        countryCode: '+91',
        customFields: {
          company: contactData.company || '',
          address: contactData.address || '',
          notes: contactData.notes || '',
        }
      };

      if (editingContact) {
        await api.put(`/contacts/${editingContact.apiId}`, payload);
      } else {
        await api.post('/contacts', payload);
      }

      await fetchContacts();
      setShowAddModal(false);
      setEditingContact(null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save contact');
    }
  };

  // ✅ Delete contact
  const handleDeleteContact = async (id: number) => {
    if (!window.confirm('Are you sure?')) return;

    const contact = contacts.find(c => c.id === id);
    if (!contact) return;

    try {
      await api.delete(`/contacts/${contact.apiId}`);
      await fetchContacts();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete contact');
    }
  };

  // ✅ Bulk delete (backend expects { contactIds: [] })
  const handleBulkAction = async (action: string) => {
    if (selectedContacts.length === 0) return;

    try {
      if (action === 'delete') {
        if (!window.confirm(`Delete ${selectedContacts.length} contacts?`)) return;

        const realIds = selectedContacts
          .map(id => contacts.find(c => c.id === id)?.apiId)
          .filter(Boolean);

        await api.delete('/contacts/bulk', { data: { contactIds: realIds } });
        await fetchContacts();
        setSelectedContacts([]);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Bulk action failed');
    }
  };

  // Export CSV (simple)
  const handleExportAll = () => {
    const headers = ['Name', 'Phone', 'Email', 'Company', 'Status'];
    const rows = contacts.map(c => [
      `${c.firstName} ${c.lastName}`.trim(),
      c.phone,
      c.email,
      c.company,
      c.status
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contacts.csv';
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
          <p className="text-gray-500 mt-1">Manage your contact list</p>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={fetchContacts} className="p-2.5 bg-gray-100 rounded-xl hover:bg-gray-200 text-gray-700">
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link to="/dashboard/contacts/import" className="flex items-center space-x-2 px-4 py-2.5 bg-gray-100 rounded-xl hover:bg-gray-200 text-gray-700 font-medium">
            <Upload className="w-4 h-4" />
            <span>Import</span>
          </Link>
          <button onClick={handleExportAll} className="flex items-center space-x-2 px-4 py-2.5 bg-gray-100 rounded-xl hover:bg-gray-200 text-gray-700 font-medium">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button onClick={() => { setEditingContact(null); setShowAddModal(true); }} className="flex items-center space-x-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl">
            <Plus className="w-4 h-4" />
            <span>Add Contact</span>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-3 text-red-700">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
          <button onClick={fetchContacts} className="underline ml-auto">Retry</button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <ContactFilters searchQuery={searchQuery} onSearchChange={setSearchQuery} onFilterChange={() => {}} />

      {/* Bulk Actions */}
      {selectedContacts.length > 0 && (
        <BulkActions
          selectedCount={selectedContacts.length}
          onClearSelection={() => setSelectedContacts([])}
          onBulkAction={handleBulkAction}
        />
      )}

      {/* Empty State */}
      {contacts.length === 0 && !loading && !error && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">No Contacts Yet</h3>
          <p className="text-gray-500 mb-6">Add your first contact to get started.</p>
          <button onClick={() => setShowAddModal(true)} className="px-4 py-2 bg-primary-500 text-white rounded-xl">
            Add Contact
          </button>
        </div>
      )}

      {/* Table */}
      {contacts.length > 0 && (
        <ContactsTable
          contacts={paginatedContacts}
          selectedContacts={selectedContacts}
          onSelectContact={handleSelectContact}
          onSelectAll={handleSelectAll}
          onEdit={(c) => { setEditingContact(c); setShowAddModal(true); }}
          onDelete={handleDeleteContact}
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200">
          <span className="text-sm text-gray-500">Page {currentPage} of {totalPages}</span>
          <div className="flex gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
            >
              Prev
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      <AddContactModal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); setEditingContact(null); }}
        onSave={handleSaveContact}
        editContact={editingContact}
      />
    </div>
  );
};

export default Contacts;