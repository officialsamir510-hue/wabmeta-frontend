// src/pages/Terms.tsx

const Terms = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
        <div className="prose">
          <p className="text-gray-600 mb-4">Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">1. Acceptance of Terms</h2>
          <p>By accessing and using WabMeta, you accept and agree to be bound by these Terms...</p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">2. Use of Service</h2>
          <p>You agree to use WabMeta in compliance with all applicable laws and WhatsApp's policies...</p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">3. Contact</h2>
          <p>Questions about Terms? Contact: support@wabmeta.com</p>
        </div>
      </div>
    </div>
  );
};

export default Terms;