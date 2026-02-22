// src/pages/CreateCampaign.tsx - COMPLETE (CSV REMOVED, GROUP ADDED)

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

import type { CampaignFormData } from "../types/campaign";
import {
  templates as templateApi,
  contacts as contactApi,
  campaigns as campaignApi,
  whatsapp as whatsappApi,
} from "../services/api";

// TYPES
interface MappedTemplate {
  id: string;
  name: string;
  category: string;
  language: string;
  headerType: string;
  body: string;
  buttons: { text: string }[];
  variables: string[];
  whatsappAccountId?: string;
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

// HELPERS
const extractVariablesFromBody = (bodyText: string): string[] => {
  if (!bodyText) return [];
  const matches = bodyText.match(/\{\{(\d+)\}\}/g) || [];
  return [...new Set(matches.map((m: string) => m.replace(/[{}]/g, "")))].sort(
    (a, b) => Number(a) - Number(b)
  );
};

const parseApiArray = <T,>(resp: any, keys: string[] = []): T[] => {
  const data = resp?.data ?? resp;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (data?.data && typeof data.data === "object") {
    for (const k of keys) {
      if (Array.isArray(data.data[k])) return data.data[k];
    }
  }
  for (const k of keys) {
    if (Array.isArray(data?.[k])) return data[k];
  }
  return [];
};

const mapHeaderForPreview = (headerType: string) => {
  const ht = String(headerType || "none").toLowerCase();
  if (ht === "none" || ht === "null") return { type: "none" as const };
  if (ht === "text") return { type: "text" as const, text: "" };
  if (ht === "image") return { type: "image" as const, mediaUrl: undefined };
  if (ht === "video") return { type: "video" as const, mediaUrl: undefined };
  if (ht === "document") return { type: "document" as const, mediaUrl: undefined };
  return { type: "none" as const };
};

const CreateCampaign: React.FC = () => {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [sending, setSending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Data
  const [templates, setTemplates] = useState<MappedTemplate[]>([]);
  const [contacts, setContacts] = useState<MappedContact[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // Accounts
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
    selectedGroup: "", // ✅ Added
    variableMapping: {},
    scheduleType: "now",
    scheduledDate: "",
    scheduledTime: "",
  });

  // Load Accounts
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

  // Load Templates & Contacts
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedAccountId) return;
      setLoadingData(true);
      setApiError(null);

