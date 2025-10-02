import React from 'react';

// A reusable component for the testimonial cards
const TestimonialCard = ({ quote, avatar, name, title, useCase }) => (
    <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200 flex flex-col h-full">
        <p className="text-gray-800 text-lg mb-6 flex-grow">"{quote}"</p>
        <div className="flex items-center mb-6">
            <img className="h-14 w-14 rounded-full object-cover" src={avatar} alt={name} />
            <div className="ml-4">
                <p className="font-bold text-gray-900">{name}</p>
                <p className="text-sm text-gray-600">{title}</p>
            </div>
        </div>
        <div className="bg-slate-50 p-6 rounded-lg border border-slate-100 mt-auto">
            <div className="flex items-center space-x-3 mb-2">
                <span className="text-2xl" role="img" aria-label={useCase.label}>{useCase.emoji}</span>
                <h3 className="text-xl font-semibold text-gray-900">{useCase.title}</h3>
            </div>
            <p className="text-gray-600 text-sm" dangerouslySetInnerHTML={{ __html: useCase.description }} />
        </div>
    </div>
);


function Testimonials() {
    return (
        <section className="py-20 md:py-24 relative overflow-hidden">
            {/* Organic background shapes */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-200/50 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-100 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
            
            <div className="container mx-auto px-6 text-center relative z-10">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                    Beyond AI. <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-amber-500">The Power of Human Nuance.</span>
                </h2>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
                    AI gives facts. You provide judgment. QuickChat is for expertise that requires context, experience, and a human touch.
                </p>
                <div className="mt-16 grid lg:grid-cols-2 gap-8 lg:gap-12 text-left">
                    <TestimonialCard
                        quote="QuickChat is a game-changer. I've turned my overflowing DMs into a meaningful revenue stream without adding a single meeting to my calendar."
                        avatar="https://i.pravatar.cc/56?u=sara_test"
                        name="Sara W."
                        title="SaaS Consultant"
                        useCase={{
                            emoji: '📈',
                            label: 'Strategy',
                            title: 'GTM/Pricing Strategy',
                            description: '<strong>"Is €49 or €79 right for this ICP?"</strong> AI analyzes data; an expert offers market intuition, positioning tradeoffs, and segment context.'
                        }}
                    />
                    <TestimonialCard
                        quote="Finally, a polite way to say 'yes' to quick questions. It respects my time and my audience's need for a fast, valuable answer. Onboarding took 5 minutes."
                        avatar="https://i.pravatar.cc/56?u=mark_test"
                        name="Mark C."
                        title="Lead UX Designer"
                        useCase={{
                            emoji: '🎨',
                            label: 'Palette',
                            title: 'UX/UI Design Critiques',
                            description: '<strong>"Tear down this signup flow."</strong> AI generates ideas; a seasoned designer offers taste, heuristics, and conversion judgment.'
                        }}
                    />
                </div>
            </div>
        </section>
    );
}

export default Testimonials;