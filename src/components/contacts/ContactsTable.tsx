import React from 'react';
import { Link } from 'react-router-dom';
import {
  MoreHorizontal,
  MessageSquare,
  Phone,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';

interface Contact {
  notes: string;
  address: string;
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  company: string;
  status: 'active' | 'inactive' | 'pending';
  tags: string[];
  lastContacted: string;
  createdAt: string;
}

interface ContactsTableProps {
  contacts: Contact[];
  selectedContacts: number[];
  onSelectContact: (id: number) => void;
  onSelectAll: () => void;
  onEdit: (contact: Contact) => void;
  onDelete: (id: number) => void;
}

const ContactsTable: React.FC<ContactsTableProps> = ({
  contacts,
  selectedContacts,
  onSelectContact,
  onSelectAll,
  onEdit,
  onDelete
}) => {
  const [openMenu, setOpenMenu] = React.useState<number | null>(null);

  const getStatusIcon = (status: Contact['status']) => {
    switch (status) {
      case 'active': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'inactive': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusStyle = (status: Contact['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'inactive': return 'bg-red-100 text-red-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
    }
  };

  const getTagColor = (tag: string) => {
    const colors: Record<string, string> = {
      'VIP': 'bg-purple-100 text-purple-700',
      'Lead': 'bg-blue-100 text-blue-700',
      'Customer': 'bg-green-100 text-green-700',
      'New': 'bg-orange-100 text-orange-700',
      'Hot Lead': 'bg-red-100 text-red-700',
    };
    return colors[tag] || 'bg-gray-100 text-gray-700';
  };

  const isAllSelected = contacts.length > 0 && selectedContacts.length === contacts.length;
  const isPartialSelected = selectedContacts.length > 0 && selectedContacts.length < contacts.length;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-4 text-left">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = isPartialSelected;
                  }}
                  onChange={onSelectAll}
                  className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                />
              </th>
              <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600">Contact</th>
              <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600">Phone</th>
              <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600 hidden md:table-cell">Company</th>
              <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600 hidden lg:table-cell">Tags</th>
              <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
              <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600 hidden xl:table-cell">Last Contacted</th>
              <th className="px-4 py-4 text-right text-sm font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {contacts.map((contact) => (
              <tr 
                key={contact.id}
                className={`hover:bg-gray-50 transition-colors ${
                  selectedContacts.includes(contact.id) ? 'bg-primary-50' : ''
                }`}
              >
                {/* Checkbox */}
                <td className="px-4 py-4">
                  <input
                    type="checkbox"
                    checked={selectedContacts.includes(contact.id)}
                    onChange={() => onSelectContact(contact.id)}
                    className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                  />
                </td>

                {/* Contact Info */}
                <td className="px-4 py-4">
                  <Link 
                    to={`/dashboard/contacts/${contact.id}`}
                    className="flex items-center space-x-3 group"
                  >
                    <div className="w-10 h-10 bg-linear-to-br from-primary-500 to-whatsapp-teal rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0">
                      {contact.firstName.charAt(0)}{contact.lastName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                        {contact.firstName} {contact.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{contact.email}</p>
                    </div>
                  </Link>
                </td>

                {/* Phone */}
                <td className="px-4 py-4">
                  <a 
                    href={`tel:${contact.phone}`}
                    className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    <span>{contact.phone}</span>
                  </a>
                </td>

                {/* Company */}
                <td className="px-4 py-4 hidden md:table-cell">
                  <span className="text-gray-600">{contact.company || '-'}</span>
                </td>

                {/* Tags */}
                <td className="px-4 py-4 hidden lg:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {contact.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTagColor(tag)}`}
                      >
                        {tag}
                      </span>
                    ))}
                    {contact.tags.length > 2 && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        +{contact.tags.length - 2}
                      </span>
                    )}
                  </div>
                </td>

                {/* Status */}
                <td className="px-4 py-4">
                  <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyle(contact.status)}`}>
                    {getStatusIcon(contact.status)}
                    <span className="capitalize">{contact.status}</span>
                  </span>
                </td>

                {/* Last Contacted */}
                <td className="px-4 py-4 hidden xl:table-cell">
                  <span className="text-gray-600 text-sm">{contact.lastContacted}</span>
                </td>

                {/* Actions */}
                <td className="px-4 py-4 text-right">
                  <div className="flex items-center justify-end space-x-1">
                    <button 
                      className="p-2 hover:bg-primary-50 text-gray-400 hover:text-primary-600 rounded-lg transition-colors"
                      title="Send Message"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    
                    <div className="relative">
                      <button 
                        onClick={() => setOpenMenu(openMenu === contact.id ? null : contact.id)}
                        className="p-2 hover:bg-gray-100 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>

                      {openMenu === contact.id && (
                        <>
                          <div 
                            className="fixed inset-0 z-10"
                            onClick={() => setOpenMenu(null)}
                          ></div>
                          <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20 animate-fade-in">
                            <Link
                              to={`/dashboard/contacts/${contact.id}`}
                              className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                              <span className="text-sm">View Details</span>
                            </Link>
                            <button
                              onClick={() => {
                                onEdit(contact);
                                setOpenMenu(null);
                              }}
                              className="w-full flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                              <span className="text-sm">Edit Contact</span>
                            </button>
                            <button
                              onClick={() => {
                                onDelete(contact.id);
                                setOpenMenu(null);
                              }}
                              className="w-full flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span className="text-sm">Delete</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {contacts.length === 0 && (
        <div className="py-16 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No contacts found</h3>
          <p className="text-gray-500 mb-6">Start by adding your first contact or import from CSV.</p>
        </div>
      )}
    </div>
  );
};

// Add Users import at the top
import { Users } from 'lucide-react';

export default ContactsTable;