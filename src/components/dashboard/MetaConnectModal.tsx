import React, { useState } from 'react';
import axios from 'axios';
import {
  X,
  MessageSquare,
  ExternalLink,
  CheckCircle2,
  Loader2,
  Shield,
  Zap,
  Phone,
  Building2,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  Star,
  TrendingUp,
  Key,
  Hash
} from 'lucide-react';
import type { WhatsAppBusinessAccount } from '../../types/meta';

interface MetaConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (accessToken: string, account: WhatsAppBusinessAccount) => void;
  isConnecting?: boolean;
}

type Step = 'intro' | 'manual-setup' | 'connecting' | 'select-account' | 'permissions' | 'success' | 'error';

// API Configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const MetaConnectModal: React.FC<MetaConnectModalProps> = ({
  isOpen,
  onClose,
  onConnect
}) => {
  const [step, setStep] = useState<Step>('intro');
  const [selectedAccount, setSelectedAccount] = useState<WhatsAppBusinessAccount | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Manual Setup Form State
  const [manualFormData, setManualFormData] = useState({
    wabaId: '',
    phoneNumberId: '',
    accessToken: '',
    businessName: '',
    phoneNumber: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Sample business accounts for OAuth flow
  const businessAccounts: WhatsAppBusinessAccount[] = [
    {
      id: '1234567890',
      name: 'My Business',
      phoneNumber: '+91 98765 43210',
      phoneNumberId: 'pn_123456',
      verificationStatus: 'verified',
      qualityRating: 'GREEN',
      messagingLimit: '1K/day'
    },
    {
      id: '0987654321',
      name: 'My Second Business',
      phoneNumber: '+91 87654 32109',
      phoneNumberId: 'pn_654321',
      verificationStatus: 'pending',
      qualityRating: 'YELLOW',
      messagingLimit: '250/day'
    },
    {
      id: '1122334455',
      name: 'Enterprise Account',
      phoneNumber: '+91 99999 88888',
      phoneNumberId: 'pn_789012',
      verificationStatus: 'verified',
      qualityRating: 'GREEN',
      messagingLimit: '10K/day'
    }
  ];

  const permissions = [
    { name: 'whatsapp_business_management', description: 'Manage WhatsApp Business Account' },
    { name: 'whatsapp_business_messaging', description: 'Send and receive messages' },
    { name: 'business_management', description: 'Access business information' },
  ];

  // Get quality rating color and icon
  const getQualityRatingStyle = (rating: string) => {
    switch (rating) {
      case 'GREEN':
        return { bg: 'bg-green-100', text: 'text-green-700', label: 'High Quality', icon: Star };
      case 'YELLOW':
        return { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Medium Quality', icon: TrendingUp };
      case 'RED':
        return { bg: 'bg-red-100', text: 'text-red-700', label: 'Low Quality', icon: AlertCircle };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Unknown', icon: AlertCircle };
    }
  };

  // Validate Manual Form
  const validateManualForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!manualFormData.wabaId.trim()) {
      errors.wabaId = 'WABA ID is required';
    }
    if (!manualFormData.phoneNumberId.trim()) {
      errors.phoneNumberId = 'Phone Number ID is required';
    }
    if (!manualFormData.accessToken.trim()) {
      errors.accessToken = 'Access Token is required';
    }
    if (!manualFormData.businessName.trim()) {
      errors.businessName = 'Business Name is required';
    }
    if (!manualFormData.phoneNumber.trim()) {
      errors.phoneNumber = 'Phone Number is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Meta OAuth Login
  const handleMetaLogin = () => {
    setStep('connecting');
    // Simulate OAuth flow - in production, this would open Meta OAuth popup
    setTimeout(() => {
      setStep('select-account');
    }, 2000);
  };

  // Handle Manual Setup Submit
  const handleManualSetup = async () => {
    if (!validateManualForm()) return;

    setIsLoading(true);
    setStep('connecting');
    setError(null);

    try {
      const token = localStorage.getItem('wabmeta_token') || localStorage.getItem('token');
      
      const response = await axios.post(
        `${API_URL}/api/meta/connect`,
        {
          wabaId: manualFormData.wabaId.trim(),
          phoneNumberId: manualFormData.phoneNumberId.trim(),
          accessToken: manualFormData.accessToken.trim(),
          businessName: manualFormData.businessName.trim(),
          phoneNumber: manualFormData.phoneNumber.trim()
        },
        {
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` })
          }
        }
      );

      if (response.data && response.data.success) {
        const accountData: WhatsAppBusinessAccount = {
          id: response.data.meta?.wabaId || manualFormData.wabaId,
          name: response.data.meta?.businessName || manualFormData.businessName,
          phoneNumber: response.data.meta?.phoneNumber || manualFormData.phoneNumber,
          phoneNumberId: response.data.meta?.phoneNumberId || manualFormData.phoneNumberId,
          verificationStatus: 'verified',
          qualityRating: 'GREEN',
          messagingLimit: '1K/day'
        };

        setSelectedAccount(accountData);
        setStep('success');

        setTimeout(() => {
          onConnect(
            response.data.meta?.accessToken || manualFormData.accessToken,
            accountData
          );
          onClose();
          resetModal();
        }, 1500);
      } else {
        throw new Error(response.data?.message || 'Connection failed');
      }
    } catch (err: any) {
      console.error('Meta Connect Error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to connect. Please check your credentials.');
      setStep('error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Select Account
  const handleSelectAccount = (account: WhatsAppBusinessAccount) => {
    setSelectedAccount(account);
    setStep('permissions');
  };

  // Handle Grant Permissions (OAuth Flow)
  const handleGrantPermissions = async () => {
    if (!selectedAccount) return;

    setIsLoading(true);
    setStep('connecting');
    setError(null);

    try {
      const token = localStorage.getItem('wabmeta_token') || localStorage.getItem('token');

      const response = await axios.post(
        `${API_URL}/api/meta/connect`,
        {
          wabaId: selectedAccount.id,
          phoneNumberId: selectedAccount.phoneNumberId,
          accessToken: 'oauth_access_token_from_meta', // This would come from OAuth flow
          businessName: selectedAccount.name,
          phoneNumber: selectedAccount.phoneNumber
        },
        {
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` })
          }
        }
      );

      if (response.data) {
        setStep('success');
        
        setTimeout(() => {
          onConnect(
            response.data.meta?.accessToken || 'connected_token',
            {
              ...selectedAccount,
              id: response.data.meta?.wabaId || selectedAccount.id,
              phoneNumberId: response.data.meta?.phoneNumberId || selectedAccount.phoneNumberId
            }
          );
          onClose();
          resetModal();
        }, 1500);
      }
    } catch (err: any) {
      console.error('Meta Connect Error:', err);
      setError(err.response?.data?.message || 'Failed to connect to server.');
      setStep('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setFormErrors({});
    setStep('intro');
  };

  const resetModal = () => {
    setStep('intro');
    setSelectedAccount(null);
    setError(null);
    setFormErrors({});
    setManualFormData({
      wabaId: '',
      phoneNumberId: '',
      accessToken: '',
      businessName: '',
      phoneNumber: ''
    });
  };

  const handleClose = () => {
    onClose();
    setTimeout(resetModal, 300);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="relative bg-linear-to-r from-[#1877F2] to-[#0668E1] p-6 text-white">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" className="w-8 h-8" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold">Connect with Meta</h2>
              <p className="text-white/80 text-sm">WhatsApp Business API</p>
            </div>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Step: Intro */}
          {step === 'intro' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Connect Your WhatsApp Business
                </h3>
                <p className="text-gray-500">
                  Link your WhatsApp Business Account to start sending messages.
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Zap, text: 'Bulk Messaging' },
                  { icon: MessageSquare, text: 'Live Chat' },
                  { icon: Shield, text: 'Secure API' },
                  { icon: Building2, text: 'Business Verified' },
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-xl">
                    <feature.icon className="w-5 h-5 text-primary-500" />
                    <span className="text-sm font-medium text-gray-700">{feature.text}</span>
                  </div>
                ))}
              </div>

              {/* Connect Buttons */}
              <div className="space-y-3">
                {/* OAuth Button */}
                <button
                  onClick={handleMetaLogin}
                  className="w-full flex items-center justify-center space-x-3 py-4 bg-[#1877F2] hover:bg-[#166FE5] text-white font-semibold rounded-xl transition-all transform hover:scale-[1.02]"
                >
                  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span>Continue with Facebook</span>
                  <ExternalLink className="w-4 h-4" />
                </button>

                {/* Divider */}
                <div className="flex items-center space-x-3">
                  <div className="flex-1 h-px bg-gray-200"></div>
                  <span className="text-sm text-gray-400">or</span>
                  <div className="flex-1 h-px bg-gray-200"></div>
                </div>

                {/* Manual Setup Button */}
                <button
                  onClick={() => setStep('manual-setup')}
                  className="w-full flex items-center justify-center space-x-2 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
                >
                  <Key className="w-5 h-5" />
                  <span>Manual Setup with API Keys</span>
                </button>
              </div>

              <p className="text-xs text-center text-gray-500">
                By connecting, you agree to Meta's Terms of Service and Privacy Policy
              </p>
            </div>
          )}

          {/* Step: Manual Setup */}
          {step === 'manual-setup' && (
            <div className="space-y-5">
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Manual Setup
                </h3>
                <p className="text-gray-500 text-sm">
                  Enter your WhatsApp Business API credentials
                </p>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Where to find these?</p>
                    <p>Get these from your <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer" className="underline">Meta Developer Dashboard</a></p>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                {/* Business Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Name
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={manualFormData.businessName}
                      onChange={(e) => setManualFormData({ ...manualFormData, businessName: e.target.value })}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        formErrors.businessName ? 'border-red-300' : 'border-gray-200'
                      }`}
                      placeholder="My Business Name"
                    />
                  </div>
                  {formErrors.businessName && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.businessName}</p>
                  )}
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    WhatsApp Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={manualFormData.phoneNumber}
                      onChange={(e) => setManualFormData({ ...manualFormData, phoneNumber: e.target.value })}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        formErrors.phoneNumber ? 'border-red-300' : 'border-gray-200'
                      }`}
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  {formErrors.phoneNumber && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.phoneNumber}</p>
                  )}
                </div>

                {/* WABA ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    WhatsApp Business Account ID (WABA ID)
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={manualFormData.wabaId}
                      onChange={(e) => setManualFormData({ ...manualFormData, wabaId: e.target.value })}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        formErrors.wabaId ? 'border-red-300' : 'border-gray-200'
                      }`}
                      placeholder="1234567890123456"
                    />
                  </div>
                  {formErrors.wabaId && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.wabaId}</p>
                  )}
                </div>

                {/* Phone Number ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number ID
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={manualFormData.phoneNumberId}
                      onChange={(e) => setManualFormData({ ...manualFormData, phoneNumberId: e.target.value })}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        formErrors.phoneNumberId ? 'border-red-300' : 'border-gray-200'
                      }`}
                      placeholder="1234567890123456"
                    />
                  </div>
                  {formErrors.phoneNumberId && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.phoneNumberId}</p>
                  )}
                </div>

                {/* Access Token */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Permanent Access Token
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <textarea
                      value={manualFormData.accessToken}
                      onChange={(e) => setManualFormData({ ...manualFormData, accessToken: e.target.value })}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none ${
                        formErrors.accessToken ? 'border-red-300' : 'border-gray-200'
                      }`}
                      placeholder="EAAxxxxxxxx..."
                      rows={3}
                    />
                  </div>
                  {formErrors.accessToken && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.accessToken}</p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-2">
                <button
                  onClick={() => {
                    setStep('intro');
                    setFormErrors({});
                  }}
                  className="flex-1 py-3 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleManualSetup}
                  disabled={isLoading}
                  className="flex-1 py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Connect</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step: Connecting */}
          {step === 'connecting' && (
            <div className="py-12 text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Connecting...</h3>
              <p className="text-gray-500">
                Please wait while we verify your credentials
              </p>
              <div className="mt-6 flex justify-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          )}

          {/* Step: Select Account */}
          {step === 'select-account' && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Select Business Account
                </h3>
                <p className="text-gray-500">
                  Choose which WhatsApp Business Account to connect
                </p>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {businessAccounts.map((account) => {
                  const qualityStyle = getQualityRatingStyle(account.qualityRating);
                  const QualityIcon = qualityStyle.icon;
                  
                  return (
                    <button
                      key={account.id}
                      onClick={() => handleSelectAccount(account)}
                      className="w-full p-4 border-2 border-gray-200 hover:border-primary-500 rounded-xl text-left transition-all hover:shadow-md group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                            <Phone className="w-6 h-6 text-green-600" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-semibold text-gray-900 truncate">{account.name}</h4>
                            <p className="text-sm text-gray-500">{account.phoneNumber}</p>
                            
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                account.verificationStatus === 'verified'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {account.verificationStatus === 'verified' ? '✓ Verified' : '⏳ Pending'}
                              </span>
                              
                              <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-medium ${qualityStyle.bg} ${qualityStyle.text}`}>
                                <QualityIcon className="w-3 h-3" />
                                <span>{qualityStyle.label}</span>
                              </span>
                              
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                📨 {account.messagingLimit}
                              </span>
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors shrink-0 mt-1" />
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={handleClose}
                  className="w-full py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Step: Permissions */}
          {step === 'permissions' && selectedAccount && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Grant Permissions
                </h3>
                <p className="text-gray-500">
                  WabMeta needs the following permissions
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Phone className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{selectedAccount.name}</p>
                    <p className="text-sm text-gray-500">{selectedAccount.phoneNumber}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {permissions.map((permission, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-xl">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">{permission.description}</p>
                      <p className="text-xs text-gray-500 font-mono">{permission.name}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start space-x-2">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-blue-800">
                    Your data is secure. We only access what's necessary.
                  </p>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setStep('select-account')}
                  className="flex-1 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleGrantPermissions}
                  disabled={isLoading}
                  className="flex-1 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <span>Grant & Connect</span>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step: Success */}
          {step === 'success' && selectedAccount && (
            <div className="py-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Successfully Connected! 🎉
              </h3>
              <p className="text-gray-500 mb-4">
                Your WhatsApp Business Account is now connected
              </p>
              
              <div className="bg-green-50 rounded-xl p-4 text-left mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Phone className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{selectedAccount.name}</p>
                    <p className="text-sm text-gray-500">{selectedAccount.phoneNumber}</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-green-200 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <span className="ml-1 font-medium text-green-600">Active</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Limit:</span>
                    <span className="ml-1 font-medium text-gray-900">{selectedAccount.messagingLimit}</span>
                  </div>
                </div>
              </div>
              
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-full font-medium">
                <CheckCircle2 className="w-4 h-4" />
                <span>Ready to send messages</span>
              </div>
            </div>
          )}

          {/* Step: Error */}
          {step === 'error' && (
            <div className="py-8 text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-10 h-10 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Connection Failed
              </h3>
              <p className="text-gray-500 mb-6">
                {error || 'Something went wrong. Please try again.'}
              </p>
              <div className="space-y-3">
                <button
                  onClick={handleRetry}
                  className="inline-flex items-center space-x-2 px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Try Again</span>
                </button>
                <div>
                  <a
                    href="https://developers.facebook.com/docs/whatsapp/cloud-api/get-started"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Need help? View Meta's setup guide
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MetaConnectModal;