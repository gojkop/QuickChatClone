# Xano API Implementation Guide - Two-Tier Question System

**Date:** October 21, 2025
**Status:** Ready for Implementation

This guide provides step-by-step instructions for implementing all Xano API endpoints for the two-tier question system.

---

## 📋 API Endpoints to Build

**Expert Configuration:**
1. ✅ GET /expert/pricing-tiers - Get expert's tier configuration
2. ✅ PUT /expert/pricing-tiers - Update expert's tier settings

**Public Profile:**
3. ✅ Extend GET /public/profile - Add tier data to public response

**Question Submission:**
4. ✅ POST /question/quick-consult - Submit Quick Consult question
5. ✅ POST /question/deep-dive - Submit Deep Dive offer

**Offer Management:**
6. ✅ GET /expert/pending-offers - List offers awaiting expert review
7. ✅ POST /offers/{id}/accept - Expert accepts Deep Dive offer
8. ✅ POST /offers/{id}/decline - Expert declines Deep Dive offer

---

## 🔧 ENDPOINT 1: GET /expert/pricing-tiers

**Purpose:** Get authenticated expert's tier configuration
**API Group:** Authentication API
**Authentication:** Required (Bearer token)

### Xano Implementation:

**Create Function:**
1. Go to: Xano → Functions → Add Function
2. Name: `get_expert_pricing_tiers`
3. Method: **GET**
4. Path: `/expert/pricing-tiers`
5. Authentication: **Requires Authentication**

**Function Stack:**

```
Step 1: Get Authenticated User
  - Type: Get Authenticated User
  - return as: auth_user

Step 2: Get Expert Profile
  - Type: Database Request → Get Record
  - Table: expert_profile
  - Filter: WHERE user_id = auth_user.id
  - return as: expert_profile

Step 3: Build Quick Consult Response (Lambda)
  - Type: Lambda
  - Code:
    return {
      enabled: $var.expert_profile.tier1_enabled || false,
      price_cents: $var.expert_profile.tier1_price_cents || 0,
      sla_hours: $var.expert_profile.tier1_sla_hours || 24,
      description: $var.expert_profile.tier1_description || ""
    };
  - return as: quick_consult

Step 4: Build Deep Dive Response (Lambda)
  - Type: Lambda
  - Code:
    return {
      enabled: $var.expert_profile.tier2_enabled || false,
      pricing_mode: $var.expert_profile.tier2_pricing_mode || "asker_proposes",
      min_price_cents: $var.expert_profile.tier2_min_price_cents || 0,
      max_price_cents: $var.expert_profile.tier2_max_price_cents || 0,
      auto_decline_below_cents: $var.expert_profile.tier2_auto_decline_below_cents || null,
      sla_hours: $var.expert_profile.tier2_sla_hours || 48,
      description: $var.expert_profile.tier2_description || ""
    };
  - return as: deep_dive

Step 5: Response
  - Type: Response
  - Set Response:
    • quick_consult = quick_consult (variable)
    • deep_dive = deep_dive (variable)
```

**Expected Response:**
```json
{
  "quick_consult": {
    "enabled": true,
    "price_cents": 7500,
    "sla_hours": 24,
    "description": "Focused advice on your questions"
  },
  "deep_dive": {
    "enabled": false,
    "pricing_mode": "asker_proposes",
    "min_price_cents": 15000,
    "max_price_cents": 30000,
    "auto_decline_below_cents": null,
    "sla_hours": 48,
    "description": ""
  }
}
```

---

## 🔧 ENDPOINT 2: PUT /expert/pricing-tiers

**Purpose:** Update expert's tier configuration
**API Group:** Authentication API
**Authentication:** Required (Bearer token)

### Xano Implementation:

**Create Function:**
1. Go to: Xano → Functions → Add Function
2. Name: `update_expert_pricing_tiers`
3. Method: **PUT**
4. Path: `/expert/pricing-tiers`
5. Authentication: **Requires Authentication**

