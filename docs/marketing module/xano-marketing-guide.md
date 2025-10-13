# Xano Backend Implementation Guide
## Marketing Module for mindPick

---

## 📋 Overview

This guide implements the complete backend infrastructure for the Marketing Module in Xano. Your frontend is deployed with mock data - we'll build the database tables, functions, and API endpoints to make it functional.

**Estimated Time:** 6-8 hours  
**Difficulty:** Intermediate

---

## Prerequisites Checklist

- [ ] Access to your Xano workspace
- [ ] `expert_profile` table exists
- [ ] `question` table exists
- [ ] `user` table exists
- [ ] Expert authentication (JWT) working

---

## 🗄️ STEP 1: Create Database Tables

### Table 1: utm_campaigns

**Purpose:** Store marketing campaigns with UTM parameters and metrics

1. Navigate to **Database** → **Add Table**
2. Name: `utm_campaigns`
3. Add these fields:

| Field Name | Type | Configuration |
|------------|------|---------------|
| `id` | Integer | Primary Key, Auto-increment |
| `expert_profile_id` | Integer | Required, Relationship to `expert_profile.id` (CASCADE) |
| `name` | Text | Required, Max: 255 chars |
| `url_slug` | Text | Optional, Unique, Max: 100 chars |
| `utm_source` | Text | Max: 100 chars |
| `utm_medium` | Text | Max: 100 chars |
| `utm_campaign` | Text | Max: 100 chars |
| `utm_content` | Text | Max: 255 chars |
| `utm_term` | Text | Max: 255 chars |
| `status` | Text | Default: `"active"` |
| `total_visits` | Integer | Default: `0` |
| `total_questions` | Integer | Default: `0` |
| `total_revenue_cents` | Integer | Default: `0` |
| `conversion_rate` | Decimal | Precision: 5, Scale: 2, Default: `0.00` |
| `created_at` | Timestamp | Default: `now()` |
| `updated_at` | Timestamp | Default: `now()` |
| `last_visit_at` | Timestamp | Nullable |

4. **Add Indexes** (Settings → Indexes):
   - Index on `expert_profile_id`
   - Index on `status`
   - Unique composite: `expert_profile_id` + `utm_source` + `utm_campaign`

---

### Table 2: campaign_visits

**Purpose:** Track individual visits from campaigns

1. **Database** → **Add Table**
2. Name: `campaign_visits`
3. Add fields:

| Field Name | Type | Configuration |
|------------|------|---------------|
| `id` | Integer | Primary Key, Auto-increment |
| `campaign_id` | Integer | Required, Relationship to `utm_campaigns.id` (CASCADE) |
| `expert_profile_id` | Integer | Required, Relationship to `expert_profile.id` (CASCADE) |
| `visitor_ip_hash` | Text | Max: 64 chars |
| `referrer` | Text | Long text field |
| `user_agent` | Text | Long text field |
| `country` | Text | Max: 2 chars (ISO code) |
| `device_type` | Text | Default: `"unknown"` |
| `converted_to_question` | Boolean | Default: `false` |
| `question_id` | Integer | Nullable, Relationship to `question.id` (SET NULL) |
| `visited_at` | Timestamp | Default: `now()` |

4. **Add Indexes**:
   - Index on `campaign_id`
   - Index on `expert_profile_id`
   - Index on `visited_at` (DESC)
   - Composite: `converted_to_question` + `visited_at`

---

## 🔧 STEP 2: Create Background Functions

### Function 1: update_campaign_metrics

**Purpose:** Recalculate campaign statistics (runs async)

1. **Functions** → **Add Function**
2. Name: `update_campaign_metrics`
3. Type: **Function Stack**
4. **Add Input**: 
   - `campaign_id` (Integer, Required)

**Function Logic:**

