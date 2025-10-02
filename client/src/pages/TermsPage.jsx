import React from 'react';

// A reusable component for styling sections, similar to the original CSS.
const Section = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">
      {title}
    </h2>
    {children}
  </div>
);

// A reusable component for subsections.
const SubSection = ({ title, children }) => (
  <div className="mb-6">
    <h3 className="text-xl font-semibold text-gray-800 mb-3">{title}</h3>
    {children}
  </div>
);

function TermsPage() {
  return (
    <div className="bg-white">
      <main className="container mx-auto px-6 py-16 pt-32 sm:pt-40">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-black text-gray-900">Terms of Service</h1>
          <p className="mt-2 text-gray-500">Last Updated: September 30, 2025</p>

          <article className="mt-8 text-gray-700 leading-relaxed space-y-4">
            <p>Please read these Terms of Service ("Terms") carefully before using the QuickChat website and service (the "Service") operated by QuickChat B.V. ("us", "we", or "our").</p>
            <p>Your access to and use of the Service is conditioned upon your acceptance of and compliance with these Terms. These Terms apply to all visitors, users, and others who wish to access or use the Service. By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of the terms, you do not have permission to access the Service.</p>

            <Section title="1. Definitions">
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Service:</strong> The QuickChat platform, website, and all related services that facilitate asynchronous expert Q&A.</li>
                <li><strong>User:</strong> Any individual who accesses or uses the Service, including Experts and Askers.</li>
                <li><strong>Expert:</strong> A User who offers their expertise by answering questions for a Fee.</li>
                <li><strong>Asker:</strong> A User who submits a question to an Expert and authorizes payment of the Fee.</li>
                <li><strong>Content:</strong> Any information, data, text, audio, video, files, or other materials created, uploaded, or transmitted by Users through the Service.</li>
                <li><strong>Fee:</strong> The amount specified by an Expert for answering a question.</li>
                <li><strong>SLA:</strong> The Service Level Agreement, which is the response time an Expert commits to.</li>
              </ul>
            </Section>

            <Section title="2. The Service: A Platform for Connection">
              <p><strong>Core Function:</strong> QuickChat provides a platform to facilitate transactions between Experts and Askers. We are not a party to the direct interaction between Users and we do not hire or endorse any Expert.</p>
              <p>The Service allows Experts to create a public profile and set a Fee for answering questions. Askers can submit questions to Experts, who then provide answers asynchronously.</p>
            </Section>

            <Section title="3. User Accounts">
              <p>To use certain features of the Service (e.g., as an Expert), you must register for an account. You agree to provide accurate, current, and complete information and to keep this information updated. You are responsible for safeguarding your account and for all activities that occur under it. You must be at least 18 years old to create an account.</p>
            </Section>

            <Section title="4. Payments, Fees, and Refunds">
                <SubSection title="4.1. Payment Processing">
                    <p>All payments are processed securely through our third-party payment processor, Stripe. QuickChat does not store your credit card or bank account information.</p>
                </SubSection>
                <SubSection title="4.2. Authorization & Capture">
                    <p>When an Asker submits a question, the full Fee is authorized (a temporary "hold" is placed) on their payment method. The Fee is only captured (charged) if and when the Expert provides an answer within their stated SLA.</p>
                </SubSection>
                <SubSection title="4.3. Refunds for Non-Compliance">
                    <p>If an Expert fails to provide an answer within their SLA, the payment authorization is automatically canceled, and the Asker is not charged.</p>
                </SubSection>
                <SubSection title="4.4. Platform Fees">
                    <p>QuickChat charges Experts a service fee (a "take rate") on each successfully completed transaction. This fee is deducted from the payout to the Expert. The applicable fees are detailed on our Pricing page.</p>
                </SubSection>
            </Section>
            
            <Section title="5. Content Ownership and License">
                <SubSection title="5.1. You Own Your Content">
                    <p>You retain all ownership rights to the Content you create and submit (your questions, answers, files, etc.).</p>
                </SubSection>
                <SubSection title="5.2. License to QuickChat">
                    <p>By submitting Content, you grant QuickChat a worldwide, non-exclusive, royalty-free license to use, store, reproduce, modify, and transmit your Content solely for the purpose of operating, providing, and improving the Service. This allows us to, for example, deliver your question to an Expert and store their answer for you.</p>
                </SubSection>
            </Section>

            <Section title="6. User Conduct and Responsibilities">
                <p>You agree not to use the Service to submit any Content that is illegal, defamatory, harassing, or infringes on any third-party rights.</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Expert Responsibilities:</strong> Experts are solely responsible for the content and quality of their answers. They must accurately represent their qualifications and adhere to their stated SLA.</li>
                    <li><strong>Asker Responsibilities:</strong> Askers are responsible for the content of their questions and for ensuring their payment method is valid.</li>
                </ul>
            </Section>

            <Section title="7. Important Disclaimers & Limitation of Liability">
                 <p className="font-semibold text-gray-800">Critical Notice: QuickChat is a platform for informational purposes only. The interactions on QuickChat do not constitute a formal professional-client relationship.</p>
                <SubSection title="7.1. No Professional Advice">
                    <p>The content provided by Experts is not a substitute for formal, professional advice. QuickChat does not verify the qualifications or advice of any Expert. You should always consult with a qualified professional for your specific needs. This includes, but is not limited to:</p>
                     <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Medical Information:</strong> Content from healthcare professionals is not medical advice. No doctor-patient relationship is formed.</li>
                        <li><strong>Legal Information:</strong> Content from legal professionals is not legal advice. No attorney-client relationship is formed.</li>
                        <li><strong>Financial Information:</strong> Content from financial professionals is not financial or tax advice. No fiduciary relationship is formed.</li>
                    </ul>
                </SubSection>
                <SubSection title="7.2. &quot;AS IS&quot; Service">
                    <p>THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS. QUICKCHAT MAKES NO WARRANTIES, EXPRESS OR IMPLIED, REGARDING THE SERVICE'S RELIABILITY, SECURITY, OR THE ACCURACY OF ANY CONTENT.</p>
                </SubSection>
                 <SubSection title="7.3. Limitation of Liability">
                    <p>TO THE FULLEST EXTENT PERMITTED BY LAW, QUICKCHAT B.V. SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR USE OF THE SERVICE.</p>
                </SubSection>
            </Section>

            <Section title="8. Indemnification">
                <p>You agree to defend, indemnify, and hold harmless QuickChat B.V., its affiliates, and their respective officers, directors, employees, and agents from and against any and all claims, damages, obligations, losses, liabilities, costs, or debt, and expenses (including but not limited to attorney's fees) arising from your use of the Service or your violation of these Terms.</p>
            </Section>

            <Section title="9. Governing Law & Dispute Resolution">
                <p>These Terms shall be governed by the laws of The Netherlands. Any legal suit, action, or proceeding arising out of or related to these Terms or the Service shall be instituted exclusively in the courts of Amsterdam, The Netherlands.</p>
            </Section>

            <Section title="10. Changes to Terms">
                <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice. By continuing to use the Service after any revisions become effective, you agree to be bound by the revised terms.</p>
            </Section>

            <Section title="11. Contact Us">
                 <p>If you have any questions about these Terms, please contact us at: <a href="mailto:legal@quick.chat" className="text-indigo-600 hover:underline">legal@quick.chat</a>.</p>
            </Section>

          </article>
        </div>
      </main>
    </div>
  );
}

export default TermsPage;