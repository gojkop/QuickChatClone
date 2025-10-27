# Missing Endpoint Documentation

**Date:** October 26, 2025
**Purpose:** List of Xano endpoints that exist but don't have `.xs` documentation files

---

## 📋 Missing Endpoints by Category

### 🔓 Public Endpoints (No Authentication)

**Location:** `docs/api-database/endpoints/public/`

1. **GET /public/profile**
   - **Purpose:** Get expert public profile by handle
   - **Used by:** PublicProfilePage.jsx, marketing module
   - **Status:** ⚠️ Documented in PUBLIC-ENDPOINTS-SECURITY-REVIEW.md but missing .xs file

2. **GET /review/{token}**
   - **Purpose:** Get question/answer for review page (asker view)
   - **Used by:** AnswerReviewPage.jsx
   - **Security:** Token-based access (UUID)
   - **Status:** ✅ Tested in security suite, ⚠️ missing .xs file

3. **POST /question**
   - **Purpose:** Base question creation endpoint (called by Vercel after payment)
   - **Used by:** Vercel API routes (not directly by frontend)
   - **Status:** ⚠️ Missing .xs file
   - **Note:** Different from quick-consult.xs and deep-dive.xs

---

### 🔐 Authentication Endpoints

**Location:** `docs/api-database/endpoints/auth/` (new directory needed)

4. **POST /auth/magic-link/initiate**
   - **Purpose:** Generate magic link token and send email
   - **Used by:** Sign-in page
   - **Security:** Rate limiting (3/hour per email)
   - **Status:** ✅ Fully documented in magic-link-authentication-guide.md, ⚠️ missing .xs file

5. **POST /auth/magic-link/verify**
   - **Purpose:** Verify magic link token and authenticate
   - **Used by:** Magic link callback page
   - **Security:** Token validation, one-time use
   - **Status:** ✅ Fully documented in magic-link-authentication-guide.md, ⚠️ missing .xs file

6. **POST /auth/linkedin/create_user**
   - **Purpose:** Create/update user from LinkedIn OAuth
   - **Used by:** LinkedIn OAuth flow (Vercel)
   - **Security:** Internal API key required
   - **Status:** ⚠️ Missing .xs file

---

### 📊 Marketing Endpoints

**Location:** `docs/api-database/endpoints/marketing/` (new directory needed)

7. **GET /marketing/campaigns**
   - **Purpose:** List expert's marketing campaigns with metrics
   - **Used by:** Marketing dashboard
   - **Auth:** Expert token required
   - **Status:** ⚠️ Missing .xs file

8. **POST /marketing/campaigns**
   - **Purpose:** Create new marketing campaign
   - **Used by:** Marketing dashboard
   - **Auth:** Expert token required
   - **Status:** ⚠️ Missing .xs file

9. **GET /marketing/traffic-sources**
   - **Purpose:** Get traffic breakdown by UTM source
   - **Used by:** Marketing analytics
   - **Auth:** Expert token required
   - **Status:** ⚠️ Missing .xs file

10. **GET /marketing/insights**
    - **Purpose:** Get performance insights and recommendations
    - **Used by:** Marketing dashboard
    - **Auth:** Expert token required
    - **Status:** ⚠️ Missing .xs file

11. **POST /marketing/public/track-visit**
    - **Purpose:** Track UTM campaign visits (public, no auth)
    - **Used by:** PublicProfilePage.jsx on load
    - **Security:** Should have rate limiting
    - **Status:** ⚠️ Documented in PUBLIC-ENDPOINTS-SECURITY-REVIEW.md, missing .xs file

---

### 👤 User/Profile Endpoints

**Location:** `docs/api-database/endpoints/user/`

12. **GET /me/profile**
    - **Purpose:** Get current user's profile data
    - **Used by:** Profile settings
    - **Auth:** User token required
    - **Status:** ⚠️ Missing .xs file (different from profile.xs which is GET /expert/profile/{handle})

