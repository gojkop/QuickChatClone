# mindPick Marketing Module - Xano Implementation Guide

## 📋 Overview
This guide covers the complete database schema and API endpoints needed to implement the Marketing Module in Xano.

---

## 🗃️ STEP 1: Database Tables

### Table 1: `utm_campaigns`
**Purpose:** Track marketing campaigns with UTM parameters

```sql
CREATE TABLE utm_campaigns (
  id                  INTEGER PRIMARY KEY AUTO_INCREMENT,
  expert_profile_id   INTEGER NOT NULL,           -- FK to expert_profile
  name                VARCHAR(255) NOT NULL,       -- "LinkedIn Launch Post"
  url_slug            VARCHAR(100) UNIQUE,         -- Optional custom slug
  utm_source          VARCHAR(100),                -- "linkedin", "twitter", "email"
  utm_medium          VARCHAR(100),                -- "social", "email", "bio"
  utm_campaign        VARCHAR(100),                -- "q4_launch"
  utm_content         VARCHAR(255),                -- Optional: "post_image_1"
  utm_term            VARCHAR(255),                -- Optional for paid search
  status              ENUM('active', 'paused', 'archived') DEFAULT 'active',
  
  -- Auto-calculated metrics (updated via background functions)
  total_visits        INTEGER DEFAULT 0,
  total_questions     INTEGER DEFAULT 0,
  total_revenue_cents INTEGER DEFAULT 0,
  conversion_rate     DECIMAL(5,2) DEFAULT 0.00,   -- Percentage
  
  created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_visit_at       TIMESTAMP NULL,
  
  INDEX idx_expert (expert_profile_id),
  INDEX idx_status (status),
  INDEX idx_created (created_at DESC),
  FOREIGN KEY (expert_profile_id) REFERENCES expert_profile(id) ON DELETE CASCADE
);
```

**Xano Steps:**
1. Go to Database → Add Table → Name: `utm_campaigns`
2. Add each field with appropriate data type:
   - `expert_profile_id`: Integer, required
   - `name`: Text, required
   - `url_slug`: Text, unique
   - `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`: Text fields
   - `status`: Text with default "active"
   - `total_visits`, `total_questions`, `total_revenue_cents`: Integer with default 0
   - `conversion_rate`: Decimal (5,2) with default 0.00
   - `created_at`, `updated_at`, `last_visit_at`: Timestamp
3. Add relationship: `expert_profile_id` → `expert_profile.id`

---

### Table 2: `campaign_visits`
**Purpose:** Track individual visits from campaigns for detailed analytics

```sql
CREATE TABLE campaign_visits (
  id                      INTEGER PRIMARY KEY AUTO_INCREMENT,
  campaign_id             INTEGER NOT NULL,           -- FK to utm_campaigns
  expert_profile_id       INTEGER NOT NULL,           -- FK to expert_profile
  
  -- Visit details
  visitor_ip_hash         VARCHAR(64),                -- SHA-256 hashed IP for privacy
  referrer                TEXT,                       -- Full referrer URL
  user_agent              TEXT,                       -- Browser/device info
  country                 VARCHAR(2),                 -- ISO country code
  device_type             ENUM('desktop', 'mobile', 'tablet', 'unknown') DEFAULT 'unknown',
  
  -- Conversion tracking
  converted_to_question   BOOLEAN DEFAULT FALSE,
  question_id             INTEGER NULL,               -- FK to question (if converted)
  
  visited_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_campaign (campaign_id),
  INDEX idx_expert (expert_profile_id),
  INDEX idx_visited (visited_at DESC),
  INDEX idx_conversion (converted_to_question, visited_at),
  FOREIGN KEY (campaign_id) REFERENCES utm_campaigns(id) ON DELETE CASCADE,
  FOREIGN KEY (expert_profile_id) REFERENCES expert_profile(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES question(id) ON DELETE SET NULL
);
```

