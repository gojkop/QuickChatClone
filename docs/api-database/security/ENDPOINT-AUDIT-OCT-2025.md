# Xano Endpoint Audit - October 2025

Complete audit of all Xano endpoints to identify security testing needs, obsolete endpoints, and usage status.

---

## Summary

**Total Endpoints:** 58
- ✅ **Tested (Security Suite):** 6 endpoints
- ⚠️ **Need Security Testing:** 12 endpoints
- ✓ **In Use:** 52 endpoints
- ❌ **Obsolete/Unused:** 2 endpoints
- 📖 **Read-Only (Lower Priority):** 21 endpoints
- 🔓 **Public (No Auth):** 6 endpoints
- 🔒 **Internal (Admin Only):** 5 endpoints

---

## Authentication API (Group #1) - 30 Endpoints

### ✅ Already Security Tested

| Endpoint | Method | Status | Test Coverage |
|----------|--------|--------|---------------|
| `/question/{id}` | PATCH | ✅ Tested | Auth, Ownership, Token protection |
| `/answer` | POST | ✅ Tested | Cross-expert blocking |

### ⚠️ Need Security Testing - HIGH PRIORITY

| Endpoint | Method | Risk | Security Concerns | Used? |
|----------|--------|------|-------------------|-------|
| `/offers/{id}/accept` | POST | 🔴 High | Expert ownership, payment capture | ✓ Yes |
| `/offers/{id}/decline` | POST | 🔴 High | Expert ownership, refund trigger | ✓ Yes |
| `/payment/capture` | POST | 🔴 High | Payment manipulation, ownership | ✓ Yes |
| `/question/{question_id}/refund` | POST | 🔴 High | Refund abuse, ownership check | ✓ Yes |
| `/me/account` | PUT | 🟡 Medium | Account takeover, data validation | ✓ Yes |
| `/me/profile` | PUT | 🟡 Medium | Profile manipulation, XSS | ✓ Yes |
| `/me/delete-account` | DELETE | 🔴 High | Accidental deletion, ownership | ✓ Yes |
| `/expert/pricing-tiers` | PUT | 🟡 Medium | Price manipulation, validation | ✓ Yes |
| `/upload/profile-picture` | POST | 🟡 Medium | File upload abuse, ownership | ✓ Yes |
| `/question/hidden` | POST | 🟡 Medium | Cross-expert hiding, ownership | ✓ Yes |
| `/expert/profile/availability` | POST | 🟢 Low | Availability manipulation | ✓ Yes |
| `/media_asset` | POST | 🟡 Medium | Orphaned media, ownership | ✓ Yes |

### 📖 Read-Only Endpoints (Lower Priority)

| Endpoint | Method | Security Note | Used? |
|----------|--------|---------------|-------|
| `/auth/me` | GET | Auth required, returns own data | ✓ Yes |
| `/me/profile` | GET | Auth required, returns own profile | ✓ Yes |
| `/me/questions` | GET | Auth required, returns own questions | ✓ Yes |
| `/me/questions/count` | GET | Auth required, count only | ✓ Yes |
| `/me/answers` | GET | Auth required, returns own answers | ✓ Yes |
| `/me/analytics` | GET | Auth required, own analytics | ✓ Yes |
| `/expert/pending-offers` | GET | Auth required, own offers only | ✓ Yes |
| `/expert/pricing-tiers` | GET | Auth required, own pricing | ✓ Yes |
| `/marketing/campaigns` | GET | Auth required, own campaigns | ✓ Yes |
| `/marketing/insights` | GET | Auth required, own insights | ✓ Yes |
| `/marketing/share-templates` | GET | Auth required, templates | ✓ Yes |
| `/marketing/traffic-sources` | GET | Auth required, own traffic | ✓ Yes |
| `/questions/{question_id}/recording-segments` | GET | Auth required, lazy-loading | ✓ Yes |

### ✓ Write Endpoints (Lower Risk)

