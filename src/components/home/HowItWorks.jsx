import React from 'react';

const HowItWorksStep = ({ icon, title, description, color, index, isLast }) => (
  <div className="group relative">
    {/* Connecting line for desktop */}
    {!isLast && (
      <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-indigo-200 to-transparent -translate-x-4 z-0"></div>
    )}
    
    {/* MOBILE OPTIMIZED: Reduced padding p-8 → p-5 md:p-8 */}
    <div className="relative bg-white p-5 md:p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-indigo-200 hover:-translate-y-2">
      {/* Step number */}
      <div className={`absolute -top-4 -left-4 w-12 h-12 rounded-full bg-gradient-to-br ${color} text-white font-bold flex items-center justify-center text-xl shadow-lg`}>
        {index}
      </div>
      
      {/* Icon with gradient background */}
      <div className={`inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br ${color} text-white mb-6 shadow-lg`}>
        {icon}
      </div>
      
      {/* RESPONSIVE TEXT SIZES */}
      <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-sm md:text-base text-gray-600 leading-relaxed">{description}</p>
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
      description: "Sign up, connect Stripe, and set your price. Get a unique quick.chat/your-handle link to share in your bio, signature, and DMs.",
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
    // MOBILE OPTIMIZED: py-24 md:py-32 → py-12 md:py-24 lg:py-32
    <section id="how-it-works" className="py-12 md:py-24 lg:py-32 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-6">
        {/* RESPONSIVE TEXT SIZES */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-gray-900">
            How It Works
          </h2>
          <p className="mt-3 md:mt-4 max-w-2xl mx-auto text-base md:text-lg text-gray-600">
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