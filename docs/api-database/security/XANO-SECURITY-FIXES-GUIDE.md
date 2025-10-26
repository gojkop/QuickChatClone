# Xano Security Fixes - Step-by-Step Implementation Guide

**Date:** January 26, 2025
**Status:** 🔧 Implementation Guide
**Estimated Time:** 8-12 hours

---

## Overview

This guide provides step-by-step instructions to fix all critical security vulnerabilities in Xano endpoints while maintaining the public question submission flow.

**Design Principles:**
- ✅ Keep question submission public (no registration required for askers)
- ✅ Validate payment intents to prevent fraud
- ✅ Protect `playback_token_hash` (only askers should see it)
- ✅ Add ownership verification for expert actions
- ✅ Validate prices server-side

---

## Security Issue #1: Public Question Endpoint Needs Payment Validation

### Current Problem
`POST /question/quick-consult` and `POST /question/deep-dive` are public (good for UX) but don't validate payments properly.

**Attack Vector:**
```javascript
// Attacker could manipulate request:
POST /question/quick-consult
{
  "stripe_payment_intent_id": "fake_or_reused_id",
  "final_price_cents": 1  // Should be 5000!
}
```

### ✅ Solution: Add Payment & Price Validation (Keep Public)

**Xano Implementation:**

#### Step 1: Update `POST /question/quick-consult`

**Location:** Public API group (`api:BQW1GS7L`)

**Function Stack:**

1. **Get Inputs**
   - `expert_profile_id` (integer)
   - `payer_email` (text)
   - `title` (text)
   - `text` (text)
   - `attachments` (text, nullable)
   - `media_asset_id` (integer, nullable)
   - `sla_hours_snapshot` (integer)
   - `stripe_payment_intent_id` (text) ← REQUIRED

2. **Add Lambda: Validate Payment Intent**
   ```javascript
   // Check if payment intent already used
   var existing = Get Record from question
     where stripe_payment_intent_id = $var.stripe_payment_intent_id

   if (existing) {
     return response({
       error: "Payment already used for another question",
       code: "PAYMENT_REUSED"
     }, 400)
   }

   // Check if it's a mock payment in production
   if ($var.stripe_payment_intent_id.startsWith("pi_mock_") && env.ENVIRONMENT === "production") {
     return response({
       error: "Invalid payment method",
       code: "INVALID_PAYMENT"
     }, 400)
   }
   ```

3. **Get Expert Profile**
   ```javascript
   var expert_profile = Get Record from expert_profile
     where id = $var.expert_profile_id

   if (!expert_profile) {
     return response({
       error: "Expert not found"
     }, 404)
   }
   ```

4. **Add Lambda: Validate Price**
   ```javascript
   // For Quick Consult, price must match expert's tier1_price_cents
   // Don't accept price from request - use expert's price
   var final_price_cents = expert_profile.tier1_price_cents

   // Log for monitoring
   console.log("Quick Consult - Expert price: " + final_price_cents)
   ```

5. **Add Lambda: Generate Playback Token**
   ```javascript
   // Generate unique token for asker review page
   var playback_token_hash = UUID()
   ```

6. **Add Record to `question` table**
   ```javascript
   var question = Add Record to question with {
     expert_profile_id: $var.expert_profile_id,
     payer_email: $var.payer_email,
     title: $var.title,
     text: $var.text,
     attachments: $var.attachments,
     media_asset_id: $var.media_asset_id,
     sla_hours_snapshot: $var.sla_hours_snapshot,
     stripe_payment_intent_id: $var.stripe_payment_intent_id,

     // Server-controlled fields
     final_price_cents: final_price_cents,  // From expert profile
     status: "paid",  // Always "paid" for quick consult
     question_tier: "tier1",
     currency: "USD",
     playback_token_hash: playback_token_hash,
     created_at: now()
   }
   ```

7. **Calculate SLA Deadline**
   ```javascript
   var sla_deadline = now() + ($var.sla_hours_snapshot * 3600000)

   var updated_question = Edit Record question.id with {
     sla_deadline: sla_deadline
   }
   ```

