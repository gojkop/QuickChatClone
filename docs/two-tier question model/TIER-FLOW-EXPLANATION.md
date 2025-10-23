# Tier Information Flow - Question Submission

**Date:** October 22, 2025
**Purpose:** Explain how tier information (Quick Consult vs Deep Dive) is passed during question submission

---

## 📊 Flow Overview

```
1. User selects tier → PublicProfilePage
2. Navigate with state → AskQuestionPage
3. Submit to tier-specific endpoint → /api/questions/quick-consult or /api/questions/deep-dive
4. Backend creates question in Xano
```

---

## 🔄 Detailed Flow

### Step 1: Tier Selection (PublicProfilePage)

**Component:** `TierSelector.jsx`
**Location:** `/src/components/pricing/TierSelector.jsx`

When user clicks "Ask Question" or "Make Offer":

```jsx
// TierSelector.jsx - Line 79 (Quick Consult)
<button onClick={() => onSelectTier('quick_consult', quick_consult)}>
  Ask Question
</button>

// TierSelector.jsx - Line 149 (Deep Dive)
<button onClick={() => onSelectTier('deep_dive', deep_dive)}>
  Make Offer
</button>
```

**Parameters passed to `onSelectTier`:**
- `tierType`: String - `'quick_consult'` or `'deep_dive'`
- `tierConfig`: Object - Contains tier configuration:
  ```javascript
  // For Quick Consult:
  {
    enabled: true,
    price_cents: 5000,
    sla_hours: 24,
    description: "Fast & focused answers"
  }

  // For Deep Dive:
  {
    enabled: true,
    min_price_cents: 10000,
    max_price_cents: 50000,
    sla_hours: 48,
    description: "In-depth expert review"
  }
  ```

---

### Step 2: Navigation to AskQuestionPage

**File:** `PublicProfilePage.jsx`
**Function:** `handleSelectTier`
**Lines:** 612-633

```jsx
const handleSelectTier = (tierType, tierConfig) => {
  const navUrl = `/ask?expert=${handle}`;

  // Navigate with state containing tier information
  navigate(navUrl, {
    state: {
      expert: handle,
      expertProfileId: profile.id,
      expertName: profile.name,
      tierType,      // 'quick_consult' or 'deep_dive'
      tierConfig     // Full tier configuration object
    }
  });
};
```

**Navigation state contains:**
- `expert`: Expert handle (username)
- `expertProfileId`: Expert's profile ID
- `expertName`: Expert's display name
- `tierType`: `'quick_consult'` or `'deep_dive'`
- `tierConfig`: Full tier configuration

---

### Step 3: Receiving Tier Info in AskQuestionPage

**File:** `AskQuestionPage.jsx`
**Lines:** 24-26

```jsx
import { useLocation } from 'react-router-dom';

const location = useLocation();

// Extract tier information from navigation state
const tierInfo = location.state || {};
const { tierType, tierConfig } = tierInfo;
```

**Usage throughout the page:**

1. **Display correct SLA:**
   ```jsx
   // Line 316
   <p>They will respond within <strong>{tierConfig?.sla_hours || expert.sla_hours} hours</strong></p>
   ```

2. **Display correct price in info banner:**
   ```jsx
   // Lines 333-339
   Pay {
     tierType === 'quick_consult'
       ? formatPrice(tierConfig?.price_cents, expert.currency)
       : tierType === 'deep_dive' && proposedPrice
       ? `$${proposedPrice}`
       : formatPrice(expert.price_cents, expert.currency)
   }
   ```

3. **Show Deep Dive offer inputs (if applicable):**
   - Price proposal input
   - Message to expert input

---

### Step 4: Question Submission

**File:** `AskQuestionPage.jsx`
**Function:** `handleProceedToPayment`
**Lines:** 113-185

#### Validation (Deep Dive only):