**Add Inputs:**
1. `quick_consult` - Object (contains tier1 settings)
2. `deep_dive` - Object (contains tier2 settings)

**Function Stack:**

```
Step 1: Get Authenticated User
  - Type: Get Authenticated User
  - return as: auth_user

Step 2: Get Expert Profile
  - Type: Database Request → Get Record
  - Table: expert_profile
  - Filter: WHERE user_id = auth_user.id
  - return as: expert_profile

Step 3: Validate At Least One Tier Enabled (Lambda)
  - Type: Lambda
  - Code:
    var tier1Enabled = $var.quick_consult?.enabled || false;
    var tier2Enabled = $var.deep_dive?.enabled || false;

    if (!tier1Enabled && !tier2Enabled) {
      throw new Error("At least one tier must be enabled");
    }

    return true;
  - return as: validation_passed

Step 4: Validate Quick Consult (Lambda - if provided)
  - Type: Lambda
  - Code:
    var qc = $var.quick_consult;
    if (!qc) return null;

    // Validate price
    if (qc.enabled && (!qc.price_cents || qc.price_cents <= 0)) {
      throw new Error("Quick Consult price must be greater than 0");
    }

    // Validate SLA
    if (qc.sla_hours && (qc.sla_hours < 1 || qc.sla_hours > 168)) {
      throw new Error("SLA hours must be between 1 and 168");
    }

    return qc;
  - return as: validated_quick_consult

Step 5: Validate Deep Dive (Lambda - if provided)
  - Type: Lambda
  - Code:
    var dd = $var.deep_dive;
    if (!dd) return null;

    // Validate price range
    if (dd.enabled && dd.min_price_cents > dd.max_price_cents) {
      throw new Error("Min price cannot be greater than max price");
    }

    // Validate auto-decline threshold
    if (dd.auto_decline_below_cents && dd.auto_decline_below_cents > dd.min_price_cents) {
      throw new Error("Auto-decline threshold cannot be greater than min price");
    }

    // Validate SLA
    if (dd.sla_hours && (dd.sla_hours < 1 || dd.sla_hours > 168)) {
      throw new Error("SLA hours must be between 1 and 168");
    }

    return dd;
  - return as: validated_deep_dive

Step 6: Update Expert Profile
  - Type: Database Request → Edit Record
  - Table: expert_profile
  - Record: expert_profile (from Step 2)
  - Fields to update:
    • tier1_enabled = validated_quick_consult.enabled (if provided)
    • tier1_price_cents = validated_quick_consult.price_cents (if provided)
    • tier1_sla_hours = validated_quick_consult.sla_hours (if provided)
    • tier1_description = validated_quick_consult.description (if provided)
    • tier2_enabled = validated_deep_dive.enabled (if provided)
    • tier2_min_price_cents = validated_deep_dive.min_price_cents (if provided)
    • tier2_max_price_cents = validated_deep_dive.max_price_cents (if provided)
    • tier2_auto_decline_below_cents = validated_deep_dive.auto_decline_below_cents (if provided)
    • tier2_sla_hours = validated_deep_dive.sla_hours (if provided)
    • tier2_description = validated_deep_dive.description (if provided)
  - return as: updated_profile

Step 7: Response
  - Type: Response
  - Set Response:
    • success = true
    • updated_at = Date.now()
```

**Request Body Example:**
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

**Expected Response:**
```json
{
  "success": true,
  "updated_at": 1729500000000
}
```

---

## 🔧 ENDPOINT 3: Extend GET /public/profile

**Purpose:** Add tier configuration to public profile response
**API Group:** Public API
**Authentication:** None (public)

### Xano Implementation:

**Find Existing Function:**
1. Go to: Xano → Functions
2. Find: `/public/profile` (GET)
3. Edit the existing function

**Modify Function Stack:**

