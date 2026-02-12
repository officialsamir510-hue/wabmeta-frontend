// src/pages/Billing.tsx

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Check,
  Loader2,
  AlertCircle,
  Calendar,
  Users,
  MessageSquare,
  Zap,
  Star,
  TrendingUp,
  Download,
  RefreshCw,
  Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { billing } from '../services/api';
import toast from 'react-hot-toast';
import type { User } from '../types/auth';

// ============================================
// TYPES
// ============================================

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

interface UsageItem {
  used: number;
  limit: number;
  percentage: number;
}

interface Usage {
  messages?: UsageItem;
  contacts?: UsageItem;
  campaigns?: UsageItem;
  storage?: UsageItem;
}

interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed';
  date: string;
  downloadUrl?: string;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Safely format a number with locale string
 */
const safeFormatNumber = (
  value: number | undefined | null,
  fallback: string = '0'
): string => {
  if (value === undefined || value === null) return fallback;
  if (value === -1) return 'Unlimited';
  try {
    return value.toLocaleString('en-IN');
  } catch {
    return String(value);
  }
};

/**
 * Get default usage item
 */
const getDefaultUsageItem = (limit: number = 100): UsageItem => ({
  used: 0,
  limit,
  percentage: 0,
});

/**
 * Get default usage object
 */
const getDefaultUsage = (): Usage => ({
  messages: getDefaultUsageItem(1000),
  contacts: getDefaultUsageItem(100),
  campaigns: getDefaultUsageItem(10),
  storage: getDefaultUsageItem(100),
});

/**
 * Validate Razorpay Key
 */
const validateRazorpayKey = (key: string | undefined): boolean => {
  if (!key) return false;
  // Razorpay keys start with rzp_test_ or rzp_live_
  return key.startsWith('rzp_test_') || key.startsWith('rzp_live_');
};

// ============================================
// MAIN COMPONENT
// ============================================