8. **Return Response (WITH token for asker)**
   ```javascript
   return {
     question_id: question.id,
     status: question.status,
     final_price_cents: question.final_price_cents,
     sla_deadline: sla_deadline,
     playback_token_hash: playback_token_hash  // ✅ OK to return here (Vercel sends to asker)
   }
   ```

---

#### Step 2: Update `POST /question/deep-dive`

**Location:** Public API group (`api:BQW1GS7L`)

**Function Stack:** (Similar to Quick Consult with Deep Dive differences)

1. **Get Inputs**
   - Same as Quick Consult +
   - `proposed_price_cents` (integer) ← From asker
   - `asker_message` (text, nullable)

2. **Add Lambda: Validate Payment Intent** (Same as Quick Consult)

3. **Get Expert Profile** (Same as Quick Consult)

4. **Add Lambda: Validate Proposed Price**
   ```javascript
   // Check if below auto-decline threshold
   var auto_decline_threshold = expert_profile.tier2_auto_decline_below_cents

   if (auto_decline_threshold && $var.proposed_price_cents < auto_decline_threshold) {
     // Auto-decline
     var pricing_status = "offer_declined"
     var status = "declined"
     var decline_reason = "Offer below minimum threshold of $" + (auto_decline_threshold / 100)

     console.log("Auto-declined: " + $var.proposed_price_cents + " < " + auto_decline_threshold)
   } else {
     // Pending review
     var pricing_status = "offer_pending"
     var status = "paid"
     var decline_reason = null

     console.log("Pending review: " + $var.proposed_price_cents)
   }
   ```

5. **Add Lambda: Generate Playback Token**
   ```javascript
   var playback_token_hash = UUID()
   ```

6. **Add Lambda: Calculate Offer Expiration**
   ```javascript
   // Deep Dive offers expire after 24 hours if not accepted
   var offer_expires_at = now() + (24 * 3600000)
   ```

7. **Add Record to `question` table**
   ```javascript
   var question = Add Record to question with {
     expert_profile_id: $var.expert_profile_id,
     payer_email: $var.payer_email,
     title: $var.title,
     text: $var.text,
     attachments: $var.attachments,
     media_asset_id: $var.media_asset_id,
     asker_message: $var.asker_message,
     sla_hours_snapshot: $var.sla_hours_snapshot,
     stripe_payment_intent_id: $var.stripe_payment_intent_id,

     // Server-controlled fields
     proposed_price_cents: $var.proposed_price_cents,  // From asker
     final_price_cents: null,  // Set when accepted
     status: status,  // "declined" or "paid"
     pricing_status: pricing_status,  // "offer_declined" or "offer_pending"
     decline_reason: decline_reason,
     question_tier: "tier2",
     currency: "USD",
     playback_token_hash: playback_token_hash,
     offer_expires_at: offer_expires_at,
     created_at: now()
   }
   ```

8. **Return Response**
   ```javascript
   return {
     question_id: question.id,
     status: question.status,
     pricing_status: question.pricing_status,
     proposed_price_cents: question.proposed_price_cents,
     offer_expires_at: question.offer_expires_at,
     playback_token_hash: playback_token_hash  // ✅ OK to return here
   }
   ```

---

## Security Issue #2: Add Unique Constraint on stripe_payment_intent_id

### Database Schema Update

**Location:** Xano Database → `question` table

**Steps:**

1. Go to Database → `question` table
2. Find field `stripe_payment_intent_id`
3. Click field settings
4. Enable **Unique** constraint
5. Save

**Effect:** Database will reject duplicate payment intent IDs automatically.

---

## Security Issue #3: Add Ownership Verification to Offer Endpoints

### Problem
Experts can currently accept/decline other experts' offers.

### ✅ Solution: Add Ownership Check

#### Step 1: Update `POST /offers/{id}/accept`

**Location:** Authentication API group (`api:3B14WLbJ`)

**Function Stack:**