Find the final Response step and add tier data:

```
[Existing steps remain unchanged until Response]

Step X: Build Tier Response (Lambda) - NEW
  - Type: Lambda
  - Code:
    var profile = $var.expert_profile; // Use your existing variable name

    var quickConsult = null;
    if (profile.tier1_enabled) {
      quickConsult = {
        enabled: true,
        price_cents: profile.tier1_price_cents,
        sla_hours: profile.tier1_sla_hours,
        description: profile.tier1_description
      };
    }

    var deepDive = null;
    if (profile.tier2_enabled) {
      deepDive = {
        enabled: true,
        pricing_mode: profile.tier2_pricing_mode,
        min_price_cents: profile.tier2_min_price_cents,
        max_price_cents: profile.tier2_max_price_cents,
        sla_hours: profile.tier2_sla_hours,
        description: profile.tier2_description
        // NOTE: Do NOT include auto_decline_below_cents (private)
      };
    }

    return {
      quick_consult: quickConsult,
      deep_dive: deepDive
    };
  - return as: tiers

Step Y: Response - MODIFY
  - Type: Response
  - Add to existing response:
    • tiers = tiers (variable from Step X)
```

**Expected Response (added to existing):**
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
  },
  "user": {
    // ... existing user fields ...
  }
}
```

**IMPORTANT:** Do NOT expose `tier2_auto_decline_below_cents` in public API (keep it private)

---

## 🔧 ENDPOINT 4: POST /question/quick-consult

**Purpose:** Submit Quick Consult question (fixed price, immediate)
**API Group:** Public API (no auth - payment creates question)
**Authentication:** None

### Xano Implementation:

**Create Function:**
1. Go to: Xano → Functions → Add Function
2. Name: `submit_quick_consult_question`
3. Method: **POST**
4. Path: `/question/quick-consult`
5. Authentication: **None** (public)

**Add Inputs:**
1. `expert_profile_id` - Integer (required)
2. `payer_email` - Text (required)
3. `title` - Text (required)
4. `text` - Text (optional)
5. `attachments` - Text (optional, JSON string)
6. `media_asset_id` - Integer (optional)
7. `stripe_payment_intent_id` - Text (required)

**Function Stack:**

```
Step 1: Get Expert Profile
  - Type: Database Request → Get Record
  - Table: expert_profile
  - Filter: WHERE id = expert_profile_id (input)
  - return as: expert_profile

Step 2: Validate Tier1 Enabled (Lambda)
  - Type: Lambda
  - Code:
    if (!$var.expert_profile.tier1_enabled) {
      throw new Error("Expert does not have Quick Consult enabled");
    }
    return true;
  - return as: validation_passed

Step 3: Get Tier1 Configuration (Lambda)
  - Type: Lambda
  - Code:
    return {
      price_cents: $var.expert_profile.tier1_price_cents,
      sla_hours: $var.expert_profile.tier1_sla_hours
    };
  - return as: tier1_config

Step 4: Calculate SLA Deadline (Lambda)
  - Type: Lambda
  - Code:
    var now = Date.now();
    var slaHours = $var.tier1_config.sla_hours;
    var deadline = now + (slaHours * 60 * 60 * 1000);
    return deadline;
  - return as: sla_deadline

Step 5: Add Question Record
  - Type: Database Request → Add Record
  - Table: question
  - Fields:
    • expert_profile_id = expert_profile_id (input)
    • payer_email = payer_email (input)
    • title = title (input)
    • text = text (input)
    • attachments = attachments (input)
    • media_asset_id = media_asset_id (input)
    • question_tier = "quick_consult" (literal)
    • pricing_status = "paid" (literal)
    • final_price_cents = tier1_config.price_cents (variable)
    • sla_start_time = Date.now() (current timestamp)
    • sla_deadline = sla_deadline (variable from Step 4)
    • sla_missed = false (literal)
    • status = "paid" (literal - for backward compatibility)
    • price_cents = tier1_config.price_cents (legacy field)
    • sla_hours_snapshot = tier1_config.sla_hours (legacy field)
    • currency = "USD" (literal)
    • payment_intent_id = stripe_payment_intent_id (input)
  - return as: question

