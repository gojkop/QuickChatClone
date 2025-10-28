// src/components/dashboardv2/overview/WelcomeHero.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '@/context/ProfileContext';
import { useQuestionsQuery } from '@/hooks/useQuestionsQuery';
import QRCodeModal from '@/components/dashboard/QRCodeModal';
import { Clock, TrendingUp } from 'lucide-react';

function WelcomeHero() {
  const navigate = useNavigate();
  const { user, expertProfile } = useProfile();
  // Fetch more questions to ensure we get all pending ones for accurate SLA calculation
  const { data: questionsData } = useQuestionsQuery({ page: 1, perPage: 50 });
  const [copied, setCopied] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleCopyProfileLink = () => {
    if (expertProfile?.handle) {
      const url = `${window.location.origin}/u/${expertProfile.handle}`;
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getNextUrgentSLA = () => {
    const questions = questionsData?.questions || [];

    // Filter for pending questions: paid status, not answered, not pending deep dive offers, not declined offers
    const pendingQuestions = questions.filter(q =>
      q.status === 'paid' &&
      !q.answered_at &&
      !q.pending_deep_dive_offer_id && // Exclude pending deep dive offers
      q.pricing_status !== 'offer_declined' // Exclude declined offers
    );

    if (pendingQuestions.length === 0) return null;

    let closestDeadline = null;
    let closestQuestion = null;

    pendingQuestions.forEach(q => {
      // Use question's specific SLA snapshot, fallback to expert's default SLA
      const slaHours = q.sla_hours_snapshot || expertProfile?.sla_hours || 24;
      const createdAt = q.created_at > 4102444800 ? q.created_at / 1000 : q.created_at;
      const deadline = new Date((createdAt + slaHours * 3600) * 1000);

      const now = new Date();
      const diff = deadline - now;

      // Only consider questions with future deadlines (diff > 0)
      // AND either no closest deadline yet, or this deadline is sooner
      if (diff > 0 && (!closestDeadline || deadline < closestDeadline)) {
        closestDeadline = deadline;
        closestQuestion = q;
      }
    });

    if (!closestDeadline) return null;

    const now = new Date();
    const diff = closestDeadline - now;
    const hoursLeft = Math.floor(diff / (1000 * 60 * 60));
    const minutesLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return {
      hoursLeft,
      minutesLeft,
      isUrgent: hoursLeft < 2,
      question: closestQuestion
    };
  };

  const urgentSLA = getNextUrgentSLA();
  const userName = user?.name?.split(' ')[0] || 'Expert';

  return (
    <>
        <div className="mb-4 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-xl p-4 border border-indigo-100 shadow-premium-sm card-pattern">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          {/* Left: Greeting & Profile Links */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl sm:text-2xl font-black text-gray-900">
                {getGreeting()}, {userName}!
              </h1>
              
              {expertProfile?.handle && expertProfile.public && (
                <div className="hidden md:flex items-center gap-1 px-2 py-0.5 bg-white/80 backdrop-blur-sm border border-indigo-200 rounded-lg shadow-sm">
                  <a 
                    href={`/u/${expertProfile.handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:opacity-80 transition"
                    title="View public profile"
                  >
                    <svg className="w-3 h-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    <span className="text-xs font-semibold text-indigo-600 max-w-[100px] truncate">
                      /u/{expertProfile.handle}
                    </span>
                  </a>
                  <div className="w-px h-3 bg-indigo-200 mx-0.5"></div>
                  <button
                    onClick={handleCopyProfileLink}
                    className="p-0.5 hover:bg-indigo-100 rounded transition"
                    title="Copy link"
                    type="button"
                  >
                    {copied ? (
                      <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-3 h-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                  <div className="w-px h-3 bg-indigo-200 mx-0.5"></div>
                  <button
                    onClick={() => setIsQRModalOpen(true)}
                    className="p-0.5 hover:bg-indigo-100 rounded transition"
                    title="Show QR code"
                    type="button"
                  >
                    <svg className="w-3 h-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-600 font-medium">
              Here's your activity snapshot for today.
            </p>
          </div>

          {/* Right: Activity Ticker & SLA Countdown */}
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Activity Ticker */}
            <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
              <TrendingUp size={14} className="text-green-600" />
              <span className="text-sm font-bold text-gray-900">
                {questionsData?.pagination?.total || 0}
              </span>
              <span className="text-xs text-gray-600">total</span>
            </div>

            {/* SLA Countdown - Clickable */}
            {urgentSLA && (
              <button
                onClick={() => navigate(`/dashboard/inbox#question-${urgentSLA.question.id}`)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border shadow-sm transition-all hover:scale-105 hover:shadow-md cursor-pointer ${
                  urgentSLA.isUrgent
                    ? 'bg-red-50 border-red-200 hover:bg-red-100'
                    : 'bg-amber-50 border-amber-200 hover:bg-amber-100'
                }`}
                title="Click to view urgent question"
              >
                <Clock size={14} className={urgentSLA.isUrgent ? 'text-red-600' : 'text-amber-600'} />
                <div className="text-xs">
                  <span className={`font-bold ${urgentSLA.isUrgent ? 'text-red-900' : 'text-amber-900'}`}>
                    {urgentSLA.hoursLeft}h {urgentSLA.minutesLeft}m
                  </span>
                  <span className={`ml-1 ${urgentSLA.isUrgent ? 'text-red-700' : 'text-amber-700'}`}>
                    until SLA
                  </span>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Profile Links */}
        {expertProfile?.handle && expertProfile.public && (
          <div className="md:hidden flex items-center gap-2 mt-2 pt-2 border-t border-indigo-200">
            <button
              onClick={handleCopyProfileLink}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-white/80 hover:bg-white border border-indigo-200 rounded-lg text-xs font-semibold text-indigo-600 transition"
              type="button"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
            <button
              onClick={() => setIsQRModalOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-white/80 hover:bg-white border border-indigo-200 rounded-lg text-xs font-semibold text-indigo-600 transition"
              type="button"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              QR
            </button>
          </div>
        )}
      </div>

      {expertProfile && (
        <QRCodeModal
          isOpen={isQRModalOpen}
          onClose={() => setIsQRModalOpen(false)}
          profileUrl={`${window.location.origin}/u/${expertProfile.handle}`}
          expertName={user?.name || 'Expert'}
          handle={expertProfile.handle}
        />
      )}
    </>
  );
}

export default WelcomeHero;