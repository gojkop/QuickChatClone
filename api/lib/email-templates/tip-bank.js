// api/lib/email-templates/tip-bank.js
// Complete tip bank with random selection for all email templates

// ============================================================================
// WELCOME TIPS - For New Experts (Sign-in Email)
// Purpose: Help new experts get started and set up their profile
// ============================================================================

export const WELCOME_TIPS = [
  "Complete profiles receive 3x more questions. Take 5 minutes to add your bio, expertise, and set your rate.",
  "Your first impression matters—upload a professional photo and write a compelling bio that shows your unique expertise.",
  "Set a competitive rate based on your experience level. Most experts start at $25-75 per question.",
  "Choose a response time (SLA) you can consistently meet. Reliability builds your reputation faster than speed.",
  "Enable email notifications so you never miss a paid question from someone who needs your help.",
  "Your handle creates your unique mindPick URL—choose something professional and memorable.",
  "Add specific expertise tags so askers can find you when they need exactly what you know.",
  "Consider donating a percentage to charity—87% of users say it makes them more likely to ask you.",
  "The experts who succeed answer their first question within 24 hours of profile completion.",
  "Start with a lower rate to get your first 5-10 questions, then gradually increase as you build reviews.",
  "Video answers typically earn 40% more than audio-only. Consider enabling video if you're comfortable.",
  "Your profile is your storefront—think about what would make you trust an expert enough to pay them.",
  "Most successful experts on mindPick respond to questions within their SLA 95%+ of the time.",
  "Share your mindPick profile on LinkedIn and Twitter—many experts get their first questions from their network.",
  "Be authentic in your answers. People pay for genuine expertise and honest perspectives, not generic advice."
];

// ============================================================================
// PRO TIPS - For Askers (Answer Received Email)
// Purpose: Help users get maximum value from their answer
// ============================================================================

