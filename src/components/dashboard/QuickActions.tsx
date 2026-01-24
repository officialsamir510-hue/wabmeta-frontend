import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Send, 
  Upload, 
  FileText, 
  Bot, 
  ArrowRight
} from 'lucide-react';

const QuickActions: React.FC = () => {
  const actions = [
    {
      name: 'New Campaign',
      description: 'Send bulk messages',
      icon: Send,
      href: '/dashboard/campaigns/new',
      color: 'from-blue-500 to-blue-600',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      name: 'Import Contacts',
      description: 'Upload CSV file',
      icon: Upload,
      href: '/dashboard/contacts/import',
      color: 'from-green-500 to-green-600',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      name: 'Create Template',
      description: 'New message template',
      icon: FileText,
      href: '/dashboard/templates/new',
      color: 'from-purple-500 to-purple-600',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600'
    },
    {
      name: 'Setup Chatbot',
      description: 'Automate responses',
      icon: Bot,
      href: '/dashboard/chatbot/new',
      color: 'from-orange-500 to-orange-600',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600'
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
        <Link 
          to="/dashboard/campaigns/new"
          className="flex items-center space-x-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          <span>View all</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {actions.map((action) => (
          <Link
            key={action.name}
            to={action.href}
            className="group p-4 rounded-xl border-2 border-gray-100 hover:border-primary-200 hover:bg-primary-50/50 transition-all duration-300"
          >
            <div className={`w-10 h-10 ${action.iconBg} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
              <action.icon className={`w-5 h-5 ${action.iconColor}`} />
            </div>
            <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
              {action.name}
            </h3>
            <p className="text-sm text-gray-500 mt-1">{action.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;