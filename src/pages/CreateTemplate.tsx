import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  AlertCircle
} from 'lucide-react';
import TemplatePreview from '../components/templates/TemplatePreview';
import VariableManager from '../components/templates/VariableManager';
import ButtonBuilder from '../components/templates/ButtonBuilder';
import MediaUploader from '../components/templates/MediaUploader';
import type { TemplateFormData, HeaderType, TemplateCategory } from '../types/template';
import { templates as templateApi } from '../services/api';

const CreateTemplate: React.FC = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'buttons' | 'settings'>('content');
  const [apiError, setApiError] = useState<string | null>(null);

  const [formData, setFormData] = useState<TemplateFormData>({
    name: '',
    category: 'utility',
    language: 'en',
    header: { type: 'none' },
    body: '',
    footer: '',
    buttons: []
  });

  const [sampleVariables, setSampleVariables] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Extract variables from body and header
  const extractedVariables = useMemo(() => {
    const text = formData.body + (formData.header.text || '');
    const matches = text.match(/\{\{(\d+)\}\}/g) || [];
    const unique = [...new Set(matches.map(m => m.replace(/[{}]/g, '')))];
    return unique.sort((a, b) => Number(a) - Number(b));
  }, [formData.body, formData.header.text]);

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
    { value: 'hi', label: 'Hindi' },
    { value: 'ta', label: 'Tamil' },
    { value: 'te', label: 'Telugu' },
    { value: 'mr', label: 'Marathi' },
    { value: 'gu', label: 'Gujarati' },
    { value: 'bn', label: 'Bengali' },
  ];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Template name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    } else if (!/^[a-z0-9_]+$/.test(formData.name)) {
      newErrors.name = 'Name can only contain lowercase letters, numbers, and underscores';
    }

    if (!formData.body.trim()) {
      newErrors.body = 'Message body is required';
    } else if (formData.body.length < 10) {
      newErrors.body = 'Body must be at least 10 characters';
    }

    if (formData.header.type === 'text' && !formData.header.text?.trim()) {
      newErrors.headerText = 'Header text is required when header type is text';
    }

    // Validate buttons
    formData.buttons.forEach((btn, index) => {
      if (!btn.text.trim()) {
        newErrors[`button_${index}_text`] = 'Button text is required';
      }
      if (btn.type === 'url' && !btn.url?.trim()) {
        newErrors[`button_${index}_url`] = 'URL is required';
      }
      if (btn.type === 'phone' && !btn.phoneNumber?.trim()) {
        newErrors[`button_${index}_phone`] = 'Phone number is required';
      }
    });

    // Validate variables
    if (extractedVariables.length > 0) {
      const missingSamples = extractedVariables.filter(v => !sampleVariables[v]);
      if (missingSamples.length > 0) {
        newErrors.variables = 'Please provide sample values for all variables';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (asDraft: boolean = false) => {
    setApiError(null);

    if (!asDraft && !validateForm()) {
      setActiveTab('content');
      // Scroll to error
      const firstError = document.querySelector('.text-red-600');
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setSaving(true);

    try {
      // 1. Prepare Components Array
      const components: any[] = [];

      // Header Component
      if (formData.header.type !== 'none') {
        const headerComponent: any = {
          type: 'HEADER',
          format: formData.header.type.toUpperCase()
        };

        if (formData.header.type === 'text') {
          headerComponent.text = formData.header.text;
        } else {
          // For media, we send example URL
          headerComponent.example = {
            header_handle: [formData.header.mediaUrl]
          };
        }
        components.push(headerComponent);
      }

      // Body Component
      const bodyComponent: any = {
        type: 'BODY',
        text: formData.body
      };

      // Add body examples if variables exist
      if (extractedVariables.length > 0) {
        const bodyExamples = [extractedVariables.map(v => sampleVariables[v] || 'example')];
        bodyComponent.example = {
          body_text: bodyExamples
        };
      }
      components.push(bodyComponent);

      // Footer Component
      if (formData.footer) {
        components.push({
          type: 'FOOTER',
          text: formData.footer
        });
      }

      // Buttons Component
      if (formData.buttons.length > 0) {
        const buttons = formData.buttons.map(btn => {
          if (btn.type === 'quick_reply') {
            return {
              type: 'QUICK_REPLY',
              text: btn.text
            };
          } else if (btn.type === 'url') {
            return {
              type: 'URL',
              text: btn.text,
              url: btn.url
            };
          } else if (btn.type === 'phone') {
            return {
              type: 'PHONE_NUMBER',
              text: btn.text,
              phone_number: btn.phoneNumber
            };
          }
          return null;
        }).filter(Boolean);

        components.push({
          type: 'BUTTONS',
          buttons: buttons
        });
      }

      // 2. Prepare Final Payload
      const payload = {
        name: formData.name,
        category: formData.category.toUpperCase(), // Meta expects uppercase (MARKETING, UTILITY, AUTHENTICATION)
        language: formData.language,
        components: components,
        status: asDraft ? 'DRAFT' : 'PENDING'
      };

      // 3. Call API
      const response = await templateApi.create(payload);
      
      console.log('Template created:', response.data);
      
      // 4. Navigate on Success
      navigate('/dashboard/templates');

    } catch (error: any) {
      console.error("Template Creation Error:", error);
      const errorMessage = error.response?.data?.error?.message || 
                           error.response?.data?.message || 
                           error.message || 
                           'Failed to create template. Please try again.';
      setApiError(errorMessage);
      
      // Scroll to top to show error
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
    }
  };

  const updateFormData = <K extends keyof TemplateFormData>(
    key: K,
    value: TemplateFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                to="/dashboard/templates"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Create Template</h1>
                <p className="text-sm text-gray-500">Design your WhatsApp message template</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowPreview(true)}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <Eye className="w-5 h-5" />
                <span className="hidden sm:inline">Preview</span>
              </button>
              <button
                onClick={() => handleSubmit(true)}
                disabled={saving}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Save Draft
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
        {/* API Error Banner */}
        {apiError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3 animate-fade-in">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Submission Failed</h3>
              <p className="text-sm text-red-600 mt-1">{apiError}</p>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left: Form */}
          <div className="space-y-6">
            {/* Tabs */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="flex border-b border-gray-200">
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
                        ? 'text-primary-600 bg-primary-50 border-b-2 border-primary-500'
                        : 'text-gray-600 hover:text-gray-900'
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Template Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => updateFormData('name', e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                        placeholder="e.g., order_confirmation"
                        className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                          errors.name
                            ? 'border-red-300 focus:ring-red-500/20'
                            : 'border-gray-200 focus:ring-primary-500/20 focus:border-primary-500'
                        }`}
                      />
                      {errors.name && (
                        <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Use lowercase letters, numbers, and underscores only
                      </p>
                    </div>

                    {/* Header Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Header Type
                      </label>
                      <div className="grid grid-cols-5 gap-2">
                        {headerTypes.map((type) => (
                          <button
                            key={type.value}
                            onClick={() => updateFormData('header', { type: type.value })}
                            className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${
                              formData.header.type === type.value
                                ? 'border-primary-500 bg-primary-50 text-primary-600'
                                : 'border-gray-200 hover:border-gray-300 text-gray-600'
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">
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
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {(formData.header.text || '').length}/60 characters
                        </p>
                      </div>
                    )}

                    {['image', 'video', 'document'].includes(formData.header.type) && (
                      <MediaUploader
                        headerType={formData.header.type as 'image' | 'video' | 'document'}
                        mediaUrl={formData.header.mediaUrl}
                        fileName={formData.header.fileName}
                        onMediaChange={(url, fileName) => updateFormData('header', {
                          ...formData.header,
                          mediaUrl: url,
                          fileName
                        })}
                        onRemove={() => updateFormData('header', {
                          ...formData.header,
                          mediaUrl: undefined,
                          fileName: undefined
                        })}
                      />
                    )}

                    {/* Body */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Message Body *
                      </label>
                      <textarea
                        value={formData.body}
                        onChange={(e) => updateFormData('body', e.target.value)}
                        placeholder="Enter your message here. Use {{1}}, {{2}}, etc. for variables."
                        rows={6}
                        maxLength={1024}
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all resize-none ${
                          errors.body
                            ? 'border-red-300 focus:ring-red-500/20'
                            : 'border-gray-200 focus:ring-primary-500/20 focus:border-primary-500'
                        }`}
                      />
                      {errors.body && (
                        <p className="text-sm text-red-600 mt-1">{errors.body}</p>
                      )}
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-gray-500">
                          {formData.body.length}/1024 characters
                        </p>
                        <p className="text-xs text-gray-500">
                          Use {'{{1}}'}, {'{{2}}'} for variables
                        </p>
                      </div>
                    </div>

                    {/* Footer */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Footer (Optional)
                      </label>
                      <input
                        type="text"
                        value={formData.footer}
                        onChange={(e) => updateFormData('footer', e.target.value)}
                        placeholder="e.g., Reply STOP to unsubscribe"
                        maxLength={60}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.footer.length}/60 characters
                      </p>
                    </div>

                    {/* Variables */}
                    {extractedVariables.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Sample Variable Values *
                        </label>
                        <VariableManager
                          variables={extractedVariables}
                          sampleValues={sampleVariables}
                          onSampleChange={(key, value) => 
                            setSampleVariables(prev => ({ ...prev, [key]: value }))
                          }
                        />
                        {errors.variables && (
                          <p className="text-sm text-red-600 mt-1">{errors.variables}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Buttons Tab */}
                {activeTab === 'buttons' && (
                  <ButtonBuilder
                    buttons={formData.buttons}
                    onChange={(buttons) => updateFormData('buttons', buttons)}
                    maxButtons={3}
                  />
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                  <div className="space-y-6">
                    {/* Category */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category *
                      </label>
                      <div className="space-y-2">
                        {categories.map((category) => (
                          <label
                            key={category.value}
                            className={`flex items-start space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                              formData.category === category.value
                                ? 'border-primary-500 bg-primary-50'
                                : 'border-gray-200 hover:border-gray-300'
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
                              <p className="font-medium text-gray-900">{category.label}</p>
                              <p className="text-sm text-gray-500">{category.description}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Language */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Language *
                      </label>
                      <select
                        value={formData.language}
                        onChange={(e) => updateFormData('language', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                      >
                        {languages.map((lang) => (
                          <option key={lang.value} value={lang.value}>
                            {lang.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Info Box */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <div className="flex items-start space-x-3">
                        <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div className="text-sm text-blue-800">
                          <p className="font-medium mb-1">Review Process</p>
                          <p>
                            After submission, your template will be reviewed by Meta. 
                            This usually takes 24-48 hours. You'll be notified once approved.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Live Preview */}
          <div className="hidden lg:block">
            <div className="sticky top-36">
              <div className="bg-gray-900 rounded-2xl p-6">
                <h3 className="text-white font-medium mb-4 text-center">Live Preview</h3>
                <TemplatePreview
                  template={formData}
                  sampleVariables={sampleVariables}
                />
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