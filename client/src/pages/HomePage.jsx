import React from 'react';
import Hero from '@/components/home/Hero.jsx';
import HowItWorks from '@/components/home/HowItWorks.jsx';
import Testimonials from '@/components/home/Testimonials.jsx';
import SocialImpactCTA from '@/components/home/SocialImpactCTA.jsx';
import FinalCTA from '@/components/home/FinalCTA.jsx';

function HomePage() {
  return (
    // The entire page now flows seamlessly on the default background
    <>
      <Hero />
      <HowItWorks />
      <Testimonials />
      {/* As per our design strategy, the "Invite an Expert" form has been removed 
        from the main landing page to maintain a clear focus on converting experts.
        This functionality remains available on its dedicated /invite page.
      */}
      <SocialImpactCTA />
      <FinalCTA />
    </>
  );
}

export default HomePage;