Step 6: Add Payment Record
  - Type: Database Request → Add Record
  - Table: payment
  - Fields:
    • question_id = question.id (variable)
    • stripe_payment_intent_id = stripe_payment_intent_id (input)
    • amount_cents = tier1_config.price_cents (variable)
    • currency = "USD" (literal)
    • status = "authorized" (literal)
    • question_type = "quick_consult" (literal)
    • authorized_at = Date.now() (current timestamp)
    • capture_attempted = false (literal)
    • capture_failed = false (literal)
    • retry_count = 0 (literal)
  - return as: payment

Step 7: Send Email to Expert (Optional - if email service available)
  - [Implementation depends on your email setup]

Step 8: Response
  - Type: Response
  - Set Response:
    • question_id = question.id
    • final_price_cents = tier1_config.price_cents
    • sla_deadline = sla_deadline
    • status = "paid"
```

**Request Body Example:**
```json
{
  "expert_profile_id": 107,
  "payer_email": "asker@example.com",
  "title": "Question title",
  "text": "Question details...",
  "attachments": "[{\"url\":\"https://...\",\"filename\":\"doc.pdf\"}]",
  "media_asset_id": 97,
  "stripe_payment_intent_id": "pi_xxx"
}
```

**Expected Response:**
```json
{
  "question_id": 118,
  "final_price_cents": 7500,
  "sla_deadline": 1729586400000,
  "status": "paid"
}
```

---

## 🔧 ENDPOINT 5: POST /question/deep-dive

**Purpose:** Submit Deep Dive offer (negotiated price)
**API Group:** Public API
**Authentication:** None

### Xano Implementation:

**Create Function:**
1. Go to: Xano → Functions → Add Function
2. Name: `submit_deep_dive_offer`
3. Method: **POST**
4. Path: `/question/deep-dive`
5. Authentication: **None** (public)

**Add Inputs:**
1. `expert_profile_id` - Integer (required)
2. `payer_email` - Text (required)
3. `proposed_price_cents` - Integer (required)
4. `asker_message` - Text (optional)
5. `title` - Text (required)
6. `text` - Text (optional)
7. `attachments` - Text (optional, JSON string)
8. `media_asset_id` - Integer (optional)
9. `stripe_payment_intent_id` - Text (required)

**Function Stack:**

```
Step 1: Get Expert Profile
  - Type: Database Request → Get Record
  - Table: expert_profile
  - Filter: WHERE id = expert_profile_id (input)
  - return as: expert_profile

Step 2: Validate Tier2 Enabled (Lambda)
  - Type: Lambda
  - Code:
    if (!$var.expert_profile.tier2_enabled) {
      throw new Error("Expert does not have Deep Dive enabled");
    }
    return true;
  - return as: validation_passed

Step 3: Check Auto-Decline Threshold (Lambda)
  - Type: Lambda
  - Code:
    var autoDeclineThreshold = $var.expert_profile.tier2_auto_decline_below_cents;
    var proposedPrice = $var.proposed_price_cents;

    if (autoDeclineThreshold && proposedPrice < autoDeclineThreshold) {
      return {
        auto_decline: true,
        reason: "Offer below minimum threshold of $" + (autoDeclineThreshold / 100)
      };
    }

    return { auto_decline: false };
  - return as: auto_decline_check

Step 4: If Auto-Decline, Return Error (Conditional)
  - Type: If/Else
  - Condition: auto_decline_check.auto_decline === true
  - If TRUE: Return error response
    • status = "offer_auto_declined"
    • reason = auto_decline_check.reason
  - If FALSE: Continue to next step

