import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext.jsx';

// Charity Card Component
const CharityCard = ({ icon, title, description, link, accentColor }) => (
  <div className={`group bg-white p-6 rounded-xl border border-gray-200 hover:border-${accentColor}-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}>
    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-${accentColor}-50 text-${accentColor}-600 mb-4 group-hover:scale-110 transition-transform duration-300`}>
      {icon}
    </div>
    <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 text-sm leading-relaxed mb-4">{description}</p>
    <a 
      href={link} 
      target="_blank" 
      rel="noopener noreferrer" 
      className={`inline-flex items-center gap-1 text-sm font-semibold text-${accentColor}-600 hover:text-${accentColor}-700 transition-colors`}
    >
      <span>Learn more</span>
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    </a>
  </div>
);

// How It Works Step Component
const HowItWorksStep = ({ number, title, description, icon, iconColor }) => (
  <div className="relative flex flex-col items-center text-center">
    <div className={`relative w-16 h-16 rounded-xl bg-gradient-to-br ${iconColor} flex items-center justify-center text-white shadow-lg mb-4`}>
      {icon}
      <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white border-2 border-gray-100 flex items-center justify-center text-sm font-bold text-gray-900 shadow-sm">
        {number}
      </div>
    </div>
    <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
  </div>
);

function SocialImpactPage() {
  const { isAuthenticated } = useAuth();
  const [donations, setDonations] = useState(0);
  const counterRef = useRef(null);

  useEffect(() => {
    const targetAmount = 75421;
    const duration = 2000;
    let startTimestamp = null;
    let animationFrameId = null;

    const animateCounter = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const currentAmount = Math.floor(progress * targetAmount);
      setDonations(currentAmount);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animateCounter);
      }
    };

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        animationFrameId = requestAnimationFrame(animateCounter);
        observer.disconnect();
      }
    }, { threshold: 0.5 });

    if (counterRef.current) {
      observer.observe(counterRef.current);
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (observer && counterRef.current) {
        observer.disconnect();
      }
    };
  }, []);

  const charities = [
    {
      title: "UNICEF",
      description: "Working in over 190 countries to save children's lives, defend their rights, and help them fulfill their potential.",
      link: "https://www.unicef.org/",
      accentColor: "blue",
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 016-6h6a6 6 0 016 6v1h-3" /></svg>
    },
    {
      title: "Doctors Without Borders",
      description: "Provides humanitarian medical care in conflict zones and countries affected by endemic diseases.",
      link: "https://www.doctorswithoutborders.org/",
      accentColor: "red",
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
    },
    {
      title: "Malala Fund",
      description: "Works for a world where every girl can learn and lead, advocating for girls' education globally.",
      link: "https://malalafund.org/",
      accentColor: "pink",
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
    },
    {
      title: "WWF",
      description: "Dedicated to conserving nature and reducing the most pressing threats to the diversity of life on Earth.",
      link: "https://www.worldwildlife.org/",
      accentColor: "green",
      icon: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" /></svg>
    },
    {
      title: "GiveDirectly",
      description: "Sends cash directly to people living in extreme poverty, empowering them to choose how to spend it.",
      link: "https://www.givedirectly.org/",
      accentColor: "yellow",
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
    },
    {
      title: "charity: water",
      description: "Bringing clean and safe drinking water to people in developing countries.",
      link: "https://www.charitywater.org/",
      accentColor: "cyan",
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    }
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative pt-32 sm:pt-40 pb-20 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white"></div>
        
        <div className="container mx-auto px-6 relative z-10">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-400 via-red-400 to-purple-400 shadow-xl mb-6">
            <svg className="h-10 w-10 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M12.8781 5.16335C11.0031 3.48835 8.01609 3.61035 6.27309 5.35335C4.53009 7.09635 4.39909 10.0914 6.07109 11.9684L11.5351 17.4324C11.7951 17.6924 12.2051 17.6924 12.4651 17.4324L17.9291 11.9684C19.6011 10.0914 19.4701 7.09635 17.7271 5.35335C15.9841 3.61035 12.9971 3.48835 11.1221 5.16335L12.0001 6.04135L12.8781 5.16335Z"/>
            </svg>
          </div>

          <h1 className="text-4xl md:text-5xl font-black leading-tight text-gray-900 mb-4">
            Turn Knowledge into{' '}
            <span className="bg-gradient-to-r from-yellow-500 via-red-500 to-purple-500 bg-clip-text text-transparent">
              Kindness
            </span>
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
            mindPick empowers experts to dedicate a portion of their earnings to causes they care about.
          </p>
        </div>
      </section>

      {/* Impact Counter */}
      <section ref={counterRef} className="py-16 bg-gradient-to-br from-indigo-50 to-violet-50">
        <div className="container mx-auto px-6 text-center">
          <div className="inline-block px-4 py-1 rounded-full bg-white/80 backdrop-blur-sm border border-indigo-200 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-4">
            Our Collective Impact
          </div>
          <div className="text-5xl md:text-6xl font-black bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent" style={{ fontVariantNumeric: 'tabular-nums' }}>
            €{donations.toLocaleString('en-US')}
          </div>
          <p className="text-gray-600 mt-2">and growing, thanks to experts like you</p>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 md:py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">
              Simple & Impactful
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Three easy steps to turn your expertise into positive change
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            <HowItWorksStep
              number={1}
              title="Choose Your Cause"
              description="Select a percentage of your earnings to donate and pick a verified charity from your dashboard."
              icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>}
              iconColor="from-indigo-500 to-violet-500"
            />
            <HowItWorksStep
              number={2}
              title="Automatic Split"
              description="When someone pays for your answer, your donation amount is automatically separated."
              icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>}
              iconColor="from-violet-500 to-purple-500"
            />
            <HowItWorksStep
              number={3}
              title="Direct Impact"
              description="Donations go straight to your chosen charity via secure payment partners, with zero overhead."
              icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
              iconColor="from-green-500 to-teal-500"
            />
          </div>
        </div>
      </section>

      {/* Charities */}
      <section className="py-20 md:py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">
              Verified Partner Charities
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Choose from our carefully selected global organizations making real impact
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {charities.map((charity, index) => (
              <CharityCard key={index} {...charity} />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 md:py-24 bg-white">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
              Ready to Make an Impact?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Join mindPick and turn your expertise into a force for good
            </p>
            <Link 
              to={isAuthenticated ? "/expert" : "/signin"} 
              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold py-4 px-8 rounded-xl text-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              <span>{isAuthenticated ? "Go to Dashboard" : "Start Making Impact"}</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default SocialImpactPage;