import React, { useState, useMemo } from 'react';
import { SHARE_TEMPLATES, PLATFORM_INFO } from '@/constants/shareTemplates';
import { processTemplate, getTemplateData, buildCampaignUrl } from '@/utils/templateEngine';
import TemplateCard from './TemplateCard';
import TemplateEditorModal from './TemplateEditorModal';

const TEMPLATES_PER_PAGE = 6;

export default function ShareKitTemplates({ campaigns, expertProfile, user, stats }) {
  // Step 1: Platform
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  // Step 2: Campaign
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [campaignSearchQuery, setCampaignSearchQuery] = useState('');
  // Step 3: Template
  const [currentPage, setCurrentPage] = useState(1);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Build template data once
  const templateData = useMemo(() => {
    if (!expertProfile || !user) return {};
    
    const data = getTemplateData(expertProfile, user, stats);
    
    // Override with campaign URL if selected
    if (selectedCampaign) {
      data.profile_url = buildCampaignUrl(expertProfile, selectedCampaign);
    }
    
    return data;
  }, [expertProfile, user, stats, selectedCampaign]);

  // Get unique platforms
  const platforms = useMemo(() => {
    const uniquePlatforms = [...new Set(SHARE_TEMPLATES.map(t => t.platform))];
    return uniquePlatforms.map(platform => ({
      id: platform,
      info: PLATFORM_INFO[platform],
      count: SHARE_TEMPLATES.filter(t => t.platform === platform).length,
    }));
  }, []);

  // Filter campaigns by search
  const filteredCampaigns = useMemo(() => {
    if (!campaignSearchQuery) return campaigns;
    
    const query = campaignSearchQuery.toLowerCase();
    return campaigns.filter(c =>
      c.name.toLowerCase().includes(query) ||
      c.utm_source.toLowerCase().includes(query) ||
      c.utm_campaign.toLowerCase().includes(query)
    );
  }, [campaigns, campaignSearchQuery]);

  // Filter templates
  const filteredTemplates = useMemo(() => {
    let filtered = SHARE_TEMPLATES;

    // Step 1: Filter by platform
    if (selectedPlatform) {
      filtered = filtered.filter(t => t.platform === selectedPlatform);
    }

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [selectedPlatform, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredTemplates.length / TEMPLATES_PER_PAGE);
  const paginatedTemplates = filteredTemplates.slice(
    (currentPage - 1) * TEMPLATES_PER_PAGE,
    currentPage * TEMPLATES_PER_PAGE
  );

  // Reset pagination when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedPlatform, searchQuery]);

  const handleEdit = (template) => {
    const processedText = processTemplate(template.template, templateData);
    setEditingTemplate({ template, processedText });
  };

  const handlePlatformSelect = (platform) => {
    setSelectedPlatform(platform);
  };

  const handleBack = () => {
    if (selectedPlatform) {
      setSelectedPlatform(null);
      setSelectedCampaign(null); // Reset campaign selection
      setCampaignSearchQuery(''); // Reset campaign search
      setSearchQuery('');
      setCurrentPage(1); // Reset pagination
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
          <h2 className="text-xl font-black text-ink mb-1">Share Kit</h2>
          <p className="text-sm text-subtext font-medium">
            {!selectedPlatform 
              ? 'Choose a platform to get started'
              : `${filteredTemplates.length} template${filteredTemplates.length !== 1 ? 's' : ''} for ${PLATFORM_INFO[selectedPlatform]?.name}`
            }
          </p>
        </div>
        {selectedPlatform && (
          <button
            onClick={handleBack}
            className="text-xs font-medium text-primary hover:text-indigo-700 flex items-center gap-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        )}
      </div>

      {/* Step Indicator */}
      <div className="bg-surface rounded-lg border border-gray-200 p-3">
        <div className="flex items-center gap-2 text-xs">
          <div className={`flex items-center gap-1.5 ${selectedPlatform ? 'text-success' : 'text-primary'}`}>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold ${selectedPlatform ? 'bg-success text-white' : 'bg-primary text-white'}`}>
              {selectedPlatform ? '✓' : '1'}
            </div>
            <span className="font-medium">Platform</span>
          </div>
          <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
          <div className={`flex items-center gap-1.5 ${selectedCampaign ? 'text-success' : 'text-subtext'}`}>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold ${selectedCampaign ? 'bg-success text-white' : 'bg-gray-200 text-gray-600'}`}>
              {selectedCampaign ? '✓' : '2'}
            </div>
            <span className="font-medium">Campaign</span>
          </div>
          <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
          <div className={`flex items-center gap-1.5 ${selectedPlatform ? 'text-primary' : 'text-subtext'}`}>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold ${selectedPlatform ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'}`}>
              3
            </div>
            <span className="font-medium">Template</span>
          </div>
        </div>
      </div>

      {/* Step 1: Platform Selection */}
      {!selectedPlatform && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {platforms.map(({ id, info, count }) => (
            <button
              key={id}
              onClick={() => handlePlatformSelect(id)}
              className="p-4 bg-surface rounded-lg border border-gray-200 hover:border-primary hover:shadow-md transition-all duration-base text-left group"
            >
              <div className={`w-10 h-10 ${info.bgColor} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-base`}>
                <div className={info.iconColor}>
                  {id === 'twitter' && (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  )}
                  {id === 'linkedin' && (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  )}
                  {id === 'email' && (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  )}
                  {id === 'instagram' && (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  )}
                </div>
              </div>
              <h3 className="font-bold text-sm text-ink mb-0.5">{info.name}</h3>
              <p className="text-xs text-subtext">{count} template{count !== 1 ? 's' : ''}</p>
            </button>
          ))}
        </div>
      )}

      {/* Steps 2 & 3: Campaign + Templates */}
      {selectedPlatform && (
        <>
          {/* Step 2: Campaign Selector (Optional) - Improved for many campaigns */}
          <div className="bg-surface rounded-lg border border-gray-200 p-4">
            <label className="block text-xs font-bold text-ink mb-2 uppercase tracking-wide">
              Step 2: Track with Campaign (Optional)
            </label>
            
            {campaigns.length > 10 ? (
              // Searchable combobox for many campaigns
              <div className="space-y-2">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-subtext" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    value={campaignSearchQuery}
                    onChange={(e) => setCampaignSearchQuery(e.target.value)}
                    placeholder="Search campaigns..."
                    className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-ink font-medium"
                  />
                </div>
                
                {/* Campaign list */}
                <div className="max-h-48 overflow-y-auto space-y-1 border border-gray-200 rounded-lg p-2">
                  <button
                    onClick={() => {
                      setSelectedCampaign(null);
                      setCampaignSearchQuery('');
                    }}
                    className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                      !selectedCampaign
                        ? 'bg-indigo-50 text-primary font-bold'
                        : 'text-ink hover:bg-gray-50 font-medium'
                    }`}
                  >
                    Direct link (no tracking)
                  </button>
                  
                  {filteredCampaigns.map(campaign => (
                    <button
                      key={campaign.id}
                      onClick={() => {
                        setSelectedCampaign(campaign);
                        setCampaignSearchQuery('');
                      }}
                      className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                        selectedCampaign?.id === campaign.id
                          ? 'bg-indigo-50 text-primary font-bold'
                          : 'text-ink hover:bg-gray-50 font-medium'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate">{campaign.name}</span>
                        <span className="text-xs text-subtext capitalize ml-2">{campaign.utm_source}</span>
                      </div>
                    </button>
                  ))}
                  
                  {filteredCampaigns.length === 0 && (
                    <div className="text-center py-4 text-sm text-subtext">
                      No campaigns found
                    </div>
                  )}
                </div>
                
                {selectedCampaign && (
                  <div className="text-xs text-success font-medium">
                    ✓ Using: {selectedCampaign.name}
                  </div>
                )}
              </div>
            ) : (
              // Simple dropdown for few campaigns
              <select
                value={selectedCampaign?.id || ''}
                onChange={(e) => {
                  const campaign = campaigns.find(c => c.id === parseInt(e.target.value));
                  setSelectedCampaign(campaign || null);
                }}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-ink font-medium"
              >
                <option value="">Direct link (no tracking)</option>
                {campaigns.map(campaign => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaign.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Step 3: Search & Templates */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="relative flex-1">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-subtext" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search templates..."
                  className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            {filteredTemplates.length === 0 ? (
              <div className="text-center py-8 bg-canvas rounded-lg border border-gray-200">
                <p className="text-subtext text-sm">No templates found</p>
              </div>
            ) : (
              <>
                {/* Template Grid */}
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

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 text-xs font-medium text-ink hover:bg-canvas rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-8 h-8 text-xs font-bold rounded-lg transition-colors ${
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
                      className="px-3 py-1.5 text-xs font-medium text-ink hover:bg-canvas rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}

      {/* Editor Modal */}
      {editingTemplate && (
        <TemplateEditorModal
          isOpen={!!editingTemplate}
          onClose={() => setEditingTemplate(null)}
          template={editingTemplate.template}
          initialText={editingTemplate.processedText}
        />
      )}
    </div>
  );
}