import React from 'react';

function TermsPage() {
  return (
    <div className="container mx-auto px-6 py-16 pt-32 sm:pt-40">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-black text-gray-900">Terms of Service</h1>
        <p className="mt-2 text-gray-500">Last Updated: October 2, 2025</p>
        <article className="prose lg:prose-xl mt-8">
          <p>Please read these Terms of Service ("Terms") carefully before using the QuickChat website and service (the "Service") operated by QuickChat B.V. ("us", "we", or "our").</p>
          
          <h2>1. Definitions</h2>
          <ul>
            <li><strong>Service:</strong> The QuickChat platform, website, and all related services that facilitate asynchronous expert Q&A.</li>
            <li><strong>Expert:</strong> A User who offers their expertise by answering questions for a Fee.</li>
            <li><strong>Asker:</strong> A User who submits a question to an Expert and authorizes payment of the Fee.</li>
          </ul>

          <h2>2. The Service: A Platform for Connection</h2>
          <p>QuickChat provides a platform to facilitate transactions between Experts and Askers. We are not a party to the direct interaction between Users and we do not hire or endorse any Expert.</p>
          
          <h2>3. Payments, Fees, and Refunds</h2>
          <h3>4.1. Authorization & Capture</h3>
          <p>When an Asker submits a question, the full Fee is authorized (a temporary "hold" is placed) on their payment method. The Fee is only captured (charged) if and when the Expert provides an answer within their stated SLA.</p>
          <h3>4.2. Refunds for Non-Compliance</h3>
          <p>If an Expert fails to provide an answer within their SLA, the payment authorization is automatically canceled, and the Asker is not charged.</p>

          <h2>4. Important Disclaimers & Limitation of Liability</h2>
          <h3>7.1. No Professional Advice</h3>
          <p>The content provided by Experts is not a substitute for formal, professional advice. QuickChat does not verify the qualifications or advice of any Expert. This includes, but is not limited to, medical, legal, or financial information.</p>

          {/* Add the rest of the terms content here to keep it concise for this example */}
        </article>
      </div>
    </div>
  );
}

export default TermsPage;