export const PRO_TIPS = {
  
  career_transition: [
    "Video answers capture tone and body language that reveal important context text can't convey.",
    "Take notes while watching—most users reference their answers multiple times over the following weeks.",
    "Pay attention to how the expert frames trade-offs, not just the final recommendation.",
    "The most valuable insights often come in the first and last 30 seconds of video answers.",
    "Consider asking a follow-up to dive deeper into any specific advice that resonates.",
    "Experts who've made similar transitions often share candid 'what I wish I knew' moments.",
    "Rewatch the answer after a week—you'll catch nuances you missed the first time.",
    "The way an expert describes risks is often as valuable as their recommendations.",
    "Look for patterns if you're asking multiple experts—consensus reveals proven paths.",
    "Taking action on even one piece of advice makes the entire exchange worthwhile.",
    "Video answers let you gauge confidence levels through tone and delivery style.",
    "Many experts share personal stories that provide context beyond the direct answer.",
    "The pauses and hesitations in video answers often signal important considerations.",
    "Following the expert's suggested next steps typically accelerates progress by weeks.",
    "Experts often mention resources or connections in passing—write those down immediately."
  ],
  
  technical_strategy: [
    "Watch for how experts break down complex decisions into manageable components.",
    "Code examples and architecture diagrams in answers are worth pausing to screenshot.",
    "Technical answers often reference official docs—bookmark those for deeper learning.",
    "The 'why' behind technical recommendations is usually more valuable than the 'what'.",
    "Pay attention when experts mention what they'd avoid—learning from mistakes saves months.",
    "Screen recordings let you see the expert's actual workflow and thought process.",
    "Experts often share gotchas and edge cases they've encountered in production.",
    "The tools and approaches experts use reveal their priorities around speed vs. quality.",
    "Rewatch technical answers with your code editor open to try approaches immediately.",
    "Many technical experts share their debugging process, which is often the real gold.",
    "Listen for when experts say 'it depends'—that's where the nuanced wisdom lives.",
    "Technical answers that acknowledge trade-offs help you make context-appropriate decisions.",
    "Experts often mention alternatives they considered—understanding why they didn't choose them matters.",
    "The way an expert structures their explanation reveals how they think about the problem.",
    "Following up with 'how would this scale?' often unlocks additional valuable insights."
  ],
  
  product_leadership: [
    "Product experts often share frameworks you can reuse across multiple decisions.",
    "Watch for how experts balance user needs, business goals, and technical constraints.",
    "The questions experts ask themselves are often more valuable than their answers.",
    "Product leaders typically share mental models that shaped their thinking over years.",
    "Pay attention to how experts prioritize—their criteria reveal deep product wisdom.",
    "Many product answers include real examples from products you use daily.",
    "Experts often describe their biggest product mistakes—those lessons compress years of learning.",
    "The way experts talk about users reveals their depth of empathy and research habits.",
    "Product strategies work best when adapted to your context, not copied directly.",
    "Listen for how experts validate assumptions before making big decisions.",
    "Product leaders often share unconventional approaches that challenged their teams.",
    "The metrics experts focus on reveal what they've learned actually matters.",
    "Many experts share how they'd approach the same problem differently today.",
    "Product answers often include subtle competitive insights worth noting.",
    "Following up with your specific constraints helps experts give more tailored advice."
  ],
  
  startup_advice: [
    "Startup founders often share the hard truths they wish someone had told them earlier.",
    "Pay attention to the order experts recommend doing things—sequencing matters enormously.",
    "Many founders share specific numbers and timelines from their own journey.",
    "The mistakes experts describe making are often more valuable than their successes.",
    "Startup advice is most useful when you understand the expert's context and constraints.",
    "Founders often share non-obvious resources and connections that accelerated their progress.",
    "Listen for when experts say 'I'd do this differently now'—that's compressed wisdom.",
    "Early-stage advice differs significantly from growth-stage—make sure the context matches.",
    "Many experts share decision frameworks that helped them navigate uncertainty.",
    "The questions experts ask help you think more clearly about your own situation.",
    "Startup founders often reveal the emotional and psychological challenges, not just tactics.",
    "Pay attention to what experts say NO to—constraint is often the key to focus.",
    "Many founders share their criteria for big decisions like fundraising or hiring.",
    "The way experts talk about timing often reveals hard-won pattern recognition.",
    "Following up with 'what would make you change this advice?' tests for robustness."
  ],
  
  design_critique: [
    "Design experts often reference visual principles that apply across many projects.",
    "Pay attention to the design patterns and components experts recommend—they're battle-tested.",
    "Many designers share their actual workflow and tool setup for efficient execution.",
    "The way experts critique reveals their priorities around usability, aesthetics, and feasibility.",
    "Design answers often include subtle accessibility considerations worth noting.",
    "Experts frequently reference real products as examples—study those for deeper learning.",
    "Listen for when designers discuss user psychology and behavior patterns.",
    "Many design experts share their approach to balancing creativity with user research.",
    "The alternatives experts considered reveal important trade-offs in design decisions.",
    "Design feedback is most valuable when experts explain their reasoning, not just suggestions.",
    "Pay attention to how experts structure information and visual hierarchy.",
    "Many designers share resources and tools that improved their craft significantly.",
    "Experts often mention common mistakes they see repeatedly—avoid those pitfalls.",
    "The way designers talk about iteration reveals their approach to refinement.",
    "Following up with 'why' questions often unlocks deeper design thinking."
  ],
  
  business_strategy: [
    "Business strategists often share frameworks you can apply to multiple situations.",
    "Pay attention to how experts analyze competitive landscapes and market dynamics.",
    "Many answers include real case studies that illustrate principles in action.",
    "The way experts structure their analysis reveals their strategic thinking process.",
    "Business experts often share contrarian insights that challenge conventional wisdom.",
    "Listen for when strategists discuss second-order effects and unintended consequences.",
    "Many experts share the questions they ask when evaluating new opportunities.",
    "Strategic advice is most useful when you understand the expert's assumptions.",
    "Pay attention to how experts balance short-term execution with long-term vision.",
    "Business leaders often share their criteria for making high-stakes decisions.",
    "The metrics and KPIs experts focus on reveal what actually drives business outcomes.",
    "Many strategists share their approach to testing assumptions before full commitment.",
    "Experts often describe the inflection points that changed their strategic direction.",
    "The way experts talk about risk shows how they think about uncertainty.",
    "Following up with your specific constraints helps refine generic advice to your context."
  ],
  
  default: [
    "Video answers capture nuances in tone and emphasis that text alone can't convey.",
    "Most experts share insights they've learned over years of direct experience.",
    "Take notes while watching—the most valuable points often aren't the obvious ones.",
    "Rewatching answers after a few days often reveals insights you missed initially.",
    "The way experts frame problems is often as valuable as their solutions.",
    "Many answers include unexpected resources, tools, or approaches worth exploring.",
    "Pay attention to the questions experts ask—they reveal expert thinking patterns.",
    "Following up with clarifications helps you get more tailored advice.",
    "Experts often share what they'd do differently with hindsight—that's compressed learning.",
    "The pauses and emphasis in video answers signal where experts see key points.",
    "Many experts reference real examples from their work—study those for deeper context.",
    "Taking action on even one insight makes the entire exchange valuable.",
    "Video format lets you gauge the expert's confidence level through delivery.",
    "Most experts enjoy follow-up questions that show you've engaged deeply with their answer.",
    "Sharing your answer with colleagues often sparks valuable discussions."
  ]
};