| Endpoint | Method | Security Note | Used? |
|----------|--------|---------------|-------|
| `/me/bootstrap` | POST | Creates default data on first login | ✓ Yes |
| `/marketing/campaigns` | POST | Creates own campaign, validated | ✓ Yes |

### ❌ Obsolete/Unused Endpoints

| Endpoint | Method | Reason | Recommendation |
|----------|--------|--------|----------------|
| `/answer` | GET | Not found in codebase | **DELETE** or document purpose |

---

## Public API (Group #3) - 28 Endpoints

### ✅ Already Security Tested

| Endpoint | Method | Status | Test Coverage |
|----------|--------|--------|---------------|
| `/question/quick-consult` | POST | ✅ Tested | Payment reuse prevention |
| `/question/deep-dive` | POST | ✅ Tested | Payment reuse prevention |
| `/review/{token}` | GET | ✅ Tested | Token access control |
| `/review/{token}/feedback` | POST | ✅ Tested | Token validation, rating range |

### 🔓 Public Endpoints (No Auth Required)

| Endpoint | Method | Security Note | Used? |
|----------|--------|---------------|-------|
| `/public/profile` | GET | Public expert profile | ✓ Yes |
| `/auth/linkedin/create_user` | POST | OAuth flow, internal API key | ✓ Yes |
| `/auth/magic-link/initiate` | POST | Rate limited, email validation | ✓ Yes |
| `/auth/magic-link/verify` | POST | Token validation, one-time use | ✓ Yes |
| `/marketing/public/track-visit` | POST | UTM tracking, no sensitive data | ✓ Yes |
| `/marketing/link-question` | POST | Campaign attribution | ✓ Yes |

### 🔒 Internal Endpoints (Admin Only)

| Endpoint | Method | Security Note | Used? |
|----------|--------|---------------|-------|
| `/internal/digest/pending-questions` | GET | Requires x_api_key | ✓ Yes (cron) |
| `/internal/magic-link-token` | DELETE | Requires x_api_key | ✓ Yes (cron) |
| `/internal/media` | GET | Requires x_api_key | ✓ Yes (cron) |
| `/internal/media_asset` | DELETE | Requires x_api_key | ✓ Yes (cron) |
| `/internal/user/{user_id}/email` | GET | Requires x_api_key | ✓ Yes |

### 🕐 Cron Endpoints (Automated Systems)

| Endpoint | Method | Security Note | Used? |
|----------|--------|---------------|-------|
| `/questions/pending-offers` | GET | Returns pending offers for expiration | ✓ Yes (cron) |
| `/questions/expired-sla` | GET | Returns SLA-expired questions | ✓ Yes (cron) |
| `/question/{id}/expire-offer` | POST | Expires offer, triggers refund | ✓ Yes (cron) |
| `/question/{id}/expire-sla` | POST | Expires SLA, triggers refund | ✓ Yes (cron) |

### ❌ Obsolete/Unused Endpoints

| Endpoint | Method | Reason | Recommendation |
|----------|--------|--------|----------------|
| `/feedback` | POST | Not used in UI, admin only? | Document or move to internal |
| `/feedback` | GET | Not used in UI, admin only? | Document or move to internal |

### ✓ Other Public Endpoints

| Endpoint | Method | Security Note | Used? |
|----------|--------|---------------|-------|
| `/media_asset` | POST | Creates media record after upload | ✓ Yes |

---

## Security Testing Recommendations

### Priority 1: Critical Payment/Refund Endpoints

**Add to security test suite immediately:**

1. **POST /offers/{id}/accept** - Test cross-expert acceptance
   - Expert B cannot accept Expert A's offer
   - Invalid offer ID rejected
   - Already accepted offer rejected

2. **POST /offers/{id}/decline** - Test cross-expert decline
   - Expert B cannot decline Expert A's offer
   - Invalid offer ID rejected
   - Already declined offer rejected

