# API & Database Documentation

Complete documentation for QuickChat's Xano backend API endpoints, database schema, security implementations, and best practices.

---

## 📁 Directory Structure

### [`endpoints/`](./endpoints/)
Xano API endpoint implementations organized by feature area.

**Categories:**
- **questions/** - Question creation and management (Quick Consult, Deep Dive, Answer)
- **offers/** - Deep Dive offer management (Accept, Decline)
- **payments/** - Payment operations (Capture, Refund)
- **reviews/** - Review and feedback endpoints
- **user/** - User account and profile management
- **media/** - Media upload and management
- **public/** - Public endpoints (pricing, hidden profiles)
- **obsolete/** - Deprecated endpoints (moved to separate Xano group)

### [`security/`](./security/)
Security audits, reviews, and implementation guides.

**Documents:**
- Endpoint security audit (October 2025)
- Security review of high-priority endpoints
- Xano security fixes guide
- Security implementation completion report
- Historical security audit (January 2025)

### [`guides/`](./guides/)
Implementation guides, references, and troubleshooting documentation.

**Topics:**
- Xano endpoints reference
- Internal endpoints documentation
- Lambda troubleshooting guide
- Upload system master documentation

### [`migrations/`](./migrations/)
Database and feature migration documentation.

**Migrations:**
- Media asset architecture migration (October 2025)
- Account deletion implementation

### [`archive/`](./archive/)
Historical documentation, debug sessions, and resolved issues.

**Contents:**
- Session summaries
- Debug reports
- Fix documentation
- Test failure reports

---

## 🔗 Quick Links

### Most Used Documents

**Endpoint References:**
- [Xano Endpoints Reference](./guides/xano-endpoints.md) - Complete API endpoint list
- [Internal Endpoints](./guides/xano-internal-endpoints.md) - Internal/cron job endpoints

**Security:**
- [Endpoint Audit (Oct 2025)](./security/ENDPOINT-AUDIT-OCT-2025.md) - Current security status
- [Security Review (High Priority)](./security/SECURITY-REVIEW-HIGH-PRIORITY-ENDPOINTS.md) - Critical fixes applied

**Implementation Guides:**
- [Lambda Troubleshooting](./guides/XANO-LAMBDA-TROUBLESHOOTING.md) - Common Xano issues
- [Upload System Master](./guides/upload-system-master.md) - Media upload architecture

**Migrations:**
- [Media Asset Migration (Oct 2025)](./migrations/MEDIA-ASSET-MIGRATION-OCT-2025.md) - Architecture changes

---

## 📊 Endpoint Overview

**Total Endpoints:** 58
- **Tested:** 16 endpoints (with automated security tests)
- **High Priority:** All secured and tested
- **Medium Priority:** Pending review
- **Obsolete:** 3 endpoints (moved to separate group)

### Endpoint Categories

**Authentication & Users:**
- OAuth (Google, LinkedIn)
- Magic Link authentication
- Profile management
- Account deletion

**Questions & Answers:**
- Quick Consult creation
- Deep Dive offer submission
- Answer submission
- Question updates

**Payments:**
- Payment capture (hold → capture)
- Refunds and cancellations
- Payment intent validation

**Offers (Deep Dive):**
- Accept offer
- Decline offer
- Pending offers list

**Reviews:**
- Submit feedback
- Get review page data

**Media:**
- Upload endpoints (video, audio, attachments)
- Media asset management

**Marketing:**
- Campaign tracking
- UTM visit logging
- Analytics endpoints

**Internal/Cron:**
- Cleanup orphaned media
- Expire offers
- Expire SLA deadlines

---

## 🔐 Security Status

**Last Audit:** October 26, 2025

**Test Coverage:** 16/16 automated security tests passing

**Key Security Features:**
- ✅ Cross-expert ownership validation
- ✅ Payment reuse prevention
- ✅ Token security (playback tokens)
- ✅ Authentication enforcement
- ✅ Input validation

**See:** [`../testing/SECURITY-VALIDATION-GUIDE.md`](../testing/SECURITY-VALIDATION-GUIDE.md) for complete test documentation.

---

## 🏗️ Database Architecture

**Platform:** Xano (REST API + PostgreSQL database)

**Key Tables:**
- `user` - User accounts (askers + experts)
- `expert_profile` - Expert configuration and tier settings
- `question` - Questions submitted to experts
- `answer` - Expert responses
- `media_asset` - Cloudflare media references
- `payment_table_structure` - Payment lifecycle tracking
- `utm_campaigns` - Marketing campaigns
- `campaign_visits` - Visitor tracking
- `magic_link_tokens` - Passwordless auth tokens

**Relationships:**
- Questions link to experts via `expert_profile_id` (FK)
- Media referenced via `media_asset_id` (FK-only, no bidirectional)
- Payments linked via `stripe_payment_intent_id` and `question_id`

**See:** [`MEDIA-ASSET-MIGRATION-OCT-2025.md`](./migrations/MEDIA-ASSET-MIGRATION-OCT-2025.md) for architecture details.

---

## 🛠️ Development Patterns

### Xano Lambda Functions

**Variable Scoping:** Always use `$var.` prefix to access variables:

```javascript
// ✅ CORRECT
for (var i = 0; i < $var.conversions.length; i++) {
  var c = $var.conversions[i];
}

// ❌ WRONG
for (var i = 0; i < conversions.length; i++) {
  var c = conversions[i];
}
```

**See:** [`guides/XANO-LAMBDA-TROUBLESHOOTING.md`](./guides/XANO-LAMBDA-TROUBLESHOOTING.md) for complete guide.

### Security Checks

**Use conditional + debug.stop for validation:**

```javascript
// ✅ CORRECT
conditional {
  if ($question.expert_profile_id != $expert_profile.id) {
    debug.stop {
      value = '403 error "Forbidden: Not your question"'
    }
  }
}

// ❌ WRONG - Lambda throw doesn't work reliably
api.lambda {
  code = "if (condition) { throw new Error('Blocked'); }"
}
```

**See:** [`security/SECURITY-REVIEW-HIGH-PRIORITY-ENDPOINTS.md`](./security/SECURITY-REVIEW-HIGH-PRIORITY-ENDPOINTS.md) for patterns.

---

## 📝 Contributing

When adding new endpoints or modifying existing ones:

1. **Document in correct category** under `endpoints/[category]/`
2. **Add security tests** in `/tests/security-validation.cjs`
3. **Update security audit** in `security/ENDPOINT-AUDIT-OCT-2025.md`
4. **Follow patterns** from `guides/XANO-LAMBDA-TROUBLESHOOTING.md`
5. **Test manually** in Xano Run & Debug before deploying

---

## 🔗 Related Documentation

- **Testing:** [`../testing/README.md`](../testing/README.md) - Security validation tests
- **Features:** [`../features/`](../features/) - Feature implementation guides
- **Main Docs:** [`../README.md`](../README.md) - Complete documentation index

---

**Last Updated:** October 26, 2025
**Status:** ✅ Production Ready
**Maintainer:** QuickChat Development Team
