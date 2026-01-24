import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Settings } from 'lucide-react';
import FlowCanvas from '../components/chatbot/FlowCanvas';

const ChatbotBuilder: React.FC = () => {
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-10">
        <div className="flex items-center space-x-4">
          <Link
            to="/dashboard/chatbot"
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-gray-900">Welcome Bot</h1>
              <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded">
                Draft - Unsaved changes
              </span>
            </div>
            <p className="text-xs text-gray-500">Last saved 5 mins ago</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors">
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
          <div className="h-6 w-px bg-gray-200"></div>
          <button className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
            Publish
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-hidden">
        <FlowCanvas />
      </div>
    </div>
  );
};

export default ChatbotBuilder;