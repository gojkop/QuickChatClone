import React from 'react';
import Hero from '@/components/home/Hero.jsx';
import HowItWorks from '@/components/home/HowItWorks.jsx';
import ValueCalculator from '@/components/home/ValueCalculator.jsx'; 
import Testimonials from '@/components/home/Testimonials.jsx';
import SocialImpactCTA from '@/components/home/SocialImpactCTA.jsx';
import FinalCTA from '@/components/home/FinalCTA.jsx';

function HomePage() {
  return (
    // The entire page now flows seamlessly on the default background
    <>
      <Hero />
      <HowItWorks />
      <ValueCalculator />
      <Testimonials />
      <SocialImpactCTA />
      <FinalCTA />
    </>
  );
}

export default HomePage;