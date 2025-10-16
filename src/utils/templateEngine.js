// src/utils/templateEngine.js
// Template engine for dynamic content generation

/**
 * Process template string by replacing variables with actual data
 * @param {string} template - Template string with {{variables}}
 * @param {object} data - Data object with values to substitute
 * @returns {string} - Processed template
 */
export function processTemplate(template, data) {
  if (!template || !data) return template;
  
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return data[key] !== undefined ? data[key] : match;
  });
}

/**
 * Build campaign URL with UTM parameters
 * @param {object} expert - Expert profile object
 * @param {object} campaign - Campaign object (optional)
 * @returns {string} - Full URL with UTM params
 */
export function buildCampaignUrl(expert, campaign = null) {
  const baseUrl = window.location.origin;
  const profilePath = `/u/${expert.handle}`;
  
  if (!campaign) {
    return `${baseUrl}${profilePath}`;
  }
  
  const params = new URLSearchParams({
    utm_source: campaign.utm_source,
    utm_campaign: campaign.utm_campaign,
  });
  
  if (campaign.utm_medium) params.append('utm_medium', campaign.utm_medium);
  if (campaign.utm_content) params.append('utm_content', campaign.utm_content);
  
  return `${baseUrl}${profilePath}?${params.toString()}`;
}

/**
 * Get expert data for templates
 * @param {object} expert - Expert profile
 * @param {object} user - User object
 * @param {object} stats - Expert statistics
 * @returns {object} - Template data
 */
export function getTemplateData(expert, user, stats = {}) {
  return {
    expert_name: user?.name || 'Expert',
    first_name: user?.name?.split(' ')[0] || 'Expert',
    expert_email: user?.email || '',
    professional_title: expert?.professional_title || 'Consultant',
    specialization: expert?.specialization || 'consulting',
    price: expert?.price_cents ? (expert.price_cents / 100).toFixed(0) : '100',
    sla_hours: expert?.sla_hours || '24',
    total_questions: stats?.total_questions || '0',
    avg_rating: stats?.avg_rating || '5.0',
    profile_url: buildCampaignUrl(expert),
  };
}

/**
 * Count characters for platform limits
 * @param {string} text - Text to count
 * @returns {object} - Character count and limit info
 */
export function getCharacterCount(text, platform = null) {
  const limits = {
    twitter: 280,
    linkedin: 3000,
    email: null, // no limit
  };
  
  const count = text.length;
  const limit = platform ? limits[platform] : null;
  
  return {
    count,
    limit,
    remaining: limit ? limit - count : null,
    isOverLimit: limit ? count > limit : false,
  };
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} - Success status
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
}