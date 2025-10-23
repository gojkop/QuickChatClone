# Two-Tier Pricing System - Documentation Index

**Last Updated:** October 23, 2025
**Version:** 1.3
**Status:** ✅ Production Ready (99%)

---

## 📚 Quick Navigation

### 🚀 **Start Here**
If you're new to the two-tier system, start with these documents:

1. **[IMPLEMENTATION-STATUS.md](./IMPLEMENTATION-STATUS.md)** - Complete overview and current status
2. **[QUICK-REFERENCE.md](./QUICK-REFERENCE.md)** - One-page cheat sheet (coming soon)
3. **[FINAL-DEPLOYMENT-CHECKLIST.md](./FINAL-DEPLOYMENT-CHECKLIST.md)** - Pre-deployment verification

---

## 📖 Documentation Categories

### 1. Overview & Status

| Document | Purpose | Last Updated |
|----------|---------|--------------|
| **[IMPLEMENTATION-STATUS.md](./IMPLEMENTATION-STATUS.md)** | Overall project status, completion rates, timeline | Oct 23, 2025 |
| **[implementation-specificaiton.md](./implementation-specificaiton.md)** | Original specification and requirements | Oct 2025 |
| **[TIER-FLOW-EXPLANATION.md](./TIER-FLOW-EXPLANATION.md)** | How the two tiers work (Quick Consult vs Deep Dive) | Oct 2025 |

**Quick Summary:**
- **Status:** 99% complete, production ready
- **Quick Consult:** Fixed-price, immediate expert response
- **Deep Dive:** Expert reviews offer, can accept/decline

---

### 2. Session Summaries (Chronological)

Latest session first:

| Document | Date | Key Changes |
|----------|------|-------------|
| **[SESSION-SUMMARY-OCT-23-2025-AFTERNOON.md](./SESSION-SUMMARY-OCT-23-2025-AFTERNOON.md)** | Oct 23 PM | Tab filtering, clickable cards, 20% time colors, pending status |
| **[SESSION-SUMMARY-OCT-23-2025.md](./SESSION-SUMMARY-OCT-23-2025.md)** | Oct 23 AM | SLA tracking, auto-decline, flexible pricing, panel stability |
| **[SESSION-SUMMARY-OCT-22-EVENING.md](./SESSION-SUMMARY-OCT-22-EVENING.md)** | Oct 22 PM | Visual refinements, SLA display fixes |
| **[SESSION-SUMMARY.md](./SESSION-SUMMARY.md)** | Oct 22 AM | Initial implementation |

**Use these to:** Understand what changed and when, find specific implementation details

---

### 3. Implementation Guides

#### Frontend Implementation

| Document | Purpose |
|----------|---------|
| **[FRONTEND-IMPLEMENTATION-COMPLETE.md](./FRONTEND-IMPLEMENTATION-COMPLETE.md)** | Complete frontend implementation guide |
| **[FRONTEND-IMPLEMENTATION-PLAN.md](./FRONTEND-IMPLEMENTATION-PLAN.md)** | Original frontend plan |

**Key Components:**
- `TierSelector.jsx` - Tier selection on public profile
- `PendingOffersSection.jsx` - Offer management (clickable cards)
- `QuestionTable.jsx` - Question list with tier badges
- `ExpertDashboardPage.jsx` - Dashboard with tab filtering
- `AnswerReviewPage.jsx` - Asker's view with pending status

#### Backend/API Implementation

| Document | Purpose |
|----------|---------|
| **[API-IMPLEMENTATION-COMPLETE.md](./API-IMPLEMENTATION-COMPLETE.md)** | Vercel API endpoints documentation |

**Endpoints:**
- `POST /api/questions/quick-consult` - Quick Consult submission
- `POST /api/questions/deep-dive` - Deep Dive offer submission
- `POST /api/offers/[id]/accept` - Accept offer
- `POST /api/offers/[id]/decline` - Decline offer
- `GET /api/expert/pending-offers` - Get pending offers

#### Xano Implementation

| Document | Purpose |
|----------|---------|
| **[XANO-API-IMPLEMENTATION-GUIDE.md](./XANO-API-IMPLEMENTATION-GUIDE.md)** | Complete Xano endpoint guide |
| **[XANO-IMPLEMENTATION-CHECKLIST.md](./XANO-IMPLEMENTATION-CHECKLIST.md)** | Xano implementation checklist |
| **[XANO-LAMBDA-GUIDE.md](./XANO-LAMBDA-GUIDE.md)** | Lambda function troubleshooting |

**Xano Endpoints:**
- `POST /question/quick-consult` - Create Quick Consult
- `POST /question/deep-dive` - Create Deep Dive with auto-decline
- `POST /offers/[id]/accept` - Accept offer
- `POST /offers/[id]/decline` - Decline offer
- `GET /expert/pending-offers` - Get pending offers
- `GET /review/{token}` - Get question by review token

---