Step 5: Calculate Offer Expiry (Lambda)
  - Type: Lambda
  - Code:
    var now = Date.now();
    var expiryTime = now + (24 * 60 * 60 * 1000); // 24 hours
    return expiryTime;
  - return as: offer_expires_at

Step 6: Add Question Record
  - Type: Database Request → Add Record
  - Table: question
  - Fields:
    • expert_profile_id = expert_profile_id (input)
    • payer_email = payer_email (input)
    • title = title (input)
    • text = text (input)
    • attachments = attachments (input)
    • media_asset_id = media_asset_id (input)
    • asker_message = asker_message (input)
    • question_tier = "deep_dive" (literal)
    • pricing_status = "offer_pending" (literal)
    • proposed_price_cents = proposed_price_cents (input)
    • final_price_cents = proposed_price_cents (input)
    • sla_start_time = null (literal - not started yet)
    • sla_deadline = null (literal - not calculated yet)
    • sla_missed = false (literal)
    • offer_expires_at = offer_expires_at (variable from Step 5)
    • status = "paid" (literal - for backward compatibility)
    • price_cents = proposed_price_cents (legacy field)
    • currency = "USD" (literal)
    • payment_intent_id = stripe_payment_intent_id (input)
  - return as: question

Step 7: Add Payment Record
  - Type: Database Request → Add Record
  - Table: payment
  - Fields:
    • question_id = question.id (variable)
    • stripe_payment_intent_id = stripe_payment_intent_id (input)
    • amount_cents = proposed_price_cents (input)
    • currency = "USD" (literal)
    • status = "authorized" (literal)
    • question_type = "deep_dive" (literal)
    • authorized_at = Date.now() (current timestamp)
    • capture_attempted = false (literal)
    • capture_failed = false (literal)
    • retry_count = 0 (literal)
  - return as: payment

Step 8: Send Email to Expert (Optional)
  - [Implementation depends on your email setup]

Step 9: Response
  - Type: Response
  - Set Response:
    • question_id = question.id
    • proposed_price_cents = proposed_price_cents
    • status = "offer_pending"
    • offer_expires_at = offer_expires_at
```

**Request Body Example:**
```json
{
  "expert_profile_id": 107,
  "payer_email": "asker@example.com",
  "proposed_price_cents": 18000,
  "asker_message": "Critical decision for Series A...",
  "title": "Architecture review",
  "text": "Need guidance on...",
  "attachments": "[...]",
  "media_asset_id": 97,
  "stripe_payment_intent_id": "pi_xxx"
}
```

**Expected Response:**
```json
{
  "question_id": 119,
  "proposed_price_cents": 18000,
  "status": "offer_pending",
  "offer_expires_at": 1729586400000
}
```

---

## 🔧 ENDPOINT 6: GET /expert/pending-offers

**Purpose:** List all pending Deep Dive offers awaiting expert review
**API Group:** Authentication API
**Authentication:** Required (Bearer token)

### Xano Implementation:

**Create Function:**
1. Go to: Xano → Functions → Add Function
2. Name: `get_expert_pending_offers`
3. Method: **GET**
4. Path: `/expert/pending-offers`
5. Authentication: **Requires Authentication**

**Function Stack:**

```
Step 1: Get Authenticated User
  - Type: Get Authenticated User
  - return as: auth_user

Step 2: Get Expert Profile
  - Type: Database Request → Get Record
  - Table: expert_profile
  - Filter: WHERE user_id = auth_user.id
  - return as: expert_profile

Step 3: Get Current Timestamp (Lambda)
  - Type: Lambda
  - Code:
    return Date.now();
  - return as: now

Step 4: Query Pending Offers
  - Type: Database Request → Query All Records
  - Table: question
  - Filter:
    • expert_profile_id = expert_profile.id
    • question_tier = "deep_dive"
    • pricing_status = "offer_pending"
    • offer_expires_at > now (variable from Step 3)
  - Sort: created_at DESC (newest first)
  - return as: pending_offers

