# Frontend Implementation Plan - Two-Tier Question Model

**Date:** October 21, 2025
**Status:** 🚧 In Progress
**Backend Status:** ✅ All 8 API endpoints complete and tested

---

## 🎯 Overview

This document outlines the frontend implementation for the two-tier question pricing system. We'll build React components that integrate with the completed Xano API endpoints.

---

## 📋 Implementation Priority

### **Phase 1: Core User Flow (Start Here)** ⭐

1. **PublicProfilePage** - Tier Selection UI
   - Display Quick Consult and/or Deep Dive options
   - Show pricing, SLA, and descriptions
   - Tier selection buttons

2. **QuestionComposer** - Extend for Tiers
   - Pass selected tier to composer
   - Different UI messaging for Quick Consult vs Deep Dive
   - Deep Dive: Add price input and message field

3. **PaymentScreen** - Stripe Integration (Mock first)
   - Accept tier information
   - Display pricing summary
   - Mock Stripe payment for now

### **Phase 2: Expert Management**

4. **ExpertSettings** - Pricing Configuration
   - Enable/disable tiers
   - Set prices and SLA hours
   - Set auto-decline threshold (Deep Dive)

5. **PendingOffersSection** - Offer Management
   - List pending Deep Dive offers
   - Accept/Decline buttons
   - Show offer details and time remaining

### **Phase 3: Visual Indicators**

6. **QuestionTable** - Tier Indicators
   - Add tier badges (⚡ Quick Consult, 🎯 Deep Dive)
   - Show offer status for Deep Dive questions

7. **QuestionStatusPage** - Asker Tracking (Optional)
   - Track offer status
   - Show acceptance/decline notifications

---

## 🔧 Component Specifications

### 1. PublicProfilePage - Tier Selection

**File:** `/src/pages/PublicProfilePage.jsx`

**What to Add:**
- Tier selector component below expert bio
- Two pricing cards side-by-side (if both enabled)
- Single card centered (if only one enabled)

**API Integration:**
- Already has `/public/profile` endpoint
- New field: `tiers` object with `quick_consult` and `deep_dive`

**UI Design:**

```
┌─────────────────────────────────────────┐
│ Expert Profile Header                    │
│ Name, Avatar, Bio                        │
└─────────────────────────────────────────┘

┌────────────────┐  ┌────────────────┐
│ ⚡ Quick Consult │  │ 🎯 Deep Dive   │
│                │  │                │
│ $75            │  │ $150 - $300    │
│ 48h turnaround │  │ 48h turnaround │
│                │  │                │
│ [Ask Question] │  │ [Make Offer]   │
└────────────────┘  └────────────────┘

Description text for each tier...
```

**Props to Pass to QuestionComposer:**
```javascript
{
  selectedTier: "quick_consult" | "deep_dive",
  tierConfig: {
    price_cents: 7500,
    sla_hours: 48,
    min_price_cents: 15000,  // Deep Dive only
    max_price_cents: 30000,  // Deep Dive only
  },
  expertProfileId: 139,
  expertName: "Expert Name"
}
```

---

### 2. QuestionComposer - Tier Support

**File:** `/src/components/question/QuestionComposer.jsx`

**What to Add:**
- Accept `selectedTier` and `tierConfig` props
- Conditional rendering based on tier
- Deep Dive: Add price input and message textarea

**UI Changes:**

**Quick Consult:**
```
┌─────────────────────────────────────────┐
│ Ask Your Question                        │
│                                          │
│ Fixed Price: $75                         │
│ Turnaround: 48 hours                     │
│                                          │
│ [Title input]                            │
│ [Question text]                          │
│ [Video recording]                        │
│                                          │
│ Total: $75                               │
│ [Continue to Payment] →                  │
└─────────────────────────────────────────┘
```

**Deep Dive:**
```
┌─────────────────────────────────────────┐
│ Submit Deep Dive Offer                   │
│                                          │
│ Expert's Range: $150 - $300              │
│                                          │
│ Your Offer: [$______]                    │
│ Message to Expert:                       │
│ [Why this is urgent/important]           │
│                                          │
│ [Title input]                            │
│ [Question text]                          │
│ [Video recording]                        │
│                                          │
│ Total: $180 (pending expert acceptance)  │
│ [Submit Offer] →                         │
└─────────────────────────────────────────┘
```

**API Endpoint Selection:**
```javascript
const endpoint = selectedTier === 'quick_consult'
  ? '/question/quick-consult'
  : '/question/deep-dive';

const payload = selectedTier === 'quick_consult'
  ? {
      expert_profile_id,
      payer_email,
      title,
      text,
      attachments,
      media_asset_id,
      stripe_payment_intent_id
    }
  : {
      expert_profile_id,
      payer_email,
      proposed_price_cents,  // NEW
      asker_message,         // NEW
      title,
      text,
      attachments,
      media_asset_id,
      stripe_payment_intent_id
    };
```

