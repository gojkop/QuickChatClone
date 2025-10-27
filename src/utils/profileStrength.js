/**
 * Profile Strength Calculation Utility
 *
 * Calculates expert profile completeness score based on filled fields.
 * Uses "endowed progress" principle - starts at 20% to create momentum.
 */

/**
 * Calculate profile strength score (0-100%)
 * MATCHES the calculation in ProfileSettingsPage.jsx for consistency
 */
export const calculateProfileStrength = (expertProfile) => {
  if (!expertProfile) return 0;

  // Same fields as ProfileSettingsPage
  const fields = [
    expertProfile.handle,
    expertProfile.avatar_url,
    expertProfile.professional_title,
    expertProfile.tagline,
    expertProfile.bio,
    expertProfile.expertise && expertProfile.expertise.length > 0,
    (expertProfile.tier1_enabled !== false && expertProfile.tier1_price_cents) ||
      (expertProfile.tier2_enabled && expertProfile.tier2_min_price_cents),
    Object.values(expertProfile.socials || {}).some(v => v)
  ];

  const completed = fields.filter(Boolean).length;
  return Math.round((completed / fields.length) * 100);
};

/**
 * Get efficiency level based on profile strength score
 */
export const getEfficiencyLevel = (score) => {
  if (score < 40) {
    return {
      label: 'Getting Started',
      emoji: '🔴',
      color: 'red',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      borderColor: 'border-red-200'
    };
  }

  if (score < 70) {
    return {
      label: 'Intermediate',
      emoji: '🟡',
      color: 'orange',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
      borderColor: 'border-orange-200'
    };
  }

  if (score < 90) {
    return {
      label: 'All-Star',
      emoji: '🟢',
      color: 'green',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      borderColor: 'border-green-200'
    };
  }

  return {
    label: 'Expert',
    emoji: '🟣',
    color: 'purple',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200'
  };
};

/**
 * Get progress bar color based on score
 */
export const getProgressBarColor = (score) => {
  if (score < 40) return 'bg-red-500';
  if (score < 70) return 'bg-orange-500';
  if (score < 90) return 'bg-green-500';
  return 'bg-purple-500';
};

/**
 * Generate checklist items based on current profile state
 */
export const generateChecklist = (expertProfile) => {
  if (!expertProfile) return [];

  const items = [];

  // Essential items (always shown first if incomplete)
  if (!expertProfile.tier1_price_cents || !expertProfile.tier1_sla_hours) {
    items.push({
      id: 'setup',
      label: 'Complete essential setup',
      description: 'Set your handle, price, and response time',
      completed: false,
      impact: 'Required to go live',
      action: 'Complete Setup',
      route: null, // Triggers onboarding modal
      category: 'essential',
      timeEstimate: '2 min'
    });
  }

  // Quick wins - Match ProfileSettingsPage fields
  if (!expertProfile.avatar_url) {
    items.push({
      id: 'photo',
      label: 'Add profile photo',
      description: 'Upload a professional photo',
      completed: false,
      impact: '+40% conversion',
      action: 'Add Photo',
      route: '/dashboard/profile',
      category: 'quick-win',
      timeEstimate: 1 // minutes as number
    });
  }

  if (!expertProfile.professional_title) {
    items.push({
      id: 'title',
      label: 'Add professional title',
      description: 'e.g., "Senior Product Manager at Google"',
      completed: false,
      impact: '+20% credibility',
      action: 'Add Title',
      route: '/dashboard/profile',
      category: 'quick-win',
      timeEstimate: 1
    });
  }

  if (!expertProfile.tagline) {
    items.push({
      id: 'tagline',
      label: 'Write your tagline',
      description: 'One-line summary of what you do',
      completed: false,
      impact: '+30% engagement',
      action: 'Add Tagline',
      route: '/dashboard/profile',
      category: 'quick-win',
      timeEstimate: 2
    });
  }

  if (!expertProfile.bio) {
    items.push({
      id: 'bio',
      label: 'Write your bio',
      description: 'Describe your expertise in detail',
      completed: false,
      impact: '+60% profile views',
      action: 'Write Bio',
      route: '/dashboard/profile',
      category: 'quick-win',
      timeEstimate: 3
    });
  }

  if (!expertProfile.expertise || expertProfile.expertise.length === 0) {
    items.push({
      id: 'expertise',
      label: 'Add expertise tags',
      description: 'Help people discover your skills',
      completed: false,
      impact: 'Better discovery',
      action: 'Add Tags',
      route: '/dashboard/profile',
      category: 'quick-win',
      timeEstimate: 2
    });
  }

  // Socials (any social network)
  const hasSocials = Object.values(expertProfile.socials || {}).some(v => v);
  if (!hasSocials) {
    items.push({
      id: 'socials',
      label: 'Connect social profiles',
      description: 'LinkedIn, Twitter, or website',
      completed: false,
      impact: '+30% trust',
      action: 'Connect',
      route: '/dashboard/profile',
      category: 'quick-win',
      timeEstimate: 1
    });
  }

  return items;
};

/**
 * Get motivational message based on profile strength
 * Messages rotate to keep things fresh
 */
export const getMotivationalMessage = (score) => {
  const messages = {
    low: [
      "Experts with complete profiles get 3x more questions",
      "5 minutes of setup = weeks of paid questions",
      "Your expertise is valuable. Show it off! 🚀"
    ],
    medium: [
      "You're halfway there! Keep going ⭐",
      "People pay more for profiles they trust 💰",
      "Almost there! Finish strong 💪"
    ],
    high: [
      "Looking great! Just a few touches left ✨",
      "You're almost an all-star! 🌟",
      "Profile excellence incoming! 🎯"
    ]
  };

  const category = score < 40 ? 'low' : score < 70 ? 'medium' : 'high';
  const pool = messages[category];

  // Deterministic selection based on date (changes daily)
  const dayOfYear = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  const index = dayOfYear % pool.length;

  return pool[index];
};

/**
 * Check if onboarding card should be shown
 */
export const shouldShowOnboardingCard = (expertProfile) => {
  if (!expertProfile) return false;

  const score = calculateProfileStrength(expertProfile);

  // Show if profile strength < 80%
  if (score < 80) return true;

  // Check if user has permanently dismissed
  if (expertProfile.onboarding_dismissed_permanently) return false;

  // Check if dismissed recently (within 24 hours)
  if (expertProfile.onboarding_dismissed_at) {
    const dismissedAt = new Date(expertProfile.onboarding_dismissed_at);
    const hoursSinceDismiss = (Date.now() - dismissedAt.getTime()) / (1000 * 60 * 60);
    if (hoursSinceDismiss < 24) return false;
  }

  return false;
};
