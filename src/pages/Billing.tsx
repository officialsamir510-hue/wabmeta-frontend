// src/pages/Billing.tsx

import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import CurrentPlan from '../components/billing/CurrentPlan';
import UsageStats from '../components/billing/UsageStats';
import PaymentMethods from '../components/billing/PaymentMethods';
import InvoiceHistory from '../components/billing/InvoiceHistory';
import { billing as billingApi } from '../services/api';

interface PlanData {
  plan: {
    id: string;
    name: string;
    type: string;
    description: string | null;
    monthlyPrice: number;
    yearlyPrice: number;
    features: string[];
  };
  subscription: {
    id: string;
    status: string;
    billingCycle: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    cancelledAt: string | null;
  } | null;
  limits: {
    maxContacts: number;
    maxMessages: number;
    maxTeamMembers: number;
    maxCampaigns: number;
    maxChatbots: number;
    maxTemplates: number;
  };
}

interface UsageData {
  contacts: { used: number; limit: number; percentage: number };
  messages: { used: number; limit: number; percentage: number };
  teamMembers: { used: number; limit: number; percentage: number };
  campaigns: { used: number; limit: number; percentage: number };
  templates: { used: number; limit: number; percentage: number };
  chatbots: { used: number; limit: number; percentage: number };
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed';
  planName: string;
  billingCycle: string;
  createdAt: string;
  paidAt: string | null;
  downloadUrl: string | null;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'upi' | 'bank';
  last4?: string;
  brand?: string;
  expiryMonth?: string;
  expiryYear?: string;
  upiId?: string;
  bankName?: string;
  isDefault: boolean;
  createdAt: string;
}

const Billing: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [planData, setPlanData] = useState<PlanData | null>(null);
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [availablePlans, setAvailablePlans] = useState<any[]>([]);

  // Fetch all billing data
  const fetchBillingData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [planRes, usageRes, invoicesRes, methodsRes, plansRes] = await Promise.all([
        billingApi.getCurrentPlan(),
        billingApi.getUsage(),
        billingApi.getInvoices({ limit: 10 }),
        billingApi.getPaymentMethods(),
        billingApi.getPlans(),
      ]);

      console.log('📥 Billing Data:', {
        plan: planRes.data,
        usage: usageRes.data,
        invoices: invoicesRes.data,
        methods: methodsRes.data,
        plans: plansRes.data,
      });

      setPlanData(planRes.data?.data || planRes.data);
      setUsageData(usageRes.data?.data || usageRes.data);
      setInvoices(invoicesRes.data?.data || invoicesRes.data?.invoices || []);
      setPaymentMethods(methodsRes.data?.data || methodsRes.data || []);
      setAvailablePlans(plansRes.data?.data || plansRes.data || []);

    } catch (err: any) {
      console.error('❌ Failed to fetch billing data:', err);
      setError(err.response?.data?.message || 'Failed to load billing information');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBillingData();
  }, []);

  // Handle plan upgrade
  const handleUpgrade = async (planType: string, billingCycle: 'monthly' | 'yearly') => {
    try {
      await billingApi.upgrade({ planType, billingCycle });
      await fetchBillingData(); // Refresh data
      alert('Plan upgraded successfully!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to upgrade plan');
    }
  };

  // Handle subscription cancellation
  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription?')) return;
    
    try {
      await billingApi.cancel();
      await fetchBillingData();
      alert('Subscription cancelled');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel subscription');
    }
  };

  // Handle payment method actions
  const handleAddPaymentMethod = async (data: any) => {
    try {
      await billingApi.addPaymentMethod(data);
      await fetchBillingData();
    } catch (err: any) {
      throw err;
    }
  };

  const handleDeletePaymentMethod = async (id: string) => {
    try {
      await billingApi.deletePaymentMethod(id);
      setPaymentMethods(paymentMethods.filter(m => m.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete payment method');
    }
  };

  const handleSetDefaultPaymentMethod = async (id: string) => {
    try {
      await billingApi.setDefaultPaymentMethod(id);
      setPaymentMethods(paymentMethods.map(m => ({
        ...m,
        isDefault: m.id === id
      })));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to set default');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading billing information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing & Subscription</h1>
          <p className="text-gray-500 mt-1">Manage your plan, payments and invoices</p>
        </div>
        <button
          onClick={fetchBillingData}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <div className="flex-1">
            <p className="text-red-700 font-medium">Error</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">×</button>
        </div>
      )}

      {/* Plan & Usage */}
      <div className="grid lg:grid-cols-2 gap-6">
        <CurrentPlan 
          planData={planData}
          availablePlans={availablePlans}
          onUpgrade={handleUpgrade}
          onCancel={handleCancel}
        />
        <UsageStats usageData={usageData} />
      </div>

      {/* Payment & Invoices */}
      <div className="grid lg:grid-cols-2 gap-6">
        <PaymentMethods 
          methods={paymentMethods}
          onAdd={handleAddPaymentMethod}
          onDelete={handleDeletePaymentMethod}
          onSetDefault={handleSetDefaultPaymentMethod}
        />
        <InvoiceHistory invoices={invoices} />
      </div>
    </div>
  );
};

export default Billing;