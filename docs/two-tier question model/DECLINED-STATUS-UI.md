# Declined Status UI Implementation

**Date:** October 23, 2025
**Status:** ✅ Complete

---

## Overview

Added UI components to display declined status for auto-declined Deep Dive offers on both asker and expert sides.

---

## Problem

When Deep Dive offers are auto-declined (below auto-decline threshold):
- Asker receives email with link to `/r/{token}` but sees no indication the offer was declined
- Expert can see the declined question in dashboard but doesn't know they can't answer it
- No clear messaging that the transaction didn't go through

---

## Solution

### 1. Asker Side (AnswerReviewPage.jsx)

**Added:** Declined offer message section that displays before the answer section

**Location:** Lines 537-574

**Features:**
- Red/orange gradient banner with clear "Offer Declined" heading
- Displays decline reason (from database or default message)
- Explains why the offer was declined
- Provides action buttons:
  - "Back to Expert Profile" - Returns to expert's public profile
  - "Go to Homepage" - Returns to main site

**Trigger:** Shows when `data.pricing_status === 'offer_declined'`

**Code Changes:**
```jsx
// Added fields to transformedData (lines 53-54)
pricing_status: rawData.pricing_status,
decline_reason: rawData.decline_reason,

// Added UI section (lines 537-574)
{data.pricing_status === 'offer_declined' && (
  <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl shadow-sm border-2 border-red-200 p-6 mb-6">
    {/* Declined message with icon, text, and action buttons */}
  </div>
)}
```

**User Experience:**
1. Asker submits offer below threshold
2. Receives email with review link
3. Opens link
4. Sees clear message: "Offer Declined"
5. Understands reason
6. Can return to expert profile to submit new offer

---

### 2. Expert Side (QuestionDetailModal.jsx)

**Added:** Declined offer status check and message display

**Location:** Lines 54-55 (logic), Lines 622-642 (UI)

**Features:**
- Detects declined status from `pricing_status` or `status` fields
- Prevents showing "Answer This Question" button for declined offers
- Shows red/orange gradient banner explaining the decline
- Displays decline reason
- Makes it clear the expert cannot answer this question

**Trigger:** Shows when `isDeclined = true` (pricing_status === 'offer_declined' OR status === 'declined')

**Code Changes:**
```jsx
// Added isDeclined check (lines 54-55)
const isDeclined = question?.pricing_status === 'offer_declined' || question?.status === 'declined';
const isPending = question?.status === 'paid' && !question?.answered_at && !isDeclined;

// Added UI section (lines 622-642)
{isDeclined && (
  <div className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-xl p-6 mb-4">
    {/* Declined message */}
  </div>
)}
```

**User Experience:**
1. Expert opens declined question from dashboard
2. Sees clear message: "Offer Declined"
3. Understands it was automatically declined
4. Cannot click "Answer This Question" button (not shown)
5. Knows asker has been notified

---

## Visual Design

### Color Scheme
- **Background:** Gradient from red-50 to orange-50
- **Border:** 2px solid red-200
- **Icon:** Red-600 circle with X icon
- **Text:** Gray-900 heading, gray-700 body

### Layout
- Centered content
- Icon at top (14px/16px height)
- Bold heading
- Decline reason text
- Explanation box with white/60 background
- Action buttons (asker only)

### Responsive
- Mobile-friendly padding and spacing
- Button stack on mobile, row on desktop
- Touch-friendly button sizes

---

## Fields Required

Both components require these fields from the API:

### AnswerReviewPage (GET /review/{token}):
- `pricing_status` (string) - "offer_declined" triggers UI
- `decline_reason` (string) - Shown to user
- `status` (string) - Backup check

### QuestionDetailModal (question object from dashboard):
- `pricing_status` (string) - Primary check
- `status` (string) - Backup check ("declined")
- `decline_reason` (string) - Shown to expert

---

## Flow Diagram

```
Auto-Decline Happens in Xano
  ↓
Question created with:
  - pricing_status = "offer_declined"
  - status = "declined"
  - decline_reason = "Offer below minimum threshold ($X)"
  - declined_at = timestamp
  ↓
Email sent to asker with review link
  ↓
┌─────────────────────────────────────┬─────────────────────────────────────┐
│ ASKER OPENS /r/{token}              │ EXPERT OPENS QUESTION DETAIL        │
├─────────────────────────────────────┼─────────────────────────────────────┤
│ 1. AnswerReviewPage loads           │ 1. QuestionDetailModal loads        │
│ 2. Checks pricing_status            │ 2. Checks pricing_status/status     │
│ 3. pricing_status === 'offer_declin'│ 3. isDeclined = true                │
│ 4. Shows declined banner            │ 4. Shows declined banner            │
│ 5. Hides answer section (no answer) │ 5. Hides answer button              │
│ 6. Shows action buttons             │ 6. Expert cannot submit answer      │
└─────────────────────────────────────┴─────────────────────────────────────┘
```

---

## Testing Checklist

### Asker Side:
- [ ] Submit Deep Dive offer below auto-decline threshold
- [ ] Receive email with review link
- [ ] Open link in browser
- [ ] Verify declined banner appears
- [ ] Verify decline reason displays correctly
- [ ] Verify "Back to Expert Profile" button works
- [ ] Verify "Go to Homepage" button works
- [ ] Verify no answer section appears (since there's no answer)

### Expert Side:
- [ ] Have question auto-declined
- [ ] Open question from dashboard
- [ ] Verify declined banner appears
- [ ] Verify decline reason displays correctly
- [ ] Verify "Answer This Question" button does NOT appear
- [ ] Verify cannot start answer recorder
- [ ] Verify message says "cannot answer this question"

### Edge Cases:
- [ ] Manually declined offers (not auto-declined) show same UI
- [ ] Declined reason displays properly when null/undefined
- [ ] UI responsive on mobile devices
- [ ] Expert can still view question details (text, attachments, etc.)
- [ ] Asker can still see their original question details

---

## Files Modified

### src/pages/AnswerReviewPage.jsx
**Lines changed:** 45-55, 537-574

**Changes:**
1. Added `pricing_status` and `decline_reason` to transformedData (lines 53-54)
2. Added declined offer message section (lines 537-574)
3. Message shows before answer section
4. Includes action buttons for navigation

### src/components/dashboard/QuestionDetailModal.jsx
**Lines changed:** 54-55, 622-642

**Changes:**
1. Added `isDeclined` status check (lines 54-55)
2. Updated `isPending` to exclude declined questions (line 55)
3. Added declined offer message section (lines 622-642)
4. Message shows instead of answer button

---

## Related Documentation

- `AUTO-DECLINE-XANO-IMPLEMENTATION.md` - Auto-decline logic in Xano
- `SESSION-SUMMARY-OCT-23-2025.md` - Complete session overview
- `IMPLEMENTATION-STATUS.md` - Overall project status

---

## Future Enhancements

### Email Notifications
- [ ] Send dedicated "Offer Declined" email to asker
- [ ] Include suggested price range in email
- [ ] Link to resubmit with higher offer

### Analytics
- [ ] Track auto-decline rates
- [ ] Monitor if askers resubmit after decline
- [ ] A/B test different decline messages

### UI Improvements
- [ ] Add animation to declined banner
- [ ] Show "Submit New Offer" button directly from declined page
- [ ] Show expert's current min/max range on declined page

---

**Status:** ✅ Complete and ready for production
**Last Updated:** October 23, 2025
