import React from 'react';
import { ArrowRight } from 'lucide-react';

interface CampaignPerformanceProps {
  campaigns?: any[]; // Allow loose typing for flexibility
}

const CampaignPerformance: React.FC<CampaignPerformanceProps> = ({ campaigns = [] }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Top Performing Campaigns</h3>
        <button className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center">
          View All <ArrowRight className="w-4 h-4 ml-1" />
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Campaign</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Sent</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Read Rate</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Reply Rate</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Cost</th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {campaigns.length > 0 ? (
              campaigns.map((campaign, index) => {
                // Calculate rates safely if not provided
                const sent = campaign.stats?.sent || campaign.sent || 0;
                const read = campaign.stats?.read || 0;
                const replied = campaign.stats?.replied || 0;
                
                const readRate = sent > 0 ? Math.round((read / sent) * 100) : 0;
                const replyRate = sent > 0 ? Math.round((replied / sent) * 100) : 0;
                const cost = sent * 0.5; // Example calculation (₹0.50 per msg)

                return (
                  <tr key={campaign.id || index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {campaign.name || 'Untitled Campaign'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                      {sent.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 font-medium">
                      {readRate}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 font-medium">
                      {replyRate}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                      ₹{cost.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${
                        campaign.status === 'completed' ? 'bg-green-100 text-green-700' :
                        campaign.status === 'running' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {campaign.status || 'Draft'}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No campaign data available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CampaignPerformance;