import React from 'react';

function PrivacyPage() {
  return (
    <div className="container mx-auto px-6 py-16 pt-32 sm:pt-40">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-black text-gray-900">Privacy Policy</h1>
        <p className="mt-2 text-gray-500">Last Updated: October 2, 2025</p>

        <article className="prose lg:prose-xl mt-8">
          <h2>1. Introduction</h2>
          <p>This Privacy Policy governs your use of our website, platform, and services (collectively, the "Service") and explains how we collect, use, disclose, and safeguard your information.</p>
          
          <h2>2. Information We Collect</h2>
          <p>We collect information that is necessary to provide, maintain, and improve our Service, including information you provide (account details, content) and information we collect automatically (usage data).</p>

          <h2>3. How We Use Your Information</h2>
          <p>We use your information to operate the service, process transactions, manage your account, and improve our platform.</p>
          
          <h2>4. How We Share Your Information</h2>
          <p>We do not sell your personal information. We may share information with third-party service providers who perform services on our behalf, such as payment processors (Stripe) and cloud hosting providers, under strict data processing agreements.</p>
          
          {/* Add the rest of the privacy policy content here */}
        </article>
      </div>
    </div>
  );
}

export default PrivacyPage;