**Xano Steps:**
1. Add Table → Name: `campaign_visits`
2. Add fields matching the schema above
3. Add relationships:
   - `campaign_id` → `utm_campaigns.id`
   - `expert_profile_id` → `expert_profile.id`
   - `question_id` → `question.id` (nullable)

---

### Table 3: `traffic_sources` (Aggregated Stats)
**Purpose:** Pre-aggregated daily stats by source for fast dashboard loading

```sql
CREATE TABLE traffic_sources (
  id                  INTEGER PRIMARY KEY AUTO_INCREMENT,
  expert_profile_id   INTEGER NOT NULL,
  source_name         VARCHAR(100) NOT NULL,          -- "linkedin", "twitter", "direct", etc.
  date                DATE NOT NULL,                  -- Aggregation date
  
  total_visits        INTEGER DEFAULT 0,
  total_questions     INTEGER DEFAULT 0,
  total_revenue_cents INTEGER DEFAULT 0,
  conversion_rate     DECIMAL(5,2) DEFAULT 0.00,
  
  created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_expert_source_date (expert_profile_id, source_name, date),
  INDEX idx_expert_date (expert_profile_id, date DESC),
  FOREIGN KEY (expert_profile_id) REFERENCES expert_profile(id) ON DELETE CASCADE
);
```

---

## 🔧 STEP 2: Database Functions

### Function 1: `generate_campaign_url`
**Purpose:** Generate clean campaign URLs with UTM parameters

```javascript
// Xano Function Stack: generate_campaign_url
// Input: expert_profile_id (int), utm_source (text), utm_campaign (text)

function generateCampaignUrl(input) {
  const { expert_profile_id, utm_source, utm_campaign, utm_medium, utm_content } = input;
  
  // Get expert handle from expert_profile
  const expert = queryOne('expert_profile', { id: expert_profile_id }, { 
    fields: ['handle'] 
  });
  
  if (!expert || !expert.handle) {
    return { error: 'Expert not found' };
  }
  
  // Build UTM parameters
  const params = new URLSearchParams();
  params.append('utm_source', utm_source);
  params.append('utm_campaign', utm_campaign);
  if (utm_medium) params.append('utm_medium', utm_medium);
  if (utm_content) params.append('utm_content', utm_content);
  
  const baseUrl = `${env.APP_URL}/u/${expert.handle}`;
  const fullUrl = `${baseUrl}?${params.toString()}`;
  
  return {
    url: fullUrl,
    short_url: fullUrl.replace(env.APP_URL, 'mindpick.com')
  };
}
```

---

### Function 2: `track_campaign_visit`
**Purpose:** Log a visit when someone lands on an expert page with UTM parameters

```javascript
// Xano Function: track_campaign_visit
// Triggered on GET /expert/track-visit
// Input: expert_handle (text), utm_source, utm_campaign, utm_medium, utm_content

function trackCampaignVisit(request) {
  const { expert_handle, utm_source, utm_campaign, utm_medium, utm_content } = request.query;
  
  // 1. Get expert profile
  const expert = queryOne('expert_profile', { handle: expert_handle });
  if (!expert) {
    return { tracked: false, reason: 'Expert not found' };
  }
  
  // 2. Find or create campaign
  let campaign = queryOne('utm_campaigns', {
    expert_profile_id: expert.id,
    utm_source: utm_source,
    utm_campaign: utm_campaign
  });
  
  if (!campaign) {
    // Auto-create campaign on first visit
    campaign = insert('utm_campaigns', {
      expert_profile_id: expert.id,
      name: `${utm_source} - ${utm_campaign}`,
      utm_source: utm_source,
      utm_campaign: utm_campaign,
      utm_medium: utm_medium || null,
      utm_content: utm_content || null,
      status: 'active'
    });
  }
  
  // 3. Hash visitor IP for privacy
  const visitorIpHash = hashString(`${request.ip}_${request.user_agent}`, 'sha256');
  
  // 4. Detect device type from user agent
  const userAgent = request.headers['user-agent'] || '';
  let deviceType = 'unknown';
  if (/mobile/i.test(userAgent)) deviceType = 'mobile';
  else if (/tablet/i.test(userAgent)) deviceType = 'tablet';
  else if (/desktop|windows|mac/i.test(userAgent)) deviceType = 'desktop';
  
  // 5. Log the visit
  const visit = insert('campaign_visits', {
    campaign_id: campaign.id,
    expert_profile_id: expert.id,
    visitor_ip_hash: visitorIpHash,
    referrer: request.headers['referer'] || null,
    user_agent: userAgent,
    country: request.headers['cf-ipcountry'] || 'XX', // Cloudflare provides this
    device_type: deviceType,
    visited_at: now()
  });
  
  // 6. Update campaign metrics (async - don't block)
  runBackground('update_campaign_metrics', { campaign_id: campaign.id });
  
  return { tracked: true, campaign_id: campaign.id };
}
```

