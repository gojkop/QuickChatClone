# Xano API Implementation Checklist

**Status:** 🚧 In Progress
**Last Updated:** October 21, 2025

This checklist guides you through implementing all 8 API endpoints in Xano, one by one.

---

## ✅ Progress Tracker

- [ ] **Endpoint 1:** GET /expert/pricing-tiers
- [ ] **Endpoint 2:** PUT /expert/pricing-tiers
- [ ] **Endpoint 3:** Extend GET /public/profile
- [ ] **Endpoint 4:** POST /question/quick-consult
- [ ] **Endpoint 5:** POST /question/deep-dive
- [ ] **Endpoint 6:** GET /expert/pending-offers
- [ ] **Endpoint 7:** POST /offers/{id}/accept
- [ ] **Endpoint 8:** POST /offers/{id}/decline

---

## 🎯 ENDPOINT 1: GET /expert/pricing-tiers

### Step 1: Create the Function

1. **Go to:** Xano Dashboard → API → Authentication API
2. **Click:** "Add API Endpoint" (+ button)
3. **Configure:**
   - **Name:** `get_expert_pricing_tiers`
   - **Method:** GET
   - **Path:** `/expert/pricing-tiers`
   - **Authentication:** ✅ Requires Authentication
4. **Click:** "Create"

### Step 2: Build Function Stack

Now you'll add 6 steps to the function stack:

#### Step 1: Get Authenticated User
1. **Click:** "Add a step" → **Get Authenticated User**
2. **Return as:** `auth_user`
3. **Click:** "Save"

#### Step 2: Get Expert Profile
1. **Click:** "Add a step" → **Database Request** → **Get Record**
2. **Table:** `expert_profile`
3. **Filter:** Click "Add Filter"
   - Field: `user_id`
   - Operator: `=`
   - Value: `auth_user.id` (select from variables dropdown)
4. **Return as:** `expert_profile`
5. **Click:** "Save"

#### Step 3: Build Quick Consult Response (Lambda)
1. **Click:** "Add a step" → **Add a function** → **Lambda**
2. **Code:**
```javascript
return {
  enabled: $var.expert_profile.tier1_enabled || false,
  price_cents: $var.expert_profile.tier1_price_cents || 0,
  sla_hours: $var.expert_profile.tier1_sla_hours || 24,
  description: $var.expert_profile.tier1_description || ""
};
```
3. **Return as:** `quick_consult`
4. **Click:** "Save"

#### Step 4: Build Deep Dive Response (Lambda)
1. **Click:** "Add a step" → **Add a function** → **Lambda**
2. **Code:**
```javascript
return {
  enabled: $var.expert_profile.tier2_enabled || false,
  pricing_mode: $var.expert_profile.tier2_pricing_mode || "asker_proposes",
  min_price_cents: $var.expert_profile.tier2_min_price_cents || 0,
  max_price_cents: $var.expert_profile.tier2_max_price_cents || 0,
  auto_decline_below_cents: $var.expert_profile.tier2_auto_decline_below_cents || null,
  sla_hours: $var.expert_profile.tier2_sla_hours || 48,
  description: $var.expert_profile.tier2_description || ""
};
```
3. **Return as:** `deep_dive`
4. **Click:** "Save"

#### Step 5: Response
1. **Click:** "Add a step" → **Response**
2. **Add fields:**
   - Click "Add Field"
   - **Name:** `quick_consult`
   - **Value:** `quick_consult` (select from variables)
   - Click "Add Field" again
   - **Name:** `deep_dive`
   - **Value:** `deep_dive` (select from variables)
3. **Click:** "Save"

### Step 3: Test the Endpoint

1. **Click:** "Run & Debug" (play button icon)
2. **Authentication:** You'll need a valid auth token
   - Option A: Use an existing token from your app
   - Option B: Create a test token in Xano
3. **Click:** "Run"
4. **Verify response:**
```json
{
  "quick_consult": {
    "enabled": true,
    "price_cents": 7500,
    "sla_hours": 24,
    "description": "Focused advice..."
  },
  "deep_dive": {
    "enabled": false,
    "pricing_mode": "asker_proposes",
    "min_price_cents": 0,
    "max_price_cents": 0,
    "auto_decline_below_cents": null,
    "sla_hours": 48,
    "description": ""
  }
}
```

### Step 4: Save and Mark Complete

1. **Click:** "Save" (top right)
2. **Check:** ✅ Endpoint 1 in progress tracker above
3. **Move to:** Endpoint 2

---

## 🎯 ENDPOINT 2: PUT /expert/pricing-tiers

### Step 1: Create the Function

1. **Go to:** Xano Dashboard → API → Authentication API
2. **Click:** "Add API Endpoint"
3. **Configure:**
   - **Name:** `update_expert_pricing_tiers`
   - **Method:** PUT
   - **Path:** `/expert/pricing-tiers`
   - **Authentication:** ✅ Requires Authentication
4. **Click:** "Create"

### Step 2: Add Input Parameters

