# Frontend Implementation Complete - Two-Tier Question Model

**Date:** October 22, 2025
**Status:** ✅ Frontend Complete - All 6 Components Built and Integrated

---

## 🎉 Summary

The frontend implementation for the two-tier question pricing system is now **100% complete**. All 6 planned components have been built, integrated, and are ready for testing.

---

## ✅ Components Implemented

### 1. TierSelector Component ⭐
**File:** `/src/components/pricing/TierSelector.jsx`

**Features:**
- Side-by-side pricing cards (Quick Consult & Deep Dive)
- Responsive design (grid on desktop, stacked on mobile)
- Color-coded: Blue for Quick Consult (⚡), Purple for Deep Dive (🎯)
- Dynamic pricing display from API
- Feature lists with checkmarks
- Hover effects and animations
- Help text for users unsure which to choose

**Props:**
```javascript
{
  tiers: {
    quick_consult: { enabled, price_cents, sla_hours, description },
    deep_dive: { enabled, min_price_cents, max_price_cents, sla_hours, description }
  },
  expertName: string,
  onSelectTier: (tierType, tierConfig) => void
}
```

---

### 2. PublicProfilePage Integration ✅
**File:** `/src/pages/PublicProfilePage.jsx`

**Changes:**
- Replaced single "Ask Question" button with TierSelector component
- Added `handleSelectTier` function to navigate with tier state
- Desktop: Shows TierSelector when tiers enabled
- Mobile: Shows TierSelector inline (not sticky footer)
- Fallback button shown when expert not accepting questions

**Navigation State Passed:**
```javascript
{
  expert: handle,
  expertProfileId: profile.id,
  expertName: profile.name,
  tierType: 'quick_consult' | 'deep_dive',
  tierConfig: { price_cents, sla_hours, ... }
}
```

---

### 3. AskQuestionPage / QuestionComposer Extension ✅
**File:** `/src/pages/AskQuestionPage.jsx`

**Features Added:**
- **Tier Information Banner** - Shows selected tier details (price, SLA)
- **Deep Dive Offer Section**:
  - Price input with min/max validation
  - Message to expert textarea (optional)
  - Auto-validation on submit
- **Smart Endpoint Routing** - Calls correct API based on tier type
- **Payload Construction** - Includes tier-specific fields

**Deep Dive Validation:**
- Price must be entered
- Price must be within range (min - max)
- Shows helpful error messages

**API Endpoints Called:**
- Quick Consult: `/api/questions/quick-consult`
- Deep Dive: `/api/questions/deep-dive`

---

### 4. ExpertSettings Pricing Configuration ✅
**File:** `/src/components/dashboard/SettingsModal.jsx`

**Features:**
- **Two Collapsible Sections:**
  - Quick Consult (Tier 1) - Blue themed
  - Deep Dive (Tier 2) - Purple themed
- **Enable/Disable Toggles** for each tier
- **Quick Consult Fields:**
  - Fixed price ($)
  - Response time (hours)
  - Description (optional)
- **Deep Dive Fields:**
  - Min price ($)
  - Max price ($)
  - Response time (hours)
  - Auto-decline threshold ($ - optional)
  - Description (optional)
- **Comprehensive Validation:**
  - At least one tier must be enabled
  - Price validations (> $0, min < max)
  - SLA validation (≥ 1 hour)
  - Auto-decline ≤ min price
- **Backward Compatibility:**
  - Saves legacy `price_cents` and `sla_hours` fields
  - Uses Tier 1 values if enabled, else Tier 2 min values

**Data Flow:**
- Loads tier data from ExpertDashboardPage profile state
- Converts cents ↔ dollars automatically
- Saves via existing `/me/profile` endpoint

---

### 5. PendingOffersSection Component ✅
**File:** `/src/components/dashboard/PendingOffersSection.jsx`

**Features:**
- **Displays Pending Deep Dive Offers:**
  - Question title
  - Proposed price (formatted)
  - Time remaining (countdown with auto-refresh)
  - Asker's message (if provided)
  - Question preview
- **Actions:**
  - Accept button (green) - Confirms and starts SLA
  - Decline button (white) - Prompts for reason
- **States:**
  - Loading spinner while fetching
  - Empty state when no offers
  - Error state with retry button
- **Auto-refresh:** Polls every 30 seconds
- **Integration:** Calls `onOfferUpdate()` callback to refresh questions

**API Endpoints Used:**
- GET `/api/expert/pending-offers`
- POST `/api/offers/{id}/accept`
- POST `/api/offers/{id}/decline`

**Integration:**
- Added to ExpertDashboardPage above QuestionTable
- Passes `fetchQuestions` as `onOfferUpdate` callback

---

### 6. QuestionTable Tier Indicators ✅
**File:** `/src/components/dashboard/QuestionTable.jsx`

**Features:**
- **TierBadge Component:**
  - ⚡ Quick (blue badge) for `quick_consult`
  - 🎯 Deep (purple badge) for `deep_dive`
  - Tooltips on hover explaining tier
