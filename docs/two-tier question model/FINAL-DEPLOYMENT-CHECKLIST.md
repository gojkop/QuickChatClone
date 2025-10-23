# Two-Tier System - Final Deployment Checklist

**Date:** October 23, 2025
**Version:** 1.3
**Status:** Ready for Production (99%)

---

## ✅ PRE-DEPLOYMENT VERIFICATION

### 1. Xano Endpoints - Backend Configuration

#### ☑️ POST /question/quick-consult
- [x] Accepts `sla_hours_snapshot` input parameter (Integer, optional)
- [x] Lambda calculates SLA with fallback to tier config
- [x] Lambda generates `playback_token_hash` using UUID()
- [x] Saves token to question record
- [x] Returns token in response
- [x] Creates question with `question_tier = 'tier1'`
- [x] Saves `sla_hours_snapshot` to question record

**Test:**
```bash
POST https://xlho-4syv-navp.n7e.xano.io/api:BQW1GS7L/question/quick-consult
{
  "expert_profile_id": 139,
  "payer_email": "test@example.com",
  "title": "Test Quick Consult",
  "sla_hours_snapshot": 24,
  "stripe_payment_intent_id": "pi_test_123"
}
```

**Expected Response:**
```json
{
  "question_id": 215,
  "playback_token_hash": "abc123-def456-ghi789",
  "status": "paid",
  "sla_deadline": 1729800000000,
  "final_price_cents": 5000
}
```

---

#### ☑️ POST /question/deep-dive
- [x] Accepts `sla_hours_snapshot` input parameter (Integer, optional)
- [x] Auto-decline logic checks threshold during creation
- [x] Lambda generates conditional status values (4A, 4B, 4C)
- [x] Lambda generates `playback_token_hash` using UUID()
- [x] Saves token to question record
- [x] Returns token in response
- [x] Creates question with `question_tier = 'tier2'`
- [x] Auto-declined offers have `pricing_status = 'offer_declined'`
- [x] Saves decline reason for auto-declined offers

**Test Auto-Accept:**
```bash
POST https://xlho-4syv-navp.n7e.xano.io/api:BQW1GS7L/question/deep-dive
{
  "expert_profile_id": 139,
  "payer_email": "test@example.com",
  "proposed_price_cents": 7000,  # Above threshold
  "title": "Test Deep Dive",
  "sla_hours_snapshot": 48,
  "stripe_payment_intent_id": "pi_test_456"
}
```

**Expected Response:**
```json
{
  "question_id": 216,
  "playback_token_hash": "xyz789-abc123",
  "status": "offer_pending",
  "proposed_price_cents": 7000,
  "offer_expires_at": 1729900000000
}
```

**Test Auto-Decline:**
```bash
# Same request but with proposed_price_cents below auto_decline_below_cents
{
  "proposed_price_cents": 3000  # Below threshold (if set to 5000)
}
```

**Expected Response:**
```json
{
  "question_id": 217,
  "playback_token_hash": "def456-ghi789",
  "status": "offer_declined",
  "decline_reason": "Offer below minimum threshold of $50"
}
```

---

#### ☑️ GET /expert/pending-offers
- [x] Filters by `pricing_status = 'offer_pending'`
- [x] Filters by authenticated expert's profile ID
- [x] Excludes expired offers
- [x] Returns offer details with title, proposed price, expiry

**Test:**
```bash
GET https://xlho-4syv-navp.n7e.xano.io/api:BQW1GS7L/expert/pending-offers
Authorization: Bearer {expert_token}
```

**Expected Response:**
```json
{
  "offers": [
    {
      "question_id": 216,
      "title": "Test Deep Dive",
      "proposed_price_cents": 7000,
      "offer_expires_at": 1729900000000,
      "asker_message": "Need help with...",
      "text": "Question details...",
      "created_at": 1729813600000
    }
  ],
  "count": 1
}
```

---

#### ☑️ POST /offers/[id]/accept
- [x] Updates `pricing_status` to 'offer_accepted'
- [x] Updates `status` to 'paid'
- [x] Starts SLA timer
- [x] Returns success response

