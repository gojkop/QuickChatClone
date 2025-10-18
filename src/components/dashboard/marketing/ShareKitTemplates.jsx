import React, { useState, useMemo } from 'react';
import { SHARE_TEMPLATES, PLATFORM_INFO } from '@/constants/shareTemplates';
import { processTemplate, getTemplateData, buildCampaignUrl } from '@/utils/templateEngine';
import TemplateCard from './TemplateCard';
import TemplateEditorModal from './TemplateEditorModal';

const TEMPLATES_PER_PAGE = 6;

export default function ShareKitTemplates({ campaigns, expertProfile, user, stats }) {
  const [currentStep, setCurrentStep] = useState('platform');
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [campaignSearchQuery, setCampaignSearchQuery] = useState('');
  const [showCampaignDropdown, setShowCampaignDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const templateData = useMemo(() => {
    if (!expertProfile || !user) return {};
    
    const data = getTemplateData(expertProfile, user, stats);
    
    if (selectedCampaign) {
      data.profile_url = buildCampaignUrl(expertProfile, selectedCampaign);
    }
    
    return data;
  }, [expertProfile, user, stats, selectedCampaign]);

  const platforms = useMemo(() => {
    const uniquePlatforms = [...new Set(SHARE_TEMPLATES.map(t => t.platform))];
    return uniquePlatforms.map(platform => ({
      id: platform,
      info: PLATFORM_INFO[platform],
      count: SHARE_TEMPLATES.filter(t => t.platform === platform).length,
    }));
  }, []);

  const filteredCampaigns = useMemo(() => {
    if (!campaignSearchQuery) return campaigns;
    
    const query = campaignSearchQuery.toLowerCase();
    return campaigns.filter(c =>
      c.name.toLowerCase().includes(query) ||
      c.utm_source.toLowerCase().includes(query) ||
      c.utm_campaign.toLowerCase().includes(query)
    );
  }, [campaigns, campaignSearchQuery]);

  const groupedCampaigns = useMemo(() => {
    const groups = {};
    filteredCampaigns.forEach(campaign => {
      const source = campaign.utm_source || 'other';
      if (!groups[source]) {
        groups[source] = [];
      }
      groups[source].push(campaign);
    });
    return groups;
  }, [filteredCampaigns]);

  const recentCampaigns = useMemo(() => {
    return [...campaigns]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);
  }, [campaigns]);

  const filteredTemplates = useMemo(() => {
    let filtered = SHARE_TEMPLATES;

    if (selectedPlatform && selectedPlatform !== 'all') {
      filtered = filtered.filter(t => t.platform === selectedPlatform);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [selectedPlatform, searchQuery]);

  const totalPages = Math.ceil(filteredTemplates.length / TEMPLATES_PER_PAGE);
  const paginatedTemplates = filteredTemplates.slice(
    (currentPage - 1) * TEMPLATES_PER_PAGE,
    currentPage * TEMPLATES_PER_PAGE
  );

  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedPlatform, searchQuery]);

  const handleEdit = (template) => {
    const processedText = processTemplate(template.template, templateData);
    setEditingTemplate({ template, processedText });
  };

  const handlePlatformSelect = (platform) => {
    setSelectedPlatform(platform);
    setCurrentStep('campaign');
  };

  const handleCampaignSelect = (campaign) => {
    setSelectedCampaign(campaign);
    setShowCampaignDropdown(false);
    setCampaignSearchQuery('');
  };

  const handleContinueToTemplates = () => {
    setCurrentStep('templates');
  };

  const handleBack = () => {
    if (currentStep === 'templates') {
      setCurrentStep('campaign');
    } else if (currentStep === 'campaign') {
      setCurrentStep('platform');
      setSelectedPlatform(null);
      setSelectedCampaign(null);
      setCampaignSearchQuery('');
      setSearchQuery('');
      setCurrentPage(1);
    }
  };

  if (!expertProfile) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-subtext font-medium">Loading templates...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-xl font-black text-ink mb-1">Share Kit</h2>
          <p className="text-sm sm:text-sm text-subtext font-medium">
            {currentStep === 'platform' && 'Choose a platform to get started'}
            {currentStep === 'campaign' && 'Optional: Track with a campaign'}
            {currentStep === 'templates' && `${filteredTemplates.length} template${filteredTemplates.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        {currentStep !== 'platform' && (
          <button
            onClick={handleBack}
            className="text-sm sm:text-xs font-medium text-primary hover:text-indigo-700 flex items-center gap-1 active:scale-95"
            style={{ minHeight: '44px', padding: '8px 12px' }}
          >
            <svg className="w-4 h-4 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        )}
      </div>

      {/* Step Indicator */}
      <div className="bg-surface rounded-xl border border-gray-200 p-4 sm:p-3">
        <div className="flex items-center gap-2 sm:gap-1.5 text-sm sm:text-xs overflow-x-auto">
          <div className={`flex items-center gap-2 sm:gap-1.5 whitespace-nowrap ${currentStep === 'platform' ? 'text-primary' : 'text-success'}`}>
            <div className={`w-6 h-6 sm:w-5 sm:h-5 rounded-full flex items-center justify-center font-bold ${currentStep === 'platform' ? 'bg-primary text-white' : 'bg-success text-white'}`}>
              {currentStep === 'platform' ? '1' : '✓'}
            </div>
            <span className="font-medium">Platform</span>
          </div>
          
          <svg className="w-4 h-4 sm:w-3 sm:h-3 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
          
          <div className={`flex items-center gap-2 sm:gap-1.5 whitespace-nowrap ${currentStep === 'campaign' ? 'text-primary' : currentStep === 'templates' ? 'text-success' : 'text-subtext'}`}>
            <div className={`w-6 h-6 sm:w-5 sm:h-5 rounded-full flex items-center justify-center font-bold ${
              currentStep === 'campaign' ? 'bg-primary text-white' : 
              currentStep === 'templates' ? 'bg-success text-white' : 
              'bg-gray-200 text-gray-600'
            }`}>
              {currentStep === 'templates' ? '✓' : '2'}
            </div>
            <span className="font-medium">Campaign</span>
          </div>
          
          <svg className="w-4 h-4 sm:w-3 sm:h-3 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
          
          <div className={`flex items-center gap-2 sm:gap-1.5 whitespace-nowrap ${currentStep === 'templates' ? 'text-primary' : 'text-subtext'}`}>
            <div className={`w-6 h-6 sm:w-5 sm:h-5 rounded-full flex items-center justify-center font-bold ${currentStep === 'templates' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'}`}>
              3
            </div>
            <span className="font-medium">Template</span>
          </div>
        </div>
      </div>

      {/* Step 1: Platform Selection */}
      {currentStep === 'platform' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <button
            onClick={() => handlePlatformSelect('all')}
            className="p-4 bg-surface rounded-xl border-2 border-dashed border-gray-300 hover:border-primary hover:shadow-elev-2 transition-all duration-base text-left group active:scale-95"
            style={{ minHeight: '120px' }}
          >
            <div className="w-12 h-12 sm:w-10 sm:h-10 bg-gray-100 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-base">
              <svg className="w-6 h-6 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </div>
            <h3 className="font-bold text-base sm:text-sm text-ink mb-1">All Platforms</h3>
            <p className="text-sm sm:text-xs text-subtext">{SHARE_TEMPLATES.length} templates</p>
          </button>

          {platforms.map(({ id, info, count }) => (
            <button
              key={id}
              onClick={() => handlePlatformSelect(id)}
              className="p-4 bg-surface rounded-xl border border-gray-200 hover:border-primary hover:shadow-elev-2 transition-all duration-base text-left group active:scale-95"
              style={{ minHeight: '120px' }}
            >
              <div className={`w-12 h-12 sm:w-10 sm:h-10 ${info.bgColor} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-base`}>
                <div className={info.iconColor}>
                  {id === 'twitter' && (
                    <svg className="w-6 h-6 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  )}
                  {id === 'linkedin' && (
                    <svg className="w-6 h-6 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  )}
                  {id === 'email' && (
                    <svg className="w-6 h-6 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  )}
                  {id === 'instagram' && (
                    <svg className="w-6 h-6 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/>
                    </svg>
                  )}
                </div>
              </div>
              <h3 className="font-bold text-base sm:text-sm text-ink mb-1">{info.name}</h3>
              <p className="text-sm sm:text-xs text-subtext">{count} template{count !== 1 ? 's' : ''}</p>
            </button>
          ))}
        </div>
      )}

      {/* Step 2: Campaign Selection */}
      {currentStep === 'campaign' && (
        <div className="space-y-4">
          <div className="bg-surface rounded-xl border border-gray-200 p-4 sm:p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg sm:text-base font-bold text-ink mb-1">
                  Track with Campaign (Optional)
                </h3>
                <p className="text-sm text-subtext">
                  Link templates to a campaign for analytics tracking
                </p>
              </div>
              <button
                onClick={handleContinueToTemplates}
                className="px-4 py-2 text-sm font-medium text-primary hover:text-indigo-700 flex items-center gap-1 whitespace-nowrap active:scale-95"
                style={{ minHeight: '44px' }}
              >
                Skip
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <div className="relative">
              <div className="relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-subtext pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={selectedCampaign ? selectedCampaign.name : campaignSearchQuery}
                  onChange={(e) => {
                    setCampaignSearchQuery(e.target.value);
                    setShowCampaignDropdown(true);
                    if (selectedCampaign) setSelectedCampaign(null);
                  }}
                  onFocus={() => setShowCampaignDropdown(true)}
                  placeholder="Search campaigns..."
                  className="w-full pl-12 pr-12 py-3 sm:py-3 text-base sm:text-sm border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-ink font-medium"
                  style={{ minHeight: '48px' }}
                />
                {selectedCampaign && (
                  <button
                    onClick={() => {
                      setSelectedCampaign(null);
                      setCampaignSearchQuery('');
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-lg active:scale-95"
                    style={{ minWidth: '44px', minHeight: '44px' }}
                  >
                    <svg className="w-5 h-5 sm:w-4 sm:h-4 text-subtext" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {showCampaignDropdown && !selectedCampaign && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-surface rounded-xl border-2 border-gray-200 shadow-elev-4 max-h-96 overflow-y-auto z-10">
                  <button
                    onClick={() => {
                      setSelectedCampaign(null);
                      setShowCampaignDropdown(false);
                      setCampaignSearchQuery('');
                      handleContinueToTemplates();
                    }}
                    className="w-full text-left px-4 py-3 text-base sm:text-sm hover:bg-gray-50 transition-colors border-b border-gray-200 active:bg-gray-100"
                    style={{ minHeight: '56px' }}
                  >
                    <div className="font-medium text-ink">No campaign (direct link)</div>
                    <div className="text-sm sm:text-xs text-subtext mt-0.5">Use your profile URL without tracking</div>
                  </button>

                  {!campaignSearchQuery && recentCampaigns.length > 0 && (
                    <div className="border-b border-gray-200">
                      <div className="px-4 py-2 bg-gray-50">
                        <span className="text-xs font-bold text-subtext uppercase tracking-wide">Recent</span>
                      </div>
                      {recentCampaigns.map(campaign => (
                        <button
                          key={campaign.id}
                          onClick={() => handleCampaignSelect(campaign)}
                          className="w-full text-left px-4 py-3 text-base sm:text-sm hover:bg-indigo-50 transition-colors group active:bg-indigo-100"
                          style={{ minHeight: '56px' }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-ink group-hover:text-primary truncate">{campaign.name}</div>
                              <div className="text-sm sm:text-xs text-subtext mt-0.5 capitalize">
                                {campaign.utm_source} • {campaign.total_visits} visits
                              </div>
                            </div>
                            <div className="text-sm sm:text-xs font-bold text-success ml-3">
                              {campaign.conversion_rate}%
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {campaignSearchQuery && filteredCampaigns.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-subtext">
                      No campaigns found
                    </div>
                  ) : (
                    <>
                      {Object.entries(groupedCampaigns).map(([source, sourceCampaigns]) => (
                        <div key={source}>
                          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                            <span className="text-xs font-bold text-subtext uppercase tracking-wide capitalize">
                              {source} ({sourceCampaigns.length})
                            </span>
                          </div>
                          {sourceCampaigns.map(campaign => (
                            <button
                              key={campaign.id}
                              onClick={() => handleCampaignSelect(campaign)}
                              className="w-full text-left px-4 py-3 text-base sm:text-sm hover:bg-indigo-50 transition-colors group border-b border-gray-100 active:bg-indigo-100"
                              style={{ minHeight: '56px' }}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-ink group-hover:text-primary truncate">{campaign.name}</div>
                                  <div className="text-sm sm:text-xs text-subtext mt-0.5">
                                    {campaign.total_visits} visits • {campaign.total_questions} questions
                                  </div>
                                </div>
                                <div className="text-sm sm:text-xs font-bold text-success ml-3">
                                  {campaign.conversion_rate}%
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>

            {selectedCampaign && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-bold text-green-900">Campaign Selected</span>
                    </div>
                    <p className="text-sm text-green-800 font-medium">{selectedCampaign.name}</p>
                    <p className="text-xs text-green-700 mt-1 capitalize">
                      {selectedCampaign.utm_source} • Links will include tracking
                    </p>
                  </div>
                  <button
                    onClick={handleContinueToTemplates}
                    className="ml-4 px-4 py-2 bg-success text-white text-sm font-bold rounded-xl hover:bg-green-700 transition-colors whitespace-nowrap active:scale-95"
                    style={{ minHeight: '44px' }}
                  >
                    Continue →
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="text-center">
            <span className="text-xs text-subtext">or</span>
          </div>

          <button
            onClick={handleContinueToTemplates}
            className="w-full p-4 bg-canvas hover:bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl text-sm font-medium text-subtext hover:text-ink hover:border-gray-400 transition-all active:scale-98"
            style={{ minHeight: '64px' }}
          >
            Continue without campaign tracking
          </button>
        </div>
      )}

      {/* Step 3: Templates */}
      {currentStep === 'templates' && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 sm:w-4 sm:h-4 text-subtext" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates..."
                className="w-full pl-10 pr-3 py-3 sm:py-2 text-base sm:text-sm border border-gray-300 rounded-xl sm:rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                style={{ minHeight: '48px' }}
              />
            </div>
          </div>

          {filteredTemplates.length === 0 ? (
            <div className="text-center py-8 bg-canvas rounded-xl border border-gray-200">
              <p className="text-subtext text-sm">No templates found</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                {paginatedTemplates.map(template => {
                  const processedText = processTemplate(template.template, templateData);
                  
                  return (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      processedText={processedText}
                      onEdit={() => handleEdit(template)}
                    />
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm sm:text-xs font-medium text-ink hover:bg-canvas rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors active:scale-95"
                    style={{ minHeight: '44px' }}
                  >
                    Previous
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 sm:w-8 sm:h-8 text-sm sm:text-xs font-bold rounded-xl transition-colors active:scale-95 ${
                          currentPage === page
                            ? 'bg-primary text-white'
                            : 'text-ink hover:bg-canvas'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 text-sm sm:text-xs font-medium text-ink hover:bg-canvas rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors active:scale-95"
                    style={{ minHeight: '44px' }}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {editingTemplate && (
        <TemplateEditorModal
          isOpen={!!editingTemplate}
          onClose={() => setEditingTemplate(null)}
          template={editingTemplate.template}
          initialText={editingTemplate.processedText}
        />
      )}

      {showCampaignDropdown && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowCampaignDropdown(false)}
        />
      )}
    </div>
  );
}