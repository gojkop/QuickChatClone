# Endpoint Documentation Completion Guide

**Date:** October 26, 2025 (Updated October 27, 2025)
**Task:** Add remaining 9 endpoints to complete documentation
**Status:** Ready to implement
**Duplicate Check:** ✅ Complete (see DUPLICATE-CHECK-REPORT.md)

---

## 🔍 Duplicate Check Results

- **deleteacc.xs** - ✅ REMOVED (duplicate of me-account-delete.xs)
- **media.xs** - ✅ COVERS POST /media_asset (no need for media-asset-post.xs)
- **answer.xs** - POST /answer only (still need answer-get.xs for GET /answer)
- **base-question.xs** - Not found (still needed)

**Result:** 9 endpoints to add (not 11)

---

## 📋 Checklist: 9 Endpoints to Add

### ✅ High Priority (2 endpoints)

Copy these from Xano first:

#### 1. POST /question
- [ ] **Xano Location:** Find POST /question endpoint (base endpoint)
- [ ] **Copy XanoScript** from Xano
- [ ] **Save as:** `docs/api-database/endpoints/questions/base-question.xs`
- [ ] **Purpose:** Base question creation (called by Vercel)
- [ ] **Note:** Different from quick-consult.xs and deep-dive.xs

---

#### 2. GET /answer
- [ ] **Xano Location:** Find GET /answer endpoint
- [ ] **Copy XanoScript** from Xano
- [ ] **Save as:** `docs/api-database/endpoints/questions/answer-get.xs`
- [ ] **Purpose:** Get answer details by ID
- [ ] **Check:** Might already exist as questions/answer.xs - verify first!

---

### ⚙️ Internal/Cron Endpoints (8 endpoints)

Copy these for complete documentation:

#### 3. GET /questions/pending-offers
- [ ] **Xano Location:** Find GET /questions/pending-offers
- [ ] **Copy XanoScript** from Xano
- [ ] **Save as:** `docs/api-database/endpoints/internal/questions-pending-offers.xs`
- [ ] **Purpose:** Get pending Deep Dive offers for expiration check
- [ ] **Auth:** Internal API key (x_api_key parameter)
- [ ] **Used by:** `/api/cron/cancel-expired-offers.js`

---

#### 4. GET /questions/expired-sla
- [ ] **Xano Location:** Find GET /questions/expired-sla
- [ ] **Copy XanoScript** from Xano
- [ ] **Save as:** `docs/api-database/endpoints/internal/questions-expired-sla.xs`
- [ ] **Purpose:** Get questions past SLA deadline
- [ ] **Auth:** Internal API key
- [ ] **Used by:** `/api/cron/cancel-expired-slas.js`

---

#### 5. POST /question/{id}/expire-offer
- [ ] **Xano Location:** Find POST /question/{id}/expire-offer
- [ ] **Copy XanoScript** from Xano
- [ ] **Save as:** `docs/api-database/endpoints/internal/question-expire-offer.xs`
- [ ] **Purpose:** Mark Deep Dive offer as expired
- [ ] **Auth:** Internal API key
- [ ] **Used by:** `/api/cron/cancel-expired-offers.js`

---

#### 6. POST /question/{id}/expire-sla
- [ ] **Xano Location:** Find POST /question/{id}/expire-sla
- [ ] **Copy XanoScript** from Xano
- [ ] **Save as:** `docs/api-database/endpoints/internal/question-expire-sla.xs`
- [ ] **Purpose:** Mark question SLA as expired
- [ ] **Auth:** Internal API key
- [ ] **Used by:** `/api/cron/cancel-expired-slas.js`

---

#### 7. GET /internal/media
- [ ] **Xano Location:** Find GET /internal/media
- [ ] **Copy XanoScript** from Xano
- [ ] **Save as:** `docs/api-database/endpoints/internal/media-get.xs`
- [ ] **Purpose:** Get all media for cleanup job
- [ ] **Auth:** Internal API key
- [ ] **Used by:** `/api/cron/cleanup-orphaned-media.js`
- [ ] **Returns:** All media assets, avatars, attachments, magic link tokens

---

#### 8. DELETE /internal/media_asset
- [ ] **Xano Location:** Find DELETE /internal/media_asset
- [ ] **Note:** Similar to `testing/delete-media.xs` - can use as reference
- [ ] **Copy XanoScript** from Xano
- [ ] **Save as:** `docs/api-database/endpoints/internal/media-asset-delete.xs`
- [ ] **Purpose:** Delete orphaned media asset
- [ ] **Auth:** Internal API key
- [ ] **Used by:** `/api/cron/cleanup-orphaned-media.js`

---

