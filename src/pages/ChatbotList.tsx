import React from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Bot,
  MoreHorizontal,
  Edit2,
  Trash2,
  Copy,
  BarChart3,
  Calendar
} from 'lucide-react';

const ChatbotList: React.FC = () => {
  const [bots, setBots] = React.useState([
    {
      id: '1',
      name: 'Welcome Bot',
      description: 'Greets new customers and collects basic info',
      status: 'active',
      triggers: ['New Contact', 'First Message'],
      stats: { sessions: 1250, completed: 980 },
      updatedAt: '2 hours ago'
    },
    {
      id: '2',
      name: 'Support FAQ',
      description: 'Answers common questions about pricing and features',
      status: 'active',
      triggers: ['Keyword: help', 'Keyword: pricing'],
      stats: { sessions: 3400, completed: 3100 },
      updatedAt: '1 day ago'
    },
    {
      id: '3',
      name: 'Order Tracking',
      description: 'Helps customers track their orders',
      status: 'inactive',
      triggers: ['Keyword: track', 'Keyword: order'],
      stats: { sessions: 500, completed: 450 },
      updatedAt: '3 days ago'
    },
    {
      id: '4',
      name: 'Lead Qualification',
      description: 'Qualifies leads before handing over to agent',
      status: 'draft',
      triggers: [],
      stats: { sessions: 0, completed: 0 },
      updatedAt: '1 week ago'
    }
  ]);

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this chatbot?')) {
      setBots(bots.filter(b => b.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chatbots</h1>
          <p className="text-gray-500 mt-1">Automate conversations with visual flow builder</p>
        </div>
        <Link
          to="/dashboard/chatbot/new"
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Create Chatbot</span>
        </Link>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {bots.map((bot) => (
          <div key={bot.id} className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-lg transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  bot.status === 'active' ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  <Bot className={`w-6 h-6 ${
                    bot.status === 'active' ? 'text-green-600' : 'text-gray-500'
                  }`} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{bot.name}</h3>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    bot.status === 'active' 
                      ? 'bg-green-50 text-green-700' 
                      : bot.status === 'inactive'
                        ? 'bg-yellow-50 text-yellow-700'
                        : 'bg-gray-50 text-gray-600'
                  }`}>
                    {bot.status === 'active' && <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>}
                    {bot.status.charAt(0).toUpperCase() + bot.status.slice(1)}
                  </span>
                </div>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4 h-10 line-clamp-2">
              {bot.description}
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              {bot.triggers.map((trigger, i) => (
                <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md">
                  {trigger}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1" title="Sessions">
                  <BarChart3 className="w-4 h-4" />
                  <span>{bot.stats.sessions}</span>
                </div>
                <div className="flex items-center space-x-1" title="Last Updated">
                  <Calendar className="w-4 h-4" />
                  <span>{bot.updatedAt}</span>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Link 
                  to={`/dashboard/chatbot/edit/${bot.id}`}
                  className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </Link>
                <button 
                  className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
                  title="Duplicate"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(bot.id)}
                  className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatbotList;