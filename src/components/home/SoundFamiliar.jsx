// src/components/home/SoundFamiliar.jsx
import React from 'react';
import { Sparkles, Target, Rocket, Award } from 'lucide-react';

function SoundFamiliar() {
  const opportunities = [
    {
      Icon: Sparkles,
      iconColor: 'text-gray-600',
      bgColor: 'bg-gray-50',
      title: 'Your Inbox Is Full of "Quick Questions"',
      description: 'DMs, emails, LinkedIn messages asking for advice. Each one takes 20+ minutes to answer thoughtfully.',
      stat: '5-15',
      statLabel: 'per week'
    },
    {
      Icon: Target,
      iconColor: 'text-gray-600',
      bgColor: 'bg-gray-50',
      title: 'People Say "Can I Pick Your Brain?"',
      description: 'Coffee chats, "quick calls," and Zoom meetings that pull you away from paid work—just to share what you know.',
      stat: '3-5 hrs',
      statLabel: 'per week'
    },
    {
      Icon: Rocket,
      iconColor: 'text-gray-600',
      bgColor: 'bg-gray-50',
      title: 'They\'ve Already Tried Google and AI',
      description: 'The questions you get aren\'t basic. They need someone who understands nuance, context, and their specific situation.',
      stat: '80%',
      statLabel: 'say "AI missed this"'
    },
    {
      Icon: Award,
      iconColor: 'text-gray-600',
      bgColor: 'bg-gray-50',
      title: 'Years of Experience, Given Away Free',
      description: 'You invested time and money to build your expertise. Others charge hundreds per hour for similar advice.',
      stat: '10+ yrs',
      statLabel: 'avg expertise'
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto">
          
          {/* Problem-focused header */}
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200 text-sm font-semibold text-amber-700 mb-6">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Sound Familiar?</span>
            </div>
            
            <h2 
              className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-4"
              style={{
                letterSpacing: '-0.02em'
              }}
            >
              You're Already{' '}
              <span className="bg-gradient-to-r from-gray-600 to-gray-800 bg-clip-text text-transparent">
                Doing the Work
              </span>
            </h2>
            
            <p 
              className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto"
              style={{
                letterSpacing: '0.01em',
                lineHeight: '1.6'
              }}
            >
              Every day, you answer questions, share insights, and help people solve problems. Just not getting paid for it.
            </p>
          </div>

          {/* Pain point cards */}
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
                  e.currentTarget.style.boxShadow = '0 8px 24px -8px rgba(0, 0, 0, 0.15)';
                  e.currentTarget.style.borderColor = 'rgba(156, 163, 175, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 2px 8px 0 rgba(0, 0, 0, 0.04)';
                  e.currentTarget.style.borderColor = 'rgba(229, 231, 235, 0.8)';
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  {/* Icon with subtle background */}
                  <div className={`flex-shrink-0 p-3 rounded-lg ${item.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                    <item.Icon className={`w-6 h-6 ${item.iconColor}`} strokeWidth={2} />
                  </div>
                  
                  {/* Stat display */}
                  <div className="text-right">
                    <div 
                      className="text-2xl font-black text-gray-700"
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

          {/* Simple transition text */}
          <div className="text-center">
            <p 
              className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto"
              style={{
                letterSpacing: '0.01em',
                lineHeight: '1.6'
              }}
            >
              Sound familiar? There's a better way to handle this.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}

export default SoundFamiliar;