- **Desktop View:**
  - Badge appears in Status column below status badge
  - Stacked layout (status on top, tier below)
- **Mobile View:**
  - Badge appears inline with status badge
  - Flex-wrap layout for responsiveness
- **Graceful Handling:**
  - Returns null for legacy questions (no tier)
  - Returns null for unrecognized tier types

**Visual Design:**
- Consistent colors with rest of app (blue/purple)
- Compact size (text-xs)
- Border matching background color
- Icons + text labels

---

## 🔌 API Endpoints Created (Frontend-facing)

### Question Submission:
1. **POST `/api/questions/quick-consult`**
   - Accepts: expert handle, question data, payment intent ID
   - Returns: question ID, status, SLA deadline, final price

2. **POST `/api/questions/deep-dive`**
   - Accepts: expert handle, question data, proposed price, asker message, payment intent ID
   - Returns: question ID, status, offer expiration time

### Offer Management:
3. **GET `/api/expert/pending-offers`**
   - Returns: array of pending offers with details

4. **POST `/api/offers/{id}/accept`**
   - Returns: success, updated status, SLA deadline

5. **POST `/api/offers/{id}/decline`**
   - Accepts: optional decline reason
   - Returns: success, refund status

---

## 📐 Component Architecture

```
PublicProfilePage
  └─ TierSelector
       ├─ Quick Consult Card
       └─ Deep Dive Card
            ↓ (user selects tier)
       navigate to AskQuestionPage with state

AskQuestionPage
  ├─ Tier Information Banner
  ├─ QuestionComposer (existing)
  ├─ Deep Dive Offer Section (conditional)
  └─ Continue Button
       ↓ (submits to tier-specific endpoint)

ExpertDashboardPage
  ├─ SettingsModal
  │    └─ Pricing Tiers Section
  │         ├─ Quick Consult Config
  │         └─ Deep Dive Config
  ├─ PendingOffersSection
  │    └─ Offer Cards (Accept/Decline)
  └─ QuestionTable
       └─ TierBadge (per question)
```

---

## 🎨 Design System

