# Marketing Module - Step 4: Frontend Integration

## Overview
Connect the frontend to the real APIs and add UTM tracking.

---

## Part 1: Add UTM Tracking to Public Profile Page

### File: `src/pages/PublicProfilePage.jsx`

### What to Add
Insert this code at **line 465** (inside the main `useEffect`, right after `fetchPublicProfile()` is called):

```javascript
useEffect(() => {
  if (!handle) {
    setIsLoading(false);
    setError('No expert handle provided.');
    return;
  }

  // ... existing fetchPublicProfile code ...

  fetchPublicProfile();

  // ⭐ ADD THIS: UTM Tracking
  const trackUTMVisit = async () => {
    const searchParams = new URLSearchParams(window.location.search);
    const utmParams = {
      expert_handle: handle,
      utm_source: searchParams.get('utm_source'),
      utm_campaign: searchParams.get('utm_campaign'),
      utm_medium: searchParams.get('utm_medium'),
      utm_content: searchParams.get('utm_content')
    };

    // Only track if utm_source and utm_campaign exist
    if (utmParams.utm_source && utmParams.utm_campaign) {
      try {
        // Fire and forget (don't block page load)
        await fetch('https://xlho-4syv-navp.n7e.xano.io/api:BQW1GS7L/marketing/public/track-visit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(utmParams)
        });

        // Store in localStorage for attribution when question is created
        localStorage.setItem('qc_utm_params', JSON.stringify(utmParams));
        localStorage.setItem('qc_utm_timestamp', Date.now().toString());
      } catch (err) {
        // Silently fail - tracking is not critical
        console.log('UTM tracking failed:', err);
      }
    }
  };

  trackUTMVisit();
}, [handle]);
```

### Why This Works
- Detects UTM parameters from URL (e.g., `?utm_source=linkedin&utm_campaign=q4`)
- Calls public tracking endpoint (no auth required)
- Stores params in `localStorage` for later attribution
- Doesn't block page load (fire-and-forget)

---

## Part 2: Link Questions to Campaigns

### File: `src/pages/AskQuestionPage.jsx` (or wherever questions are created)

### What to Add
After successfully creating a question, add this code:

```javascript
// After question created successfully:
const linkQuestionToCampaign = async (questionId) => {
  // Check if user came from a campaign
  const storedUtm = localStorage.getItem('qc_utm_params');
  const storedTimestamp = localStorage.getItem('qc_utm_timestamp');

  if (!storedUtm || !storedTimestamp) return;

  // Check if UTM is still valid (within 1 hour)
  const oneHourAgo = Date.now() - (60 * 60 * 1000);
  if (parseInt(storedTimestamp) < oneHourAgo) {
    localStorage.removeItem('qc_utm_params');
    localStorage.removeItem('qc_utm_timestamp');
    return;
  }

  try {
    const utmParams = JSON.parse(storedUtm);

    // Generate visitor hash (same logic as tracking)
    const visitorString = navigator.userAgent + window.screen.width;
    const encoder = new TextEncoder();
    const data = encoder.encode(visitorString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const visitorIpHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Call Xano function to link question to campaign
    await apiClient.post('/marketing/link-question', {
      question_id: questionId,
      visitor_ip_hash: visitorIpHash,
      expert_profile_id: expertProfileId // Get from question context
    });

    // Clear UTM data after linking
    localStorage.removeItem('qc_utm_params');
    localStorage.removeItem('qc_utm_timestamp');
  } catch (err) {
    console.error('Failed to link question to campaign:', err);
  }
};

// Call after question creation:
linkQuestionToCampaign(newQuestion.id);
```

### Alternative: Create Endpoint Wrapper

If you prefer, create a dedicated endpoint in Xano that accepts the question ID and handles the hash logic server-side:

**Endpoint:** `POST /marketing/link-question`
**Inputs:** `question_id`, `visitor_ip_hash`, `expert_profile_id`
**Logic:** Calls `link_question_to_campaign()` function

---

## Part 3: Update useMarketing Hook

### File: `src/hooks/useMarketing.js`

### Changes to Make

#### 1. Remove Mock Data Fallbacks

**Before:**
```javascript
catch (err) {
  console.error('Failed to fetch campaigns:', err);
  setCampaigns([/* mock data */]);
}
```

**After:**
```javascript
catch (err) {
  console.error('Failed to fetch campaigns:', err);
  setCampaigns([]);
  setError('Could not load campaigns. Please try again.');
}
```

Apply this pattern to all fetch functions:
- `fetchCampaigns()`
- `fetchTrafficSources()`
- `fetchShareTemplates()`
- `fetchInsights()`

#### 2. Update API Base URL (if needed)

Verify that `apiClient` in `src/api/index.js` is configured with the correct Xano base URL:

```javascript
const apiClient = axios.create({
  baseURL: 'https://your-xano-base-url.com/api:KEY',
  headers: {
    'Content-Type': 'application/json'
  }
});
```

---

## Part 4: Test the Complete Flow

