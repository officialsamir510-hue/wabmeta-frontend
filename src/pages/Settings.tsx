// src/pages/Billing.tsx

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Check,
  ChevronRight,
  Loader2,
  AlertCircle,
  Calendar,
  Users,
  MessageSquare,
  Zap,
  FileText,
  Bot,
  BarChart3,
  Phone,
  Shield,
  Star,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { billing } from '../services/api'; // ✅ Correct import
import toast from 'react-hot-toast';

interface Plan {
  id: string;
  name: string;
  type: string;
  slug: string;
  monthlyPrice: number;
  yearlyPrice: number;
  maxContacts: number;
  maxMessagesPerMonth: number;
  maxCampaignsPerMonth: number;
  maxTeamMembers: number;
  maxWhatsAppAccounts: number;
  maxTemplates: number;
  maxChatbots: number;
  maxAutomations: number;
  features: string[];
  isActive: boolean;
  popular?: boolean;
}

interface Subscription {
  id: string;
  planId: string;
  plan?: Plan;
  status: string;
  billingCycle: 'monthly' | 'yearly';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  messagesUsed: number;
  contactsUsed: number;
  cancelledAt?: string;
}

interface Usage {
  messages: {
    used: number;
    limit: number;
    percentage: number;
  };
  contacts: {
    used: number;
    limit: number;
    percentage: number;
  };
  campaigns: {
    used: number;
    limit: number;
    percentage: number;
  };
  storage: {
    used: number;
    limit: number;
    percentage: number;
  };
}

interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed';
  date: string;
  downloadUrl?: string;
}

