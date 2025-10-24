import React from 'react';
import { Zap, Users, DollarSign } from 'lucide-react';

const steps = [
  {
    icon: Zap,
    title: "Share Your Link",
    description: "Create your profile and set your price per question. Share your unique link anywhere—social media, email signature, or website.",
    color: "from-indigo-500 to-purple-600"
  },
  {
    icon: Users,
    title: "Answer Questions",
    description: "Get notified when someone asks. Answer in your own time with text, voice notes, or video responses.",
    color: "from-purple-500 to-pink-600"
  },
  {
    icon: DollarSign,
    title: "Get Paid Instantly",
    description: "Money hits your account immediately. No waiting, no invoicing, no chasing payments. Just expertise → money.",
    color: "from-pink-500 to-rose-600"
  }
];

function HowItWorks() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-6">
        
        {/* Simplified heading - NO shimmer animation */}
        <div className="text-center mb-16">
          <h2 
            className="text-3xl md:text-4xl lg:text-5xl font-black mb-4"
            style={{
              letterSpacing: '-0.02em',
              fontFeatureSettings: '"kern" 1'
            }}
          >
            How It Works:{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Dead Simple
            </span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Three steps. Zero complexity. Start earning today.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              
              {/* Simplified card - clean hover only */}
              <div 
                className="relative p-8 rounded-2xl transition-all duration-300 hover:-translate-y-2"
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(16px) saturate(160%)',
                  WebkitBackdropFilter: 'blur(16px) saturate(160%)',
                  border: '1px solid rgba(229, 231, 235, 0.6)',
                  boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.04)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 8px 24px -4px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 2px 8px 0 rgba(0, 0, 0, 0.04)';
                }}
              >
                {/* Step number - NO glow animation */}
                <div 
                  className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-md"
                >
                  {index + 1}
                </div>
                
                {/* Icon - NO bounce animation */}
                <div className="mb-6 mt-4">
                  <div 
                    className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${step.color}`}
                    style={{
                      boxShadow: '0 8px 16px -4px rgba(99, 102, 241, 0.3)'
                    }}
                  >
                    <step.icon className="w-8 h-8 text-white" strokeWidth={2.5} />
                  </div>
                </div>
                
                {/* Enhanced typography */}
                <h3 
                  className="text-xl md:text-2xl font-bold mb-3 text-gray-900"
                  style={{
                    letterSpacing: '-0.01em'
                  }}
                >
                  {step.title}
                </h3>
                
                <p 
                  className="text-gray-600 leading-relaxed"
                  style={{
                    letterSpacing: '0.01em',
                    lineHeight: '1.6'
                  }}
                >
                  {step.description}
                </p>
              </div>
              
              {/* Connector line (hidden on last item) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-6 w-12 h-0.5 bg-gradient-to-r from-indigo-200 to-purple-200 -translate-y-1/2"></div>
              )}
            </div>
          ))}
        </div>
        
      </div>
    </section>
  );
}

export default HowItWorks;