Step 5: Build Response for Each Offer (Lambda)
  - Type: Lambda
  - Code:
    var offers = $var.pending_offers || [];
    var currentTime = $var.now;
    var result = [];

    for (var i = 0; i < offers.length; i++) {
      var offer = offers[i];
      var timeRemaining = offer.offer_expires_at - currentTime;
      var hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));

      result.push({
        question_id: offer.id,
        title: offer.title,
        text: offer.text,
        payer_email: offer.payer_email,
        proposed_price_cents: offer.proposed_price_cents,
        asker_message: offer.asker_message || "",
        media_asset_id: offer.media_asset_id,
        created_at: offer.created_at,
        offer_expires_at: offer.offer_expires_at,
        hours_remaining: hoursRemaining,
        attachments: offer.attachments ? JSON.parse(offer.attachments) : []
      });
    }

    return result;
  - return as: offers_response

Step 6: Response
  - Type: Response
  - Set Response:
    • offers = offers_response (variable)
    • count = offers_response.length
```

**Expected Response:**
```json
{
  "offers": [
    {
      "question_id": 119,
      "title": "Architecture review for Series A",
      "text": "Need guidance on scaling our platform...",
      "payer_email": "asker@example.com",
      "proposed_price_cents": 18000,
      "asker_message": "This is critical for our upcoming funding round...",
      "media_asset_id": 97,
      "created_at": 1729500000000,
      "offer_expires_at": 1729586400000,
      "hours_remaining": 22,
      "attachments": [
        {
          "url": "https://...",
          "filename": "current_architecture.pdf",
          "size": 245678,
          "type": "application/pdf"
        }
      ]
    }
  ],
  "count": 1
}
```

---

## 🔧 ENDPOINT 7: POST /offers/{id}/accept

**Purpose:** Expert accepts Deep Dive offer, starts SLA timer
**API Group:** Authentication API
**Authentication:** Required (Bearer token)

### Xano Implementation:

**Create Function:**
1. Go to: Xano → Functions → Add Function
2. Name: `accept_deep_dive_offer`
3. Method: **POST**
4. Path: `/offers/{id}/accept`
5. Authentication: **Requires Authentication**

**Add Inputs:**
1. `id` - Integer (path parameter, question ID)

**Function Stack:**

```
Step 1: Get Authenticated User
  - Type: Get Authenticated User
  - return as: auth_user

Step 2: Get Expert Profile
  - Type: Database Request → Get Record
  - Table: expert_profile
  - Filter: WHERE user_id = auth_user.id
  - return as: expert_profile

Step 3: Get Question
  - Type: Database Request → Get Record
  - Table: question
  - Filter: WHERE id = id (input parameter)
  - return as: question

Step 4: Validate Offer (Lambda)
  - Type: Lambda
  - Code:
    var q = $var.question;
    var expertProfileId = $var.expert_profile.id;
    var now = Date.now();

    // Verify question belongs to this expert
    if (q.expert_profile_id !== expertProfileId) {
      throw new Error("This offer does not belong to you");
    }

    // Verify status is offer_pending
    if (q.pricing_status !== "offer_pending") {
      throw new Error("This offer cannot be accepted (status: " + q.pricing_status + ")");
    }

    // Verify offer hasn't expired
    if (q.offer_expires_at && q.offer_expires_at < now) {
      throw new Error("This offer has expired");
    }

    return true;
  - return as: validation_passed

Step 5: Calculate SLA Deadline (Lambda)
  - Type: Lambda
  - Code:
    var now = Date.now();
    var slaHours = $var.expert_profile.tier2_sla_hours || 48;
    var deadline = now + (slaHours * 60 * 60 * 1000);
    return deadline;
  - return as: sla_deadline

