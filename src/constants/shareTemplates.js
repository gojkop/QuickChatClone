// src/constants/shareTemplates.js
// Pre-defined share kit templates for different platforms

export const SHARE_TEMPLATES = [
  {
    id: 'twitter_thread',
    title: 'Twitter Thread Starter',
    platform: 'twitter',
    category: 'social',
    description: 'Casual thread explaining your async consultation model',
    template: `I've been overwhelmed by "can I pick your brain?" DMs.

Instead of saying no or scheduling calls, I'm using @mindPick:

• You record a quick question
• I answer on video within {{sla_hours}}h
• Both of us stay in flow
• Fair pricing: €{{price}}

My link: {{profile_url}}

(Answered {{total_questions}} questions, {{avg_rating}}★ avg)`,
  },
  {
    id: 'linkedin_professional',
    title: 'LinkedIn Professional Post',
    platform: 'linkedin',
    category: 'social',
    description: 'Professional storytelling format with results',
    template: `A few thoughts on monetizing expertise without burning out:

I used to do 30-60min "exploratory calls" for free. Exhausting.

Now I use async video consultations:
✅ Askers get personalized advice on their schedule
✅ I answer when I'm in flow state
✅ No calendar Tetris
✅ Fair compensation for my time

Result: {{total_questions}} questions answered, {{avg_rating}}/5.0 rating.

If you're facing challenges with {{specialization}}, here's how it works: {{profile_url}}`,
  },
  {
    id: 'linkedin_short',
    title: 'LinkedIn Quick Post',
    platform: 'linkedin',
    category: 'social',
    description: 'Short, punchy announcement',
    template: `💡 Got a quick question about {{specialization}}?

I answer video questions within {{sla_hours}} hours: {{profile_url}}

€{{price}} per question • {{avg_rating}}★ rating • No meetings required`,
  },
  {
    id: 'email_signature',
    title: 'Email Signature',
    platform: 'email',
    category: 'email',
    description: 'Professional signature for all your emails',
    template: `---
{{expert_name}}
{{professional_title}}

💬 Quick question? {{profile_url}}
📧 {{expert_email}}`,
  },
  {
    id: 'twitter_announcement',
    title: 'Twitter Launch',
    platform: 'twitter',
    category: 'social',
    description: 'Simple launch announcement',
    template: `🚀 New: I'm now taking async video questions!

Ask me anything about {{specialization}} → I'll send you a personalized video answer within {{sla_hours}}h

€{{price}} per question

{{profile_url}}`,
  },
  {
    id: 'instagram_bio',
    title: 'Instagram/Twitter Bio',
    platform: 'instagram',
    category: 'bio',
    description: 'Short bio text for social profiles',
    template: `{{professional_title}} | {{specialization}}
💬 Ask me anything: {{profile_url}}
⚡ {{sla_hours}}h response | {{avg_rating}}★ rated`,
  },
];

/**
 * Get templates by platform
 */
export function getTemplatesByPlatform(platform) {
  return SHARE_TEMPLATES.filter(t => t.platform === platform);
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category) {
  return SHARE_TEMPLATES.filter(t => t.category === category);
}

/**
 * Get template by ID
 */
export function getTemplateById(id) {
  return SHARE_TEMPLATES.find(t => t.id === id);
}

/**
 * Platform metadata
 */
export const PLATFORM_INFO = {
  twitter: {
    name: 'Twitter / X',
    icon: 'twitter',
    color: 'blue',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    iconColor: 'text-blue-600',
    characterLimit: 280,
  },
  linkedin: {
    name: 'LinkedIn',
    icon: 'linkedin',
    color: 'indigo',
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-700',
    iconColor: 'text-primary',
    characterLimit: 3000,
  },
  email: {
    name: 'Email',
    icon: 'email',
    color: 'gray',
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-700',
    iconColor: 'text-subtext',
    characterLimit: null,
  },
  instagram: {
    name: 'Instagram',
    icon: 'instagram',
    color: 'pink',
    bgColor: 'bg-pink-50',
    textColor: 'text-pink-700',
    iconColor: 'text-pink-600',
    characterLimit: 150, // bio limit
  },
};