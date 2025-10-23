// src/pages/HomePage.jsx
import React from 'react';
import Hero from '@/components/home/Hero.jsx';
import SoundFamiliar from '@/components/home/SoundFamiliar.jsx';
import HowItWorks from '@/components/home/HowItWorks.jsx';
import LastMileExpertise from '@/components/home/LastMileExpertise.jsx';
import ValueCalculator from '@/components/home/ValueCalculator.jsx'; 
import Testimonials from '@/components/home/Testimonials.jsx';
import InviteExpertSection from '@/components/home/InviteExpertSection.jsx';
import FinalCTA from '@/components/home/FinalCTA.jsx';
import SEO from '@/components/common/SEO';

function HomePage() {
  return (
    <>
      <SEO
        title="mindPick - Monetize Your Expertise"
        description="Get paid for your expertise. mindPick connects you with people who need personalized answers AI can't provide. Set your price, share your link, earn from your knowledge—no meetings required."
      />
      
      {/* OPTIMIZED CONVERSION FLOW */}
      
      {/* 1. Hero - Clean, single CTA, AI positioning */}
      <Hero />
      
      {/* 2. Problem Agitation - Make pain visceral */}
      <SoundFamiliar />
      
      {/* 3. Solution Overview - How it works */}
      <HowItWorks />
      
      {/* 4. AI Positioning + Expertise Ladder - Competitive differentiation */}
      <LastMileExpertise />
      
      {/* 5. Interactive Value Calculator - Build excitement */}
      <ValueCalculator />
      
      {/* 6. Social Proof - Testimonials with AI vs Human examples */}
      <Testimonials />
      
      {/* 7. Invite Expert - Mini Asker section (blends nicely) */}
      <InviteExpertSection />
      
      {/* 8. Final Conversion Push */}
      <FinalCTA />
    </>
  );
}

export default HomePage;