```javascript
// 1. Count total visits
var visitCount = $count.campaign_visits.where(campaign_visits.campaign_id, input.campaign_id)

// 2. Get conversions with question data
var conversions = $filter.campaign_visits
  .where(campaign_visits.campaign_id, input.campaign_id)
  .where(campaign_visits.converted_to_question, true)
  .related('question')

// 3. Calculate metrics
var totalQuestions = conversions.length
var totalRevenue = 0

for (var i = 0; i < conversions.length; i++) {
  if (conversions[i].question && conversions[i].question.price_cents) {
    totalRevenue = totalRevenue + conversions[i].question.price_cents
  }
}

var conversionRate = visitCount > 0 ? (totalQuestions / visitCount) * 100 : 0

// 4. Update campaign
var updated = $update.utm_campaigns
  .byId(input.campaign_id)
  .set({
    total_visits: visitCount,
    total_questions: totalQuestions,
    total_revenue_cents: totalRevenue,
    conversion_rate: conversionRate.toFixed(2),
    last_visit_at: $now,
    updated_at: $now
  })

return {
  success: true,
  campaign_id: input.campaign_id,
  total_visits: visitCount,
  total_questions: totalQuestions,
  total_revenue_cents: totalRevenue,
  conversion_rate: conversionRate.toFixed(2)
}
```

---

### Function 2: link_question_to_campaign

**Purpose:** Link questions to campaigns when created

1. **Functions** → **Add Function**
2. Name: `link_question_to_campaign`
3. **Add Inputs**:
   - `question_id` (Integer, Required)
   - `visitor_ip_hash` (Text, Required)
   - `expert_profile_id` (Integer, Required)

**Function Logic:**

```javascript
// 1. Find recent visit from same visitor (within last hour)
var oneHourAgo = $now - 3600

var recentVisit = $filter.campaign_visits
  .where(campaign_visits.visitor_ip_hash, input.visitor_ip_hash)
  .where(campaign_visits.expert_profile_id, input.expert_profile_id)
  .where(campaign_visits.converted_to_question, false)
  .where(campaign_visits.visited_at, '>=', oneHourAgo)
  .orderBy('visited_at', 'desc')
  .first()

if (recentVisit) {
  // 2. Mark visit as converted
  $update.campaign_visits
    .byId(recentVisit.id)
    .set({
      converted_to_question: true,
      question_id: input.question_id
    })
  
  // 3. Trigger metrics update (async)
  $runOnce.update_campaign_metrics({
    campaign_id: recentVisit.campaign_id
  })
  
  return {
    linked: true,
    campaign_id: recentVisit.campaign_id,
    visit_id: recentVisit.id
  }
}

return {
  linked: false,
  reason: 'No recent campaign visit found'
}
```

---

## 🔌 STEP 3: Create API Endpoints

### Endpoint 1: GET /marketing/campaigns

**List all campaigns for logged-in expert**

1. **API** → **Add Endpoint**
2. Method: **GET**
3. Path: `/marketing/campaigns`
4. Authentication: **Required** (Add Auth middleware)

**Function Stack:**

```javascript
// 1. Get authenticated user
var authUser = auth.user

// 2. Get expert profile
var expert = $filter.expert_profile
  .where(expert_profile.user_id, authUser.id)
  .first()

if (!expert) {
  return {
    error: 'Expert profile not found',
    status: 404
  }
}

// 3. Get campaigns
var campaigns = $filter.utm_campaigns
  .where(utm_campaigns.expert_profile_id, expert.id)
  .where(utm_campaigns.status, 'active')
  .orderBy('total_revenue_cents', 'desc')
  .limit(100)

// 4. Format response with URLs
var result = []
for (var i = 0; i < campaigns.length; i++) {
  var c = campaigns[i]
  
  // Build campaign URL
  var params = '?utm_source=' + c.utm_source + '&utm_campaign=' + c.utm_campaign
  if (c.utm_medium) params = params + '&utm_medium=' + c.utm_medium
  if (c.utm_content) params = params + '&utm_content=' + c.utm_content
  
  var campaignUrl = env.APP_URL + '/u/' + expert.handle + params
  
  result.push({
    id: c.id,
    name: c.name,
    utm_source: c.utm_source,
    utm_campaign: c.utm_campaign,
    utm_medium: c.utm_medium,
    utm_content: c.utm_content,
    url: campaignUrl,
    total_visits: c.total_visits,
    total_questions: c.total_questions,
    total_revenue: c.total_revenue_cents / 100,
    conversion_rate: c.conversion_rate,
    status: c.status,
    created_at: c.created_at
  })
}

return result
```

