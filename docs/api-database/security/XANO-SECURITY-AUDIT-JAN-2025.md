# Xano API Security Audit

**Date:** January 26, 2025
**Status:** 🔴 **CRITICAL VULNERABILITIES FOUND**
**Priority:** Immediate Action Required

---

## Executive Summary

During a comprehensive security review of Xano endpoints, **multiple critical vulnerabilities** were identified that could allow unauthorized access, data manipulation, and financial fraud. These issues require immediate attention before production deployment.

**Severity Breakdown:**
- 🔴 **Critical:** 5 issues
- 🟠 **High:** 3 issues
- 🟡 **Medium:** 4 issues
- 🟢 **Low:** 2 issues

---

## 🔴 CRITICAL Security Issues

### 1. Public Question Creation Endpoint - No Payment Verification
**Endpoint:** `POST /question` (Public API)
**Current State:** Authentication: None (public)

**Vulnerability:**
```javascript
// Anyone can call this endpoint without authentication
POST /question
{
  "expert_profile_id": 107,
  "payer_email": "fake@email.com",
  "status": "paid",  // ❌ Can set status to "paid" without payment!
  "price_cents": 0,   // ❌ Can set any price!
  "title": "Free question"
}
```

**Impact:** 🔴 **CRITICAL**
- Attackers can create unlimited "paid" questions without paying
- Experts receive fake questions in their queue
- Revenue loss
- Platform abuse

**Exploitation:**
1. Attacker calls `/question` directly (bypassing Vercel)
2. Sets `status = 'paid'` without payment
3. Expert wastes time answering fake question
4. No payment ever captured

**Fix Required:**
```javascript
// In Xano POST /question endpoint
// Add Lambda step BEFORE creating record:

// 1. Verify stripe_payment_intent_id exists
if (!stripe_payment_intent_id) {
  return response({ error: "Payment required" }, 400)
}

// 2. Verify status can only be set by internal calls
// Remove "status" from allowed inputs
// Always set status based on payment verification

// 3. Require x_api_key for direct question creation
if (!x_api_key || x_api_key !== env.XANO_INTERNAL_API_KEY) {
  return response({ error: "Unauthorized" }, 401)
}
```

**Recommendation:** **DISABLE PUBLIC ACCESS** to `POST /question`. Only allow calls from Vercel with API key.

---

### 2. Stripe Payment Intent ID Not Validated
**Endpoints:** `POST /question/quick-consult`, `POST /question/deep-dive`
**Current State:** Public API, accepts `stripe_payment_intent_id` without verification

**Vulnerability:**
```javascript
// Attacker can reuse payment intent IDs
POST /question/quick-consult
{
  "stripe_payment_intent_id": "pi_123_already_used",  // ❌ Reused payment!
  "expert_profile_id": 107,
  "title": "Fake question"
}
```

**Impact:** 🔴 **CRITICAL**
- Attackers can create multiple questions with one payment
- Revenue loss (1 payment → many questions)
- Financial fraud

**Fix Required:**
```javascript
// In Xano POST /question/quick-consult and /question/deep-dive

// 1. Check if payment intent already used
var existing_question = Get Record from question where stripe_payment_intent_id = $var.stripe_payment_intent_id

if (existing_question) {
  return response({
    error: "Payment already used for another question"
  }, 400)
}

// 2. Verify payment intent is not mock (in production)
if (stripe_payment_intent_id.startsWith("pi_mock_") && env.ENVIRONMENT === "production") {
  return response({
    error: "Invalid payment intent"
  }, 400)
}
```

**Recommendation:** Add unique constraint on `stripe_payment_intent_id` field in questions table.

---

### 3. Offer Accept/Decline - No Ownership Verification
**Endpoints:** `POST /offers/{id}/accept`, `POST /offers/{id}/decline`
**Current State:** Requires authentication, but ownership check not documented

**Vulnerability:**
```javascript
// Expert A tries to accept Expert B's offer
POST /offers/123/accept
Authorization: Bearer {expert-a-token}
// If no ownership check, Expert A can accept Expert B's offers!
```

**Impact:** 🔴 **CRITICAL**
- Experts can accept/decline other experts' offers
- Unauthorized payment captures
- Wrong expert receives payment
- Data integrity compromised

**Fix Required:**
```javascript
// In Xano POST /offers/{id}/accept

// 1. Get authenticated user's expert_profile_id
var user = Get Record from user where id = $authUser.id
var expert_profile = Get Record from expert_profile where user_id = user.id

// 2. Get the question
var question = Get Record from question where id = $var.id

// 3. Verify ownership
if (question.expert_profile_id !== expert_profile.id) {
  return response({
    error: "Forbidden: Not your offer"
  }, 403)
}

// 4. Continue with accept logic
```

**Recommendation:** Add ownership verification to BOTH accept and decline endpoints.

---

### 4. Sensitive Data Exposure - playback_token_hash
**Endpoints:** Multiple (any endpoint returning question data)
**Current State:** `playback_token_hash` included in responses to experts

**Vulnerability:**
```javascript
// Expert fetches question
GET /me/questions
Authorization: Bearer {expert-token}

// Response includes:
{
  "id": 123,
  "playback_token_hash": "secret-token-abc123",  // ❌ Expert shouldn't see this!
  "payer_email": "asker@example.com"
}

// Expert can now access asker's view:
https://mindpick.me/r/secret-token-abc123
```