### Colors:
- **Quick Consult:** Blue (#3B82F6 - Tailwind blue-600)
- **Deep Dive:** Purple (#8B5CF6 - Tailwind purple-600)

### Icons:
- **Quick Consult:** ⚡ Lightning bolt (fast, immediate)
- **Deep Dive:** 🎯 Target (focused, comprehensive)

### Typography:
- Headers: font-bold
- Prices: text-3xl font-bold
- Descriptions: text-sm text-gray-600
- Labels: text-xs font-medium

---

## 🔄 Data Flow

### Question Submission Flow:

**Quick Consult:**
```
1. User clicks "Ask Question" on TierSelector
2. Navigate to /ask with tierType='quick_consult'
3. AskQuestionPage shows tier banner
4. User composes question
5. User clicks "Continue to Review"
6. Review modal → Proceed to Payment
7. POST /api/questions/quick-consult
   - Includes stripe_payment_intent_id (mock for now)
8. Question created with status='paid'
9. Expert sees in QuestionTable with ⚡ badge
```

**Deep Dive:**
```
1. User clicks "Make Offer" on TierSelector
2. Navigate to /ask with tierType='deep_dive'
3. AskQuestionPage shows tier banner + offer section
4. User enters offer amount & optional message
5. User composes question
6. User clicks "Continue to Review"
7. Validate offer within range
8. Review modal → Proceed to Payment
9. POST /api/questions/deep-dive
   - Includes proposed_price_cents, asker_message
10. Question created with status='offer_pending'
11. Expert sees in PendingOffersSection
12. Expert clicks "Accept"
13. POST /api/offers/{id}/accept
14. Question moves to QuestionTable with 🎯 badge
```

---

## 🧪 Testing Checklist

### Quick Consult Flow:
- [ ] Tier selector shows Quick Consult when enabled
- [ ] Can select Quick Consult and navigate to /ask
- [ ] Tier banner shows correct price and SLA
- [ ] Can submit question
- [ ] Question appears in expert's queue with ⚡ badge
- [ ] Status shows "Pending"

### Deep Dive Flow:
- [ ] Tier selector shows Deep Dive when enabled
- [ ] Can select Deep Dive and navigate to /ask
- [ ] Tier banner shows price range
- [ ] Offer section appears with price input
- [ ] Validation works (min/max range)
- [ ] Can submit offer with message
- [ ] Offer appears in PendingOffersSection
- [ ] Countdown timer updates
- [ ] Can accept offer
- [ ] Question moves to queue with 🎯 badge
- [ ] Can decline offer
- [ ] Decline reason prompt appears

### Expert Settings:
- [ ] Can enable/disable Quick Consult
- [ ] Can set Quick Consult price and SLA
- [ ] Can enable/disable Deep Dive
- [ ] Can set Deep Dive price range and SLA
- [ ] Can set auto-decline threshold
- [ ] Validation prevents invalid configs
- [ ] "At least one tier enabled" validation works
- [ ] Settings save successfully
- [ ] Changes reflect on public profile

### QuestionTable:
- [ ] Quick Consult questions show ⚡ badge
- [ ] Deep Dive questions show 🎯 badge
- [ ] Legacy questions show no badge
- [ ] Badges show on both desktop and mobile
- [ ] Tooltips work on hover

---

## 🐛 Known Issues / Future Improvements

### Mock Payment:
- Currently using `pi_mock_${Date.now()}` for payment intent IDs
- Need to integrate real Stripe payment authorization
- Need to capture payment on answer submission
- Need to refund payment on decline/expire

### Not Yet Implemented:
1. **Stripe Integration**
   - Payment authorization (hold funds)
   - Payment capture (charge on answer)
   - Payment refund (cancel on decline)

2. **Cron Jobs**
   - Expire offers after 24 hours
   - Enforce SLA deadlines
   - Retry failed payment captures

3. **Email Notifications**
   - New offer notification to expert
   - Offer accepted notification to asker
   - Offer declined notification to asker
   - Offer expired notification to asker

4. **Question Composer Deep Dive UX**
   - Could add real-time price suggestion based on question length
   - Could show acceptance probability based on price

---

## 📊 Implementation Statistics

**Frontend Components:**
- **Files Created:** 2 new components
- **Files Modified:** 4 existing components
- **Lines of Code Added:** ~1,200 lines
- **API Endpoints Created:** 5 endpoints

**Time Breakdown:**
- TierSelector: 30 minutes
- PublicProfilePage Integration: 30 minutes
- AskQuestionPage Extension: 1 hour
- ExpertSettings UI: 1.5 hours
- PendingOffersSection: 1 hour
- QuestionTable Indicators: 30 minutes
- **Total:** ~5 hours

---

## 🎯 Next Steps

### Immediate (Critical Path):
1. **End-to-End Testing**
   - Test complete Quick Consult flow
   - Test complete Deep Dive flow
   - Test expert settings changes
   - Test offer accept/decline

2. **Stripe Integration**
   - Set up Stripe test environment
   - Implement payment authorization
   - Implement payment capture
   - Implement refund logic

3. **Bug Fixes**
   - Fix any issues found in testing
   - Handle edge cases
   - Improve error messages

### Later (Nice to Have):
4. **Cron Jobs**
   - Implement offer expiration logic
   - Implement SLA enforcement
   - Implement payment retry

5. **Email Templates**
   - Design and implement 7 email templates
   - Set up ZeptoMail integration
   - Test email delivery

6. **Analytics**
   - Track tier selection rates
   - Track offer acceptance rates
   - Track pricing optimization data

---

## 🏆 Success Metrics

**Backend:**
- ✅ 8 API endpoints implemented and tested
- ✅ Database migrations complete
- ✅ Payment state machine designed

**Frontend:**
- ✅ 6 components built and integrated
- ✅ Tier selection flow complete
- ✅ Offer management flow complete
- ✅ Expert configuration UI complete
- ✅ Visual indicators implemented

**Documentation:**
- ✅ Implementation guides created
- ✅ API documentation complete
- ✅ Component specifications written
- ✅ Testing checklists prepared

**Overall Progress:**
- **Phase 1 (Database):** 100% ✅
- **Phase 2 (Backend API):** 100% ✅
- **Phase 3 (Frontend):** 100% ✅
- **Phase 4 (Stripe):** 0% ⏳
- **Phase 5 (Cron & Email):** 0% ⏳

**Total Implementation:** ~70% Complete

---

## 📝 Files Modified/Created

### New Files:
```
/src/components/pricing/TierSelector.jsx
/src/components/dashboard/PendingOffersSection.jsx
/api/questions/quick-consult.js
/api/questions/deep-dive.js
/api/expert/pending-offers.js
/api/offers/[id]/accept.js
/api/offers/[id]/decline.js
```

### Modified Files:
```
/src/pages/PublicProfilePage.jsx
/src/pages/AskQuestionPage.jsx
/src/pages/ExpertDashboardPage.jsx
/src/components/dashboard/SettingsModal.jsx
/src/components/dashboard/QuestionTable.jsx
```

---

## 🎓 Key Learnings

### What Went Well:
- Component reusability (TierBadge used in table)
- Consistent color scheme throughout
- Progressive enhancement (graceful fallbacks)
- Clear separation of concerns

### Challenges Overcome:
- Handling both desktop and mobile layouts for tier selection
- Validating Deep Dive offers with clear error messages
- Backward compatibility with legacy pricing fields
- Countdown timers with auto-refresh

### Best Practices Applied:
- Mock payment for early testing
- Comprehensive validation before API calls
- Loading/error states for all async operations
- Responsive design from the start
- Accessibility (tooltips, ARIA labels)

---

**Last Updated:** October 22, 2025
**Status:** Frontend Implementation Complete - Ready for Testing
**Next Session:** Stripe Integration & End-to-End Testing