---

### Function 3: `update_campaign_metrics`
**Purpose:** Recalculate campaign statistics (runs async)

```javascript
// Xano Background Function: update_campaign_metrics
// Input: campaign_id (int)

function updateCampaignMetrics({ campaign_id }) {
  // 1. Count visits
  const totalVisits = query('campaign_visits', { 
    campaign_id: campaign_id 
  }).length;
  
  // 2. Count conversions and revenue
  const conversions = query('campaign_visits', {
    campaign_id: campaign_id,
    converted_to_question: true
  }, {
    joins: ['question']
  });
  
  const totalQuestions = conversions.length;
  const totalRevenue = conversions.reduce((sum, visit) => {
    return sum + (visit.question?.price_cents || 0);
  }, 0);
  
  // 3. Calculate conversion rate
  const conversionRate = totalVisits > 0 
    ? (totalQuestions / totalVisits) * 100 
    : 0;
  
  // 4. Update campaign
  update('utm_campaigns', campaign_id, {
    total_visits: totalVisits,
    total_questions: totalQuestions,
    total_revenue_cents: totalRevenue,
    conversion_rate: parseFloat(conversionRate.toFixed(2)),
    last_visit_at: now(),
    updated_at: now()
  });
  
  return { success: true, campaign_id, total_visits: totalVisits };
}
```

---

### Function 4: `link_question_to_campaign`
**Purpose:** When a question is created, link it to the campaign if visitor came from one

```javascript
// Xano Function: link_question_to_campaign
// Called after question creation
// Input: question_id (int), visitor_ip_hash (text), expert_profile_id (int)

function linkQuestionToCampaign({ question_id, visitor_ip_hash, expert_profile_id }) {
  // Find recent visit from same visitor (within last hour)
  const oneHourAgo = timestamp() - 3600;
  
  const recentVisit = queryOne('campaign_visits', {
    visitor_ip_hash: visitor_ip_hash,
    expert_profile_id: expert_profile_id,
    visited_at: { '>=': oneHourAgo },
    converted_to_question: false
  }, {
    sort: [{ field: 'visited_at', order: 'desc' }]
  });
  
  if (recentVisit) {
    // Mark visit as converted
    update('campaign_visits', recentVisit.id, {
      converted_to_question: true,
      question_id: question_id
    });
    
    // Update campaign metrics
    runBackground('update_campaign_metrics', { 
      campaign_id: recentVisit.campaign_id 
    });
    
    return { linked: true, campaign_id: recentVisit.campaign_id };
  }
  
  return { linked: false, reason: 'No recent campaign visit found' };
}
```

---

## 🔌 STEP 3: API Endpoints

### Endpoint 1: `GET /api/marketing/campaigns`
**Purpose:** List all campaigns for logged-in expert