3. **POST /payment/capture** - Test payment capture security
   - Cannot capture payment for other expert's question
   - Cannot capture already captured payment
   - Invalid payment_intent_id rejected

4. **POST /question/{question_id}/refund** - Test refund security
   - Cannot refund other expert's question
   - Cannot refund already refunded question
   - Validates question state

### Priority 2: Account Management Endpoints

**Add after Priority 1:**

5. **DELETE /me/delete-account** - Test account deletion
   - Requires authentication
   - Deletes own account only
   - Cascades properly

6. **PUT /me/account** - Test account update
   - Cannot update to existing email
   - Validates input data
   - Auth required

7. **PUT /me/profile** - Test profile update
   - Sanitizes input (XSS prevention)
   - Validates data
   - Auth required

### Priority 3: Expert Management Endpoints

**Add after Priority 2:**

8. **PUT /expert/pricing-tiers** - Test pricing update
   - Validates price ranges
   - Auth required
   - Cannot set negative prices

9. **POST /question/hidden** - Test question hiding
   - Cannot hide other expert's questions
   - Auth required

10. **POST /upload/profile-picture** - Test file upload
    - File type validation
    - File size limits
    - Auth required

### Priority 4: Lower Risk Endpoints

11. **POST /expert/profile/availability** - Test availability
12. **POST /media_asset** - Test media creation

---

## Obsolete Endpoint Investigation

### Endpoints to Review

