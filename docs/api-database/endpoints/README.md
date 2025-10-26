# Xano API Endpoints

Complete reference for all QuickChat Xano API endpoint implementations organized by feature area.

---

## 📁 Directory Structure

### [`questions/`](./questions/)
Question creation and management endpoints.

**Endpoints:**
- `quick-consult.xs` - POST /question/quick-consult (Tier 1)
- `deep-dive.xs` - POST /question/deep-dive (Tier 2)
- `id.xs` - GET /question/{id}, PATCH /question/{id}
- `answer.xs` - POST /answer

**Features:**
- Two-tier pricing (Quick Consult vs Deep Dive)
- Payment hold and capture integration
- SLA tracking
- Auto-decline logic for Deep Dive

### [`offers/`](./offers/)
Deep Dive offer management (Tier 2 pricing).

**Endpoints:**
- `accept.xs` - POST /offers/{id}/accept
- `decline.xs` - POST /offers/{id}/decline

**Features:**
- Expert review of custom pricing
- Ownership validation
- SLA timer activation on accept
- Decline reason tracking

### [`payments/`](./payments/)
Payment capture and refund operations.

**Endpoints:**
- `capture.xs` - POST /payment/capture
- `refund.xs` - POST /question/{id}/refund

**Features:**
- Stripe payment intent capture
- Payment lifecycle tracking
- Refund processing
- Cross-expert ownership validation

### [`reviews/`](./reviews/)
Review and feedback system.

**Endpoints:**
- `review_feedback.xs` - POST /review/{token}/feedback

**Features:**
- Unauthenticated access via review token
- Rating validation (1-5 stars)
- Text feedback collection

### [`user/`](./user/)
User account and profile management.

**Endpoints:**
- `account.xs` - PUT /me/account
- `profile.xs` - GET /expert/profile/{handle}
- `deleteacc.xs` - DELETE /me/delete-account
- `availability.xs` - POST /expert/profile/availability

**Features:**
- Profile updates
- Public profile data
- GDPR-compliant account deletion
- Availability toggle for experts

### [`media/`](./media/)
Media upload and asset management.

**Endpoints:**
- `upload.xs` - POST /upload/profile-picture
- `media.xs` - Media asset queries

**Features:**
- Cloudflare R2 integration
- Profile picture uploads
- Media asset tracking

### [`public/`](./public/)
Public (unauthenticated) endpoints.

**Endpoints:**
- `pricing-tiers.xs` - GET /expert/pricing-tiers
- `hidden.xs` - POST /expert/profile/hidden

**Features:**
- Public profile data access
- Pricing tier configuration
- Profile visibility controls

### [`obsolete/`](./obsolete/)
Deprecated endpoints (moved to separate Xano group).

**Endpoints:**
- `feedback_g.xs` - GET /feedback (obsolete)
- `feedback_p.xs` - POST /feedback (obsolete)

**Note:** These endpoints have been moved out of the main API group and are no longer in use.

---

## 🔗 Endpoint Summary

| Endpoint | Method | Auth | Status |
|----------|--------|------|--------|
| **Questions** ||||
| /question/quick-consult | POST | ✅ Required | ✅ Production |
| /question/deep-dive | POST | ✅ Required | ✅ Production |
| /question/{id} | GET | ✅ Required | ✅ Production |
| /question/{id} | PATCH | ✅ Required | ✅ Production |
| /answer | POST | ✅ Required | ✅ Production |
| **Offers** ||||
| /offers/{id}/accept | POST | ✅ Required | ✅ Production |
| /offers/{id}/decline | POST | ✅ Required | ✅ Production |
| **Payments** ||||
| /payment/capture | POST | ✅ Required | ✅ Production |
| /question/{id}/refund | POST | ✅ Required | ✅ Production |
| **Reviews** ||||
| /review/{token}/feedback | POST | ❌ Public | ✅ Production |
| **User** ||||
| /me/account | PUT | ✅ Required | ✅ Production |
| /expert/profile/{handle} | GET | ❌ Public | ✅ Production |
| /me/delete-account | DELETE | ✅ Required | ✅ Production |
| /expert/profile/availability | POST | ✅ Required | ✅ Production |
| **Media** ||||
| /upload/profile-picture | POST | ✅ Required | ✅ Production |