1. **Click:** "Add Input" (in the Inputs section)
2. **Add first input:**
   - **Name:** `quick_consult`
   - **Type:** Object
   - **Required:** No (optional)
3. **Click:** "Add Input" again
4. **Add second input:**
   - **Name:** `deep_dive`
   - **Type:** Object
   - **Required:** No (optional)

### Step 3: Build Function Stack

You'll add 7 steps:

#### Step 1: Get Authenticated User
1. **Add step:** Get Authenticated User
2. **Return as:** `auth_user`

#### Step 2: Get Expert Profile
1. **Add step:** Database Request → Get Record
2. **Table:** `expert_profile`
3. **Filter:** `user_id = auth_user.id`
4. **Return as:** `expert_profile`

#### Step 3: Validate At Least One Tier Enabled (Lambda)
1. **Add step:** Lambda
2. **Code:**
```javascript
var tier1Enabled = $var.quick_consult?.enabled || false;
var tier2Enabled = $var.deep_dive?.enabled || false;

if (!tier1Enabled && !tier2Enabled) {
  throw new Error("At least one tier must be enabled");
}

return true;
```
3. **Return as:** `validation_passed`

#### Step 4: Validate Quick Consult (Lambda)
1. **Add step:** Lambda
2. **Code:**
```javascript
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
```
3. **Return as:** `validated_quick_consult`

#### Step 5: Validate Deep Dive (Lambda)
1. **Add step:** Lambda
2. **Code:**
```javascript
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
```
3. **Return as:** `validated_deep_dive`

#### Step 6: Update Expert Profile
1. **Add step:** Database Request → Edit Record
2. **Table:** `expert_profile`
3. **Record:** `expert_profile` (from Step 2)
4. **Fields to update:** (Only add fields if the input was provided)

**For Quick Consult (if validated_quick_consult exists):**
- `tier1_enabled` = `validated_quick_consult.enabled`
- `tier1_price_cents` = `validated_quick_consult.price_cents`
- `tier1_sla_hours` = `validated_quick_consult.sla_hours`
- `tier1_description` = `validated_quick_consult.description`

**For Deep Dive (if validated_deep_dive exists):**
- `tier2_enabled` = `validated_deep_dive.enabled`
- `tier2_min_price_cents` = `validated_deep_dive.min_price_cents`
- `tier2_max_price_cents` = `validated_deep_dive.max_price_cents`
- `tier2_auto_decline_below_cents` = `validated_deep_dive.auto_decline_below_cents`
- `tier2_sla_hours` = `validated_deep_dive.sla_hours`
- `tier2_description` = `validated_deep_dive.description`

5. **Return as:** `updated_profile`

**Note:** In Xano, you may need to use conditional logic to only update fields if the input was provided. You can use Lambda or If/Else steps.

#### Step 7: Response
1. **Add step:** Response
2. **Add fields:**
   - `success` = `true` (literal boolean)
   - `updated_at` = Use "Current Timestamp" function

### Step 4: Test the Endpoint

**Test Request Body:**
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
    "description": "Comprehensive analysis"
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

## 🎯 ENDPOINT 3: Extend GET /public/profile

This endpoint **already exists** in your Xano. You just need to **extend it**.

### Step 1: Find Existing Endpoint

1. **Go to:** Xano Dashboard → API → (find your Public API group)
2. **Find:** Existing `/public/profile` endpoint (GET method)
3. **Click:** to open and edit

### Step 2: Add New Lambda Step (Before Response)

Find the final **Response** step. We'll add a new step **before** it.

1. **Click:** "Add a step" → **Add a function** → **Lambda**
2. **Position:** Drag it to be **before** the Response step
3. **Code:**
```javascript
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
```
4. **Return as:** `tiers`

### Step 3: Update Response Step

1. **Click:** on the Response step
2. **Add field:**
   - **Name:** `tiers`
   - **Value:** `tiers` (from the Lambda step above)
3. **Save**

### Step 4: Test

Call the endpoint and verify the response includes:
```json
{
  "expert_profile": {
    "tiers": {
      "quick_consult": { ... },
      "deep_dive": { ... }
    }
  }
}
```

---

## 🎯 ENDPOINT 4: POST /question/quick-consult

**Reference:** See XANO-API-IMPLEMENTATION-GUIDE.md lines 347-479

### Quick Setup

1. **Create endpoint:** `/question/quick-consult` (POST, Public API, No Auth)
2. **Add 7 inputs:** expert_profile_id, payer_email, title, text, attachments, media_asset_id, stripe_payment_intent_id
3. **Add 8 steps:**
   - Get Expert Profile
   - Validate Tier1 Enabled (Lambda)
   - Get Tier1 Configuration (Lambda)
   - Calculate SLA Deadline (Lambda)
   - Add Question Record
   - Add Payment Record
   - Send Email (optional)
   - Response

**Key Lambda for SLA Deadline:**
```javascript
var now = Date.now();
var slaHours = $var.tier1_config.sla_hours;
var deadline = now + (slaHours * 60 * 60 * 1000);
return deadline;
```

