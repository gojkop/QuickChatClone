/**
 * Profile Strength Calculation Utility
 *
 * Calculates expert profile completeness score based on filled fields.
 * Uses "endowed progress" principle - starts at 20% to create momentum.
 */

/**
 * Calculate profile strength score (0-95%)
 * Never reaches 100% to encourage continuous improvement
 */
export const calculateProfileStrength = (expertProfile) => {
  if (!expertProfile) return 20;

  let score = 20; // Start at 20% (endowed progress principle)

  // Essential setup (auto-completed during onboarding)
  if (expertProfile.tier1_price_cents) score += 10; // ✅ Auto
  if (expertProfile.tier1_sla_hours) score += 10;   // ✅ Auto

  // Quick wins (checklist items)
  if (expertProfile.avatar_url) score += 20; // Profile photo
  if (expertProfile.bio && expertProfile.bio.length >= 50) score += 20; // Bio (minimum 50 chars)
  if (expertProfile.socials?.linkedin) score += 15; // LinkedIn connection

  // Stand out (progressive disclosure)
  if (expertProfile.professional_title) score += 10; // Professional title
  if (expertProfile.expertise && expertProfile.expertise.length > 0) score += 10; // Specialty tags

  return Math.min(score, 95); // Never 100% (always room to improve)
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

  // Quick wins
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
      timeEstimate: '1 min'
    });
  }

  if (!expertProfile.bio || expertProfile.bio.length < 50) {
    items.push({
      id: 'bio',
      label: 'Write your bio',
      description: 'Describe your expertise in 2-3 sentences',
      completed: false,
      impact: '+60% profile views',
      action: 'Write Bio',
      route: '/dashboard/profile',
      category: 'quick-win',
      timeEstimate: '3 min'
    });
  }

  if (!expertProfile.socials?.linkedin) {
    items.push({
      id: 'linkedin',
      label: 'Connect LinkedIn',
      description: 'Add your LinkedIn profile URL',
      completed: false,
      impact: '+30% trust',
      action: 'Connect',
      route: '/dashboard/profile',
      category: 'quick-win',
      timeEstimate: '1 min'
    });
  }

  // Share link (always show until profile is strong)
  const profileStrength = calculateProfileStrength(expertProfile);
  if (profileStrength < 80) {
    items.push({
      id: 'share',
      label: 'Share your link',
      description: 'Copy your profile link and share it',
      completed: false,
      impact: 'Get questions',
      action: 'Copy Link',
      route: null, // Custom handler
      category: 'quick-win',
      timeEstimate: '30 sec'
    });
  }

  // Progressive disclosure - show after quick wins are complete
  const quickWinsComplete = items.filter(i => i.category === 'quick-win').length === 0;

  if (quickWinsComplete) {
    if (!expertProfile.professional_title) {
      items.push({
        id: 'title',
        label: 'Add professional title',
        description: 'e.g., "Senior Product Manager at Google"',
        completed: false,
        impact: '+20% credibility',
        action: 'Add Title',
        route: '/dashboard/profile',
        category: 'stand-out',
        timeEstimate: '1 min'
      });
    }

    if (!expertProfile.expertise || expertProfile.expertise.length === 0) {
      items.push({
        id: 'tags',
        label: 'Add specialty tags',
        description: 'Help people discover your expertise',
        completed: false,
        impact: 'Better discovery',
        action: 'Add Tags',
        route: '/dashboard/profile',
        category: 'stand-out',
        timeEstimate: '2 min'
      });
    }
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
