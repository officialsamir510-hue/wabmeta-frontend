// src/pages/CreateCampaign.tsx

import React, { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  AlertCircle,
  Wifi,
} from "lucide-react";

import TemplateSelector from "../components/campaigns/TemplateSelector";
import AudienceSelector from "../components/campaigns/AudienceSelector";
import VariableMapper from "../components/campaigns/VariableMapper";
import SchedulePicker from "../components/campaigns/SchedulePicker";
import TemplatePreview from "../components/templates/TemplatePreview";
import CsvAudienceUploader from "../components/campaigns/CsvAudienceUploader";

import type { CampaignFormData } from "../types/campaign";
import {
  templates as templateApi,
  contacts as contactApi,
  campaigns as campaignApi,
  whatsapp as whatsappApi,
} from "../services/api";

// ============================================
// TYPES
// ============================================
interface MappedTemplate {
  id: string;
  name: string;
  category: string;
  language: string;
  headerType: string;
  body: string;
  buttons: { text: string }[];
  variables: string[];

  // ✅ IMPORTANT: so we can filter by account if needed
  whatsappAccountId?: string;
  wabaId?: string;
}

interface MappedContact {
  id: string;
  name: string;
  phone: string;
  tags: string[];
}

type WhatsAppAccountLite = {
  id: string;
  phoneNumberId?: string;
  phoneNumber?: string;
  displayName?: string;
  isDefault?: boolean;
  status?: string;
};

// ============================================
// HELPER FUNCTIONS
// ============================================
const extractVariablesFromBody = (bodyText: string): string[] => {
  if (!bodyText) return [];
  const matches = bodyText.match(/\{\{(\d+)\}\}/g) || [];
  return [...new Set(matches.map((m: string) => m.replace(/[{}]/g, "")))].sort(
    (a, b) => Number(a) - Number(b)
  );
};

const parseApiArray = <T,>(resp: any, keys: string[] = []): T[] => {
  // supports axios response.data and your ApiResponse wrapper shapes
  const data = resp?.data ?? resp;

  // If direct array
  if (Array.isArray(data)) return data;

  // If { success, data: [...] }
  if (Array.isArray(data?.data)) return data.data;

  // If { success, data: { templates: [...] } }
  if (data?.data && typeof data.data === "object") {
    for (const k of keys) {
      if (Array.isArray(data.data[k])) return data.data[k];
    }
  }

  // If { templates: [...] }
  for (const k of keys) {
    if (Array.isArray(data?.[k])) return data[k];
  }

  return [];
};

const mapHeaderForPreview = (headerType: string) => {
  const ht = String(headerType || "none").toLowerCase();
  if (ht === "none" || ht === "null" || ht === "undefined") return { type: "none" as const };
  if (ht === "text") return { type: "text" as const, text: "" };
  if (ht === "image") return { type: "image" as const, mediaUrl: undefined };
  if (ht === "video") return { type: "video" as const, mediaUrl: undefined };
  if (ht === "document") return { type: "document" as const, mediaUrl: undefined };
  return { type: "none" as const };
};