Step 6: Update Question Record
  - Type: Database Request → Edit Record
  - Table: question
  - Record: question (from Step 3)
  - Fields:
    • pricing_status = "offer_accepted" (literal)
    • expert_reviewed_at = Date.now() (current timestamp)
    • sla_start_time = Date.now() (current timestamp)
    • sla_deadline = sla_deadline (variable from Step 5)
  - return as: updated_question

Step 7: Get Payment Record
  - Type: Database Request → Get Record
  - Table: payment
  - Filter: WHERE question_id = question.id
  - return as: payment

Step 8: Update Payment Status
  - Type: Database Request → Edit Record
  - Table: payment
  - Record: payment (from Step 7)
  - Fields:
    • status = "accepted" (literal)
    • accepted_at = Date.now() (current timestamp)
  - return as: updated_payment

Step 9: Send Email to Asker (Optional)
  - [Implementation depends on your email setup]
  - Email template: "offer_accepted"
  - Notify asker that expert accepted their offer

Step 10: Response
  - Type: Response
  - Set Response:
    • success = true
    • question_id = question.id
    • status = "offer_accepted"
    • sla_deadline = sla_deadline
    • sla_hours = expert_profile.tier2_sla_hours
```

**Expected Response:**
```json
{
  "success": true,
  "question_id": 119,
  "status": "offer_accepted",
  "sla_deadline": 1729672800000,
  "sla_hours": 48
}
```

**Error Responses:**
```json
{
  "error": "This offer does not belong to you"
}

{
  "error": "This offer cannot be accepted (status: offer_declined)"
}

{
  "error": "This offer has expired"
}
```

---

## 🔧 ENDPOINT 8: POST /offers/{id}/decline

**Purpose:** Expert declines Deep Dive offer, triggers refund
**API Group:** Authentication API
**Authentication:** Required (Bearer token)

### Xano Implementation:

**Create Function:**
1. Go to: Xano → Functions → Add Function
2. Name: `decline_deep_dive_offer`
3. Method: **POST**
4. Path: `/offers/{id}/decline`
5. Authentication: **Requires Authentication**

**Add Inputs:**
1. `id` - Integer (path parameter, question ID)
2. `decline_reason` - Text (optional, expert's reason)

**Function Stack:**

```
Step 1: Get Authenticated User
  - Type: Get Authenticated User
  - return as: auth_user

Step 2: Get Expert Profile
  - Type: Database Request → Get Record
  - Table: expert_profile
  - Filter: WHERE user_id = auth_user.id
  - return as: expert_profile

Step 3: Get Question
  - Type: Database Request → Get Record
  - Table: question
  - Filter: WHERE id = id (input parameter)
  - return as: question

Step 4: Validate Offer (Lambda)
  - Type: Lambda
  - Code:
    var q = $var.question;
    var expertProfileId = $var.expert_profile.id;

    // Verify question belongs to this expert
    if (q.expert_profile_id !== expertProfileId) {
      throw new Error("This offer does not belong to you");
    }

    // Verify status is offer_pending
    if (q.pricing_status !== "offer_pending") {
      throw new Error("This offer cannot be declined (status: " + q.pricing_status + ")");
    }

    return true;
  - return as: validation_passed

Step 5: Update Question Record
  - Type: Database Request → Edit Record
  - Table: question
  - Record: question (from Step 3)
  - Fields:
    • pricing_status = "offer_declined" (literal)
    • expert_reviewed_at = Date.now() (current timestamp)
    • decline_reason = decline_reason (input, may be null)
  - return as: updated_question

Step 6: Get Payment Record
  - Type: Database Request → Get Record
  - Table: payment
  - Filter: WHERE question_id = question.id
  - return as: payment

Step 7: Update Payment Status
  - Type: Database Request → Edit Record
  - Table: payment
  - Record: payment (from Step 6)
  - Fields:
    • status = "refunded" (literal)
    • refunded_at = Date.now() (current timestamp)
  - return as: updated_payment

