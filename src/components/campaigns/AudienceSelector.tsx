import React, { useState } from 'react';
import {
  Users,
  Tag,
  Upload,
  UserPlus,
  Search,
  Check
} from 'lucide-react';
import type { AudienceType } from '../../types/campaign';

interface Contact {
  id: string;
  name: string;
  phone: string;
  tags: string[];
}

interface AudienceSelectorProps {
  audienceType: AudienceType;
  onTypeChange: (type: AudienceType) => void;
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  selectedContacts: string[];
  onContactsChange: (contacts: string[]) => void;
  availableTags: string[];
  contacts: Contact[];
  totalSelected: number;
}

const AudienceSelector: React.FC<AudienceSelectorProps> = ({
  audienceType,
  onTypeChange,
  selectedTags,
  onTagsChange,
  selectedContacts,
  onContactsChange,
  availableTags,
  contacts,
  totalSelected
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const audienceTypes = [
    { 
      value: 'all' as AudienceType, 
      label: 'All Contacts', 
      description: 'Send to all your contacts',
      icon: Users,
      count: contacts.length
    },
    { 
      value: 'tags' as AudienceType, 
      label: 'By Tags', 
      description: 'Select contacts by tags',
      icon: Tag,
      count: null
    },
    { 
      value: 'manual' as AudienceType, 
      label: 'Select Manually', 
      description: 'Choose specific contacts',
      icon: UserPlus,
      count: null
    },
    { 
      value: 'csv' as AudienceType, 
      label: 'Upload CSV', 
      description: 'Import from file',
      icon: Upload,
      count: null
    },
  ];

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter(t => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const toggleContact = (contactId: string) => {
    if (selectedContacts.includes(contactId)) {
      onContactsChange(selectedContacts.filter(c => c !== contactId));
    } else {
      onContactsChange([...selectedContacts, contactId]);
    }
  };

  const selectAllContacts = () => {
    if (selectedContacts.length === contacts.length) {
      onContactsChange([]);
    } else {
      onContactsChange(contacts.map(c => c.id));
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.phone.includes(searchQuery)
  );

  // Calculate contacts by tags
  const contactsByTags = selectedTags.length > 0
    ? contacts.filter(c => selectedTags.some(tag => c.tags.includes(tag))).length
    : 0;

  return (
    <div className="space-y-6">
      {/* Audience Type Selection */}
      <div className="grid grid-cols-2 gap-3">
        {audienceTypes.map((type) => (
          <button
            key={type.value}
            onClick={() => onTypeChange(type.value)}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              audienceType === type.value
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                audienceType === type.value ? 'bg-primary-100' : 'bg-gray-100'
              }`}>
                <type.icon className={`w-5 h-5 ${
                  audienceType === type.value ? 'text-primary-600' : 'text-gray-500'
                }`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900">{type.label}</h4>
                  {type.count !== null && (
                    <span className="text-sm text-gray-500">{type.count}</span>
                  )}
                </div>
                <p className="text-sm text-gray-500">{type.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Tags Selection */}
      {audienceType === 'tags' && (
        <div className="bg-gray-50 rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">Select Tags</h4>
            <span className="text-sm text-gray-500">
              {contactsByTags} contacts selected
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedTags.includes(tag)
                    ? 'bg-primary-500 text-white'
                    : 'bg-white border border-gray-200 text-gray-700 hover:border-primary-300'
                }`}
              >
                {selectedTags.includes(tag) && <Check className="w-3 h-3 inline mr-1" />}
                {tag}
              </button>
            ))}
          </div>
          {availableTags.length === 0 && (
            <p className="text-center text-gray-500 py-4">No tags available</p>
          )}
        </div>
      )}

      {/* Manual Selection */}
      {audienceType === 'manual' && (
        <div className="bg-gray-50 rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">Select Contacts</h4>
            <button
              onClick={selectAllContacts}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              {selectedContacts.length === contacts.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2">
            {filteredContacts.map((contact) => (
              <label
                key={contact.id}
                className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedContacts.includes(contact.id)
                    ? 'bg-primary-50 border border-primary-200'
                    : 'bg-white border border-gray-200 hover:bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedContacts.includes(contact.id)}
                  onChange={() => toggleContact(contact.id)}
                  className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">{contact.name}</p>
                  <p className="text-sm text-gray-500">{contact.phone}</p>
                </div>
                {contact.tags.length > 0 && (
                  <div className="flex space-x-1">
                    {contact.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </label>
            ))}
          </div>

          <p className="text-sm text-gray-500 text-center">
            {selectedContacts.length} of {contacts.length} contacts selected
          </p>
        </div>
      )}

      {/* CSV Upload */}
      {audienceType === 'csv' && (
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="font-medium text-gray-900 mb-2">Upload CSV File</h4>
          <p className="text-sm text-gray-500 mb-4">
            Upload a CSV file with phone numbers to send messages
          </p>
          <input
            type="file"
            accept=".csv"
            className="hidden"
            id="csv-upload"
          />
          <label
            htmlFor="csv-upload"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl cursor-pointer transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Choose File</span>
          </label>
        </div>
      )}

      {/* Summary */}
      <div className="bg-primary-50 border border-primary-200 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-primary-600" />
            <span className="font-medium text-primary-900">Total Recipients</span>
          </div>
          <span className="text-2xl font-bold text-primary-600">
            {totalSelected.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AudienceSelector;