// ============================================================================
// EXPERT TIPS - For Experts (New Question Email)
// Purpose: Help experts deliver higher-quality, more impactful answers
// ============================================================================

export const EXPERT_TIPS = {
  
  career_transition: [
    "Career advice resonates most when you share your personal experience, not generic wisdom.",
    "Acknowledging the emotional challenges of transitions builds trust with askers.",
    "Sharing what you'd do differently today makes your advice more credible and relatable.",
    "Specific examples from your journey help askers see themselves in your story.",
    "Discussing the trade-offs you faced helps askers make context-appropriate decisions.",
    "Mentioning the timeline of your transition sets realistic expectations.",
    "Sharing your biggest career mistake often provides the most valuable learning.",
    "Addressing both the tactical and emotional aspects makes advice more complete.",
    "Experts who mention uncertainties and risks get higher trust ratings.",
    "Including a concrete 'first step' makes your advice immediately actionable.",
    "Discussing salary, equity, or financial considerations adds practical value.",
    "Sharing who you talked to for advice creates a network effect for the asker.",
    "Mentioning what held you back initially helps askers overcome similar fears.",
    "Describing your decision criteria helps askers evaluate their own situation.",
    "Ending with 'here's how to know if you're ready' provides a valuable framework."
  ],
  
  technical_strategy: [
    "Walking through your actual decision process is more valuable than just the solution.",
    "Sharing code examples or architecture diagrams makes abstract advice concrete.",
    "Discussing what you'd avoid helps askers sidestep common pitfalls.",
    "Mentioning the constraints you worked within helps askers adapt your approach.",
    "Showing your debugging or problem-solving process teaches transferable skills.",
    "Linking to official docs or resources extends the value of your answer.",
    "Discussing performance, security, or scalability trade-offs shows depth of experience.",
    "Sharing your testing approach helps askers validate solutions properly.",
    "Mentioning alternative approaches you considered reveals the thinking behind your choice.",
    "Addressing edge cases you've encountered shows real-world experience.",
    "Explaining 'why' behind technical decisions is often more valuable than 'what'.",
    "Sharing your tooling setup helps askers improve their workflow.",
    "Discussing how your approach evolved over time shows growth and learning.",
    "Mentioning team collaboration aspects helps askers implement in real-world settings.",
    "Ending with 'here's how to get started' removes friction to action."
  ],
  
  product_leadership: [
    "Sharing your product frameworks helps askers make better decisions independently.",
    "Discussing how you balance competing priorities reveals product leadership wisdom.",
    "Including real examples from products you've shipped makes advice tangible.",
    "Sharing your biggest product mistake often provides the most valuable learning.",
    "Explaining your user research approach helps askers validate their own assumptions.",
    "Mentioning the metrics you track shows what actually matters in product work.",
    "Discussing how you got buy-in for decisions helps askers navigate organizations.",
    "Sharing unconventional approaches you've tried expands askers' thinking.",
    "Explaining your prioritization criteria helps askers make their own trade-offs.",
    "Discussing what you'd do differently today makes your advice more honest.",
    "Mentioning your team's collaboration process helps askers implement recommendations.",
    "Sharing competitive insights from your market creates additional value.",
    "Explaining your product vision development process is often highly valuable.",
    "Discussing how you validated product-market fit provides actionable guidance.",
    "Ending with a decision framework gives askers a reusable tool."
  ],
  
  startup_advice: [
    "Founder-to-founder honesty about challenges builds immediate credibility.",
    "Sharing specific numbers and timelines from your journey provides valuable benchmarks.",
    "Discussing what you'd do differently removes the survivorship bias from advice.",
    "Mentioning your constraints helps askers adapt advice to their situation.",
    "Sharing your biggest mistake often provides more value than success stories.",
    "Explaining your decision criteria for major choices provides reusable frameworks.",
    "Discussing the emotional rollercoaster prepares founders for the reality.",
    "Sharing your fundraising experience—including rejections—helps askers navigate it.",
    "Mentioning your burn rate and runway discussions provides practical financial guidance.",
    "Explaining how you validated assumptions before committing helps askers de-risk moves.",
    "Sharing the order you did things helps founders sequence their own actions.",
    "Discussing your hiring mistakes helps askers avoid common early-stage pitfalls.",
    "Mentioning your support system and advisors helps askers build their own.",
    "Explaining how you maintained focus despite distractions is invaluable advice.",
    "Ending with 'here's what I'd do in your shoes' personalizes the guidance."
  ],
  
  design_critique: [
    "Walking through your design thinking process is more valuable than just the final critique.",
    "Sharing visual examples from real products helps askers see principles in action.",
    "Discussing accessibility considerations shows depth and builds trust.",
    "Explaining your approach to user research helps askers validate their designs.",
    "Mentioning specific design patterns or components saves askers research time.",
    "Sharing your design tools and workflow helps askers improve efficiency.",
    "Discussing how you balance aesthetics with usability reveals your priorities.",
    "Explaining the psychology behind design decisions adds educational value.",
    "Mentioning common mistakes you see helps askers avoid them proactively.",
    "Sharing how you collaborate with developers improves implementation quality.",
    "Discussing your iteration process shows how good design emerges.",
    "Explaining your approach to mobile-first or responsive design is increasingly valuable.",
    "Sharing resources that improved your craft helps askers continue learning.",
    "Mentioning brand consistency principles helps askers maintain quality at scale.",
    "Ending with concrete next steps makes your feedback immediately actionable."
  ],
  
  business_strategy: [
    "Sharing your strategic frameworks helps others develop their own thinking.",
    "Discussing real case studies from your experience makes abstract advice concrete.",
    "Explaining how you analyze competitive dynamics reveals strategic thinking.",
    "Mentioning contrarian insights you've developed challenges conventional wisdom valuably.",
    "Sharing the questions you ask when evaluating opportunities provides reusable tools.",
    "Discussing second-order effects shows depth of strategic experience.",
    "Explaining your approach to testing assumptions before commitment reduces risk.",
    "Mentioning specific metrics you track shows what actually drives outcomes.",
    "Sharing how you balance short-term and long-term is eternally valuable.",
    "Discussing your decision criteria for high-stakes choices provides frameworks.",
    "Explaining inflection points in your strategy helps others recognize their own.",
    "Mentioning your risk assessment process helps others think about uncertainty.",
    "Sharing how you got organizational buy-in helps others implement strategy.",
    "Discussing what changed your mind shows intellectual honesty and growth.",
    "Ending with a strategic framework gives askers a reusable decision tool."
  ],
  
  default: [
    "Sharing specific examples from your experience makes advice more credible and actionable.",
    "Discussing what you'd do differently today removes survivorship bias from advice.",
    "Acknowledging uncertainties and trade-offs builds trust with askers.",
    "Walking through your thought process is often more valuable than just the conclusion.",
    "Mentioning alternatives you considered helps askers make informed decisions.",
    "Sharing your biggest mistakes provides compressed learning from experience.",
    "Explaining the 'why' behind recommendations helps askers adapt advice to their context.",
    "Including concrete next steps makes your answer immediately actionable.",
    "Discussing constraints you worked within helps askers adapt your approach.",
    "Sharing resources, tools, or connections extends the value beyond just advice.",
    "Explaining how your thinking evolved shows growth and builds credibility.",
    "Mentioning the timeline or sequence of actions helps askers plan effectively.",
    "Discussing both successes and failures provides a balanced perspective.",
    "Ending with criteria for evaluating their situation empowers independent decision-making.",
    "Personal vulnerability in answers creates stronger connections with askers."
  ]
};