Step 8: Trigger Stripe Refund (Lambda or External Function)
  - Type: Lambda or External API Call
  - Purpose: Refund the pre-authorized payment in Stripe
  - Code (pseudo):
    var paymentIntentId = $var.payment.stripe_payment_intent_id;
    // Call Stripe API to cancel payment intent
    // POST https://api.stripe.com/v1/payment_intents/{id}/cancel
    // OR implement via separate /api/stripe/refund endpoint
  - Note: This step depends on your Stripe integration
  - May need to be implemented as external function call

Step 9: Send Email to Asker (Optional)
  - [Implementation depends on your email setup]
  - Email template: "offer_declined"
  - Include decline_reason if provided
  - Notify asker that offer was declined

Step 10: Response
  - Type: Response
  - Set Response:
    • success = true
    • question_id = question.id
    • status = "offer_declined"
    • refund_status = "initiated"
```

**Request Body Example:**
```json
{
  "decline_reason": "This request is outside my area of expertise"
}
```

**Expected Response:**
```json
{
  "success": true,
  "question_id": 119,
  "status": "offer_declined",
  "refund_status": "initiated"
}
```

**Error Responses:**
```json
{
  "error": "This offer does not belong to you"
}

{
  "error": "This offer cannot be declined (status: offer_accepted)"
}
```

**Important Notes:**

1. **Stripe Refund Implementation:**
   - Step 8 shows pseudo-code for Stripe refund
   - You'll need to implement actual Stripe API call
   - Options:
     - Add Stripe API call directly in Xano Lambda (requires Stripe library)
     - Create separate `/api/payments/cancel` endpoint in Vercel
     - Use Stripe webhook to handle refund logic

2. **Decline Reason:**
   - Optional field for expert to explain decline
   - Not shown to asker by default (privacy)
   - Can be shown if you choose to display it

3. **Payment Status:**
   - Payment goes directly from "authorized" → "refunded"
   - Skips "accepted" state
   - Stripe will release the hold on asker's card

---

## ✅ Implementation Complete

All 8 API endpoints are now documented with complete Xano function stacks.

### Summary of Endpoints

**Expert Configuration:**
1. ✅ GET /expert/pricing-tiers - Get tier configuration
2. ✅ PUT /expert/pricing-tiers - Update tier settings

**Public Profile:**
3. ✅ Extend GET /public/profile - Add tier data

**Question Submission:**
4. ✅ POST /question/quick-consult - Submit Quick Consult
5. ✅ POST /question/deep-dive - Submit Deep Dive offer

**Offer Management:**
6. ✅ GET /expert/pending-offers - List pending offers
7. ✅ POST /offers/{id}/accept - Accept offer
8. ✅ POST /offers/{id}/decline - Decline offer

### Next Steps

After implementing these Xano endpoints:

1. **Test Each Endpoint:**
   - Use Xano's built-in test function
   - Verify responses match expected format
   - Test error handling (wrong expert, expired offers, etc.)

2. **Implement Stripe Integration:**
   - Create `/api/payments/cancel` endpoint in Vercel
   - Handle refunds when offers are declined/expired
   - Implement capture when answers are submitted

3. **Frontend Integration:**
   - Build UI components to call these endpoints
   - Update ExpertSettings for tier configuration
   - Build PendingOffersSection for offer management
   - Update QuestionComposer for tier selection

4. **Email Notifications:**
   - Set up ZeptoMail templates
   - Send emails on offer events (submitted, accepted, declined, expired)

5. **Cron Jobs:**
   - Implement `/api/cron/expire-offers.js` (auto-expire after 24h)
   - Extend `/api/cron/enforce-sla.js` for tier support
   - Implement `/api/cron/retry-captures.js` for failed captures

---

**Last Updated:** October 21, 2025
**Status:** ✅ Complete - All 8 endpoints documented