const Billing: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const [isChangingPlan, setIsChangingPlan] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all billing data in parallel with error handling
      const [plansRes, subscriptionRes, usageRes, invoicesRes] = await Promise.allSettled([
        billing.getPlans(),
        billing.getCurrentPlan(),
        billing.getUsage(),
        billing.getInvoices({ limit: 10 })
      ]);

      // Handle plans
      if (plansRes.status === 'fulfilled' && plansRes.value.data.success) {
        const plansData = Array.isArray(plansRes.value.data.data)
          ? plansRes.value.data.data
          : [];
        setPlans(plansData);
      }

      // Handle subscription
      if (subscriptionRes.status === 'fulfilled' && subscriptionRes.value.data.success) {
        setSubscription(subscriptionRes.value.data.data);
      }

      // Handle usage
      if (usageRes.status === 'fulfilled' && usageRes.value.data.success) {
        setUsage(usageRes.value.data.data);
      }

      // Handle invoices
      if (invoicesRes.status === 'fulfilled' && invoicesRes.value.data.success) {
        const invoicesData = Array.isArray(invoicesRes.value.data.data)
          ? invoicesRes.value.data.data
          : [];
        setInvoices(invoicesData);
      }

    } catch (err: any) {
      console.error('Failed to fetch billing data:', err);
      setError('Unable to load billing information. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    try {
      setIsChangingPlan(true);

      // Create Razorpay order
      const orderResponse = await billing.createRazorpayOrder({
        planKey: planId,
        billingCycle
      });

      if (!orderResponse.data.success) {
        throw new Error(orderResponse.data.message || 'Failed to create order');
      }

      const order = orderResponse.data.data;

      // Initialize Razorpay
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY || 'rzp_test_key',
        amount: order.amount,
        currency: order.currency || 'INR',
        name: 'WabMeta',
        description: `${planId} Plan - ${billingCycle}`,
        order_id: order.id,
        handler: async (response: any) => {
          try {
            // Verify payment
            const verifyResponse = await billing.verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyResponse.data.success) {
              toast.success('Subscription activated successfully!');
              await fetchBillingData();
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            toast.error('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: (user as any)?.phone || '',
        },
        theme: {
          color: '#22c55e'
        },
        modal: {
          ondismiss: () => {
            setIsChangingPlan(false);
          }
        }
      };

      // @ts-ignore
      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error: any) {
      toast.error(error.message || 'Failed to process payment');
      setIsChangingPlan(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? Your plan will remain active until the end of the current billing period.')) {
      return;
    }

    try {
      const response = await billing.cancel();
      if (response.data.success) {
        toast.success('Subscription cancelled successfully');
        await fetchBillingData();
      }
    } catch (error) {
      toast.error('Failed to cancel subscription');
    }
  };

  const getPlanFeatureIcon = (feature: string) => {
    const iconMap: Record<string, any> = {
      contacts: Users,
      messages: MessageSquare,
      campaigns: Zap,
      templates: FileText,
      chatbot: Bot,
      analytics: BarChart3,
      support: Phone,
      api: Shield,
    };

    const key = feature.toLowerCase().split(' ')[0];
    const Icon = iconMap[key] || Check;
    return <Icon className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-12 p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-red-900">Error Loading Billing</h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
              <button
                onClick={fetchBillingData}
                className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm font-medium"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Billing & Plans
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage your subscription and billing information
        </p>
      </div>

      {/* Current Plan */}
      {subscription && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                Current Plan
              </h2>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {subscription.plan?.name || 'Free'}
                </span>
                <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-medium">
                  {subscription.status}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  {subscription.billingCycle}
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Next billing date: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
              </p>
            </div>

            {subscription.status === 'active' && (
              <button
                onClick={handleCancelSubscription}
                className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                Cancel Subscription
              </button>
            )}
          </div>
        </div>
      )}

      {/* Usage Stats */}
      {usage && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <UsageCard
            title="Messages"
            used={usage.messages.used}
            limit={usage.messages.limit}
            percentage={usage.messages.percentage}
            icon={MessageSquare}
            color="blue"
          />
          <UsageCard
            title="Contacts"
            used={usage.contacts.used}
            limit={usage.contacts.limit}
            percentage={usage.contacts.percentage}
            icon={Users}
            color="green"
          />
          <UsageCard
            title="Campaigns"
            used={usage.campaigns.used}
            limit={usage.campaigns.limit}
            percentage={usage.campaigns.percentage}
            icon={Zap}
            color="purple"
          />
          <UsageCard
            title="Storage"
            used={usage.storage.used}
            limit={usage.storage.limit}
            percentage={usage.storage.percentage}
            icon={TrendingUp}
            color="orange"
          />
        </div>
      )}

      {/* Billing Cycle Toggle */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-1 inline-flex">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${billingCycle === 'monthly'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400'
              }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${billingCycle === 'yearly'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400'
              }`}
          >
            Yearly
            <span className="ml-2 text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {plans.map((plan) => (
          <PricingCard
            key={plan.id}
            plan={plan}
            billingCycle={billingCycle}
            isCurrentPlan={subscription?.planId === plan.id}
            onSelect={() => handleSubscribe(plan.slug)}
            disabled={isChangingPlan || subscription?.planId === plan.id}
          />
        ))}
      </div>

      {/* Invoices */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Billing History
        </h2>
        {invoices.length > 0 ? (
          <div className="space-y-2">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-4">
                  <CreditCard className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      ₹{invoice.amount / 100}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(invoice.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${invoice.status === 'paid'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : invoice.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                    {invoice.status}
                  </span>
                  {invoice.downloadUrl && (
                    <button className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No billing history available
          </p>
        )}
      </div>

      {/* Add Razorpay Script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
    </div>
  );
};

// Usage Card Component
const UsageCard: React.FC<{
  title: string;
  used: number;
  limit: number;
  percentage: number;
  icon: React.ElementType;
  color: string;
}> = ({ title, used, limit, percentage, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
    green: 'text-green-600 bg-green-100 dark:bg-green-900/30',
    purple: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30',
    orange: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30',
  }[color];

  const progressColor = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    purple: 'bg-purple-600',
    orange: 'bg-orange-600',
  }[color];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg ${colorClasses}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {percentage}%
        </span>
      </div>
      <h3 className="font-medium text-gray-900 dark:text-white mb-1">
        {title}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
        {used.toLocaleString()} / {limit === -1 ? 'Unlimited' : limit.toLocaleString()}
      </p>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${progressColor}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
};

// Pricing Card Component
const PricingCard: React.FC<{
  plan: Plan;
  billingCycle: 'monthly' | 'yearly';
  isCurrentPlan: boolean;
  onSelect: () => void;
  disabled: boolean;
}> = ({ plan, billingCycle, isCurrentPlan, onSelect, disabled }) => {
  const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 border ${plan.popular
      ? 'border-green-500 ring-2 ring-green-500 ring-opacity-50'
      : 'border-gray-200 dark:border-gray-700'
      } relative`}>
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center">
            <Star className="w-3 h-3 mr-1" />
            POPULAR
          </span>
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {plan.name}
        </h3>
        <div className="flex items-baseline justify-center">
          <span className="text-3xl font-bold text-gray-900 dark:text-white">
            ₹{price}
          </span>
          <span className="text-gray-500 dark:text-gray-400 ml-2">
            /{billingCycle === 'monthly' ? 'mo' : 'yr'}
          </span>
        </div>
      </div>

      <ul className="space-y-3 mb-6">
        <li className="flex items-start">
          <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {plan.maxContacts === -1 ? 'Unlimited' : plan.maxContacts.toLocaleString()} contacts
          </span>
        </li>
        <li className="flex items-start">
          <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {plan.maxMessagesPerMonth === -1 ? 'Unlimited' : plan.maxMessagesPerMonth.toLocaleString()} messages/mo
          </span>
        </li>
        <li className="flex items-start">
          <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {plan.maxCampaignsPerMonth} campaigns/mo
          </span>
        </li>
        <li className="flex items-start">
          <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {plan.maxTeamMembers} team members
          </span>
        </li>
      </ul>

      <button
        onClick={onSelect}
        disabled={disabled || isCurrentPlan}
        className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${isCurrentPlan
          ? 'bg-gray-100 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
          : plan.popular
            ? 'bg-green-600 text-white hover:bg-green-700'
            : 'bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600'
          }`}
      >
        {isCurrentPlan ? 'Current Plan' : 'Select Plan'}
      </button>
    </div>
  );
};

export default Billing;