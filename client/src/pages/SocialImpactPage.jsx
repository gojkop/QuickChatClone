import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext.jsx';

// A helper component for the charity cards to keep the main component cleaner
const CharityCard = ({ icon, title, description, link }) => (
  <div className="charity-card bg-white p-6 rounded-lg shadow-md border border-gray-200 flex flex-col items-center text-center transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-xl">
    <div className="icon-circle-bg bg-indigo-100 text-indigo-600 mb-4 flex items-center justify-center h-16 w-16 rounded-full">
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 text-sm mb-4 flex-grow">{description}</p>
    <a href={link} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline font-medium text-sm">
      Learn More &rarr;
    </a>
  </div>
);

function SocialImpactPage() {
  const { isAuthenticated } = useAuth();
  const [donations, setDonations] = useState(0);
  const counterRef = useRef(null);

  // Effect for the animated counter
  useEffect(() => {
    const targetAmount = 75421;
    const duration = 2000;
    let startTimestamp = null;

    const animateCounter = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const currentAmount = Math.floor(progress * targetAmount);
      setDonations(currentAmount);

      if (progress < 1) {
        requestAnimationFrame(animateCounter);
      }
    };

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        requestAnimationFrame(animateCounter);
        observer.disconnect();
      }
    }, { threshold: 0.5 });

    if (counterRef.current) {
      observer.observe(counterRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <section className="pt-32 sm:pt-40 py-20 md:py-24 text-center bg-gradient-to-br from-indigo-50 to-blue-100 relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-gray-900">
            Expertise with a Heart. <br className="sm:hidden" /> Impact with Every Answer.
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-gray-700">
            At QuickChat, we believe in giving back. Our community of experts are turning their valuable insights into a powerful force for good.
          </p>
          <div className="mt-10">
            <svg className="mx-auto h-16 w-16 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
            </svg>
          </div>
        </div>
      </section>

      <section className="bg-emerald-100 py-12 md:py-16 text-center">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-emerald-800">
            Our Collective Impact
          </h2>
          <div ref={counterRef} className="flex flex-col items-center justify-center mt-8">
            <div className="bg-white text-indigo-800 rounded-lg p-8 md:p-10 shadow-2xl inline-block max-w-full">
              <p className="text-sm uppercase tracking-wider font-bold mb-2">Total Donations Facilitated</p>
              <p className="text-5xl md:text-6xl font-extrabold" style={{ fontVariantNumeric: 'tabular-nums' }}>
                €{donations.toLocaleString('en-US')}
              </p>
              <p className="text-lg mt-4 text-gray-700">and growing, thanks to experts like you!</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-24 bg-white">
        <div className="container mx-auto px-6 text-center">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">How It Works: Simple & Impactful</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
                Turning knowledge into kindness is easy. Here's how every QuickChat expert can contribute to a better world.
            </p>
            {/* THIS SECTION HAS BEEN RESTORED */}
            <div className="grid md:grid-cols-3 gap-8 md:gap-12 mt-12">
                <div className="flex flex-col items-center p-6 rounded-lg bg-gray-50 border border-gray-200 shadow-sm text-center">
                    <div className="flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 text-indigo-600 mb-4">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Expert Chooses Cause</h3>
                    <p className="text-gray-600">Experts define a percentage of their earnings to donate and select a verified charity directly from their QuickChat dashboard.</p>
                </div>
                <div className="flex flex-col items-center p-6 rounded-lg bg-gray-50 border border-gray-200 shadow-sm text-center">
                    <div className="flex items-center justify-center h-16 w-16 rounded-full bg-purple-100 text-purple-600 mb-4">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Ask Pays, Funds Split</h3>
                    <p className="text-gray-600">When an asker pays for an expert's insights, the designated donation portion is automatically separated for charity.</p>
                </div>
                <div className="flex flex-col items-center p-6 rounded-lg bg-gray-50 border border-gray-200 shadow-sm text-center">
                    <div className="flex items-center justify-center h-16 w-16 rounded-full bg-green-100 text-green-600 mb-4">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0zm-4 0h.01"></path></svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Direct to Charity</h3>
                    <p className="text-gray-600">The donation is sent directly to the chosen charity via our secure payment partners, with no overhead from QuickChat.</p>
                </div>
            </div>
        </div>
      </section>

      <section className="py-20 md:py-24 bg-gray-100">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Charities Our Experts Champion</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
            We partner with leading global platforms to offer a wide range of vetted charities. Here are just a few examples of the impactful causes our experts champion:
          </p>
          {/* THIS SECTION HAS BEEN RESTORED AND EXPANDED */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            <CharityCard 
              title="UNICEF" 
              description="Working in over 190 countries to save children's lives, defend their rights, and help them fulfill their potential."
              link="https://www.unicef.org/"
              icon={<svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 016-6h6a6 6 0 016 6v1h-3"></path></svg>}
            />
            <CharityCard 
              title="Doctors Without Borders" 
              description="Provides humanitarian medical care in conflict zones and countries affected by endemic diseases."
              link="https://www.doctorswithoutborders.org/"
              icon={<svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>}
            />
            <CharityCard 
              title="Malala Fund" 
              description="Works for a world where every girl can learn and lead, advocating for girls' education globally."
              link="https://malalafund.org/"
              icon={<svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>}
            />
            <CharityCard 
              title="WWF" 
              description="Dedicated to conserving nature and reducing the most pressing threats to the diversity of life on Earth."
              link="https://www.worldwildlife.org/"
              icon={<svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"></path></svg>}
            />
            <CharityCard 
              title="GiveDirectly" 
              description="Sends cash directly to people living in extreme poverty, empowering them to choose how to spend it."
              link="https://www.givedirectly.org/"
              icon={<svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>}
            />
            <CharityCard 
              title="charity: water" 
              description="Bringing clean and safe drinking water to people in developing countries."
              link="https://www.charitywater.org/"
              icon={<svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
            />
          </div>
        </div>
      </section>

      <section className="py-20 md:py-24 bg-indigo-50">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Ready to Make Your Impact?</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Join QuickChat and turn your valuable insights into a force for good. It's simple, impactful, and rewarding.
          </p>
          <Link to={isAuthenticated ? "/expert" : "/signin"} className="inline-block bg-indigo-600 text-white font-bold py-4 px-10 rounded-lg text-lg hover:bg-indigo-700 transition transform hover:scale-105 duration-300 shadow-lg">
            {isAuthenticated ? "Go to Dashboard" : "Become an Impactful Expert"} &rarr;
          </Link>
        </div>
      </section>
    </>
  );
}

export default SocialImpactPage;