1. **Get URL Parameter**
   - `id` (from URL path) → Question ID

2. **Get Authenticated User**
   ```javascript
   // Xano automatically provides $authUser
   var user_id = $authUser.id
   ```

3. **Get Expert Profile for Authenticated User**
   ```javascript
   var expert_profile = Get Record from expert_profile
     where user_id = user_id

   if (!expert_profile) {
     return response({
       error: "Expert profile not found"
     }, 404)
   }
   ```

4. **Get the Question**
   ```javascript
   var question = Get Record from question where id = $var.id

   if (!question) {
     return response({
       error: "Question not found"
     }, 404)
   }
   ```

5. **Add Lambda: Verify Ownership**
   ```javascript
   // Check if this expert owns the question
   if (question.expert_profile_id !== expert_profile.id) {
     return response({
       error: "Forbidden: Not your offer",
       code: "OWNERSHIP_VIOLATION"
     }, 403)
   }

   console.log("Ownership verified: Expert " + expert_profile.id + " accepting question " + question.id)
   ```

6. **Verify Offer is Pending**
   ```javascript
   if (question.pricing_status !== "offer_pending") {
     return response({
       error: "Offer is not pending",
       current_status: question.pricing_status
     }, 400)
   }
   ```

7. **Update Question (Accept Offer)**
   ```javascript
   var accepted_question = Edit Record question.id with {
     pricing_status: "offer_accepted",
     status: "paid",
     final_price_cents: question.proposed_price_cents,
     sla_deadline: now() + (question.sla_hours_snapshot * 3600000)
   }
   ```

8. **Return Response (WITHOUT playback_token_hash)**
   ```javascript
   return {
     question_id: accepted_question.id,
     status: accepted_question.status,
     pricing_status: accepted_question.pricing_status,
     sla_deadline: accepted_question.sla_deadline
     // ❌ NO playback_token_hash here!
   }
   ```

---

#### Step 2: Update `POST /offers/{id}/decline`

**Location:** Authentication API group (`api:3B14WLbJ`)

**Function Stack:** (Same ownership check as accept)

1-5: **Same as Accept** (Get user, profile, question, verify ownership)

6. **Verify Offer is Pending** (Same as accept)

7. **Get Decline Reason Input**
   - `decline_reason` (text, optional)

8. **Update Question (Decline Offer)**
   ```javascript
   var declined_question = Edit Record question.id with {
     pricing_status: "offer_declined",
     status: "declined",
     decline_reason: $var.decline_reason || "Expert declined"
   }
   ```

9. **Return Response (WITHOUT playback_token_hash)**
   ```javascript
   return {
     question_id: declined_question.id,
     status: declined_question.status,
     pricing_status: declined_question.pricing_status,
     decline_reason: declined_question.decline_reason
     // ❌ NO playback_token_hash here!
   }
   ```

---

## Security Issue #4: Remove playback_token_hash from Expert Responses

### Problem
Experts currently see `playback_token_hash` in question responses, allowing them to access asker's review page.

### ✅ Solution: Exclude Field from Expert-Facing Endpoints

#### Endpoints to Fix:

