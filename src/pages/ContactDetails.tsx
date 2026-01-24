import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  MapPin,
  Tag,
  MessageSquare,
  Clock,
  Calendar,
  Edit,
  Trash2,
  Send,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { contacts as contactApi } from '../services/api';

const ContactDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'messages' | 'activity'>('overview');
  const [contact, setContact] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch Contact Details
  useEffect(() => {
    const fetchContact = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Try getting by ID first if endpoint exists, otherwise filter from all
        let foundContact = null;

        try {
          // If your backend supports GET /contacts/:id
          const { data } = await contactApi.getById(id!);
          foundContact = data.contact || data;
        } catch (e) {
          // Fallback: Fetch all and find
          console.warn("getById failed, fetching all contacts to find match");
          const { data } = await contactApi.getAll();
          const allContacts = data.contacts || data || [];
          foundContact = allContacts.find((c: any) => c._id === id || c.id === id);
        }

        if (foundContact) {
          // Transform data for UI
          const fullName = foundContact.name || 
                          `${foundContact.firstName || ''} ${foundContact.lastName || ''}`.trim() || 
                          'Unknown Contact';
          
          setContact({
            ...foundContact,
            name: fullName,
            firstName: fullName.split(' ')[0],
            lastName: fullName.split(' ').slice(1).join(' '),
            initials: fullName.substring(0, 2).toUpperCase(),
            phone: foundContact.phone || 'N/A',
            email: foundContact.email || 'N/A',
            company: foundContact.company || 'N/A',
            address: foundContact.address || 'N/A',
            status: foundContact.status || 'active',
            tags: foundContact.tags || [],
            notes: foundContact.notes || '',
            totalMessages: foundContact.stats?.messagesSent || 0,
            campaigns: foundContact.stats?.campaigns || 0,
            lastContacted: foundContact.lastContacted || 'Never',
            createdAt: foundContact.createdAt || new Date().toISOString()
          });
        } else {
          setError('Contact not found');
        }
      } catch (err: any) {
        console.error("Error fetching contact details:", err);
        setError('Failed to load contact details');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchContact();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this contact?')) return;
    
    try {
      await contactApi.delete(id!);
      navigate('/dashboard/contacts');
    } catch (err) {
      alert('Failed to delete contact');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading contact details...</p>
        </div>
      </div>
    );
  }

  if (error || !contact) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Contact Not Found</h3>
        <p className="text-gray-500 mb-6">{error || "The contact you're looking for doesn't exist."}</p>
        <button
          onClick={() => navigate('/dashboard/contacts')}
          className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors"
        >
          Back to Contacts
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/dashboard/contacts')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-linear-to-br from-primary-500 to-whatsapp-teal rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg">
              {contact.initials}
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold text-gray-900">{contact.name}</h1>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                  contact.status === 'active' ? 'bg-green-100 text-green-700' : 
                  contact.status === 'inactive' ? 'bg-red-100 text-red-700' : 
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {contact.status}
                </span>
              </div>
              <p className="text-gray-500 flex items-center mt-1">
                <Building2 className="w-4 h-4 mr-1.5" />
                {contact.company}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors shadow-sm">
            <Send className="w-4 h-4" />
            <span>Send Message</span>
          </button>
          <button className="p-2 hover:bg-gray-100 text-gray-600 rounded-xl transition-colors border border-gray-200">
            <Edit className="w-5 h-5" />
          </button>
          <button 
            onClick={handleDelete}
            className="p-2 hover:bg-red-50 text-red-600 rounded-xl transition-colors border border-red-100"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Messages', value: contact.totalMessages, icon: MessageSquare, color: 'text-blue-600', bg: 'bg-blue-100' },
          { label: 'Campaigns', value: contact.campaigns, icon: Send, color: 'text-purple-600', bg: 'bg-purple-100' },
          { label: 'Last Contacted', value: contact.lastContacted, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-100' },
          { label: 'Added On', value: new Date(contact.createdAt).toLocaleDateString(), icon: Calendar, color: 'text-green-600', bg: 'bg-green-100' },
        ].map((stat, index) => (
          <div key={index} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="flex border-b border-gray-200">
              {['overview', 'messages', 'activity'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition-colors capitalize ${
                    activeTab === tab
                      ? 'text-primary-600 bg-primary-50 border-b-2 border-primary-500'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="p-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Contact Information</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                          <Phone className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500 font-medium uppercase">Phone</p>
                            <p className="text-gray-900 font-medium">{contact.phone}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                          <Mail className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500 font-medium uppercase">Email</p>
                            <p className="text-gray-900 font-medium">{contact.email}</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                          <Building2 className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500 font-medium uppercase">Company</p>
                            <p className="text-gray-900 font-medium">{contact.company}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                          <MapPin className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500 font-medium uppercase">Address</p>
                            <p className="text-gray-900 font-medium">{contact.address}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Notes</h3>
                    <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4">
                      <p className="text-yellow-800 text-sm">
                        {contact.notes || 'No notes added yet.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'messages' && (
                <div className="text-center py-12 text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Message history coming soon.</p>
                </div>
              )}

              {activeTab === 'activity' && (
                <div className="text-center py-12 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Activity log coming soon.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Tags */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Tags</h3>
              <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">Edit</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {contact.tags && contact.tags.length > 0 ? (
                contact.tags.map((tag: string) => (
                  <span key={tag} className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </span>
                ))
              ) : (
                <p className="text-sm text-gray-500">No tags assigned.</p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-sm font-medium text-gray-700">
                <span>Add to Campaign</span>
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </button>
              <button className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-sm font-medium text-gray-700">
                <span>Assign to Team Member</span>
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </button>
              <button className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-sm font-medium text-gray-700">
                <span>Export Contact Data</span>
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactDetails;