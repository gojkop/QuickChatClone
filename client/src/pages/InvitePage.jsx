import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import QuestionComposer from '@/components/question/QuestionComposer';
import logo from '@/assets/images/logo-quickchat.png';

function InvitePage() {
  const [expertHandle, setExpertHandle] = useState('');
  const [priceOption, setPriceOption] = useState('propose');
  const [proposedPrice, setProposedPrice] = useState(75);
  const [isLoading, setIsLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const composerRef = useRef();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const expert = params.get('expert') || 'an expert';
    setExpertHandle(expert);
  }, [location.search]);
  
  const handleInvite = async () => {
    setIsLoading(true);
    // 1. Get data from the QuestionComposer
    const questionData = composerRef.current.getQuestionData();
    
    // 2. Prepare the final payload
    const payload = {
      expertIdentifier: expertHandle,
      question: questionData,
      priceProposal: {
        type: priceOption,
        amount: priceOption === 'propose' ? proposedPrice : null,
        currency: 'EUR' // Or make this dynamic
      }
    };

    console.log("Submitting Invite Payload:", payload);

    // 3. Make the API call (simulation)
    // In a real app: await apiClient.post('/invites/create', payload);
    setTimeout(() => {
      setIsLoading(false);
      // 4. Redirect to a confirmation page
      navigate('/question-sent'); // We will create this page later
    }, 1500);
  };

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <a href="/" className="flex flex-col items-center justify-center mb-6">
            <img src={logo} alt="QuickChat Logo" className="h-12 w-auto mb-2" />
          </a>
          <h2 className="text-2xl font-bold text-gray-900">
            Invite <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-indigo to-brand-violet">{expertHandle}</span> to QuickChat
          </h2>
          <p className="mt-2 text-gray-600">They aren't on QuickChat yet. Send your question, and we'll invite them to join and answer.</p>
        </div>

        <QuestionComposer ref={composerRef}>
          {/* This content is injected into the composer's `children` prop */}
          <div>
            <label className="block text-lg font-semibold text-gray-900 mb-2">5. Price Proposal</label>
            <p className="text-sm text-gray-500 mb-4">Suggest a price for your question, or let the expert set their own rate.</p>
            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className={`block p-4 border-2 rounded-lg cursor-pointer ${priceOption === 'propose' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-300'}`}>
                <input type="radio" name="price-option" value="propose" checked={priceOption === 'propose'} onChange={(e) => setPriceOption(e.target.value)} className="hidden" />
                <div className="font-semibold text-gray-800">Propose a price</div>
                <div className="relative mt-3">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">€</span>
                  <input type="number" value={proposedPrice} onChange={(e) => setProposedPrice(e.target.value)} disabled={priceOption !== 'propose'} className="w-full pl-7 pr-12 py-2 border rounded-md bg-gray-50 disabled:bg-gray-200" />
                  <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500">EUR</span>
                </div>
              </label>
              <label className={`block p-4 border-2 rounded-lg cursor-pointer ${priceOption === 'expert-decides' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-300'}`}>
                <input type="radio" name="price-option" value="expert-decides" checked={priceOption === 'expert-decides'} onChange={(e) => setPriceOption(e.target.value)} className="hidden" />
                <div className="font-semibold text-gray-800">Let the expert decide</div>
                <p className="mt-2 text-sm text-gray-500">The expert will set their fee upon accepting your invitation.</p>
              </label>
            </div>
          </div>
          <button onClick={handleInvite} disabled={isLoading} className="mt-6 w-full text-lg font-bold py-4 px-4 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 transition-all">
            {isLoading ? 'Sending...' : 'Send Invite & Question'}
          </button>
        </QuestionComposer>
      </div>
    </main>
  );
}

export default InvitePage;