// ============================================================================
// WHILE YOU WAIT - For Askers (Question Confirmation Email)
// Purpose: Keep askers engaged and reduce anxiety during wait time
// ============================================================================

export const WHILE_YOU_WAIT = {
  
  career_transition: [
    "Browse career transition stories from other professionals in our Knowledge Library.",
    "Many users find related career advice while waiting adds valuable context.",
    "Explore how others navigated similar transitions in our insights section.",
    "Reading related answers helps you formulate better follow-up questions.",
    "Our career resources library has guides on resume updates and interview prep.",
    "Other professionals who made similar transitions share lessons in our community.",
    "Checking related advice often surfaces considerations you hadn't thought of.",
    "Many users discover valuable perspectives by exploring adjacent topics.",
    "Our career hub has tactical guides on networking and personal branding.",
    "Reading multiple perspectives on career transitions helps clarify your thinking.",
    "Exploring salary data and market insights can inform your transition planning.",
    "Many users find inspiration in unexpected places in our content library.",
    "Our guides on negotiation and job search strategy complement expert advice.",
    "Reading about others' transition challenges helps normalize your own experience.",
    "Exploring our career resources often uncovers valuable tools and frameworks."
  ],
  
  technical_strategy: [
    "Explore our technical architecture guides and code examples while you wait.",
    "Many developers find related technical discussions spark new ideas.",
    "Our engineering blog has deep dives on common architectural decisions.",
    "Reading related technical answers often surfaces alternatives worth considering.",
    "Explore our code pattern library for reusable solutions to common problems.",
    "Many users discover useful tools and frameworks in our technical resources.",
    "Our technical guides cover testing, deployment, and scalability topics.",
    "Reading multiple expert perspectives helps you evaluate trade-offs better.",
    "Exploring our technical documentation often uncovers valuable best practices.",
    "Many developers find inspiration by browsing adjacent technical topics.",
    "Our resource library includes performance optimization and security guides.",
    "Reading related discussions helps you formulate more specific follow-ups.",
    "Exploring our technical interviews with senior engineers adds context.",
    "Many users find unexpected solutions by exploring related problem domains.",
    "Our technical glossary and reference guides complement expert advice."
  ],
  
  product_leadership: [
    "Browse product strategy frameworks and case studies in our library.",
    "Many product leaders find related discussions help clarify their thinking.",
    "Our product guides cover prioritization, roadmapping, and user research.",
    "Reading how others approached similar challenges adds valuable perspective.",
    "Explore our product metrics guides and analytics frameworks.",
    "Many users discover useful tools and templates in our resources.",
    "Our product blog features interviews with seasoned product leaders.",
    "Reading multiple perspectives on product decisions improves judgment.",
    "Exploring our case studies often reveals patterns worth emulating.",
    "Many product managers find inspiration in adjacent problem domains.",
    "Our resource library includes guides on stakeholder management and communication.",
    "Reading related discussions helps you develop better product intuition.",
    "Exploring our competitive analysis frameworks adds strategic context.",
    "Many users find unexpected insights by browsing related topics.",
    "Our product templates and checklists complement expert advice."
  ],
  
  startup_advice: [
    "Browse founder stories and startup case studies in our library.",
    "Many founders find related advice helps them avoid common pitfalls.",
    "Our startup guides cover fundraising, hiring, and early growth.",
    "Reading how other founders navigated challenges provides valuable context.",
    "Explore our startup resources on legal, financial, and operational topics.",
    "Many users discover useful tools and templates for early-stage companies.",
    "Our founder interviews reveal honest perspectives on startup challenges.",
    "Reading multiple viewpoints on startup decisions reduces blind spots.",
    "Exploring our fundraising guides helps prepare for investor conversations.",
    "Many founders find inspiration in unexpected startup stories.",
    "Our resource library includes templates for pitch decks and financial models.",
    "Reading related discussions helps you anticipate future challenges.",
    "Exploring our growth playbooks adds tactical execution ideas.",
    "Many users find validation by reading about similar founder experiences.",
    "Our startup toolkit complements personalized expert advice."
  ],
  
  design_critique: [
    "Explore design patterns and UI component libraries while you wait.",
    "Many designers find related critiques spark new creative directions.",
    "Our design resources include accessibility and usability guidelines.",
    "Reading how experts approach similar design challenges adds perspective.",
    "Browse our design inspiration gallery for related visual solutions.",
    "Many users discover useful design tools and resources in our library.",
    "Our design blog features interviews with experienced product designers.",
    "Reading multiple design perspectives helps develop stronger intuition.",
    "Exploring our design systems documentation reveals best practices.",
    "Many designers find inspiration in adjacent design domains.",
    "Our resource library includes guides on design research and testing.",
    "Reading related critiques helps you develop a more critical eye.",
    "Exploring our typography and color theory guides adds depth to your work.",
    "Many users find unexpected solutions by browsing related design topics.",
    "Our design templates and toolkits complement expert feedback."
  ],
  
  business_strategy: [
    "Browse strategic frameworks and business case studies in our library.",
    "Many leaders find related strategy discussions clarify their thinking.",
    "Our business guides cover competitive analysis and market research.",
    "Reading how others approached similar challenges provides valuable context.",
    "Explore our strategy resources on business models and value propositions.",
    "Many users discover useful frameworks and templates in our library.",
    "Our strategy blog features insights from experienced business leaders.",
    "Reading multiple strategic perspectives improves decision quality.",
    "Exploring our competitive intelligence guides adds market context.",
    "Many strategists find inspiration in adjacent industries and markets.",
    "Our resource library includes templates for strategy planning and execution.",
    "Reading related discussions helps you identify blind spots in your thinking.",
    "Exploring our growth strategy playbooks adds tactical ideas.",
    "Many users find validation by comparing approaches with successful companies.",
    "Our strategy toolkit complements personalized expert advice."
  ],
  
  default: [
    "Browse related insights and expert answers in our Knowledge Library.",
    "Many users find exploring related topics adds valuable context.",
    "Our resource library covers a wide range of professional topics.",
    "Reading what others learned helps you formulate better follow-up questions.",
    "Explore guides and frameworks that complement expert advice.",
    "Many users discover unexpected insights while browsing.",
    "Our content library features interviews and case studies from experts.",
    "Reading multiple perspectives helps you develop more nuanced thinking.",
    "Exploring related topics often surfaces considerations you hadn't thought of.",
    "Many users find inspiration in adjacent subject areas.",
    "Our resource collection includes templates, guides, and tools.",
    "Reading related discussions helps you anticipate what to ask next.",
    "Exploring our expert community adds additional perspectives.",
    "Many users find value in reading about similar challenges others faced.",
    "Our knowledge base complements personalized expert advice."
  ]
};

