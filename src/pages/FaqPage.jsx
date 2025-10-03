import React from 'react';
import AccordionItem from '../components/common/AccordionItem';

function FaqPage() {
  return (
    <div className="container mx-auto px-6 py-16 pt-32 sm:pt-40">
      <div className="max-w-4xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl font-black text-gray-900">Frequently Asked Questions</h1>
          <p className="mt-2 text-gray-500">Find answers to common questions below.</p>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold text-indigo-600 mb-6">For Experts</h2>
          <div className="space-y-4">
            <AccordionItem question="What are the fees?">
              The Starter plan is free to join with a 10% platform fee per transaction. The Pro plan costs €15/month and reduces the fee to 7%. All transactions are also subject to standard Stripe processing fees, which are paid by the expert.
            </AccordionItem>
            <AccordionItem question="How do I get paid?">
              Payments are processed via Stripe Connect. You will connect your bank account securely to Stripe during onboarding. Payouts are handled directly by Stripe and sent to your bank account.
            </AccordionItem>
            <AccordionItem question="What happens if I miss my SLA?">
              If you don't answer a question within your stated Service Level Agreement (SLA), the asker is automatically refunded in full. This policy builds trust and ensures a reliable experience for everyone.
            </AccordionItem>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold text-indigo-600 mb-6">For Askers</h2>
          <div className="space-y-4">
            <AccordionItem question="Is my payment secure?">
              Yes. All payments are handled by Stripe, a global leader in online payments. QuickChat never sees or stores your credit card information.
            </AccordionItem>
            <AccordionItem question="When will I get my answer?">
              Each expert sets their own Service Level Agreement (SLA), which is clearly displayed on their public page (e.g., 24 hours, 48 hours). You are guaranteed to receive a response within that window.
            </AccordionItem>
            <AccordionItem question="What if the expert doesn't answer in time?">
              If the expert misses their stated SLA, your payment is automatically refunded in full to your original payment method. No action is needed from you.
            </AccordionItem>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FaqPage;