import React from 'react';

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">
      {title}
    </h2>
    {children}
  </div>
);

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
          <p className="mt-2 text-gray-500">Last Updated: October 5, 2025</p>

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
              <p><strong>Core Function:</strong> QuickChat provides a platform to facilitate transactions between Experts and Askers. We are not a party to the direct interaction between Users and we do not hire, employ, or endorse any Expert. Each Expert operates as an independent service provider.</p>
              <p>The Service allows Experts to create a public profile and set a Fee and SLA for answering questions. Askers can submit questions to Experts, who then provide answers asynchronously via audio, video, or text.</p>
            </Section>

            <Section title="3. User Accounts">
              <p>To use certain features of the Service (e.g., as an Expert), you must register for an account. You agree to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Keep this information updated and accurate</li>
                <li>Safeguard your account credentials and be responsible for all activities under your account</li>
                <li>Notify us immediately of any unauthorized access or security breach</li>
              </ul>
              <p className="pt-2">You must be at least 18 years old to create an account. You may not create an account using false information or on behalf of someone else without authorization.</p>
            </Section>

            <Section title="4. Payments, Fees, and Refunds">
                <SubSection title="4.1. Payment Processing">
                    <p>All payments are processed securely through our third-party payment processor, Stripe. QuickChat does not store your credit card or bank account information. By using the Service, you agree to be bound by Stripe's Services Agreement and Privacy Policy.</p>
                </SubSection>
                <SubSection title="4.2. Authorization & Capture">
                    <p>When an Asker submits a question, the full Fee is <strong>authorized</strong> on their payment method (a temporary "hold" is placed). The Fee is only <strong>captured</strong> (charged) if and when the Expert provides an answer within their stated SLA. This authorization typically expires after 7 days if not captured.</p>
                </SubSection>
                <SubSection title="4.3. Automatic Cancellation for SLA Non-Compliance">
                    <p>If an Expert fails to provide an answer within their committed SLA, the payment authorization is automatically canceled, and the Asker is not charged. The question data is handled according to our Privacy Policy's data retention schedule.</p>
                </SubSection>
                <SubSection title="4.4. Refund Policy">
                    <p><strong>Before Answer Delivery:</strong> If you are an Asker and change your mind before receiving an answer, you may request cancellation within the first 2 hours after question submission, subject to the Expert not having started work. The authorization will be released.</p>
                    <p><strong>After Answer Delivery:</strong> Refunds after answer delivery are granted only in cases of clear non-compliance with the Expert's stated service or technical failure on our part. Content quality disputes are evaluated on a case-by-case basis. To request a refund, contact support within 7 days of receiving the answer.</p>
                    <p><strong>Disputed Transactions:</strong> In the event of a payment dispute or chargeback, all relevant data is retained for up to 180 days to facilitate resolution, overriding standard deletion timelines.</p>
                </SubSection>
                <SubSection title="4.5. Platform Fees">
                    <p>QuickChat charges Experts a service fee (a "take rate") on each successfully completed transaction. This fee is automatically deducted from the payout to the Expert:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li><strong>Starter Plan:</strong> 10% of the transaction amount</li>
                      <li><strong>Pro Plan:</strong> 7% of the transaction amount (requires €15/month or €144/year subscription)</li>
                    </ul>
                    <p className="pt-2">Additionally, standard payment processing fees charged by Stripe apply to all transactions and are separate from QuickChat's platform fees.</p>
                </SubSection>
                <SubSection title="4.6. Payouts to Experts">
                    <p>Expert earnings (minus platform fees) are transferred via Stripe Connect according to your payout schedule. You are responsible for all taxes on your earnings. We provide transaction records but do not provide tax advice.</p>
                </SubSection>
            </Section>
            
            <Section title="5. Content Ownership, License, and Usage Rights">
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                  <p className="font-semibold text-gray-900">Key Principle: Experts own their answers; Askers receive a license for personal and internal business use.</p>
                </div>

                <SubSection title="5.1. Copyright Ownership">
                    <p><strong>Expert's Answer Content:</strong> Experts retain 100% copyright ownership of their answer content (text, audio, video). By creating an answer, you (the Expert) are licensing the Asker to use it under the terms described below, but you maintain all ownership rights.</p>
                    <p><strong>Asker's Question Content:</strong> Askers retain 100% copyright ownership of their question content. By submitting a question, you (the Asker) grant the Expert an implied license to receive, review, and respond to your question for the purpose of providing the service.</p>
                </SubSection>

                <SubSection title="5.2. License Grant to Askers">
                    <p>When you purchase an answer, you receive a <strong>non-exclusive, non-transferable, limited license</strong> to use the Expert's answer content. This license permits the following uses:</p>
                    
                    <div className="mt-3">
                      <p className="font-semibold text-green-700 mb-2">✓ PERMITTED USES:</p>
                      <ul className="list-disc pl-6 space-y-2 text-sm">
                        <li><strong>Personal Use:</strong> View, download, and use the answer for your personal decision-making and reference.</li>
                        <li><strong>Internal Business Use:</strong> Share with direct colleagues within your organization who need the information for the same business purpose. Present findings in internal meetings and documentation with attribution.</li>
                        <li><strong>Derivative Works:</strong> Use the advice to create your own original work, implement recommended strategies, and apply the information in your professional activities.</li>
                        <li><strong>Fair Use:</strong> Quote brief excerpts with proper attribution in published work (articles, papers, presentations) consistent with copyright fair use principles.</li>
                      </ul>
                    </div>

                    <div className="mt-3">
                      <p className="font-semibold text-red-700 mb-2">✗ PROHIBITED USES:</p>
                      <ul className="list-disc pl-6 space-y-2 text-sm">
                        <li><strong>Public Redistribution:</strong> Posting the full answer publicly on social media, websites, forums, or any public platform.</li>
                        <li><strong>Commercial Redistribution:</strong> Reselling, licensing to third parties, or including in paid products/services you offer.</li>
                        <li><strong>Competitive Use:</strong> Using to create competing expert services, training AI models, or any use that directly competes with or harms the Expert's business.</li>
                        <li><strong>Misattribution:</strong> Claiming the answer as your own work, removing attribution, or misrepresenting the Expert's views.</li>
                      </ul>
                    </div>

                    <p className="mt-3 text-sm bg-gray-50 p-3 rounded">
                      <strong>Attribution Requirement:</strong> When sharing excerpts or referencing the answer in any public or professional context, you must provide attribution: "Based on consultation with [Expert Name] via QuickChat, [Date]" or similar clear attribution.
                    </p>
                </SubSection>

                <SubSection title="5.3. License Limitations">
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>Duration:</strong> License is valid during the content retention period (default 3 years for Askers). If the Expert deletes content early, you receive 30 days' advance notice and download access.</li>
                      <li><strong>Non-Transferable:</strong> You cannot transfer your license to another person or entity.</li>
                      <li><strong>Scope:</strong> License is for the uses explicitly permitted above. Any use not explicitly permitted requires the Expert's express written permission.</li>
                    </ul>
                </SubSection>

                <SubSection title="5.4. Expert Content Control Rights">
                    <p>As an Expert, you retain full control over your answer content:</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>Reuse Rights:</strong> You may reuse, repurpose, or license your answers independently of QuickChat (e.g., for blog posts, courses, or other content).</li>
                      <li><strong>Deletion Rights:</strong> You may delete your answers at any time through your account settings. Affected Askers receive 30 days' notice and download access before deletion.</li>
                      <li><strong>Modification Rights:</strong> You may edit or update answers (creates a new version; Askers are notified).</li>
                      <li><strong>Enforcement Rights:</strong> You may report unauthorized use or redistribution of your content (see Section 5.6).</li>
                    </ul>
                </SubSection>

                <SubSection title="5.5. License to QuickChat">
                    <p>By submitting Content (questions or answers), you grant QuickChat a worldwide, non-exclusive, royalty-free license to use, store, reproduce, modify, and transmit your Content solely for the purposes of:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Operating and providing the Service</li>
                      <li>Processing for features (transcription, search, summaries)</li>
                      <li>Creating anonymized analytics</li>
                      <li>Moderating for Terms compliance</li>
                    </ul>
                    <p className="mt-2">QuickChat does NOT claim ownership of your Content and will not sell, license to third parties, or use your private Content to train public AI models.</p>
                </SubSection>

                <SubSection title="5.6. Enforcement of License Restrictions">
                    <p><strong>Violation Consequences:</strong> Prohibited uses constitute a material breach of these Terms. If you violate the license restrictions above:</p>
                    <ul className="list-disc pl-6 space-y-2 mt-2">
                      <li><strong>First Violation:</strong> Written warning and 30-day probationary period.</li>
                      <li><strong>Second Violation:</strong> Account suspension and removal of access to purchased answers.</li>
                      <li><strong>Third Violation:</strong> Permanent account ban and potential legal action.</li>
                      <li><strong>Egregious Commercial Violations:</strong> Immediate account termination and legal action without prior warning.</li>
                    </ul>
                    <p className="mt-3"><strong>Expert Reporting:</strong> Experts who discover unauthorized use of their content may report violations to support@quick.chat with evidence (screenshots, links). We will investigate and take appropriate action.</p>
                </SubSection>

                <SubSection title="5.7. Data Retention and Access">
                    <p>Data retention practices are detailed in our Privacy Policy. Key points:</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>Askers:</strong> Retain access to purchased answers for 3 years from transaction date, with 30-day download window if Expert deletes earlier.</li>
                      <li><strong>Experts:</strong> Control retention through account settings (indefinite, auto-deletion after 90/180/365 days, or manual per-answer deletion).</li>
                      <li><strong>Financial Records:</strong> Anonymized transaction records retained for 7 years for compliance, even after content deletion.</li>
                    </ul>
                </SubSection>
            </Section>

            <Section title="6. User Conduct and Responsibilities">
                <p>You agree to use the Service in compliance with all applicable laws and regulations. You agree NOT to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Submit Content that is illegal, defamatory, harassing, threatening, or infringes on any third-party rights (including intellectual property rights)</li>
                  <li>Impersonate any person or entity, or falsely represent your affiliation with any person or entity</li>
                  <li>Use the Service for any fraudulent, deceptive, or manipulative purpose</li>
                  <li>Attempt to circumvent payment systems, fees, or license restrictions</li>
                  <li>Interfere with or disrupt the Service or servers/networks connected to the Service</li>
                  <li>Collect or harvest any personally identifiable information from the Service</li>
                  <li>Use automated systems (bots, scrapers) to access the Service without our express written permission</li>
                  <li>Violate the content license restrictions described in Section 5</li>
                </ul>
                
                <SubSection title="6.1. Expert-Specific Responsibilities">
                    <p>As an Expert, you agree to:</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>Accurate Representation:</strong> Truthfully represent your qualifications, expertise, and credentials</li>
                      <li><strong>SLA Compliance:</strong> Make good-faith efforts to respond within your stated SLA. Consistent SLA violations may result in account restrictions</li>
                      <li><strong>Quality Standards:</strong> Provide substantive, good-faith answers to questions you accept</li>
                      <li><strong>Professional Boundaries:</strong> Maintain appropriate professional boundaries and include necessary disclaimers (see Section 7)</li>
                      <li><strong>Tax Compliance:</strong> You are an independent contractor responsible for your own tax obligations</li>
                    </ul>
                </SubSection>
                
                <SubSection title="6.2. Asker-Specific Responsibilities">
                    <p>As an Asker, you agree to:</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>Valid Payment:</strong> Ensure your payment method is valid and has sufficient funds</li>
                      <li><strong>Clear Questions:</strong> Provide sufficient context and clarity in your questions</li>
                      <li><strong>Respect Expert Time:</strong> Submit questions in good faith and honor the transactional nature of the service</li>
                      <li><strong>License Compliance:</strong> Use Expert answers only as permitted under Section 5.2</li>
                      <li><strong>Professional Boundaries:</strong> Understand that answers are informational and do not constitute formal professional relationships (see Section 7)</li>
                    </ul>
                </SubSection>
            </Section>

            <Section title="7. Critical Disclaimers & Limitation of Liability">
                 <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                   <p className="font-bold text-gray-900 text-lg">⚠️ CRITICAL NOTICE</p>
                   <p className="mt-2"><strong>QuickChat is a platform for informational exchanges only.</strong> The interactions on QuickChat do not constitute a formal professional-client relationship. You should always consult with a qualified, licensed professional for your specific needs.</p>
                 </div>
                 
                <SubSection title="7.1. No Professional Advice or Relationship">
                    <p>The content provided by Experts through the Service is <strong>not</strong> a substitute for formal, professional advice, diagnosis, or treatment. QuickChat does not verify, endorse, or guarantee the qualifications, credentials, or advice of any Expert.</p>
                    <p className="font-semibold mt-3">Specific Categories:</p>
                    <ul className="list-disc pl-6 space-y-2 mt-2">
                        <li><strong>Medical/Healthcare Information:</strong> Content from healthcare professionals is for educational purposes only and is NOT medical advice, diagnosis, or treatment. No doctor-patient relationship is formed. Always consult a licensed physician for medical concerns, especially emergencies.</li>
                        <li><strong>Legal Information:</strong> Content from legal professionals is for informational purposes only and is NOT legal advice. No attorney-client relationship or privilege is created. Always consult a licensed attorney in your jurisdiction for legal matters.</li>
                        <li><strong>Financial/Tax Information:</strong> Content from financial professionals is for informational purposes only and is NOT financial advice, investment advice, or tax advice. No fiduciary relationship is formed. Always consult a licensed financial advisor or tax professional for your specific situation.</li>
                        <li><strong>Mental Health Information:</strong> Content from mental health professionals is for educational purposes only and is NOT therapy, counseling, or crisis intervention. No therapeutic relationship is formed. If you are experiencing a mental health crisis, contact emergency services or a crisis hotline immediately.</li>
                    </ul>
                    <p className="mt-3 font-semibold">Experts must include appropriate disclaimers in their profiles and answers. Askers acknowledge that they use information at their own risk.</p>
                </SubSection>
                
                <SubSection title="7.2. &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; Service">
                    <p>THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT ANY WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED. TO THE FULLEST EXTENT PERMITTED BY LAW, QUICKCHAT B.V. DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:</p>
                    <ul className="list-disc pl-6 space-y-1 mt-2">
                      <li>Warranties of merchantability, fitness for a particular purpose, and non-infringement</li>
                      <li>Warranties regarding the accuracy, reliability, or completeness of any Content</li>
                      <li>Warranties that the Service will be uninterrupted, secure, or error-free</li>
                      <li>Warranties regarding the qualifications, conduct, or performance of any Expert</li>
                    </ul>
                    <p className="mt-3">We do not guarantee that the Service will meet your requirements or that any errors will be corrected. You use the Service at your own risk.</p>
                </SubSection>
                
                 <SubSection title="7.3. Limitation of Liability">
                    <p>TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW:</p>
                    <div className="bg-red-50 border border-red-200 p-4 rounded-lg mt-2">
                      <p className="font-semibold text-gray-900">QUICKCHAT B.V., ITS AFFILIATES, AND THEIR RESPECTIVE OFFICERS, DIRECTORS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR:</p>
                      <ul className="list-disc pl-6 space-y-2 mt-2 text-sm">
                        <li>Any indirect, incidental, special, consequential, or punitive damages</li>
                        <li>Any loss of profits, revenues, data, use, goodwill, or other intangible losses</li>
                        <li>Any damages resulting from your use of or inability to use the Service</li>
                        <li>Any damages resulting from any conduct or content of any Expert or third party on the Service</li>
                        <li>Any damages resulting from unauthorized access to or alteration of your transmissions or data</li>
                        <li>Any damages arising from reliance on Content provided by Experts</li>
                        <li>Any damages arising from unauthorized use or redistribution of Content in violation of license terms</li>
                      </ul>
                      <p className="mt-3 font-semibold">WHETHER SUCH DAMAGES ARE BASED ON WARRANTY, CONTRACT, TORT (INCLUDING NEGLIGENCE), OR ANY OTHER LEGAL THEORY, AND WHETHER OR NOT QUICKCHAT HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.</p>
                      <p className="mt-3">IN NO EVENT SHALL OUR TOTAL LIABILITY TO YOU FOR ALL DAMAGES, LOSSES, AND CAUSES OF ACTION EXCEED THE AMOUNT YOU PAID TO QUICKCHAT IN THE TWELVE (12) MONTHS PRIOR TO THE CLAIM, OR ONE HUNDRED EUROS (€100), WHICHEVER IS GREATER.</p>
                    </div>
                    <p className="mt-3 text-sm">Some jurisdictions do not allow the exclusion of certain warranties or the limitation of liability for consequential damages. In such jurisdictions, our liability shall be limited to the maximum extent permitted by law.</p>
                </SubSection>
            </Section>

            <Section title="8. Indemnification">
                <p>You agree to defend, indemnify, and hold harmless QuickChat B.V., its affiliates, and their respective officers, directors, employees, contractors, agents, licensors, and suppliers from and against any and all claims, damages, obligations, losses, liabilities, costs, debt, and expenses (including but not limited to attorney's fees) arising from:</p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li>Your use of and access to the Service</li>
                  <li>Your violation of these Terms, including license restrictions</li>
                  <li>Your violation of any third-party rights, including intellectual property, privacy, or other proprietary rights</li>
                  <li>Any Content you submit, post, or transmit through the Service</li>
                  <li>Any unauthorized use or redistribution of Expert content</li>
                  <li>Any disputes between you and other Users</li>
                  <li>For Experts: any claim arising from advice, information, or services you provide</li>
                </ul>
            </Section>

            <Section title="9. Governing Law & Dispute Resolution">
                <SubSection title="9.1. Governing Law">
                  <p>These Terms shall be governed by and construed in accordance with the laws of The Netherlands, without regard to its conflict of law provisions.</p>
                </SubSection>
                <SubSection title="9.2. Dispute Resolution">
                  <p>Any legal suit, action, or proceeding arising out of or related to these Terms or the Service shall be instituted exclusively in the courts of Amsterdam, The Netherlands. You consent to the personal jurisdiction of such courts and waive any objection to venue in such courts.</p>
                </SubSection>
                <SubSection title="9.3. Informal Resolution">
                  <p>Before filing any formal claim, you agree to first contact us at legal@quick.chat to attempt to resolve the dispute informally. We commit to working with you in good faith to resolve disputes.</p>
                </SubSection>
            </Section>

            <Section title="10. Termination">
                <SubSection title="10.1. Termination by You">
                  <p>You may terminate your account at any time through your account settings or by contacting support. Upon termination, your data will be handled according to our Privacy Policy's retention schedule. You remain liable for any obligations incurred prior to termination, including compliance with content license restrictions for answers you've purchased.</p>
                </SubSection>
                <SubSection title="10.2. Termination by Us">
                  <p>We may suspend or terminate your access to the Service immediately, without prior notice or liability, for any reason, including but not limited to:</p>
                  <ul className="list-disc pl-6 space-y-1 mt-2">
                    <li>Breach of these Terms, including license violations</li>
                    <li>Fraudulent, illegal, or harmful conduct</li>
                    <li>Repeated SLA violations (for Experts)</li>
                    <li>Payment failures or chargebacks (for Askers)</li>
                    <li>Unauthorized redistribution of Expert content</li>
                    <li>Risk to the Service or other Users</li>
                  </ul>
                </SubSection>
                <SubSection title="10.3. Effect of Termination">
                  <p>Upon termination, your right to use the Service ceases immediately. For Experts, you must fulfill any pending questions or issue refunds. For Askers, your content licenses terminate per their terms. Data retention follows our Privacy Policy. Sections that by their nature should survive termination (including but not limited to Sections 5, 7, 8, 9, and 11) shall survive.</p>
                </SubSection>
            </Section>

            <Section title="11. Changes to Terms">
                <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect via:</p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Email notification to your registered email address</li>
                  <li>Prominent notice on the Service</li>
                  <li>In-app notification upon your next login</li>
                </ul>
                <p className="mt-3">What constitutes a material change will be determined at our sole discretion. By continuing to access or use our Service after revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, you must stop using the Service and may delete your account.</p>
            </Section>

            <Section title="12. General Provisions">
                <SubSection title="12.1. Entire Agreement">
                  <p>These Terms, together with our Privacy Policy and any other policies posted on the Service, constitute the entire agreement between you and QuickChat regarding the Service.</p>
                </SubSection>
                <SubSection title="12.2. Severability">
                  <p>If any provision of these Terms is held to be invalid or unenforceable, such provision shall be struck and the remaining provisions shall remain in full force and effect.</p>
                </SubSection>
                <SubSection title="12.3. Waiver">
                  <p>No waiver of any term of these Terms shall be deemed a further or continuing waiver of such term or any other term. Our failure to assert any right or provision under these Terms shall not constitute a waiver of such right or provision.</p>
                </SubSection>
                <SubSection title="12.4. Assignment">
                  <p>You may not assign or transfer these Terms or your account without our prior written consent. We may assign our rights and obligations under these Terms without restriction.</p>
                </SubSection>
                <SubSection title="12.5. Force Majeure">
                  <p>We shall not be liable for any failure or delay in performance due to circumstances beyond our reasonable control, including but not limited to acts of God, war, terrorism, riots, embargoes, acts of civil or military authorities, fire, floods, accidents, network infrastructure failures, strikes, or shortages of transportation, facilities, fuel, energy, labor, or materials.</p>
                </SubSection>
            </Section>

            <Section title="13. Contact Us">
                 <p>If you have any questions about these Terms, please contact us at:</p>
                 <div className="bg-gray-100 p-4 rounded-lg mt-2">
                   <p><strong>Email:</strong> <a href="mailto:legal@quick.chat" className="text-indigo-600 hover:underline">legal@quick.chat</a></p>
                   <p className="mt-2"><strong>Legal Entity:</strong> QuickChat B.V.</p>
                   <p><strong>Jurisdiction:</strong> Amsterdam, The Netherlands</p>
                 </div>
            </Section>

          </article>
        </div>
      </main>
    </div>
  );
}

export default TermsPage;