// src/components/billing/InvoiceHistory.tsx

import React from 'react';
import { 
  FileText, 
  Download, 
  CheckCircle, 
  Clock, 
  XCircle,
  ExternalLink
} from 'lucide-react';

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

interface Props {
  invoices: Invoice[];
}

const InvoiceHistory: React.FC<Props> = ({ invoices }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  const handleDownload = (invoice: Invoice) => {
    if (invoice.downloadUrl) {
      window.open(invoice.downloadUrl, '_blank');
    } else {
      // Generate a simple invoice preview
      alert(`Invoice ${invoice.invoiceNumber}\nAmount: ${formatCurrency(invoice.amount, invoice.currency)}\nPlan: ${invoice.planName}`);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Invoice History</h3>
        {invoices.length > 0 && (
          <button className="text-sm text-primary-600 hover:underline flex items-center space-x-1">
            <span>View All</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        )}
      </div>

      {invoices.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p>No invoices yet</p>
          <p className="text-sm">Your billing history will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {invoices.map((invoice) => (
            <div
              key={invoice.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-white rounded-lg border border-gray-200">
                  <FileText className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{invoice.invoiceNumber}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(invoice.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                    {' • '}
                    {invoice.planName} ({invoice.billingCycle})
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(invoice.amount, invoice.currency)}
                  </p>
                  <span className={`inline-flex items-center space-x-1 px-2 py-0.5 text-xs font-medium rounded-full capitalize ${getStatusBadge(invoice.status)}`}>
                    {getStatusIcon(invoice.status)}
                    <span>{invoice.status}</span>
                  </span>
                </div>
                <button
                  onClick={() => handleDownload(invoice)}
                  className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  title="Download Invoice"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InvoiceHistory;