#### 9. DELETE /internal/magic-link-token
- [ ] **Xano Location:** Find DELETE /internal/magic-link-token
- [ ] **Copy XanoScript** from Xano
- [ ] **Save as:** `docs/api-database/endpoints/internal/magic-link-token-delete.xs`
- [ ] **Purpose:** Delete old magic link tokens
- [ ] **Auth:** Internal API key
- [ ] **Used by:** `/api/cron/cleanup-orphaned-media.js`

---

#### 10. GET /internal/digest/pending-questions
- [ ] **Xano Location:** Find GET /internal/digest/pending-questions
- [ ] **Copy XanoScript** from Xano
- [ ] **Save as:** `docs/api-database/endpoints/internal/digest-pending-questions.xs`
- [ ] **Purpose:** Get pending questions for email digest
- [ ] **Auth:** Internal API key
- [ ] **Used by:** `/api/cron/send-daily-digest.js`

---

## ✅ Duplicate Check Complete

**See:** DUPLICATE-CHECK-REPORT.md for full details

**Results:**
- ✅ deleteacc.xs - DELETED (was duplicate of me-account-delete.xs)
- ✅ media.xs - Already covers POST /media_asset (no media-asset-post.xs needed)
- ❌ answer.xs - Only covers POST /answer (still need answer-get.xs)
- ❌ base-question.xs - Not found (still need to create)

---

## 📝 How to Copy from Xano

For each endpoint:

1. **Open Xano** → Navigate to the API group
   - **Auth API:** `api:XEsV5Zbo` (for authenticated endpoints)
   - **Public API:** `api:BQW1GS7L` (for internal endpoints)

2. **Find the endpoint** in the list

3. **Click `<> Edit API`** to open Script Editor mode

4. **Select All** (Cmd+A / Ctrl+A) and **Copy**

5. **Create .xs file** in the correct location (see checklist above)

6. **Paste** the XanoScript code

7. **Save** the file

8. **Important:** Do NOT add comments - XanoScript files should be clean code only

---

## 📂 Directory Structure After Completion

```
docs/api-database/endpoints/
├── auth/
│   ├── linkedin-create-user.xs
│   ├── magic-link-initiate.xs
│   └── magic-link-verify.xs
├── marketing/
│   ├── campaigns-get.xs
│   ├── campaigns-post.xs
│   ├── insights.xs
│   └── traffic-sources.xs
├── media/
│   ├── media.xs                     (covers POST /media_asset)
│   └── upload.xs
├── questions/
│   ├── answer.xs
│   ├── answer-get.xs                ← NEW (if needed)
│   ├── base-question.xs             ← NEW
│   ├── deep-dive.xs
│   ├── id.xs
│   ├── me-questions.xs
│   ├── me-questions-count.xs
│   ├── pending-offers.xs
│   ├── question-hidden.xs
│   └── quick-consult.xs
├── internal/                         ← NEW DIRECTORY
│   ├── digest-pending-questions.xs  ← NEW
│   ├── magic-link-token-delete.xs   ← NEW
│   ├── media-asset-delete.xs        ← NEW
│   ├── media-get.xs                 ← NEW
│   ├── question-expire-offer.xs     ← NEW
│   ├── question-expire-sla.xs       ← NEW
│   ├── questions-expired-sla.xs     ← NEW
│   └── questions-pending-offers.xs  ← NEW
├── public/
│   ├── hidden.xs
│   ├── pricing-tiers.xs
│   ├── profile.xs
│   ├── review-get.xs
│   └── track-visit.xs
├── user/
│   ├── account.xs
│   ├── availability.xs
│   ├── me-account-delete.xs        (deleteacc.xs removed - duplicate)
│   ├── me-answers.xs
│   ├── me-profile-get.xs
│   ├── me-profile-put.xs
│   └── profile.xs
└── [other existing directories]
```

---

## ✅ After Completion

Once all 9 endpoints are added:

1. **Verify count:**
   ```bash
   find docs/api-database/endpoints -name "*.xs" | wc -l
   ```
   Should show **48 total files** (39 current + 9 new)

2. **Commit changes:**
   ```bash
   git add docs/api-database/endpoints/
   git add docs/api-database/DUPLICATE-CHECK-REPORT.md
   git commit -m "Complete endpoint documentation - Add 9 endpoints, remove duplicates"
   ```

3. **Update endpoints README:**
   - Add internal/ section
   - Update total count

4. **Update MISSING-ENDPOINTS-LIST.md:**
   - Mark as complete

---

## 🎯 Quick Start

**Step 1:** ✅ Duplicate check complete (see DUPLICATE-CHECK-REPORT.md)

**Step 2:** Start with high-priority (2 files):
- base-question.xs
- answer-get.xs

**Step 3:** Add internal endpoints (8 files)

**Step 4:** Commit and update documentation

---

**Ready?** Start copying from Xano! 🚀