**⚙️ Environment Variable Required:**
- Go to **Settings** → **Environment Variables**
- Add: `APP_URL` = `https://yourdomain.com`

---

### Endpoint 2: POST /marketing/campaigns

**Create new campaign**

1. **API** → **Add Endpoint**
2. Method: **POST**
3. Path: `/marketing/campaigns`
4. Authentication: **Required**
5. **Add Inputs:**
   - `name` (Text, Required)
   - `utm_source` (Text, Required)
   - `utm_campaign` (Text, Required)
   - `utm_medium` (Text, Optional)
   - `utm_content` (Text, Optional)

**Function Stack:**

```javascript
// 1. Get authenticated user
var authUser = auth.user

var expert = $filter.expert_profile
  .where(expert_profile.user_id, authUser.id)
  .first()

if (!expert) {
  return {
    error: 'Expert profile not found',
    status: 404
  }
}

// 2. Check if campaign already exists
var existing = $filter.utm_campaigns
  .where(utm_campaigns.expert_profile_id, expert.id)
  .where(utm_campaigns.utm_source, input.utm_source)
  .where(utm_campaigns.utm_campaign, input.utm_campaign)
  .first()

if (existing) {
  return {
    error: 'Campaign with this source and campaign ID already exists',
    status: 409
  }
}

// 3. Create campaign
var campaign = $insert.utm_campaigns.one({
  expert_profile_id: expert.id,
  name: input.name,
  utm_source: input.utm_source,
  utm_campaign: input.utm_campaign,
  utm_medium: input.utm_medium || null,
  utm_content: input.utm_content || null,
  status: 'active',
  created_at: $now,
  updated_at: $now
})

// 4. Generate URL
var params = '?utm_source=' + campaign.utm_source + '&utm_campaign=' + campaign.utm_campaign
if (campaign.utm_medium) params = params + '&utm_medium=' + campaign.utm_medium
if (campaign.utm_content) params = params + '&utm_content=' + campaign.utm_content

var url = env.APP_URL + '/u/' + expert.handle + params

// 5. Return created campaign
return {
  id: campaign.id,
  name: campaign.name,
  utm_source: campaign.utm_source,
  utm_campaign: campaign.utm_campaign,
  utm_medium: campaign.utm_medium,
  utm_content: campaign.utm_content,
  url: url,
  total_visits: 0,
  total_questions: 0,
  total_revenue: 0,
  conversion_rate: 0,
  status: campaign.status,
  created_at: campaign.created_at
}
```

---

### Endpoint 3: GET /marketing/traffic-sources

**Get traffic breakdown by source**

1. **API** → **Add Endpoint**
2. Method: **GET**
3. Path: `/marketing/traffic-sources`
4. Authentication: **Required**

**Function Stack:**

```javascript
// 1. Get expert
var authUser = auth.user
var expert = $filter.expert_profile
  .where(expert_profile.user_id, authUser.id)
  .first()

if (!expert) {
  return {
    error: 'Expert profile not found',
    status: 404
  }
}

// 2. Get all visits with related data
var visits = $filter.campaign_visits
  .where(campaign_visits.expert_profile_id, expert.id)
  .related('campaign')
  .related('question')

// 3. Group by source
var sourceMap = {}

for (var i = 0; i < visits.length; i++) {
  var visit = visits[i]
  var source = visit.campaign && visit.campaign.utm_source ? visit.campaign.utm_source : 'direct'
  
  if (!sourceMap[source]) {
    sourceMap[source] = {
      name: source,
      visits: 0,
      questions: 0,
      revenue_cents: 0
    }
  }
  
  sourceMap[source].visits = sourceMap[source].visits + 1
  
  if (visit.converted_to_question && visit.question) {
    sourceMap[source].questions = sourceMap[source].questions + 1
    sourceMap[source].revenue_cents = sourceMap[source].revenue_cents + (visit.question.price_cents || 0)
  }
}

// 4. Convert to array and calculate conversion rates
var result = []
for (var sourceName in sourceMap) {
  var source = sourceMap[sourceName]
  var convRate = source.visits > 0 ? ((source.questions / source.visits) * 100).toFixed(2) : 0
  
  result.push({
    name: source.name,
    visits: source.visits,
    questions: source.questions,
    revenue: source.revenue_cents / 100,
    conversion_rate: convRate
  })
}

// 5. Sort by revenue (descending)
result.sort(function(a, b) {
  return b.revenue - a.revenue
})

return result
```

