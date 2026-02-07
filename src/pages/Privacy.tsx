// src/pages/Privacy.tsx

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        <div className="prose">
          <p className="text-gray-600 mb-4">Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">1. Information We Collect</h2>
          <p>We collect information you provide directly to us when using WabMeta services...</p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">2. How We Use Your Information</h2>
          <p>We use the information we collect to provide, maintain, and improve our services...</p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">3. WhatsApp Integration</h2>
          <p>When you connect your WhatsApp Business Account, we access your business information and messages to provide our services...</p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">4. Contact Us</h2>
          <p>If you have questions about this Privacy Policy, contact us at: privacy@wabmeta.com</p>
        </div>
      </div>
    </div>
  );
};

export default Privacy;