// ============================================================================
// SELECTION FUNCTIONS
// ============================================================================

/**
 * Get a random Pro Tip for askers
 * @param {string} category - Question category (e.g., 'career_transition')
 * @returns {string} - Random tip from that category
 */
export function getProTip(category = 'default') {
  const tips = PRO_TIPS[category] || PRO_TIPS.default;
  return tips[Math.floor(Math.random() * tips.length)];
}

/**
 * Get a random Expert Tip for experts
 * @param {string} category - Question category
 * @returns {string} - Random tip from that category
 */
export function getExpertTip(category = 'default') {
  const tips = EXPERT_TIPS[category] || EXPERT_TIPS.default;
  return tips[Math.floor(Math.random() * tips.length)];
}

/**
 * Get a random While You Wait tip for askers
 * @param {string} category - Question category
 * @returns {string} - Random tip from that category
 */
export function getWhileYouWaitTip(category = 'default') {
  const tips = WHILE_YOU_WAIT[category] || WHILE_YOU_WAIT.default;
  return tips[Math.floor(Math.random() * tips.length)];
}

/**
 * Get a random Welcome tip for new experts
 * @returns {string} - Random welcome tip
 */
export function getWelcomeTip() {
  return WELCOME_TIPS[Math.floor(Math.random() * WELCOME_TIPS.length)];
}