---

### Endpoint 4: GET /marketing/share-templates

**Get pre-filled share kit templates**

1. **API** → **Add Endpoint**
2. Method: **GET**
3. Path: `/marketing/share-templates`
4. Authentication: **Required**

**Function Stack:**

```javascript
// 1. Get expert with user data
var authUser = auth.user
var expert = $filter.expert_profile
  .where(expert_profile.user_id, authUser.id)
  .related('user')
  .first()

if (!expert) {
  return {
    error: 'Expert profile not found',
    status: 404
  }
}

// 2. Calculate stats
var allQuestions = $filter.question
  .where(question.expert_profile_id, expert.id)
  .where(question.status, 'in', ['closed', 'answered'])

var totalQuestions = allQuestions.length
var totalRating = 0
for (var i = 0; i < allQuestions.length; i++) {
  totalRating = totalRating + (allQuestions[i].rating || 0)
}
var avgRating = totalQuestions > 0 ? (totalRating / totalQuestions).toFixed(1) : '5.0'

var price = expert.price_cents / 100
var slaHours = expert.sla_hours || 24
var profileUrl = env.APP_URL + '/u/' + expert.handle
var expertName = expert.user ? expert.user.name : 'Expert'
var expertEmail = expert.user ? expert.user.email : ''
var specialization = expert.specialization || 'consulting'
var professionalTitle = expert.professional_title || 'Consultant'

// 3. Build templates
var templates = [
  {
    id: 1,
    title: 'Twitter Thread Starter',
    platform: 'twitter',
    copy: "I've been overwhelmed by \"can I pick your brain?\" DMs.\n\nInstead of saying no or scheduling calls, I'm using @mindPick:\n\n• You record a quick question\n• I answer on video within " + slaHours + "h\n• Both of us stay in flow\n• Fair pricing: €" + price + "\n\nMy link: " + profileUrl + "\n\n(Answered " + totalQuestions + " questions, " + avgRating + "★ avg)"
  },
  {
    id: 2,
    title: 'LinkedIn Professional',
    platform: 'linkedin',
    copy: "A few thoughts on monetizing expertise without burning out:\n\nI used to do 30-60min \"exploratory calls\" for free. Exhausting.\n\nNow I use async video consultations:\n✅ Askers get personalized advice on their schedule\n✅ I answer when I'm in flow state\n✅ No calendar Tetris\n✅ Fair compensation for my time\n\nResult: " + totalQuestions + " questions answered, " + avgRating + "/5.0 rating.\n\nIf you're facing challenges with " + specialization + ", here's how it works: " + profileUrl
  },
  {
    id: 3,
    title: 'Email Signature',
    platform: 'email',
    copy: "---\n" + expertName + "\n" + professionalTitle + "\n\n💬 Quick question? " + profileUrl + "\n📧 " + expertEmail
  }
]

return templates
```

---

### Endpoint 5: GET /marketing/insights

**Get conversion insights and recommendations**

1. **API** → **Add Endpoint**
2. Method: **GET**
3. Path: `/marketing/insights`
4. Authentication: **Required**

**Function Stack:**

