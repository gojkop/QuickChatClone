import React, { useState, useMemo } from 'react';
import { SHARE_TEMPLATES, PLATFORM_INFO } from '@/constants/shareTemplates';
import { processTemplate, getTemplateData, buildCampaignUrl } from '@/utils/templateEngine';
import TemplateCard from './TemplateCard';
import TemplateEditorModal from './TemplateEditorModal';

export default function ShareKitTemplates({ campaigns, expertProfile, user, stats }) {
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [editingTemplate, setEditingTemplate] = useState(null);

  // Build template data once
  const templateData = useMemo(() => {
    if (!expertProfile) return {};
    
    const data = getTemplateData(expertProfile, user, stats);
    
    // Add campaign URL if campaign selected
    if (selectedCampaign) {
      data.profile_url = buildCampaignUrl(expertProfile, selectedCampaign);
    }
    
    return data;
  }, [expertProfile, user, stats, selectedCampaign]);

  // Filter templates by platform
  const filteredTemplates = useMemo(() => {
    if (filterPlatform === 'all') return SHARE_TEMPLATES;
    return SHARE_TEMPLATES.filter(t => t.platform === filterPlatform);
  }, [filterPlatform]);

  // Get unique platforms for filter
  const platforms = useMemo(() => {
    const uniquePlatforms = [...new Set(SHARE_TEMPLATES.map(t => t.platform))];
    return uniquePlatforms;
  }, []);

  const handleEdit = (template) => {
    const processedText = processTemplate(template.template, templateData);
    setEditingTemplate({ template, processedText });
  };

  if (!expertProfile) {
    return (
      <div className="text-center py-12">
        <p className="text-subtext font-medium">Loading expert profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-200 rounded-xl p-6 shadow-elev-1">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center flex-shrink-0 shadow-elev-2">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-black text-indigo-900 mb-2 text-lg">Share Kit: Ready-to-Post Templates</h3>
            <p className="text-sm text-indigo-800 font-medium mb-4">
              Pre-written posts with your real stats automatically filled in. One click to copy, customize if you want, then paste anywhere.
            </p>
            
            {/* Quick Stats */}
            <div className="flex flex-wrap gap-3 text-xs">
              <div className="px-3 py-1.5 bg-white rounded-lg shadow-elev-1 border border-indigo-100">
                <span className="text-indigo-600 font-bold">Price: </span>
                <span className="text-indigo-900 font-black">€{templateData.price}</span>
              </div>
              <div className="px-3 py-1.5 bg-white rounded-lg shadow-elev-1 border border-indigo-100">
                <span className="text-indigo-600 font-bold">Questions: </span>
                <span className="text-indigo-900 font-black">{templateData.total_questions}</span>
              </div>
              <div className="px-3 py-1.5 bg-white rounded-lg shadow-elev-1 border border-indigo-100">
                <span className="text-indigo-600 font-bold">Rating: </span>
                <span className="text-indigo-900 font-black">{templateData.avg_rating}★</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Campaign Selector & Filters */}
      <div className="bg-surface rounded-xl shadow-elev-2 border border-gray-200 p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Campaign Selector */}
          <div>
            <label className="block text-sm font-bold text-ink mb-2">
              Track with Campaign (Optional)
            </label>
            <select
              value={selectedCampaign?.id || ''}
              onChange={(e) => {
                const campaign = campaigns.find(c => c.id === parseInt(e.target.value));
                setSelectedCampaign(campaign || null);
              }}
              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-ink font-medium transition-all duration-base"
            >
              <option value="">No tracking (direct link)</option>
              {campaigns.map(campaign => (
                <option key={campaign.id} value={campaign.id}>
                  {campaign.name} ({campaign.utm_source})
                </option>
              ))}
            </select>
            <p className="text-xs text-subtext mt-1 font-medium">
              {selectedCampaign ? 
                `URLs will include UTM tracking for "${selectedCampaign.name}"` : 
                'URLs will point to your profile without tracking'
              }
            </p>
          </div>

          {/* Platform Filter */}
          <div>
            <label className="block text-sm font-bold text-ink mb-2">
              Filter by Platform
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterPlatform('all')}
                className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all duration-base ${
                  filterPlatform === 'all'
                    ? 'bg-primary text-white shadow-elev-2'
                    : 'bg-canvas text-subtext hover:bg-gray-200'
                }`}
              >
                All
              </button>
              {platforms.map(platform => {
                const info = PLATFORM_INFO[platform];
                return (
                  <button
                    key={platform}
                    onClick={() => setFilterPlatform(platform)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all duration-base ${
                      filterPlatform === platform
                        ? `${info.bgColor} ${info.textColor} shadow-elev-2`
                        : 'bg-canvas text-subtext hover:bg-gray-200'
                    }`}
                  >
                    {info.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTemplates.map(template => {
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

      {/* Empty State */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <p className="text-subtext font-medium">No templates found for this platform.</p>
          <button
            onClick={() => setFilterPlatform('all')}
            className="mt-4 text-primary hover:text-indigo-700 font-bold text-sm"
          >
            Show all templates
          </button>
        </div>
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