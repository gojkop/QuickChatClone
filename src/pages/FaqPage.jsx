// src/pages/FaqPage.jsx
import React, { useState } from 'react';
import AccordionItem from '../components/common/AccordionItem';

function FaqPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  // Comprehensive FAQ data with CORRECTED payment flow
  const faqData = {
    'getting-started': {
      title: 'Getting Started',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      questions: [
        {
          q: "How long does setup take?",
          a: "Most experts complete their profile in under 5 minutes. You'll need to: 1) Sign in with Google/LinkedIn/Email, 2) Set your price and response time (SLA), 3) Connect your Stripe account for payouts, and 4) Customize your public profile. That's it! You can start sharing your link immediately."
        },
        {
          q: "Do I need to be verified or certified to join?",
          a: "No formal certification is required. If people value your expertise enough to pay for your advice, you're qualified. We serve consultants, designers, developers, marketers, coaches, executives, and professionals across all industries. Your credibility comes from your experience and the value you provide."
        },
        {
          q: "Can I use mindPick if I already offer consulting?",
          a: "Absolutely! mindPick is perfect for quick questions that don't justify a full consulting engagement. Think of it as your 'micro-consulting' layer for people who need fast, focused advice without booking a full session. Many consultants use mindPick to filter leads and build relationships."
        },
        {
          q: "What's the difference between Starter and Pro plans?",
          a: "Starter is free with a 10% platform fee. Pro costs €15/month with a reduced 7% fee, plus you get AI transcripts, remove 'Powered by mindPick' branding, custom branding options, social share kits, and priority support. Pro pays for itself after about 20 questions per month."
        }
      ]
    },
    'pricing-payments': {
      title: 'Pricing & Payments',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      questions: [
        {
          q: "What are the fees?",
          a: "Starter plan: Free to join with a 10% platform fee per transaction. Pro plan: €15/month with a reduced 7% platform fee. Additionally, Stripe charges standard processing fees (~2.9% + €0.30 per transaction), which are paid by the expert."
        },
        {
          q: "How do I get paid?",
          a: "Payments are processed via Stripe Connect and sent directly to your bank account automatically. Stripe handles all payment processing securely. Payouts typically arrive within 2-7 business days depending on your bank and country."
        },
        {
          q: "When is payment actually charged?",
          a: "When an asker submits a question, their payment method is authorized and the funds are reserved (not charged yet). The actual charge only happens after you submit your answer. If you decline the question or miss your SLA, the reserved funds are released back to the asker automatically—they're never charged."
        },
        {
          q: "Can I change my price later?",
          a: "Yes! You can update your price per question anytime from your dashboard. Changes apply to new questions immediately. Existing pending questions keep their original price."
        },
        {
          q: "What if I miss my SLA (Service Level Agreement)?",
          a: "If you don't answer within your stated timeframe (e.g., 24 hours, 48 hours), the payment reservation is automatically released and the asker is not charged. This policy builds trust with your audience and keeps experts accountable. Set a realistic SLA you can consistently meet."
        },
        {
          q: "Can I offer refunds after answering?",
          a: "Once you've submitted an answer and the payment has been charged, refunds must be handled through support. However, you can always decline a question before answering to avoid charging the asker."
        }
      ]
    },
    'how-it-works': {
      title: 'How It Works',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      questions: [
        {
          q: "What format are the questions?",
          a: "Askers can send you a video or voice message up to 90 seconds long. This gives you full context and feels more personal than text. Video/voice questions help you understand tone, urgency, and nuance that text can't capture."
        },
        {
          q: "How do I answer questions?",
          a: "You can record a video or voice response directly in your dashboard, or type a text answer if you prefer. Answer when it's convenient for you—that's the beauty of async! You control your schedule, no meetings required."
        },
        {
          q: "Can I decline a question after it's submitted?",
          a: "Yes! You can manually decline any question before answering it. When you decline, the payment authorization is released and the asker is not charged. You can also let your SLA timer expire, which automatically releases the payment. Use the 'accepting questions' toggle in your dashboard to pause new questions when you're unavailable."
        },
        {
          q: "What happens if a question is outside my expertise?",
          a: "Simply decline the question from your dashboard. The asker won't be charged and they can ask someone else. It's better to decline than provide subpar advice. You can also clarify your expertise areas in your bio and use expertise tags to help askers understand what you're best suited to answer."
        },
        {
          q: "What if I need more than my SLA time to answer?",
          a: "If you need more time, you have two options: 1) Contact the asker directly (if they provided contact info) to let them know, or 2) Set a longer SLA in your settings to give yourself more breathing room. Remember, your SLA is a commitment, so choose a timeframe you can reliably meet."
        }
      ]
    },
    'for-askers': {
      title: 'For Askers',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      questions: [
        {
          q: "When am I charged for my question?",
          a: "Your payment method is authorized when you submit your question, but you're only charged after the expert submits their answer. If the expert declines your question or doesn't answer within their SLA, you're not charged at all—the authorization is released automatically."
        },
        {
          q: "Is my payment secure?",
          a: "Yes. All payments are processed by Stripe, a global leader in online payments trusted by millions of businesses. mindPick never sees or stores your credit card information. Your payment data is encrypted and secure."
        },
        {
          q: "When will I get my answer?",
          a: "Each expert sets their own SLA (Service Level Agreement), typically 24-48 hours. You'll see this clearly displayed on their profile before you submit your question. Most experts respond faster than their stated SLA. If they don't respond in time, you won't be charged."
        },
        {
          q: "What if the expert doesn't answer?",
          a: "If the expert declines your question or misses their SLA, the payment authorization is automatically released and you're not charged. You'll receive a notification and can ask another expert or resubmit your question."
        },
        {
          q: "Can I ask follow-up questions?",
          a: "Each payment covers one question/answer exchange. For follow-ups, you can submit a new question (and pay again). Some experts offer discounts for repeat askers—check their profile or ask them directly."
        }
      ]
    },
    'technical': {
      title: 'Technical & Support',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      questions: [
        {
          q: "What browsers and devices are supported?",
          a: "mindPick works on all modern browsers (Chrome, Firefox, Safari, Edge). For video/voice recording, we recommend Chrome or Firefox for best performance. Both expert dashboard and asker experience work great on mobile devices."
        },
        {
          q: "Do I need special equipment?",
          a: "Just a device with a camera and microphone. Your phone, laptop, or tablet works perfectly. No special software or downloads required—everything runs in your browser."
        },
        {
          q: "How do I contact support?",
          a: "Email us at support@mindpick.me. Pro plan users get priority support with faster response times. We typically respond within 24 hours (or faster for urgent issues)."
        }
      ]
    }
  };

  // Filter questions based on search term and category
  const getFilteredQuestions = () => {
    let allQuestions = [];
    
    Object.entries(faqData).forEach(([categoryKey, category]) => {
      if (activeCategory === 'all' || activeCategory === categoryKey) {
        category.questions.forEach(q => {
          if (searchTerm === '' || 
              q.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
              q.a.toLowerCase().includes(searchTerm.toLowerCase())) {
            allQuestions.push({
              ...q,
              category: category.title,
              categoryKey: categoryKey
            });
          }
        });
      }
    });
    
    return allQuestions;
  };

  const filteredQuestions = getFilteredQuestions();
  const totalQuestions = Object.values(faqData).reduce((sum, cat) => sum + cat.questions.length, 0);

  return (
    <div className="container mx-auto px-6 py-16 pt-32 sm:pt-40">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-gray-900 mb-3">Frequently Asked Questions</h1>
          <p className="text-gray-600 text-lg">
            Everything you need to know about mindPick
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {totalQuestions} questions answered
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="mb-8 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              activeCategory === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {Object.entries(faqData).map(([key, category]) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
                activeCategory === key
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.icon}
              {category.title}
            </button>
          ))}
        </div>

        {/* Search Results Count */}
        {searchTerm && (
          <div className="mb-4 text-sm text-gray-600">
            Found {filteredQuestions.length} question{filteredQuestions.length !== 1 ? 's' : ''}
            {searchTerm && ` matching "${searchTerm}"`}
          </div>
        )}

        {/* Questions by Category */}
        {activeCategory === 'all' && !searchTerm ? (
          // Show organized by category
          Object.entries(faqData).map(([categoryKey, category]) => (
            <div key={categoryKey} className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                  {category.icon}
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{category.title}</h2>
              </div>
              <div className="space-y-4">
                {category.questions.map((item, index) => (
                  <AccordionItem key={index} question={item.q}>
                    {item.a}
                  </AccordionItem>
                ))}
              </div>
            </div>
          ))
        ) : (
          // Show filtered results
          <div className="space-y-4">
            {filteredQuestions.length > 0 ? (
              filteredQuestions.map((item, index) => (
                <div key={index}>
                  <AccordionItem question={item.q}>
                    {item.a}
                  </AccordionItem>
                  <p className="text-xs text-gray-500 mt-1 ml-4">Category: {item.category}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="text-gray-600 mb-2">No questions found matching "{searchTerm}"</p>
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                >
                  Clear search
                </button>
              </div>
            )}
          </div>
        )}

        {/* Still Have Questions CTA */}
        <div className="mt-16 bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl border border-indigo-200 p-8 text-center">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Still have questions?</h3>
          <p className="text-gray-700 mb-6">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <a
            href="mailto:support@mindpick.me"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}

export default FaqPage;