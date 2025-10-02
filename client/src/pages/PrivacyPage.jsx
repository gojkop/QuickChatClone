import React from 'react';

// Reusable components for consistent styling
const Section = ({ title, children }) => (
  <div className="py-4">
    <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">
      {title}
    </h2>
    <div className="space-y-4">{children}</div>
  </div>
);

const SubSection = ({ title, children }) => (
  <div className="pt-2">
    <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
    <div className="space-y-3">{children}</div>
  </div>
);

function PrivacyPage() {
  return (
    <div className="bg-white">
      <main className="container mx-auto px-6 py-16 pt-32 sm:pt-40">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-black text-gray-900">Privacy Policy</h1>
          <p className="mt-2 text-gray-500">Last Updated: September 30, 2025</p>

          <article className="mt-8 text-gray-700 leading-relaxed">
            <Section title="1. Introduction">
              <p>Welcome to QuickChat ("we," "us," "our"). This Privacy Policy governs your use of our website, platform, and services (collectively, the "Service") and explains how we collect, use, disclose, and safeguard your information.</p>
              <p>By using our Service, you agree to the collection and use of information in accordance with this policy. This policy applies to all users of the Service, including "Experts" who provide answers and "Askers" who submit questions.</p>
            </Section>

            <Section title="2. Information We Collect">
              <p>We collect information that is necessary to provide, maintain, and improve our Service.</p>
              <SubSection title="2.1. Information You Provide to Us">
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Expert Account Information:</strong> When you register as an Expert, we collect your name, email address, and any other profile information you choose to provide, such as your bio, expertise, pricing, and Service Level Agreement (SLA).</li>
                  <li><strong>Asker Information:</strong> When you submit a question as an Asker, we collect your email address for the purpose of delivering the expert's answer and related communications.</li>
                  <li><strong>Content:</strong> We collect and store the content you create and upload, including but not limited to question titles, text, audio/video recordings of questions and answers, and any attached files ("Content").</li>
                  <li><strong>Communications:</strong> If you contact us directly for support or other inquiries, we may receive additional information about you such as your name, email address, the contents of the message, and any other information you may choose to provide.</li>
                </ul>
              </SubSection>
              <SubSection title="2.2. Information We Collect Automatically">
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Usage Data:</strong> We may automatically collect information about your interactions with our Service, such as your IP address, browser type, operating system, pages viewed, and the dates/times of your visits.</li>
                  <li><strong>Cookies and Tracking Technologies:</strong> We may use cookies and similar tracking technologies to track activity on our Service and hold certain information.</li>
                </ul>
              </SubSection>
            </Section>

            <Section title="3. How We Use Your Information">
              <p>We use the information we collect for various purposes, including to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide, operate, and maintain our Service;</li>
                <li>Process transactions, including payment authorizations, captures, and payouts via our third-party payment processor;</li>
                <li>Manage your account, including sending notifications and service-related communications;</li>
                <li>Facilitate communication between Experts and Askers;</li>
                <li>Improve, personalize, and expand our Service;</li>
                <li>Understand and analyze how you use our Service for our legitimate business interests;</li>
                <li>Comply with legal obligations, resolve disputes, and enforce our agreements.</li>
              </ul>
            </Section>
            
            <Section title="4. Legal Basis for Processing (GDPR)">
                 <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Performance of a Contract:</strong> The majority of our data processing is necessary for the performance of our contract with you (our Terms of Service) to provide the QuickChat service.</li>
                    <li><strong>Legitimate Interests:</strong> We may process your information for our legitimate interests, such as for security purposes and service improvement, provided that such processing shall not outweigh your rights and freedoms.</li>
                    <li><strong>Consent:</strong> We will obtain your explicit, opt-in consent before processing your data for marketing purposes.</li>
                    <li><strong>Legal Obligation:</strong> We may process your data where it is necessary for compliance with a legal obligation to which we are subject.</li>
                </ul>
            </Section>

            <Section title="5. How We Share Your Information">
              <p>We do not sell your personal information. We may share your information with third-party service providers ("Sub-processors") who perform services on our behalf, under the following circumstances:</p>
               <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Payment Processing:</strong> We share transaction information with Stripe to process payments and payouts. We do not store or have access to your full credit card or bank account details.</li>
                  <li><strong>Cloud & Media Hosting:</strong> We use third-party services like Xano for our backend and database, and Cloudflare Stream or Mux for secure hosting and streaming of audio/video content.</li>
                  <li><strong>Communication Services:</strong> We use services like Resend or Postmark to send transactional emails.</li>
                  <li><strong>Analytics & Error Tracking:</strong> We may use third-party analytics services to help us understand and improve the usage of our Service.</li>
                  <li><strong>Legal Compliance:</strong> We may disclose your information if required to do so by law or in response to valid requests by public authorities (e.g., a court or a government agency).</li>
              </ul>
              <p className="pt-2">We have Data Processing Agreements (DPAs) in place with our sub-processors to ensure they protect your data in accordance with GDPR standards.</p>
            </Section>

            <Section title="6. Data Retention">
               <p>We retain your data only for as long as necessary to fulfill the purposes for which it was collected.</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Expert Content:</strong> By default, expert content is retained indefinitely to power features such as your private, searchable knowledge base. Experts have the right to configure an automatic deletion policy for their content (e.g., after 90, 180, or 365 days) via their account settings.</li>
                    <li><strong>Asker Content:</strong> Asker questions and the corresponding answers are retained for a default period of three (3) years to allow for continued access and to handle potential disputes.</li>
                    <li><strong>Account Deletion:</strong> Upon request for account deletion, we will erase your personal information and content, except where we are required to retain certain data for legal and financial compliance (e.g., transaction records).</li>
                </ul>
            </Section>

            <Section title="7. Data Security">
                <p>We use commercially reasonable administrative, technical, and physical safeguards to protect your personal information from unauthorized access, use, or disclosure. However, no method of transmission over the Internet or method of electronic storage is 100% secure.</p>
            </Section>

            <Section title="8. International Data Transfers & Data Residency">
                <p>To provide a consistent and compliant service, all user data is primarily processed and stored on secure servers located within the European Union. By using our Service, you consent to the transfer of your information to our servers in the EU, regardless of your location.</p>
            </Section>
            
            <Section title="9. Your Data Protection Rights">
                <p>In accordance with GDPR, you have the following rights:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>The right to access, rectify, or erase your personal data.</li>
                    <li>The right to restrict or object to the processing of your personal data.</li>
                    <li>The right to data portability.</li>
                </ul>
                <p className="pt-2">To exercise these rights, please contact us at the email address provided below.</p>
            </Section>
            
            <Section title="10. Children's Privacy">
                <p>Our Service is not intended for use by anyone under the age of 18. We do not knowingly collect personally identifiable information from children under 18.</p>
            </Section>

            <Section title="11. Changes to This Privacy Policy">
                <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.</p>
            </Section>

            <Section title="12. Contact Us">
                <p>If you have any questions, concerns, or requests regarding this Privacy Policy, please contact our Data Protection representative at: <a href="mailto:privacy@quick.chat" className="text-indigo-600 hover:underline">privacy@quick.chat</a></p>
            </Section>

          </article>
        </div>
      </main>
    </div>
  );
}

export default PrivacyPage;