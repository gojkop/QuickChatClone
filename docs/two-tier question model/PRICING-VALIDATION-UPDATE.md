# Deep Dive Pricing Validation Update

**Date:** October 23, 2025
**Status:** Complete

---

## Overview

Updated the Deep Dive tier pricing validation to clarify that **min and max prices are suggestions**, not enforced limits. The only hard limit is the **auto-decline threshold**.

---

## Key Changes

### 1. Validation Logic (AskQuestionPage.jsx)

**Before:**
- Validated both minimum and maximum price
- Blocked submission if offer was outside min/max range
- Alert: "Offer must be between $X and $Y"

**After:**
- Only validates that a positive number is entered
- No min/max enforcement
- Auto-decline threshold is the only hard limit (checked after submission)

**File:** `src/pages/AskQuestionPage.jsx`
**Lines:** 117-126

```jsx
// Only validates positive number
if (tierType === 'deep_dive') {
  const priceValue = parseFloat(proposedPrice);
  if (!priceValue || priceValue <= 0) {
    alert('Please enter a valid offer amount');
    return;
  }
}
```

---

### 2. UI Text Updates

#### AskQuestionPage.jsx

**Banner Text (Line 401):**
- Before: "Price Range: $X - $Y"
- After: "**Suggested Range:** $X - $Y"

**Input Field (Lines 441-448):**
- Removed HTML `min` and `max` attributes
- Kept placeholder showing suggested range
- Helper text: "Suggested range: $X - $Y"

#### TierSelector.jsx

**Pricing Display (Line 140):**
- Before: "You propose • 48h after acceptance"
- After: "**Suggested range** • You propose • 48h after acceptance"

---

## Behavior Flow

### Scenario 1: Offer Below Auto-Decline Threshold
**Example:** User submits $40, auto-decline threshold is $50

1. ✅ Validation passes (positive number)
2. ✅ Question created in database
3. 🚫 **Automatically declined** by system
4. ❌ Expert never sees the offer

### Scenario 2: Offer Between Auto-Decline and Min Price
**Example:** User submits $55, auto-decline $50, min $70

1. ✅ Validation passes
2. ✅ Question created with `pricing_status = 'offer_pending'`
3. ✅ Appears in expert's **PendingOffersSection**
4. ✅ Expert can manually accept or decline

### Scenario 3: Offer Within Suggested Range
**Example:** User submits $80, range $70-$150

1. ✅ Validation passes
2. ✅ Question created with `pricing_status = 'offer_pending'`
3. ✅ Appears in expert's **PendingOffersSection**
4. ✅ Expert can manually accept or decline

### Scenario 4: Offer Above Max Price
**Example:** User submits $200, max $150

1. ✅ Validation passes (no max enforcement)
2. ✅ Question created with `pricing_status = 'offer_pending'`
3. ✅ Appears in expert's **PendingOffersSection**
4. ✅ Expert can manually accept or decline

---

## Auto-Decline Implementation

**When:** After question is successfully created
**Where:** `AskQuestionPage.jsx` lines 212-238

```jsx
if (tierType === 'deep_dive' && tierConfig?.auto_decline_below_cents) {
  const proposedPriceCents = Math.round(parseFloat(proposedPrice) * 100);
  const autoDeclineThreshold = tierConfig.auto_decline_below_cents;

  if (proposedPriceCents < autoDeclineThreshold) {
    // Automatically decline the offer
    await fetch(`/api/offers/${questionId}/decline`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        decline_reason: `Offer below minimum threshold ($${autoDeclineThreshold / 100})`
      }),
    });
  }
}
```

**Backend Endpoint:** `/api/offers/{id}/decline`
**Decline Reason:** "Offer below minimum threshold ($X)"

---

## Documentation Updates

### Updated Files

1. **TIER-FLOW-EXPLANATION.md**
   - Updated validation section (lines 143-160)
   - Added note: "Min and max prices are suggestions only"
   - Clarified auto-decline is the only hard limit

2. **AskQuestionPage.jsx**
   - Removed max price validation logic
   - Updated UI text to show "Suggested Range"
   - Removed HTML min/max input attributes

3. **TierSelector.jsx**
   - Added "Suggested range" label to pricing display

---

## User Experience

**For Askers:**
- See suggested price range as guidance
- Can submit any offer amount
- Offers below auto-decline threshold are immediately rejected
- All other offers go to expert for review

**For Experts:**
- Set auto-decline threshold to filter out low offers automatically
- Min/max range guides users but doesn't restrict them
- Can manually review and accept/decline any offer above threshold
- Maintains flexibility while reducing noise

---

## Testing Checklist

- [ ] Submit Deep Dive offer below auto-decline threshold
  - Expected: Question created and immediately declined
  - Expected: Does not appear in PendingOffersSection

- [ ] Submit Deep Dive offer between auto-decline and min price
  - Expected: Question created with `pricing_status = 'offer_pending'`
  - Expected: Appears in PendingOffersSection for expert review

- [ ] Submit Deep Dive offer within suggested range
  - Expected: Question created with `pricing_status = 'offer_pending'`
  - Expected: Appears in PendingOffersSection for expert review

- [ ] Submit Deep Dive offer above max price
  - Expected: Question created with `pricing_status = 'offer_pending'`
  - Expected: Appears in PendingOffersSection for expert review
  - Expected: No validation error

- [ ] Check UI text displays "Suggested Range" everywhere
  - Expected: "Suggested Range:" on AskQuestionPage banner
  - Expected: "Suggested range:" on input helper text
  - Expected: "Suggested range" on TierSelector

---

## Related Files

- `src/pages/AskQuestionPage.jsx` - Validation and auto-decline logic
- `src/components/pricing/TierSelector.jsx` - Tier selection UI
- `src/pages/PublicProfilePage.jsx` - Passes auto_decline_below_cents
- `docs/two-tier question model/TIER-FLOW-EXPLANATION.md` - Flow documentation

---

**Status:** ✅ Complete and ready for testing
**Last Updated:** October 23, 2025