```javascript
// Authentication: Required (expert JWT token)
// Xano API Endpoint: GET /marketing/campaigns

function getCampaigns(request) {
  const authUser = getAuthUser(request); // From JWT token
  
  const expert = queryOne('expert_profile', { 
    user_id: authUser.id 
  });
  
  if (!expert) {
    return { error: 'Expert profile not found', status: 404 };
  }
  
  const campaigns = query('utm_campaigns', {
    expert_profile_id: expert.id
  }, {
    sort: [{ field: 'total_revenue_cents', order: 'desc' }],
    limit: 100
  });
  
  // Format response
  return campaigns.map(c => ({
    id: c.id,
    name: c.name,
    utm_source: c.utm_source,
    utm_campaign: c.utm_campaign,
    url: `${env.APP_URL}/u/${expert.handle}?utm_source=${c.utm_source}&utm_campaign=${c.utm_campaign}`,
    total_visits: c.total_visits,
    total_questions: c.total_questions,
    total_revenue: c.total_revenue_cents / 100, // Convert to dollars
    conversion_rate: c.conversion_rate,
    status: c.status,
    created_at: c.created_at
  }));
}
```

---

### Endpoint 2: `POST /api/marketing/campaigns`
**Purpose:** Create new campaign

```javascript
// Authentication: Required
// Xano API Endpoint: POST /marketing/campaigns
// Body: { name, utm_source, utm_campaign, utm_medium?, utm_content? }

function createCampaign(request) {
  const authUser = getAuthUser(request);
  const { name, utm_source, utm_campaign, utm_medium, utm_content } = request.body;
  
  const expert = queryOne('expert_profile', { user_id: authUser.id });
  if (!expert) {
    return { error: 'Expert profile not found', status: 404 };
  }
  
  // Check if campaign already exists
  const existing = queryOne('utm_campaigns', {
    expert_profile_id: expert.id,
    utm_source: utm_source,
    utm_campaign: utm_campaign
  });
  
  if (existing) {
    return { error: 'Campaign already exists', status: 409 };
  }
  
  // Create campaign
  const campaign = insert('utm_campaigns', {
    expert_profile_id: expert.id,
    name: name,
    utm_source: utm_source,
    utm_campaign: utm_campaign,
    utm_medium: utm_medium || null,
    utm_content: utm_content || null,
    status: 'active'
  });
  
  // Generate URL
  const url = `${env.APP_URL}/u/${expert.handle}?utm_source=${utm_source}&utm_campaign=${utm_campaign}`;
  
  return {
    ...campaign,
    url: url,
    total_revenue: 0
  };
}
```

---

### Endpoint 3: `GET /api/marketing/traffic-sources`
**Purpose:** Get traffic breakdown by source

```javascript
// Authentication: Required
// Xano API Endpoint: GET /marketing/traffic-sources

function getTrafficSources(request) {
  const authUser = getAuthUser(request);
  const expert = queryOne('expert_profile', { user_id: authUser.id });
  
  if (!expert) {
    return { error: 'Expert profile not found', status: 404 };
  }
  
  // Aggregate visits by source
  const visits = query('campaign_visits', {
    expert_profile_id: expert.id
  }, {
    joins: ['campaign', 'question']
  });
  
  // Group by source
  const sourceMap = {};
  
  visits.forEach(visit => {
    const source = visit.campaign?.utm_source || 'direct';
    
    if (!sourceMap[source]) {
      sourceMap[source] = {
        name: source,
        visits: 0,
        questions: 0,
        revenue_cents: 0
      };
    }
    
    sourceMap[source].visits += 1;
    if (visit.converted_to_question) {
      sourceMap[source].questions += 1;
      sourceMap[source].revenue_cents += visit.question?.price_cents || 0;
    }
  });
  
  // Convert to array and calculate conversion rates
  return Object.values(sourceMap).map(source => ({
    name: source.name,
    visits: source.visits,
    questions: source.questions,
    revenue: source.revenue_cents / 100,
    conversion_rate: source.visits > 0 
      ? ((source.questions / source.visits) * 100).toFixed(2)
      : 0
  }));
}
```

---

### Endpoint 4: `GET /api/marketing/share-templates`
**Purpose:** Get pre-filled share kit templates

