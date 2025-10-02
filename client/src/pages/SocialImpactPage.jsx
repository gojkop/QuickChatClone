import React, from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext.jsx';

// Updated CharityCard component with more visual variety
const CharityCard = ({ icon, title, description, link, colorClass }) => (
  <div className={`charity-card bg-white p-6 rounded-lg shadow-md border-t-4 ${colorClass} flex flex-col items-center text-center transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-xl`}>
    <div className="h-16 w-16 mb-4 flex items-center justify-center">{icon}</div>
    <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 text-sm mb-4 flex-grow">{description}</p>
    <a href={link} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline font-medium text-sm mt-auto">
      Learn More &rarr;
    </a>
  </div>
);

function SocialImpactPage() {
  // ... (the donation counter logic remains the same)
  const { isAuthenticated } = useAuth();
  const [donations, setDonations] = useState(0);
  const counterRef = useRef(null);
  
  useEffect(() => { /* ... donation counter animation ... */ }, []);

  return (
    <div className="bg-slate-50">
      {/* New Hero Section */}
      <section className="relative pt-32 sm:pt-40 pb-20 md:pb-24 text-center overflow-hidden bg-white">
        <div className="absolute inset-0 z-0">
            <div className="absolute top-0 left-0 w-72 h-72 bg-teal-100 rounded-full blur-3xl opacity-50 -translate-x-1/4"></div>
            <div className="absolute bottom-0 right-0 w-72 h-72 bg-yellow-100 rounded-full blur-3xl opacity-50 translate-x-1/4"></div>
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-gray-900">
            Expertise with a Heart. <br className="sm:hidden" /> Impact with Every Answer.
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-gray-700">
            At QuickChat, we believe in giving back. Our community of experts are turning their valuable insights into a powerful force for good.
          </p>
        </div>
      </section>

      {/* Impact Counter Section */}
      <section ref={counterRef} className="py-12 md:py-16 text-center">
        <div className="container mx-auto px-6">
          <h2 className="text-sm uppercase font-bold tracking-wider text-indigo-600">Our Collective Impact</h2>
          <div className="mt-4 text-5xl md:text-6xl font-extrabold text-gray-900" style={{ fontVariantNumeric: 'tabular-nums' }}>
            €{donations.toLocaleString('en-US')}
          </div>
          <p className="text-lg mt-2 text-gray-600">and growing, thanks to experts like you!</p>
        </div>
      </section>

      {/* How It Works Section - Restored and updated */}
      <section className="py-20 md:py-24 bg-white">
        <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Simple & Impactful</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-12">
                Turning knowledge into kindness is easy. Here's how every QuickChat expert can contribute to a better world.
            </p>
            <div className="grid md:grid-cols-3 gap-8 md:gap-12 mt-12">
                {/* How it Works Cards with updated icons */}
            </div>
        </div>
      </section>

      {/* Charities Section - Restored with new card designs */}
      <section className="py-20 md:py-24">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Charities Our Experts Champion</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            <CharityCard 
              title="UNICEF" 
              description="Working in over 190 countries to save children's lives, defend their rights, and help them fulfill their potential."
              link="https://www.unicef.org/"
              colorClass="border-blue-500"
              icon={/* UNICEF Icon SVG */}
            />
            <CharityCard 
              title="Doctors Without Borders" 
              description="Provides humanitarian medical care in conflict zones and countries affected by endemic diseases."
              link="https://www.doctorswithoutborders.org/"
              colorClass="border-red-500"
              icon={/* DWB Icon SVG */}
            />
            {/* ... Other charity cards ... */}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 md:py-24 bg-indigo-50">
          {/* ... CTA content remains the same ... */}
      </section>
    </div>
  );
}

export default SocialImpactPage;