```jsx
// Lines 117-126
if (tierType === 'deep_dive') {
  const priceValue = parseFloat(proposedPrice);

  // Validate offer amount is a valid positive number
  // Min/max prices are suggestions only, not enforced
  // Auto-decline threshold is the only hard limit (checked after submission)
  if (!priceValue || priceValue <= 0) {
    alert('Please enter a valid offer amount');
    return;
  }
}
```

**Important:** Min and max prices are displayed as **suggestions** to guide the user, but are **not enforced** as hard limits. The only hard limit is the auto-decline threshold - offers below this threshold are automatically declined after submission.

#### Base Payload (both tiers):

```jsx
// Lines 138-149
const basePayload = {
  expertHandle: expert.handle,
  title: questionData.title,
  text: questionData.text || null,
  payerEmail: askerInfo.email,
  payerFirstName: askerInfo.firstName || null,
  payerLastName: askerInfo.lastName || null,
  recordingSegments: questionData.recordingSegments || [],
  attachments: questionData.attachments || [],
  sla_hours_snapshot: tierConfig?.sla_hours || expert.sla_hours  // Tier-specific SLA
};
```

#### Tier-Specific Submission:

```jsx
// Lines 151-170
let payload;
let endpoint;

if (tierType === 'deep_dive') {
  // Deep Dive specific fields
  payload = {
    ...basePayload,
    proposed_price_cents: Math.round(parseFloat(proposedPrice) * 100),
    asker_message: askerMessage || null,
    stripe_payment_intent_id: 'pi_mock_' + Date.now(),
  };
  endpoint = '/api/questions/deep-dive';

} else {
  // Quick Consult (default)
  payload = {
    ...basePayload,
    stripe_payment_intent_id: 'pi_mock_' + Date.now(),
  };
  endpoint = '/api/questions/quick-consult';
}

// Submit to tier-specific endpoint
const response = await fetch(endpoint, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
});
```

---

## 🎯 Key Decision Points

### 1. **How do we know which tier?**
**Answer:** Check `tierType` variable from `location.state`

```jsx
if (tierType === 'deep_dive') {
  // Deep Dive flow
} else {
  // Quick Consult flow (default)
}
```

### 2. **Where do tier-specific values come from?**
**Answer:** From `tierConfig` object in `location.state`

```jsx
const sla = tierConfig?.sla_hours || expert.sla_hours;  // Fallback to expert default
const price = tierConfig?.price_cents;
const minPrice = tierConfig?.min_price_cents;
const maxPrice = tierConfig?.max_price_cents;
```

### 3. **What if user navigates directly to /ask without selecting tier?**
**Answer:** Falls back to Quick Consult with expert's default values

```jsx
const tierInfo = location.state || {};  // Empty object if no state
const { tierType, tierConfig } = tierInfo;  // Both undefined if no state

// Later in code:
endpoint = tierType === 'deep_dive'
  ? '/api/questions/deep-dive'
  : '/api/questions/quick-consult';  // Default to Quick Consult
```

---

## 📋 Backend Endpoints

### Quick Consult Endpoint

**Endpoint:** `POST /api/questions/quick-consult`
**File:** `/api/questions/quick-consult.js`

**Payload:**
```json
{
  "expertHandle": "john-doe",
  "title": "Question title",
  "text": "Question text",
  "payerEmail": "user@example.com",
  "payerFirstName": "John",
  "payerLastName": "Doe",
  "recordingSegments": [],
  "attachments": [],
  "sla_hours_snapshot": 24,
  "stripe_payment_intent_id": "pi_mock_12345"
}
```

**Creates question with:**
- `question_tier = 'quick_consult'`
- `pricing_status = 'paid'`
- `status = 'paid'`
- `final_price_cents = tier1_price_cents`
- `sla_hours_snapshot = tier1_sla_hours`

---

### Deep Dive Endpoint

**Endpoint:** `POST /api/questions/deep-dive`
**File:** `/api/questions/deep-dive.js`