13. **PUT /me/profile**
    - **Purpose:** Update current user's profile
    - **Used by:** Profile settings
    - **Auth:** User token required
    - **Status:** ⚠️ Missing .xs file

14. **GET /me/answers**
    - **Purpose:** Get expert's answers list
    - **Used by:** Expert dashboard
    - **Auth:** Expert token required
    - **Status:** ⚠️ Missing .xs file

---

### ❓ Questions Endpoints

**Location:** `docs/api-database/endpoints/questions/`

15. **GET /me/questions**
    - **Purpose:** Get expert's questions with pagination and filters
    - **Used by:** ExpertDashboardPage, ExpertInboxPage
    - **Auth:** Expert token required
    - **Params:** filter_type, page, per_page, sort_by, price_min, price_max
    - **Status:** ⚠️ Missing .xs file (separate from id.xs)

16. **GET /me/questions/count**
    - **Purpose:** Get count of pending questions for navbar badge
    - **Used by:** Navbar.jsx
    - **Auth:** Expert token required
    - **Status:** ⚠️ Missing .xs file

17. **POST /question/hidden**
    - **Purpose:** Toggle question hidden status
    - **Used by:** Expert dashboard (hide completed questions)
    - **Auth:** Expert token required
    - **Status:** ⚠️ Missing .xs file

18. **GET /expert/pending-offers**
    - **Purpose:** Get pending Deep Dive offers for expert
    - **Used by:** Expert dashboard
    - **Auth:** Expert token required
    - **Status:** ⚠️ Missing .xs file

---

### 📎 Media Endpoints

**Location:** `docs/api-database/endpoints/media/`

19. **POST /media_asset**
    - **Purpose:** Create media asset record after Cloudflare upload
    - **Used by:** Question/Answer recording flows
    - **Auth:** User token required
    - **Status:** ⚠️ Missing .xs file (different from media.xs)

20. **GET /answer**
    - **Purpose:** Get answer details by ID
    - **Used by:** Answer playback
    - **Auth:** Token or ownership required
    - **Status:** ⚠️ Missing .xs file

---

### 🔧 Internal/Cron Endpoints

**Location:** `docs/api-database/endpoints/internal/` (new directory needed)

21. **GET /questions/pending-offers**
    - **Purpose:** Get pending Deep Dive offers for expiration check
    - **Used by:** Cron job (cancel-expired-offers)
    - **Auth:** Internal API key (x_api_key query param)
    - **Status:** ⚠️ Missing .xs file

22. **GET /questions/expired-sla**
    - **Purpose:** Get questions past SLA deadline
    - **Used by:** Cron job (cancel-expired-slas)
    - **Auth:** Internal API key (x_api_key query param)
    - **Status:** ⚠️ Missing .xs file

23. **POST /question/{id}/expire-offer**
    - **Purpose:** Mark Deep Dive offer as expired
    - **Used by:** Cron job (cancel-expired-offers)
    - **Auth:** Internal API key (x_api_key query param)
    - **Status:** ⚠️ Missing .xs file

24. **POST /question/{id}/expire-sla**
    - **Purpose:** Mark question SLA as expired
    - **Used by:** Cron job (cancel-expired-slas)
    - **Auth:** Internal API key (x_api_key query param)
    - **Status:** ⚠️ Missing .xs file

25. **GET /internal/media**
    - **Purpose:** Get all media for cleanup job
    - **Used by:** Cron job (cleanup-orphaned-media)
    - **Auth:** Internal API key
    - **Status:** ⚠️ Missing .xs file

26. **DELETE /internal/media_asset**
    - **Purpose:** Delete orphaned media asset
    - **Used by:** Cron job (cleanup-orphaned-media)
    - **Auth:** Internal API key
    - **Status:** ✅ Has reference file: delete-media.xs

27. **DELETE /internal/magic-link-token**
    - **Purpose:** Delete old magic link tokens
    - **Used by:** Cron job (cleanup-orphaned-media)
    - **Auth:** Internal API key
    - **Status:** ⚠️ Missing .xs file