```javascript
// Authentication: Required
// Xano API Endpoint: GET /marketing/share-templates

function getShareTemplates(request) {
  const authUser = getAuthUser(request);
  const expert = queryOne('expert_profile', { 
    user_id: authUser.id 
  }, {
    joins: ['user']
  });
  
  if (!expert) {
    return { error: 'Expert profile not found', status: 404 };
  }
  
  // Get expert stats
  const questions = query('question', {
    expert_profile_id: expert.id,
    status: { 'in': ['closed', 'answered'] }
  });
  
  const totalQuestions = questions.length;
  const avgRating = questions.length > 0
    ? (questions.reduce((sum, q) => sum + (q.rating || 0), 0) / questions.length).toFixed(1)
    : '5.0';
  
  const price = expert.price_cents / 100;
  const slaHours = expert.sla_hours || 24;
  const profileUrl = `${env.APP_URL}/u/${expert.handle}`;
  
  // Templates with dynamic data
  const templates = [
    {
      id: 1,
      title: 'Twitter Thread Starter',
      platform: 'twitter',
      copy: `I've been overwhelmed by "can I pick your brain?" DMs.

Instead of saying no or scheduling calls, I'm using @mindPick:

• You record a quick question
• I answer on video within ${slaHours}h
• Both of us stay in flow
• Fair pricing: €${price}

My link: ${profileUrl}

(Answered ${totalQuestions} questions, ${avgRating}★ avg)`
    },
    {
      id: 2,
      title: 'LinkedIn Professional',
      platform: 'linkedin',
      copy: `A few thoughts on monetizing expertise without burning out:

I used to do 30-60min "exploratory calls" for free. Exhausting.

Now I use async video consultations:
✅ Askers get personalized advice on their schedule
✅ I answer when I'm in flow state
✅ No calendar Tetris
✅ Fair compensation for my time

Result: ${totalQuestions} questions answered, ${avgRating}/5.0 rating.

If you're facing challenges with ${expert.specialization || 'consulting'}, here's how it works: ${profileUrl}`
    },
    {
      id: 3,
      title: 'Email Signature',
      platform: 'email',
      copy: `---
${expert.user?.name || 'Expert'}
${expert.professional_title || 'Consultant'}

💬 Quick question? ${profileUrl}
📧 ${expert.user?.email}`
    }
  ];
  
  return templates;
}
```

---

### Endpoint 5: `GET /api/marketing/insights`
**Purpose:** Get conversion insights and recommendations

```javascript
// Authentication: Required
// Xano API Endpoint: GET /marketing/insights

function getMarketingInsights(request) {
  const authUser = getAuthUser(request);
  const expert = queryOne('expert_profile', { user_id: authUser.id });
  
  // Calculate metrics
  const visits = query('campaign_visits', { expert_profile_id: expert.id });
  const questions = query('question', { expert_profile_id: expert.id });
  
  const totalVisits = visits.length;
  const totalQuestions = questions.filter(q => q.status === 'paid' || q.status === 'closed').length;
  const conversionRate = totalVisits > 0 ? (totalQuestions / totalVisits) * 100 : 0;
  
  // Platform averages (hardcoded for now, could be calculated)
  const platformAverage = 3.2;
  
  const insights = [];
  
  // Generate insights based on performance
  if (conversionRate < platformAverage) {
    insights.push({
      severity: 'high',
      title: 'Low conversion rate',
      issue: `Only ${conversionRate.toFixed(1)}% of visitors ask questions (platform avg: ${platformAverage}%)`,
      recommendations: [
        'Add testimonials to your profile',
        'Consider reducing your price by 15-20%',
        'Make your specialization more specific',
        'Add a short intro video'
      ]
    });
  } else if (conversionRate > 4.5) {
    insights.push({
      severity: 'success',
      title: 'You\'re in the top 20% of experts!',
      issue: null,
      recommendations: [
        `🎉 Your conversion rate is ${((conversionRate / platformAverage - 1) * 100).toFixed(0)}% above platform average`,
        `Consider raising your price to €${Math.round(expert.price_cents / 100 * 1.2)}`,
        'Share your success story in our community'
      ]
    });
  }
  
  return {
    your_metrics: {
      visit_to_question: parseFloat(conversionRate.toFixed(2)),
      total_visits: totalVisits,
      total_questions: totalQuestions
    },
    platform_average: {
      visit_to_question: platformAverage
    },
    insights: insights
  };
}
```

