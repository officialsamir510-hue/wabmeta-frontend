import React from 'react';

const DataDeletion: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-8">
        <h1 className="text-3xl font-bold mb-6">Data Deletion Instructions</h1>
        
        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold mb-3">Request Data Deletion</h2>
            <p>
              If you wish to delete your data from WabMeta, please follow these steps:
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Option 1: Through Your Account</h2>
            <ol className="list-decimal ml-6 mt-2 space-y-2">
              <li>Log in to your WabMeta account</li>
              <li>Go to Settings → Account</li>
              <li>Click "Delete Account"</li>
              <li>Confirm deletion</li>
            </ol>
            <p className="mt-2 text-sm text-gray-600">
              This will permanently delete all your data within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Option 2: Email Request</h2>
            <p>Send an email to:{' '}
              <a href="mailto:privacy@wabmeta.com" className="text-blue-600 hover:underline">
                privacy@wabmeta.com
              </a>
            </p>
            <p className="mt-2">Include:</p>
            <ul className="list-disc ml-6 mt-2 space-y-2">
              <li>Your registered email address</li>
              <li>Subject: "Data Deletion Request"</li>
              <li>Confirmation that you want to delete all your data</li>
            </ul>
            <p className="mt-2 text-sm text-gray-600">
              We will process your request within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">What Gets Deleted</h2>
            <ul className="list-disc ml-6 mt-2 space-y-2">
              <li>Your account information</li>
              <li>All contacts and messages</li>
              <li>Campaign data</li>
              <li>WhatsApp Business connection</li>
              <li>All associated data</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default DataDeletion;