28. **GET /internal/digest/pending-questions**
    - **Purpose:** Get pending questions for email digest
    - **Used by:** Cron job (send-daily-digest)
    - **Auth:** Internal API key
    - **Status:** ⚠️ Missing .xs file

---

## 📊 Summary

**Total Missing Endpoints:** 28

**By Category:**
- Public Endpoints: 3
- Authentication: 3
- Marketing: 5
- User/Profile: 3
- Questions: 4
- Media: 2
- Internal/Cron: 8

**Priority for Documentation:**

**High Priority (actively used in production):**
1. GET /me/questions (with filters) - Core dashboard functionality
2. GET /public/profile - Public profile access
3. GET /review/{token} - Answer review page
4. POST /auth/magic-link/initiate - Authentication
5. POST /auth/magic-link/verify - Authentication
6. GET /marketing/campaigns - Marketing dashboard
7. POST /marketing/public/track-visit - UTM tracking

**Medium Priority (used but less critical):**
8. GET /me/questions/count - Navbar badge
9. GET /expert/pending-offers - Dashboard offers section
10. POST /media_asset - Media uploads
11. GET /me/profile - Profile settings
12. PUT /me/profile - Profile settings

**Low Priority (internal/cron jobs):**
13-28. All internal endpoints (work without documentation)

---

## 🎯 Recommended Action Plan

### Phase 1: Core Public Endpoints (Do First)
```
docs/api-database/endpoints/public/
├── profile.xs          (GET /public/profile)
├── review-get.xs       (GET /review/{token})
└── track-visit.xs      (POST /marketing/public/track-visit)
```

### Phase 2: Authentication
```
docs/api-database/endpoints/auth/
├── magic-link-initiate.xs   (POST /auth/magic-link/initiate)
├── magic-link-verify.xs     (POST /auth/magic-link/verify)
└── linkedin-create-user.xs  (POST /auth/linkedin/create_user)
```

### Phase 3: Dashboard Core
```
docs/api-database/endpoints/questions/
├── me-questions.xs          (GET /me/questions)
├── me-questions-count.xs    (GET /me/questions/count)
├── pending-offers.xs        (GET /expert/pending-offers)
└── question-hidden.xs       (POST /question/hidden)
```

### Phase 4: Marketing Module
```
docs/api-database/endpoints/marketing/
├── campaigns-get.xs         (GET /marketing/campaigns)
├── campaigns-post.xs        (POST /marketing/campaigns)
├── traffic-sources.xs       (GET /marketing/traffic-sources)
└── insights.xs              (GET /marketing/insights)
```

### Phase 5: Remaining Authenticated
```
docs/api-database/endpoints/user/
├── me-profile-get.xs        (GET /me/profile)
├── me-profile-put.xs        (PUT /me/profile)
└── me-answers.xs            (GET /me/answers)

docs/api-database/endpoints/media/
├── media-asset-post.xs      (POST /media_asset)
└── answer-get.xs            (GET /answer)

docs/api-database/endpoints/questions/
└── base-question.xs         (POST /question)
```

### Phase 6: Internal/Cron (Optional)
```
docs/api-database/endpoints/internal/
├── questions-pending-offers.xs    (GET /questions/pending-offers)
├── questions-expired-sla.xs       (GET /questions/expired-sla)
├── question-expire-offer.xs       (POST /question/{id}/expire-offer)
├── question-expire-sla.xs         (POST /question/{id}/expire-sla)
├── media-get.xs                   (GET /internal/media)
├── magic-link-token-delete.xs     (DELETE /internal/magic-link-token)
└── digest-pending-questions.xs    (GET /internal/digest/pending-questions)
```

---

## 📝 Notes

- All endpoint files should use `.xs` extension (XanoScript format)
- See `README-XANOSCRIPT.md` for file format guidelines
- Remove comments before pasting into Xano
- Test each endpoint in Xano Run & Debug before committing
- Add security tests for high-priority authenticated endpoints

---

**Created:** October 26, 2025
**Status:** Ready for implementation
**Next Step:** Copy endpoints from Xano to create .xs files