### Test 1: UTM Tracking
1. Create a test campaign in Xano (manually or via API)
2. Visit public profile with UTM params:
   ```
   http://localhost:5173/u/yourhandle?utm_source=linkedin&utm_campaign=test_2025
   ```
3. Check browser console - should see no errors
4. Check `campaign_visits` table in Xano - should see new row
5. Check `localStorage` - should see `qc_utm_params` stored

### Test 2: Campaign Creation
1. Sign in as an expert
2. Navigate to `/expert/marketing`
3. Click "Create Campaign"
4. Fill form:
   - Name: "Test LinkedIn Post"
   - Source: "linkedin"
   - Campaign: "test_2025"
5. Submit
6. Verify campaign appears in list with generated URL

### Test 3: Question Attribution
1. Visit profile with UTM (as in Test 1)
2. Click "Ask Your Question"
3. Record and submit question
4. Check `campaign_visits` table - `converted_to_question` should be `true`
5. Check `utm_campaigns` table - metrics should update

### Test 4: Marketing Dashboard
1. Navigate to `/expert/marketing`
2. Verify all 4 tabs load without errors:
   - Overview (shows metrics)
   - Campaigns (shows list)
   - Traffic Sources (shows pie chart)
   - Share Kit (shows templates)

---

## Part 5: Error Handling

### Add Loading States

Update `MarketingLayout.jsx` to handle empty states:

```javascript
{campaigns.length === 0 && !isLoading && (
  <div className="text-center py-12">
    <p className="text-gray-500 mb-4">No campaigns yet</p>
    <button className="btn btn-primary">Create Your First Campaign</button>
  </div>
)}
```

### Add Error Messages

In `useMarketing.js`, display errors to user:

```javascript
const [error, setError] = useState(null);

// In fetch functions:
catch (err) {
  setError('Failed to load data. Please refresh.');
  console.error(err);
}

// In component:
{error && (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
    <p className="text-red-800">{error}</p>
  </div>
)}
```

---

## Part 6: Enable Feature Flag

### In Admin Panel (or Xano)
1. Set `marketing_module` feature flag to `true` for beta users
2. Test with your expert account
3. Gradually roll out to more users

---

## Deployment Checklist

### Before Production:
- [ ] All Xano endpoints tested with Postman
- [ ] UTM tracking works on staging
- [ ] Question attribution verified
- [ ] Marketing dashboard loads without errors
- [ ] Mock data removed from `useMarketing.js`
- [ ] Error handling implemented
- [ ] Feature flag configured
- [ ] Environment variable `APP_URL` set correctly

### After Deployment:
- [ ] Test complete flow on production
- [ ] Monitor error logs for 24 hours
- [ ] Check campaign metrics update correctly
- [ ] Verify UTM URLs generate correctly
- [ ] Test on mobile devices

---

## Troubleshooting

### Campaign URLs Not Generating
**Issue:** URLs show as `undefined/u/handle`
**Fix:** Check environment variable `APP_URL` is set in Xano Settings

### UTM Tracking Not Working
**Issue:** No visits logged in `campaign_visits`
**Fix:**
1. Check `/marketing/public/track-visit` endpoint has no auth
2. Verify CORS is enabled for your domain
3. Check browser console for errors

### Metrics Not Updating
**Issue:** Campaign metrics stay at 0 after visits
**Fix:**
1. Verify `update_campaign_metrics()` function runs
2. Check function has correct relationships loaded
3. Test function manually in Xano debugger

### Questions Not Linking to Campaigns
**Issue:** `converted_to_question` stays `false`
**Fix:**
1. Check `localStorage` has `qc_utm_params` stored
2. Verify `link_question_to_campaign()` is called
3. Check visitor_ip_hash matches between visit and question creation

---

## Performance Optimization

### Cache Dashboard Data
Add caching to `useMarketing.js`:

```javascript
const CACHE_DURATION = 30000; // 30 seconds
let lastFetch = 0;

const fetchCampaigns = async () => {
  const now = Date.now();
  if (now - lastFetch < CACHE_DURATION) {
    return; // Use cached data
  }
  lastFetch = now;
  // ... fetch logic
};
```

### Lazy Load Marketing Page
In `App.jsx`:

```javascript
const ExpertMarketingPage = React.lazy(() => import('@/pages/ExpertMarketingPage'));
```

---

## Next Steps

Once frontend integration is complete:
→ **Test complete flow end-to-end**
→ **Enable for beta users**
→ **Monitor metrics and gather feedback**
→ **Plan Phase 2 features** (see updated-marketing-spec.md)

---

## Success Metrics

Track these in first week:
- [ ] Campaigns created per expert
- [ ] UTM visits tracked
- [ ] Questions attributed to campaigns
- [ ] Dashboard page views
- [ ] Error rate < 1%

Target for MVP launch:
- 5+ experts actively using marketing module
- 50+ campaigns created
- 500+ UTM visits tracked
- 20+ questions attributed to campaigns
- 80%+ positive feedback