---

## 🔐 Security Patterns

### Ownership Validation

All authenticated endpoints must validate ownership:

```javascript
conditional {
  if ($question.expert_profile_id != $expert_profile.id) {
    debug.stop {
      value = '403 error "Forbidden: Not your question"'
    }
  }
}
```

### Auto-Decline Logic (Deep Dive)

```javascript
conditional {
  if ($var.expert_profile.tier2_auto_decline_below_cents != null) {
    if ($var.proposed_price_cents < $var.expert_profile.tier2_auto_decline_below_cents) {
      // Auto-decline offer
      return {
        pricing_status: 'offer_declined',
        status: 'declined',
        decline_reason: 'Offer below minimum threshold'
      }
    }
  }
}
```

### Payment Validation

```javascript
// Check if payment intent already used
db.query question {
  where = $db.question.stripe_payment_intent_id == $var.stripe_payment_intent_id
  return = {type: "single"}
} as $existing_question

conditional {
  if ($existing_question != null) {
    debug.stop {
      value = '400 error "Payment intent already used"'
    }
  }
}
```

---

## 📊 Testing Coverage

**Automated Security Tests:** 16/16 passing

**Tested Endpoints:**
- ✅ PATCH /question/{id} (authentication + ownership)
- ✅ POST /answer (cross-expert blocking)
- ✅ POST /question/quick-consult (payment reuse prevention)
- ✅ POST /question/deep-dive (payment reuse prevention)
- ✅ POST /review/{token}/feedback (token validation, rating range)
- ✅ GET /review/{token} (token access control)
- ✅ POST /offers/{id}/accept (ownership validation)
- ✅ POST /offers/{id}/decline (ownership validation)
- ✅ POST /payment/capture (ownership validation)
- ✅ POST /question/{id}/refund (ownership validation)

**See:** [`../../testing/SECURITY-VALIDATION-GUIDE.md`](../../testing/SECURITY-VALIDATION-GUIDE.md) for complete test documentation.

---

## 🛠️ Implementation Guidelines

### Creating New Endpoints

1. **Choose correct category** based on endpoint purpose
2. **Document in markdown** with Xano function stack syntax
3. **Add security checks** (ownership, validation)
4. **Use proper error handling** (conditional + debug.stop)
5. **Add security test** in `/tests/security-validation.cjs`
6. **Test manually** in Xano Run & Debug

### Error Handling Pattern

```javascript
// Always use conditional with debug.stop
conditional {
  if (error_condition) {
    debug.stop {
      value = '400 error "Error message here"'
    }
  }
}

// ❌ NEVER use lambda throw or return
// These patterns don't work reliably in Xano
```

### Lambda Variable Scoping

```javascript
// ✅ CORRECT - Use $var. prefix
api.lambda {
  code = """
    const threshold = $var.expert_profile.tier2_auto_decline_below_cents;
    const price = $var.proposed_price_cents;
  """
}

// ❌ WRONG - Direct variable access doesn't work
api.lambda {
  code = """
    const threshold = expert_profile.tier2_auto_decline_below_cents;
  """
}
```

---

## 🔗 Related Documentation

- **Security:** [`../security/SECURITY-REVIEW-HIGH-PRIORITY-ENDPOINTS.md`](../security/SECURITY-REVIEW-HIGH-PRIORITY-ENDPOINTS.md)
- **Testing:** [`../../testing/README.md`](../../testing/README.md)
- **Troubleshooting:** [`../guides/XANO-LAMBDA-TROUBLESHOOTING.md`](../guides/XANO-LAMBDA-TROUBLESHOOTING.md)

---

**Last Updated:** October 26, 2025
**Total Endpoints:** 19 (16 production, 3 obsolete)
**Status:** ✅ All high-priority endpoints secured and tested