// ============================================
// COMPONENT
// ============================================
const CreateCampaign: React.FC = () => {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [sending, setSending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Data States
  const [templates, setTemplates] = useState<MappedTemplate[]>([]);
  const [contacts, setContacts] = useState<MappedContact[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // ✅ WhatsApp account state
  const [whatsappAccounts, setWhatsappAccounts] = useState<WhatsAppAccountLite[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [loadingAccounts, setLoadingAccounts] = useState(true);

  // Form State
  const [formData, setFormData] = useState<CampaignFormData>({
    name: "",
    description: "",
    templateId: "",
    audienceType: "all",
    selectedTags: [],
    selectedContacts: [],
    variableMapping: {},
    scheduleType: "now",
    scheduledDate: "",
    scheduledTime: "",
  });

  // ==========================================
  // LOAD WHATSAPP ACCOUNTS (CONNECTED ONLY)
  // ==========================================
  useEffect(() => {
    const loadAccounts = async () => {
      setApiError(null);

      try {
        setLoadingAccounts(true);
        const res = await whatsappApi.accounts();

        const accountsArr = parseApiArray<any>(res, ["accounts", "items", "data"]);
        const connected = (accountsArr || []).filter(
          (a: any) => String(a.status || "").toUpperCase() === "CONNECTED"
        );

        if (!connected.length) {
          throw new Error("No WhatsApp accounts connected. Please connect one in Settings → WhatsApp.");
        }

        setWhatsappAccounts(connected);

        const def = connected.find((a: any) => a.isDefault) || connected[0];
        setSelectedAccountId(def.id);
      } catch (e: any) {
        setApiError(e?.response?.data?.message || e?.message || "Failed to load WhatsApp accounts.");
      } finally {
        setLoadingAccounts(false);
      }
    };

    loadAccounts();
  }, []);

  // Clear selected template when account changes (prevents mismatch)
  useEffect(() => {
    setFormData((p) => ({ ...p, templateId: "" }));
  }, [selectedAccountId]);

  // ==========================================
  // FETCH TEMPLATES (ACCOUNT-SPECIFIC) + CONTACTS
  // ==========================================
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedAccountId) return;

      setLoadingData(true);
      setApiError(null);

      try {
        const [templatesRes, contactsRes] = await Promise.all([
          // ✅ IMPORTANT: filter templates by whatsappAccountId
          templateApi.getAll({ whatsappAccountId: selectedAccountId }),
          contactApi.getAll(),
        ]);

        // Templates
        const templatesArray = parseApiArray<any>(templatesRes, ["templates", "items", "data"]);
        const mappedTemplates: MappedTemplate[] = (templatesArray || []).map((t: any) => ({
          id: t._id || t.id,
          name: t.name || "Untitled",
          category: (t.category || "UTILITY").toLowerCase(),
          language: t.language || "en_US",
          headerType: (t.headerType || "NONE").toLowerCase(),
          body: t.bodyText || t.body || "",
          buttons: Array.isArray(t.buttons) ? t.buttons.map((b: any) => ({ text: b.text || "" })) : [],
          variables: extractVariablesFromBody(t.bodyText || t.body || ""),
          whatsappAccountId: t.whatsappAccountId,
          wabaId: t.wabaId,
        }));
        setTemplates(mappedTemplates);

        // Contacts
        const contactsArray = parseApiArray<any>(contactsRes, ["contacts", "items", "data"]);
        const mappedContacts: MappedContact[] = (contactsArray || []).map((c: any) => ({
          id: c._id || c.id,
          name: `${c.firstName || ""} ${c.lastName || ""}`.trim() || c.phone || "Unknown",
          phone: c.phone || "",
          tags: Array.isArray(c.tags) ? c.tags : [],
        }));
        setContacts(mappedContacts);

        // Tags
        const tagsSet = new Set<string>();
        mappedContacts.forEach((c) => c.tags.forEach((tag: string) => tagsSet.add(tag)));
        setAvailableTags(Array.from(tagsSet));
      } catch (err: any) {
        console.error("❌ Failed to load data:", err);
        setApiError(
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load templates/contacts. Please refresh."
        );
      } finally {
        setLoadingData(false);
      }
    };

    if (!loadingAccounts && selectedAccountId) {
      fetchData();
    }
  }, [loadingAccounts, selectedAccountId]);

  // ==========================================
  // CSV IMPORT HANDLER
  // ==========================================
  const handleCsvImported = async (batchTag: string) => {
    try {
      const res = await contactApi.getAll({ tags: batchTag, limit: 10000 });
      const importedArray = parseApiArray<any>(res, ["contacts", "items", "data"]);

      const importedContacts: MappedContact[] = (importedArray || []).map((c: any) => ({
        id: c._id || c.id,
        name: `${c.firstName || ""} ${c.lastName || ""}`.trim() || c.phone || "Unknown",
        phone: c.phone || "",
        tags: Array.isArray(c.tags) ? c.tags : [],
      }));

      setContacts((prev) => {
        const map = new Map<string, MappedContact>();
        prev.forEach((p) => map.set(p.id, p));
        importedContacts.forEach((c) => map.set(c.id, c));
        return Array.from(map.values());
      });

      setAvailableTags((prev) => Array.from(new Set([...prev, batchTag])));

      setFormData((prev) => ({
        ...prev,
        audienceType: "tags",
        selectedTags: [batchTag],
        selectedContacts: [],
      }));
    } catch (e: any) {
      console.error("❌ Failed to refresh imported contacts:", e);
      setApiError(e?.response?.data?.message || "Imported, but failed to refresh contact list.");
    }
  };

  // ==========================================
  // COMPUTED VALUES
  // ==========================================
  const selectedTemplate = useMemo(
    () => templates.find((t) => t.id === formData.templateId),
    [formData.templateId, templates]
  );

  const totalRecipients = useMemo(() => {
    switch (formData.audienceType) {
      case "all":
        return contacts.length;
      case "tags":
        return contacts.filter((c) => formData.selectedTags.some((tag) => c.tags.includes(tag))).length;
      case "manual":
        return formData.selectedContacts.length;
      default:
        return 0;
    }
  }, [formData.audienceType, formData.selectedTags, formData.selectedContacts, contacts]);

  // ==========================================
  // STEPS CONFIG
  // ==========================================
  const steps = [
    { number: 1, title: "Template", icon: FileText },
    { number: 2, title: "Audience", icon: Users },
    { number: 3, title: "Variables", icon: Settings },
    { number: 4, title: "Schedule", icon: Clock },
  ];

  // ==========================================
  // VALIDATION
  // ==========================================
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!formData.name.trim() && !!formData.templateId && !!selectedAccountId;
      case 2:
        return totalRecipients > 0;
      case 3:
        if (!selectedTemplate) return true;
        return (selectedTemplate.variables || []).every((v: string) => formData.variableMapping[v]);
      case 4:
        if (formData.scheduleType === "later") {
          return !!formData.scheduledDate && !!formData.scheduledTime;
        }
        return true;
      default:
        return true;
    }
  };

  // ==========================================
  // NAVIGATION
  // ==========================================
  const handleNext = () => {
    if (validateStep(currentStep) && currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  // ==========================================
  // SUBMIT CAMPAIGN (USES SELECTED ACCOUNT)
  // ==========================================
  const handleSend = async () => {
    setSending(true);
    setApiError(null);

    try {
      const whatsappAccount = whatsappAccounts.find((a) => a.id === selectedAccountId);

      if (!whatsappAccount?.id) {
        throw new Error("Please select a WhatsApp account.");
      }

      if (!whatsappAccount.phoneNumberId) {
        throw new Error("Selected WhatsApp account missing phoneNumberId. Please reconnect WhatsApp.");
      }

      if (!formData.templateId) {
        throw new Error("Please select a template.");
      }

      // Determine contact IDs
      let audienceContactIds: string[] = [];

      if (formData.audienceType === "all") {
        audienceContactIds = contacts.map((c) => c.id);
      } else if (formData.audienceType === "tags") {
        audienceContactIds = contacts
          .filter((c) => formData.selectedTags.some((tag) => c.tags.includes(tag)))
          .map((c) => c.id);
      } else if (formData.audienceType === "manual") {
        audienceContactIds = formData.selectedContacts;
      }

      if (audienceContactIds.length === 0) {
        throw new Error("No recipients selected. Please check your audience filters.");
      }

      // scheduledAt
      const scheduledAt =
        formData.scheduleType === "later"
          ? new Date(`${formData.scheduledDate}T${formData.scheduledTime}:00`).toISOString()
          : undefined;

      const payload = {
        name: formData.name.trim(),
        description: formData.description?.trim() || undefined,
        templateId: formData.templateId,
        contactIds: audienceContactIds,

        // ✅ CRITICAL: consistent account selection
        whatsappAccountId: whatsappAccount.id,
        phoneNumberId: whatsappAccount.phoneNumberId,

        audienceFilter:
          formData.audienceType === "tags"
            ? { tags: formData.selectedTags }
            : formData.audienceType === "all"
              ? { all: true }
              : undefined,
        variableMapping:
          Object.keys(formData.variableMapping).length > 0
            ? formData.variableMapping
            : undefined,
        scheduledAt,
      };

      console.log("📤 Campaign Payload:", payload);

      await campaignApi.create(payload);
      navigate("/dashboard/campaigns");
    } catch (error: any) {
      console.error("❌ Campaign creation error:", error);

      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to create campaign";

      setApiError(errorMessage);
    } finally {
      setSending(false);
    }
  };

  // ==========================================
  // LOADING STATE
  // ==========================================
  if (loadingAccounts || loadingData) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            Loading WhatsApp accounts, templates and contacts...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // MAIN RENDER
  // ==========================================
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-16 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                to="/dashboard/campaigns"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Create Campaign</h1>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <span>Step {currentStep} of 4</span>
                  <span>•</span>
                  <span className="flex items-center text-green-600 dark:text-green-400">
                    <Wifi className="w-3 h-3 mr-1" />
                    Connected
                  </span>
                </div>
              </div>
            </div>

            {selectedTemplate && (
              <button
                onClick={() => setShowPreview(true)}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
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
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-700 dark:text-red-300 font-medium">Error</p>
              <p className="text-red-600 dark:text-red-400 text-sm">{apiError}</p>
            </div>
            <button
              onClick={() => setApiError(null)}
              className="text-red-400 hover:text-red-600 dark:hover:text-red-300 text-xl"
            >
              ×
            </button>
          </div>
        )}

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${step.number < currentStep
                        ? "bg-primary-500 text-white"
                        : step.number === currentStep
                          ? "bg-primary-500 text-white ring-4 ring-primary-100 dark:ring-primary-900"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                      }`}
                  >
                    {step.number < currentStep ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </div>
                  <span
                    className={`ml-3 font-medium hidden sm:inline ${step.number <= currentStep
                        ? "text-gray-900 dark:text-white"
                        : "text-gray-500 dark:text-gray-400"
                      }`}
                  >
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-4 rounded ${step.number < currentStep ? "bg-primary-500" : "bg-gray-200 dark:bg-gray-700"
                      }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          {/* Step 1: Template Selection */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  Campaign Details
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                  Select WhatsApp account and a template
                </p>
              </div>

              {/* ✅ WhatsApp Account Select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  WhatsApp Account *
                </label>
                <select
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {whatsappAccounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {(a.displayName || "WhatsApp")} - {(a.phoneNumber || "")} {a.isDefault ? "(Default)" : ""}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Templates will be filtered for this account.
                </p>
              </div>

              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Campaign Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Diwali Sale 2026"
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description..."
                    rows={2}
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Template *
                </label>

                {templates.length > 0 ? (
                  <TemplateSelector
                    templates={templates}
                    selectedId={formData.templateId}
                    onSelect={(template) => setFormData({ ...formData, templateId: template.id })}
                    onPreview={(template) => console.log("Preview:", template)}
                  />
                ) : (
                  <div className="text-center py-8 bg-gray-50 dark:bg-gray-900 rounded-xl border border-dashed border-gray-300 dark:border-gray-600">
                    <FileText className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 dark:text-gray-400">
                      No templates found for this WhatsApp account.
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Sync templates for this number, or create a new template for this account.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Audience Selection */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  Select Audience
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                  Choose who should receive this campaign
                </p>
              </div>

              {contacts.length > 0 ? (
                <AudienceSelector
                  audienceType={formData.audienceType}
                  onTypeChange={(type) => setFormData({ ...formData, audienceType: type })}
                  selectedTags={formData.selectedTags}
                  onTagsChange={(tags) => setFormData({ ...formData, selectedTags: tags })}
                  selectedContacts={formData.selectedContacts}
                  onContactsChange={(c) => setFormData({ ...formData, selectedContacts: c })}
                  availableTags={availableTags}
                  contacts={contacts}
                  totalSelected={totalRecipients}
                />
              ) : (
                <div className="text-center py-6 bg-gray-50 dark:bg-gray-900 rounded-xl border border-dashed border-gray-300 dark:border-gray-600">
                  <Users className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No contacts found yet. Upload CSV to import.
                  </p>
                </div>
              )}

              <CsvAudienceUploader onImported={handleCsvImported} />
            </div>
          )}

          {/* Step 3: Variable Mapping */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  Map Variables
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                  Connect template variables to contact fields
                </p>
              </div>

              {selectedTemplate?.variables && selectedTemplate.variables.length > 0 ? (
                <VariableMapper
                  variables={selectedTemplate.variables}
                  mapping={formData.variableMapping}
                  onMappingChange={(mapping) =>
                    setFormData({ ...formData, variableMapping: mapping })
                  }
                />
              ) : (
                <div className="text-center py-8 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                  <Check className="w-10 h-10 text-green-500 dark:text-green-400 mx-auto mb-2" />
                  <p className="text-green-700 dark:text-green-300 font-medium">No Variables Required</p>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Schedule */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  Schedule Campaign
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                  Choose when to send your campaign
                </p>
              </div>

              <SchedulePicker
                scheduleType={formData.scheduleType}
                onTypeChange={(type) => setFormData({ ...formData, scheduleType: type })}
                scheduledDate={formData.scheduledDate || ""}
                scheduledTime={formData.scheduledTime || ""}
                onDateChange={(date) => setFormData({ ...formData, scheduledDate: date })}
                onTimeChange={(time) => setFormData({ ...formData, scheduledTime: time })}
              />
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className="flex items-center space-x-2 px-5 py-2.5 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>

          {currentStep < 4 ? (
            <button
              onClick={handleNext}
              disabled={!validateStep(currentStep)}
              className="flex items-center space-x-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl disabled:opacity-50"
            >
              <span>Continue</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={sending || !validateStep(currentStep)}
              className="flex items-center space-x-2 px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl disabled:opacity-50"
            >
              {sending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Creating Campaign...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>{formData.scheduleType === "now" ? "Send Now" : "Schedule Campaign"}</span>
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
            header: mapHeaderForPreview(selectedTemplate.headerType) as any,
            body: selectedTemplate.body,
            footer: "",
            buttons: selectedTemplate.buttons.map((b: any, i: number) => ({
              id: String(i),
              type: "quick_reply" as const,
              text: b.text,
            })),
          }}
          sampleVariables={formData.variableMapping}
          isModal
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
};

export default CreateCampaign;