# Xano Endpoint Update Guide - filter_type Support

## Current Issue
The frontend is sending `filter_type=pending/answered/all` but Xano returns 400 error because it doesn't recognize this parameter.

## Quick Fix Applied
Frontend now uses a temporary solution:
- Pending: `status=paid` (then filters client-side)
- Answered/All: Fetches all (filters client-side)

**Problem**: Pagination counts are inaccurate for Answered/All tabs.

## Proper Fix - Update Xano Endpoint

### Step 1: Update Input Parameters

In your `/me/questions` endpoint, add this input parameter:

**Name**: `filter_type`
**Type**: text
**Required**: No (optional)
**Filters**: trim

### Step 2: Update Function to Use filter_type

Once you update the endpoint to use the enhanced code, update the frontend by replacing this:

```javascript
// REMOVE THIS (temporary):
if (tab === 'pending') {
  params.append('status', 'paid');
}
```

**With this**:

```javascript
// ADD THIS (final):
params.append('filter_type', tab);
```

**Location**: `src/pages/ExpertDashboardPage.jsx`, line ~287

### Step 3: Remove Client-Side Filtering

Once Xano handles filtering server-side, replace the `tabFilteredQuestions` logic:

```javascript
// REMOVE THIS (temporary client-side filtering):
const tabFilteredQuestions = useMemo(() => {
  const safeQuestions = Array.isArray(allQuestions) ? allQuestions : [];
  let filtered = safeQuestions.filter(q => q.pricing_status !== 'offer_pending');

  if (activeTab === 'pending') {
    filtered = filtered.filter(q => {
      const isUnanswered = !q.answered_at;
      const isNotDeclined = q.pricing_status !== 'offer_declined' && q.status !== 'declined';
      const isNotHidden = q.hidden !== true;
      return isUnanswered && isNotDeclined && isNotHidden;
    });
  } else if (activeTab === 'answered') {
    filtered = filtered.filter(q =>
      q.status === 'closed' || q.status === 'answered' || q.answered_at
    );
  } else if (activeTab === 'all') {
    if (!showHidden) {
      filtered = filtered.filter(q => !q.hidden);
    }
  }

  return filtered;
}, [allQuestions, activeTab, showHidden]);
```

**With this** (simple, server does the work):

```javascript
const tabFilteredQuestions = useMemo(() => {
  const safeQuestions = Array.isArray(allQuestions) ? allQuestions : [];

  // For 'all' tab, respect the showHidden toggle
  if (activeTab === 'all' && !showHidden) {
    return safeQuestions.filter(q => !q.hidden);
  }

  // Questions are already filtered server-side
  return safeQuestions;
}, [allQuestions, activeTab, showHidden]);
```

## Testing After Update

1. **Test Pending Tab**:
   ```bash
   curl -H "Authorization: Bearer TOKEN" \
     "https://xlho-4syv-navp.n7e.xano.io/api:3B14WLbJ/me/questions?filter_type=pending&page=1&per_page=10"
   ```
   Should return only unanswered paid questions with accurate total count.

2. **Test Answered Tab**:
   ```bash
   curl -H "Authorization: Bearer TOKEN" \
     "https://xlho-4syv-navp.n7e.xano.io/api:3B14WLbJ/me/questions?filter_type=answered&page=1&per_page=10"
   ```
   Should return only answered questions with accurate total count.

3. **Test All Tab**:
   ```bash
   curl -H "Authorization: Bearer TOKEN" \
     "https://xlho-4syv-navp.n7e.xano.io/api:3B14WLbJ/me/questions?filter_type=all&page=1&per_page=10"
   ```
   Should return all questions with accurate total count.

4. **In Browser**:
   - Navigate to `/expert`
   - Check that each tab shows correct count
   - Verify pagination shows correct total pages
   - Navigate between pages - should load server data
   - Switch tabs - should refetch with correct filter

## Expected Behavior After Fix

- **Pending (45 questions total)**:
  - Shows 10 at a time
  - Badge: "Pending (45)"
  - Pagination: "Page 1 of 5"
  - All 45 are navigable through pagination

- **Answered (120 questions total)**:
  - Shows 10 at a time
  - Badge: "Answered (120)"
  - Pagination: "Page 1 of 12"
  - All 120 are navigable

- **All (200 questions total)**:
  - Shows 10 at a time
  - Badge: "All (200)"
  - Pagination: "Page 1 of 20"
  - All 200 are navigable
