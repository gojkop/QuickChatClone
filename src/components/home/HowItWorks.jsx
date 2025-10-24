import React from 'react';

const HowItWorksStep = ({ icon, title, description, color, index, isLast }) => (
  <div className="group relative">
    {/* Connecting line for desktop */}
    {!isLast && (
      <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-indigo-200 to-transparent -translate-x-4 z-0"></div>
    )}
    
    {/* ✅ PREMIUM: Glass morphism card with enhanced shadows */}
    <div 
      className="relative p-5 md:p-8 rounded-2xl transition-all duration-300 hover:-translate-y-2 hover:scale-[1.01]"
      style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(16px) saturate(160%)',
        WebkitBackdropFilter: 'blur(16px) saturate(160%)',
        border: '1px solid rgba(229, 231, 235, 0.6)',
        boxShadow: '0 4px 16px 0 rgba(0, 0, 0, 0.04), 0 2px 8px 0 rgba(0, 0, 0, 0.02), inset 0 1px 0 0 rgba(255, 255, 255, 0.8)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 12px 32px -8px rgba(99, 102, 241, 0.25), 0 8px 16px -4px rgba(99, 102, 241, 0.15), inset 0 2px 4px 0 rgba(255, 255, 255, 0.9)';
        e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 16px 0 rgba(0, 0, 0, 0.04), 0 2px 8px 0 rgba(0, 0, 0, 0.02), inset 0 1px 0 0 rgba(255, 255, 255, 0.8)';
        e.currentTarget.style.borderColor = 'rgba(229, 231, 235, 0.6)';
      }}
    >
      {/* ✅ PREMIUM: Enhanced step number with 3D effect */}
      <div 
        className={`absolute -top-4 -left-4 w-12 h-12 rounded-full bg-gradient-to-br ${color} text-white font-bold flex items-center justify-center text-xl shadow-lg`}
        style={{
          boxShadow: '0 4px 12px -2px rgba(99, 102, 241, 0.4), 0 0 0 4px rgba(99, 102, 241, 0.1)'
        }}
      >
        {index}
      </div>
      
      {/* ✅ PREMIUM: Icon with enhanced gradient background */}
      <div 
        className={`inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br ${color} text-white mb-6`}
        style={{
          boxShadow: '0 4px 12px -2px rgba(99, 102, 241, 0.3), inset 0 1px 0 0 rgba(255, 255, 255, 0.2)'
        }}
      >
        {icon}
      </div>
      
      {/* ✅ PREMIUM: Enhanced typography */}
      <h3 
        className="text-xl md:text-2xl font-bold text-gray-900 mb-3"
        style={{
          letterSpacing: '-0.01em',
          fontFeatureSettings: '"kern" 1',
          lineHeight: '1.3'
        }}
      >
        {title}
      </h3>
      <p 
        className="text-sm md:text-base text-gray-600 leading-relaxed"
        style={{
          letterSpacing: '0.01em',
          lineHeight: '1.6'
        }}
      >
        {description}
      </p>
    </div>
  </div>
);

function HowItWorks() {
  const steps = [
    {
      icon: (
        <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      ),
      title: "Share Your Link",
      description: "Sign up, connect Stripe, and set your price. Get a unique mindpick.me/u/your-handle link to share in your bio, signature, and DMs.",
      color: "from-blue-500 to-indigo-500"
    },
    {
      icon: (
        <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: "Get Paid Questions",
      description: "Followers and clients pre-pay to send you a short async voice or video message. No more unpaid direct messages.",
      color: "from-violet-500 to-purple-500"
    },
    {
      icon: (
        <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      title: "Reply & Earn",
      description: "Record your answer when it's convenient for you. Payment is automatically transferred to your account upon sending.",
      color: "from-indigo-500 to-blue-500"
    }
  ];

  return (
    <section id="how-it-works" className="py-12 md:py-24 lg:py-32 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-6">
        {/* ✅ PREMIUM: Enhanced heading */}
        <div className="text-center mb-12 md:mb-16">
          <h2 
            className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-gray-900"
            style={{
              letterSpacing: '-0.02em',
              fontFeatureSettings: '"kern" 1'
            }}
          >
            How It Works
          </h2>
          <p 
            className="mt-3 md:mt-4 max-w-2xl mx-auto text-base md:text-lg text-gray-600"
            style={{
              letterSpacing: '0.01em',
              lineHeight: '1.6'
            }}
          >
            Three simple steps to reclaim your time and monetize your expertise
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <HowItWorksStep
              key={index}
              {...step}
              index={index + 1}
              isLast={index === steps.length - 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;