### 4. Feature-Specific Guides

#### Auto-Decline System

| Document | Purpose |
|----------|---------|
| **[AUTO-DECLINE-XANO-IMPLEMENTATION.md](./AUTO-DECLINE-XANO-IMPLEMENTATION.md)** | Complete auto-decline implementation |

**How it works:**
- Checks `tier2_auto_decline_below_cents` threshold
- Automatically declines offers below threshold during creation
- No authentication required (atomic operation)
- Sets `pricing_status = 'offer_declined'` and records reason

#### Declined Status UI

| Document | Purpose |
|----------|---------|
| **[DECLINED-STATUS-UI.md](./DECLINED-STATUS-UI.md)** | Declined offer UI for askers and experts |

**Features:**
- Red/orange banner on asker side
- Shows decline reason
- Expert sees declined status in modal
- "Answer This Question" button hidden for declined offers

#### SLA Hours Tracking

| Document | Purpose |
|----------|---------|
| **[XANO-SLA-HOURS-SNAPSHOT-FIX.md](./XANO-SLA-HOURS-SNAPSHOT-FIX.md)** | SLA hours snapshot implementation |

**Purpose:** Preserves SLA hours from purchase time (historical accuracy)

#### Token Generation

| Document | Purpose |
|----------|---------|
| **[XANO-TOKEN-GENERATION-FIX.md](./XANO-TOKEN-GENERATION-FIX.md)** | Review token generation fix |

**Implementation:** Uses Xano built-in `UUID()` function for `playback_token_hash`

#### Pricing Validation

| Document | Purpose |
|----------|---------|
| **[PRICING-VALIDATION-UPDATE.md](./PRICING-VALIDATION-UPDATE.md)** | Min/max as suggestions, not limits |

**Key Change:** Only auto-decline threshold is enforced, min/max are suggestions

---

### 5. Bug Fixes & Troubleshooting

| Document | Issue Fixed |
|----------|-------------|
| **[XANO-QUESTION-TIER-FIELD-MISSING.md](./XANO-QUESTION-TIER-FIELD-MISSING.md)** | POST endpoints missing tier fields |
| **[XANO-GET-QUESTIONS-MISSING-FIELDS.md](./XANO-GET-QUESTIONS-MISSING-FIELDS.md)** | GET endpoint missing tier fields |
| **[XANO-DECLINE-OFFER-FIX.md](./XANO-DECLINE-OFFER-FIX.md)** | Decline endpoint error handling |
| **[XANO-REVIEW-ENDPOINT-UPDATE.md](./XANO-REVIEW-ENDPOINT-UPDATE.md)** | Review endpoint missing fields |
| **[URGENT-XANO-DECLINE-ENDPOINT-MISSING.md](./URGENT-XANO-DECLINE-ENDPOINT-MISSING.md)** | Missing decline endpoint |
| **[EMAIL-NOTIFICATIONS-FIX.md](./EMAIL-NOTIFICATIONS-FIX.md)** | Email notification fixes |
| **[XANO-PROFILE-ENDPOINT-UPDATE.md](./XANO-PROFILE-ENDPOINT-UPDATE.md)** | Profile endpoint tier fields |

---

### 6. Database & Migration

| Document | Purpose |
|----------|---------|
| **[DATABASE-MIGRATION-PLAN.md](./DATABASE-MIGRATION-PLAN.md)** | Database schema changes plan |
| **[XANO-MIGRATION-CHECKLIST.md](./XANO-MIGRATION-CHECKLIST.md)** | Migration verification checklist |
| **[MIGRATION-VERIFICATION-CHECKLIST.md](./MIGRATION-VERIFICATION-CHECKLIST.md)** | Post-migration verification |

**Database Changes:**

#### expert_profile table:
- `tier1_enabled`, `tier1_price_cents`, `tier1_sla_hours`, `tier1_description`
- `tier2_enabled`, `tier2_min_price_cents`, `tier2_max_price_cents`, `tier2_sla_hours`, `tier2_description`
- `tier2_auto_decline_below_cents`, `tier2_pricing_mode`

#### question table:
- `question_tier` ('tier1' or 'tier2')
- `pricing_status` ('offer_pending', 'offer_accepted', 'offer_declined')
- `proposed_price_cents`, `final_price_cents`
- `asker_message`, `offer_expires_at`, `decline_reason`
- `sla_hours_snapshot`, `playback_token_hash`

---

### 7. Deployment & Testing

| Document | Purpose |
|----------|---------|
| **[FINAL-DEPLOYMENT-CHECKLIST.md](./FINAL-DEPLOYMENT-CHECKLIST.md)** | Pre-deployment verification |
| **[DEPLOYMENT-CHECKLIST.md](./DEPLOYMENT-CHECKLIST.md)** | Original deployment guide |

**Use before deploying:**
1. Verify all Xano endpoints
2. Test all frontend features
3. Verify email flows
4. Run smoke tests
5. Verify rollback plan