1. **`GET /me/questions`** (Expert's question queue)
2. **`GET /question/{id}`** (Question details for expert)
3. **`GET /me/questions/count`** (Question counts)
4. **`GET /questions/{id}/recording-segments`** (Media segments)

---

#### Fix #1: `GET /me/questions`

**Location:** Authentication API group (`api:3B14WLbJ`)

**Current Issue:** Returns all fields including `playback_token_hash`

**Fix - Option A: Use Field Exclusion**

In the Query step:
```javascript
var questions = Get All from question
  where expert_profile_id = $expert_profile.id
  exclude playback_token_hash
```

**Fix - Option B: Use Lambda to Strip Field**

Add Lambda step after query:
```javascript
// Strip sensitive fields from questions
for (var i = 0; i < questions.length; i++) {
  delete questions[i].playback_token_hash
}

return questions
```

**Recommendation:** Use Option A (cleaner, faster)

---

#### Fix #2: `GET /question/{id}`

**Location:** Public API group (`api:BQW1GS7L`)

**Problem:** This endpoint is used by both experts AND the review page. We need conditional logic.

**Solution: Check Who's Accessing**

1. **Get URL Parameter**
   - `id` (integer)

2. **Get Question**
   ```javascript
   var question = Get Record from question where id = $var.id
   ```

3. **Add Lambda: Check if Authenticated (Expert) or Public (Asker)**
   ```javascript
   // If authenticated user exists, this is an expert viewing
   if ($authUser && $authUser.id) {
     // Verify ownership first
     var expert_profile = Get Record from expert_profile where user_id = $authUser.id

     if (question.expert_profile_id !== expert_profile.id) {
       return response({
         error: "Forbidden: Not your question"
       }, 403)
     }

     // Remove sensitive field for expert
     delete question.playback_token_hash

     console.log("Expert viewing question " + question.id + " (token hidden)")
   } else {
     // Public access - this is fine for review page
     // Token is validated elsewhere
     console.log("Public access to question " + question.id)
   }

   return question
   ```

---

#### Fix #3: `GET /me/questions/count`

Add exclusion:
```javascript
var questions = Get All from question
  where expert_profile_id = $expert_profile.id
  exclude playback_token_hash
```

---

#### Fix #4: `GET /questions/{id}/recording-segments`

Add exclusion in the parent question query:
```javascript
var question = Get Record from question
  where id = $var.id
  exclude playback_token_hash
```

---

## Security Issue #5: POST /question/hidden - Add Ownership Check

**Location:** Authentication API group (`api:3B14WLbJ`)

**Current Issue:** No ownership verification

**Fix:**

1. **Get Inputs**
   - `question_id` (integer)
   - `hidden` (boolean)

2. **Get Authenticated User's Expert Profile**
   ```javascript
   var expert_profile = Get Record from expert_profile
     where user_id = $authUser.id
   ```

3. **Get Question**
   ```javascript
   var question = Get Record from question
     where id = $var.question_id
   ```

4. **Add Lambda: Verify Ownership**
   ```javascript
   if (question.expert_profile_id !== expert_profile.id) {
     return response({
       error: "Forbidden: Not your question",
       code: "OWNERSHIP_VIOLATION"
     }, 403)
   }
   ```

5. **Update Question**
   ```javascript
   var updated = Edit Record question.id with {
     hidden: $var.hidden
   }
   ```

6. **Return Response (NO TOKEN!)**
   ```javascript
   return {
     success: true,
     hidden: updated.hidden
     // ❌ NO playback_token_hash
   }
   ```

---

## Security Issue #6: POST /answer - Verify Expert Ownership & Remove Token Leak

**Location:** Authentication API group (`api:3B14WLbJ`)

**Current Issue:**
- Returns full question object in response with `playback_token_hash` exposed to expert
- No explicit ownership verification before creating answer

**Current Response Format:**
```javascript
response = {
  "id": $created_answer.id,
  "question_id": $created_answer.question_id,
  "created_at": $created_answer.created_at,
  "sent_at": $created_answer.sent_at,
  "created_answer": $created_answer,
  "question": $question_updated  // ❌ Includes playback_token_hash!
}
```

### ✅ Complete Fix with Updated Response

**Function Stack:**

1. **Get Inputs**
   - `question_id` (integer)
   - `user_id` (integer) - Authenticated user from token
   - `text_response` (text)
   - `media_asset_id` (integer)
   - `attachments` (text, nullable - JSON array)

2. **Get Question**
   ```javascript
   var question = Get Record from question where id = $var.question_id

   if (!question) {
     return response({
       error: "Question not found"
     }, 404)
   }
   ```

3. **Get Expert Profile**
   ```javascript
   var expert_profile = Get Record from expert_profile
     where user_id = $var.user_id

   if (!expert_profile) {
     return response({
       error: "Expert profile not found"
     }, 404)
   }
   ```

4. **Add Lambda: Verify Ownership**
   ```javascript
   // Ensure expert owns this question
   if (question.expert_profile_id !== expert_profile.id) {
     return response({
       error: "Forbidden: Not your question to answer",
       code: "OWNERSHIP_VIOLATION"
     }, 403)
   }

   console.log("✅ Ownership verified: Expert " + expert_profile.id + " answering question " + question.id)
   ```

5. **Add Record to `answer` table**
   ```javascript
   var created_answer = Add Record to answer with {
     question_id: $var.question_id,
     user_id: $var.user_id,
     text_response: $var.text_response,
     media_asset_id: $var.media_asset_id,
     attachments: $var.attachments,
     created_at: now()
   }
   ```

6. **Update Question Status**
   ```javascript
   var question_updated = Edit Record question.id with {
     status: "answered",
     answered_at: now()
   }
   ```

7. **Add Lambda: Build Safe Response (WITHOUT playback_token_hash)**
   ```javascript
   // Build question object with only safe fields
   var safe_question = {
     id: question_updated.id,
     expert_profile_id: question_updated.expert_profile_id,
     user_id: question_updated.user_id,
     title: question_updated.title,
     text: question_updated.text,
     status: question_updated.status,
     question_tier: question_updated.question_tier,
     pricing_status: question_updated.pricing_status,
     final_price_cents: question_updated.final_price_cents,
     media_asset_id: question_updated.media_asset_id,
     attachments: question_updated.attachments,
     created_at: question_updated.created_at,
     answered_at: question_updated.answered_at,
     sla_deadline: question_updated.sla_deadline
     // ❌ NO playback_token_hash!
   }
   ```

8. **Return Safe Response**
   ```javascript
   return {
     id: created_answer.id,
     question_id: created_answer.question_id,
     created_at: created_answer.created_at,
     sent_at: created_answer.sent_at,
     created_answer: created_answer,
     question: safe_question  // ✅ Sanitized question object
   }
   ```

---

## Security Issue #7: PATCH /question/{id} - CRITICAL SECURITY ISSUE

**Location:** Public API group (`api:BQW1GS7L`) or Authentication API group (depends on your setup)

**🔴 CRITICAL Issues:**
1. **No Authentication** - Missing `auth = "user"` declaration
2. **No Ownership Verification** - Anyone can update any question
3. **Token Leak** - Returns full question object with `playback_token_hash`
4. **Used by Backend** - Currently called by `api/lib/xano/questionService.js` to update media_asset_id and status

### Current Usage Analysis

**Where it's used:**
```javascript
// File: api/lib/xano/questionService.js

// Update 1: Link media asset to question
await updateQuestion(question.id, {
  mediaAssetId: mediaAsset.id,
});

// Update 2: Mark as paid (dev mode)
await updateQuestion(question.id, {
  status: 'paid',
  paidAt: new Date().toISOString(),
});
```

**Frontend:** Not called directly by frontend components.

### ✅ Solution: Secure the Endpoint

**Option A: Add Authentication + Ownership (Recommended)**

This secures the endpoint while keeping it usable by the backend.

**Function Stack:**

1. **Set Authentication**
   ```
   auth = "user"  // Require authentication
   ```

2. **Get URL Parameter**
   - `id` (integer from URL path) - Question ID

3. **Get Inputs (all optional for PATCH)**
   - `status` (text, optional)
   - `paid_at` (timestamp, optional)
   - `media_asset_id` (integer, optional)
   - `answered_at` (timestamp, optional)
   - `hidden` (boolean, optional)
   - `sla_deadline` (timestamp, optional)

4. **Get Question**
   ```javascript
   var question = Get Record from question where id = $var.id

   if (!question) {
     return response({
       error: "Question not found"
     }, 404)
   }
   ```

5. **Get Expert Profile**
   ```javascript
   var expert_profile = Get Record from expert_profile
     where user_id = $authUser.id

   if (!expert_profile) {
     return response({
       error: "Expert profile not found"
     }, 404)
   }
   ```

6. **Add Lambda: Verify Ownership**
   ```javascript
   // Only allow expert who owns the question to update it
   if (question.expert_profile_id !== expert_profile.id) {
     return response({
       error: "Forbidden: Not your question to update",
       code: "OWNERSHIP_VIOLATION"
     }, 403)
   }

   console.log("✅ Ownership verified: Expert " + expert_profile.id + " updating question " + question.id)
   ```

7. **Add Lambda: Build Update Object**
   ```javascript
   // Only update fields that were provided
   var updates = {}

   if ($var.status !== null && $var.status !== undefined) {
     updates.status = $var.status
   }
   if ($var.paid_at !== null && $var.paid_at !== undefined) {
     updates.paid_at = $var.paid_at
   }
   if ($var.media_asset_id !== null && $var.media_asset_id !== undefined) {
     updates.media_asset_id = $var.media_asset_id
   }
   if ($var.answered_at !== null && $var.answered_at !== undefined) {
     updates.answered_at = $var.answered_at
   }
   if ($var.hidden !== null && $var.hidden !== undefined) {
     updates.hidden = $var.hidden
   }
   if ($var.sla_deadline !== null && $var.sla_deadline !== undefined) {
     updates.sla_deadline = $var.sla_deadline
   }
   ```

8. **Edit Question Record**
   ```javascript
   var updated_question = Edit Record question.id with updates
   ```

9. **Add Lambda: Build Safe Response (WITHOUT playback_token_hash)**
   ```javascript
   // Return only safe fields
   var safe_question = {
     id: updated_question.id,
     expert_profile_id: updated_question.expert_profile_id,
     user_id: updated_question.user_id,
     title: updated_question.title,
     text: updated_question.text,
     status: updated_question.status,
     question_tier: updated_question.question_tier,
     pricing_status: updated_question.pricing_status,
     final_price_cents: updated_question.final_price_cents,
     media_asset_id: updated_question.media_asset_id,
     attachments: updated_question.attachments,
     created_at: updated_question.created_at,
     answered_at: updated_question.answered_at,
     paid_at: updated_question.paid_at,
     sla_deadline: updated_question.sla_deadline,
     hidden: updated_question.hidden
     // ❌ NO playback_token_hash!
   }

   return safe_question
   ```

**Option B: Disable Endpoint & Use Internal Alternative**

If the endpoint is not actively used in production:

1. **Create Internal Update Function** in Xano (Public API with `x_api_key` auth)
2. **Update Backend** (`api/lib/xano/question.js`) to call internal endpoint
3. **Disable** `PATCH /question/{id}` endpoint in Authentication API

---

## Security Issue #8: POST /question (Public) - Not Actively Used

**Location:** Public API group (`api:BQW1GS7L`)

**Status:** ⚠️ Not actively used in codebase

**Analysis:**
- Codebase uses `/question/quick-consult` and `/question/deep-dive` instead
- This endpoint returns `playback_token_hash` which is **correct** if it goes to asker
- But it's not being called by frontend or backend

### ✅ Recommended Action: Disable Endpoint

**Steps:**
1. Go to Xano API Designer
2. Find `POST /question` endpoint
3. Click endpoint settings
4. Set status to **Disabled** or **Archived**
5. Save

**Alternative:** If you want to keep it for backward compatibility:
- Ensure it has same payment validation as `/question/quick-consult`
- Ensure it returns `playback_token_hash` only to asker (via Vercel proxy)
- Add monitoring to track if it's ever called

---

## Testing Checklist

### Test 1: Payment Intent Reuse Prevention
```bash
# Create question with payment intent
curl -X POST https://xano-url/api:BQW1GS7L/question/quick-consult \
  -d '{"stripe_payment_intent_id": "pi_test_123", ...}'
# Should succeed

# Try again with same payment intent
curl -X POST https://xano-url/api:BQW1GS7L/question/quick-consult \
  -d '{"stripe_payment_intent_id": "pi_test_123", ...}'
# Should fail with "Payment already used"
```

### Test 2: Price Validation
```bash
# Expert charges $50 (5000 cents)
# Try to create question (price comes from expert profile, not request)
curl -X POST https://xano-url/api:BQW1GS7L/question/quick-consult \
  -d '{"expert_profile_id": 107, ...}'
# Question should be created with final_price_cents = 5000
```

### Test 3: Cross-Expert Offer Accept
```bash
# Expert A tries to accept Expert B's offer
curl -X POST https://xano-url/api:3B14WLbJ/offers/123/accept \
  -H "Authorization: Bearer {expert-a-token}"
# Should fail with 403 Forbidden
```

### Test 4: playback_token_hash Not in Expert Response
```bash
# Expert fetches their questions
curl -X GET https://xano-url/api:3B14WLbJ/me/questions \
  -H "Authorization: Bearer {expert-token}"
# Response should NOT include playback_token_hash field
```

### Test 5: playback_token_hash in Asker Response
```bash
# Create question (returns token for asker)
curl -X POST https://xano-url/api:BQW1GS7L/question/quick-consult \
  -d '{...}'
# Response SHOULD include playback_token_hash
```

### Test 6: POST /answer - Token Not in Expert Response
```bash
# Expert creates answer for their question
curl -X POST https://xano-url/api:3B14WLbJ/answer \
  -H "Authorization: Bearer {expert-token}" \
  -d '{
    "question_id": 123,
    "text_response": "Answer text",
    "media_asset_id": 456
  }'
# Response should include "question" object
# "question" object should NOT include playback_token_hash
```

### Test 7: POST /answer - Cross-Expert Prevention
```bash
# Expert A tries to answer Expert B's question
curl -X POST https://xano-url/api:3B14WLbJ/answer \
  -H "Authorization: Bearer {expert-a-token}" \
  -d '{
    "question_id": 123  # Belongs to Expert B
  }'
# Should fail with 403 Forbidden
# Error: "Forbidden: Not your question to answer"
```

### Test 8: PATCH /question/{id} - Requires Authentication
```bash
# Try to update question without authentication
curl -X PATCH https://xano-url/api:xxx/question/123 \
  -d '{"status": "declined"}'
# Should fail with 401 Unauthorized
```

### Test 9: PATCH /question/{id} - Cross-Expert Prevention
```bash
# Expert A tries to update Expert B's question
curl -X PATCH https://xano-url/api:xxx/question/123 \
  -H "Authorization: Bearer {expert-a-token}" \
  -d '{"hidden": true}'
# Should fail with 403 Forbidden
# Error: "Forbidden: Not your question to update"
```

### Test 10: PATCH /question/{id} - Token Not in Response
```bash
# Expert updates their own question
curl -X PATCH https://xano-url/api:xxx/question/123 \
  -H "Authorization: Bearer {expert-token}" \
  -d '{"hidden": true}'
# Response should be question object WITHOUT playback_token_hash
```

---

## Deployment Checklist

Before deploying to production:

### Database Changes
- [ ] Add unique constraint to `stripe_payment_intent_id` field in `question` table
- [ ] ✅ Add unique index to `stripe_payment_intent_id` in `payment_table_structure` (ALREADY DONE)

### Public Question Endpoints (Price & Payment Validation)
- [ ] Update `POST /question/quick-consult` with payment & price validation
- [ ] Update `POST /question/deep-dive` with payment & price validation

### Ownership Verification (Authentication API)
- [ ] Add ownership check to `POST /offers/{id}/accept`
- [ ] Add ownership check to `POST /offers/{id}/decline`
- [ ] Add ownership check to `POST /question/hidden`
- [ ] Add ownership check to `POST /answer` (Step 4 in function stack)
- [ ] 🔴 **CRITICAL:** Add authentication + ownership check to `PATCH /question/{id}`

### Token Protection (Remove playback_token_hash from Expert Responses)
- [ ] ✅ `GET /me/questions` - Already secure (uses whitelist)
- [ ] Remove `playback_token_hash` from `GET /question/{id}` (for experts)
- [ ] Remove `playback_token_hash` from `GET /me/questions/count`
- [ ] Remove `playback_token_hash` from `GET /questions/{id}/recording-segments`
- [ ] Fix `POST /answer` response - Build safe_question object (Step 7 in function stack)
- [ ] Fix `PATCH /question/{id}` response - Build safe_question object (Step 9 in function stack)

### Cleanup
- [ ] Disable or archive `POST /question` (public endpoint - not used)

### Testing
- [ ] Test payment intent reuse prevention
- [ ] Test price validation (Quick Consult)
- [ ] Test auto-decline logic (Deep Dive)
- [ ] Test cross-expert offer accept (should fail with 403)
- [ ] Test cross-expert answer creation (should fail with 403)
- [ ] Test `playback_token_hash` NOT in expert responses
- [ ] Test `playback_token_hash` IS in asker responses (question creation)
- [ ] Test PATCH endpoint with authentication
- [ ] Monitor Xano logs for ownership violations

### Environment Variables
- [ ] Set Vercel env var: `RATE_LIMIT_ENABLED=false` (for testing)
- [ ] Set Vercel env var: `RATE_LIMIT_ENABLED=true` (for production)

---

## Monitoring

After deployment, monitor for:

1. **Payment Reuse Attempts**
   - Log: "Payment already used"
   - Alert if > 5 per hour

2. **Ownership Violations**
   - Log: "OWNERSHIP_VIOLATION"
   - Alert if > 3 per hour

3. **Price Validation Issues**
   - Log price mismatches
   - May indicate frontend bugs

4. **playback_token_hash Leaks**
   - Audit expert-facing responses
   - Ensure field never appears

---

## Summary of Changes

| Endpoint | Change | Severity | Time | Status |
|----------|--------|----------|------|--------|
| `POST /question/quick-consult` | Add payment validation, price validation | 🔴 Critical | 1h | ⏳ Pending |
| `POST /question/deep-dive` | Add payment validation, auto-decline logic | 🔴 Critical | 1h | ⏳ Pending |
| `question.stripe_payment_intent_id` | Add unique constraint | 🔴 Critical | 5min | ⏳ Pending |
| `payment_table_structure.stripe_payment_intent_id` | Unique index | 🔴 Critical | - | ✅ **DONE** |
| `PATCH /question/{id}` | **Add auth, ownership check, remove token** | 🔴 **CRITICAL** | 1h | ⏳ Pending |
| `POST /offers/{id}/accept` | Add ownership check, remove token | 🔴 Critical | 30min | ✅ **SECURE** |
| `POST /offers/{id}/decline` | Add ownership check, remove token | 🔴 Critical | 30min | ✅ **SECURE** |
| `GET /me/questions` | Remove playback_token_hash | 🔴 Critical | 15min | ✅ **SECURE** |
| `GET /question/{id}` | Conditional token removal | 🔴 Critical | 30min | ⏳ Pending |
| `POST /answer` | Add ownership check, **sanitize response** | 🟠 High | 45min | ⏳ Pending |
| `POST /question/hidden` | Add ownership check | 🟠 High | 30min | ⏳ Pending |
| `POST /question` (public) | Disable endpoint (not used) | 🟡 Medium | 5min | ⏳ Pending |
| Other GET endpoints | Remove playback_token_hash | 🟠 High | 1h | ⏳ Pending |

**Total Estimated Time:** 6-8 hours

**Priority Order:**
1. 🔴 **PATCH /question/{id}** - No auth, anyone can update any question
2. 🔴 **POST /answer** - Token leak to experts
3. 🔴 **Payment validation** - Price manipulation prevention
4. 🟠 **Other token leaks** - Remaining GET endpoints

---

## Getting Help

If you encounter issues:

1. Check Xano function logs for errors
2. Test with Xano's built-in API tester
3. Verify environment variables are set
4. Check field names match exactly

---

**Next:** Start with the highest priority fixes (#1, #2, #4) then proceed to ownership checks (#3, #5, #6).
