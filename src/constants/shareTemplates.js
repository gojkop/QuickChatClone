// src/constants/shareTemplates.js
// Pre-defined share kit templates for different platforms

export const SHARE_TEMPLATES = [
  // EXISTING TEMPLATES
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

  // PRIORITY 1: Highest Impact Templates
  {
    id: 'email_brain_pick_response',
    title: '"Can I Pick Your Brain?" Response',
    platform: 'email',
    category: 'response',
    description: 'Polite boundary-setting response for consultation requests',
    template: `Thanks for reaching out! I'd love to help.

I've moved away from free exploratory calls and now use async video consultations instead. Here's why it works better:

✓ You get a personalized video answer you can rewatch
✓ I can give you my best thinking when I'm in flow state
✓ No scheduling back-and-forth
✓ {{sla_hours}} hour turnaround

You can submit your question here: {{profile_url}}

Looking forward to helping you with {{specialization}}!

Best,
{{expert_name}}`,
  },
  {
    id: 'email_newsletter_footer',
    title: 'Newsletter Footer',
    platform: 'email',
    category: 'newsletter',
    description: 'Add to your email newsletter for subscriber conversion',
    template: `P.S. Have a question about {{specialization}}? 

Instead of waiting for my next post, get a personalized video answer in {{sla_hours}} hours: {{profile_url}}

I've helped {{total_questions}} people solve specific challenges ({{avg_rating}}★ average rating).`,
  },
  {
    id: 'youtube_description',
    title: 'YouTube/Video Description',
    platform: 'youtube',
    category: 'content',
    description: 'Add to video descriptions to convert viewers',
    template: `📌 Questions about what I covered in this video?

Get a personalized answer from me via async video consultation:
→ Record your question
→ I respond with a custom video within {{sla_hours}}h
→ No scheduling needed

Ask here: {{profile_url}} (€{{price}} per question)`,
  },
  {
    id: 'twitter_problem_solution_thread',
    title: 'Twitter Thread - Problem/Solution',
    platform: 'twitter',
    category: 'social',
    description: 'High-engagement thread format showing your solution',
    template: `People keep asking "how do you avoid coffee chat fatigue?"

Here's what I did:

🚫 Stopped: 30min "pick your brain" calls
✅ Started: Async video consultations

How it works:
1. You record a question (takes 2 min)
2. I send a video answer within {{sla_hours}}h
3. You can rewatch it anytime

Both of us stay in flow state. No calendar Tetris.

I've done {{total_questions}} of these with {{avg_rating}}★ avg rating.

Try it: {{profile_url}}

Price: €{{price}}
Topics: {{specialization}}`,
  },
  {
    id: 'blog_post_cta',
    title: 'Blog Post CTA',
    platform: 'blog',
    category: 'content',
    description: 'Call-to-action for blog posts and articles',
    template: `👋 Still have questions after reading this?

I offer 1-on-1 async video consultations on {{specialization}}. You ask, I answer with a personalized video within {{sla_hours}} hours.

No calendar juggling. No Zoom fatigue. Just focused answers to your specific situation.

→ {{profile_url}}`,
  },

  // PRIORITY 2: Community Building Templates
  {
    id: 'reddit_forum_comment',
    title: 'Reddit/Forum Helpful Comment',
    platform: 'reddit',
    category: 'community',
    description: 'Add to helpful comments in forums and communities',
    template: `Hope this helps! If you need a more detailed answer specific to your situation, I do async video consultations where I can dive deeper into {{specialization}}.

You record a question → I send back a personalized video within {{sla_hours}}h. Much better than back-and-forth comments.

Link in my profile or here: {{profile_url}}`,
  },
  {
    id: 'facebook_group_post',
    title: 'Facebook Group Expert Post',
    platform: 'facebook',
    category: 'social',
    description: 'Announcement post for Facebook groups',
    template: `Hey everyone! 👋

I've been getting a lot of DMs asking about {{specialization}}. While I love helping, I can't keep up with free 1-on-1 calls anymore.

So I've switched to async video consultations:
• You record your specific question
• I respond with a personalized video within {{sla_hours}} hours
• You can re-watch it anytime
• Fair pricing: €{{price}}

It's been amazing - I've answered {{total_questions}} questions with a {{avg_rating}}/5 rating. 

If you're stuck on something specific: {{profile_url}}`,
  },
  {
    id: 'linkedin_case_study',
    title: 'LinkedIn Case Study Post',
    platform: 'linkedin',
    category: 'social',
    description: 'Social proof-based storytelling post',
    template: `"I got better advice in a 5-minute video than from 3 different consultants" - Recent client

This is why I switched to async video consultations.

Instead of generic advice in 30-min calls, I now:
→ Let you articulate your exact situation via video
→ Think deeply about your specific context
→ Respond with personalized guidance within {{sla_hours}}h

Result: {{total_questions}} questions answered, {{avg_rating}}/5.0 rating, zero meetings.

If you're facing challenges with {{specialization}}: {{profile_url}}`,
  },
  {
    id: 'slack_discord_bio',
    title: 'Slack/Discord Community Bio',
    platform: 'slack',
    category: 'community',
    description: 'Professional bio for community platforms',
    template: `{{professional_title}} | {{specialization}}

💬 Need 1-on-1 advice? I answer questions via personalized video ({{sla_hours}}h turnaround)
⭐ {{avg_rating}}/5.0 from {{total_questions}} consultations
🔗 {{profile_url}}`,
  },
  {
    id: 'twitter_social_proof',
    title: 'Twitter Social Proof',
    platform: 'twitter',
    category: 'social',
    description: 'Milestone celebration with social proof',
    template: `Just hit {{total_questions}} async video consultations! 🎉

{{avg_rating}}★ average rating
{{sla_hours}}h average response time
Zero meetings scheduled

If you're struggling with {{specialization}}, here's how it works:
{{profile_url}}

€{{price}} per question. No fluff, just personalized answers.`,
  },
  {
    id: 'linkedin_poll_context',
    title: 'LinkedIn Poll + Context',
    platform: 'linkedin',
    category: 'social',
    description: 'Engagement post with poll and context',
    template: `Quick poll: How do you prefer to get expert advice?

🔘 30-60 min video call
🔘 Async video Q&A (no scheduling)
🔘 Email back-and-forth
🔘 In-person meeting

I switched to async video consultations 6 months ago and it's been transformative:

→ {{total_questions}} questions answered
→ {{avg_rating}}/5.0 satisfaction rating
→ Zero calendar chaos
→ Askers get personalized videos they can rewatch

For {{specialization}} questions: {{profile_url}}`,
  },

  // PRIORITY 3: Automation & Scale Templates
  {
    id: 'email_out_of_office',
    title: 'Out of Office Auto-Reply',
    platform: 'email',
    category: 'response',
    description: 'Auto-reply that converts even when away',
    template: `Thanks for your email! I'm currently [away/at limited capacity].

🚀 Need quick help with {{specialization}}?
I offer async video consultations with {{sla_hours}}-hour turnaround (even when traveling!)

Submit your question: {{profile_url}}

I'll respond to general emails when I'm back on [date].

Best,
{{expert_name}}`,
  },
  {
    id: 'calendar_replacement',
    title: 'Calendly Replacement Message',
    platform: 'calendar',
    category: 'automation',
    description: 'Replace calendar booking pages with this message',
    template: `Thanks for wanting to connect!

Instead of scheduling a call, I now offer async video consultations. Here's why you might prefer it:

✅ No calendar coordination
✅ Get a personalized video answer within {{sla_hours}}h
✅ Rewatch my answer anytime
✅ I can think deeply about your specific situation

Submit your question: {{profile_url}}

(If you need a real-time call for a larger project, let's start async first - it's a better filter for both of us!)`,
  },
  {
    id: 'twitter_dm_auto_response',
    title: 'Twitter DM Auto-Response',
    platform: 'twitter',
    category: 'automation',
    description: 'Auto-reply for Twitter DMs',
    template: `Hey! Thanks for the DM 👋

I get a lot of questions, so I've switched to async video consultations to help more people:

• You: Record your question
• Me: Send personalized video answer in {{sla_hours}}h
• Both: Stay in flow, no scheduling

{{profile_url}}

€{{price}} per question | {{specialization}} | {{avg_rating}}★ rated

I'll still read this DM, but the link above is faster!`,
  },
  {
    id: 'website_chat_widget',
    title: 'Website Chat Widget Auto-Reply',
    platform: 'website',
    category: 'automation',
    description: 'Auto-response for website chat widgets',
    template: `👋 Thanks for reaching out!

💬 Have a specific question about {{specialization}}?
Get a personalized video answer from me within {{sla_hours}} hours: {{profile_url}}

€{{price}} per question | {{avg_rating}}★ rated by {{total_questions}} people

I'll also respond to this message shortly!`,
  },
  {
    id: 'instagram_story',
    title: 'Instagram Story Template',
    platform: 'instagram',
    category: 'story',
    description: 'Story text with swipe-up/link sticker',
    template: `Got questions about {{specialization}}? 🤔

Swipe up to ask me anything → I'll send you a personalized video answer within {{sla_hours}} hours

No scheduling, no meetings, just focused advice ⚡

[Add link sticker: {{profile_url}}]`,
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
  youtube: {
    name: 'YouTube',
    icon: 'youtube',
    color: 'red',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    iconColor: 'text-red-600',
    characterLimit: 5000, // description limit
  },
  blog: {
    name: 'Blog/Website',
    icon: 'globe',
    color: 'green',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    iconColor: 'text-green-600',
    characterLimit: null,
  },
  reddit: {
    name: 'Reddit',
    icon: 'reddit',
    color: 'orange',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700',
    iconColor: 'text-orange-600',
    characterLimit: 10000,
  },
  slack: {
    name: 'Slack/Discord',
    icon: 'slack',
    color: 'purple',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    iconColor: 'text-purple-600',
    characterLimit: 500,
  },
  facebook: {
    name: 'Facebook',
    icon: 'facebook',
    color: 'blue',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    iconColor: 'text-blue-600',
    characterLimit: 63206,
  },
  website: {
    name: 'Website/Chat',
    icon: 'globe',
    color: 'gray',
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-700',
    iconColor: 'text-gray-600',
    characterLimit: null,
  },
  calendar: {
    name: 'Calendar',
    icon: 'calendar',
    color: 'indigo',
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-700',
    iconColor: 'text-indigo-600',
    characterLimit: null,
  },
};