```javascript
// 1. Get expert
var authUser = auth.user
var expert = $filter.expert_profile
  .where(expert_profile.user_id, authUser.id)
  .first()

if (!expert) {
  return {
    error: 'Expert profile not found',
    status: 404
  }
}

// 2. Calculate metrics
var visits = $filter.campaign_visits
  .where(campaign_visits.expert_profile_id, expert.id)

var questions = $filter.question
  .where(question.expert_profile_id, expert.id)
  .where(question.status, 'in', ['paid', 'closed', 'answered'])

var totalVisits = visits.length
var totalQuestions = questions.length
var conversionRate = totalVisits > 0 ? (totalQuestions / totalVisits) * 100 : 0

// 3. Platform average (hardcoded for now)
var platformAverage = 3.2

// 4. Generate insights
var insights = []

if (conversionRate < platformAverage) {
  insights.push({
    severity: 'high',
    title: 'Low conversion rate',
    issue: 'Only ' + conversionRate.toFixed(1) + '% of visitors ask questions (platform avg: ' + platformAverage + '%)',
    recommendations: [
      'Add testimonials to your profile',
      'Consider reducing your price by 15-20%',
      'Make your specialization more specific',
      'Add a short intro video'
    ]
  })
} else if (conversionRate > 4.5) {
  var percentAbove = ((conversionRate / platformAverage - 1) * 100).toFixed(0)
  var suggestedPrice = Math.round(expert.price_cents / 100 * 1.2)
  
  insights.push({
    severity: 'success',
    title: "You're in the top 20% of experts!",
    issue: null,
    recommendations: [
      '🎉 Your conversion rate is ' + percentAbove + '% above platform average',
      'Consider raising your price to €' + suggestedPrice,
      'Share your success story in our community'
    ]
  })
}

// 5. Return response
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
}
```

---

### Endpoint 6: POST /public/track-visit

**Track UTM visits (PUBLIC - No Auth)**

1. **API** → **Add Endpoint**
2. Method: **POST**
3. Path: `/public/track-visit`
4. Authentication: **NONE** (Public endpoint)
5. **Add Inputs:**
   - `expert_handle` (Text, Required)
   - `utm_source` (Text, Required)
   - `utm_campaign` (Text, Required)
   - `utm_medium` (Text, Optional)
   - `utm_content` (Text, Optional)

**Function Stack:**

```javascript
// 1. Get expert by handle
var expert = $filter.expert_profile
  .where(expert_profile.handle, input.expert_handle)
  .first()

if (!expert) {
  return {
    tracked: false,
    reason: 'Expert not found'
  }
}

// 2. Find or create campaign
var campaign = $filter.utm_campaigns
  .where(utm_campaigns.expert_profile_id, expert.id)
  .where(utm_campaigns.utm_source, input.utm_source)
  .where(utm_campaigns.utm_campaign, input.utm_campaign)
  .first()

if (!campaign) {
  // Auto-create campaign on first visit
  campaign = $insert.utm_campaigns.one({
    expert_profile_id: expert.id,
    name: input.utm_source + ' - ' + input.utm_campaign,
    utm_source: input.utm_source,
    utm_campaign: input.utm_campaign,
    utm_medium: input.utm_medium || null,
    utm_content: input.utm_content || null,
    status: 'active',
    created_at: $now,
    updated_at: $now
  })
}

// 3. Hash visitor IP for privacy
var ipAddress = request.ip || 'unknown'
var userAgent = request.headers['user-agent'] || 'unknown'
var visitorIpHash = $crypto.hash(ipAddress + '_' + userAgent, 'sha256')

// 4. Detect device type
var deviceType = 'unknown'
if (userAgent.match(/mobile/i)) {
  deviceType = 'mobile'
} else if (userAgent.match(/tablet/i)) {
  deviceType = 'tablet'
} else if (userAgent.match(/desktop|windows|mac/i)) {
  deviceType = 'desktop'
}

// 5. Get country from headers
var country = request.headers['cf-ipcountry'] || 'XX'

// 6. Log the visit
var visit = $insert.campaign_visits.one({
  campaign_id: campaign.id,
  expert_profile_id: expert.id,
  visitor_ip_hash: visitorIpHash,
  referrer: request.headers['referer'] || null,
  user_agent: userAgent,
  country: country,
  device_type: deviceType,
  visited_at: $now
})

// 7. Update metrics (async)
$runOnce.update_campaign_metrics({
  campaign_id: campaign.id
})

return {
  tracked: true,
  campaign_id: campaign.id,
  visit_id: visit.id
}
```

---

## 🔗 STEP 4: Frontend Integration

### Update useMarketing.js

Remove mock data fallback:

```javascript
// Before:
catch (err) {
  setCampaigns([/* mock data */]);
}

// After:
catch (err) {
  console.error('Failed to fetch campaigns:', err);
  setCampaigns([]);
  setError('Could not load campaigns');
}
```

