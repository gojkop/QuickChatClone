// src/pages/HowItWorksPage.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function HowItWorksPage() {
  const [selectedPersona, setSelectedPersona] = useState('expert'); // 'expert' or 'asker'
  const [expandedStep, setExpandedStep] = useState(null);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [activeTab, setActiveTab] = useState('payment'); // payment, ai, notifications

  // Expert Journey Steps
  const expertSteps = [
  {
    id: 1,
    title: 'Sign Up & Connect Stripe',
    summary: 'Quick OAuth sign-in and secure payment setup',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      </svg>
    ),
    details: [
      'Sign in with Google or LinkedIn (30 seconds)',
      'Connect Stripe for secure payouts',
      'Complete profile with expertise areas',
      'Total setup time: ~5 minutes'
    ]
  },
  {
    id: 2,
    title: 'Set Your Expertise & Pricing',
    summary: 'Choose question types and set your rates',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    details: [
      'Enable Quick Consult (fixed price) for tactical questions',
      'Enable Deep Dive (askers propose price) for comprehensive analysis',
      'Set your SLA (response time) for each question type',
      'Define your areas of expertise and update anytime'
    ]
  },
  {
    id: 3,
    title: 'Get Your Personal Link',
    summary: 'Share your mindPick link anywhere',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
    ),
    details: [
      'Your unique URL: mindpick.me/yourname',
      'Add to email signature, LinkedIn bio, Twitter',
      'Share in communities and DMs',
      'Works anywhere you have an audience'
    ]
  },
  {
    id: 4,
    title: 'Receive Question Notification',
    summary: 'Get notified when someone asks',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
    details: [
      'Email + dashboard notification',
      'Quick Consult: SLA timer starts immediately',
      'Deep Dive: Review offer within 24h (SLA starts after you accept)',
      'Payment authorized (asker not charged yet)'
    ]
  },
  {
    id: 5,
    title: 'Review & Decide',
    summary: 'Accept or decline - your choice',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    details: [
      'Quick Consult: Answer within your SLA or let it expire',
      'Deep Dive: Accept or decline offer within 24h',
      'If you decline: payment released, asker not charged',
      'Deep Dive accepted: SLA countdown starts (your configured response time)'
    ]
  },
  {
    id: 6,
    title: 'Answer & Get Paid',
    summary: 'Record your answer, earn money',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    details: [
      'Record audio or video answer',
      'Submit → payment charged & transferred to you',
      'AI generates transcript & summary (Pro)',
      'Answer delivered to asker instantly'
    ]
  }
];

  // Asker Journey Steps
  // Asker Journey Steps
const askerSteps = [
  {
    id: 1,
    title: 'Find an Expert',
    summary: 'Browse profiles or invite someone specific',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    details: [
      'Browse expert profiles by expertise',
      'See their question types: Quick Consult (fixed price) or Deep Dive (you propose)',
      'Review pricing and response time (SLA) for each type',
      'Or invite a specific expert not yet on mindPick'
    ]
  },
  {
    id: 2,
    title: 'Submit Your Question',
    summary: 'Choose question type and submit',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    ),
    details: [
      'Quick Consult: Pay fixed price, expert answers within their SLA',
      'Deep Dive: Propose your price, expert reviews offer in 24h',
      'Record your question (audio or video)',
      'Payment authorized (not charged until answer delivered)'
    ]
  },
  {
    id: 3,
    title: 'Expert Reviews',
    summary: 'They decide whether to answer',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    details: [
      'Quick Consult: Expert starts answering immediately',
      'Deep Dive: Expert accepts or declines your offer within 24h',
      'If declined or offer expires: instant refund, no charge',
      'If accepted: Expert answers within their SLA, then you\'re charged'
    ]
  },
  {
    id: 4,
    title: 'Receive Answer',
    summary: 'Get their expert response',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    details: [
      'Expert records their answer',
      'Payment charged only now (not before)',
      'Answer delivered via email + dashboard',
      'SLA guarantee: refunded if they miss deadline'
    ]
  },
  {
    id: 5,
    title: 'Access & Review',
    summary: 'Watch, read, and save your answer',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
    details: [
      'Watch or listen to full answer',
      'AI transcript for easy reading (Pro)',
      'AI summary for quick TL;DR (Pro)',
      'Searchable in your question history'
    ]
  }
];

  /// FAQ Preview Data
