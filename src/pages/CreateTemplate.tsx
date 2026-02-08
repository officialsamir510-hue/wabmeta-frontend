// src/pages/CreateTemplate.tsx

import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Eye,
  Info,
  FileText,
  Image,
  Video,
  File,
  Type,
  Loader2,
  AlertCircle,
  CheckCircle,
  Wifi,
  Plus,
  Trash2,
  HelpCircle,
} from 'lucide-react';
import { templates as templateApi } from '../services/api';
import { useWhatsAppConnection } from '../hooks/useWhatsAppConnection';
import NoWhatsAppConnected from '../components/common/NoWhatsAppConnected';
import TemplatePreview from '../components/templates/TemplatePreview';
import VariableManager from '../components/templates/VariableManager';
import ButtonBuilder from '../components/templates/ButtonBuilder';
import MediaUploader from '../components/templates/MediaUploader';
import type { TemplateFormData, HeaderType, TemplateCategory } from '../types/template';

// ============================================
// TYPES
// ============================================
interface TemplateButton {
  id: string;
  type: 'quick_reply' | 'url' | 'phone';
  text: string;
  url?: string;
  phoneNumber?: string;
}

interface Variable {
  index: number;
  example: string;
}

// ============================================
// COMPONENT
// ============================================
const CreateTemplate: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const duplicateFrom = location.state?.duplicateFrom;
  
  // WhatsApp Connection
  const { isConnected, isLoading: connectionLoading, defaultAccount } = useWhatsAppConnection();
  
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'buttons' | 'settings'>('content');
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form State - Initialize from duplicate if exists
  const [formData, setFormData] = useState<TemplateFormData>({
    name: duplicateFrom ? `${duplicateFrom.name}_copy` : '',
    category: (duplicateFrom?.category?.toLowerCase() as TemplateCategory) || 'utility',
    language: duplicateFrom?.language || 'en',
    header: duplicateFrom?.header || { type: 'none' },
    body: duplicateFrom?.body || '',
    footer: duplicateFrom?.footer || '',
    buttons: duplicateFrom?.buttons || []
  });

  const [sampleVariables, setSampleVariables] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ==========================================
  // COMPUTED VALUES
  // ==========================================
  const extractedVariables = useMemo(() => {
    const text = formData.body + (formData.header.text || '');
    const matches = text.match(/\{\{(\d+)\}\}/g) || [];
    const unique = [...new Set(matches.map(m => m.replace(/[{}]/g, '')))];
    return unique.sort((a, b) => Number(a) - Number(b));
  }, [formData.body, formData.header.text]);

  // Auto-update sample variables when body text changes
  useEffect(() => {
    setSampleVariables(prev => {
      const newVars: Record<string, string> = {};
      extractedVariables.forEach(v => {
        newVars[v] = prev[v] || '';
      });
      return newVars;
    });
  }, [extractedVariables]);

  // ==========================================
  // CONSTANTS
  // ==========================================
  const categories: { value: TemplateCategory; label: string; description: string }[] = [
    { value: 'marketing', label: 'Marketing', description: 'Promotional messages, offers, updates' },
    { value: 'utility', label: 'Utility', description: 'Order updates, confirmations, alerts' },
    { value: 'authentication', label: 'Authentication', description: 'OTPs, verification codes' },
  ];

  const headerTypes: { value: HeaderType; label: string; icon: React.ElementType }[] = [
    { value: 'none', label: 'None', icon: FileText },
    { value: 'text', label: 'Text', icon: Type },
    { value: 'image', label: 'Image', icon: Image },
    { value: 'video', label: 'Video', icon: Video },
    { value: 'document', label: 'Document', icon: File },
  ];

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'en_US', label: 'English (US)' },
    { value: 'en_GB', label: 'English (UK)' },
    { value: 'hi', label: 'Hindi' },
    { value: 'ta', label: 'Tamil' },
    { value: 'te', label: 'Telugu' },
    { value: 'mr', label: 'Marathi' },
    { value: 'gu', label: 'Gujarati' },
    { value: 'bn', label: 'Bengali' },
    { value: 'kn', label: 'Kannada' },
    { value: 'ml', label: 'Malayalam' },
    { value: 'pa', label: 'Punjabi' },
    { value: 'es', label: 'Spanish' },
    { value: 'pt_BR', label: 'Portuguese (Brazil)' },
    { value: 'ar', label: 'Arabic' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
  ];

  // ==========================================
  // VALIDATION
  // ==========================================
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Template name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    } else if (!/^[a-z0-9_]+$/.test(formData.name)) {
      newErrors.name = 'Name can only contain lowercase letters, numbers, and underscores';
    } else if (formData.name.length > 512) {
      newErrors.name = 'Name is too long (max 512 characters)';
    }

    // Body validation
    if (!formData.body.trim()) {
      newErrors.body = 'Message body is required';
    } else if (formData.body.length < 10) {
      newErrors.body = 'Body must be at least 10 characters';
    } else if (formData.body.length > 1024) {
      newErrors.body = 'Body is too long (max 1024 characters)';
    }

    // Header text validation
    if (formData.header.type === 'text' && !formData.header.text?.trim()) {
      newErrors.headerText = 'Header text is required when header type is text';
    }

    // Footer validation
    if (formData.footer && formData.footer.length > 60) {
      newErrors.footer = 'Footer is too long (max 60 characters)';
    }

    // Button validation
    formData.buttons.forEach((btn, index) => {
      if (!btn.text.trim()) {
        newErrors[`button_${index}_text`] = 'Button text is required';
      } else if (btn.text.length > 25) {
        newErrors[`button_${index}_text`] = 'Button text max 25 characters';
      }
      
      if (btn.type === 'url') {
        if (!btn.url?.trim()) {
          newErrors[`button_${index}_url`] = 'URL is required';
        } else {
          try {
            new URL(btn.url);
          } catch {
            newErrors[`button_${index}_url`] = 'Invalid URL format';
          }
        }
      }
      
      if (btn.type === 'phone') {
        if (!btn.phoneNumber?.trim()) {
          newErrors[`button_${index}_phone`] = 'Phone number is required';
        } else if (!/^\+[1-9]\d{10,14}$/.test(btn.phoneNumber)) {
          newErrors[`button_${index}_phone`] = 'Invalid phone format (e.g., +919876543210)';
        }
      }
    });

    // Variable samples validation
    if (extractedVariables.length > 0) {
      const missingSamples = extractedVariables.filter(v => !sampleVariables[v]?.trim());
      if (missingSamples.length > 0) {
        newErrors.variables = `Please provide sample values for variables: {{${missingSamples.join('}}, {{')}}}`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ==========================================
  // SUBMIT HANDLER
  // ==========================================
  const handleSubmit = async (asDraft: boolean = false) => {
    setApiError(null);
    setSuccessMessage(null);

    // Validate form (skip for drafts)
    if (!asDraft && !validateForm()) {
      setActiveTab('content');
      const firstError = document.querySelector('.text-red-600');
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setSaving(true);

    try {
      // Map buttons to backend format
      const mappedButtons = formData.buttons
        .filter(btn => btn.text.trim())
        .map(btn => {
          if (btn.type === 'quick_reply') {
            return {
              type: 'QUICK_REPLY' as const,
              text: btn.text.trim()
            };
          } else if (btn.type === 'url') {
            return {
              type: 'URL' as const,
              text: btn.text.trim(),
              url: btn.url?.trim() || ''
            };
          } else if (btn.type === 'phone') {
            return {
              type: 'PHONE_NUMBER' as const,
              text: btn.text.trim(),
              phoneNumber: btn.phoneNumber?.trim() || ''
            };
          }
          return null;
        })
        .filter(Boolean);

      // Map variables with examples
      const mappedVariables = extractedVariables.map((v) => ({
        index: parseInt(v),
        type: 'text' as const,
        example: sampleVariables[v]?.trim() || 'example'
      }));

      // Build payload
      const payload: Record<string, any> = {
        name: formData.name.trim(),
        language: formData.language,
        category: formData.category.toUpperCase(),
        headerType: formData.header.type.toUpperCase(),
        bodyText: formData.body.trim(),
      };

      // Optional fields
      if (formData.header.type === 'text' && formData.header.text?.trim()) {
        payload.headerContent = formData.header.text.trim();
      } else if (['image', 'video', 'document'].includes(formData.header.type) && formData.header.mediaUrl) {
        payload.headerContent = formData.header.mediaUrl;
      }

      if (formData.footer?.trim()) {
        payload.footerText = formData.footer.trim();
      }

      if (mappedButtons.length > 0) {
        payload.buttons = mappedButtons;
      }

      if (mappedVariables.length > 0) {
        payload.variables = mappedVariables;
      }

      console.log("📤 Sending template payload:", payload);

      // Call API
      const response = await templateApi.create(payload);
      
      console.log("✅ Template created:", response.data);
      
      setSuccessMessage('Template created successfully! It will be reviewed by Meta.');
      
      // Navigate after short delay
      setTimeout(() => {
        navigate('/dashboard/templates');
      }, 1500);

    } catch (error: any) {
      console.error("❌ Template creation error:", error);
      
      // Extract detailed error message
      let errorMessage = 'Failed to create template. Please try again.';
      const errorData = error.response?.data;
      
      if (errorData?.error?.issues && Array.isArray(errorData.error.issues)) {
        errorMessage = errorData.error.issues
          .map((issue: any) => `${issue.path?.join('.') || 'field'}: ${issue.message}`)
          .join('\n');
      } else if (errorData?.error?.message) {
        errorMessage = errorData.error.message;
      } else if (errorData?.message) {
        errorMessage = errorData.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setApiError(errorMessage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // FORM HELPERS
  // ==========================================
  const updateFormData = <K extends keyof TemplateFormData>(
    key: K,
    value: TemplateFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    // Clear error for this field
    if (errors[key]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const clearMessages = () => {
    setApiError(null);
    setSuccessMessage(null);
  };

  // ==========================================
  // LOADING STATES
  // ==========================================
  
  // Check WhatsApp connection loading
  if (connectionLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Checking WhatsApp connection...</p>
        </div>
      </div>
    );
  }

  // No WhatsApp connected
  if (!isConnected) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link 
            to="/dashboard/templates" 
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {duplicateFrom ? 'Duplicate Template' : 'Create Template'}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Create a new message template for WhatsApp Business
            </p>
          </div>
        </div>

        <NoWhatsAppConnected
          title="WhatsApp Account Required"
          description="You need to connect a WhatsApp Business account before creating templates. Templates are required for sending proactive messages to customers outside the 24-hour messaging window."
          variant="full-page"
        />
      </div>
    );
  }

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-16 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                to="/dashboard/templates"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  {duplicateFrom ? 'Duplicate Template' : 'Create Template'}
                </h1>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <span>Design your WhatsApp message template</span>
                  {defaultAccount && (
                    <>
                      <span>•</span>
                      <span className="flex items-center text-green-600 dark:text-green-400">
                        <Wifi className="w-3 h-3 mr-1" />
                        {defaultAccount.displayName || defaultAccount.phoneNumber}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowPreview(true)}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
              >
                <Eye className="w-5 h-5" />
                <span className="hidden sm:inline">Preview</span>
              </button>
              <button
                onClick={() => handleSubmit(false)}
                disabled={saving}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Submit for Review</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-start space-x-3 animate-fade-in">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-green-800 dark:text-green-200 font-medium">{successMessage}</p>
            </div>
            <button onClick={clearMessages} className="text-green-400 hover:text-green-600 dark:hover:text-green-200">×</button>
          </div>
        )}

        {/* API Error Banner */}
        {apiError && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start space-x-3 animate-fade-in">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Submission Failed</h3>
              <pre className="text-sm text-red-600 dark:text-red-400 mt-1 whitespace-pre-wrap font-sans">{apiError}</pre>
            </div>
            <button onClick={clearMessages} className="text-red-400 hover:text-red-600 dark:hover:text-red-200">×</button>
          </div>
        )}

        {/* Info Box */}
        <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex items-start">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3 mt-0.5 shrink-0" />
          <div>
            <p className="text-blue-800 dark:text-blue-200 font-medium">Template Guidelines</p>
            <ul className="text-blue-700 dark:text-blue-300 text-sm mt-1 space-y-1 list-disc list-inside">
              <li>Templates must be approved by Meta before use (usually 24-48 hours)</li>
              <li>Use variables like {"{{1}}"}, {"{{2}}"} for dynamic content</li>
              <li>Marketing templates require opt-in from recipients</li>
              <li>Avoid promotional content in Utility templates</li>
            </ul>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left: Form */}
          <div className="space-y-6">
            {/* Tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="flex border-b border-gray-200 dark:border-gray-700">
                {[
                  { id: 'content', label: 'Content' },
                  { id: 'buttons', label: 'Buttons' },
                  { id: 'settings', label: 'Settings' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 border-b-2 border-primary-500'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {/* Content Tab */}
                {activeTab === 'content' && (
                  <div className="space-y-6">
                    {/* Template Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Template Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => updateFormData('name', e.target.value.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''))}
                        placeholder="e.g., order_confirmation"
                        maxLength={512}
                        className={`w-full px-4 py-2.5 border rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all ${
                          errors.name
                            ? 'border-red-300 dark:border-red-600 focus:ring-red-500/20'
                            : 'border-gray-200 dark:border-gray-600 focus:ring-primary-500/20 focus:border-primary-500'
                        }`}
                      />
                      {errors.name && (
                        <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.name}</p>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Use lowercase letters, numbers, and underscores only
                      </p>
                    </div>

                    {/* Header Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Header Type
                      </label>
                      <div className="grid grid-cols-5 gap-2">
                        {headerTypes.map((type) => (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => updateFormData('header', { type: type.value })}
                            className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${
                              formData.header.type === type.value
                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-600 dark:text-gray-400'
                            }`}
                          >
                            <type.icon className="w-5 h-5 mb-1" />
                            <span className="text-xs font-medium">{type.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Header Content */}
                    {formData.header.type === 'text' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Header Text *
                        </label>
                        <input
                          type="text"
                          value={formData.header.text || ''}
                          onChange={(e) => updateFormData('header', { 
                            ...formData.header, 
                            text: e.target.value 
                          })}
                          placeholder="Enter header text"
                          maxLength={60}
                          className={`w-full px-4 py-2.5 border rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all ${
                            errors.headerText
                              ? 'border-red-300 dark:border-red-600 focus:ring-red-500/20'
                              : 'border-gray-200 dark:border-gray-600 focus:ring-primary-500/20 focus:border-primary-500'
                          }`}
                        />
                        {errors.headerText && (
                          <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.headerText}</p>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {(formData.header.text || '').length}/60 characters
                        </p>
                      </div>
                    )}

                    {['image', 'video', 'document'].includes(formData.header.type) && (
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                          Media will be uploaded when sending the message.
                        </p>
                        <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                          You can specify a URL or upload during campaign creation.
                        </p>
                      </div>
                    )}

                    {/* Body */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Message Body *
                      </label>
                      <textarea
                        value={formData.body}
                        onChange={(e) => updateFormData('body', e.target.value)}
                        placeholder="Enter your message here. Use {{1}}, {{2}}, etc. for variables."
                        rows={6}
                        maxLength={1024}
                        className={`w-full px-4 py-3 border rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all resize-none ${
                          errors.body
                            ? 'border-red-300 dark:border-red-600 focus:ring-red-500/20'
                            : 'border-gray-200 dark:border-gray-600 focus:ring-primary-500/20 focus:border-primary-500'
                        }`}
                      />
                      {errors.body && (
                        <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.body}</p>
                      )}
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formData.body.length}/1024 characters
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Use {'{{1}}'}, {'{{2}}'} for variables
                        </p>
                      </div>
                    </div>

                    {/* Footer */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Footer (Optional)
                      </label>
                      <input
                        type="text"
                        value={formData.footer}
                        onChange={(e) => updateFormData('footer', e.target.value)}
                        placeholder="e.g., Reply STOP to unsubscribe"
                        maxLength={60}
                        className={`w-full px-4 py-2.5 border rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all ${
                          errors.footer
                            ? 'border-red-300 dark:border-red-600 focus:ring-red-500/20'
                            : 'border-gray-200 dark:border-gray-600 focus:ring-primary-500/20 focus:border-primary-500'
                        }`}
                      />
                      {errors.footer && (
                        <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.footer}</p>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formData.footer.length}/60 characters
                      </p>
                    </div>

                    {/* Variables */}
                    {extractedVariables.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Sample Variable Values *
                        </label>
                        <div className="space-y-3">
                          {extractedVariables.map((variable) => (
                            <div key={variable} className="flex items-center gap-3">
                              <span className="w-16 text-sm text-gray-600 dark:text-gray-400">{`{{${variable}}}`}</span>
                              <input
                                type="text"
                                value={sampleVariables[variable] || ''}
                                onChange={(e) => 
                                  setSampleVariables(prev => ({ ...prev, [variable]: e.target.value }))
                                }
                                placeholder="Example value"
                                className={`flex-1 px-3 py-1.5 border rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
                                  errors.variables ? 'border-red-300 dark:border-red-600' : 'border-gray-200 dark:border-gray-600'
                                }`}
                              />
                            </div>
                          ))}
                        </div>
                        {errors.variables && (
                          <p className="text-sm text-red-600 dark:text-red-400 mt-2">{errors.variables}</p>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          Sample values help Meta understand your template during review
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Buttons Tab */}
                {activeTab === 'buttons' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">Call-to-Action Buttons</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Add up to 3 buttons to your template</p>
                      </div>
                      {formData.buttons.length < 3 && (
                        <button
                          type="button"
                          onClick={() => updateFormData('buttons', [...formData.buttons, {
                            id: Date.now().toString(),
                            type: 'quick_reply',
                            text: ''
                          }])}
                          className="inline-flex items-center text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Button
                        </button>
                      )}
                    </div>

                    {formData.buttons.length === 0 && (
                      <p className="text-gray-500 dark:text-gray-400 text-sm py-8 text-center">
                        No buttons added. You can add up to 3 buttons.
                      </p>
                    )}

                    {formData.buttons.map((button, index) => (
                      <div key={button.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-700 dark:text-gray-300">Button {index + 1}</span>
                          <button
                            type="button"
                            onClick={() => updateFormData('buttons', formData.buttons.filter((_, i) => i !== index))}
                            className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Button Type
                            </label>
                            <select
                              value={button.type}
                              onChange={(e) => {
                                const updated = [...formData.buttons];
                                updated[index] = { ...updated[index], type: e.target.value as any };
                                updateFormData('buttons', updated);
                              }}
                              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                            >
                              <option value="quick_reply">Quick Reply</option>
                              <option value="url">URL</option>
                              <option value="phone">Phone Number</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Button Text *
                            </label>
                            <input
                              type="text"
                              value={button.text}
                              onChange={(e) => {
                                const updated = [...formData.buttons];
                                updated[index] = { ...updated[index], text: e.target.value };
                                updateFormData('buttons', updated);
                              }}
                              placeholder="Button text"
                              maxLength={25}
                              className={`w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
                                errors[`button_${index}_text`] ? 'border-red-300 dark:border-red-600' : 'border-gray-200 dark:border-gray-600'
                              }`}
                            />
                          </div>
                        </div>

                        {button.type === 'url' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              URL *
                            </label>
                            <input
                              type="url"
                              value={button.url || ''}
                              onChange={(e) => {
                                const updated = [...formData.buttons];
                                updated[index] = { ...updated[index], url: e.target.value };
                                updateFormData('buttons', updated);
                              }}
                              placeholder="https://example.com"
                              className={`w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
                                errors[`button_${index}_url`] ? 'border-red-300 dark:border-red-600' : 'border-gray-200 dark:border-gray-600'
                              }`}
                            />
                          </div>
                        )}

                        {button.type === 'phone' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Phone Number *
                            </label>
                            <input
                              type="tel"
                              value={button.phoneNumber || ''}
                              onChange={(e) => {
                                const updated = [...formData.buttons];
                                updated[index] = { ...updated[index], phoneNumber: e.target.value };
                                updateFormData('buttons', updated);
                              }}
                              placeholder="+1234567890"
                              className={`w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
                                errors[`button_${index}_phone`] ? 'border-red-300 dark:border-red-600' : 'border-gray-200 dark:border-gray-600'
                              }`}
                            />
                          </div>
                        )}
                      </div>
                    ))}

                    {Object.keys(errors).filter(k => k.startsWith('button_')).length > 0 && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                        <p className="text-sm text-red-600 dark:text-red-400 font-medium">Button Errors:</p>
                        {Object.entries(errors)
                          .filter(([k]) => k.startsWith('button_'))
                          .map(([key, msg]) => (
                            <p key={key} className="text-sm text-red-600 dark:text-red-400">• {msg}</p>
                          ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                  <div className="space-y-6">
                    {/* Category */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Category *
                      </label>
                      <div className="space-y-2">
                        {categories.map((category) => (
                          <label
                            key={category.value}
                            className={`flex items-start space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                              formData.category === category.value
                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                            }`}
                          >
                            <input
                              type="radio"
                              name="category"
                              value={category.value}
                              checked={formData.category === category.value}
                              onChange={(e) => updateFormData('category', e.target.value as TemplateCategory)}
                              className="mt-1"
                            />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{category.label}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{category.description}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Language */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Language *
                      </label>
                      <select
                        value={formData.language}
                        onChange={(e) => updateFormData('language', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        {languages.map((lang) => (
                          <option key={lang.value} value={lang.value}>
                            {lang.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Info Box */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                      <div className="flex items-start space-x-3">
                        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                        <div className="text-sm text-blue-800 dark:text-blue-200">
                          <p className="font-medium mb-1">Review Process</p>
                          <p>
                            After submission, your template will be reviewed by Meta. 
                            This usually takes 24-48 hours. You'll be notified once approved.
                          </p>
                          <ul className="mt-2 space-y-1 text-blue-700 dark:text-blue-300">
                            <li>• Marketing templates need clear opt-out option</li>
                            <li>• Utility templates are for transactional messages</li>
                            <li>• Authentication templates are for OTPs only</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Live Preview */}
          <div className="lg:sticky lg:top-36 h-fit">
            <div className="bg-gray-900 dark:bg-gray-950 rounded-2xl p-6">
              <h3 className="text-white font-medium mb-4 text-center">📱 Live Preview</h3>
              <TemplatePreview
                template={formData}
                sampleVariables={sampleVariables}
              />
            </div>
            
            {/* Quick Stats */}
            <div className="mt-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Template Stats</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
                  <p className="text-gray-500 dark:text-gray-400">Body Length</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{formData.body.length}/1024</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
                  <p className="text-gray-500 dark:text-gray-400">Variables</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{extractedVariables.length}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
                  <p className="text-gray-500 dark:text-gray-400">Buttons</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{formData.buttons.length}/3</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
                  <p className="text-gray-500 dark:text-gray-400">Category</p>
                  <p className="font-semibold capitalize text-gray-900 dark:text-white">{formData.category}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Preview Modal */}
      {showPreview && (
        <TemplatePreview
          template={formData}
          sampleVariables={sampleVariables}
          isModal
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
};

export default CreateTemplate;