### Add UTM Tracking to Public Profile

In your public profile component (e.g., `/u/{handle}`):

```javascript
useEffect(() => {
  const searchParams = new URLSearchParams(window.location.search);
  const utmParams = {
    expert_handle: handle,
    utm_source: searchParams.get('utm_source'),
    utm_campaign: searchParams.get('utm_campaign'),
    utm_medium: searchParams.get('utm_medium'),
    utm_content: searchParams.get('utm_content')
  };
  
  if (utmParams.utm_source && utmParams.utm_campaign) {
    apiClient.post('/public/track-visit', utmParams)
      .catch(err => console.log('Tracking failed:', err));
    
    localStorage.setItem('utm_params', JSON.stringify(utmParams));
  }
}, [handle]);
```

### Link Questions to Campaigns

In question creation flow:

```javascript
// After question created successfully:
const storedUtm = localStorage.getItem('utm_params');
if (storedUtm) {
  const utmParams = JSON.parse(storedUtm);
  const visitorIpHash = /* calculate hash */;
  
  apiClient.post('/marketing/link-question', {
    question_id: newQuestion.id,
    visitor_ip_hash: visitorIpHash,
    expert_profile_id: expertProfileId
  }).catch(err => console.log('Attribution failed:', err));
  
  localStorage.removeItem('utm_params');
}
```

---

## ✅ Testing Checklist

### Database Tests
- [ ] Manually create test campaign in `utm_campaigns`
- [ ] Verify relationships work (expert → campaigns)
- [ ] Test cascade delete

### Function Tests (Use Xano's Debugger)
- [ ] Test `update_campaign_metrics` with sample campaign_id
- [ ] Test `link_question_to_campaign` with mock data
- [ ] Verify return values match expected structure

### API Tests (Postman/Thunder Client)

**Test 1: Create Campaign**
```
POST /marketing/campaigns
Authorization: Bearer YOUR_JWT_TOKEN
{
  "name": "Test Campaign",
  "utm_source": "linkedin",
  "utm_campaign": "test_2025"
}
Expected: 201 Created
```

**Test 2: List Campaigns**
```
GET /marketing/campaigns
Authorization: Bearer YOUR_JWT_TOKEN
Expected: Array of campaigns
```

**Test 3: Track Visit**
```
POST /public/track-visit
{
  "expert_handle": "test-handle",
  "utm_source": "linkedin",
  "utm_campaign": "test_2025"
}
Expected: { tracked: true }
```

**Test 4-6:** Repeat for traffic-sources, share-templates, insights

### Integration Tests
- [ ] Visit `/u/handle?utm_source=test&utm_campaign=test`
- [ ] Check `campaign_visits` table for new row
- [ ] Create question after UTM visit
- [ ] Verify conversion tracked
- [ ] Check metrics updated

---

## 🚀 Go-Live Checklist

**Before Production:**
- [ ] All tables created with indexes
- [ ] All functions tested
- [ ] All 6 endpoints working
- [ ] Mock data removed from frontend
- [ ] UTM tracking added to profile page
- [ ] Question attribution implemented
- [ ] Environment variable `APP_URL` set

**Rollout:**
1. Deploy to production Xano workspace
2. Test with 1 account
3. Enable for 5 beta users
4. Monitor 48 hours
5. Full rollout

---

## 🐛 Common Issues

**"Expert not found"**
→ Ensure expert_profile exists for auth user

**UTM tracking not working**
→ Verify `/public/track-visit` has no auth required

**Conversion rate always 0**
→ Check `link_question_to_campaign` is called

**Slow loading**
→ Add indexes to campaign_visits table

---

## 📊 Success Metrics

**Week 1:**
- Campaigns created per expert
- API response times (<500ms)
- Error rate (<1%)

**Month 1:**
- % Pro users using module
- Average campaigns per user
- Feature satisfaction

---

## 📚 Resources

- Xano Docs: https://docs.xano.com
- Use Xano debugger for functions
- Test endpoints in Xano preview

**Need help?** Check Xano community forums or documentation.