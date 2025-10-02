import React from 'react';
import Hero from '../components/home/Hero';
import HowItWorks from '../components/home/HowItWorks';
import Testimonials from '../components/home/Testimonials';
import InviteForm from '../components/home/InviteForm';
import SocialImpactCTA from '../components/home/SocialImpactCTA';
import FinalCTA from '../components/home/FinalCTA';

function HomePage() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <Testimonials />
      <InviteForm />
      <SocialImpactCTA />
      <FinalCTA />
    </>
  );
}

export default HomePage;