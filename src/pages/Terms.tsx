import React from 'react';

const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-8">
        <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
        
        <div className="space-y-6 text-gray-700">
          <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing and using WabMeta, you accept and agree to be bound by the terms and provision 
              of this agreement. If you do not agree to these terms, please do not use our service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Use of Service</h2>
            <p>
              You agree to use WabMeta only for lawful purposes and in accordance with these Terms. 
              You agree not to use the service:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-2">
              <li>In any way that violates any applicable law or regulation</li>
              <li>To send spam or unsolicited messages</li>
              <li>To impersonate or attempt to impersonate the Company, another user, or any other person</li>
              <li>In any way that infringes upon the rights of others</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. WhatsApp Business API</h2>
            <p>
              Our service integrates with WhatsApp Business API. You must comply with WhatsApp's 
              Commerce Policy and Business Policy when using our service. Any violation may result 
              in suspension of your account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Account Responsibilities</h2>
            <p>You are responsible for:</p>
            <ul className="list-disc ml-6 mt-2 space-y-2">
              <li>Maintaining the security of your account</li>
              <li>All activities that occur under your account</li>
              <li>Ensuring your use complies with all applicable laws</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Limitation of Liability</h2>
            <p>
              WabMeta shall not be liable for any indirect, incidental, special, consequential, 
              or punitive damages resulting from your use of or inability to use the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Contact</h2>
            <p>
              For questions about these Terms, contact us at:{' '}
              <a href="mailto:support@wabmeta.com" className="text-blue-600 hover:underline">
                support@wabmeta.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Terms;