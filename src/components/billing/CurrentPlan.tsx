import React, { useState } from 'react';
import { Crown, Check, Loader2 } from 'lucide-react';
import { billing } from '../../services/api';
import { loadRazorpayScript } from '../../utils/razorpay';

interface Props {
  planData: any;
  availablePlans: any[];
  onUpgrade: (planType: string, billingCycle: 'monthly' | 'yearly') => Promise<void>;
  onCancel: () => Promise<void>;
}

type PlanKey = 'monthly' | 'three_month' | 'six_month' | 'one_year';

const PACKAGES: { key: PlanKey; label: string; priceINR: number; months: number }[] = [
  { key: 'monthly', label: 'Monthly', priceINR: 899, months: 1 },
  { key: 'three_month', label: '3-Month', priceINR: 2500, months: 3 },
  { key: 'six_month', label: '6-Month ⭐', priceINR: 5000, months: 6 },
  { key: 'one_year', label: '1-Year ⭐', priceINR: 8999, months: 12 },
];

const formatINR = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n);

const CurrentPlan: React.FC<Props> = ({ planData, onCancel }) => {
  const [showPlans, setShowPlans] = useState(false);
  const [paying, setPaying] = useState<string | null>(null);

  const plan = planData?.plan;
  const subscription = planData?.subscription;

  const currentCycle: PlanKey | null =
    subscription?.billingCycle && ['monthly', 'three_month', 'six_month', 'one_year'].includes(subscription.billingCycle)
      ? subscription.billingCycle
      : null;

  const currentPackage = currentCycle ? PACKAGES.find((p) => p.key === currentCycle) : null;

  const handlePay = async (planKey: PlanKey) => {
    setPaying(planKey);

    try {
      const ok = await loadRazorpayScript();
      if (!ok) throw new Error('Razorpay SDK failed to load');

      const orderRes = await billing.createRazorpayOrder({ planKey });
      console.log("✅ Order response:", orderRes.data);

      const { orderId, amount, currency, keyId } = orderRes.data?.data || {};
      if (!orderId || !keyId) throw new Error("Invalid order response from backend");

      const userStr = localStorage.getItem('wabmeta_user');
      const user = userStr ? JSON.parse(userStr) : null;

      const options: any = {
        key: keyId,
        amount,
        currency,
        name: 'WabMeta',
        description: 'Subscription Payment',
        order_id: orderId,
        prefill: {
          name: user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
          email: user?.email,
        },
        theme: { color: '#25D366' },

        handler: async (resp: any) => {
          console.log("✅ Razorpay success:", resp);
          await billing.verifyRazorpayPayment({ ...resp, planKey });
          alert('Payment Success! Plan activated.');
          window.location.reload();
        },

        modal: {
          ondismiss: () => {
            console.log("Razorpay modal dismissed");
          }
        }
      };

      const rz = new (window as any).Razorpay(options);

      // ✅ Payment failed handler
      rz.on('payment.failed', (resp: any) => {
        console.error("❌ Payment failed:", resp);
        alert(resp?.error?.description || "Payment failed");
      });

      rz.open();
    } catch (e: any) {
      console.error("❌ Pay error:", e);
      console.error("❌ Response:", e?.response?.data);

      alert(
        e?.response?.data?.message ||
        e?.response?.data?.error?.message ||
        e?.message ||
        'Payment failed'
      );
    } finally {
      setPaying(null);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Current Plan</h3>

        <span className="px-3 py-1 text-sm font-medium rounded-full bg-purple-100 text-purple-700">
          {plan?.name || 'Free Demo'}
        </span>
      </div>

      <div className="mb-6">
        <div className="flex items-baseline space-x-2">
          <span className="text-4xl font-bold text-gray-900">
            {currentPackage
              ? formatINR(currentPackage.priceINR)
              : (plan?.monthlyPrice ? `$${plan.monthlyPrice}` : 'Free')}
          </span>
          <span className="text-gray-500">
            {currentPackage ? `/${currentPackage.months}mo` : '/month'}
          </span>
        </div>

        {subscription?.currentPeriodEnd && (
          <p className="text-sm text-gray-500 mt-2">
            Renews on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
          </p>
        )}
      </div>

      <div className="space-y-2 mb-6">
        {(plan?.features || []).slice(0, 4).map((feature: string, index: number) => (
          <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
            <Check className="w-4 h-4 text-green-500" />
            <span>{feature}</span>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <button
          onClick={() => setShowPlans(true)}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors"
        >
          <Crown className="w-4 h-4" />
          <span>Upgrade / Recharge</span>
        </button>

        {plan?.type !== 'FREE' && subscription?.status === 'ACTIVE' && (
          <button
            onClick={onCancel}
            className="w-full px-4 py-2.5 text-red-600 hover:bg-red-50 font-medium rounded-xl transition-colors"
          >
            Cancel Subscription
          </button>
        )}
      </div>

      {showPlans && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Choose Package</h2>
              <button onClick={() => setShowPlans(false)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {PACKAGES.map((p) => (
                <div key={p.key} className="border-2 border-gray-200 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900">{p.label}</h3>
                  <div className="mt-2">
                    <span className="text-2xl font-bold">{formatINR(p.priceINR)}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Validity: {p.months} months</p>
                  <p className="text-sm text-gray-500">Messages: Unlimited*</p>

                  <button
                    onClick={() => handlePay(p.key)}
                    disabled={paying === p.key}
                    className="w-full mt-4 px-4 py-2 rounded-lg font-medium bg-primary-500 hover:bg-primary-600 text-white disabled:opacity-60"
                  >
                    {paying === p.key ? (
                      <span className="inline-flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                      </span>
                    ) : (
                      'Pay with Razorpay'
                    )}
                  </button>
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-500 mt-4">
              Note: Payment can be done only by Organization Owner.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrentPlan;