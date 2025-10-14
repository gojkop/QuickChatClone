# Marketing Module - Step 3: API Endpoints

## Overview
6 API endpoints: 5 authenticated (for experts) + 1 public (for tracking).

---

## Environment Variable Setup

### Required: Add APP_URL

1. Go to Xano → **Settings** → **Environment Variables**
2. Add variable:
   - Name: `APP_URL`
   - Value: `https://mindpick.me` (or your domain)

This is used to generate campaign URLs.

---

## Endpoint 1: GET /marketing/campaigns

### Purpose
List all campaigns for the authenticated expert.

### Configuration
1. Go to Xano → **API** → **Add Endpoint**
2. Method: **GET**
3. Path: `/marketing/campaigns`
4. **Authentication:** REQUIRED (Add Auth middleware)

### Function Stack

#### Step 1: Get Authenticated User
**Type:** Get Auth User
**Save as:** `authUser`

#### Step 2: Query - Get Expert Profile
**Type:** Query All Records
**Table:** `expert_profile`
**Filter:** `user_id` = `authUser.id`
**Limit:** 1
**Save as:** `expertProfiles`

#### Step 3: Conditional - Check Expert Exists
**Condition:** `expertProfiles.length > 0`

**IF FALSE:** Return error
```javascript
return {
  error: 'Expert profile not found',
  status: 404
}
```

**IF TRUE:** Continue...

#### Step 4: Extract Expert
```javascript
var expert = expertProfiles[0]
return { expert: expert }
```
**Save as:** `expertData`

#### Step 5: Query - Get Campaigns
**Type:** Query All Records
**Table:** `utm_campaigns`
**Filters:**
- `expert_profile_id` = `expertData.expert.id`
- `status` = `"active"`

**Order By:** `total_revenue_cents` DESC
**Limit:** 100
**Save as:** `campaigns`

#### Step 6: Custom Code - Format Response
```javascript
var result = []
var APP_URL = env.APP_URL || 'https://mindpick.me'
var handle = expertData.expert.handle

for (var i = 0; i < campaigns.length; i++) {
  var c = campaigns[i]

  // Build UTM parameters
  var params = '?utm_source=' + c.utm_source + '&utm_campaign=' + c.utm_campaign
  if (c.utm_medium) params += '&utm_medium=' + c.utm_medium
  if (c.utm_content) params += '&utm_content=' + c.utm_content

  // Build full URL
  var campaignUrl = APP_URL + '/u/' + handle + params

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

### Testing
```bash
GET /marketing/campaigns
Authorization: Bearer YOUR_JWT_TOKEN
```

Expected: Array of campaign objects with formatted URLs.

---

## Endpoint 2: POST /marketing/campaigns

### Purpose
Create a new campaign.

### Configuration
1. **API** → **Add Endpoint**
2. Method: **POST**
3. Path: `/marketing/campaigns`
4. **Authentication:** REQUIRED

### Inputs
Add these parameters:
- `name` (Text, **Required**)
- `utm_source` (Text, **Required**)
- `utm_campaign` (Text, **Required**)
- `utm_medium` (Text, Optional)
- `utm_content` (Text, Optional)

### Function Stack

#### Step 1-3: Same as GET endpoint (Get auth user + expert profile)

#### Step 4: Query - Check Duplicate Campaign
**Type:** Query All Records
**Table:** `utm_campaigns`
**Filters:**
- `expert_profile_id` = `expertData.expert.id`
- `utm_source` = `input.utm_source`
- `utm_campaign` = `input.utm_campaign`

**Limit:** 1
**Save as:** `existingCampaigns`

#### Step 5: Conditional - Check if Already Exists
**Condition:** `existingCampaigns.length > 0`

**IF TRUE:** Return error
```javascript
return {
  error: 'Campaign with this source and campaign ID already exists',
  status: 409
}
```

**IF FALSE:** Continue...

#### Step 6: Insert - Create Campaign
**Type:** Add Record
**Table:** `utm_campaigns`
**Fields:**
- `expert_profile_id` = `expertData.expert.id`
- `name` = `input.name`
- `utm_source` = `input.utm_source`
- `utm_campaign` = `input.utm_campaign`
- `utm_medium` = `input.utm_medium || null`
- `utm_content` = `input.utm_content || null`
- `status` = `"active"`
- `created_at` = `now()`
- `updated_at` = `now()`

**Save as:** `campaign`

#### Step 7: Custom Code - Format Response
```javascript
var APP_URL = env.APP_URL || 'https://mindpick.me'
var handle = expertData.expert.handle

var params = '?utm_source=' + campaign.utm_source + '&utm_campaign=' + campaign.utm_campaign
if (campaign.utm_medium) params += '&utm_medium=' + campaign.utm_medium
if (campaign.utm_content) params += '&utm_content=' + campaign.utm_content

var url = APP_URL + '/u/' + handle + params

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

### Testing
```bash
POST /marketing/campaigns
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "LinkedIn Q4 Launch",
  "utm_source": "linkedin",
  "utm_campaign": "q4_launch",
  "utm_medium": "social"
}
```

---

## Endpoint 3: GET /marketing/traffic-sources

### Purpose
Get traffic breakdown by source (aggregated from visits).

### Configuration
1. Method: **GET**
2. Path: `/marketing/traffic-sources`
3. **Authentication:** REQUIRED

### Function Stack

#### Step 1-3: Get auth user + expert (same as above)

#### Step 4: Query - Get All Visits
**Type:** Query All Records
**Table:** `campaign_visits`
**Filter:** `expert_profile_id` = `expertData.expert.id`
**Relationships:** Load `campaign`, Load `question`
**Save as:** `visits`

#### Step 5: Custom Code - Group by Source
```javascript
var sourceMap = {}

// Group visits by source
for (var i = 0; i < visits.length; i++) {
  var visit = visits[i]
  var source = 'direct'

  if (visit.campaign && visit.campaign.utm_source) {
    source = visit.campaign.utm_source
  }

  // Initialize source if not exists
  if (!sourceMap[source]) {
    sourceMap[source] = {
      name: source,
      visits: 0,
      questions: 0,
      revenue_cents: 0
    }
  }

  // Increment visit count
  sourceMap[source].visits += 1

  // If converted, count question and revenue
  if (visit.converted_to_question && visit.question) {
    sourceMap[source].questions += 1
    sourceMap[source].revenue_cents += (visit.question.price_cents || 0)
  }
}

// Convert to array and calculate conversion rates
var result = []
for (var sourceName in sourceMap) {
  var source = sourceMap[sourceName]
  var convRate = source.visits > 0
    ? ((source.questions / source.visits) * 100).toFixed(2)
    : '0.00'

  result.push({
    name: source.name,
    visits: source.visits,
    questions: source.questions,
    revenue: source.revenue_cents / 100,
    conversion_rate: parseFloat(convRate)
  })
}

// Sort by revenue (descending)
result.sort(function(a, b) {
  return b.revenue - a.revenue
})

return result
```

### Testing
```bash
GET /marketing/traffic-sources
Authorization: Bearer YOUR_JWT_TOKEN
```

Expected: Array of sources with visits, questions, revenue, conversion rate.

---

## Endpoint 4: GET /marketing/share-templates

### Purpose
Get pre-filled share kit templates with expert data.

### Configuration
1. Method: **GET**
2. Path: `/marketing/share-templates`
3. **Authentication:** REQUIRED

### Function Stack

#### Step 1-3: Get auth user + expert with user relationship

**IMPORTANT:** In Step 2, add relationship: Load `user`

#### Step 4: Query - Get Expert Stats
**Type:** Query All Records
**Table:** `question`
**Filters:**
- `expert_profile_id` = `expertData.expert.id`
- `status` IN `['closed', 'answered']`

**Save as:** `allQuestions`

#### Step 5: Custom Code - Calculate Stats & Build Templates
```javascript
var expert = expertData.expert
var user = expert.user

// Calculate stats
var totalQuestions = allQuestions.length
var totalRating = 0
for (var i = 0; i < allQuestions.length; i++) {
  totalRating += (allQuestions[i].rating || 0)
}
var avgRating = totalQuestions > 0
  ? (totalRating / totalQuestions).toFixed(1)
  : '5.0'

// Expert data
var price = expert.price_cents / 100
var slaHours = expert.sla_hours || 24
var APP_URL = env.APP_URL || 'https://mindpick.me'
var profileUrl = APP_URL + '/u/' + expert.handle
var expertName = user ? user.name : 'Expert'
var expertEmail = user ? user.email : ''
var specialization = expert.specialization || 'consulting'
var professionalTitle = expert.professional_title || 'Consultant'

// Build templates
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

## Endpoint 5: GET /marketing/insights

### Purpose
Get conversion insights and recommendations.

### Configuration
1. Method: **GET**
2. Path: `/marketing/insights`
3. **Authentication:** REQUIRED

### Function Stack

#### Step 1-3: Get auth user + expert

#### Step 4: Query - Get All Visits
**Type:** Query All Records
**Table:** `campaign_visits`
**Filter:** `expert_profile_id` = `expertData.expert.id`
**Save as:** `visits`

#### Step 5: Query - Get All Questions
**Type:** Query All Records
**Table:** `question`
**Filters:**
- `expert_profile_id` = `expertData.expert.id`
- `status` IN `['paid', 'closed', 'answered']`

**Save as:** `questions`

#### Step 6: Custom Code - Calculate Insights
```javascript
var totalVisits = visits.length
var totalQuestions = questions.length
var conversionRate = totalVisits > 0
  ? (totalQuestions / totalVisits) * 100
  : 0

// Platform average (hardcoded for now)
var platformAverage = 3.2

// Generate insights
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
  var expert = expertData.expert
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

## Endpoint 6: POST /public/track-visit

### Purpose
Track UTM visits from public profile page (no auth required).

### Configuration
1. Method: **POST**
2. Path: `/public/track-visit`
3. **Authentication:** NONE (Public endpoint)

### Inputs
- `expert_handle` (Text, **Required**)
- `utm_source` (Text, **Required**)
- `utm_campaign` (Text, **Required**)
- `utm_medium` (Text, Optional)
- `utm_content` (Text, Optional)

### Function Stack

#### Step 1: Query - Get Expert by Handle
**Type:** Query All Records
**Table:** `expert_profile`
**Filter:** `handle` = `input.expert_handle`
**Limit:** 1
**Save as:** `expertProfiles`

#### Step 2: Conditional - Check Expert Exists
**Condition:** `expertProfiles.length === 0`

**IF TRUE:** Return error
```javascript
return {
  tracked: false,
  reason: 'Expert not found'
}
```

**IF FALSE:** Continue...

#### Step 3: Extract Expert
```javascript
var expert = expertProfiles[0]
return { expert: expert }
```
**Save as:** `expertData`

#### Step 4: Query - Find Existing Campaign
**Type:** Query All Records
**Table:** `utm_campaigns`
**Filters:**
- `expert_profile_id` = `expertData.expert.id`
- `utm_source` = `input.utm_source`
- `utm_campaign` = `input.utm_campaign`

**Limit:** 1
**Save as:** `existingCampaigns`

#### Step 5: Conditional - Create Campaign if Needed
**Condition:** `existingCampaigns.length === 0`

**IF TRUE:** Insert new campaign
**Type:** Add Record
**Table:** `utm_campaigns`
**Fields:**
- `expert_profile_id` = `expertData.expert.id`
- `name` = `input.utm_source + ' - ' + input.utm_campaign`
- `utm_source` = `input.utm_source`
- `utm_campaign` = `input.utm_campaign`
- `utm_medium` = `input.utm_medium || null`
- `utm_content` = `input.utm_content || null`
- `status` = `"active"`

**Save as:** `campaign`

**IF FALSE:** Use existing
```javascript
var campaign = existingCampaigns[0]
return { campaign: campaign }
```
**Save as:** `campaignData`

#### Step 6: Custom Code - Hash Visitor IP
```javascript
// Get IP and user agent from request
var ipAddress = request.ip || 'unknown'
var userAgent = request.headers['user-agent'] || 'unknown'

// Create hash (Xano has crypto.hash function)
var visitorIpHash = crypto.hash(ipAddress + '_' + userAgent, 'sha256')

// Detect device type
var deviceType = 'unknown'
if (userAgent.match(/mobile/i)) {
  deviceType = 'mobile'
} else if (userAgent.match(/tablet/i)) {
  deviceType = 'tablet'
} else if (userAgent.match(/desktop|windows|mac/i)) {
  deviceType = 'desktop'
}

// Get country from Cloudflare header
var country = request.headers['cf-ipcountry'] || 'XX'

return {
  visitorIpHash: visitorIpHash,
  deviceType: deviceType,
  country: country,
  userAgent: userAgent
}
```
**Save as:** `visitorData`

#### Step 7: Insert - Log Visit
**Type:** Add Record
**Table:** `campaign_visits`
**Fields:**
- `campaign_id` = `campaign.id` (from step 5)
- `expert_profile_id` = `expertData.expert.id`
- `visitor_ip_hash` = `visitorData.visitorIpHash`
- `referrer` = `request.headers['referer'] || null`
- `user_agent` = `visitorData.userAgent`
- `country` = `visitorData.country`
- `device_type` = `visitorData.deviceType`
- `visited_at` = `now()`

**Save as:** `visit`

#### Step 8: Run Function - Update Metrics (Background)
**Type:** Run Function (Async)
**Function:** `update_campaign_metrics`
**Parameters:** `{ campaign_id: campaign.id }`

#### Step 9: Return Success
```javascript
return {
  tracked: true,
  campaign_id: campaign.id,
  visit_id: visit.id
}
```

### Testing
```bash
POST /public/track-visit
Content-Type: application/json

{
  "expert_handle": "yourhandle",
  "utm_source": "linkedin",
  "utm_campaign": "test_2025"
}
```

Expected: `{ tracked: true, campaign_id: 1, visit_id: 1 }`

---

## Verification Checklist

- [ ] All 6 endpoints created
- [ ] Environment variable `APP_URL` set
- [ ] All authenticated endpoints have auth middleware
- [ ] Public endpoint has no auth
- [ ] Test each endpoint with Postman/Thunder Client
- [ ] Verify responses match expected format

---

## Next Steps

Once all endpoints work:
→ **Proceed to Step 4:** Frontend Integration