**Test:**
```bash
POST https://xlho-4syv-navp.n7e.xano.io/api:BQW1GS7L/offers/216/accept
Authorization: Bearer {expert_token}
```

---

#### ☑️ POST /offers/[id]/decline
- [x] Updates `pricing_status` to 'offer_declined'
- [x] Updates `status` to 'declined'
- [x] Records decline reason
- [x] Sets declined_at timestamp
- [x] Handles missing payment records gracefully

**Test:**
```bash
POST https://xlho-4syv-navp.n7e.xano.io/api:BQW1GS7L/offers/216/decline
Authorization: Bearer {expert_token}
Content-Type: application/json

{
  "decline_reason": "Expert declined - price too low"
}
```

---

#### ☑️ GET /me/questions
- [x] Returns all tier fields
- [x] Includes `question_tier`, `pricing_status`, `sla_hours_snapshot`
- [x] Supports filtering by status
- [x] Used by expert dashboard

---

#### ⚠️ GET /review/{token} (NEEDS VERIFICATION)
- [x] Returns `pricing_status`
- [x] Returns `decline_reason`
- [ ] **VERIFY:** Returns `offer_expires_at` ← **CHECK THIS**

**Test:**
```bash
GET https://xlho-4syv-navp.n7e.xano.io/api:BQW1GS7L/review/{token}
```

**Expected Response (Deep Dive Pending):**
```json
{
  "id": 216,
  "title": "Test Deep Dive",
  "pricing_status": "offer_pending",
  "decline_reason": null,
  "offer_expires_at": 1729900000000,  // ← VERIFY THIS FIELD EXISTS
  "sla_hours_snapshot": 48,
  // ... other fields ...
}
```

**If `offer_expires_at` is missing:**
1. Open Xano → Public API → GET /review/{token}
2. Find Response step
3. Add: `offer_expires_at: question.offer_expires_at`
4. Save and test

---

### 2. Frontend Components - Code Verification

#### ☑️ ExpertDashboardPage.jsx
- [x] Tab filtering logic correctly separates Pending/Answered/All
- [x] Pending tab excludes declined and hidden questions
- [x] All tab includes declined, expired, hidden questions
- [x] Count badges display correctly
- [x] Pending offers filtered from main list

**Manual Test:**
1. Go to `/expert` dashboard
2. Check Pending tab - should only show actionable questions
3. Check All tab - should show declined questions
4. Verify count badges match actual counts

---

#### ☑️ PendingOffersSection.jsx
- [x] Cards are clickable (opens QuestionDetailModal)
- [x] Accept/Decline buttons don't trigger modal
- [x] Time colors change at 20% threshold
- [x] Hover effects work
- [x] No "View Full Question" button

**Manual Test:**
1. Submit a Deep Dive offer
2. Check expert dashboard
3. Click on card (not buttons) → modal should open
4. Click Accept/Decline → modal should NOT open
5. Check time color (should be orange unless < 20% remaining)

---

#### ☑️ QuestionTable.jsx
- [x] Time Left column uses 20% threshold
- [x] Red color only when < 20% time remaining
- [x] Overdue questions show red

**Manual Test:**
1. Check Time Left column in question table
2. Verify colors are appropriate
3. Questions with plenty of time should not be red

---

#### ☑️ AnswerReviewPage.jsx
- [x] Shows "Awaiting Expert Review" for pending offers
- [x] Shows countdown timer (if `offer_expires_at` available)
- [x] Shows "Answer In Progress" for accepted offers
- [x] Shows declined banner for declined offers
- [x] Avatar error handling works
- [x] No React errors in console

**Manual Test:**
1. Submit Deep Dive offer → Open `/r/{token}`
2. Should see "Awaiting Expert Review" with countdown
3. Expert accepts → Should change to "Answer In Progress"
4. Submit low offer (auto-decline) → Should see declined banner

---

### 3. Email Notifications - Integration Test