      try {
        const [templatesRes, contactsRes] = await Promise.all([
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
        setApiError(err?.response?.data?.message || err?.message || "Failed to load data.");
      } finally {
        setLoadingData(false);
      }
    };

    if (!loadingAccounts && selectedAccountId) {
      fetchData();
    }
  }, [loadingAccounts, selectedAccountId]);

  // Computed
  const selectedTemplate = useMemo(
    () => templates.find((t) => t.id === formData.templateId),
    [formData.templateId, templates]
  );

  // Note: For 'group', we don't know exact count until send, but we can fetch it if needed.
  // For now we assume if group selected > 0.
  const totalRecipients = useMemo(() => {
    switch (formData.audienceType) {
      case "all":
        return contacts.length;
      case "tags":
        return contacts.filter((c) => formData.selectedTags.some((tag) => c.tags.includes(tag))).length;
      case "manual":
        return formData.selectedContacts.length;
      case "group":
        // We don't have group member count locally here without extra API call
        // Assuming user selected a group with members.
        return formData.selectedGroup ? 1 : 0;
      default:
        return 0;
    }
  }, [formData.audienceType, formData.selectedTags, formData.selectedContacts, formData.selectedGroup, contacts]);

  const steps = [
    { number: 1, title: "Template", icon: FileText },
    { number: 2, title: "Audience", icon: Users },
    { number: 3, title: "Variables", icon: Settings },
    { number: 4, title: "Schedule", icon: Clock },
  ];

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!formData.name.trim() && !!formData.templateId && !!selectedAccountId;
      case 2:
        if (formData.audienceType === 'group') return !!formData.selectedGroup;
        return totalRecipients > 0;
      case 3:
        if (!selectedTemplate) return true;
        return (selectedTemplate.variables || []).every((v: string) => formData.variableMapping[v]);
      case 4:
        if (formData.scheduleType === "later") return !!formData.scheduledDate && !!formData.scheduledTime;
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => { if (validateStep(currentStep) && currentStep < 4) setCurrentStep(currentStep + 1); };
  const handleBack = () => { if (currentStep > 1) setCurrentStep(currentStep - 1); };

  const handleSend = async () => {
    setSending(true);
    setApiError(null);

    try {
      const whatsappAccount = whatsappAccounts.find((a) => a.id === selectedAccountId);
      if (!whatsappAccount?.id || !whatsappAccount.phoneNumberId) throw new Error("Invalid WhatsApp account.");
      if (!formData.templateId) throw new Error("Please select a template.");

      let contactIds: string[] | undefined = undefined;
      let contactGroupId: string | undefined = undefined;
      let audienceFilter: any = undefined;

      // Logic mapping
      if (formData.audienceType === "all") {
        audienceFilter = { all: true };
      } else if (formData.audienceType === "tags") {
        audienceFilter = { tags: formData.selectedTags };
        // Optionally resolve IDs here if backend requires IDs
        contactIds = contacts
          .filter((c) => formData.selectedTags.some((tag) => c.tags.includes(tag)))
          .map(c => c.id);
      } else if (formData.audienceType === "manual") {
        contactIds = formData.selectedContacts;
      } else if (formData.audienceType === "group") {
        contactGroupId = formData.selectedGroup;
      }

      if (
        (formData.audienceType === "manual" && (!contactIds || contactIds.length === 0)) ||
        (formData.audienceType === "group" && !contactGroupId)
      ) {
        throw new Error("No recipients selected.");
      }

      const scheduledAt =
        formData.scheduleType === "later"
          ? new Date(`${formData.scheduledDate}T${formData.scheduledTime}:00`).toISOString()
          : undefined;

      const payload = {
        name: formData.name.trim(),
        description: formData.description?.trim() || undefined,
        templateId: formData.templateId,

        contactIds,       // Used for manual / tags
        contactGroupId,   // Used for group
        audienceFilter,   // Used for tags / all

        whatsappAccountId: whatsappAccount.id,
        phoneNumberId: whatsappAccount.phoneNumberId,
        variableMapping: Object.keys(formData.variableMapping).length > 0 ? formData.variableMapping : undefined,
        scheduledAt,
      };

      console.log("📤 Campaign Payload:", payload);

      await campaignApi.create(payload);
      navigate("/dashboard/campaigns");
    } catch (error: any) {
      console.error("❌ Campaign creation error:", error);
      setApiError(error?.response?.data?.message || error?.message || "Failed to create campaign");
    } finally {
      setSending(false);
    }
  };

  if (loadingAccounts || loadingData) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-16 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard/campaigns" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Create Campaign</h1>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <span>Step {currentStep} of 4</span>
                  <span>•</span>
                  <span className="flex items-center text-green-600 dark:text-green-400">
                    <Wifi className="w-3 h-3 mr-1" /> Connected
                  </span>
                </div>
              </div>
            </div>
            {selectedTemplate && (
              <button onClick={() => setShowPreview(true)} className="flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl">
                <Eye className="w-5 h-5" /> <span>Preview</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {apiError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <div className="flex-1">
              <p className="text-red-700 font-medium">Error</p>
              <p className="text-red-600 text-sm">{apiError}</p>
            </div>
            <button onClick={() => setApiError(null)} className="text-red-400 hover:text-red-600 text-xl">×</button>
          </div>
        )}

        {/* Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${step.number < currentStep ? "bg-primary-500 text-white" : step.number === currentStep ? "bg-primary-500 text-white ring-4 ring-primary-100" : "bg-gray-200 text-gray-500"
                    }`}>
                    {step.number < currentStep ? <Check className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                  </div>
                  <span className={`ml-3 font-medium hidden sm:inline ${step.number <= currentStep ? "text-gray-900" : "text-gray-500"}`}>{step.title}</span>
                </div>
                {index < steps.length - 1 && <div className={`flex-1 h-1 mx-4 rounded ${step.number < currentStep ? "bg-primary-500" : "bg-gray-200"}`} />}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Campaign Details</h2>
                <p className="text-gray-500 dark:text-gray-400">Select WhatsApp account and a template</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">WhatsApp Account *</label>
                <select value={selectedAccountId} onChange={(e) => setSelectedAccountId(e.target.value)} className="w-full px-4 py-2.5 border rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  {whatsappAccounts.map((a) => (
                    <option key={a.id} value={a.id}>{a.displayName || "WhatsApp"} - {a.phoneNumber}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Campaign Name *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2.5 border rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="e.g. Diwali Sale" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Template *</label>
                <TemplateSelector templates={templates} selectedId={formData.templateId} onSelect={(t) => setFormData({ ...formData, templateId: t.id })} onPreview={() => { }} />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Select Audience</h2>
                <p className="text-gray-500 dark:text-gray-400">Choose who should receive this campaign</p>
              </div>
              <AudienceSelector
                audienceType={formData.audienceType}
                onTypeChange={(type) => setFormData({ ...formData, audienceType: type })}
                selectedTags={formData.selectedTags}
                onTagsChange={(tags) => setFormData({ ...formData, selectedTags: tags })}
                selectedContacts={formData.selectedContacts}
                onContactsChange={(c) => setFormData({ ...formData, selectedContacts: c })}
                selectedGroup={formData.selectedGroup || ''}
                onGroupChange={(g) => setFormData({ ...formData, selectedGroup: g })}
                availableTags={availableTags}
                contacts={contacts}
                totalSelected={totalRecipients}
              />
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">Map Variables</h2>
              {selectedTemplate?.variables?.length ? (
                <VariableMapper variables={selectedTemplate.variables} mapping={formData.variableMapping} onMappingChange={(m) => setFormData({ ...formData, variableMapping: m })} />
              ) : (
                <div className="text-center py-8 bg-green-50 rounded-xl border border-green-200">
                  <Check className="w-10 h-10 text-green-500 mx-auto mb-2" />
                  <p className="text-green-700 font-medium">No Variables Required</p>
                </div>
              )}
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">Schedule Campaign</h2>
              <SchedulePicker scheduleType={formData.scheduleType} onTypeChange={(t) => setFormData({ ...formData, scheduleType: t })} scheduledDate={formData.scheduledDate || ""} scheduledTime={formData.scheduledTime || ""} onDateChange={(d) => setFormData({ ...formData, scheduledDate: d })} onTimeChange={(t) => setFormData({ ...formData, scheduledTime: t })} />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-6">
          <button onClick={handleBack} disabled={currentStep === 1} className="flex items-center space-x-2 px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50">
            <ArrowLeft className="w-5 h-5" /> <span>Back</span>
          </button>
          {currentStep < 4 ? (
            <button onClick={handleNext} disabled={!validateStep(currentStep)} className="flex items-center space-x-2 px-5 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 disabled:opacity-50">
              <span>Continue</span> <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button onClick={handleSend} disabled={sending || !validateStep(currentStep)} className="flex items-center space-x-2 px-6 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 disabled:opacity-50">
              {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              <span>{formData.scheduleType === "now" ? "Send Now" : "Schedule"}</span>
            </button>
          )}
        </div>
      </div>

      {showPreview && selectedTemplate && (
        <TemplatePreview
          template={{
            name: selectedTemplate.name,
            category: selectedTemplate.category as any,
            language: selectedTemplate.language,
            header: mapHeaderForPreview(selectedTemplate.headerType) as any,
            body: selectedTemplate.body,
            footer: "",
            buttons: selectedTemplate.buttons.map((b: any, i: number) => ({ id: String(i), type: "quick_reply", text: b.text })),
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