---

### 3. PaymentScreen - Mock Stripe (For Now)

**File:** `/src/components/payment/PaymentScreen.jsx` (create new)

**Purpose:**
- Accept payment information
- Display pricing summary
- Mock Stripe payment for now (we'll add real Stripe later)

**Props:**
```javascript
{
  tierType: "quick_consult" | "deep_dive",
  amount_cents: 7500,
  expertName: "Expert Name",
  questionTitle: "Question title",
  onPaymentComplete: (paymentIntentId) => {}
}
```

**UI:**
```
┌─────────────────────────────────────────┐
│ Payment Summary                          │
│                                          │
│ Expert: John Doe                         │
│ Question: "Architecture review..."       │
│                                          │
│ Type: ⚡ Quick Consult                   │
│ Amount: $75.00                           │
│                                          │
│ [Mock Stripe Card Input]                 │
│                                          │
│ [Pay $75.00] →                           │
└─────────────────────────────────────────┘
```

**Mock Payment Logic:**
```javascript
const handlePayment = async () => {
  // Mock payment for now
  const mockPaymentIntentId = `pi_mock_${Date.now()}`;

  // TODO: Replace with real Stripe integration
  await new Promise(resolve => setTimeout(resolve, 1000));

  onPaymentComplete(mockPaymentIntentId);
};
```

---

### 4. ExpertSettings - Pricing Configuration

**File:** `/src/pages/ExpertSettingsPage.jsx` or create new tab in existing settings

**API Integration:**
- GET `/expert/pricing-tiers` - Load current config
- PUT `/expert/pricing-tiers` - Update config

**UI:**
```
┌─────────────────────────────────────────┐
│ Pricing Tiers                            │
│                                          │
│ ☑ Quick Consult Enabled                 │
│   Price: [$75.00]                        │
│   SLA:   [48] hours                      │
│   Description:                           │
│   [Focused advice...]                    │
│                                          │
│ ☑ Deep Dive Enabled                      │
│   Min Price: [$150.00]                   │
│   Max Price: [$300.00]                   │
│   Auto-decline below: [$100.00] (opt)    │
│   SLA: [48] hours                        │
│   Description:                           │
│   [Comprehensive analysis...]            │
│                                          │
│ [Save Changes]                           │
└─────────────────────────────────────────┘
```

**Validation:**
- At least one tier must be enabled
- Quick Consult price > 0
- Deep Dive: min_price < max_price
- Auto-decline ≤ min_price
- SLA: 1-168 hours

---

### 5. PendingOffersSection - Offer Management

**File:** `/src/components/dashboard/PendingOffersSection.jsx` (create new)

**API Integration:**
- GET `/expert/pending-offers` - List offers
- POST `/offers/{id}/accept` - Accept offer
- POST `/offers/{id}/decline` - Decline offer

**UI:**
```
┌─────────────────────────────────────────┐
│ Pending Deep Dive Offers (2)             │
│                                          │
│ ┌─────────────────────────────────────┐ │
│ │ 🎯 Architecture Review              │ │
│ │ Offered: $180 • Expires in 23h      │ │
│ │ "This is urgent for Series A..."    │ │
│ │                                     │ │
│ │ [View Details] [Accept] [Decline]   │ │
│ └─────────────────────────────────────┘ │
│                                          │
│ ┌─────────────────────────────────────┐ │
│ │ 🎯 Product Strategy                 │ │
│ │ Offered: $250 • Expires in 20h      │ │
│ │ "Need advice before investor..."    │ │
│ │                                     │ │
│ │ [View Details] [Accept] [Decline]   │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

**Actions:**
- **Accept:** Calls `/offers/{id}/accept`, moves to questions queue
- **Decline:** Shows reason modal, calls `/offers/{id}/decline`

---

### 6. QuestionTable - Tier Indicators

**File:** `/src/components/dashboard/QuestionTable.jsx`

**What to Add:**
- Tier badge in question row
- Different styling for Quick Consult vs Deep Dive
- Offer status for Deep Dive

**UI Changes:**
```
┌────────────────────────────────────────────────────────┐
│ Question                    Tier      Status   Price   │
├────────────────────────────────────────────────────────┤
│ Architecture review...      ⚡ Quick   Paid     $75     │
│ Product strategy...         🎯 Deep    Accepted $180    │
│ Marketing plan...           🎯 Deep    Pending  $150    │
└────────────────────────────────────────────────────────┘
```

**Badge Component:**
```javascript
const TierBadge = ({ tier }) => {
  const config = {
    quick_consult: { icon: '⚡', label: 'Quick', color: 'blue' },
    deep_dive: { icon: '🎯', label: 'Deep', color: 'purple' }
  };

  const { icon, label, color } = config[tier];

  return (
    <span className={`tier-badge tier-${color}`}>
      {icon} {label}
    </span>
  );
};
```

---

## 🔄 Data Flow

### Quick Consult Flow

```
PublicProfilePage (select tier)
  ↓
QuestionComposer (tier="quick_consult", fixed price)
  ↓
PaymentScreen (mock payment)
  ↓
POST /question/quick-consult (with payment_intent_id)
  ↓
Success: Question created with status="paid"
  ↓
Expert sees in QuestionTable ⚡
```

### Deep Dive Flow

```
PublicProfilePage (select tier)
  ↓
QuestionComposer (tier="deep_dive", enter offer amount + message)
  ↓
PaymentScreen (mock payment auth)
  ↓
POST /question/deep-dive (with proposed_price_cents, asker_message)
  ↓
Success: Question created with status="offer_pending"
  ↓
Expert sees in PendingOffersSection 🎯
  ↓
Expert clicks [Accept]
  ↓
POST /offers/{id}/accept
  ↓
Question moves to QuestionTable with status="offer_accepted"
```

---

## 🎨 Styling Notes

**Tier Colors:**
- Quick Consult: Blue (#3B82F6)
- Deep Dive: Purple (#8B5CF6)

**Icons:**
- Quick Consult: ⚡ (lightning bolt)
- Deep Dive: 🎯 (target/bullseye)

**Status Colors:**
- Paid: Green
- Offer Pending: Yellow/Orange
- Offer Accepted: Green
- Offer Declined: Red
- Offer Expired: Gray

---

## 📦 New Files to Create

```
/src/components/
├── pricing/
│   ├── TierSelector.jsx              # NEW - Tier selection cards
│   └── TierBadge.jsx                 # NEW - Tier indicator badge
├── payment/
│   └── PaymentScreen.jsx             # NEW - Mock payment screen
└── dashboard/
    └── PendingOffersSection.jsx      # NEW - Offer management

/src/pages/
└── ExpertSettingsPage.jsx            # EXTEND - Add pricing tab
```

---

## ✅ Implementation Checklist

- [ ] **Step 1: PublicProfilePage**
  - [ ] Fetch tier data from API
  - [ ] Build TierSelector component
  - [ ] Handle tier selection
  - [ ] Pass props to QuestionComposer

- [ ] **Step 2: QuestionComposer**
  - [ ] Accept tier props
  - [ ] Conditional rendering for Deep Dive
  - [ ] Add price input validation (Deep Dive)
  - [ ] Add message textarea (Deep Dive)
  - [ ] Call correct API endpoint

- [ ] **Step 3: PaymentScreen**
  - [ ] Create new component
  - [ ] Mock Stripe payment
  - [ ] Return mock payment_intent_id
  - [ ] Display pricing summary

- [ ] **Step 4: ExpertSettings**
  - [ ] Fetch current pricing config
  - [ ] Build pricing form
  - [ ] Validation logic
  - [ ] PUT API call to save

- [ ] **Step 5: PendingOffersSection**
  - [ ] Fetch pending offers
  - [ ] Display offer cards
  - [ ] Accept/Decline buttons
  - [ ] Show countdown timer

- [ ] **Step 6: QuestionTable**
  - [ ] Add tier column
  - [ ] Create TierBadge component
  - [ ] Style tier indicators

---

## 🧪 Testing Plan

### Manual Testing:

1. **Quick Consult:**
   - Select Quick Consult on public profile
   - Submit question
   - Verify appears in expert's queue with ⚡ badge

2. **Deep Dive:**
   - Select Deep Dive on public profile
   - Enter offer amount and message
   - Verify appears in PendingOffersSection
   - Accept offer as expert
   - Verify moves to question queue with 🎯 badge

3. **Expert Settings:**
   - Disable Quick Consult
   - Verify not shown on public profile
   - Enable both tiers
   - Verify both shown on public profile

---

## 📝 Notes

### Mock vs Real Stripe

For now, we're mocking Stripe payment. This allows us to:
- Build and test the entire UI flow
- Verify API integration
- Get feedback on UX
- Add real Stripe later without changing the flow

**Mock Payment:**
```javascript
const mockPaymentIntentId = `pi_mock_${Date.now()}`;
```

**Real Stripe (Later):**
```javascript
const { paymentIntent } = await stripe.createPaymentIntent({
  amount: amount_cents,
  currency: 'usd',
  capture_method: 'manual'  // Pre-authorization
});
```

---

## 🚀 Getting Started

**Start with PublicProfilePage** - it's the entry point for the entire flow.

1. Open `/src/pages/PublicProfilePage.jsx`
2. Add tier selector UI below expert bio
3. Test with existing endpoint (already returns `tiers` object)
4. Move to QuestionComposer next

---

**Ready to start coding?** Let's begin with PublicProfilePage!

**Last Updated:** October 21, 2025
**Status:** Planning Complete - Ready for Implementation