#### ☑️ Quick Consult Emails
- [x] Expert receives "New question" email
- [x] Asker receives confirmation email
- [x] Both emails contain review link with token

**Test:**
1. Submit Quick Consult question
2. Check both email inboxes
3. Verify links work

---

#### ☑️ Deep Dive Emails
- [x] Expert receives "New offer" email
- [x] Asker receives confirmation email
- [x] Both emails contain review link with token

**Test:**
1. Submit Deep Dive offer
2. Check both email inboxes
3. Verify links work

---

### 4. End-to-End User Flows

#### ☑️ Quick Consult Flow
1. [ ] Asker visits expert profile
2. [ ] Selects Quick Consult tier
3. [ ] Submits question
4. [ ] Receives confirmation email
5. [ ] Opens `/r/{token}` → sees "Answer In Progress"
6. [ ] Expert sees question in Pending tab
7. [ ] Expert answers question
8. [ ] Asker receives answer notification
9. [ ] Asker opens `/r/{token}` → sees answer

---

#### ☑️ Deep Dive Flow (Accepted)
1. [ ] Asker visits expert profile
2. [ ] Selects Deep Dive tier
3. [ ] Proposes price above auto-decline threshold
4. [ ] Submits question
5. [ ] Receives confirmation email
6. [ ] Opens `/r/{token}` → sees "Awaiting Expert Review" with countdown
7. [ ] Expert sees offer in PendingOffersSection
8. [ ] Expert clicks card → views full details
9. [ ] Expert accepts offer
10. [ ] Asker's page updates to "Answer In Progress"
11. [ ] Question moves to expert's Pending tab
12. [ ] Expert answers question
13. [ ] Asker receives answer

---

#### ☑️ Deep Dive Flow (Auto-Declined)
1. [ ] Asker visits expert profile
2. [ ] Selects Deep Dive tier
3. [ ] Proposes price **below** auto-decline threshold
4. [ ] Submits question
5. [ ] Question created with `pricing_status = 'offer_declined'`
6. [ ] Asker opens `/r/{token}` → sees declined banner
7. [ ] Expert sees declined question only in All tab (not Pending)
8. [ ] Expert opens question → sees declined banner

---

#### ☑️ Deep Dive Flow (Expert Declined)
1. [ ] Expert receives Deep Dive offer
2. [ ] Expert clicks Decline button
3. [ ] Enters decline reason (optional)
4. [ ] Offer removed from PendingOffersSection
5. [ ] Question appears in All tab with declined status
6. [ ] Asker's page shows declined banner with reason

---

### 5. Database Verification

#### ☑️ Check Question Records
```sql
-- Recent questions should have all fields populated
SELECT
  id,
  question_tier,
  pricing_status,
  sla_hours_snapshot,
  playback_token_hash,
  offer_expires_at,
  decline_reason
FROM question
WHERE created_at > [recent_timestamp]
ORDER BY created_at DESC
LIMIT 10;
```

**Verify:**
- [ ] `question_tier` is 'tier1' or 'tier2' (not null)
- [ ] `pricing_status` is correct (offer_pending, offer_accepted, offer_declined, or null)
- [ ] `sla_hours_snapshot` is populated (not null)
- [ ] `playback_token_hash` exists (not null)
- [ ] `offer_expires_at` exists for Deep Dive questions

---

#### ☑️ Check Expert Profiles
```sql
-- Verify tier configuration fields exist
SELECT
  id,
  tier1_enabled,
  tier1_price_cents,
  tier1_sla_hours,
  tier2_enabled,
  tier2_min_price_cents,
  tier2_max_price_cents,
  tier2_sla_hours,
  tier2_auto_decline_below_cents
FROM expert_profile
WHERE id = [test_expert_id];
```

**Verify:**
- [ ] All tier fields present
- [ ] Default values set correctly
- [ ] Auto-decline threshold configured

---

## 🚀 DEPLOYMENT STEPS

### Step 1: Final Code Review
- [ ] All changes committed to Git
- [ ] No console.log or debug statements in production code
- [ ] No hardcoded test values
- [ ] Environment variables properly set

### Step 2: Xano Verification
- [ ] ⚠️ **CRITICAL:** Verify `offer_expires_at` in GET /review/{token}
- [ ] Test all endpoints with Postman/Insomnia
- [ ] Verify Lambda functions work correctly
- [ ] Check error handling

### Step 3: Push to GitHub
```bash
git add .
git commit -m "Two-tier system v1.3: UX polish, tab filtering, 20% time threshold, pending offer status"
git push origin main
```

### Step 4: Vercel Deployment
- [ ] Vercel auto-deploys from GitHub
- [ ] Check deployment logs for errors
- [ ] Verify build completes successfully

### Step 5: Production Smoke Tests
1. [ ] Quick Consult submission works
2. [ ] Deep Dive submission works
3. [ ] Auto-decline works (offer < threshold)
4. [ ] Expert can accept offers
5. [ ] Expert can decline offers
6. [ ] Dashboard tabs filter correctly
7. [ ] Pending offer cards are clickable
8. [ ] Time colors show correctly (20% threshold)
9. [ ] Asker sees pending offer status
10. [ ] Review links (`/r/{token}`) work
11. [ ] Emails are sent correctly
12. [ ] No console errors

### Step 6: Monitor for Issues
- [ ] Check Vercel function logs
- [ ] Monitor Sentry (if configured)
- [ ] Check email delivery
- [ ] Watch for user reports

---

## 🐛 KNOWN ISSUES TO MONITOR

### Minor Issues (Graceful Degradation):
1. **`offer_expires_at` missing from Xano:**
   - Impact: Countdown timer won't show on asker side
   - User still sees "Awaiting Expert Review" message
   - No errors or broken functionality

### Non-Critical:
- Settings Modal not deployed (tier configuration UI)
- No real Stripe integration (using mock payment IDs)
- No analytics tracking yet

---

## 📊 SUCCESS METRICS

After deployment, monitor these metrics:

### Day 1:
- [ ] No critical errors in logs
- [ ] All email notifications sent
- [ ] Questions created successfully
- [ ] Offers accepted/declined successfully

### Week 1:
- [ ] Deep Dive adoption rate (% of questions)
- [ ] Offer acceptance rate
- [ ] Auto-decline rate
- [ ] Time to accept/decline offers
- [ ] User feedback

---

## 🆘 ROLLBACK PLAN

If critical issues occur:

### Option 1: Quick Fix
1. Identify issue in Vercel logs
2. Fix in code
3. Push to GitHub
4. Auto-deploy

### Option 2: Rollback Deployment
1. Go to Vercel dashboard
2. Find previous deployment
3. Click "Promote to Production"
4. Investigate issue offline

### Option 3: Disable Feature
1. Set environment variable to disable two-tier
2. Redeploy
3. Fix issue
4. Re-enable

---

## ✅ FINAL SIGN-OFF

**Before going to production:**

- [ ] All Xano endpoints tested
- [ ] All frontend features tested
- [ ] Email flows verified
- [ ] Database schema correct
- [ ] Documentation updated
- [ ] Team notified
- [ ] Rollback plan ready

**Deployment Approved By:**
- [ ] Developer: _____________
- [ ] QA: _____________
- [ ] Product Owner: _____________

**Deployment Date:** _____________
**Deployment Time:** _____________
**Deployed By:** _____________

---

## 📞 SUPPORT CONTACTS

**Technical Issues:**
- Developer: Available via Claude Code
- Xano Support: support@xano.com
- Vercel Support: support@vercel.com

**Documentation:**
- Implementation Status: `IMPLEMENTATION-STATUS.md`
- Session Summary: `SESSION-SUMMARY-OCT-23-2025-AFTERNOON.md`
- Xano Guides: `docs/two-tier question model/`

---

**Last Updated:** October 23, 2025
**Version:** 1.3
**Status:** Ready for Production (pending 1 field verification)