---

## 🚀 STEP 4: Integration Points

### Modify Existing Question Creation Flow

When a question is created, call the link function:

```javascript
// In your existing question creation endpoint
// After question is successfully created:

const visitorIpHash = hashString(`${request.ip}_${request.user_agent}`, 'sha256');

runBackground('link_question_to_campaign', {
  question_id: newQuestion.id,
  visitor_ip_hash: visitorIpHash,
  expert_profile_id: expert.id
});
```

---

## 🎛️ STEP 5: Feature Flag Setup

### Add to Feature Flags Table (if exists) or create:

```javascript
// Add feature flag
insert('feature_flags', {
  name: 'marketing_module',
  enabled: false, // Start disabled
  rollout_percentage: 0,
  description: 'Marketing analytics and campaign tracking'
});
```

### Check Feature Flag in Frontend

```javascript
// In your React app (similar to social_impact_dashboard)
const { isEnabled: marketingEnabled } = useFeature('marketing_module');

// In ExpertDashboardPage.jsx, add a new nav item:
{marketingEnabled && (
  <button onClick={() => navigate('/expert/marketing')}>
    Marketing
  </button>
)}
```

---

## 📊 STEP 6: Testing Checklist

### Database Tests:
- [ ] Create utm_campaigns table with all fields
- [ ] Create campaign_visits table with relationships
- [ ] Test foreign key constraints work correctly

### Function Tests:
- [ ] Test generate_campaign_url returns correct URL
- [ ] Test track_campaign_visit creates campaign_visits row
- [ ] Test update_campaign_metrics calculates correctly
- [ ] Test link_question_to_campaign finds recent visits

### API Tests:
- [ ] GET /marketing/campaigns returns expert's campaigns
- [ ] POST /marketing/campaigns creates new campaign
- [ ] GET /marketing/traffic-sources aggregates correctly
- [ ] GET /marketing/share-templates fills in expert data
- [ ] GET /marketing/insights generates recommendations

### Integration Tests:
- [ ] Visit expert page with UTM → visit is tracked
- [ ] Create question after UTM visit → linked correctly
- [ ] Campaign metrics update automatically
- [ ] Feature flag controls access to marketing module

---

## 🎯 Go-Live Checklist

1. **Deploy database changes** to Xano production
2. **Deploy API endpoints** with authentication
3. **Enable feature flag** for beta testers (5-10 experts)
4. **Monitor performance** (check query times, error logs)
5. **Gather feedback** and iterate
6. **Full rollout** after 1-2 weeks of beta

---

## 💡 Performance Optimization

### Indexes to Add (Critical):
```sql
-- For fast campaign lookups
CREATE INDEX idx_campaigns_expert_source ON utm_campaigns(expert_profile_id, utm_source, utm_campaign);

-- For fast visit aggregation
CREATE INDEX idx_visits_campaign_date ON campaign_visits(campaign_id, visited_at DESC);

-- For conversion tracking
CREATE INDEX idx_visits_conversion ON campaign_visits(converted_to_question, visited_at);
```

### Caching Strategy:
- Cache dashboard metrics for 30 seconds
- Use Xano's built-in cache for frequently accessed campaigns
- Pre-aggregate daily stats in background jobs

---

## 📈 Success Metrics

**Week 1:**
- 50% of Pro users create at least 1 campaign
- Average 3 campaigns per active user

**Month 1:**
- 70% of Pro users actively using marketing module
- 20% improvement in Free → Pro conversion due to marketing value prop

**Month 3:**
- Marketing module is top-cited reason for upgrading to Pro
- Experts report 15%+ increase in questions from better campaign tracking