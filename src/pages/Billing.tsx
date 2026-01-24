import React from 'react';
import CurrentPlan from '../components/billing/CurrentPlan';
import UsageStats from '../components/billing/UsageStats';
import PaymentMethods from '../components/billing/PaymentMethods';
import InvoiceHistory from '../components/billing/InvoiceHistory';

const Billing: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Billing & Subscription</h1>
        <p className="text-gray-500 mt-1">Manage your plan, payments and invoices</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <CurrentPlan />
        <UsageStats />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <PaymentMethods />
        <InvoiceHistory />
      </div>
    </div>
  );
};

export default Billing;