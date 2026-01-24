import React from 'react';
import { Download, FileText, ExternalLink } from 'lucide-react';
import type { Invoice } from '../../types/billing';

const InvoiceHistory: React.FC = () => {
  const invoices: Invoice[] = [
    { id: 'INV-2024-001', date: 'Jan 15, 2024', amount: 4999, status: 'paid', url: '#' },
    { id: 'INV-2023-012', date: 'Dec 15, 2023', amount: 4999, status: 'paid', url: '#' },
    { id: 'INV-2023-011', date: 'Nov 15, 2023', amount: 4999, status: 'paid', url: '#' },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Billing History</h3>
        <button className="flex items-center space-x-1 text-sm text-primary-600 hover:text-primary-700">
          <span>View All</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 text-left">
              <th className="pb-3 text-sm font-medium text-gray-500">Invoice</th>
              <th className="pb-3 text-sm font-medium text-gray-500">Date</th>
              <th className="pb-3 text-sm font-medium text-gray-500">Amount</th>
              <th className="pb-3 text-sm font-medium text-gray-500">Status</th>
              <th className="pb-3 text-right text-sm font-medium text-gray-500">Download</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="group hover:bg-gray-50 transition-colors">
                <td className="py-4">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">{invoice.id}</span>
                  </div>
                </td>
                <td className="py-4 text-sm text-gray-500">{invoice.date}</td>
                <td className="py-4 text-sm font-medium text-gray-900">₹{invoice.amount.toLocaleString()}</td>
                <td className="py-4">
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full capitalize">
                    {invoice.status}
                  </span>
                </td>
                <td className="py-4 text-right">
                  <button className="p-2 hover:bg-gray-200 rounded-lg text-gray-500 hover:text-gray-900 transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InvoiceHistory;