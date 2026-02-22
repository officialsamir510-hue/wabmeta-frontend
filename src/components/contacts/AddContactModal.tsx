// 📁 src/components/contacts/AddContactModal.tsx - COMPLETE

import React, { useState, useEffect } from 'react';
import { X, User, Phone, Mail, Plus, Save, Loader2, AlertCircle, CheckCircle, Tag } from 'lucide-react';
import { validatePhoneInput } from '../../utils/csvContacts';

// ============================================
// TYPES
// ============================================

interface AddContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (contact: any) => Promise<void>;
  editContact?: any | null;
}

interface FormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  company: string;
  address: string;
  tags: string[];
  notes: string;
}

interface ValidationErrors {
  firstName?: string;
  phone?: string;
  email?: string;
}

// ============================================
// COMPONENT
// ============================================

const AddContactModal: React.FC<AddContactModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editContact
}) => {
  const [loading, setLoading] = useState(false);
  const [fetchingProfile, setFetchingProfile] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [phoneValidation, setPhoneValidation] = useState<{
    valid: boolean;
    message: string;
    normalized?: string;
  } | null>(null);

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    company: '',
    address: '',
    tags: [],
    notes: ''
  });

  const [errors, setErrors] = useState<ValidationErrors>({});

  // ============================================
  // EFFECTS
  // ============================================

  /**
   * Reset or populate form when modal opens
   */
  useEffect(() => {
    if (isOpen) {
      if (editContact) {
        // Parse backend data for editing
        const fullName = editContact.firstName && editContact.lastName
          ? `${editContact.firstName} ${editContact.lastName}`
          : editContact.name || '';

        const nameParts = fullName.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        setFormData({
          firstName,
          lastName,
          phone: editContact.phone || '',
          email: editContact.email || '',
          company: editContact.company || '',
          address: editContact.address || '',
          tags: editContact.tags || [],
          notes: editContact.notes || ''
        });

        // Validate existing phone
        if (editContact.phone) {
          const validation = validatePhoneInput(editContact.phone);
          setPhoneValidation(validation);
        }
      } else {
        // Reset form for new contact
        setFormData({
          firstName: '',
          lastName: '',
          phone: '',
          email: '',
          company: '',
          address: '',
          tags: [],
          notes: ''
        });
        setPhoneValidation(null);
      }
      setErrors({});
      setNewTag('');
    }
  }, [editContact, isOpen]);

  // ============================================
  // VALIDATION
  // ============================================

  /**
   * Validate phone number in real-time
   */
  const handlePhoneChange = (value: string) => {
    setFormData({ ...formData, phone: value });

    if (value.trim()) {
      const validation = validatePhoneInput(value);
      setPhoneValidation(validation);
    } else {
      setPhoneValidation(null);
    }
  };

  /**
   * Validate entire form
   */
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // First name required
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    // Phone required and must be valid Indian number
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!phoneValidation?.valid) {
      newErrors.phone = phoneValidation?.message || 'Invalid phone number';
    }

    // Email validation (optional but must be valid if provided)
    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Invalid email format';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ============================================
  // HANDLERS
  // ============================================

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setFetchingProfile(true);

    try {
      // Normalize phone to +91XXXXXXXXXX format
      const normalizedPhone = phoneValidation?.normalized || formData.phone;

      // Prepare payload
      const payload = {
        phone: normalizedPhone,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim() || undefined,
        email: formData.email.trim() || undefined,
        company: formData.company.trim() || undefined,
        address: formData.address.trim() || undefined,
        tags: formData.tags,
        notes: formData.notes.trim() || undefined,
      };

      await onSave(payload);

      // Close modal after successful save
      onClose();
    } catch (error: any) {
      console.error('Error saving contact:', error);
      // Error will be handled by parent component
    } finally {
      setLoading(false);
      setFetchingProfile(false);
    }
  };

  /**
   * Add tag
   */
  const handleAddTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData({ ...formData, tags: [...formData.tags, trimmedTag] });
    }
    setNewTag('');
  };

  /**
   * Remove tag
   */
  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag)
    });
  };

  /**
   * Handle Enter key in tag input
   */
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag(newTag);
    }
  };

  // ============================================
  // RENDER
  // ============================================

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {editContact ? 'Edit Contact' : 'Add New Contact'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {editContact
                ? 'Update contact information'
                : 'Only Indian phone numbers (+91) are accepted'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={loading}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-180px)]"
        >
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                First Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 ${errors.firstName
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-200 focus:ring-primary-500'
                    }`}
                  placeholder="Enter first name"
                  disabled={loading}
                />
              </div>
              {errors.firstName && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.firstName}
                </p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Last Name
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Enter last name"
                disabled={loading}
              />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Phone Number *
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 ${errors.phone
                  ? 'border-red-300 focus:ring-red-500'
                  : phoneValidation?.valid
                    ? 'border-green-300 focus:ring-green-500'
                    : 'border-gray-200 focus:ring-primary-500'
                  }`}
                placeholder="+91 9876543210 or 9876543210"
                disabled={loading}
              />
              {phoneValidation?.valid && (
                <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
              )}
            </div>

            {/* Phone Validation Messages */}
            {phoneValidation && (
              <p className={`text-sm mt-1 flex items-center gap-1 ${phoneValidation.valid ? 'text-green-600' : 'text-amber-600'
                }`}>
                {phoneValidation.valid ? (
                  <>
                    <CheckCircle className="w-3 h-3" />
                    Valid Indian number: {phoneValidation.normalized}
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3 h-3" />
                    {phoneValidation.message}
                  </>
                )}
              </p>
            )}

            {errors.phone && (
              <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.phone}
              </p>
            )}

            {/* Fetching Profile Indicator */}
            {fetchingProfile && !editContact && (
              <div className="mt-2 text-sm text-blue-600 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Checking WhatsApp profile...
              </div>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 ${errors.email
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-200 focus:ring-primary-500'
                  }`}
                placeholder="email@example.com"
                disabled={loading}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.email}
              </p>
            )}
          </div>

          {/* Company (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Company
            </label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Company name"
              disabled={loading}
            />
          </div>

          {/* Address (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Address
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Full address"
              disabled={loading}
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Tags
            </label>

            {/* Existing Tags */}
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 bg-primary-100 text-primary-700 rounded-full text-sm font-medium"
                  >
                    <Tag className="w-3 h-3" />
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:bg-primary-200 rounded-full p-0.5 transition-colors"
                      disabled={loading}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Add New Tag */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Add tag (press Enter)"
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => handleAddTag(newTag)}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                disabled={loading || !newTag.trim()}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              placeholder="Additional notes..."
              disabled={loading}
            />
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !phoneValidation?.valid || !formData.firstName.trim()}
            className="flex items-center space-x-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{editContact ? 'Updating...' : 'Adding...'}</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{editContact ? 'Update Contact' : 'Add Contact'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddContactModal;