# Stripe Deep Dive Payment Flow - Implementation Status

**Date**: October 23, 2025
**Status**: Partially Working - Needs Debugging

## Summary

We implemented Stripe payment integration with two different flows for Quick Consult and Deep Dive questions. Quick Consult works perfectly with immediate capture. Deep Dive authorize-and-hold flow has been implemented but is not working correctly yet.

---

## What Was Implemented Today

### 1. Core Stripe Integration ✅ (Working)
- **Feature Flag System**: `STRIPE_ENABLED` environment variable to toggle Stripe on/off
- **Mock Mode**: Automatic fallback when Stripe is disabled (generates fake payment IDs)
- **Payment Intent Creation**: `/api/payments/create-intent.js` endpoint
- **Stripe Service Layer**: `/api/lib/stripe.js` with all payment operations
- **Frontend Hook**: `usePayment.js` for React components
- **Payment UI**: `PaymentPlaceholder.jsx` and `StripePaymentForm.jsx`

### 2. Two-Tier Payment Flows (Partially Working)

#### Quick Consult (Tier 1) ✅ WORKING
- **Capture Method**: `automatic`
- **Flow**: Payment captured immediately when user submits question
- **Status**: Works perfectly - payment shows "Succeeded" in Stripe

#### Deep Dive (Tier 2) ❌ NOT WORKING YET
- **Capture Method**: `manual` (authorize-and-hold)
- **Intended Flow**:
  1. Authorize payment when question submitted (hold funds)
  2. Capture payment when expert accepts offer
  3. Cancel payment when expert declines offer
- **Current Issue**: Payment is being captured immediately instead of held

### 3. Accept/Decline Endpoints (Implemented but Untested)
- **Accept Endpoint**: `/api/offers/[id]/accept.js` - Captures held payment
- **Decline Endpoint**: `/api/offers/[id]/decline.js` - Cancels held payment
- **Frontend Integration**: Updated `PendingOffersSection.jsx` to call Vercel endpoints

---

## What's Working ✅

1. **Quick Consult payments** - Immediate capture works perfectly
2. **Mock mode** - Generates fake payment IDs for testing without Stripe
3. **Payment intent creation** - Successfully creates payment intents in Stripe
4. **Frontend payment form** - Stripe Elements integration working
5. **Payment confirmation** - Accepts both `succeeded` and `requires_capture` statuses

---

## What's NOT Working ❌

### Primary Issue: Deep Dive Capture Method

**Problem**: Deep Dive payments are showing `capture_method: automatic` in Stripe instead of `manual`

**Evidence from Vercel Logs**:
```
💳 Creating payment intent: $108.00 USD
Capture method: automatic  ❌ Should be "manual"
Description: 'Deep Dive: 55555'
tier_type: "deep_dive"
```

**What Should Happen**:
- Frontend sets: `captureMethod: tierType === 'deep_dive' ? 'manual' : 'automatic'`
- Backend should receive: `captureMethod: 'manual'`
- Stripe should show: Status "Uncaptured" (not "Succeeded")

**What IS Happening**:
- Backend receives: `captureMethod: 'automatic'`
- Stripe shows: Status "Succeeded" (payment captured immediately)

### Secondary Issue: Decline Not Working

**Problem**: When expert declines a Deep Dive offer, the Stripe payment is not being canceled

**Evidence**:
- User reported: "I do not see anything regarding decline" in Vercel logs
- Stripe Dashboard: Payment still shows as active/succeeded

**Root Cause**: Frontend was calling Xano's decline endpoint directly, bypassing our Vercel function
- **Fixed**: Changed `PendingOffersSection.jsx` to call `/api/offers/[id]/decline`
- **Status**: Not yet tested with new deployment

---

## Debugging Steps Added

We added comprehensive logging throughout the payment flow:

### Frontend Logs
```javascript
// PaymentPlaceholder.jsx
🔍 [PAYMENT] Tier type: {tierType}, Capture method: {captureMethod}

// usePayment.js
💳 Creating payment intent: ${amount}
   Stripe enabled: {enabled}
   Capture method: {captureMethod}

// StripePaymentForm.jsx
🔍 [STRIPE FORM] Confirming payment with client secret: ...
🔍 [STRIPE FORM] Payment confirmation result: {status, captureMethod, ...}
```

### Backend Logs (Vercel)
```javascript
// create-intent.js
💳 Creating payment intent: ${amount} ${currency}
   Capture method: {captureMethod}

// stripe.js
📤 [STRIPE] Sending to Stripe API: {full request object}
📥 [STRIPE] Response from Stripe: {id, status, capture_method, ...}

// decline.js
🚫 Declining offer {id} and canceling payment...
🔍 Question data: {id, hasPaymentIntentId, paymentIntentId, questionKeys}
💳 Canceling payment intent: {id}
✅ Payment canceled: {id}, status: {status}
```

---

## Files Modified Today