---

## 🎯 ENDPOINT 5: POST /question/deep-dive

**Reference:** See XANO-API-IMPLEMENTATION-GUIDE.md lines 483-635

### Quick Setup

1. **Create endpoint:** `/question/deep-dive` (POST, Public API, No Auth)
2. **Add 9 inputs:** Same as Quick Consult + `proposed_price_cents` + `asker_message`
3. **Add 9 steps:**
   - Get Expert Profile
   - Validate Tier2 Enabled (Lambda)
   - Check Auto-Decline Threshold (Lambda) ⚠️
   - If Auto-Decline, Return Error (Conditional)
   - Calculate Offer Expiry (Lambda)
   - Add Question Record
   - Add Payment Record
   - Send Email (optional)
   - Response

**Key Lambda for Auto-Decline:**
```javascript
var autoDeclineThreshold = $var.expert_profile.tier2_auto_decline_below_cents;
var proposedPrice = $var.proposed_price_cents;

if (autoDeclineThreshold && proposedPrice < autoDeclineThreshold) {
  return {
    auto_decline: true,
    reason: "Offer below minimum threshold of $" + (autoDeclineThreshold / 100)
  };
}

return { auto_decline: false };
```

---

## 🎯 ENDPOINT 6: GET /expert/pending-offers

**Reference:** See XANO-API-IMPLEMENTATION-GUIDE.md lines 639-748

### Quick Setup

1. **Create endpoint:** `/expert/pending-offers` (GET, Auth API, Requires Auth)
2. **No inputs** (uses authenticated user)
3. **Add 6 steps:**
   - Get Authenticated User
   - Get Expert Profile
   - Get Current Timestamp (Lambda)
   - Query Pending Offers (with filters)
   - Build Response for Each Offer (Lambda)
   - Response

**Key Lambda for Building Response:**
```javascript
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
```

---

## 🎯 ENDPOINT 7: POST /offers/{id}/accept

**Reference:** See XANO-API-IMPLEMENTATION-GUIDE.md lines 752-888

### Quick Setup

1. **Create endpoint:** `/offers/{id}/accept` (POST, Auth API, Requires Auth)
2. **Add 1 input:** `id` (Integer, path parameter)
3. **Add 10 steps:**
   - Get Authenticated User
   - Get Expert Profile
   - Get Question
   - Validate Offer (Lambda) - Check ownership, status, expiry
   - Calculate SLA Deadline (Lambda)
   - Update Question Record
   - Get Payment Record
   - Update Payment Status
   - Send Email (optional)
   - Response

**Key Validation Lambda:**
```javascript
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
```

---

## 🎯 ENDPOINT 8: POST /offers/{id}/decline

**Reference:** See XANO-API-IMPLEMENTATION-GUIDE.md lines 892-1047

### Quick Setup

1. **Create endpoint:** `/offers/{id}/decline` (POST, Auth API, Requires Auth)
2. **Add 2 inputs:** `id` (Integer, path parameter), `decline_reason` (Text, optional)
3. **Add 10 steps:**
   - Get Authenticated User
   - Get Expert Profile
   - Get Question
   - Validate Offer (Lambda) - Check ownership, status
   - Update Question Record
   - Get Payment Record
   - Update Payment Status
   - Trigger Stripe Refund ⚠️ (needs Stripe integration)
   - Send Email (optional)
   - Response

**⚠️ Important:** Step 8 (Stripe Refund) will need actual Stripe API integration. For now, you can:
- Skip this step (implement later)
- Or add a placeholder Lambda that returns `{ refund_status: "pending" }`

---

## ✅ Completion Checklist

After implementing all 8 endpoints:

- [ ] Test each endpoint with Xano's "Run & Debug"
- [ ] Verify all responses match expected format
- [ ] Test error handling (wrong expert, expired offers, invalid data)
- [ ] Document any differences from the guide
- [ ] Update progress tracker at top of this file

---

## 🆘 Troubleshooting

### Common Issues

**"Unable to locate var: variable_name"**
- **Fix:** Add `$var.` prefix: `$var.variable_name`

**"Cannot read properties of undefined"**
- **Fix:** Check that previous step returns the variable you're accessing
- **Fix:** Use optional chaining: `$var.object?.property`

**Lambda function errors**
- **Fix:** Use `console.log()` to debug in Xano
- **Fix:** Check for null/undefined values

**Database query returns no results**
- **Fix:** Verify filter conditions match your data
- **Fix:** Check that foreign keys are set correctly

---

## 📚 Resources

- **Full implementation details:** XANO-API-IMPLEMENTATION-GUIDE.md
- **Migration guide:** XANO-MIGRATION-CHECKLIST.md
- **Lambda syntax:** XANO-LAMBDA-GUIDE.md
- **Payment table reference:** migrations/PAYMENT-TABLE-REFERENCE.md

---

**Last Updated:** October 21, 2025
**Next:** Start with Endpoint 1, test thoroughly, then move to Endpoint 2
