# Two-Tier Question Pricing System - Complete Implementation Specification

**Project:** mindPick Platform Enhancement  
**Feature:** Two-Tier Question Types with Negotiable Pricing  
**Version:** 1.0  
**Date:** October 2025  
**Status:** Ready for Implementation

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Strategic Overview](#strategic-overview)
3. [User Experience Flows](#user-experience-flows)
4. [Database Schema](#database-schema)
5. [Backend API Specifications](#backend-api-specifications)
6. [Frontend Requirements](#frontend-requirements)
7. [Payment Integration](#payment-integration)
8. [Automation & Cron Jobs](#automation--cron-jobs)
9. [Email Notifications](#email-notifications)
10. [Edge Cases & Business Rules](#edge-cases--business-rules)
11. [Implementation Phases](#implementation-phases)
12. [Success Metrics](#success-metrics)

---

## Executive Summary

### What We're Building

A two-tier question system that allows experts to offer both **Quick Consult** (fixed price, instant) and **Deep Dive** (asker proposes price, expert accepts/declines) question types.

### Core Principles

1. **Quick Consult:** Fixed price set by expert, immediate payment, SLA starts instantly
2. **Deep Dive:** Asker proposes price, expert reviews and accepts/declines, SLA starts after acceptance
3. **Unified Payment Model:** Both tiers use Stripe pre-authorization (funds held, released after answer)
4. **Expert Control:** Experts choose which tiers to enable and set their own parameters

### Key Benefits

- **For Experts:** Flexible pricing for different work complexity, filter low-value offers
- **For Askers:** Clear expectations for quick questions, negotiable pricing for complex work
- **For Platform:** Higher average transaction value, reduced payment abandonment

---

## Strategic Overview

### Two Question Types

#### Quick Consult ⚡
**Positioning:** Focused, tactical advice  
**Pricing:** Fixed by expert (non-negotiable)  
**SLA:** Set by expert (typically 24 hours)  
**Use Cases:** Tool comparisons, quick decisions, validation  
**Payment Flow:** Reserve funds → Submit question → SLA starts immediately → Expert answers → Capture payment

#### Deep Dive 🎯
**Positioning:** Comprehensive analysis  
**Pricing:** Asker proposes (expert accepts/declines)  
**SLA:** Set by expert (typically 48-72 hours, starts after acceptance)  
**Use Cases:** Architecture review, strategy planning, multi-part questions  
**Payment Flow:** Reserve funds → Submit offer → Expert reviews (24h window) → If accepted, SLA starts → Expert answers → Capture payment

### Expert Configuration Options

Experts can choose to enable:
- **Quick Consult only** - Simple, high-volume model
- **Deep Dive only** - Custom work, selective
- **Both** (recommended) - Maximum flexibility

### Pricing Philosophy

**Quick Consult:**
- Expert sets exact price (e.g., €75)
- No negotiation
- Instant transaction

**Deep Dive:**
- Expert sets price guidance (e.g., €150-300)
- Asker proposes within or outside range
- Expert can optionally set auto-decline threshold (e.g., reject offers below €100)
- Expert accepts or declines with message
- No counter-offer in MVP (asker can resubmit after decline)

---

## User Experience Flows

### Flow 1: Quick Consult (Fixed Price)

**Asker Journey:**
```
1. Visit expert profile
2. See: "Quick Consult - €75 - 24h response"
3. Click [Ask Quick Question]
4. Record question (up to 90s video/audio)
5. Optional: Add text context, attach files
6. See payment screen:
   - "€75 reserved on your card (not charged yet)"
   - "Expert answers within 24h"
   - "Payment released after answer"
   - "Auto-refund if unanswered"
7. Click [Reserve €75 & Submit]
8. ✅ Question submitted
9. Wait for answer (24h SLA)
10. Receive answer
11. Payment captured automatically
```

**Expert Journey:**
```
1. Receive notification: "New Quick Consult question"
2. See in dashboard: "⚡ Quick Consult • €75 • 18h remaining"
3. Review question
4. Record answer
5. Submit answer
6. Payment automatically released to expert
```

**Timeline:** 2-3 minutes submission, 24h for answer

---

### Flow 2: Deep Dive (Negotiated Price)

**Asker Journey:**
```
1. Visit expert profile
2. See: "Deep Dive - You propose price - 48h after acceptance"
   - "Suggested: €150-300"
3. Click [Submit Deep Dive]
4. Record question (up to 90s, encouraged to be detailed)
5. Add comprehensive text context
6. Attach files (architecture diagrams, docs)
7. See pricing screen:
   - "Expert accepts offers €150-300"
   - Input field: "Your offer: €___"
   - Optional: "Why this price? (message to expert)"
8. Enter offer: €180
9. See confirmation:
   - "€180 reserved on your card (not charged yet)"
   - "Expert reviews within 24h"
   - "If accepted: Expert answers in 48h, payment released"
   - "If declined: Instant refund"
10. Click [Reserve €180 & Submit Offer]
11. ✅ Offer submitted
12. Wait for expert response (24h window)

--- SCENARIO A: ACCEPTED ---
13. Receive email: "Offer accepted! Expert will answer in 48h"
14. Wait for answer (48h SLA)
15. Receive answer
16. Payment captured automatically

--- SCENARIO B: DECLINED ---
13. Receive email: "Offer declined. €180 refunded instantly."
14. See expert's message: "This scope requires €220 minimum given complexity"
15. Options:
    - Resubmit at €220
    - Find different expert

--- SCENARIO C: NO RESPONSE ---
13. After 24h: "Offer expired. €180 refunded."
14. Try different expert
```

**Expert Journey:**
```
1. Receive notification: "New Deep Dive offer: €180"
2. See in dashboard: "📬 Pending Offers (1)"
3. Review full question:
   - Watch 85s video
   - Read detailed context
   - Download 3 attached files
4. Evaluate: "Is €180 worth my 48h commitment for this scope?"
5. Decision:

--- ACCEPT ---
   Click [Accept €180]
   → SLA countdown starts (48h)
   → Asker notified
   → Answer within 48h
   → Payment released after answer

--- DECLINE ---
   Click [Decline with message]
   → Write: "This scope requires €220 minimum..."
   → Submit
   → €180 auto-refunded to asker
   → Asker can resubmit at higher price
```

**Timeline:**  
- Submission: 5-8 minutes (more detail required)
- Expert review: 4-24 hours
- If accepted: +48h for answer
- Total: 28-72 hours typical

---

### Flow 3: Question Submission Form Differences

Both tiers use the **same technical form** (same fields, same limits) but with **different UI presentation and messaging**.

#### Quick Consult Form

**Page Header:**
```
Quick Consult with @expert
€75 • 24 hours

Keep it focused - one tactical question works best
```

**Form Layout:**
- Primary: Video/audio recording (up to 90s)
- Secondary: Text context (collapsed, expandable)
- Tertiary: Attachments (collapsed, "only if essential")

**AI Coaching Prompts (if enabled):**
- "What's the ONE key decision you need help with?"
- "What have you already considered?"
- Narrow, tactical focus

**Visual Emphasis:** "Quick and focused wins"

---

#### Deep Dive Form

**Page Header:**
```
Deep Dive with @expert
You propose price • 48h after acceptance

Provide comprehensive context for detailed analysis
```

**Form Layout:**
- All fields visible upfront (no collapsing)
- Video/audio recording (up to 90s, encouraged to be detailed)
- Text context (expanded, "The more detail, the better")
- Attachments (expanded, explicitly prompted)

**AI Coaching Prompts (if enabled):**
- "Describe your current situation in detail"
- "What specific areas need expert input?"
- "What have you already explored?"
- Comprehensive, strategic focus

**Visual Emphasis:** "Thoroughness helps you get better answers"

---

## Database Schema

### Table: expert_profile (extend existing)

**New Fields for Quick Consult:**
```
tier1_enabled: boolean (default: true)
tier1_price_cents: integer (e.g., 7500 for €75)
tier1_sla_hours: integer (default: 24)
tier1_description: text (e.g., "Focused advice on specific questions")
```

**New Fields for Deep Dive:**
```
tier2_enabled: boolean (default: false)
tier2_pricing_mode: text (value: 'asker_proposes')
tier2_min_price_cents: integer (guidance, e.g., 15000)
tier2_max_price_cents: integer (guidance, e.g., 30000)
tier2_auto_decline_below_cents: integer, nullable (e.g., 10000)
tier2_sla_hours: integer (default: 48)
tier2_description: text (e.g., "Comprehensive analysis for complex questions")
```

**Migration Strategy:**
- Existing experts: Auto-map current price → tier1_price_cents, tier2_enabled = false
- Email notification about new Deep Dive feature

---

### Table: question (extend existing)

**New Fields:**
```
question_tier: text (values: 'quick_consult' | 'deep_dive')
pricing_status: text (values: 'paid' | 'offer_pending' | 'offer_accepted' | 
                       'offer_declined' | 'offer_expired' | 'completed' | 'sla_missed')
proposed_price_cents: integer, nullable (Deep Dive offers)
final_price_cents: integer (actual price paid)
sla_start_time: timestamp, nullable (NULL until offer accepted for Deep Dive)
sla_deadline: timestamp, nullable (calculated: sla_start_time + sla_hours)
sla_missed: boolean (default: false)
offer_expires_at: timestamp, nullable (24h from submission for Deep Dive)
decline_reason: text, nullable (expert's message if declined)
expert_reviewed_at: timestamp, nullable (when expert accepted/declined)
```

**Key Behavior:**
- Quick Consult: `sla_start_time` set immediately on submission
- Deep Dive: `sla_start_time` set only when expert accepts offer

---

### Table: payment (extend existing)

**New Fields:**
```
status: text (values: 'authorized' | 'accepted' | 'captured' | 'refunded' | 'failed')
stripe_payment_intent_id: text (Stripe PaymentIntent ID)
authorized_at: timestamp (when funds were held)
accepted_at: timestamp, nullable (when Deep Dive offer accepted)
captured_at: timestamp, nullable (when payment processed)
refunded_at: timestamp, nullable (if declined/expired/SLA missed)
question_type: text (values: 'quick_consult' | 'deep_dive')
```

**Payment State Machine:**
```
Quick Consult:
authorized → captured (on answer) OR refunded (on SLA miss)

Deep Dive:
authorized → accepted (on expert accept) → captured (on answer)
    OR
authorized → refunded (on decline/expire/SLA miss)
```

---

## Backend API Specifications

### 1. Expert Configuration Endpoints

#### GET /expert/pricing-tiers
**Authentication:** Required  
**Purpose:** Retrieve expert's tier configuration

**Response:**
```json
{
  "quick_consult": {
    "enabled": true,
    "price_cents": 7500,
    "sla_hours": 24,
    "description": "Focused advice..."
  },
  "deep_dive": {
    "enabled": true,
    "pricing_mode": "asker_proposes",
    "min_price_cents": 15000,
    "max_price_cents": 30000,
    "auto_decline_below_cents": 10000,
    "sla_hours": 48,
    "description": "Comprehensive analysis..."
  }
}
```

---

#### PUT /expert/pricing-tiers
**Authentication:** Required  
**Purpose:** Update tier configuration

**Request Body:**
```json
{
  "quick_consult": {
    "enabled": true,
    "price_cents": 7500,
    "sla_hours": 24,
    "description": "Focused tactical advice"
  },
  "deep_dive": {
    "enabled": true,
    "min_price_cents": 15000,
    "max_price_cents": 30000,
    "auto_decline_below_cents": 10000,
    "sla_hours": 48,
    "description": "Comprehensive analysis for complex questions"
  }
}
```

**Response:**
```json
{
  "success": true,
  "updated_at": 1760349011047
}
```

**Validation:**
- At least one tier must be enabled
- Prices must be > 0
- SLA hours must be between 1 and 168 (1 week)
- If auto_decline_below set, must be ≤ min_price

---

### 2. Public Profile Endpoint (extend existing)

#### GET /public/profile?handle={handle}
**Authentication:** None (public)  
**Purpose:** Get expert profile including tier configuration

**Add to Response:**
```json
{
  "expert_profile": {
    // ... existing fields ...
    "tiers": {
      "quick_consult": {
        "enabled": true,
        "price_cents": 7500,
        "sla_hours": 24,
        "description": "Focused advice..."
      },
      "deep_dive": {
        "enabled": true,
        "pricing_mode": "asker_proposes",
        "min_price_cents": 15000,
        "max_price_cents": 30000,
        "sla_hours": 48,
        "description": "Comprehensive analysis..."
      }
    }
  }
}
```

**Note:** Do NOT expose `auto_decline_below_cents` in public API

---

### 3. Question Submission Endpoints

#### POST /question/quick-consult
**Authentication:** None (public - payment creates question)  
**Purpose:** Submit Quick Consult question

**Request Body:**
```json
{
  "expert_profile_id": 107,
  "payer_email": "asker@example.com",
  "title": "Question title",
  "text": "Question details...",
  "attachments": "[{...}]",
  "media_asset_id": 97,
  "stripe_payment_intent_id": "pi_xxx"
}
```

**Server-Side Processing:**
1. Validate expert has tier1_enabled = true
2. Get tier1_price_cents and tier1_sla_hours
3. Create question record:
   - question_tier = 'quick_consult'
   - pricing_status = 'paid'
   - final_price_cents = tier1_price_cents
   - sla_start_time = NOW()
   - sla_deadline = NOW() + tier1_sla_hours
4. Create payment record (status = 'authorized')
5. Send email to expert

**Response:**
```json
{
  "question_id": 118,
  "final_price_cents": 7500,
  "sla_deadline": 1760435411047,
  "status": "paid"
}
```

---

#### POST /question/deep-dive
**Authentication:** None (public)  
**Purpose:** Submit Deep Dive offer

**Request Body:**
```json
{
  "expert_profile_id": 107,
  "payer_email": "asker@example.com",
  "proposed_price_cents": 18000,
  "asker_message": "Why this price...",
  "title": "Question title",
  "text": "Detailed question...",
  "attachments": "[{...}]",
  "media_asset_id": 97,
  "stripe_payment_intent_id": "pi_xxx"
}
```

**Server-Side Processing:**
1. Validate expert has tier2_enabled = true
2. Check auto_decline_below_cents:
   - If set AND proposed_price < threshold → Auto-decline, refund, notify
3. Create question record:
   - question_tier = 'deep_dive'
   - pricing_status = 'offer_pending'
   - proposed_price_cents = 18000
   - final_price_cents = 18000
   - sla_start_time = NULL (not started yet)
   - sla_deadline = NULL
   - offer_expires_at = NOW() + 24h
4. Create payment record (status = 'authorized')
5. Send email to expert ("New offer to review")

**Response:**
```json
{
  "question_id": 119,
  "proposed_price_cents": 18000,
  "status": "offer_pending",
  "offer_expires_at": 1760435411047
}
```

---

### 4. Deep Dive Negotiation Endpoints

#### GET /expert/pending-offers
**Authentication:** Required  
**Purpose:** List offers awaiting expert review

**Response:**
```json
[
  {
    "question_id": 119,
    "payer_email": "asker@example.com",
    "proposed_price_cents": 18000,
    "asker_message": "Critical decision for Series A...",
    "title": "Architecture review",
    "text": "Need guidance on...",
    "attachments": "[...]",
    "media_asset_id": 97,
    "submitted_at": 1760349011047,
    "expires_at": 1760435411047,
    "hours_until_expiry": 22
  }
]
```

**Query Logic:**
- Filter: expert_profile_id = authenticated expert
- Filter: pricing_status = 'offer_pending'
- Filter: offer_expires_at > NOW()
- Order by: submitted_at ASC

---

#### POST /offers/{question_id}/accept
**Authentication:** Required  
**Purpose:** Expert accepts Deep Dive offer

**Request Body:**
```json
{
  "message": "Looking forward to diving deep into your architecture..."
}
```

**Server-Side Processing:**
1. Verify expert owns this question
2. Verify pricing_status = 'offer_pending'
3. Verify offer not expired
4. Update question:
   - pricing_status = 'offer_accepted'
   - sla_start_time = NOW()
   - sla_deadline = NOW() + tier2_sla_hours
   - expert_reviewed_at = NOW()
5. Update payment (status = 'accepted')
6. Send email to asker ("Offer accepted!")

**Response:**
```json
{
  "success": true,
  "sla_deadline": 1760608211047,
  "sla_hours": 48
}
```

---

#### POST /offers/{question_id}/decline
**Authentication:** Required  
**Purpose:** Expert declines Deep Dive offer

**Request Body:**
```json
{
  "message": "This scope requires €220 minimum given the security audit needed."
}
```

**Server-Side Processing:**
1. Verify expert owns this question
2. Verify pricing_status = 'offer_pending'
3. Update question:
   - pricing_status = 'offer_declined'
   - decline_reason = message
   - expert_reviewed_at = NOW()
4. Cancel Stripe PaymentIntent (instant refund)
5. Update payment (status = 'refunded', refunded_at = NOW())
6. Send email to asker ("Offer declined, refunded")

**Response:**
```json
{
  "success": true,
  "refunded_amount_cents": 18000
}
```

---

### 5. Answer Submission (extend existing)

#### POST /answer
**No changes to endpoint signature**

**Additional Processing:**
1. After answer created successfully
2. Capture Stripe PaymentIntent
3. Update payment:
   - status = 'captured'
   - captured_at = NOW()
4. Update question:
   - pricing_status = 'completed'
   - answered_at = NOW()

**If capture fails:**
- Log error
- Keep answer visible
- Retry capture (cron job)

---

## Frontend Requirements

### 1. Public Profile Page

**Component:** PublicProfilePage.jsx

**Current:** Single "Ask a Question" button

**New:** Conditional display based on tier configuration

**Scenario A: Only Quick Consult Enabled**
```
┌────────────────────────────────────┐
│ @expert_handle                     │
│ Senior Cloud Architect             │
├────────────────────────────────────┤
│                                    │
│ ⚡ Quick Consult                   │
│ €75 • 24 hours                     │
│                                    │
│ Focused advice on specific         │
│ technical questions                │
│                                    │
│ [Ask Quick Question →]             │
│                                    │
└────────────────────────────────────┘
```

**Scenario B: Only Deep Dive Enabled**
```
┌────────────────────────────────────┐
│ @expert_handle                     │
│ Senior Cloud Architect             │
├────────────────────────────────────┤
│                                    │
│ 🎯 Deep Dive                       │
│ You propose price • 48 hours       │
│ Suggested: €150-300                │
│                                    │
│ Comprehensive analysis for         │
│ complex questions                  │
│                                    │
│ [Submit Deep Dive →]               │
│                                    │
└────────────────────────────────────┘
```

**Scenario C: Both Enabled (Most Common)**
```
┌────────────────────────────────────────────────────────────┐
│ @expert_handle                                             │
│ Senior Cloud Architect                                     │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ Choose Your Question Type:                                │
│                                                            │
│ ┌──────────────────────┐  ┌──────────────────────┐       │
│ │ ⚡ Quick Consult     │  │ 🎯 Deep Dive        │       │
│ │                      │  │                      │       │
│ │ Focused advice       │  │ Comprehensive        │       │
│ │ €75 • 24h           │  │ You propose • 48h    │       │
│ │                      │  │                      │       │
│ │ Perfect for:         │  │ Perfect for:         │       │
│ │ • Quick decisions    │  │ • Architecture       │       │
│ │ • Tool comparisons   │  │ • Strategy planning  │       │
│ │ • Validation         │  │ • Multiple questions │       │
│ │                      │  │                      │       │
│ │ [Ask Question →]     │  │ [Submit Offer →]     │       │
│ └──────────────────────┘  └──────────────────────┘       │
│                                                            │
│ ℹ️ Deep Dive: Reserve funds, expert reviews & accepts    │
│    Typical offers: €150-300 • Instant refund if declined │
└────────────────────────────────────────────────────────────┘
```

**Implementation Notes:**
- Fetch tier configuration from `/public/profile?handle={handle}`
- Store in component state
- Conditionally render based on `tiers.quick_consult.enabled` and `tiers.deep_dive.enabled`
- If both disabled: Show "Not accepting questions" message

---

### 2. Question Submission Pages

**Option 1: Single Page with Fork (Recommended)**

**Route:** `/ask/:expertHandle`  
**Component:** AskQuestionPage.jsx

**Flow:**
1. Page loads with tier selection (if both enabled)
2. User selects tier
3. Form adapts to selected tier (messaging changes, not fields)
4. Payment screen adapts to tier
5. Submission routes to appropriate endpoint

**Option 2: Separate Pages**

**Routes:** 
- `/ask/:expertHandle/quick`
- `/ask/:expertHandle/deep`

**Components:**
- QuickConsultPage.jsx
- DeepDivePage.jsx

**Pro:** Cleaner separation  
**Con:** More duplication

**Recommendation:** Option 1 (single page with conditional rendering)

---

### 3. Question Composer Component

**Component:** QuestionComposer.jsx (extend existing)

**New Props:**
```javascript
{
  questionTier: 'quick_consult' | 'deep_dive',
  tierConfig: {
    price_cents: 7500,
    sla_hours: 24,
    min_price_cents: 15000,
    max_price_cents: 30000,
    description: "..."
  }
}
```

**UI Differences:**

**Header:**
- Quick: "Quick Consult - €75 - 24h"
- Deep: "Deep Dive - You propose price - 48h"

**Messaging:**
- Quick: "Keep it focused - one tactical question"
- Deep: "Provide comprehensive context for detailed analysis"

**Field Visibility:**
- Quick: Text and attachments collapsed initially
- Deep: All fields visible and expanded

**AI Coaching (if enabled):**
- Quick: Tactical prompts
- Deep: Comprehensive prompts

---

### 4. Payment Screen Component

**Component:** PaymentScreen.jsx (new or extend existing)

**For Quick Consult:**
```
┌─────────────────────────────────────┐
│ Reserve Payment                     │
│                                     │
│ Quick Consult: €75                  │
│ Response time: 24 hours             │
│                                     │
│ ℹ️ How it works:                    │
│ 1. €75 reserved on your card        │
│    (shown as pending, not charged)  │
│ 2. Expert answers within 24 hours   │
│ 3. Payment captured & released      │
│    to expert                        │
│ 4. If unanswered: Auto-refund       │
│                                     │
│ 💳 Your card: •••• 4242             │
│                                     │
│ [Reserve €75 & Submit Question]     │
└─────────────────────────────────────┘
```

**For Deep Dive:**
```
┌─────────────────────────────────────┐
│ Make Your Offer                     │
│                                     │
│ Expert accepts offers €150-300      │
│                                     │
│ Your offer: [€ 180  ]               │
│                                     │
│ Optional message to expert:         │
│ ┌─────────────────────────────────┐ │
│ │ Critical decision for Series A. │ │
│ │ Budgeted for expert consult.    │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ℹ️ How it works:                    │
│ 1. €180 reserved on your card       │
│    (shown as pending, not charged)  │
│ 2. Expert reviews within 24h        │
│ 3. If accepted: Expert answers      │
│    (48h), payment captured          │
│ 4. If declined: Instant refund      │
│                                     │
│ ⚠️ 87% of offers in this range      │
│    are accepted by this expert      │
│                                     │
│ [Reserve €180 & Submit Offer]       │
└─────────────────────────────────────┘
```

**Implementation Notes:**
- Use Stripe Elements for card input
- Show acceptance rate for Deep Dive (if available)
- Validate offer amount client-side
- Show clear refund policy

---

### 5. Expert Dashboard - Pending Offers Section

**Component:** ExpertDashboard.jsx (extend)

**New Section:** "📬 Pending Offers"

**Display:**
```
┌────────────────────────────────────────────────────────┐
│ 📬 Pending Offers (2) ⚠️ Respond within 24 hours     │
│                                                        │
│ ┌────────────────────────────────────────────────────┐│
│ │ 🎯 Deep Dive • Offer: €180 • 8 hours ago          ││
│ │                                                    ││
│ │ From: John D. • First-time asker                  ││
│ │                                                    ││
│ │ "Architecture review for multi-tenant SaaS..."    ││
│ │                                                    ││
│ │ 📎 Attachments (3): architecture.pdf, schema.sql  ││
│ │                                                    ││
│ │ ⏰ Offer expires in 16 hours                       ││
│ │                                                    ││
│ │ [Review Full Question]                            ││
│ │ [Accept €180] [Decline]                           ││
│ └────────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────────┘
```

**Features:**
- Real-time countdown to expiry
- Inline preview of question
- Quick accept/decline
- "Review Full Question" opens detailed modal

---

### 6. Expert Dashboard - Question Queue Updates

**Component:** QuestionTable.jsx (extend)

**Current:** Shows all questions with status

**New:** Add visual indicators for question tier

**Display:**
```
┌────────────────────────────────────────────────────────┐
│ 📋 Active Questions (5)                                │
│                                                        │
│ ⚡ Quick Consult • €75 • 12 hours remaining           │
│ "Should I use GraphQL or REST for..."                 │
│ [Answer Now →]                                         │
│                                                        │
│ 🎯 Deep Dive • €180 • 36 hours remaining (accepted)  │
│ "Architecture review for fintech platform..."         │
│ [Answer Now →]                                         │
│                                                        │
│ ⚡ Quick Consult • €75 • ⚠️ 2 hours remaining         │
│ "Best CDN for e-commerce site?"                       │
│ [Answer Now →] 🔴 URGENT                              │
└────────────────────────────────────────────────────────┘
```

**Visual Indicators:**
- ⚡ icon for Quick Consult
- 🎯 icon for Deep Dive
- Color coding for urgency (last 4 hours = red)
- Show "(accepted)" for Deep Dive questions that were offers

---

### 7. Expert Settings - Pricing Configuration

**Component:** ExpertSettings.jsx (new section)

**Location:** Expert Dashboard → Settings → Pricing

**UI:**
```
┌─────────────────────────────────────────────────────────┐
│ Question Types & Pricing                                 │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Which question types do you want to offer?              │
│                                                          │
│ ☐ Quick Consult Only (simplest - fixed price)           │
│ ☐ Deep Dive Only (custom work - askers propose)         │
│ ☑ Both (recommended - maximize opportunities)           │
│                                                          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ ⚡ QUICK CONSULT                                         │
│ ☑ Enabled                                                │
│                                                          │
│ Fixed Price:     [€ 75  ]                               │
│ Response Time:   [24] hours                             │
│                                                          │
│ Description (shown to askers):                          │
│ ┌──────────────────────────────────────────────────┐    │
│ │ Focused advice on specific tactical questions.  │    │
│ │ Perfect for tool comparisons, quick decisions.   │    │
│ └──────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ 🎯 DEEP DIVE                                            │
│ ☑ Enabled                                                │
│                                                          │
│ Pricing Mode:    ⚫ Askers Propose                       │
│                                                          │
│ Price Guidance:  €[150] - €[300]                        │
│                  (shown to askers as suggestion)        │
│                                                          │
│ Response Time:   [48] hours                             │
│                  (starts after you accept offer)        │
│                                                          │
│ Description (shown to askers):                          │
│ ┌──────────────────────────────────────────────────┐    │
│ │ Comprehensive analysis for complex questions.    │    │
│ │ Includes architecture review, detailed feedback. │    │
│ └──────────────────────────────────────────────────┘    │
│                                                          │
│ Optional Settings:                                       │
│ ☑ Auto-decline offers below: €[100]                     │
│                                                          │
└─────────────────────────────────────────────────────────┘

[Save Settings]
```

**Validation:**
- At least one tier must be enabled
- Prices must be positive integers
- SLA must be between 1-168 hours
- Auto-decline must be ≤ min guidance

---

### 8. Asker Status Tracking

**Component:** QuestionStatusPage.jsx (new)

**Route:** `/question/:questionId/status`

**For Quick Consult:**
```
┌─────────────────────────────────────┐
│ ✅ Question Submitted!              │
│                                     │
│ €75 reserved (not yet charged)      │
│                                     │
│ Expert will answer within:          │
│ ⏰ 18 hours 23 minutes              │
│                                     │
│ Payment released after answer       │
│                                     │
│ [Track Status →]                    │
└─────────────────────────────────────┘
```

**For Deep Dive - Pending:**
```
┌─────────────────────────────────────┐
│ ✅ Offer Submitted!                 │
│                                     │
│ €180 reserved (not yet charged)     │
│                                     │
│ Status: Waiting for expert review   │
│ Expert will respond within:         │
│ ⏰ 16 hours 45 minutes              │
│                                     │
│ If accepted: Expert answers (48h)   │
│ If declined: Instant refund         │
│                                     │
│ [Track Status →]                    │
└─────────────────────────────────────┘
```

**For Deep Dive - Accepted:**
```
┌─────────────────────────────────────┐
│ ✅ Offer Accepted!                  │
│                                     │
│ €180 held (will be charged)         │
│                                     │
│ Expert will answer within:          │
│ ⏰ 42 hours 15 minutes              │
│                                     │
│ Payment released after answer       │
│                                     │
│ [Track Status →]                    │
└─────────────────────────────────────┘
```

---

## Payment Integration

### Stripe Implementation

**Library:** Stripe.js + Elements

**Flow:** Pre-authorization (hold funds) → Capture (after answer delivered)

### Frontend Payment Flow

**Step 1: Create PaymentIntent (Vercel Function)**

**Endpoint:** POST /api/payments/authorize

**Request:**
```json
{
  "amount_cents": 18000,
  "expert_profile_id": 107,
  "question_tier": "deep_dive",
  "metadata": {
    "payer_email": "asker@example.com",
    "expert_handle": "johndoe"
  }
}
```

**Backend Processing:**
```
1. Calculate platform fee (e.g., 10%)
2. Create Stripe PaymentIntent:
   - amount: 18000
   - currency: eur
   - capture_method: 'manual'  ← CRITICAL
   - customer: stripe_customer_id (if exists)
   - metadata: {...}
3. Return client_secret to frontend
```

**Response:**
```json
{
  "client_secret": "pi_xxx_secret_yyy",
  "payment_intent_id": "pi_xxx"
}
```

**Step 2: Confirm Payment (Frontend)**

```javascript
// In payment form component
const { error } = await stripe.confirmCardPayment(clientSecret, {
  payment_method: {
    card: cardElement,
    billing_details: {
      email: payerEmail
    }
  }
});

if (error) {
  // Handle error
} else {
  // Submit question with payment_intent_id
}
```

**Step 3: Submit Question**

Call appropriate endpoint with `stripe_payment_intent_id`

---

### Backend Payment Capture

**Endpoint:** POST /api/payments/capture (Internal - called after answer)

**Request:**
```json
{
  "payment_intent_id": "pi_xxx",
  "question_id": 119
}
```

**Processing:**
```
1. Verify answer exists for question
2. Capture Stripe PaymentIntent:
   stripe.paymentIntents.capture(payment_intent_id)
3. Update payment record (status = 'captured')
4. Update question (pricing_status = 'completed')
5. Transfer to expert's Stripe Connect account (minus fee)
```

**Response:**
```json
{
  "success": true,
  "captured_amount": 18000,
  "expert_receives": 16200,
  "platform_fee": 1800
}
```

---

### Backend Payment Cancellation

**Endpoint:** POST /api/payments/cancel (Internal - called on decline/expire)

**Request:**
```json
{
  "payment_intent_id": "pi_xxx",
  "reason": "offer_declined"
}
```

**Processing:**
```
1. Cancel Stripe PaymentIntent:
   stripe.paymentIntents.cancel(payment_intent_id)
2. Update payment record (status = 'refunded')
3. Update question (pricing_status = 'offer_declined')
```

**Response:**
```json
{
  "success": true,
  "refunded_amount": 18000
}
```

**Note:** Canceling authorization is instant and free (no Stripe fees)

---

### Error Handling

**Scenario 1: Payment Capture Fails**

**Trigger:** Answer submitted, but capture fails

**Handling:**
```
1. Log error to monitoring system
2. Keep answer visible to asker (they can still watch)
3. Mark payment for retry
4. Cron job retries capture every hour (max 3 attempts)
5. After 3 failures: Alert admin, manual intervention needed
```

**Scenario 2: Pre-Authorization Declines**

**Trigger:** User's card declines during question submission

**Handling:**
```
1. Show clear error message
2. Don't create question record
3. Allow user to try different payment method
4. Preserve question content in localStorage (don't lose their work)
```

---

## Automation & Cron Jobs

### Job 1: Expire Pending Offers

**File:** `/api/cron/expire-offers.js`  
**Schedule:** Every hour  
**Trigger:** Vercel cron (configured in vercel.json)

**Logic:**
```
1. Query questions:
   - pricing_status = 'offer_pending'
   - offer_expires_at < NOW()

2. For each expired offer:
   - Cancel Stripe PaymentIntent
   - Update question (pricing_status = 'offer_expired')
   - Update payment (status = 'refunded')
   - Send email to asker ("Offer expired, refunded")
   - Send email to expert ("Missed opportunity reminder")
```

**Expected Volume:** 5-10 offers/day × 30% no-response = 1-3 expirations/day

---

### Job 2: Enforce SLA

**File:** `/api/cron/enforce-sla.js` (extend existing)  
**Schedule:** Every hour

**Logic:**
```
1. Query questions:
   - pricing_status IN ('paid', 'offer_accepted')
   - sla_deadline < NOW()
   - sla_missed = false

2. For each overdue question:
   - Cancel/Refund Stripe PaymentIntent
   - Update question (pricing_status = 'sla_missed', sla_missed = true)
   - Update payment (status = 'refunded')
   - Send email to asker ("Refunded - SLA missed")
   - Send email to expert ("SLA missed - no payment")
   - (Optional) Impact expert's reputation score
```

**Expected Volume:** <5% of questions miss SLA = ~2-5/day

---

### Job 3: Retry Failed Captures

**File:** `/api/cron/retry-captures.js` (new)  
**Schedule:** Every hour

**Logic:**
```
1. Query payments:
   - status = 'accepted'
   - Question has answer
   - capture_attempted = true
   - capture_failed = true
   - retry_count < 3

2. For each payment:
   - Attempt Stripe capture
   - If success:
     - Update payment (status = 'captured')
     - Update question (pricing_status = 'completed')
   - If failure:
     - Increment retry_count
     - If retry_count >= 3:
       - Alert admin
       - Mark for manual review
```

**Expected Volume:** <1% capture failures = ~1-2/week

---

## Email Notifications

### New Email Templates (ZeptoMail)

#### 1. Offer Submitted (To Asker)
**Template ID:** `offer_submitted`

**Subject:** `Offer submitted - €{amount} reserved`

**Body:**
```
Hi {asker_name},

Your Deep Dive offer has been submitted to @{expert_handle}!

Payment status:
💳 €{amount} reserved on your card (not yet charged)
⏰ Expert will review within 24 hours
✅ If accepted: Payment released after answer (48h)
🔄 If declined: Instant refund

Track your offer: [View Status →]

— mindPick
```

---

#### 2. Offer Received (To Expert)
**Template ID:** `offer_received`

**Subject:** `New offer to review: €{amount}`

**Body:**
```
Hi {expert_name},

You have a new Deep Dive offer from {asker_name}:

Question: "{question_title}"
Offer: €{amount}
{asker_message}

⏰ Review within 24 hours or offer expires

[Review & Accept] [Decline]

— mindPick
```

---

#### 3. Offer Accepted (To Asker)
**Template ID:** `offer_accepted`

**Subject:** `Offer accepted! Answer coming soon`

**Body:**
```
Hi {asker_name},

Great news! @{expert_handle} accepted your €{amount} offer.

What happens next:
✅ Expert will answer within {sla_hours} hours
💰 Payment will be released after answer delivered
🎬 You'll receive an email when answer is ready

Track progress: [View Status →]

— mindPick
```

---

#### 4. Offer Declined (To Asker)
**Template ID:** `offer_declined`

**Subject:** `Offer declined - €{amount} refunded`

**Body:**
```
Hi {asker_name},

@{expert_handle} declined your €{amount} offer.

✅ €{amount} refunded automatically
Funds available on your card now (instant release)

Expert's message:
"{decline_reason}"

Options:
• Submit new offer at higher amount
• Find different expert

[Browse Other Experts] [Resubmit Offer]

— mindPick
```

---

#### 5. Offer Expired (To Asker)
**Template ID:** `offer_expired`

**Subject:** `Offer expired - €{amount} refunded`

**Body:**
```
Hi {asker_name},

Your Deep Dive offer to @{expert_handle} expired after 24 hours with no response.

✅ €{amount} refunded automatically
Funds available on your card now

We're sorry this happened. Try another expert:

[Browse Experts]

— mindPick
```

---

#### 6. Quick Consult Submitted (To Asker)
**Template ID:** `quick_consult_submitted`

**Subject:** `Question submitted - €{amount} reserved`

**Body:**
```
Hi {asker_name},

Your Quick Consult question has been submitted to @{expert_handle}!

Payment status:
💳 €{amount} reserved (not yet charged)
⏰ Expert will answer within {sla_hours} hours
✅ Payment released to expert after answer
🔄 Auto-refund if unanswered

Track your question: [View Status →]

— mindPick
```

---

#### 7. Payment Captured (To Both)
**Template ID:** `payment_captured`

**To Asker:**
```
Subject: Answer received - Payment processed

Hi {asker_name},

Great news! @{expert_handle} answered your question.

Payment processed:
💰 €{amount} charged to your card
🎬 Watch answer now: [View Answer →]

Thanks for using mindPick!

— mindPick
```

**To Expert:**
```
Subject: Payment received - €{expert_amount}

Hi {expert_name},

Payment for question "{question_title}" has been processed.

You received: €{expert_amount}
Platform fee: €{platform_fee}
Total paid: €{total_amount}

Funds will arrive in your account within 2-3 business days.

— mindPick
```

---

## Edge Cases & Business Rules

### Edge Case 1: Asker Submits Wrong Tier

**Problem:** Asker submits complex question as Quick Consult to pay less

**Detection:** Expert reviews and notices complexity mismatch

**Solution (Manual - MVP):**
```
Expert can:
1. Answer anyway (accept the lower price)
2. Message asker: "This is Deep Dive scope, please resubmit"
3. Decline to answer (SLA miss = auto-refund)
```

**Solution (Future - Phase 2):**
```
Expert can "upgrade" question:
"This needs Deep Dive treatment. I'll answer for €150 with 48h SLA. OK?"
→ Asker approves → Additional payment authorized → Question upgraded
```

---

### Edge Case 2: Expert Accepts Then Misses SLA

**Problem:** Expert accepts Deep Dive offer but doesn't answer in time

**Handling:**
```
1. SLA enforcement cron detects overdue question
2. Automatically refunds asker (cancel PaymentIntent)
3. Email to asker: "Refunded - expert missed SLA"
4. Email to expert: "SLA missed - no payment, reputation impact"
5. (Optional) Temporary suspension if repeated offenses
```

---

### Edge Case 3: Multiple Offers to Same Expert

**Problem:** Same asker submits multiple offers for same question

**Prevention:**
```
Frontend validation:
- Track recently submitted offers in localStorage
- Show warning: "You already have a pending offer to this expert"
- Allow resubmit only after decline/expire

Backend validation:
- Check for existing offer_pending from same email
- Reject with 409: "You already have a pending offer"
```

---

### Edge Case 4: Lowball Deep Dive Offers

**Problem:** Asker offers €10 for complex Deep Dive work

**Solution (Auto-Decline):**
```
If expert sets auto_decline_below_cents:
1. Backend checks: proposed_price < auto_decline_threshold
2. Immediately decline and refund
3. Email to asker: "Offer below minimum (€{threshold})"
4. Don't notify expert (save their time)
```

**Solution (Manual Review):**
```
If no auto-decline set:
1. Expert sees offer in pending list
2. Expert declines with message: "Minimum €{amount} for this scope"
3. Asker can resubmit at higher amount
```

---

### Edge Case 5: Payment Capture Failures

**Problem:** Answer delivered, but Stripe capture fails

**Handling:**
```
1. Log error but don't block answer visibility
2. Asker can still watch answer
3. Retry capture automatically (cron job, max 3 attempts)
4. If all retries fail:
   - Alert admin
   - Manual intervention needed
   - (Rare: <0.1% of transactions)
```

---

### Edge Case 6: Expert Disables Tier After Offers Submitted

**Problem:** Expert disables Deep Dive while offers are pending

**Handling:**
```
Backend validation:
- Cannot disable tier if pending offers exist
- Show error: "You have {count} pending offers. Accept or decline them first."
- Only allow disable after all offers resolved
```

---

## Implementation Phases

### Phase 1: Foundation (Week 1-2)

**Backend:**
- [ ] Database migrations (add new columns)
- [ ] Create /expert/pricing-tiers endpoints (GET/PUT)
- [ ] Extend /public/profile to include tier config
- [ ] Create /question/quick-consult endpoint
- [ ] Implement Stripe pre-authorization flow

**Frontend:**
- [ ] Update PublicProfilePage for tier selection
- [ ] Create/extend PaymentScreen component
- [ ] Basic question submission for Quick Consult
- [ ] Expert settings page for tier configuration

**Testing:**
- [ ] End-to-end Quick Consult flow
- [ ] Stripe authorization/capture/cancel flows
- [ ] Expert configuration save/load

**Deliverable:** Quick Consult tier fully working

---

### Phase 2: Deep Dive Offers (Week 3)

**Backend:**
- [ ] Create /question/deep-dive endpoint
- [ ] Create /expert/pending-offers endpoint
- [ ] Create /offers/{id}/accept endpoint
- [ ] Create /offers/{id}/decline endpoint
- [ ] Implement offer expiry logic

**Frontend:**
- [ ] Deep Dive offer submission form
- [ ] Expert dashboard pending offers section
- [ ] Accept/decline offer UI
- [ ] Offer status tracking for askers

**Testing:**
- [ ] End-to-end Deep Dive flow (accept scenario)
- [ ] End-to-end Deep Dive flow (decline scenario)
- [ ] Offer expiry handling

**Deliverable:** Deep Dive negotiation fully working

---

### Phase 3: Automation & Polish (Week 4)

**Backend:**
- [ ] Cron job: Expire pending offers
- [ ] Cron job: Enforce SLA (extend existing)
- [ ] Cron job: Retry failed captures
- [ ] Auto-decline logic for low offers

**Frontend:**
- [ ] Question status tracking page
- [ ] Real-time countdown timers
- [ ] Improved error messaging
- [ ] UI polish and animations

**Email:**
- [ ] Create all 7 email templates
- [ ] Test email delivery
- [ ] Verify email content accuracy

**Testing:**
- [ ] Cron job testing (all scenarios)
- [ ] Email notification testing
- [ ] End-to-end regression testing

**Deliverable:** Production-ready system with automation

---

### Phase 4: Optimization (Week 5+)

**Optional Enhancements:**
- [ ] Analytics dashboard for experts (tier performance)
- [ ] Counter-offer mechanism (instead of just decline)
- [ ] Question tier upgrade flow (expert suggests higher tier)
- [ ] Automatic tier suggestions based on content
- [ ] A/B testing different price guidance

---

## Success Metrics

### Launch Goals (First 3 Months)

**Adoption:**
- [ ] 30% of experts enable Deep Dive
- [ ] 20% of questions are Deep Dive (by volume)
- [ ] 50%+ of new experts set up both tiers

**Quality:**
- [ ] >70% offer acceptance rate (first round)
- [ ] <5% offer expiry rate (experts respond in time)
- [ ] <10% payment abandonment after acceptance

**Revenue:**
- [ ] 25%+ increase in average transaction value (Deep Dive uplift)
- [ ] <5% decrease in conversion rate (negotiation friction)
- [ ] Net: +15% increase in GTV

**User Satisfaction:**
- [ ] Expert NPS: >70 (same or better)
- [ ] Asker NPS: >65 (allow for negotiation friction)
- [ ] <2% support tickets related to pricing confusion

### Key Metrics to Track

**Expert Behavior:**
- Tier adoption rate (Quick only / Deep only / Both)
- Average Quick Consult price
- Average Deep Dive price guidance
- Average accepted Deep Dive price
- Time to review offers

**Asker Behavior:**
- Tier selection rate (Quick vs Deep)
- Deep Dive offer amounts (vs guidance)
- Resubmission rate after decline
- Payment completion rate

**System Performance:**
- Offer acceptance rate by price range
- Average negotiation time
- SLA compliance rate (by tier)
- Payment capture success rate

---

## Technical Dependencies

### External Services
- **Stripe:** Pre-authorization API
- **ZeptoMail:** Email notifications
- **Xano:** Database and API backend
- **Vercel:** Serverless functions and cron jobs

### Required Environment Variables
```bash
# Stripe
STRIPE_SECRET_KEY=sk_xxx
STRIPE_PUBLISHABLE_KEY=pk_xxx

# Xano (existing)
XANO_BASE_URL=https://xlho-4syv-navp.n7e.xano.io/api:3B14WLbJ
XANO_PUBLIC_API_URL=https://xlho-4syv-navp.n7e.xano.io/api:BQW1GS7L

# Email (existing)
ZEPTOMAIL_TOKEN=xxx
ZEPTOMAIL_FROM_EMAIL=noreply@mindpick.me

# Cron Job Security
CRON_SECRET=xxx
```

### npm Packages (Frontend)
```json
{
  "@stripe/stripe-js": "^2.0.0",
  "@stripe/react-stripe-js": "^2.0.0"
}
```

### Vercel Configuration
```json
{
  "crons": [
    {
      "path": "/api/cron/expire-offers",
      "schedule": "0 * * * *"
    },
    {
      "path": "/api/cron/enforce-sla",
      "schedule": "0 * * * *"
    },
    {
      "path": "/api/cron/retry-captures",
      "schedule": "0 * * * *"
    }
  ]
}
```

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| **User confusion** | Low adoption | Clear messaging, progressive disclosure, examples |
| **Negotiation friction** | Conversion drop | Make Quick Consult default, show acceptance rates |
| **Payment failures** | Revenue loss | Retry logic, monitoring, admin alerts |
| **Expert overwhelm** | Poor experience | Auto-decline thresholds, offer expiry |
| **Gaming (wrong tier)** | Expert frustration | Future: Tier upgrade mechanism |

---

## Post-Launch Optimization

### Data to Collect

**Week 1-2:**
- Which tier do experts prefer?
- What's the Quick/Deep split?
- What's the average offer amount?
- What's the acceptance rate?

**Month 1:**
- Are declined users resubmitting?
- What's the common decline reason?
- Is auto-decline being used?
- Any unexpected edge cases?

**Month 2-3:**
- Does Deep Dive increase revenue?
- Does negotiation hurt conversion?
- Are experts satisfied?
- Are askers satisfied?

### Potential Adjustments

**If acceptance rate <60%:**
- Improve price guidance visibility
- Add acceptance rate display
- Add suggested pricing based on complexity

**If expiry rate >10%:**
- Send reminder emails to experts (6h before expiry)
- Increase expiry window to 48h
- Add push notifications

**If resubmission rate <40%:**
- Make decline messages more helpful
- Add "suggest a price" option for experts
- Implement counter-offer mechanism

---

## Documentation Requirements

### For Developers
- [ ] API endpoint documentation
- [ ] Database schema documentation
- [ ] Payment flow diagrams
- [ ] State machine diagrams
- [ ] Cron job specifications

### For Users
- [ ] Help article: "What's the difference between Quick Consult and Deep Dive?"
- [ ] Help article: "How does Deep Dive pricing work?"
- [ ] Help article: "What happens if my offer is declined?"
- [ ] Help article: "When do I get charged?"
- [ ] FAQ: Common questions about new tiers

### For Support Team
- [ ] Troubleshooting guide: Offer expiry issues
- [ ] Troubleshooting guide: Payment failures
- [ ] Troubleshooting guide: SLA disputes
- [ ] Escalation process: When to refund manually

---

## Appendix: Quick Reference

### Question States
```
Quick Consult:
draft → paid → completed (or sla_missed)

Deep Dive:
draft → offer_pending → offer_accepted → completed
              ↓              ↓
        offer_declined   sla_missed
              ↓
        offer_expired
```

### Payment States
```
Quick Consult:
authorized → captured (or refunded)

Deep Dive:
authorized → accepted → captured
     ↓           ↓
refunded    refunded
```

### SLA Timing
```
Quick Consult:
sla_start_time = question submission time
sla_deadline = sla_start_time + tier1_sla_hours

Deep Dive:
sla_start_time = offer acceptance time (NOT submission)
sla_deadline = sla_start_time + tier2_sla_hours
```

### Offer Expiry
```
Deep Dive only:
offer_expires_at = submission time + 24 hours

If NOW() > offer_expires_at AND status = 'offer_pending':
→ Auto-decline and refund
```

---

**End of Specification**

This document provides complete requirements for implementing the two-tier question pricing system. All technical details, user flows, and business rules are specified. Ready for implementation in a separate development chat.

**Document Version:** 1.0  
**Last Updated:** October 2025  
**Status:** Ready for Implementation