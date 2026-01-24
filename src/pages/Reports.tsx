import React, { useState, useEffect } from 'react';
import { Download, Loader2, Send, CheckCircle2, MessageSquare, DollarSign } from 'lucide-react';
import OverviewStats from '../components/analytics/OverviewStats';
import DeliveryChart from '../components/analytics/DeliveryChart';
import ConversationMetrics from '../components/analytics/ConversationMetrics';
import CampaignPerformance from '../components/analytics/CampaignPerformance';
import DateRangePicker from '../components/analytics/DateRangePicker';
import { dashboard, campaigns } from '../services/api';

const Reports: React.FC = () => {
  const [dateRange, setDateRange] = useState('7d');
  const [statsData, setStatsData] = useState<any>(null);
  const [formattedStats, setFormattedStats] = useState<any[]>([]);
  const [campaignStats, setCampaignStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch Reports Data
  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const [dashboardRes, campaignsRes] = await Promise.all([
          dashboard.getStats(),
          campaigns.getAll()
        ]);

        const data = dashboardRes.data;
        setStatsData(data);

        // Transform Data for OverviewStats
        // Note: We pass raw numbers where possible to let OverviewStats handle formatting
        const transformed = [
          {
            title: 'Total Sent',
            value: data.messagesSent || 0,
            change: '+12.5%', // Mock trend until history API is ready
            icon: Send,
            color: 'bg-blue-100 text-blue-600'
          },
          {
            title: 'Delivery Rate',
            value: data.deliveryRate || 0,
            change: '+2.1%',
            icon: CheckCircle2,
            color: 'bg-green-100 text-green-600'
          },
          {
            title: 'Response Rate',
            value: data.responseRate || 0,
            change: '-1.2%',
            icon: MessageSquare,
            color: 'bg-purple-100 text-purple-600'
          },
          {
            title: 'Estimated Cost',
            value: data.cost || 0, // ✅ Use real cost from backend
            change: '+5.4%',
            icon: DollarSign,
            color: 'bg-orange-100 text-orange-600'
          }
        ];
        setFormattedStats(transformed);
        
        // Process campaign data
        const campaignsData = campaignsRes.data?.campaigns || campaignsRes.data || [];
        setCampaignStats(campaignsData);

      } catch (error) {
        console.error("Report Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [dateRange]);

  const handleExport = () => {
    alert('Downloading report...');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Generating reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="text-gray-500 mt-1">Track your messaging performance and costs</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          
          <button
            onClick={handleExport}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Top Stats */}
      <OverviewStats stats={formattedStats} />

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* ✅ Safe Call (Passes data if available, otherwise uses internal default) */}
          <DeliveryChart data={statsData} /> 
        </div>
        <div className="lg:col-span-1">
          {/* ✅ Safe Call (Passes data if available, otherwise uses internal default) */}
          <ConversationMetrics data={statsData} />
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 gap-6">
        <CampaignPerformance campaigns={campaignStats} />
      </div>
    </div>
  );
};

export default Reports;