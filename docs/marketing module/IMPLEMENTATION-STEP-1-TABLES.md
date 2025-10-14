# Marketing Module - Step 1: Database Tables

## Table 1: utm_campaigns

### Purpose
Stores marketing campaigns with UTM parameters and aggregated metrics.

### How to Create
1. Go to Xano → **Database** → **Add Table**
2. Name: `utm_campaigns`

### Fields

| Field Name | Type | Configuration | Notes |
|------------|------|---------------|-------|
| `id` | int | Primary Key, Auto-increment | |
| `expert_profile_id` | int | Required | **Add Relationship:** `expert_profile.id` (CASCADE on delete) |
| `name` | text | Required, Max: 255 | Campaign display name |
| `url_slug` | text | Optional, Max: 100 | Custom slug for URLs |
| `utm_source` | text | Max: 100 | e.g., "linkedin", "twitter" |
| `utm_medium` | text | Max: 100 | e.g., "social", "email" |
| `utm_campaign` | text | Max: 100 | e.g., "q4_launch" |
| `utm_content` | text | Max: 255 | Optional content parameter |
| `utm_term` | text | Max: 255 | Optional term parameter |
| `status` | text | Default: `"active"` | "active", "paused", "archived" |
| `total_visits` | int | Default: `0` | Aggregated visit count |
| `total_questions` | int | Default: `0` | Aggregated question count |
| `total_revenue_cents` | int | Default: `0` | Total revenue in cents |
| `conversion_rate` | decimal | Precision: 5, Scale: 2, Default: `0.00` | Percentage (e.g., 4.25) |
| `created_at` | timestamp | Default: `now()` | |
| `updated_at` | timestamp | Default: `now()` | |
| `last_visit_at` | timestamp | Nullable | Last visit timestamp |

### Indexes
**IMPORTANT:** Add these indexes for performance:

1. **Simple Index:** `expert_profile_id`
2. **Simple Index:** `status`
3. **Composite Index:** `expert_profile_id` + `status`
4. **Unique Composite:** `expert_profile_id` + `utm_source` + `utm_campaign`

### How to Add Indexes
1. Click table → **Settings** → **Indexes**
2. Add each index listed above

---

## Table 2: campaign_visits

### Purpose
Tracks individual visits from campaigns for attribution.

### How to Create
1. Go to Xano → **Database** → **Add Table**
2. Name: `campaign_visits`

### Fields

| Field Name | Type | Configuration | Notes |
|------------|------|---------------|-------|
| `id` | int | Primary Key, Auto-increment | |
| `campaign_id` | int | Required | **Add Relationship:** `utm_campaigns.id` (CASCADE on delete) |
| `expert_profile_id` | int | Required | **Add Relationship:** `expert_profile.id` (CASCADE on delete) |
| `visitor_ip_hash` | text | Max: 64 | Hashed for privacy (SHA-256) |
| `referrer` | text | Long text | Full referrer URL |
| `user_agent` | text | Long text | Browser user agent |
| `country` | text | Max: 2 | ISO country code (e.g., "US") |
| `device_type` | text | Default: `"unknown"` | "mobile", "tablet", "desktop", "unknown" |
| `converted_to_question` | boolean | Default: `false` | True if visitor asked a question |
| `question_id` | int | Nullable | **Add Relationship:** `question.id` (SET NULL on delete) |
| `visited_at` | timestamp | Default: `now()` | |

### Indexes
**IMPORTANT:** Add these indexes for performance:

1. **Simple Index:** `campaign_id`
2. **Simple Index:** `expert_profile_id`
3. **Simple Index:** `visited_at` (DESC order)
4. **Simple Index:** `visitor_ip_hash`
5. **Composite Index:** `converted_to_question` + `visited_at`
6. **Composite Index:** `campaign_id` + `visited_at`

---

## Verification Checklist

After creating both tables:

- [ ] `utm_campaigns` table exists with all 16 fields
- [ ] `campaign_visits` table exists with all 11 fields
- [ ] All relationships are configured (CASCADE, SET NULL)
- [ ] All indexes are added
- [ ] Test by manually creating 1 test campaign record
- [ ] Test by manually creating 1 test visit record

---

## Sample Test Data

### Test Campaign (utm_campaigns)
```
name: "Test LinkedIn Post"
expert_profile_id: [your expert profile ID]
utm_source: "linkedin"
utm_campaign: "test_2025"
utm_medium: "social"
status: "active"
```

### Test Visit (campaign_visits)
```
campaign_id: [ID from campaign above]
expert_profile_id: [your expert profile ID]
visitor_ip_hash: "test_hash_123"
device_type: "desktop"
visited_at: now()
```

---

## Next Steps

Once tables are created and verified:
→ **Proceed to Step 2:** Build Xano Functions