1. **GET /answer** (#22 in Authentication API)
   - **Status:** Not found in any frontend or backend code
   - **Recommendation:** Either DELETE or document its purpose
   - **Action:** Check with team if this is legacy or planned feature

2. **POST /feedback** (#23 in Public API)
   - **Status:** Found only in admin docs
   - **Recommendation:** Move to internal API group OR delete
   - **Action:** Verify if admin feedback system uses this

3. **GET /feedback** (#24 in Public API)
   - **Status:** Found only in admin docs
   - **Recommendation:** Move to internal API group OR delete
   - **Action:** Verify if admin feedback system uses this

---

## Testing Plan

### Phase 1: Critical Endpoints (Week 1)

**Goal:** Add 4 critical payment/refund tests

```bash
# New tests to add:
- testOfferAcceptOwnership()
- testOfferDeclineOwnership()
- testPaymentCaptureOwnership()
- testQuestionRefundOwnership()
```

**Expected result:** 16 tests passing (12 current + 4 new)

### Phase 2: Account Management (Week 2)

**Goal:** Add 3 account management tests

```bash
# New tests to add:
- testAccountDeletion()
- testAccountUpdate()
- testProfileUpdate()
```

**Expected result:** 19 tests passing (16 + 3)

### Phase 3: Expert Management (Week 3)

**Goal:** Add 4 expert management tests

```bash
# New tests to add:
- testPricingTiersUpdate()
- testQuestionHiding()
- testProfilePictureUpload()
- testMediaAssetCreation()
```

**Expected result:** 23 tests passing (19 + 4)

### Phase 4: Cleanup (Week 4)

**Goal:** Remove obsolete endpoints, document all endpoints

- Delete or document GET /answer
- Move or delete feedback endpoints
- Update API documentation
- Create Swagger/OpenAPI spec

---

## Endpoint Security Patterns

### Pattern 1: Cross-Expert Ownership Check

**Used by:**
- PATCH /question/{id}
- POST /answer
- POST /offers/{id}/accept
- POST /offers/{id}/decline
- POST /question/{question_id}/refund
- POST /question/hidden

**Implementation:**
```javascript
// Get expert profile from auth
db.get expert_profile {
  field_name = "user_id"
  field_value = $auth.id
} as $expert_profile

// Get resource
db.get question {
  field_name = "id"
  field_value = $input.id
} as $question

// Check ownership
conditional {
  if ($question.expert_profile_id != $expert_profile.id) {
    debug.stop {
      value = '403 error "Forbidden: Not your resource"'
    }
  }
}
```

### Pattern 2: Payment Intent Reuse Prevention

**Used by:**
- POST /question/quick-consult
- POST /question/deep-dive

**Implementation:**
```javascript
// Check payment FIRST (before creating question)
db.get payment_table_structure {
  field_name = "stripe_payment_intent_id"
  field_value = $input.stripe_payment_intent_id
} as $existing_payment

conditional {
  if ($existing_payment != null) {
    debug.stop {
      value = '400 error "Payment already used"'
    }
  }
}
```

### Pattern 3: Token-Based Access

**Used by:**
- GET /review/{token}
- POST /review/{token}/feedback

**Implementation:**
```javascript
// Get by token hash
db.get question {
  field_name = "playback_token_hash"
  field_value = $input.token
} as $question

conditional {
  if ($question == null) {
    debug.stop {
      value = '404 error "Invalid token"'
    }
  }
}
```

### Pattern 4: Internal API Key Authentication

**Used by:**
- All /internal/* endpoints

**Implementation:**
```javascript
input {
  text x_api_key
}

conditional {
  if ($input.x_api_key != env.XANO_INTERNAL_API_KEY) {
    debug.stop {
      value = '401 error "Unauthorized"'
    }
  }
}
```

---

## Configuration for New Tests

### Update `/tests/.env`

```bash
# Existing config
XANO_AUTH_API=https://xlho-4syv-navp.n7e.xano.io/api:XEsV5Zbo
XANO_PUBLIC_API=https://xlho-4syv-navp.n7e.xano.io/api:BQW1GS7L

EXPERT_A_TOKEN=eyJhbGc...
EXPERT_A_PROFILE_ID=139
EXPERT_A_QUESTION_ID=264

EXPERT_B_TOKEN=eyJhbGc...
EXPERT_B_PROFILE_ID=138
EXPERT_B_QUESTION_ID=279

VALID_REVIEW_TOKEN=71890360-1fc6-4f26-9b5d-7338003b625c

# NEW: For offer testing
PENDING_OFFER_ID=123  # Deep Dive offer in pending state owned by Expert A
ANOTHER_EXPERT_OFFER_ID=456  # Offer owned by Expert B

# NEW: For payment testing
AUTHORIZED_PAYMENT_INTENT=pi_123_authorized  # Payment in authorized state
CAPTURED_PAYMENT_INTENT=pi_456_captured  # Already captured payment

# NEW: For refund testing
REFUNDABLE_QUESTION_ID=789  # Unanswered question with payment
REFUNDED_QUESTION_ID=012  # Already refunded question
```

---

## Documentation Updates Needed

1. **Update SECURITY-VALIDATION-GUIDE.md**
   - Add new test suites (Priority 1-3)
   - Update test count to 23 total tests
   - Add configuration for new test data

2. **Update XANO-MANUAL-TESTING.md**
   - Add manual test payloads for new endpoints
   - Include debugging tips for payment/refund flows

3. **Update CLAUDE.md**
   - Update test coverage section
   - Add new endpoints to API documentation

4. **Create ENDPOINT-SECURITY-PATTERNS.md**
   - Document common security patterns
   - Provide reusable code snippets
   - Include anti-patterns to avoid

---

## Next Actions

**Immediate (This Week):**
1. ✅ Review this audit with team
2. ⏳ Investigate obsolete endpoints (GET /answer, feedback endpoints)
3. ⏳ Create test data for Priority 1 endpoints
4. ⏳ Implement Priority 1 security tests

**Short-term (Next 2 Weeks):**
5. ⏳ Implement Priority 2 security tests
6. ⏳ Delete or document obsolete endpoints
7. ⏳ Update all endpoint documentation

**Long-term (Next Month):**
8. ⏳ Implement Priority 3 security tests
9. ⏳ Create Swagger/OpenAPI specification
10. ⏳ Set up CI/CD for automated security testing

---

**Audit Date:** October 26, 2025
**Audited By:** Claude Code
**Status:** 🟡 Needs Action
**Next Review:** November 26, 2025
