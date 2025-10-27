# Duplicate Endpoint Check Report

**Date:** October 27, 2025
**Purpose:** Verify which endpoints are truly missing vs already documented

---

## Summary

**Original Missing Count:** 11 endpoints
**Actual Missing Count:** 9 endpoints
**Duplicates Found:** 2 files

---

## Detailed Findings

### 1. GET /answer (answer-get.xs)

**Status:** ❌ NOT COVERED - Still needs to be added

**Existing File:** `questions/answer.xs`
- Endpoint: `POST /answer`
- Purpose: Create new answer (expert submits answer)

**Missing File:** `questions/answer-get.xs`
- Endpoint: `GET /answer`
- Purpose: Get answer details by ID
- **Action:** CREATE THIS FILE

---

### 2. POST /media_asset (media-asset-post.xs)

**Status:** ✅ ALREADY COVERED - Do NOT create

**Existing File:** `media/media.xs`
- Endpoint: `POST /media_asset`
- Purpose: Create media asset record after Cloudflare upload
- **This is the SAME endpoint**

**Duplicate File:** `media/media-asset-post.xs`
- Would be a duplicate of media.xs
- **Action:** DO NOT CREATE (already exists as media.xs)

---

### 3. POST /question (base-question.xs)

**Status:** ❌ NOT FOUND - Still needs to be added

**Existing Files:**
- `questions/quick-consult.xs` - POST /question/quick-consult
- `questions/deep-dive.xs` - POST /question/deep-dive

**Missing File:** `questions/base-question.xs`
- Endpoint: `POST /question` (base endpoint)
- Purpose: Create question after payment validation (called by Vercel)
- **Action:** CREATE THIS FILE

---

### 4. deleteacc.xs vs me-account-delete.xs

**Status:** ⚠️ EXACT DUPLICATES - Remove one

**Both files define:** `query "me/delete-account" verb=DELETE`

**File 1:** `user/deleteacc.xs`
- Query path: `"me/delete-account"`
- Verb: DELETE
- Auth: user

**File 2:** `user/me-account-delete.xs`
- Query path: `"me/delete-account"`
- Verb: DELETE
- Auth: user

**Comparison:** Files are IDENTICAL (both 98 lines, same content)

**Recommendation:** DELETE `user/deleteacc.xs`, KEEP `user/me-account-delete.xs`
- Reason: Consistency with other me-* files (me-profile-get.xs, me-profile-put.xs, me-answers.xs)
- **Action:** DELETE deleteacc.xs

---

## Updated Endpoint Count

### High Priority (2 endpoints - was 3)

1. ✅ ~~POST /media_asset~~ - Already covered by media.xs
2. ❌ POST /question - Still missing (base-question.xs)
3. ❌ GET /answer - Still missing (answer-get.xs)

### Internal/Cron (8 endpoints - unchanged)

4. ❌ GET /questions/pending-offers - Still missing
5. ❌ GET /questions/expired-sla - Still missing
6. ❌ POST /question/{id}/expire-offer - Still missing
7. ❌ POST /question/{id}/expire-sla - Still missing
8. ❌ GET /internal/media - Still missing
9. ❌ DELETE /internal/media_asset - Still missing
10. ❌ DELETE /internal/magic-link-token - Still missing
11. ❌ GET /internal/digest/pending-questions - Still missing

### Duplicate File to Remove

- ⚠️ user/deleteacc.xs - Duplicate of me-account-delete.xs

---

## Action Items

### 1. Delete Duplicate File

```bash
rm docs/api-database/endpoints/user/deleteacc.xs
```

### 2. Add 9 Missing Endpoints

**High Priority (2 files):**
- questions/base-question.xs
- questions/answer-get.xs

**Internal (8 files):**
- internal/questions-pending-offers.xs
- internal/questions-expired-sla.xs
- internal/question-expire-offer.xs
- internal/question-expire-sla.xs
- internal/media-get.xs
- internal/media-asset-delete.xs
- internal/magic-link-token-delete.xs
- internal/digest-pending-questions.xs

---

## Total Work Required

- **Create:** 9 new endpoint files
- **Delete:** 1 duplicate file
- **Total changes:** 10 operations

---

**Status:** Ready for implementation
**Next Step:** Delete deleteacc.xs, then add 9 endpoints from Xano
