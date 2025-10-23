import React from 'react';

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

const Table = ({ children }) => (
  <div className="overflow-x-auto my-4">
    <table className="min-w-full border-collapse border border-gray-300">
      {children}
    </table>
  </div>
);

function PrivacyPage() {
  return (
    <div className="bg-white">
      <main className="container mx-auto px-6 py-16 pt-32 sm:pt-40">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-black text-gray-900">Privacy Policy</h1>
          <p className="mt-2 text-gray-500">Last Updated: October 22, 2025</p>

          <article className="mt-8 text-gray-700 leading-relaxed">
            <Section title="1. Introduction">
              <p>Welcome to mindPick ("we," "us," "our"). This Privacy Policy governs your use of our website, platform, and services (collectively, the "Service") and explains how we collect, use, disclose, and safeguard your information.</p>
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
                  <li><strong>Cookies and Tracking Technologies:</strong> We use cookies and similar tracking technologies as detailed in Section 3 below. Please see our Cookie Policy for complete information about how we use cookies and your control options.</li>
                </ul>
              </SubSection>
            </Section>

            <Section title="3. Cookie Policy and Tracking Technologies">
              <p>We use cookies and similar tracking technologies to enhance your experience on our Service. This section explains what cookies we use, why we use them, and how you can control your preferences.</p>
              
              <SubSection title="3.1. What Are Cookies?">
                <p>Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and understanding how you use our Service.</p>
              </SubSection>

              <SubSection title="3.2. Cookie Categories">
                <p>We categorize our cookies into three types, and you have full control over which categories you accept:</p>
                
                <div className="space-y-4 mt-4">
                  <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                    <h4 className="font-semibold text-gray-900 mb-2">Essential Cookies (Always Active)</h4>
                    <p className="text-sm mb-2"><strong>Purpose:</strong> These cookies are strictly necessary for the Service to function and cannot be disabled.</p>
                    <p className="text-sm mb-2"><strong>What we collect:</strong></p>
                    <ul className="list-disc pl-6 space-y-1 text-sm">
                      <li>Authentication tokens to keep you logged in</li>
                      <li>Session management for secure access</li>
                      <li>Security cookies to prevent fraud and attacks</li>
                      <li>Load balancing cookies to distribute traffic</li>
                    </ul>
                    <p className="text-sm mt-2"><strong>Legal basis:</strong> Necessary for performance of our contract with you (GDPR Art. 6(1)(b)).</p>
                  </div>

                  <div className="bg-amber-50 p-4 rounded-lg border-l-4 border-amber-500">
                    <h4 className="font-semibold text-gray-900 mb-2">Marketing Cookies (Optional - Requires Consent)</h4>
                    <p className="text-sm mb-2"><strong>Purpose:</strong> Help us understand which marketing campaigns bring visitors to our platform.</p>
                    <p className="text-sm mb-2"><strong>What we collect:</strong></p>
                    <ul className="list-disc pl-6 space-y-1 text-sm">
                      <li>UTM campaign parameters (source, medium, campaign name)</li>
                      <li>Referrer information (which website you came from)</li>
                      <li>Campaign visit tracking to attribute expert profile visits</li>
                      <li>Anonymized visitor fingerprint (SHA-256 hash of IP + User Agent) for deduplication</li>
                    </ul>
                    <p className="text-sm mt-2"><strong>Specific use case:</strong> When experts share their profile links with UTM parameters (e.g., on social media), we track visits to help them understand campaign performance. We link these visits to questions asked within 30 days.</p>
                    <p className="text-sm mt-2"><strong>Data retention:</strong> Visit records are retained for 30 days for campaign attribution, then permanently deleted.</p>
                    <p className="text-sm mt-2"><strong>Legal basis:</strong> Your explicit opt-in consent (GDPR Art. 6(1)(a) and ePrivacy Directive).</p>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                    <h4 className="font-semibold text-gray-900 mb-2">Analytics Cookies (Optional - Requires Consent)</h4>
                    <p className="text-sm mb-2"><strong>Purpose:</strong> Help us understand how you use our Service so we can improve it.</p>
                    <p className="text-sm mb-2"><strong>What we collect:</strong></p>
                    <ul className="list-disc pl-6 space-y-1 text-sm">
                      <li>Feedback widget interactions (session ID, time on page, scroll depth)</li>
                      <li>User journey stage (awareness, consideration, conversion, retention)</li>
                      <li>Device type (mobile, tablet, desktop) and viewport size</li>
                      <li>Recent user actions (last 5 interactions) for context when submitting feedback</li>
                      <li>Interaction counts (clicks, keyboard events) to understand engagement</li>
                    </ul>
                    <p className="text-sm mt-2"><strong>Specific use case:</strong> When you submit feedback through our feedback widget, analytics data helps us understand the context of your feedback (e.g., which page you were on, how long you tried before reporting a bug).</p>
                    <p className="text-sm mt-2"><strong>Data retention:</strong> Analytics data is retained for 13 months for service improvement analysis.</p>
                    <p className="text-sm mt-2"><strong>Legal basis:</strong> Your explicit opt-in consent (GDPR Art. 6(1)(a)).</p>
                  </div>
                </div>
              </SubSection>

              <SubSection title="3.3. How We Store Your Cookie Preferences">
                <p>Your cookie consent preferences are stored locally in your browser using localStorage under the key <code className="bg-gray-200 px-2 py-1 rounded text-sm">qc_cookie_consent</code>. This storage includes:</p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li>Your consent choices for each cookie category (essential, marketing, analytics)</li>
                  <li>Timestamp of when you made your choice</li>
                  <li>Consent method (whether you clicked "Accept All", "Reject", or customized preferences)</li>
                  <li>Version number of our cookie policy (for compliance tracking)</li>
                </ul>
                <p className="mt-2">This preference data never leaves your device and is not transmitted to our servers.</p>
              </SubSection>

              <SubSection title="3.4. Your Cookie Control Options">
                <p><strong>Cookie Consent Banner:</strong> When you first visit our Service, you'll see a cookie consent banner at the bottom of the page with three options:</p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li><strong>Accept All:</strong> Enables all cookie categories (Essential, Marketing, and Analytics)</li>
                  <li><strong>Reject:</strong> Only enables Essential cookies; disables all optional tracking</li>
                  <li><strong>Customize:</strong> Opens a detailed modal where you can toggle Marketing and Analytics cookies individually</li>
                </ul>
                
                <p className="mt-4"><strong>Changing Your Preferences Later:</strong> You can change your cookie preferences at any time by:</p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li>Clicking "Cookie Settings" in the footer of any page</li>
                  <li>This will reopen the cookie preference modal where you can update your choices</li>
                  <li>Changes take effect immediately</li>
                </ul>

                <p className="mt-4"><strong>What Happens When You Reject Cookies:</strong></p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li><strong>Marketing cookies rejected:</strong> We will not track UTM campaign visits or link your visits to expert profiles. You can still use the Service normally.</li>
                  <li><strong>Analytics cookies rejected:</strong> We will not collect behavioral analytics data. Your feedback submissions will still work, but we won't receive context about your session (time on page, scroll depth, etc.). We generate an ephemeral (temporary) session ID for feedback submissions that is not stored or tracked across sessions.</li>
                  <li><strong>Essential cookies:</strong> Cannot be disabled as they are necessary for the Service to function (e.g., keeping you logged in).</li>
                </ul>
              </SubSection>

              <SubSection title="3.5. Browser Cookie Controls">
                <p>In addition to our cookie consent banner, you can also control cookies through your browser settings:</p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li><strong>Block all cookies:</strong> Most browsers allow you to block all cookies, though this may prevent the Service from functioning properly</li>
                  <li><strong>Delete cookies:</strong> You can delete cookies stored on your device at any time through your browser settings</li>
                  <li><strong>Private/Incognito mode:</strong> Cookies are automatically deleted when you close the browser window</li>
                </ul>
                <p className="mt-2">Learn more about cookie controls in your browser:</p>
                <ul className="list-disc pl-6 space-y-1 text-sm mt-2">
                  <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Google Chrome</a></li>
                  <li><a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Mozilla Firefox</a></li>
                  <li><a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Apple Safari</a></li>
                  <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Microsoft Edge</a></li>
                </ul>
              </SubSection>

              <SubSection title="3.6. Third-Party Cookies">
                <p>We do not use third-party advertising cookies or tracking pixels. All cookies set by our Service are first-party cookies under the mindpick.me domain. However, some of our sub-processors (like Stripe for payments) may set their own cookies when you interact with their embedded features. These are governed by their respective privacy policies.</p>
              </SubSection>

              <SubSection title="3.7. Do Not Track (DNT)">
                <p>Some browsers offer a "Do Not Track" (DNT) signal. Currently, there is no industry standard for how to respond to DNT signals. Our Service respects your cookie preferences set through our consent banner regardless of your browser's DNT setting. If you reject optional cookies through our banner, we will not track you even if DNT is disabled in your browser.</p>
              </SubSection>
            </Section>

            <Section title="4. How We Use Your Information">
              <p>We use the information we collect for various purposes, including to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide, operate, and maintain our Service;</li>
                <li>Process transactions, including payment authorizations, captures, and payouts via our third-party payment processor;</li>
                <li>Manage your account, including sending notifications and service-related communications;</li>
                <li>Facilitate communication between Experts and Askers;</li>
                <li>Improve, personalize, and expand our Service;</li>
                <li>Understand and analyze how you use our Service for our legitimate business interests;</li>
                <li>Comply with legal obligations, resolve disputes, and enforce our agreements;</li>
                <li>Detect, prevent, and address fraud, security issues, and technical problems.</li>
              </ul>
            </Section>
            
            <Section title="5. Legal Basis for Processing (GDPR)">
                 <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Performance of a Contract:</strong> The majority of our data processing is necessary for the performance of our contract with you (our Terms of Service) to provide the mindPick service.</li>
                    <li><strong>Legitimate Interests:</strong> We may process your information for our legitimate interests, such as for security purposes, fraud prevention, and service improvement, provided that such processing shall not outweigh your rights and freedoms.</li>
                    <li><strong>Consent:</strong> We will obtain your explicit, opt-in consent before processing your data for marketing purposes.</li>
                    <li><strong>Legal Obligation:</strong> We may process your data where it is necessary for compliance with a legal obligation to which we are subject.</li>
                </ul>
            </Section>

            <Section title="6. How We Share Your Information">
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

            <Section title="7. Data Retention">
               <p>We retain your data according to a tiered retention strategy based on data type, legal requirements, and user control preferences. Our retention periods are designed to balance your access rights, business needs, and privacy protection.</p>
                
                <SubSection title="7.1. Retention Tiers Overview">
                <Table>
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border border-gray-300 px-4 py-2 text-left">Tier</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Data Type</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Retention Period</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Justification</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">Tier 1</td>
                      <td className="border border-gray-300 px-4 py-2">Financial & Legal Records</td>
                      <td className="border border-gray-300 px-4 py-2">7 years</td>
                      <td className="border border-gray-300 px-4 py-2">Tax law, anti-fraud, disputes</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">Tier 2</td>
                      <td className="border border-gray-300 px-4 py-2">Completed Q&A Content</td>
                      <td className="border border-gray-300 px-4 py-2">3 years (Askers) / Configurable (Experts)</td>
                      <td className="border border-gray-300 px-4 py-2">Quality disputes, user value</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">Tier 3</td>
                      <td className="border border-gray-300 px-4 py-2">Active User Data</td>
                      <td className="border border-gray-300 px-4 py-2">While active + 90 days</td>
                      <td className="border border-gray-300 px-4 py-2">Service delivery, recovery window</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">Tier 4</td>
                      <td className="border border-gray-300 px-4 py-2">Incomplete Transactions</td>
                      <td className="border border-gray-300 px-4 py-2">90 days</td>
                      <td className="border border-gray-300 px-4 py-2">Grace period for resolution</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">Tier 5</td>
                      <td className="border border-gray-300 px-4 py-2">Technical/Analytics Data</td>
                      <td className="border border-gray-300 px-4 py-2">13 months</td>
                      <td className="border border-gray-300 px-4 py-2">Security, product improvement</td>
                    </tr>
                  </tbody>
                </Table>
              </SubSection>

              <SubSection title="7.2. Specific Retention Scenarios">
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Completed Transactions (Answered Questions)</h4>
                    <ul className="list-disc pl-6 space-y-1 text-sm">
                      <li><strong>For Askers:</strong> You retain access to purchased answers for 3 years from the transaction date.</li>
                      <li><strong>For Experts:</strong> You control retention through your account settings:
                        <ul className="list-circle pl-6 mt-1">
                          <li>Indefinite retention (default) - powers your searchable knowledge base</li>
                          <li>Auto-deletion after 90, 180, or 365 days</li>
                          <li>Manual per-answer deletion anytime</li>
                        </ul>
                      </li>
                      <li><strong>Financial records:</strong> Anonymized transaction metadata retained for 7 years (EU VAT compliance).</li>
                    </ul>
                  </div>

                  <div className="bg-amber-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Unanswered Questions (SLA Expired)</h4>
                    <ul className="list-disc pl-6 space-y-1 text-sm">
                      <li><strong>Days 0-7:</strong> Full question data retained for potential late response or dispute resolution.</li>
                      <li><strong>Days 7-90:</strong> Question metadata archived (media files deleted); manual expert response possible with asker consent.</li>
                      <li><strong>After 90 days:</strong> Permanent deletion of all question content and personally identifiable information.</li>
                      <li><strong>Payment authorization:</strong> Canceled immediately upon SLA expiry; record (without PII) retained 7 years for accounting.</li>
                    </ul>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Expert Invitations (Expert Not Yet on Platform)</h4>
                    <ul className="list-disc pl-6 space-y-1 text-sm">
                      <li><strong>Days 0-14:</strong> Active invite period with full retention to enable expert onboarding.</li>
                      <li><strong>Days 14-30:</strong> Extended grace period if expert shows signup intent.</li>
                      <li><strong>Days 30-90:</strong> Question archived; asker notified and offered alternative experts.</li>
                      <li><strong>After 90 days:</strong> Question content deleted; anonymized invite analytics only.</li>
                    </ul>
                  </div>

                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Disputed Transactions</h4>
                    <p className="text-sm mb-2">All content and metadata frozen during active disputes (up to 180 days), overriding standard deletion timelines. Post-resolution, standard retention periods resume. Dispute communications retained for 7 years.</p>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Inactive Accounts (No Deletion Request)</h4>
                    <ul className="list-disc pl-6 space-y-1 text-sm">
                      <li><strong>Asker accounts:</strong> After 3 years of inactivity, email notification sent. After 4 years, standard deletion process initiated.</li>
                      <li><strong>Expert accounts:</strong> After 2 years of no login + no questions, dormant status applied. After 2.5 years, 60-day reactivation notice sent. Existing content retained per expert's configured policy.</li>
                    </ul>
                  </div>
                </div>
              </SubSection>

              <SubSection title="7.3. Account Deletion Rights">
                <p><strong>Asker Deletion:</strong> Upon account deletion request, you have a 30-day grace period for account recovery. After 30 days, your profile and authentication data are permanently deleted. Unanswered questions are deleted immediately. Purchased answers are transferred to secure, account-free access links for the remainder of their 3-year retention period.</p>
                <p><strong>Expert Deletion:</strong> You have a 30-day transition period to fulfill pending questions or issue refunds. After 30 days, your profile is permanently deleted. Your answers remain accessible to askers according to your pre-configured retention policy, displayed as "Former Expert - Account Deleted" to protect asker access rights.</p>
                <p><strong>Financial Records Exception:</strong> Even after account deletion, anonymized transaction records (no content, no identifiable information) are retained for 7 years to comply with tax and anti-money laundering regulations.</p>
              </SubSection>

              <SubSection title="7.4. Expert Content Controls">
                <p>As an Expert, you maintain significant control over your content retention:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Global Auto-Deletion Policy:</strong> Configure automatic deletion after 90, 180, or 365 days for all answers, or retain indefinitely.</li>
                  <li><strong>Per-Answer Manual Deletion:</strong> Delete individual answers anytime. Askers receive 30 days' notice with download option before deletion.</li>
                  <li><strong>Knowledge Base Feature:</strong> If you choose indefinite retention, your past answers power your searchable private knowledge base.</li>
                  <li><strong>Asker Protection:</strong> If you delete content before the 3-year asker retention period, askers are notified 30 days in advance and can download their purchased answer.</li>
                </ul>
              </SubSection>

              <SubSection title="7.5. Special Retention Circumstances">
                <p><strong>Legal Holds:</strong> In case of legal proceedings, regulatory investigations, or suspected criminal activity, relevant data is placed under legal hold, overriding all deletion schedules until explicitly cleared by legal counsel.</p>
                <p><strong>Data Breach Incidents:</strong> Following a data breach, affected data is retained for forensic analysis for up to 90 days, with appropriate notifications per GDPR Article 33 and 34 requirements.</p>
              </SubSection>
            </Section>

            <Section title="8. Data Security">
                <p>We use commercially reasonable administrative, technical, and physical safeguards to protect your personal information from unauthorized access, use, or disclosure. This includes:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Encryption at rest and in transit for all personal data</li>
                  <li>Regular security audits and penetration testing</li>
                  <li>Secure key management with automatic key rotation</li>
                  <li>Data deletion via cryptographic key destruction and secure data overwriting</li>
                  <li>Access controls and authentication for all systems</li>
                </ul>
                <p className="pt-2">However, no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security.</p>
            </Section>

            <Section title="9. International Data Transfers & Data Residency">
                <p>To provide a consistent and compliant service, all user data is primarily processed and stored on secure servers located within the European Union. By using our Service, you consent to the transfer of your information to our servers in the EU, regardless of your location.</p>
                <p>We work with certain sub-processors that may process data outside the EU (such as Stripe for payment processing). In such cases, we ensure appropriate safeguards are in place through Standard Contractual Clauses (SCCs) and Data Processing Agreements (DPAs).</p>
            </Section>
            
            <Section title="10. Your Data Protection Rights">
                <p>In accordance with GDPR, you have the following rights:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Right to Access:</strong> Request copies of your personal data.</li>
                    <li><strong>Right to Rectification:</strong> Request correction of inaccurate or incomplete data.</li>
                    <li><strong>Right to Erasure ("Right to be Forgotten"):</strong> Request deletion of your personal data, subject to legal retention obligations.</li>
                    <li><strong>Right to Restrict Processing:</strong> Request limitation on how we process your data.</li>
                    <li><strong>Right to Object:</strong> Object to processing based on legitimate interests.</li>
                    <li><strong>Right to Data Portability:</strong> Receive your data in a structured, machine-readable format.</li>
                    <li><strong>Right to Withdraw Consent:</strong> Withdraw consent for consent-based processing at any time.</li>
                    <li><strong>Right to Lodge a Complaint:</strong> File a complaint with your local data protection authority.</li>
                </ul>
                <p className="pt-2">To exercise these rights, please contact us at the email address provided in Section 13. We will respond to your request within 30 days.</p>
            </Section>
            
            <Section title="11. Children's Privacy">
                <p>Our Service is not intended for use by anyone under the age of 18. We do not knowingly collect personally identifiable information from children under 18. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.</p>
            </Section>

            <Section title="12. Changes to This Privacy Policy">
                <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. For material changes, we will provide at least 30 days' notice via email or prominent notice on our Service. You are advised to review this Privacy Policy periodically for any changes.</p>
            </Section>

            <Section title="13. Contact Us">
                <p>If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact our Data Protection Officer at:</p>
                <div className="bg-gray-100 p-4 rounded-lg mt-2">
                  <p className="font-semibold">Email: <a href="mailto:privacy@mindpick.me" className="text-indigo-600 hover:underline">privacy@mindpick.me</a></p>
                  <p className="mt-2 text-sm text-gray-600">For GDPR-related inquiries, please reference "GDPR Request" in your subject line for priority handling.</p>
                </div>
            </Section>

          </article>
        </div>
      </main>
    </div>
  );
}

export default PrivacyPage;