### Created
- `/api/lib/stripe.js` - Stripe service with mock mode
- `/api/payments/create-intent.js` - Payment intent creation endpoint
- `/api/offers/[id]/accept.js` - Accept offer + capture payment
- `/api/offers/[id]/decline.js` - Decline offer + cancel payment
- `/src/hooks/usePayment.js` - React payment hook
- `/src/components/question-flow-v2/payment/PaymentPlaceholder.jsx` - Payment UI
- `/src/components/question-flow-v2/payment/StripePaymentForm.jsx` - Stripe form
- `/docs/integrations/STRIPE-INTEGRATION.md` - Technical documentation
- `/docs/integrations/STRIPE-SETUP-GUIDE.md` - Setup guide

### Modified
- `/src/pages/AskQuestionPage.jsx` - Added payment modal to question flow
- `/src/components/dashboard/PendingOffersSection.jsx` - Changed accept/decline to call Vercel endpoints
- `/api/questions/deep-dive.js` - Added `stripe_payment_intent_id` parameter
- `package.json` - Added Stripe dependencies
- `.env.example` - Added Stripe configuration

---

## Next Steps / TODO

### CRITICAL: Fix Deep Dive Capture Method

**Step 1: Verify Deployment**
1. Check Vercel dashboard - confirm latest commit `730b479` is deployed
2. Wait for build to complete (2-3 minutes)
3. Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+F5)

**Step 2: Test with Fresh Deep Dive Question**
1. Create a new Deep Dive question
2. Check **browser console** for this log:
   ```
   🔍 [PAYMENT] Tier type: deep_dive, Capture method: manual
   ```
3. If it shows `manual` in browser but `automatic` in Vercel logs → investigate the data flow

**Step 3: Debug Data Flow**
The `captureMethod` parameter flows through these files:
1. `PaymentPlaceholder.jsx` line 50: Sets `manual` for Deep Dive
2. `usePayment.js` line 34: Should receive and forward to API
3. `create-intent.js` line 17: Should receive from request body
4. `stripe.js` line 89: Should send to Stripe as `capture_method`

**Verify each step** by checking the logs at each layer.

**Step 4: Check for Caching Issues**
- Clear browser cache completely
- Try in incognito/private browsing mode
- Check if Vercel is caching the old code (redeploy if needed)

### Test Decline Functionality

**After capture method is fixed:**

1. Create a Deep Dive question (should show "Uncaptured" in Stripe)
2. Go to expert dashboard → Pending Offers
3. Click "Decline" on the offer
4. Check **Vercel function logs** for:
   ```
   🚫 Declining offer XXX and canceling payment...
   🔍 Question data: {...}
   💳 Canceling payment intent: pi_xxx...
   ✅ Payment canceled: pi_xxx, status: canceled
   ```
5. Check **Stripe Dashboard** - payment should change from "Uncaptured" to "Canceled"

### Verify Accept Functionality

**After both above are working:**

1. Create a Deep Dive question (should show "Uncaptured" in Stripe)
2. Go to expert dashboard → Pending Offers
3. Click "Accept" on the offer
4. Check **Vercel function logs** for:
   ```
   💰 Accepting offer XXX and capturing payment...
   🔍 Question data: {...}
   💳 Capturing payment intent: pi_xxx...
   ✅ Payment captured: pi_xxx, status: succeeded
   ```
5. Check **Stripe Dashboard** - payment should change from "Uncaptured" to "Succeeded"

### Verify Payment Intent ID Storage in Xano

**If decline/accept show "No payment intent ID found":**

1. Check if `stripe_payment_intent_id` is being saved in Xano database
2. Verify Xano endpoint `/question/deep-dive` accepts and stores this field
3. Verify Xano endpoint `/question/{id}` returns this field
4. Check the debug log: `🔍 Question data: {questionKeys: [...]}`
5. If field name is different, update the accept/decline endpoints

### Fix Attachments, Documents, Audio, Video Submission

**After payment flow is working:**

1. Test submitting a question with:
   - Audio recording
   - Video recording
   - File attachments (PDF, images, etc.)
   - Text + media combination

2. Verify in browser console:
   - Check the submission payload in `AskQuestionPage.jsx`
   - Look for `recordingSegments` and `attachments` arrays

3. Check Xano database:
   - Verify media files are being stored
   - Check if `media_asset_id` field is populated
   - Verify `attachments` JSON is correct

4. Investigate mapping between:
   - Frontend: `questionData.recordingSegments` → Backend: `recordingSegments`
   - Frontend: `questionData.attachments` → Backend: `attachments`
   - Backend processing in `quick-consult.js` and `deep-dive.js`

---

## Known Issues

### Issue 1: captureMethod Not Reaching Backend
- **Symptom**: Vercel logs show `automatic` for Deep Dive questions
- **Expected**: Should show `manual`
- **Status**: Under investigation
- **Priority**: CRITICAL - blocks entire Deep Dive payment flow

### Issue 2: Decline Doesn't Cancel Payment
- **Symptom**: Payment remains active in Stripe after decline
- **Likely Cause**: Frontend was calling Xano directly (fixed), but not yet tested
- **Status**: Fix deployed, needs testing
- **Priority**: HIGH

### Issue 3: Payment Intent ID May Not Be Stored in Xano
- **Symptom**: Unknown - not yet tested
- **Potential Issue**: Xano might not be storing/returning `stripe_payment_intent_id`
- **How to Check**: Look for `🔍 Question data` log when declining
- **Status**: Needs verification
- **Priority**: MEDIUM

### Issue 4: Attachments, Documents, Audio, Video Not Being Sent
- **Symptom**: With new 2-tier workflow, media files are not being transmitted correctly
- **Affected**: Both Quick Consult and Deep Dive question submissions
- **Status**: Identified, not yet investigated
- **Priority**: HIGH
- **Files to Check**:
  - `src/pages/AskQuestionPage.jsx` - Question submission payload
  - `api/questions/quick-consult.js` - Quick Consult endpoint
  - `api/questions/deep-dive.js` - Deep Dive endpoint
  - Recording segments mapping
  - Attachments array formatting

---

## Testing Checklist

### Deep Dive Payment Flow (End-to-End)

- [ ] **Submit Deep Dive Question**
  - [ ] Browser console shows: `🔍 [PAYMENT] Tier type: deep_dive, Capture method: manual`
  - [ ] Vercel logs show: `Capture method: manual`
  - [ ] Stripe Dashboard shows: Status "Uncaptured" (not "Succeeded")
  - [ ] Payment intent ID stored in Xano

- [ ] **Expert Accepts Offer**
  - [ ] Vercel logs show payment capture attempt
  - [ ] Stripe Dashboard shows: Status changes to "Succeeded"
  - [ ] Question moves to expert's active queue
  - [ ] SLA timer starts

- [ ] **Expert Declines Offer**
  - [ ] Vercel logs show payment cancellation attempt
  - [ ] Stripe Dashboard shows: Status changes to "Canceled"
  - [ ] Asker receives notification (optional)

### Quick Consult Payment Flow (Already Working)

- [x] Payment captured immediately
- [x] Shows "Succeeded" in Stripe
- [x] Question created in Xano
- [x] Email notifications sent

---

## Environment Variables Required

### Vercel (Backend)
```bash
STRIPE_ENABLED=true
STRIPE_SECRET_KEY=sk_test_51...
STRIPE_PUBLIC_KEY=pk_test_51...
```

### Frontend (.env)
```bash
VITE_STRIPE_ENABLED=true
VITE_STRIPE_PUBLIC_KEY=pk_test_51...
```

---

## Useful Commands

### Check Latest Deployment
```bash
git log --oneline -5
# Should show commit 730b479 or later
```

### View Vercel Logs
1. Go to Vercel Dashboard
2. Click on your project
3. Go to "Functions" tab
4. View real-time logs or search by function name

### Force Redeploy on Vercel
1. Go to Vercel Dashboard
2. Click "Deployments"
3. Find latest deployment
4. Click "..." → "Redeploy"

### Clear Browser Cache
- **Chrome/Edge**: Cmd/Ctrl + Shift + Delete → Clear cached images and files
- **Hard Refresh**: Cmd/Ctrl + Shift + R
- **Incognito**: Cmd/Ctrl + Shift + N

---

## Contact Points

### Stripe Dashboard
- Test Mode: https://dashboard.stripe.com/test/payments
- Look for payment intents starting with `pi_3SL...`
- Check "Status" column: Should see "Uncaptured" for Deep Dive

### Vercel Dashboard
- Functions: https://vercel.com/[your-project]/functions
- Real-time logs for debugging

### Key Files to Check
- Frontend: `src/components/question-flow-v2/payment/PaymentPlaceholder.jsx:50`
- Hook: `src/hooks/usePayment.js:34`
- Backend: `api/payments/create-intent.js:17`
- Stripe: `api/lib/stripe.js:89`

---

## Success Criteria

### Deep Dive Payment Flow Will Be Complete When:

1. ✅ Deep Dive questions create payment with `capture_method: manual`
2. ✅ Stripe Dashboard shows "Uncaptured" status (not "Succeeded")
3. ✅ Expert accepts offer → Payment captured → Status "Succeeded"
4. ✅ Expert declines offer → Payment canceled → Status "Canceled"
5. ✅ Xano stores and returns `stripe_payment_intent_id`
6. ✅ All Vercel logs show correct payment operations

---

## Questions to Answer Next Session

1. **Why is `captureMethod: 'manual'` becoming `'automatic'` between frontend and backend?**
   - Is the latest code deployed?
   - Is browser caching the old JavaScript?
   - Is the parameter being stripped somewhere?

2. **Is Xano storing the `stripe_payment_intent_id`?**
   - Check the `🔍 Question data` debug log
   - Verify Xano database schema
   - Check if field name is different

3. **Does decline endpoint get called at all?**
   - Check Vercel logs when clicking "Decline"
   - Should see `🚫 Declining offer...` log
   - If not, frontend change didn't deploy

4. **Why are attachments, documents, audio, and video not being transmitted?**
   - Check the submission payload structure in `AskQuestionPage.jsx`
   - Verify `recordingSegments` and `attachments` arrays are populated
   - Compare with old workflow to see what changed
   - Check if the data structure matches what Xano expects

---

**Last Updated**: October 23, 2025, 8:00 PM
**Next Session**: Start with "Verify Deployment" and test a fresh Deep Dive question
