import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Send,
  Users,
  FileText,
  Settings,
  Clock,
  Loader2,
  Eye,
  AlertCircle
} from 'lucide-react';
import TemplateSelector from '../components/campaigns/TemplateSelector';
import AudienceSelector from '../components/campaigns/AudienceSelector';
import VariableMapper from '../components/campaigns/VariableMapper';
import SchedulePicker from '../components/campaigns/SchedulePicker';
import TemplatePreview from '../components/templates/TemplatePreview';
import type { CampaignFormData } from '../types/campaign';
import { templates as templateApi, contacts as contactApi, campaigns as campaignApi } from '../services/api';

const CreateCampaign: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [sending, setSending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  // Data States
  const [templates, setTemplates] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<CampaignFormData>({
    name: '',
    description: '',
    templateId: '',
    audienceType: 'all',
    selectedTags: [],
    selectedContacts: [],
    variableMapping: {},
    scheduleType: 'now',
    scheduledDate: '',
    scheduledTime: ''
  });

  // Fetch Templates and Contacts on Load
  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
        const [templatesRes, contactsRes] = await Promise.all([
          templateApi.getAll(),
          contactApi.getAll()
        ]);

        // Process Templates
        const templatesData = templatesRes.data?.templates || templatesRes.data || [];
        const mappedTemplates = templatesData.map((t: any) => ({
          id: t._id || t.id,
          name: t.name,
          category: (t.category || 'UTILITY').toLowerCase(),
          language: t.language || 'en',
          headerType: t.components?.find((c: any) => c.type === 'HEADER')?.format?.toLowerCase() || 'none',
          body: t.components?.find((c: any) => c.type === 'BODY')?.text || '',
          buttons: t.components?.find((c: any) => c.type === 'BUTTONS')?.buttons?.map((b: any) => ({ text: b.text })) || [],
          variables: extractVariables(t.components)
        }));
        setTemplates(mappedTemplates);

        // Process Contacts
        const contactsData = contactsRes.data?.contacts || contactsRes.data || [];
        const mappedContacts = contactsData.map((c: any) => ({
          id: c._id || c.id,
          name: `${c.firstName} ${c.lastName}`.trim(),
          phone: c.phone,
          tags: c.tags || []
        }));
        setContacts(mappedContacts);

        // Extract Unique Tags
        const tags = new Set<string>();
        mappedContacts.forEach((c: any) => c.tags.forEach((tag: string) => tags.add(tag)));
        setAvailableTags(Array.from(tags));

      } catch (err: any) {
        console.error("Failed to load data:", err);
        setApiError("Failed to load templates or contacts. Please refresh.");
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, []);

  // Helper to extract variables from template components
  const extractVariables = (components: any[]) => {
    const body = components?.find((c: any) => c.type === 'BODY')?.text || '';
    const matches = body.match(/\{\{(\d+)\}\}/g) || [];
    return [...new Set(matches.map((m: string) => m.replace(/[{}]/g, '')))];
  };

  // Get selected template
  const selectedTemplate = useMemo(() => 
    templates.find(t => t.id === formData.templateId),
    [formData.templateId, templates]
  );

  // Calculate total recipients
  const totalRecipients = useMemo(() => {
    switch (formData.audienceType) {
      case 'all':
        return contacts.length;
      case 'tags':
        return contacts.filter(c => 
          formData.selectedTags.some(tag => c.tags.includes(tag))
        ).length;
      case 'manual':
        return formData.selectedContacts.length;
      default:
        return 0;
    }
  }, [formData.audienceType, formData.selectedTags, formData.selectedContacts, contacts]);

  const steps = [
    { number: 1, title: 'Template', icon: FileText },
    { number: 2, title: 'Audience', icon: Users },
    { number: 3, title: 'Variables', icon: Settings },
    { number: 4, title: 'Schedule', icon: Clock },
  ];

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!formData.name.trim() && !!formData.templateId;
      case 2:
        return totalRecipients > 0;
      case 3:
        if (!selectedTemplate) return true;
        // Check if all variables are mapped
        return (selectedTemplate.variables || []).every((v: string) => formData.variableMapping[v]);
      case 4:
        if (formData.scheduleType === 'later') {
          return !!formData.scheduledDate && !!formData.scheduledTime;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep) && currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSend = async () => {
    setSending(true);
    setApiError(null);

    try {
      // Determine final audience based on type
      let audiencePayload: any = { type: formData.audienceType };

      if (formData.audienceType === 'all') {
        audiencePayload.contactIds = contacts.map(c => c.id);
      } else if (formData.audienceType === 'tags') {
        audiencePayload.tags = formData.selectedTags;
        audiencePayload.contactIds = contacts
          .filter(c => formData.selectedTags.some(tag => c.tags.includes(tag)))
          .map(c => c.id);
      } else if (formData.audienceType === 'manual') {
        audiencePayload.contactIds = formData.selectedContacts;
      }

      // Construct Payload
      const payload = {
        name: formData.name,
        description: formData.description,
        templateId: formData.templateId,
        audience: audiencePayload,
        variables: formData.variableMapping,
        schedule: formData.scheduleType === 'later' ? {
          date: formData.scheduledDate,
          time: formData.scheduledTime
        } : undefined
      };

      // Call API
      const response = await campaignApi.create(payload);
      console.log('Campaign Created:', response.data);

      navigate('/dashboard/campaigns');
    } catch (error: any) {
      console.error("Campaign Creation Error:", error);
      setApiError(error.response?.data?.message || 'Failed to create campaign');
    } finally {
      setSending(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading templates and contacts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                to="/dashboard/campaigns"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Create Campaign</h1>
                <p className="text-sm text-gray-500">Step {currentStep} of 4</p>
              </div>
            </div>
            
            {selectedTemplate && (
              <button
                onClick={() => setShowPreview(true)}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <Eye className="w-5 h-5" />
                <span>Preview</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Error Banner */}
        {apiError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <p className="text-red-700">{apiError}</p>
          </div>
        )}

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div className="flex items-center">
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                      step.number < currentStep
                        ? 'bg-primary-500 text-white'
                        : step.number === currentStep
                          ? 'bg-primary-500 text-white ring-4 ring-primary-100'
                          : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step.number < currentStep ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </div>
                  <span className={`ml-3 font-medium hidden sm:inline ${
                    step.number <= currentStep ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-4 rounded ${
                    step.number < currentStep ? 'bg-primary-500' : 'bg-gray-200'
                  }`}></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          {/* Step 1: Template Selection */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Campaign Details</h2>
                <p className="text-gray-500">Name your campaign and select a template</p>
              </div>

              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Campaign Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Diwali Sale 2024"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of this campaign..."
                    rows={2}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 resize-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Template *
                </label>
                {templates.length > 0 ? (
                  <TemplateSelector
                    templates={templates}
                    selectedId={formData.templateId}
                    onSelect={(template) => setFormData({ ...formData, templateId: template.id })}
                    onPreview={(template) => console.log('Preview:', template)}
                  />
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <p className="text-gray-500">No templates found. Create a template first.</p>
                    <Link to="/dashboard/templates/new" className="text-primary-600 hover:underline mt-2 inline-block">
                      Create Template
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Audience Selection */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Select Audience</h2>
                <p className="text-gray-500">Choose who should receive this campaign</p>
              </div>

              <AudienceSelector
                audienceType={formData.audienceType}
                onTypeChange={(type) => setFormData({ ...formData, audienceType: type })}
                selectedTags={formData.selectedTags}
                onTagsChange={(tags) => setFormData({ ...formData, selectedTags: tags })}
                selectedContacts={formData.selectedContacts}
                onContactsChange={(contacts) => setFormData({ ...formData, selectedContacts: contacts })}
                availableTags={availableTags}
                contacts={contacts}
                totalSelected={totalRecipients}
              />
            </div>
          )}

          {/* Step 3: Variable Mapping */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Map Variables</h2>
                <p className="text-gray-500">Connect template variables to contact fields</p>
              </div>

              {selectedTemplate?.variables && selectedTemplate.variables.length > 0 ? (
                <VariableMapper
                  variables={selectedTemplate.variables}
                  mapping={formData.variableMapping}
                  onMappingChange={(mapping) => setFormData({ ...formData, variableMapping: mapping })}
                />
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-xl">
                  <p className="text-gray-500">This template has no variables to map.</p>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Schedule */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Schedule Campaign</h2>
                <p className="text-gray-500">Choose when to send your campaign</p>
              </div>

              <SchedulePicker
                scheduleType={formData.scheduleType}
                onTypeChange={(type) => setFormData({ ...formData, scheduleType: type })}
                scheduledDate={formData.scheduledDate || ''}
                scheduledTime={formData.scheduledTime || ''}
                onDateChange={(date) => setFormData({ ...formData, scheduledDate: date })}
                onTimeChange={(time) => setFormData({ ...formData, scheduledTime: time })}
              />

              {/* Campaign Summary */}
              <div className="bg-gray-50 rounded-xl p-6 mt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Campaign Summary</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Campaign Name</p>
                    <p className="font-medium text-gray-900">{formData.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Template</p>
                    <p className="font-medium text-gray-900">{selectedTemplate?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Recipients</p>
                    <p className="font-medium text-gray-900">{totalRecipients.toLocaleString()} contacts</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Schedule</p>
                    <p className="font-medium text-gray-900">
                      {formData.scheduleType === 'now' 
                        ? 'Send Immediately' 
                        : `${formData.scheduledDate} at ${formData.scheduledTime}`
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className="flex items-center space-x-2 px-5 py-2.5 text-gray-700 font-medium rounded-xl hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>

          {currentStep < 4 ? (
            <button
              onClick={handleNext}
              disabled={!validateStep(currentStep)}
              className="flex items-center space-x-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span>Continue</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={sending || !validateStep(currentStep)}
              className="flex items-center space-x-2 px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {sending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>
                    {formData.scheduleType === 'now' ? 'Send Now' : 'Schedule Campaign'}
                  </span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Template Preview Modal */}
      {showPreview && selectedTemplate && (
        <TemplatePreview
          template={{
            name: selectedTemplate.name,
            category: selectedTemplate.category as any,
            language: selectedTemplate.language,
            header: { type: selectedTemplate.headerType as any },
            body: selectedTemplate.body,
            footer: '',
            buttons: selectedTemplate.buttons.map((b: any, i: number) => ({
              id: String(i),
              type: 'quick_reply' as const,
              text: b.text
            }))
          }}
          sampleVariables={{}}
          isModal
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
};

export default CreateCampaign;