**Payload:**
```json
{
  "expertHandle": "john-doe",
  "title": "Question title",
  "text": "Question text",
  "payerEmail": "user@example.com",
  "payerFirstName": "John",
  "payerLastName": "Doe",
  "recordingSegments": [],
  "attachments": [],
  "sla_hours_snapshot": 48,
  "proposed_price_cents": 15000,
  "asker_message": "This is urgent, I need detailed review",
  "stripe_payment_intent_id": "pi_mock_12345"
}
```

**Creates question with:**
- `question_tier = 'deep_dive'`
- `pricing_status = 'offer_pending'`
- `status = 'pending'`
- `proposed_price_cents = 15000`
- `asker_message = "This is urgent..."`
- `offer_expires_at = Date.now() + 72 hours`
- `sla_hours_snapshot = tier2_sla_hours`

---

## 🔍 Debugging Tier Flow

### Check navigation state in console:

```javascript
// PublicProfilePage.jsx - Line 613
console.log('🔍 handleSelectTier called:', { tierType, tierConfig, handle });

// AskQuestionPage.jsx - Line 43
console.log('🔍 AskQuestionPage - location.state:', location.state);

// AskQuestionPage.jsx - Lines 172-177
console.log('Submitting question with payload:', {
  tierType: tierType || 'legacy',
  endpoint,
  recordingSegments: payload.recordingSegments.length + ' segments',
  attachments: payload.attachments.length + ' attachments'
});
```

### Check in browser DevTools:

1. **Network tab:**
   - Look for POST request to `/api/questions/quick-consult` or `/api/questions/deep-dive`
   - Check request payload contains tier-specific fields

2. **Console:**
   - Look for debug logs showing tier selection
   - Verify `tierType` and `tierConfig` are set

3. **React DevTools:**
   - Inspect AskQuestionPage component state
   - Check `location.state` contains tier info

---

## ⚠️ Common Issues

### Issue 1: Tier not passed after navigation

**Symptom:** `tierType` is undefined in AskQuestionPage

**Causes:**
- Direct navigation to `/ask` without going through PublicProfilePage
- Browser back/forward navigation (state lost)
- Page refresh (state lost)

**Solution:** Always falls back to Quick Consult if no tier specified

---

### Issue 2: Wrong endpoint called

**Symptom:** Question created with wrong tier in database

**Cause:** Logic checks `tierType === 'deep_dive'` - any other value defaults to Quick Consult

**Verify:**
```jsx
// Should be exactly 'deep_dive' (lowercase, underscore)
if (tierType === 'deep_dive') {
  // Deep Dive flow
}
```

---

### Issue 3: Tier config missing values

**Symptom:** Validation fails or wrong SLA/price shown

**Cause:** `tierConfig` object incomplete or undefined

**Solution:** Always use fallback pattern:
```jsx
const sla = tierConfig?.sla_hours || expert.sla_hours;
const price = tierConfig?.price_cents || expert.price_cents;
```

---

## 🎯 Summary

**Tier information flows via React Router navigation state:**

1. ✅ User selects tier → `onSelectTier('quick_consult'|'deep_dive', config)`
2. ✅ Navigate with state → `navigate('/ask', { state: { tierType, tierConfig } })`
3. ✅ Extract state → `const { tierType, tierConfig } = location.state || {}`
4. ✅ Submit to endpoint → `/api/questions/quick-consult` or `/api/questions/deep-dive`
5. ✅ Backend creates question with correct `question_tier` field

**Key variables:**
- `tierType`: String - `'quick_consult'` or `'deep_dive'`
- `tierConfig`: Object - Contains `price_cents`, `sla_hours`, `min_price_cents`, `max_price_cents`

**Fallback behavior:**
- No state = defaults to Quick Consult
- Missing config values = falls back to `expert.price_cents`/`expert.sla_hours`

---

**Last Updated:** October 22, 2025
**Status:** Complete and working in production