const faqPreview = [
  {
    q: 'What\'s the difference between Quick Consult and Deep Dive?',
    a: 'Quick Consult (⚡) has a fixed price set by the expert and they answer within their committed SLA (response time). Deep Dive (🎯) lets you propose a price for complex questions. The expert reviews your offer within 24h, and if they accept, they answer within their committed SLA. Both types pre-reserve funds and only charge after the answer is delivered.'
  },
  {
    q: 'When am I actually charged?',
    a: 'For both question types, payment is authorized when you submit, but you\'re only charged after the expert delivers the answer. For Deep Dive, if the expert declines your offer or doesn\'t respond within 24h, you\'re refunded instantly. For Quick Consult, if the expert misses their SLA, you\'re refunded automatically.'
  },
  {
    q: 'How does Deep Dive pricing work?',
    a: 'You propose a price based on the expert\'s suggested range (e.g., €150-300). The expert reviews your offer within 24h. If accepted, their SLA countdown starts and they answer your question. If declined, you\'re instantly refunded and can resubmit at a different amount or find another expert.'
  },
  {
    q: 'How long should answers be?',
    a: 'There\'s no strict limit, but most answers are 3-10 minutes. Experts typically provide comprehensive answers that fully address the question. You can see average response lengths on expert profiles.'
  },
  {
    q: 'Is my payment information secure?',
    a: 'Absolutely. All payments are processed through Stripe, a PCI-compliant payment processor used by millions of businesses. We never store your full payment details—Stripe handles all sensitive data.'
  }
];

  const toggleStep = (stepId) => {
    setExpandedStep(expandedStep === stepId ? null : stepId);
  };

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const currentSteps = selectedPersona === 'expert' ? expertSteps : askerSteps;

  return (
    <div className="bg-white min-h-screen">
      
      {/* HERO SECTION */}
      <section className="pt-20 sm:pt-24 pb-10 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900 mb-3">
            How mindPick Works
          </h1>
          <p className="text-base text-gray-600 mb-8 max-w-2xl mx-auto">
            The professional way to ask and answer questions—no scheduling, no awkwardness
          </p>

          {/* Persona Toggle */}
          <div className="inline-flex items-center bg-white rounded-lg border-2 border-gray-200 p-1 shadow-sm">
            <button
              onClick={() => setSelectedPersona('expert')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                selectedPersona === 'expert'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>For Experts</span>
            </button>
            <button
              onClick={() => setSelectedPersona('asker')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                selectedPersona === 'asker'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>For Askers</span>
            </button>
          </div>
        </div>
      </section>

      {/* JOURNEY FLOW SECTION */}
      <section className="py-10 md:py-12 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                {selectedPersona === 'expert' ? 'The Expert Journey' : 'The Asker Journey'}
              </h2>
              <p className="text-sm text-gray-600">
                {selectedPersona === 'expert' 
                  ? 'From sign-up to earning—here\'s exactly how it works'
                  : 'From finding an expert to getting your answer'
                }
              </p>
            </div>

            {/* Steps - Desktop: Horizontal Timeline, Mobile: Vertical */}
            <div className="space-y-3">
              {currentSteps.map((step, index) => (
                <div key={step.id} className="relative">
                  {/* Connector Line (except last item) */}
                  {index < currentSteps.length - 1 && (
                    <div className="hidden md:block absolute top-16 left-6 w-0.5 h-full bg-gradient-to-b from-indigo-100 to-transparent"></div>
                  )}

                  {/* Step Card */}
                  <div className="relative bg-white border border-gray-200 rounded-lg p-4 hover:border-indigo-200 hover:shadow-md transition-all duration-200">
                    <div className="flex items-start gap-3">
                      {/* Step Number Badge - SUBTLE OUTLINED VERSION */}
                      <div className="flex-shrink-0 w-8 h-8 rounded-full border-2 border-indigo-300 bg-white text-indigo-600 font-semibold flex items-center justify-center text-sm">
                        {step.id}
                      </div>

                      {/* Icon - SMALLER */}
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-50 to-violet-50 text-indigo-600 flex items-center justify-center">
                        {step.icon}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          {step.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-2">
                          {step.summary}
                        </p>

                        {/* Expandable Details */}
                        <button
                          onClick={() => toggleStep(step.id)}
                          className="inline-flex items-center gap-1 text-indigo-600 font-semibold text-sm hover:text-indigo-700 transition-colors"
                        >
                          <span>{expandedStep === step.id ? 'Hide' : 'Show'} details</span>
                          <svg 
                            className={`w-4 h-4 transition-transform ${expandedStep === step.id ? 'rotate-180' : ''}`}
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>

                        {/* Expanded Details */}
                        {expandedStep === step.id && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <ul className="space-y-2">
                              {step.details.map((detail, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                  <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                  </svg>
                                  <span>{detail}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* BEHIND THE SCENES SECTION */}
      <section className="py-10 md:py-12 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                Behind the Scenes
              </h2>
              <p className="text-sm text-gray-600">
                Understanding the technology that makes it work
              </p>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {[
                { id: 'payment', label: 'Payment Flow', icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                )},
                { id: 'ai', label: 'AI Processing', icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                )},
                { id: 'notifications', label: 'Notifications', icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                )}
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                    activeTab === tab.id
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
              
              {/* Payment Flow Tab */}
              {activeTab === 'payment' && (
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Payment Flow Architecture</h3>
                  
                  {/* Visual Flow Diagram */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 border border-indigo-100">
                    <div className="space-y-4">
                      {/* Step 1 */}
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">1</div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">Asker submits question</div>
                          <div className="text-sm text-gray-600">Payment method authorized via Stripe</div>
                        </div>
                        <div className="hidden md:block text-2xl text-blue-400">↓</div>
                      </div>

                      {/* Step 2 */}
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center text-sm font-bold">2</div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">Funds reserved (not charged)</div>
                          <div className="text-sm text-gray-600">Money held in authorization, asker's account not debited</div>
                        </div>
                        <div className="hidden md:block text-2xl text-indigo-400">↓</div>
                      </div>

                      {/* Step 3 - Question Type Branch */}
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-500 text-white flex items-center justify-center text-sm font-bold">3</div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">Question type determines flow</div>
                          <div className="text-sm text-gray-600 mt-1">
                            ⚡ Quick Consult → Expert answers directly<br/>
                            🎯 Deep Dive → Expert accepts/declines offer (24h) → If accepted, answers
                          </div>
                        </div>
                        <div className="hidden md:block text-2xl text-violet-400">⤵</div>
                      </div>

                      {/* Outcomes */}
                      <div className="grid md:grid-cols-2 gap-4 ml-12">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-start gap-2">
                            <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            <div>
                              <div className="font-bold text-green-900 mb-1">Answer Submitted</div>
                              <div className="text-sm text-green-700">Payment captured & transferred to expert</div>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start gap-2">
                            <svg className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <div>
                              <div className="font-bold text-gray-900 mb-1">Declined / SLA Missed / Offer Expired</div>
                              <div className="text-sm text-gray-700">Authorization released, asker not charged</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Key Points */}
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <div>
                        <div className="font-semibold text-gray-900">Stripe Connect Security</div>
                        <div className="text-sm text-gray-600">All payments processed through Stripe's PCI-compliant infrastructure. We never store full payment details.</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <div className="font-semibold text-gray-900">Automatic Payout Timing</div>
                        <div className="text-sm text-gray-600">Experts receive payouts according to Stripe's standard schedule (typically 2-7 business days to your bank).</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      <div>
                        <div className="font-semibold text-gray-900">Zero Risk for Askers</div>
                        <div className="text-sm text-gray-600">You're only charged if the expert delivers an answer. Declined questions, expired offers, or missed SLAs result in zero charge.</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* AI Processing Tab */}
              {activeTab === 'ai' && (
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-6">AI-Powered Features</h3>
                  
                  <div className="space-y-6">
                    {/* Feature 1: Transcription */}
                    <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-6 border border-purple-100">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-purple-500 text-white flex items-center justify-center">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 mb-2">Automatic Transcription</h4>
                          <p className="text-sm text-gray-700 mb-3">
                            Every audio and video answer is automatically converted to text using advanced speech-to-text AI. Never miss a detail—read answers at your own pace or search for specific information.
                          </p>
                          <div className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span>Pro Feature</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Feature 2: Summaries */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-500 text-white flex items-center justify-center">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 mb-2">Smart Summaries</h4>
                          <p className="text-sm text-gray-700 mb-3">
                            AI analyzes each answer and generates a concise summary highlighting key points. Perfect for quickly reviewing answers or sharing main insights with your team.
                          </p>
                          <div className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span>Pro Feature</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Feature 3: Search */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-green-500 text-white flex items-center justify-center">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 mb-2">Searchable History</h4>
                          <p className="text-sm text-gray-700 mb-3">
                            All transcripts are indexed and searchable. Find that answer from 6 months ago in seconds by searching for keywords, topics, or expert names.
                          </p>
                          <div className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span>Pro Feature</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Privacy Note */}
                  <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <div className="text-sm text-gray-700">
                        <span className="font-semibold">Privacy First:</span> AI processes your content to provide these features, but we never use your data for training AI models. Your questions and answers remain private.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Real-time Notifications</h3>
                  
                  <div className="space-y-4">
                    {/* Expert Notifications */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        For Experts
                      </h4>
                      <div className="space-y-2 ml-7">
                        <div className="flex items-start gap-2">
                          <svg className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-sm text-gray-700">Email alert when new question arrives</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <svg className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-sm text-gray-700">Dashboard notification with SLA countdown</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <svg className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-sm text-gray-700">Reminder before SLA deadline</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <svg className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-sm text-gray-700">Payment confirmation when answer submitted</span>
                        </div>
                      </div>
                    </div>

                    {/* Asker Notifications */}
                    <div className="pt-4 border-t border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        For Askers
                      </h4>
                      <div className="space-y-2 ml-7">
                        <div className="flex items-start gap-2">
                          <svg className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-sm text-gray-700">Confirmation when question submitted</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <svg className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-sm text-gray-700">Alert if expert declines (so you can ask another)</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <svg className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-sm text-gray-700">Instant notification when answer delivered</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <svg className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-sm text-gray-700">Automatic refund notice if SLA missed</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Visual Timeline */}
                  <div className="mt-6 p-5 bg-gradient-to-br from-indigo-50 to-violet-50 rounded-xl border border-indigo-100">
                    <h4 className="font-semibold text-gray-900 mb-4 text-sm">Notification Timeline Example</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="text-xs text-gray-500 w-16">0:00</div>
                        <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500"></div>
                        <div className="text-sm text-gray-700">Question submitted → Both parties notified</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-xs text-gray-500 w-16">2:00</div>
                        <div className="flex-shrink-0 w-2 h-2 rounded-full bg-indigo-500"></div>
                        <div className="text-sm text-gray-700">Expert views question in dashboard</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-xs text-gray-500 w-16">4:00</div>
                        <div className="flex-shrink-0 w-2 h-2 rounded-full bg-violet-500"></div>
                        <div className="text-sm text-gray-700">Answer recorded → Asker notified instantly</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-xs text-gray-500 w-16">4:01</div>
                        <div className="flex-shrink-0 w-2 h-2 rounded-full bg-green-500"></div>
                        <div className="text-sm text-gray-700">Payment confirmed → Expert notified</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* AI FEATURES SPOTLIGHT */}
      <section className="py-10 md:py-12 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Where AI Makes It Better
            </h2>
            <p className="text-sm text-gray-600 mb-8">
              Smart features that save time and add value
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl border border-purple-100 p-4 text-left hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-lg bg-purple-500 text-white flex items-center justify-center mb-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">Auto Transcripts</h3>
                <p className="text-sm text-gray-700 mb-3">
                  Never lose details from audio/video answers. Every answer is automatically transcribed.
                </p>
                <div className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-semibold">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span>Pro</span>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-4 text-left hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-lg bg-blue-500 text-white flex items-center justify-center mb-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">Smart Summaries</h3>
                <p className="text-sm text-gray-700 mb-3">
                  Get the TL;DR instantly. AI extracts key points from every answer.
                </p>
                <div className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-semibold">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span>Pro</span>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100 p-4 text-left hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-lg bg-green-500 text-white flex items-center justify-center mb-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">Searchable History</h3>
                <p className="text-sm text-gray-700 mb-3">
                  Find past answers in seconds. Search by keyword, topic, or expert.
                </p>
                <div className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span>Pro</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ PREVIEW SECTION */}
      <section className="py-10 md:py-12 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                Common Questions
              </h2>
              <p className="text-sm text-gray-600">
                Quick answers to frequently asked questions
              </p>
            </div>

            <div className="space-y-3">
              {faqPreview.map((faq, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-indigo-300 transition-colors">
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full text-left p-5 flex items-center justify-between gap-4"
                  >
                    <span className="font-semibold text-gray-900">{faq.q}</span>
                    <svg 
                      className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${expandedFaq === index ? 'rotate-180' : ''}`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedFaq === index && (
                    <div className="px-5 pb-5 text-sm text-gray-700 border-t border-gray-100 pt-4">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <Link 
                to="/faq" 
                className="inline-flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-700 transition-colors"
              >
                <span>View all 23 FAQs</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA SECTION - MINIMALISTIC DESIGN */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-white to-gray-50 border-t border-gray-100">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto">
            {selectedPersona === 'expert' ? (
              <>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                  Ready to Start Earning?
                </h2>
                <p className="text-gray-600 text-base mb-8">
                  Create your expert page in 5 minutes and start monetizing your expertise
                </p>
                <Link
                  to="/signin"
                  className="inline-flex items-center gap-2 bg-gray-900 text-white font-semibold py-3 px-8 rounded-lg hover:bg-gray-800 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <span>Start Earning Today</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <p className="mt-4 text-gray-500 text-sm">
                  No credit card required • 5-minute setup • Cancel anytime
                </p>
              </>
            ) : (
              <>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                  Need to Ask a Specific Expert?
                </h2>
                <p className="text-gray-600 text-base mb-8">
                  Invite them to mindPick and ask your question professionally
                </p>
                <Link
                  to="/invite"
                  className="inline-flex items-center gap-2 bg-gray-900 text-white font-semibold py-3 px-8 rounded-lg hover:bg-gray-800 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <span>Invite an Expert</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <p className="mt-4 text-gray-500 text-sm">
                  Professional outreach • No awkward emails • Zero risk payment
                </p>
              </>
            )}
          </div>
        </div>
      </section>

    </div>
  );
}

export default HowItWorksPage;