// src/components/common/NoWhatsAppConnected.tsx

import React, { useState } from 'react';
import { MessageCircle, Smartphone, ArrowRight, CheckCircle2 } from 'lucide-react';
import MetaConnectModal from '../dashboard/MetaConnectModal';

interface NoWhatsAppConnectedProps {
  organizationId: string;
  title?: string;
  description?: string;
  onConnected?: () => void;
}

export const NoWhatsAppConnected: React.FC<NoWhatsAppConnectedProps> = ({
  organizationId,
  title = 'Connect Your WhatsApp Business',
  description = 'Connect your WhatsApp Business account to start messaging your customers.',
  onConnected,
}) => {
  const [showModal, setShowModal] = useState(false);

  const features = [
    'Send template messages to customers',
    'Receive and reply to messages in real-time',
    'Create automated chatbot flows',
    'Run bulk marketing campaigns',
    'Track message delivery and engagement',
  ];

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
        <div className="max-w-lg w-full text-center">
          {/* Icon */}
          <div className="relative mx-auto w-24 h-24 mb-6">
            <div className="absolute inset-0 bg-green-100 rounded-full animate-pulse" />
            <div className="relative flex items-center justify-center w-full h-full bg-green-50 rounded-full">
              <Smartphone className="w-12 h-12 text-green-600" />
            </div>
            <div className="absolute -right-1 -bottom-1 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-green-600" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
          <p className="text-gray-600 mb-8">{description}</p>

          {/* Features */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">
              What you can do after connecting:
            </h3>
            <ul className="space-y-3">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA Button */}
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors shadow-lg hover:shadow-xl"
          >
            <MessageCircle className="w-5 h-5" />
            Connect WhatsApp Business
            <ArrowRight className="w-5 h-5" />
          </button>

          {/* Help text */}
          <p className="mt-4 text-xs text-gray-500">
            You'll need a{' '}
            <a
              href="https://business.facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 hover:underline"
            >
              Meta Business Account
            </a>{' '}
            to connect
          </p>
        </div>
      </div>

      {/* Connect Modal */}
      <MetaConnectModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        organizationId={organizationId}
        onConnected={(account) => {
          setShowModal(false);
          onConnected?.();
        }}
      />
    </>
  );
};

export default NoWhatsAppConnected;