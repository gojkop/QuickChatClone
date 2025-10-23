import React from 'react';
import AnimatedBackground from './AnimatedBackground';

const TestimonialCard = ({ quote, avatar, name, title, useCase, cardColor, borderColor }) => (
  <div className={`group bg-white/80 backdrop-blur-sm p-5 md:p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border ${borderColor} hover:-translate-y-1`}>
    <div className="flex gap-1 mb-3 md:mb-4">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} className="w-4 h-4 md:w-5 md:h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
        </svg>
      ))}
    </div>
    
    <p className="text-gray-800 text-base md:text-lg mb-5 md:mb-6 leading-relaxed italic">
      "{quote}"
    </p>
    
    <div className="flex items-center mb-5 md:mb-6">
      <img className={`h-12 w-12 md:h-14 md:w-14 rounded-full object-cover ring-2 ${cardColor}`} src={avatar} alt={name} />
      <div className="ml-3 md:ml-4">
        <p className="font-bold text-gray-900 text-sm md:text-base">{name}</p>
        <p className="text-xs md:text-sm text-gray-600">{title}</p>
      </div>
    </div>
    
    <div className={`bg-gradient-to-br ${useCase.bgGradient} p-4 md:p-6 rounded-xl border ${useCase.borderColor}`}>
      <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
        <span className="text-2xl md:text-3xl" role="img" aria-label={useCase.label}>{useCase.emoji}</span>
        <h4 className="text-lg md:text-xl font-bold text-gray-900">{useCase.title}</h4>
      </div>
      <p className="text-gray-700 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: useCase.description }} />
    </div>
  </div>
);

function Testimonials() {
  const testimonials = [
    {
      quote: "mindPick is a game-changer. I've turned my overflowing DMs into a meaningful revenue stream without adding a single meeting to my calendar.",
      // MOCKUP: Professional headshot - business woman with glasses
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=faces",
      name: "Sarah Williams",
      title: "SaaS GTM Consultant",
      cardColor: "ring-indigo-100",
      borderColor: "border-gray-100 hover:border-indigo-200",
      useCase: {
        emoji: '📈',
        label: 'Strategy',
        title: 'GTM/Pricing Strategy',
        description: '<strong>"Is €49 or €79 right for this ICP?"</strong> AI analyzes data; an expert offers market intuition, positioning tradeoffs, and segment context.',
        bgGradient: 'from-blue-50 to-indigo-50',
        borderColor: 'border-indigo-100'
      }
    },
    {
      quote: "Finally, a polite way to say 'yes' to quick questions. It respects my time and my audience's need for a fast, valuable answer. Onboarding took 5 minutes.",
      // MOCKUP: Professional headshot - male designer
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=faces",
      name: "Marcus Chen",
      title: "Lead Product Designer",
      cardColor: "ring-violet-100",
      borderColor: "border-gray-100 hover:border-violet-200",
      useCase: {
        emoji: '🎨',
        label: 'Design',
        title: 'UX/UI Design Critiques',
        description: '<strong>"Tear down this signup flow."</strong> AI generates ideas; a seasoned designer offers taste, heuristics, and conversion judgment.',
        bgGradient: 'from-violet-50 to-purple-50',
        borderColor: 'border-violet-100'
      }
    }
  ];

  return (
    <AnimatedBackground variant="testimonials">
      <section className="py-12 md:py-24 lg:py-32 relative">
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-gray-900">
              Beyond AI.{' '}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 bg-clip-text text-transparent">
                  The Power of Human Nuance.
                </span>
              </span>
            </h2>
            <p className="mt-3 md:mt-4 max-w-2xl mx-auto text-base md:text-lg text-gray-600">
              AI gives facts. You provide judgment. mindPick is for expertise that requires context, experience, and a human touch.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-6 md:gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={index} {...testimonial} />
            ))}
          </div>
        </div>
      </section>
    </AnimatedBackground>
  );
}

export default Testimonials;