const Billing: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usage, setUsage] = useState<Usage>(getDefaultUsage());
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isChangingPlan, setIsChangingPlan] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [razorpayReady, setRazorpayReady] = useState(false);

  // Check if Razorpay is loaded
  useEffect(() => {
    const checkRazorpay = () => {
      if (typeof window !== 'undefined' && window.Razorpay) {
        setRazorpayReady(true);
        console.log('✅ Razorpay SDK loaded');
      } else {
        console.log('⏳ Waiting for Razorpay SDK...');
        setTimeout(checkRazorpay, 500);
      }
    };
    checkRazorpay();
  }, []);

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async (isRefresh: boolean = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Fetch all billing data in parallel
      const [plansRes, subscriptionRes, usageRes, invoicesRes] = await Promise.allSettled([
        billing.getPlans(),
        billing.getCurrentPlan(),
        billing.getUsage(),
        billing.getInvoices({ limit: 10 }),
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
        const usageData = usageRes.value.data.data;
        const formattedUsage: Usage = {
          messages: usageData?.messages || getDefaultUsageItem(1000),
          contacts: usageData?.contacts || getDefaultUsageItem(100),
          campaigns: usageData?.campaigns || getDefaultUsageItem(10),
          storage: usageData?.storage || getDefaultUsageItem(100),
        };
        setUsage(formattedUsage);
      } else {
        setUsage(getDefaultUsage());
      }

      // Handle invoices
      if (invoicesRes.status === 'fulfilled' && invoicesRes.value.data.success) {
        const invoicesData = Array.isArray(invoicesRes.value.data.data)
          ? invoicesRes.value.data.data
          : [];
        setInvoices(invoicesData);
      }

      if (isRefresh) {
        toast.success('Billing data refreshed');
      }
    } catch (err: any) {
      console.error('Failed to fetch billing data:', err);
      setError('Unable to load billing information. Please try again later.');
      setUsage(getDefaultUsage());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getUserFullName = (user: User | null): string => {
    if (!user) return '';

    if ('firstName' in user && 'lastName' in user) {
      const firstName = (user as any).firstName || '';
      const lastName = (user as any).lastName || '';
      return `${firstName} ${lastName}`.trim();
    }
    if ('name' in user && user.name) {
      return user.name;
    }
    return user.email || '';
  };

  const getUserPhone = (user: User | null): string => {
    if (!user) return '';

    if ('phone' in user && (user as any).phone) {
      return (user as any).phone;
    }
    return '';
  };

  const handleSubscribe = async (planSlug: string) => {
    try {
      // Check if Razorpay is loaded
      if (!razorpayReady) {
        toast.error('Payment gateway is loading. Please try again in a moment.');
        return;
      }

      setIsChangingPlan(true);

      // Create order on backend
      console.log('Creating order for plan:', planSlug);
      const orderResponse = await billing.createRazorpayOrder({
        planKey: planSlug,
        billingCycle,
      });

      if (!orderResponse.data.success) {
        throw new Error(orderResponse.data.message || 'Failed to create order');
      }

      const order = orderResponse.data.data;
      console.log('Order created:', {
        id: order.id,
        amount: order.amount,
        currency: order.currency
      });

      // Get Razorpay key from environment
      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID ||
        import.meta.env.VITE_RAZORPAY_KEY ||
        '';

      // Debug logging
      console.log('=== RAZORPAY CONFIGURATION ===');
      console.log('Environment Keys Available:', Object.keys(import.meta.env).filter(k => k.includes('RAZORPAY')));
      console.log('Key Found:', razorpayKey ? `${razorpayKey.substring(0, 15)}...` : 'NO KEY');
      console.log('Key Valid:', validateRazorpayKey(razorpayKey) ? '✅' : '❌');

      if (!validateRazorpayKey(razorpayKey)) {
        console.error('Invalid Razorpay key configuration');
        toast.error('Payment gateway not configured. Please contact support.');
        setIsChangingPlan(false);
        return;
      }

      // Prepare Razorpay options
      const options: any = {
        key: razorpayKey,
        amount: order.amount,
        currency: order.currency || 'INR',
        name: 'WabMeta',
        description: `${planSlug.toUpperCase()} Plan - ${billingCycle === 'yearly' ? 'Annual' : 'Monthly'} Billing`,
        image: '/logo.png', // Add your logo
        order_id: order.id,
        handler: async (response: any) => {
          console.log('✅ Payment successful:', response);

          // Show loading toast
          const loadingToast = toast.loading('Verifying payment...');

          try {
            const verifyResponse = await billing.verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            toast.dismiss(loadingToast);

            if (verifyResponse.data.success) {
              toast.success('🎉 Subscription activated successfully!');
              await fetchBillingData();
            } else {
              throw new Error(verifyResponse.data.message || 'Payment verification failed');
            }
          } catch (error: any) {
            toast.dismiss(loadingToast);
            console.error('Verification error:', error);
            toast.error(error.message || 'Payment verification failed. Please contact support.');
          } finally {
            setIsChangingPlan(false);
          }
        },
        prefill: {
          name: getUserFullName(user),
          email: user?.email || '',
          contact: getUserPhone(user),
        },
        notes: {
          userId: user?.id,
          planSlug: planSlug,
          billingCycle: billingCycle
        },
        theme: {
          color: '#22c55e',
          backdrop_color: 'rgba(0, 0, 0, 0.8)'
        },
        modal: {
          ondismiss: () => {
            console.log('Payment modal closed by user');
            setIsChangingPlan(false);
            toast('Payment cancelled', { icon: '❌' });
          },
          escape: true,
          animation: true,
          confirm_close: true
        },
        retry: {
          enabled: true,
          max_count: 3
        },
        remember_customer: true,
        send_sms_hash: true
      };

      console.log('Opening Razorpay with options:', {
        ...options,
        key: options.key.substring(0, 15) + '...'
      });

      // Create Razorpay instance
      const rzp = new window.Razorpay(options);

      // Handle payment failure
      rzp.on('payment.failed', function (response: any) {
        console.error('❌ Payment Failed:', response.error);

        let errorMessage = 'Payment failed';
        if (response.error?.description) {
          errorMessage = response.error.description;
        } else if (response.error?.reason) {
          errorMessage = response.error.reason;
        }

        toast.error(errorMessage);
        setIsChangingPlan(false);
      });

      // Open payment modal
      rzp.open();

    } catch (error: any) {
      console.error('Subscribe error:', error);
      toast.error(error.message || 'Failed to initialize payment. Please try again.');
      setIsChangingPlan(false);
    }
  };

  const handleCancelSubscription = async () => {
    const confirmed = confirm(
      'Are you sure you want to cancel your subscription?\n\n' +
      '• You will retain access until the end of your billing period\n' +
      '• You can reactivate anytime before expiration\n' +
      '• Your data will be preserved'
    );

    if (!confirmed) return;

    try {
      const loadingToast = toast.loading('Cancelling subscription...');
      const response = await billing.cancel();
      toast.dismiss(loadingToast);

      if (response.data.success) {
        toast.success('Subscription cancelled. You have access until the end of your billing period.');
        await fetchBillingData();
      } else {
        throw new Error(response.data.message || 'Failed to cancel');
      }
    } catch (error: any) {
      console.error('Cancel error:', error);
      toast.error(error.message || 'Failed to cancel subscription');
    }
  };

  // ============================================
  // LOADING STATE
  // ============================================

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-green-600 mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading billing information...</p>
        </div>
      </div>
    );
  }

  // ============================================
  // ERROR STATE
  // ============================================

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-12 p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
          <div className="flex items-start">
            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 mt-0.5 mr-4 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 dark:text-red-200">
                Error Loading Billing
              </h3>
              <p className="text-red-700 dark:text-red-300 text-sm mt-1">{error}</p>
              <button
                onClick={() => fetchBillingData()}
                className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/60 text-sm font-medium inline-flex items-center"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // MAIN RENDER
  // ============================================

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Billing & Plans
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your subscription and billing information
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!razorpayReady && (
            <div className="px-3 py-1.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-lg text-xs font-medium flex items-center">
              <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
              Loading Payment Gateway...
            </div>
          )}
          <button
            onClick={() => fetchBillingData(true)}
            disabled={refreshing}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Current Plan */}
      {subscription && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                Current Plan
              </h2>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {subscription.plan?.name || 'Free'}
                </span>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium ${subscription.status === 'active' || subscription.status === 'ACTIVE'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : subscription.status === 'cancelled' || subscription.status === 'CANCELLED'
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}
                >
                  {subscription.status.toLowerCase()}
                </span>
                <span className="text-gray-500 dark:text-gray-400 capitalize">
                  {subscription.billingCycle}
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                {subscription.status === 'active' || subscription.status === 'ACTIVE'
                  ? 'Next billing date: '
                  : 'Expires: '}
                {new Date(subscription.currentPeriodEnd).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>

            {(subscription.status === 'active' || subscription.status === 'ACTIVE') && (
              <button
                onClick={handleCancelSubscription}
                className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-red-200 dark:border-red-800"
              >
                Cancel Subscription
              </button>
            )}
          </div>
        </div>
      )}

      {/* Usage Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {usage.messages && (
          <UsageCard
            title="Messages"
            used={usage.messages.used}
            limit={usage.messages.limit}
            percentage={usage.messages.percentage}
            icon={MessageSquare}
            color="blue"
          />
        )}
        {usage.contacts && (
          <UsageCard
            title="Contacts"
            used={usage.contacts.used}
            limit={usage.contacts.limit}
            percentage={usage.contacts.percentage}
            icon={Users}
            color="green"
          />
        )}
        {usage.campaigns && (
          <UsageCard
            title="Campaigns"
            used={usage.campaigns.used}
            limit={usage.campaigns.limit}
            percentage={usage.campaigns.percentage}
            icon={Zap}
            color="purple"
          />
        )}
        {usage.storage && (
          <UsageCard
            title="Storage (MB)"
            used={usage.storage.used}
            limit={usage.storage.limit}
            percentage={usage.storage.percentage}
            icon={TrendingUp}
            color="orange"
          />
        )}
      </div>

      {/* Billing Cycle Toggle */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-1.5 inline-flex">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-2.5 rounded-lg font-medium transition-all ${billingCycle === 'monthly'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-6 py-2.5 rounded-lg font-medium transition-all flex items-center ${billingCycle === 'yearly'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
          >
            Yearly
            <span className="ml-2 text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full font-semibold">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* Security Badge */}
      <div className="flex justify-center mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Shield className="w-4 h-4" />
          <span>Secure payment powered by Razorpay</span>
        </div>
      </div>

      {/* Pricing Plans */}
      {plans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {plans.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              billingCycle={billingCycle}
              isCurrentPlan={subscription?.planId === plan.id}
              onSelect={() => handleSubscribe(plan.slug)}
              disabled={isChangingPlan || !razorpayReady}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 mb-8 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
          <p className="text-gray-500 dark:text-gray-400">
            No pricing plans available. Please check back later.
          </p>
        </div>
      )}

      {/* Invoices / Billing History */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Billing History
        </h2>
        {invoices.length > 0 ? (
          <div className="space-y-2">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <CreditCard className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      ₹{((invoice.amount ?? 0) / 100).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(invoice.date).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${invoice.status === 'paid'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : invoice.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}
                  >
                    {invoice.status}
                  </span>
                  {invoice.downloadUrl && (
                    <a
                      href={invoice.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title="Download Invoice"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <CreditCard className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No billing history available</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// USAGE CARD COMPONENT
// ============================================

interface UsageCardProps {
  title: string;
  used: number;
  limit: number;
  percentage: number;
  icon: React.ElementType;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

const UsageCard: React.FC<UsageCardProps> = ({
  title,
  used = 0,
  limit = 100,
  percentage = 0,
  icon: Icon,
  color,
}) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400',
    green: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400',
    purple: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400',
    orange: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400',
  };

  const progressColor = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    purple: 'bg-purple-600',
    orange: 'bg-orange-600',
  };

  const safePercentage = Math.min(Math.max(percentage || 0, 0), 100);
  const isWarning = safePercentage >= 80;
  const isCritical = safePercentage >= 95;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2.5 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span
          className={`text-sm font-medium ${isCritical
              ? 'text-red-600 dark:text-red-400'
              : isWarning
                ? 'text-yellow-600 dark:text-yellow-400'
                : 'text-gray-500 dark:text-gray-400'
            }`}
        >
          {safePercentage.toFixed(0)}%
        </span>
      </div>
      <h3 className="font-medium text-gray-900 dark:text-white mb-1">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
        {safeFormatNumber(used)} / {limit === -1 ? 'Unlimited' : safeFormatNumber(limit)}
      </p>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${isCritical
              ? 'bg-red-500'
              : isWarning
                ? 'bg-yellow-500'
                : progressColor[color]
            }`}
          style={{ width: `${safePercentage}%` }}
        />
      </div>
    </div>
  );
};

// ============================================
// PRICING CARD COMPONENT
// ============================================

interface PricingCardProps {
  plan: Plan;
  billingCycle: 'monthly' | 'yearly';
  isCurrentPlan: boolean;
  onSelect: () => void;
  disabled: boolean;
}

const PricingCard: React.FC<PricingCardProps> = ({
  plan,
  billingCycle,
  isCurrentPlan,
  onSelect,
  disabled,
}) => {
  const price = billingCycle === 'monthly' ? (plan.monthlyPrice ?? 0) : (plan.yearlyPrice ?? 0);

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl p-6 border-2 transition-all hover:shadow-lg ${plan.popular
          ? 'border-green-500 dark:border-green-400 shadow-green-100 dark:shadow-none'
          : isCurrentPlan
            ? 'border-blue-500 dark:border-blue-400'
            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
        } relative`}
    >
      {/* Badges */}
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center shadow-lg">
            <Star className="w-3 h-3 mr-1 fill-current" />
            MOST POPULAR
          </span>
        </div>
      )}

      {isCurrentPlan && !plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center shadow-lg">
            <Check className="w-3 h-3 mr-1" />
            CURRENT PLAN
          </span>
        </div>
      )}

      {/* Plan Header */}
      <div className="text-center mb-6 pt-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {plan.name || 'Plan'}
        </h3>
        <div className="flex items-baseline justify-center">
          <span className="text-4xl font-bold text-gray-900 dark:text-white">
            ₹{price.toLocaleString('en-IN')}
          </span>
          <span className="text-gray-500 dark:text-gray-400 ml-2">
            /{billingCycle === 'monthly' ? 'mo' : 'yr'}
          </span>
        </div>
        {billingCycle === 'yearly' && plan.monthlyPrice > 0 && (
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
            Save ₹{(plan.monthlyPrice * 12 - plan.yearlyPrice).toLocaleString('en-IN')}/year
          </p>
        )}
      </div>

      {/* Features List */}
      <ul className="space-y-3 mb-6">
        <li className="flex items-start">
          <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {safeFormatNumber(plan.maxContacts)} contacts
          </span>
        </li>
        <li className="flex items-start">
          <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {safeFormatNumber(plan.maxMessagesPerMonth)} messages/mo
          </span>
        </li>
        <li className="flex items-start">
          <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {safeFormatNumber(plan.maxCampaignsPerMonth)} campaigns/mo
          </span>
        </li>
        <li className="flex items-start">
          <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {safeFormatNumber(plan.maxTeamMembers)} team members
          </span>
        </li>
        <li className="flex items-start">
          <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {safeFormatNumber(plan.maxWhatsAppAccounts)} WhatsApp accounts
          </span>
        </li>
        <li className="flex items-start">
          <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {safeFormatNumber(plan.maxChatbots)} chatbots
          </span>
        </li>
      </ul>

      {/* Select Button */}
      <button
        onClick={onSelect}
        disabled={disabled || isCurrentPlan}
        className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${isCurrentPlan
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
            : disabled
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
              : plan.popular
                ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-600/25 hover:shadow-green-600/40'
                : 'bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500'
          }`}
      >
        {isCurrentPlan ? (
          <span className="flex items-center justify-center">
            <Check className="w-4 h-4 mr-2" />
            Current Plan
          </span>
        ) : disabled ? (
          <span className="flex items-center justify-center">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing...
          </span>
        ) : (
          'Select Plan'
        )}
      </button>
    </div>
  );
};

// ============================================
// RAZORPAY TYPE DECLARATION
// ============================================

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default Billing;