**Impact:** 🔴 **CRITICAL**
- Experts can access review page meant for askers
- Privacy violation (expert sees asker's full contact info)
- Experts can potentially modify question status via review page

**Fix Required:**
```javascript
// In ALL endpoints that return question data to experts:

// Option 1: Exclude field in query
var questions = Get All from question where expert_profile_id = $expert_profile.id
  exclude playback_token_hash

// Option 2: Lambda to strip field
for (var i = 0; i < questions.length; i++) {
  delete questions[i].playback_token_hash
}

return questions
```

**Endpoints to Fix:**
- `GET /me/questions`
- `GET /question/{id}` (when accessed by expert)
- `POST /offers/{id}/accept` (response)
- `POST /offers/{id}/decline` (response)
- `GET /me/questions/count`
- `GET /questions/{id}/recording-segments`

**Recommendation:** NEVER return `playback_token_hash` to experts. Only return to askers on review page.

---

### 5. Price Manipulation in Question Creation
**Endpoints:** `POST /question/quick-consult`, `POST /question/deep-dive`
**Current State:** Price sent from frontend, no server-side validation

**Vulnerability:**
```javascript
// Attacker modifies frontend to send lower price
POST /question/quick-consult
{
  "expert_profile_id": 107,  // Expert charges $50
  "final_price_cents": 100,   // ❌ Attacker pays $1 instead!
  "stripe_payment_intent_id": "pi_123"
}
```

**Impact:** 🔴 **CRITICAL**
- Revenue loss (experts underpaid)
- Financial fraud
- Trust violation

**Fix Required:**
```javascript
// In Xano POST /question/quick-consult

// 1. Get expert's actual pricing
var expert_profile = Get Record from expert_profile where id = $var.expert_profile_id

// 2. For Quick Consult: verify price matches
if ($var.final_price_cents !== expert_profile.tier1_price_cents) {
  return response({
    error: "Price mismatch: expected " + expert_profile.tier1_price_cents
  }, 400)
}

// 3. For Deep Dive: verify proposed price is reasonable
if ($var.proposed_price_cents < expert_profile.tier2_auto_decline_below_cents) {
  // Auto-decline logic already exists (good!)
}

// 4. Store the expert's price, not the user's input
var question = Add Record to question with {
  final_price_cents: expert_profile.tier1_price_cents,  // ✅ Use expert's price
  // ...other fields
}
```

**Recommendation:** ALWAYS fetch and use expert's pricing from database, not from request body.

---

## 🟠 HIGH Security Issues

### 6. No Rate Limiting on Public Endpoints
**Endpoints:** All public endpoints
**Current State:** No rate limiting enforced

**Impact:** 🟠 **HIGH**
- DDoS attacks possible
- Abuse of public profile endpoint
- Spam question creation attempts
- Xano Free tier rate limit exhaustion

**Fix Required:**
Xano doesn't have built-in rate limiting. Options:
1. Implement in Vercel (already done ✅)
2. Add IP tracking in Xano Lambda
3. Use Cloudflare in front of Xano

**Recommendation:** Keep Vercel rate limiting. Consider adding Cloudflare for additional protection.

---

### 7. Internal API Key Exposure Risk
**Endpoints:** `/internal/*`
**Current State:** `x_api_key` in query parameter

**Vulnerability:**
```bash
# API key visible in logs, browser history, analytics
GET /internal/media?x_api_key=secret-key-here
```

**Impact:** 🟠 **HIGH**
- API key logged in server logs
- Visible in analytics tools
- Can't be easily rotated

**Fix Required:**
```javascript
// Option 1: Move to header
Authorization: Bearer {internal-api-key}

// Option 2: Use request body (for POST/DELETE)
POST /internal/media
{
  "x_api_key": "secret-key"
}

// Option 3: Use Xano environment variable validation
// But still accept in header for security
```

**Recommendation:** Move `x_api_key` from query param to `Authorization` header.

---

### 8. Missing Ownership Check on Question Hide
**Endpoint:** `POST /question/hidden`
**Current State:** Requires authentication, ownership check not documented

**Vulnerability:**
```javascript
// Expert A tries to hide Expert B's question
POST /question/hidden
Authorization: Bearer {expert-a-token}
{
  "question_id": 123,  // Expert B's question
  "hidden": true
}
```

**Impact:** 🟠 **HIGH**
- Experts can hide other experts' questions
- Data integrity issues
- Potential for malicious behavior

**Fix Required:**
```javascript
// In Xano POST /question/hidden

// 1. Get the question
var question = Get Record from question where id = $var.question_id

// 2. Get authenticated user's expert profile
var user = Get Record from user where id = $authUser.id
var expert_profile = Get Record from expert_profile where user_id = user.id

// 3. Verify ownership
if (question.expert_profile_id !== expert_profile.id) {
  return response({
    error: "Forbidden: Not your question"
  }, 403)
}
```

---

## 🟡 MEDIUM Security Issues

### 9. Email Exposure in Public Endpoints
**Endpoint:** `GET /public/profile`
**Current State:** User email NOT exposed (✅ GOOD)

**Note:** This is actually secure! Just verifying it stays this way.

**Recommendation:** Continue excluding email from public profile responses.

---

### 10. Missing Input Validation
**Endpoints:** Various create/update endpoints
**Current State:** Minimal validation documented

**Examples:**
```javascript
// No length limits documented
POST /question/quick-consult
{
  "title": "A".repeat(1000000),  // ❌ Can cause DB issues
  "text": "B".repeat(1000000)
}

// No email format validation
POST /question/quick-consult
{
  "payer_email": "not-an-email"  // ❌ Invalid email
}
```

**Impact:** 🟡 **MEDIUM**
- Database bloat
- Performance issues
- Invalid data

**Fix Required:**
```javascript
// Add validation Lambda steps

// Title validation
if (!$var.title || $var.title.length < 5) {
  return response({ error: "Title too short (min 5 chars)" }, 400)
}
if ($var.title.length > 500) {
  return response({ error: "Title too long (max 500 chars)" }, 400)
}

// Email validation
var email_pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
if (!email_pattern.test($var.payer_email)) {
  return response({ error: "Invalid email format" }, 400)
}

// Price validation
if ($var.price_cents < 50 || $var.price_cents > 1000000) {
  return response({ error: "Invalid price range" }, 400)
}
```

---

### 11. Missing CSRF Protection
**Current State:** Bearer token authentication only
**Impact:** 🟡 **MEDIUM**

**Note:** Bearer tokens provide some CSRF protection, but additional measures can help.

**Recommendation:**
- Vercel endpoints should validate `Origin` header
- Consider adding nonce/CSRF tokens for state-changing operations

---

### 12. No Audit Logging
**Current State:** No security event logging documented
**Impact:** 🟡 **MEDIUM**

**Examples of events to log:**
- Failed authentication attempts
- Ownership verification failures
- Price manipulation attempts
- Suspicious activity patterns

**Recommendation:**
Create `security_audit_log` table:
```sql
CREATE TABLE security_audit_log (
  id INT PRIMARY KEY AUTO_INCREMENT,
  event_type TEXT,  -- 'auth_failure', 'ownership_violation', etc.
  user_id INT NULLABLE,
  ip_address TEXT,
  endpoint TEXT,
  request_data JSON,
  created_at TIMESTAMP
)
```

---

## 🟢 LOW Priority Issues

### 13. Missing API Versioning
**Current State:** Endpoints have no version number
**Impact:** 🟢 **LOW**

**Future Consideration:** Use `/v1/question`, `/v2/question` for breaking changes

---

### 14. No Request ID Tracing
**Current State:** No correlation between Vercel → Xano requests
**Impact:** 🟢 **LOW**

**Recommendation:** Add `X-Request-ID` header for debugging

---

## Security Checklist by Endpoint

### Public API Endpoints (api:BQW1GS7L)

| Endpoint | Auth | Ownership | Rate Limit | Input Validation | Data Leaks | Status |
|----------|------|-----------|------------|------------------|------------|--------|
| `POST /question` | ❌ None | N/A | ❌ No | ⚠️ Partial | ⚠️ Allows paid | 🔴 CRITICAL |
| `POST /question/quick-consult` | ❌ None | N/A | ⚠️ Vercel | ⚠️ Partial | ❌ No price verify | 🔴 CRITICAL |
| `POST /question/deep-dive` | ❌ None | N/A | ⚠️ Vercel | ⚠️ Partial | ❌ No price verify | 🔴 CRITICAL |
| `GET /public/profile` | ✅ None (OK) | N/A | ❌ No | ✅ Good | ✅ No email | ✅ OK |
| `GET /question/{id}` | ✅ Required | ❓ Unknown | ❌ No | N/A | ❌ Token leak? | 🟠 CHECK |
| `GET /review/{token}` | ✅ Token | ✅ Token | ❌ No | N/A | ✅ OK | ✅ OK |
| `POST /marketing/public/track-visit` | ✅ None (OK) | N/A | ❌ No | ⚠️ Partial | ✅ OK | ✅ OK |
| `POST /internal/media` | ✅ API Key | N/A | ❌ No | N/A | ⚠️ All data | ⚠️ KEY RISK |

### Authentication API Endpoints (api:3B14WLbJ)

| Endpoint | Auth | Ownership | Rate Limit | Input Validation | Data Leaks | Status |
|----------|------|-----------|------------|------------------|------------|--------|
| `GET /me/questions` | ✅ Required | ✅ By auth | ❌ No | N/A | ❌ Token leak | 🔴 FIX |
| `POST /answer` | ✅ Required | ❓ Unknown | ❌ No | ⚠️ Partial | ❌ Token leak? | 🟠 CHECK |
| `POST /question/hidden` | ✅ Required | ❓ Unknown | ❌ No | ⚠️ Partial | ✅ OK | 🟠 CHECK |
| `POST /offers/{id}/accept` | ✅ Required | ❓ Unknown | ⚠️ Vercel | N/A | ❌ Token leak? | 🔴 CHECK |
| `POST /offers/{id}/decline` | ✅ Required | ❓ Unknown | ⚠️ Vercel | N/A | ❌ Token leak? | 🔴 CHECK |

---

## Immediate Action Items

### 🔴 Critical (Fix Before Launch)

1. **Disable public POST /question endpoint**
   - Require `x_api_key` for all question creation
   - Move to internal API only

2. **Add payment intent validation**
   - Check for duplicate usage
   - Add unique constraint on `stripe_payment_intent_id`

3. **Add ownership verification**
   - `/offers/{id}/accept`
   - `/offers/{id}/decline`
   - `/question/hidden`

4. **Remove playback_token_hash from expert responses**
   - All `/me/questions` endpoints
   - All question detail endpoints accessed by experts

5. **Add price validation**
   - Verify Quick Consult price matches expert price
   - Fetch price from database, not request body

### 🟠 High Priority (Fix This Week)

6. **Move internal API key to header**
   - Update cron jobs to use `Authorization: Bearer {key}`

7. **Add comprehensive input validation**
   - Title length limits
   - Email format validation
   - Price range validation

8. **Test ownership checks**
   - Verify all authenticated endpoints check ownership

### 🟡 Medium Priority (Fix Next Week)

9. **Add audit logging**
   - Log all security events
   - Monitor for suspicious patterns

10. **Improve error messages**
    - Don't leak information in errors
    - Use generic "Not found" vs "Not authorized"

---

## Testing Security Fixes

### Test 1: Unauthorized Question Creation
```bash
# Should fail with 401 Unauthorized
curl -X POST https://xano-url/api:BQW1GS7L/question \
  -H "Content-Type: application/json" \
  -d '{
    "expert_profile_id": 107,
    "status": "paid",
    "price_cents": 0
  }'
```

### Test 2: Duplicate Payment Intent
```bash
# First question - should succeed
curl -X POST https://xano-url/api:BQW1GS7L/question/quick-consult \
  -d '{"stripe_payment_intent_id": "pi_test_123", ...}'

# Second question with same payment - should fail
curl -X POST https://xano-url/api:BQW1GS7L/question/quick-consult \
  -d '{"stripe_payment_intent_id": "pi_test_123", ...}'
```

### Test 3: Cross-Expert Offer Accept
```bash
# Expert A tries to accept Expert B's offer - should fail with 403
curl -X POST https://xano-url/api:3B14WLbJ/offers/123/accept \
  -H "Authorization: Bearer {expert-a-token}"
```

### Test 4: playback_token_hash Leakage
```bash
# Should NOT include playback_token_hash in response
curl -X GET https://xano-url/api:3B14WLbJ/me/questions \
  -H "Authorization: Bearer {expert-token}"
```

---

## Security Best Practices for Xano

### ✅ DO:
- Always verify ownership before state-changing operations
- Fetch pricing from database, never trust client input
- Exclude sensitive fields (tokens, emails) from responses
- Use API keys for internal endpoints
- Add unique constraints for one-time-use fields
- Log security events for monitoring

### ❌ DON'T:
- Trust status fields from request body
- Allow public endpoints to create paid records
- Return `playback_token_hash` to experts
- Use query parameters for secrets
- Skip input validation
- Assume authentication implies authorization

---

## Deployment Checklist

Before going to production:

- [ ] Disable public POST /question
- [ ] Add unique constraint on stripe_payment_intent_id
- [ ] Add ownership checks to offers endpoints
- [ ] Remove playback_token_hash from expert responses
- [ ] Add server-side price validation
- [ ] Move internal API key to headers
- [ ] Add input validation (title, email, price)
- [ ] Create security audit log table
- [ ] Test all security fixes
- [ ] Review Xano access logs for suspicious activity

---

## Monitoring & Alerts

**Set up alerts for:**
1. Failed authentication attempts (> 10/hour)
2. Ownership verification failures (> 5/hour)
3. Invalid payment intent usage attempts
4. Unusual traffic patterns to public endpoints
5. Internal API key usage from unknown IPs

**Weekly Review:**
- Check security audit logs
- Review failed requests
- Analyze attack patterns
- Update security rules

---

## Resources

- [Xano Security Documentation](https://docs.xano.com)
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [Stripe Security Best Practices](https://stripe.com/docs/security)

---

**Status:** 🔴 **REQUIRES IMMEDIATE ACTION**
**Next Steps:** Implement critical fixes BEFORE production deployment
**Estimated Time:** 8-12 hours for all critical fixes
