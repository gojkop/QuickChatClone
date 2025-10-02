import React from 'react';

function Testimonials() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-4xl font-bold tracking-tight">
          Why QuickChat? Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">Expertise, Unrivaled.</span>
        </h2>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-700">
          AI handles facts. You handle nuance. QuickChat empowers experts in fields where human judgment and context are irreplaceable.
        </p>
        <div className="mt-16 grid lg:grid-cols-2 gap-12 text-left">
          {/* Testimonial Card 1 */}
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 flex flex-col">
            <p className="text-gray-800 text-lg mb-6 flex-grow">"QuickChat is a game-changer. I've turned my overflowing DMs into a meaningful revenue stream without adding a single meeting to my calendar."</p>
            <div className="flex items-center mb-6">
              <img className="h-12 w-12 rounded-full object-cover" src="https://i.pravatar.cc/48?u=sara_test" alt="Sara W." />
              <div className="ml-4">
                <p className="font-bold text-gray-900">Sara W.</p>
                <p className="text-sm text-gray-600">SaaS Consultant</p>
              </div>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-2xl" role="img" aria-label="Strategy">📈</span>
                <h3 className="text-xl font-semibold text-gray-900">GTM/Pricing Strategy</h3>
              </div>
              <p className="text-gray-600 text-sm">
                <strong>"Is €49 or €79 right for this ICP?"</strong> AI analyzes data; an expert offers market intuition, positioning tradeoffs, and segment context.
              </p>
            </div>
          </div>
          {/* Testimonial Card 2 */}
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 flex flex-col">
            <p className="text-gray-800 text-lg mb-6 flex-grow">"Finally, a polite way to say 'yes' to quick questions. It respects my time and my audience's need for a fast, valuable answer. Onboarding took 5 minutes."</p>
            <div className="flex items-center mb-6">
              <img className="h-12 w-12 rounded-full object-cover" src="https://i.pravatar.cc/48?u=mark_test" alt="Mark C." />
              <div className="ml-4">
                <p className="font-bold text-gray-900">Mark C.</p>
                <p className="text-sm text-gray-600">Lead UX Designer</p>
              </div>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-2xl" role="img" aria-label="Palette">🎨</span>
                <h3 className="text-xl font-semibold text-gray-900">UX/UI Design Critiques</h3>
              </div>
              <p className="text-gray-600 text-sm">
                <strong>"Tear down this signup flow."</strong> AI generates ideas; a seasoned designer offers taste, heuristics, and conversion judgment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Testimonials;