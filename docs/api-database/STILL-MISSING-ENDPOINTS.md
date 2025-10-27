# Still Missing Endpoints

**Date:** October 26, 2025
**Previous Count:** 28 missing
**Added:** 17 endpoints ✅
**Still Missing:** 11 endpoints

---

## ✅ Recently Added (Great Progress!)

### Phase 1-4 Complete! 🎉

**Authentication (3/3):** ✅ Complete
- ✅ auth/linkedin-create-user.xs
- ✅ auth/magic-link-initiate.xs
- ✅ auth/magic-link-verify.xs

**Public Endpoints (3/3):** ✅ Complete
- ✅ public/profile.xs
- ✅ public/review-get.xs
- ✅ public/track-visit.xs

**Marketing (4/5):** ✅ Complete
- ✅ marketing/campaigns-get.xs
- ✅ marketing/campaigns-post.xs
- ✅ marketing/traffic-sources.xs
- ✅ marketing/insights.xs

**Questions (4/4):** ✅ Complete
- ✅ questions/me-questions.xs
- ✅ questions/me-questions-count.xs
- ✅ questions/pending-offers.xs
- ✅ questions/question-hidden.xs

**User (3/3):** ✅ Complete
- ✅ user/me-profile-get.xs
- ✅ user/me-profile-put.xs
- ✅ user/me-answers.xs
- ✅ user/me-account-delete.xs (bonus!)

---

## ⚠️ Still Missing (11 Endpoints)

### High Priority (3 endpoints)

These are actively used in production:

#### 1. **POST /question** (Base Question Endpoint)
**Location:** `docs/api-database/endpoints/questions/base-question.xs`

**Purpose:** Base question creation endpoint (called by Vercel after payment validation)

**Used by:** Vercel API routes (not directly by frontend)

**Note:** Different from quick-consult.xs and deep-dive.xs

**Priority:** Medium-High (needed for documentation completeness)

---

#### 2. **POST /media_asset**
**Location:** `docs/api-database/endpoints/media/media-asset-post.xs`

**Purpose:** Create media asset record after Cloudflare upload

**Used by:** Question/Answer recording flows

**Auth:** User token required

**Priority:** High (core media functionality)

---

#### 3. **GET /answer**
**Location:** `docs/api-database/endpoints/questions/answer-get.xs`

**Purpose:** Get answer details by ID

**Used by:** Answer playback

**Auth:** Token or ownership required

**Priority:** Medium (might already be covered by /me/answers)

---

### Low Priority - Internal/Cron Endpoints (8 endpoints)

These work without documentation (only used by automated jobs):

**Location:** `docs/api-database/endpoints/internal/` (NEW DIRECTORY)

#### 4. **GET /questions/pending-offers**
**Purpose:** Get pending Deep Dive offers for expiration check
**Used by:** Cron job (cancel-expired-offers)
**Auth:** Internal API key (x_api_key query param)

#### 5. **GET /questions/expired-sla**
**Purpose:** Get questions past SLA deadline
**Used by:** Cron job (cancel-expired-slas)
**Auth:** Internal API key

#### 6. **POST /question/{id}/expire-offer**
**Purpose:** Mark Deep Dive offer as expired
**Used by:** Cron job (cancel-expired-offers)
**Auth:** Internal API key

#### 7. **POST /question/{id}/expire-sla**
**Purpose:** Mark question SLA as expired
**Used by:** Cron job (cancel-expired-slas)
**Auth:** Internal API key

#### 8. **GET /internal/media**
**Purpose:** Get all media for cleanup job
**Used by:** Cron job (cleanup-orphaned-media)
**Auth:** Internal API key

#### 9. **DELETE /internal/media_asset**
**Purpose:** Delete orphaned media asset
**Used by:** Cron job (cleanup-orphaned-media)
**Auth:** Internal API key
**Status:** ✅ Has reference file: delete-media.xs (can copy this)

#### 10. **DELETE /internal/magic-link-token**
**Purpose:** Delete old magic link tokens
**Used by:** Cron job (cleanup-orphaned-media)
**Auth:** Internal API key

#### 11. **GET /internal/digest/pending-questions**
**Purpose:** Get pending questions for email digest
**Used by:** Cron job (send-daily-digest)
**Auth:** Internal API key

---

## 📊 Progress Summary

**Original Missing:** 28 endpoints
**Added:** 17 endpoints (61% complete!)
**Still Missing:** 11 endpoints (39% remaining)

**By Priority:**
- **High Priority Missing:** 3 endpoints (media_asset, base-question, answer)
- **Low Priority Missing:** 8 endpoints (internal/cron jobs)

---

## 🎯 Recommended Next Steps

### Option 1: Complete High Priority Only (3 files)

Focus on production-critical endpoints:

```
docs/api-database/endpoints/media/
└── media-asset-post.xs       # POST /media_asset

docs/api-database/endpoints/questions/
├── base-question.xs          # POST /question
└── answer-get.xs             # GET /answer
```

### Option 2: Complete Everything (11 files)

Add internal/cron endpoints for complete documentation:

```
docs/api-database/endpoints/internal/  (NEW DIRECTORY)
├── questions-pending-offers.xs
├── questions-expired-sla.xs
├── question-expire-offer.xs
├── question-expire-sla.xs
├── media-get.xs
├── media-asset-delete.xs
├── magic-link-token-delete.xs
└── digest-pending-questions.xs
```

---

## ✨ Bonus: Potential Duplicates to Check

I noticed these files might be duplicates - please verify:

1. **user/deleteacc.xs** vs **user/me-account-delete.xs**
   - Both might be DELETE /me/delete-account
   - Check if one can be removed

2. **media/media.xs** vs potential **media/media-asset-post.xs**
   - Check if media.xs already covers POST /media_asset

3. **questions/answer.xs** vs potential **questions/answer-get.xs**
   - Check if answer.xs already covers GET /answer

---

## 📝 Notes

- All internal/cron endpoints are **low priority** - they work fine without docs
- Focus on the 3 high-priority endpoints if you want to wrap up quickly
- The 8 internal endpoints can be documented later if needed for completeness

---

**Status:** 61% Complete (17/28 added)
**Remaining High Priority:** 3 endpoints
**Remaining Low Priority:** 8 endpoints