---

### 8. Reference & Cleanup

| Document | Purpose |
|----------|---------|
| **[DOCUMENTATION-INDEX.md](./DOCUMENTATION-INDEX.md)** | Original documentation index |
| **[CLEANUP-LEGACY-CODE.md](./CLEANUP-LEGACY-CODE.md)** | Legacy code cleanup guide |

---

## 🎯 Common Tasks - Quick Links

### "I need to..."

#### Deploy to Production
→ Read: [FINAL-DEPLOYMENT-CHECKLIST.md](./FINAL-DEPLOYMENT-CHECKLIST.md)

#### Understand What Changed Today
→ Read: [SESSION-SUMMARY-OCT-23-2025-AFTERNOON.md](./SESSION-SUMMARY-OCT-23-2025-AFTERNOON.md)

#### Check Overall Status
→ Read: [IMPLEMENTATION-STATUS.md](./IMPLEMENTATION-STATUS.md)

#### Implement Auto-Decline
→ Read: [AUTO-DECLINE-XANO-IMPLEMENTATION.md](./AUTO-DECLINE-XANO-IMPLEMENTATION.md)

#### Add Declined Status UI
→ Read: [DECLINED-STATUS-UI.md](./DECLINED-STATUS-UI.md)

#### Fix a Xano Endpoint
→ Read relevant file from "Bug Fixes & Troubleshooting" section

#### Understand Database Schema
→ Read: [DATABASE-MIGRATION-PLAN.md](./DATABASE-MIGRATION-PLAN.md)

#### Debug Lambda Functions
→ Read: [XANO-LAMBDA-GUIDE.md](./XANO-LAMBDA-GUIDE.md)

---

## 📊 System Overview (Quick Reference)

### Two Pricing Tiers

#### Quick Consult (Tier 1)
- **Fixed Price:** Set by expert (e.g., $50)
- **SLA:** Set by expert (e.g., 24 hours)
- **Flow:** Asker pays → Question created → Expert answers
- **Status:** Always `status = 'paid'`

#### Deep Dive (Tier 2)
- **Custom Price:** Asker proposes, expert reviews
- **Min/Max:** Suggestions only (not enforced)
- **Auto-Decline:** Below threshold (enforced)
- **SLA:** Starts after expert accepts offer
- **Flow:** Asker proposes → Expert reviews → Accept/Decline → Answer

### Pricing Status Flow (Deep Dive Only)

```
Asker Submits Offer
        ↓
  Auto-Decline Check
        ↓
   ┌────┴────┐
   ↓         ↓
Below      Above
Threshold  Threshold
   ↓         ↓
offer_    offer_
declined  pending
           ↓
    Expert Reviews
           ↓
      ┌────┴────┐
      ↓         ↓
   Accept    Decline
      ↓         ↓
   offer_    offer_
  accepted  declined
      ↓
   Expert
   Answers
```

### Dashboard Tabs

- **Pending:** Unanswered, non-declined, non-hidden questions
- **Answered:** Completed questions only
- **All:** Everything (declined, expired, hidden)

### Time Colors (20% Threshold)

- **Normal:** > 20% time remaining (no color or orange)
- **Urgent:** < 20% time remaining (red)
- **Overdue/Expired:** Past deadline (red)

---

## 🔗 External References

### Xano Documentation
- Xano Dashboard: https://xano.com
- Lambda Functions: Use `$var.` prefix for previous step variables
- Built-in Functions: `UUID()`, `Date.now()`, etc.

### Frontend Components
- React Router v6
- Tailwind CSS
- Lucide React icons

### Backend
- Vercel Serverless Functions
- ZeptoMail for emails

---

## 📝 Version History

| Version | Date | Key Changes |
|---------|------|-------------|
| 1.3 | Oct 23, 2025 PM | Tab filtering, clickable cards, 20% colors, pending status |
| 1.2 | Oct 23, 2025 AM | SLA tracking, auto-decline, flexible pricing |
| 1.1 | Oct 22, 2025 PM | Visual refinements, bug fixes |
| 1.0 | Oct 22, 2025 AM | Initial implementation |

---

## 🆘 Need Help?

### Documentation Issues
- Missing information? Check session summaries
- Unclear instructions? Check implementation guides
- Need step-by-step? Check deployment checklist

### Technical Issues
- Frontend bugs? Check `FRONTEND-IMPLEMENTATION-COMPLETE.md`
- Xano errors? Check `XANO-LAMBDA-GUIDE.md`
- Email problems? Check `EMAIL-NOTIFICATIONS-FIX.md`

### Still Stuck?
1. Check [IMPLEMENTATION-STATUS.md](./IMPLEMENTATION-STATUS.md) for known issues
2. Search documentation files for specific error messages
3. Review relevant session summary for context

---

**Last Updated:** October 23, 2025
**Maintained By:** Development Team
**Total Documents:** 30 files
