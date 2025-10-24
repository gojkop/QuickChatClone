// src/components/home/SoundFamiliar.jsx
import React from 'react';
import { Sparkles, Target, Rocket, Award } from 'lucide-react';

function SoundFamiliar() {
  const opportunities = [
    {
      Icon: Sparkles,
      iconColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      title: 'Every Question Has Value',
      description: 'Turn casual inquiries into paid consultations. Your insights are worth more than a free DM.',
      stat: '$50-500',
      statLabel: 'per question'
    },
    {
      Icon: Target,
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
      title: 'Your Time, Your Price',
      description: 'Set your rate and get paid for every minute. No more "quick calls" that steal your focus.',
      stat: '10-30 min',
      statLabel: 'avg response'
    },
    {
      Icon: Rocket,
      iconColor: 'text-pink-600',
      bgColor: 'bg-pink-50',
      title: 'What AI Can\'t Deliver',
      description: 'Your judgment, experience, and context-aware advice is irreplaceable. That\'s premium value.',
      stat: '85%',
      statLabel: 'prefer experts'
    },
    {
      Icon: Award,
      iconColor: 'text-rose-600',
      bgColor: 'bg-rose-50',
      title: 'Premium Expertise = Premium Pay',
      description: 'You spent years building your knowledge. Get compensated like the professional you are.',
      stat: '$200/hr+',
      statLabel: 'expert rates'
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto">
          
          {/* ✅ BALANCED PREMIUM: Clean header with subtle accent */}
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-sm font-semibold text-indigo-700 mb-6">
              <Sparkles className="w-4 h-4" />
              <span>Unlock Your Potential</span>
            </div>
            
            <h2 
              className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-4"
              style={{
                letterSpacing: '-0.02em'
              }}
            >
              Imagine What's{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Possible
              </span>
            </h2>
            
            <p 
              className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto"
              style={{
                letterSpacing: '0.01em',
                lineHeight: '1.6'
              }}
            >
              Turn your expertise into a revenue stream. Every conversation becomes an opportunity.
            </p>
          </div>

          {/* ✅ BALANCED PREMIUM: Cards with subtle glass effect */}
          <div className="grid md:grid-cols-2 gap-5 md:gap-6 mb-10">
            {opportunities.map((item, index) => (
              <div 
                key={index}
                className="group relative rounded-xl p-6 md:p-7 transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  border: '1px solid rgba(229, 231, 235, 0.8)',
                  boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.04)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 8px 24px -8px rgba(99, 102, 241, 0.2), 0 4px 12px -4px rgba(0, 0, 0, 0.05)';
                  e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 2px 8px 0 rgba(0, 0, 0, 0.04)';
                  e.currentTarget.style.borderColor = 'rgba(229, 231, 235, 0.8)';
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  {/* SVG Icon with subtle background */}
                  <div className={`flex-shrink-0 p-3 rounded-lg ${item.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                    <item.Icon className={`w-6 h-6 ${item.iconColor}`} strokeWidth={2} />
                  </div>
                  
                  {/* Clean stat display */}
                  <div className="text-right">
                    <div 
                      className="text-2xl font-black text-indigo-600"
                      style={{ letterSpacing: '-0.02em' }}
                    >
                      {item.stat}
                    </div>
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      {item.statLabel}
                    </div>
                  </div>
                </div>
                
                {/* Content */}
                <h3 
                  className="text-xl font-bold text-gray-900 mb-2"
                  style={{
                    letterSpacing: '-0.01em'
                  }}
                >
                  {item.title}
                </h3>
                
                <p 
                  className="text-gray-600 leading-relaxed"
                  style={{
                    letterSpacing: '0.01em',
                    lineHeight: '1.6'
                  }}
                >
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          {/* ✅ BALANCED PREMIUM: Clean CTA with subtle gradient */}
          <div 
            className="rounded-2xl p-8 md:p-10 text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)',
              border: '1px solid rgba(99, 102, 241, 0.1)',
              boxShadow: '0 4px 16px 0 rgba(99, 102, 241, 0.06)'
            }}
          >
            <p 
              className="text-2xl md:text-3xl font-black text-gray-900 mb-3"
              style={{
                letterSpacing: '-0.02em'
              }}
            >
              Ready to Get Paid for What You Know?
            </p>
            <p 
              className="text-base md:text-lg text-gray-700 leading-relaxed max-w-2xl mx-auto"
              style={{
                letterSpacing: '0.01em',
                lineHeight: '1.6'
              }}
            >
              Join thousands of experts who've turned their inbox into a revenue stream. 
              <span className="font-semibold text-indigo-600"> Set your price, share your link, start earning today.</span>
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}

export default SoundFamiliar;