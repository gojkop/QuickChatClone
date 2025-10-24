// src/components/home/SoundFamiliar.jsx
import React from 'react';

function SoundFamiliar() {
  const opportunities = [
    {
      icon: '✨',
      gradient: 'from-indigo-500 to-purple-600',
      title: 'Every Question Has Value',
      description: 'Turn casual inquiries into paid consultations. Your insights are worth more than a free DM.',
      stat: '$50-500',
      statLabel: 'per question'
    },
    {
      icon: '🎯',
      gradient: 'from-purple-500 to-pink-600',
      title: 'Your Time, Your Price',
      description: 'Set your rate and get paid for every minute. No more "quick calls" that steal your focus.',
      stat: '10-30 min',
      statLabel: 'avg response time'
    },
    {
      icon: '🚀',
      gradient: 'from-pink-500 to-rose-600',
      title: 'What AI Can\'t Deliver',
      description: 'Your judgment, experience, and context-aware advice is irreplaceable. That\'s premium value.',
      stat: '85%',
      statLabel: 'prefer human experts'
    },
    {
      icon: '💎',
      gradient: 'from-rose-500 to-orange-500',
      title: 'Premium Expertise = Premium Pay',
      description: 'You spent years building your knowledge. Get compensated like the professional you are.',
      stat: '$200/hr+',
      statLabel: 'expert rates'
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-white via-indigo-50/30 to-white relative overflow-hidden">
      
      {/* Premium floating background elements */}
      <div className="pointer-events-none absolute top-20 left-10 w-64 h-64 bg-gradient-to-br from-indigo-200/20 to-purple-200/20 rounded-full blur-3xl float-slow"></div>
      <div className="pointer-events-none absolute bottom-20 right-10 w-48 h-48 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-3xl float-medium"></div>
      
      <div className="container mx-auto px-6 relative">
        <div className="max-w-5xl mx-auto">
          
          {/* ✅ PREMIUM: Glass morphism badge */}
          <div className="text-center mb-12">
            <div 
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-indigo-700 mb-6"
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                boxShadow: '0 4px 16px 0 rgba(99, 102, 241, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.6)'
              }}
            >
              <span className="text-xl">💡</span>
              <span>Unlock Your Potential</span>
            </div>
            
            {/* ✅ PREMIUM: Positive headline with gradient shimmer */}
            <h2 
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-4"
              style={{
                letterSpacing: '-0.02em',
                fontFeatureSettings: '"kern" 1',
                textRendering: 'optimizeLegibility'
              }}
            >
              Imagine What's{' '}
              <span className="relative inline-block">
                <span className="gradient-text-shimmer bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Possible
                </span>
                <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 200 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 5C50 1 150 1 199 5" stroke="url(#gradient-positive)" strokeWidth="3" strokeLinecap="round"/>
                  <defs>
                    <linearGradient id="gradient-positive" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#4F46E5" />
                      <stop offset="50%" stopColor="#7C3AED" />
                      <stop offset="100%" stopColor="#EC4899" />
                    </linearGradient>
                  </defs>
                </svg>
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

          {/* ✅ PREMIUM: Opportunity Cards Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-10">
            {opportunities.map((item, index) => (
              <div 
                key={index}
                className="card-hover-lift group relative rounded-2xl overflow-hidden"
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(16px) saturate(160%)',
                  WebkitBackdropFilter: 'blur(16px) saturate(160%)',
                  border: '1px solid rgba(229, 231, 235, 0.6)',
                  boxShadow: '0 4px 16px 0 rgba(0, 0, 0, 0.04), 0 2px 8px 0 rgba(0, 0, 0, 0.02), inset 0 1px 0 0 rgba(255, 255, 255, 0.8)',
                  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}
              >
                {/* Gradient accent bar on left */}
                <div 
                  className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${item.gradient}`}
                ></div>
                
                <div className="p-6 md:p-7 pl-8">
                  {/* Icon with gradient background */}
                  <div className="flex items-start justify-between mb-4">
                    <div 
                      className={`icon-bounce inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${item.gradient} text-3xl shadow-lg`}
                    >
                      {item.icon}
                    </div>
                    
                    {/* Premium stat badge */}
                    <div className="text-right">
                      <div 
                        className="text-2xl font-black bg-gradient-to-br from-gray-700 to-gray-900 bg-clip-text text-transparent"
                        style={{ letterSpacing: '-0.02em' }}
                      >
                        {item.stat}
                      </div>
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {item.statLabel}
                      </div>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <h3 
                    className="text-xl md:text-2xl font-bold text-gray-900 mb-2"
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
              </div>
            ))}
          </div>

          {/* ✅ PREMIUM: Call-to-action card */}
          <div 
            className="relative rounded-2xl p-8 md:p-10 text-center overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              border: '1px solid rgba(99, 102, 241, 0.1)',
              boxShadow: '0 8px 24px 0 rgba(99, 102, 241, 0.08), inset 0 1px 0 0 rgba(255, 255, 255, 0.6)'
            }}
          >
            <div className="relative z-10">
              <p 
                className="text-2xl md:text-3xl font-black text-gray-900 mb-3"
                style={{
                  letterSpacing: '-0.02em'
                }}
              >
                Ready to Get Paid for What You Know?
              </p>
              <p 
                className="text-lg text-gray-700 leading-relaxed max-w-2xl mx-auto"
                style={{
                  letterSpacing: '0.01em',
                  lineHeight: '1.6'
                }}
              >
                Join other experts who've already turned their inbox into a revenue stream. 
                <span className="font-semibold text-indigo-600"> Set your price, share your link, start earning today.</span>
              </p>
            </div>
            
            {/* Decorative gradient orb */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default SoundFamiliar;