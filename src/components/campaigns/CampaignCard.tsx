import React from 'react';
import { Link } from 'react-router-dom';
import {
  MoreVertical,
  Play,
  Pause,
  Copy,
  Trash2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  BarChart2,
  Send,
  Users
} from 'lucide-react';
import type { Campaign, CampaignStatus } from '../../types/campaign';

interface CampaignCardProps {
  campaign: Campaign & { _id?: string }; // Extend type to support _id
  onDelete: (id: string) => void;
  onDuplicate: (campaign: Campaign) => void;
  onPause?: (id: string) => void;
  onResume?: (id: string) => void;
}

const CampaignCard: React.FC<CampaignCardProps> = ({
  campaign,
  onDelete,
  onDuplicate,
  onPause,
  onResume
}) => {
  const [showMenu, setShowMenu] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Handle click outside to close menu
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getStatusColor = (status: CampaignStatus) => {
    switch (status) {
      case 'running': return 'bg-green-100 text-green-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      case 'scheduled': return 'bg-purple-100 text-purple-700';
      case 'paused': return 'bg-yellow-100 text-yellow-700';
      case 'failed': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: CampaignStatus) => {
    switch (status) {
      case 'running': return <Play className="w-3 h-3" />;
      case 'completed': return <CheckCircle2 className="w-3 h-3" />;
      case 'scheduled': return <Clock className="w-3 h-3" />;
      case 'paused': return <Pause className="w-3 h-3" />;
      case 'failed': return <AlertTriangle className="w-3 h-3" />;
      default: return null;
    }
  };

  // Resolve ID (Use _id if available, fallback to id)
  const campaignId = campaign._id || campaign.id;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow group relative">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
              {campaign.name}
            </h3>
            <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(campaign.status)}`}>
              {getStatusIcon(campaign.status)}
              <span>{campaign.status}</span>
            </span>
          </div>
          <p className="text-sm text-gray-500 line-clamp-1">{campaign.description || 'No description'}</p>
        </div>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-10 animate-fade-in">
              <Link
                to={`/dashboard/campaigns/${campaignId}`}
                className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <BarChart2 className="w-4 h-4" />
                <span>View Analytics</span>
              </Link>
              
              {campaign.status === 'running' && onPause && (
                <button
                  onClick={() => {
                    onPause(campaignId);
                    setShowMenu(false);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-yellow-600 hover:bg-yellow-50 w-full text-left transition-colors"
                >
                  <Pause className="w-4 h-4" />
                  <span>Pause Campaign</span>
                </button>
              )}

              {campaign.status === 'paused' && onResume && (
                <button
                  onClick={() => {
                    onResume(campaignId);
                    setShowMenu(false);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-green-600 hover:bg-green-50 w-full text-left transition-colors"
                >
                  <Play className="w-4 h-4" />
                  <span>Resume Campaign</span>
                </button>
              )}

              <button
                onClick={() => {
                  onDuplicate(campaign);
                  setShowMenu(false);
                }}
                className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left transition-colors"
              >
                <Copy className="w-4 h-4" />
                <span>Duplicate</span>
              </button>
              
              <div className="h-px bg-gray-100 my-1" />
              
              <button
                onClick={() => {
                  onDelete(campaignId);
                  setShowMenu(false);
                }}
                className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center space-x-1 text-gray-500 mb-1">
            <Users className="w-3 h-3" />
            <span className="text-xs">Audience</span>
          </div>
          <span className="font-semibold text-gray-900">{campaign.stats.total}</span>
        </div>
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center space-x-1 text-green-600 mb-1">
            <Send className="w-3 h-3" />
            <span className="text-xs">Sent</span>
          </div>
          <span className="font-semibold text-green-700">{campaign.stats.sent}</span>
        </div>
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center space-x-1 text-blue-600 mb-1">
            <CheckCircle2 className="w-3 h-3" />
            <span className="text-xs">Delivered</span>
          </div>
          <span className="font-semibold text-blue-700">{campaign.stats.delivered}</span>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-1">
          <Clock className="w-3 h-3" />
          <span>
            {campaign.status === 'scheduled' 
              ? `Scheduled: ${campaign.scheduledAt}`
              : `Created: ${new Date(campaign.createdAt).toLocaleDateString()}`
            }
          </span>
        </div>
        <span>Template: {campaign.templateName}</span>
      </div>

      {/* Click overlay for navigation (except menu) */}
      <Link 
        to={`/dashboard/campaigns/${campaignId}`}
        className="absolute inset-0 z-0"
        onClick={(e) => {
          // Prevent navigation when clicking menu button
          if (menuRef.current && menuRef.current.contains(e.target as Node)) {
            e.preventDefault();
          }
        }}
      />
    </div>
  );
};

export default CampaignCard;