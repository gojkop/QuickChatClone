# Media Asset Architecture Migration - October 2025

**Status:** ✅ Complete
**Date:** October 24, 2025
**Type:** Database Schema Migration + Architecture Cleanup

---

## Executive Summary

This migration removed redundant bidirectional relationship columns (`owner_id`, `owner_type`) from the `media_asset` table, transitioning to a clean FK-only architecture. This simplifies the data model, eliminates data integrity issues, and improves maintainability.

### What Changed

**Before (Bidirectional):**
```
question ←→ media_asset
  ↓            ↓
media_asset_id  owner_id, owner_type
```

**After (FK-Only):**
```
question → media_asset
  ↓
media_asset_id
```

### Impact

- **Simplified Architecture:** Single source of truth for relationships
- **Eliminated Data Integrity Issues:** No more orphaned owner_id references
- **Improved Performance:** Simpler queries, fewer DB columns
- **Better Maintainability:** Clearer data flow, easier to reason about

---

## Table of Contents

1. [Background & Motivation](#background--motivation)
2. [Migration Overview](#migration-overview)
3. [Files Updated](#files-updated)
4. [Schema Changes](#schema-changes)
5. [Testing & Verification](#testing--verification)
6. [Additional Improvements](#additional-improvements)
7. [Rollback Plan](#rollback-plan)

---

## Background & Motivation

### The Problem

The old system used **bidirectional relationships** where both `question` and `media_asset` tables stored references to each other:

```sql
-- question table
media_asset_id INT  -- FK to media_asset.id

-- media_asset table
owner_type TEXT     -- 'question' or 'answer'
owner_id INT        -- FK to question.id or answer.id
```

**Issues:**
1. **Data Integrity:** `owner_id` was often 0 or null, breaking the bidirectional link
2. **Redundancy:** Two places store the same relationship
3. **Complexity:** Queries had to check both directions
4. **Maintenance:** Updates required syncing both tables

### The Solution

Use **FK-only architecture** where only the parent table stores the relationship:

```sql
-- question table
media_asset_id INT  -- FK to media_asset.id

-- media_asset table
-- (no owner_id/owner_type columns)
```

**Benefits:**
- ✅ Single source of truth
- ✅ No data synchronization needed
- ✅ Simpler queries
- ✅ Better data integrity

---

## Migration Overview

### Phase 1: Frontend Updates

**Updated 4 Files:**
1. `src/components/question-flow-v2/steps/StepPayment.jsx`
2. `src/hooks/useAnswerUpload.js`
3. `src/pages/AskQuestionPage.jsx` (legacy)
4. `src/components/question-flow-v2/compose/DeepDiveComposer.jsx`

**Changes:** Removed `owner_type` and `owner_id` from all `apiClient.post('/media_asset')` calls.

**Before:**
```javascript
await apiClient.post('/media_asset', {
  owner_type: 'question',
  owner_id: questionId,
  provider: 'cloudflare_stream',
  asset_id: uid,
  // ...
});
```

**After:**
```javascript
await apiClient.post('/media_asset', {
  provider: 'cloudflare_stream',
  asset_id: uid,
  // ...
});
```

### Phase 2: Xano Endpoint Updates

**Updated 5 Endpoints:**
1. `POST /media_asset` - Removed owner_type/owner_id inputs
2. `GET /review/{token}` - Use FK lookups instead of owner_id queries
3. `GET /me/questions` - Use FK lookups, transform segment data
4. `POST /answer` - Removed owner_id update after answer creation
5. `GET /answer` - Use FK lookup instead of owner_id query

**Key Pattern:**

**Before:**
```javascript
db.query media_asset {
  where = $db.media_asset.owner_id == $question.id
    && $db.media_asset.owner_type == "question"
}
```

**After:**
```javascript
conditional {
  if ($question.media_asset_id != null && $question.media_asset_id > 0) {
    db.get media_asset {
      field_name = "id"
      field_value = $question.media_asset_id
    }
  }
}
```

### Phase 3: Schema Changes

**Dropped Columns:**
- `media_asset.owner_type` (text)
- `media_asset.owner_id` (int)

**Kept Columns:**
- `media_asset.id` (primary key)
- `question.media_asset_id` (FK to media_asset.id)
- `answer.media_asset_id` (FK to media_asset.id)

### Phase 4: Backend API Updates

**Updated 4 Files:**
1. `api/lib/xano/media.js` - Removed owner params from createMediaAsset()
2. `api/lib/xano/questionService.js` - Updated createMediaAsset() call
3. `api/users/delete-account.js` - Use FK approach for answer media deletion
4. `api/cron/cleanup-orphaned-media.js` - Refactored orphan detection logic

**Updated 1 Internal Endpoint:**
5. `GET /internal/media` - Added questions and answers arrays for FK reference checking

---

## Files Updated

### Frontend (4 files)

#### 1. `src/components/question-flow-v2/steps/StepPayment.jsx`

**Location:** Lines 55-62

**Before:**
```javascript
const response = await apiClient.post('/media_asset', {
  owner_type: 'question',
  owner_id: 0,
  provider: 'cloudflare_stream',
  // ...
});
```

**After:**
```javascript
const response = await apiClient.post('/media_asset', {
  provider: 'cloudflare_stream',
  // ...
});
```

#### 2. `src/hooks/useAnswerUpload.js`

**Location:** Lines 220-227, 281-288

**Changes:** Removed owner_type/owner_id from both createMediaAsset calls (single segment and multi-segment)

#### 3. `src/pages/AskQuestionPage.jsx`

**Location:** Lines 164-171

**Changes:** Legacy file updated for consistency (not actively used)

#### 4. `src/components/question-flow-v2/compose/DeepDiveComposer.jsx`

**Location:** Referenced in session but not directly modified (data flow update)

### Xano Endpoints (5 endpoints)

#### 1. `POST /media_asset`

**Before:**
```xano
input {
  text owner_type filters=trim
  number owner_id
  text provider filters=trim
  // ...
}

stack {
  db.add media_asset {
    owner_type = $input.owner_type
    owner_id = $input.owner_id
    provider = $input.provider
    // ...
  }
}
```

**After:**
```xano
input {
  text provider filters=trim
  text asset_id filters=trim
  number duration_sec
  text status filters=trim
  text url
  text metadata?
  number segment_index?
}

stack {
  db.add media_asset {
    provider = $input.provider
    asset_id = $input.asset_id
    duration_sec = $input.duration_sec
    status = $input.status
    url = $input.url
    metadata = $input.metadata
    segment_index = $input.segment_index
  }
}
```

#### 2. `GET /review/{token}`

**Key Changes:**
- Lines 12-23: Get media_asset by FK (`question.media_asset_id`)
- Lines 25-35: Use lambda to wrap single record in array for JSON compatibility
- Lines 45-56: Get answer media_asset by FK (`answer.media_asset_id`)
- Lines 58-68: Use lambda for answer media array

**Pattern:**
```xano
conditional {
  if ($question.media_asset_id != null && $question.media_asset_id > 0) {
    db.get media_asset {
      field_name = "id"
      field_value = $question.media_asset_id
    } as $media_asset_single
  }
}

api.lambda {
  code = """
    if ($var.media_asset_single) {
      return [$var.media_asset_single];
    }
    return [];
  """
  timeout = 10
} as $media_asset
```

#### 3. `GET /me/questions`

**Key Changes:**
- Lines 32-65: Get media_asset by FK and extract segments from metadata
- Lines 41-63: Lambda function parses metadata JSON and extracts segments array
- Lines 66-72: Transform segments to frontend-expected format

**Critical Update - Segment Data Transformation:**
```xano
api.lambda {
  code = """
    if ($var.media_asset_record && $var.media_asset_record.metadata) {
      var metadata = $var.media_asset_record.metadata;
      if (typeof metadata === 'string') {
        try {
          metadata = JSON.parse(metadata);
        } catch (e) {
          return [];
        }
      }
      if (metadata.type === 'multi-segment' && metadata.segments) {
        // ✅ Transform to match frontend expected format
        return metadata.segments.map(function(seg) {
          return {
            id: seg.uid,
            url: seg.playback_url,
            duration_sec: seg.duration,
            segment_index: seg.segment_index,
            metadata: {
              mode: seg.mode
            }
          };
        });
      }
    }
    return [];
  """
  timeout = 10
} as $recording_segments
```

**Why This Matters:**
- Frontend components expect: `{id, url, duration_sec, metadata: {mode}}`
- Raw metadata stores: `{uid, playback_url, duration, mode}`
- Without transformation, media won't display in expert dashboard

#### 4. `POST /answer`

**Before:**
```xano
// After answer creation
conditional {
  if ($mediaAssetId != null) {
    db.edit media_asset {
      id = $mediaAssetId
    } {
      owner_id = $answer.id
      owner_type = "answer"
    }
  }
}
```

**After:**
```xano
// Remove owner_id update - no longer needed
// FK relationship established via answer.media_asset_id
```

#### 5. `GET /answer`

**Before:**
```xano
db.get media_asset {
  field_name = "owner_id"
  field_value = $answer.id
} as $media_asset
```

**After:**
```xano
conditional {
  if ($answer != null && $answer.media_asset_id != null && $answer.media_asset_id > 0) {
    db.get media_asset {
      field_name = "id"
      field_value = $answer.media_asset_id
    } as $media_asset
  }
}
```

### Backend API (4 files + 1 endpoint)

#### 1. `api/lib/xano/media.js`

**Changes:**
- Removed `ownerType` and `ownerId` parameters from `createMediaAsset()` function
- Deprecated `getMediaAssetsByOwner()` function with error message

**Before:**
```javascript
export async function createMediaAsset({
  ownerType,
  ownerId,
  provider,
  assetId,
  // ...
}) {
  const payload = {
    owner_type: ownerType,
    owner_id: ownerId,
    provider,
    // ...
  };
}
```

**After:**
```javascript
export async function createMediaAsset({
  provider,
  assetId,
  duration = 0,
  status = 'processing',
  url,
  segmentIndex = 0,
  metadata = null,
}) {
  const payload = {
    provider,
    asset_id: assetId,
    duration_sec: duration,
    status,
    url,
    segment_index: segmentIndex,
    metadata: metadata ? JSON.stringify(metadata) : null,
  };
}

// Deprecated function
export async function getMediaAssetsByOwner(ownerType, ownerId) {
  console.warn('⚠️  getMediaAssetsByOwner is deprecated - use FK-based lookups instead');
  throw new Error('getMediaAssetsByOwner is deprecated - owner_id/owner_type columns have been removed');
}
```

#### 2. `api/lib/xano/questionService.js`

**Location:** Lines 55-57

**Before:**
```javascript
mediaAsset = await createMediaAsset({
  ownerType: 'question',
  ownerId: question.id,
  provider: 'cloudflare_stream',
  // ...
});
```

**After:**
```javascript
mediaAsset = await createMediaAsset({
  provider: 'cloudflare_stream',
  assetId: streamData.uid,
  duration: streamData.duration,
  status: 'processing',
  url: streamData.playbackUrl,
});
```

#### 3. `api/users/delete-account.js`

**Location:** Lines 82-124

**Before:**
```javascript
// Query media_asset by owner_type (BROKEN)
const answerMediaResponse = await fetch(
  `${process.env.XANO_BASE_URL}/media_asset?owner_type=answer`,
  // ...
);
```

**After:**
```javascript
// Get answers first, then delete by media_asset_id (FK approach)
const answersResponse = await fetch(
  `${process.env.XANO_BASE_URL}/me/answers`,
  // ...
);

const answers = await answersResponse.json();

for (const answer of answers) {
  if (answer.media_asset_id) {
    await fetch(
      `${process.env.XANO_BASE_URL}/media_asset/${answer.media_asset_id}`,
      { method: 'DELETE', ... }
    );
  }
}
```

#### 4. `api/cron/cleanup-orphaned-media.js`

**Location:** Lines 99-157

**Before:**
```javascript
// Check owner_id and owner_type fields
if (!media.owner_type || !media.owner_id) {
  isOrphaned = true;
} else if (media.owner_type === 'question') {
  // Verify question exists
  const questionResponse = await fetch(...);
  if (!questionResponse.ok) {
    isOrphaned = true;
  }
}
```

**After:**
```javascript
// Build set of referenced media_asset_ids
const referencedMediaIds = new Set();

for (const question of allQuestions) {
  if (question.media_asset_id) {
    referencedMediaIds.add(question.media_asset_id);
  }
}

for (const answer of allAnswers) {
  if (answer.media_asset_id) {
    referencedMediaIds.add(answer.media_asset_id);
  }
}

// Check if media is orphaned
const isOrphaned = !referencedMediaIds.has(media.id);
```

#### 5. `GET /internal/media` (Xano Endpoint)

**Purpose:** Internal endpoint for cleanup cron job

**Changes:** Added `questions` and `answers` arrays to response

**Before:**
```xano
response = {
  "media": $all_media,
  "avatars": $all_avatars,
  "question_attachments": $all_question_attachments,
  "answer_attachments": $all_answer_attachments,
  "magic_link_tokens": $all_magic_link_tokens
}
```

**After:**
```xano
stack {
  // ... existing queries ...

  // ✅ NEW: Fetch all questions
  db.query question {
    return = {type: "list"}
  } as $all_questions

  // ✅ NEW: Fetch all answers
  db.query answer {
    return = {type: "list"}
  } as $all_answers
}

response = {
  "media": $all_media,
  "avatars": $all_avatars,
  "question_attachments": $all_question_attachments,
  "answer_attachments": $all_answer_attachments,
  "magic_link_tokens": $all_magic_link_tokens,
  "questions": $all_questions,
  "answers": $all_answers
}
```

---

## Schema Changes

### Before Migration

```sql
CREATE TABLE media_asset (
  id INT PRIMARY KEY AUTO_INCREMENT,
  owner_type VARCHAR(50),           -- ❌ REMOVED
  owner_id INT,                     -- ❌ REMOVED
  provider VARCHAR(100),
  asset_id VARCHAR(255),
  duration_sec INT,
  status VARCHAR(50),
  url TEXT,
  metadata JSON,
  segment_index INT,
  created_at TIMESTAMP
);

CREATE TABLE question (
  id INT PRIMARY KEY AUTO_INCREMENT,
  media_asset_id INT,               -- ✅ KEPT (FK to media_asset.id)
  // ... other fields
);

CREATE TABLE answer (
  id INT PRIMARY KEY AUTO_INCREMENT,
  media_asset_id INT,               -- ✅ KEPT (FK to media_asset.id)
  // ... other fields
);
```

### After Migration

```sql
CREATE TABLE media_asset (
  id INT PRIMARY KEY AUTO_INCREMENT,
  provider VARCHAR(100),
  asset_id VARCHAR(255),
  duration_sec INT,
  status VARCHAR(50),
  url TEXT,
  metadata JSON,                    -- ✅ Stores multi-segment data
  segment_index INT,
  created_at TIMESTAMP
);

CREATE TABLE question (
  id INT PRIMARY KEY AUTO_INCREMENT,
  media_asset_id INT,               -- FK to media_asset.id
  // ... other fields
);

CREATE TABLE answer (
  id INT PRIMARY KEY AUTO_INCREMENT,
  media_asset_id INT,               -- FK to media_asset.id
  // ... other fields
);
```

### Multi-Segment Media Structure

**Metadata Format (in media_asset table):**
```json
{
  "type": "multi-segment",
  "mime_type": "video/webm",
  "segment_count": 3,
  "segments": [
    {
      "uid": "abc123",
      "playback_url": "https://...",
      "duration": 15,
      "mode": "video",
      "segment_index": 0
    },
    {
      "uid": "def456",
      "playback_url": "https://...",
      "duration": 20,
      "mode": "audio",
      "segment_index": 1
    },
    {
      "uid": "ghi789",
      "playback_url": "https://...",
      "duration": 10,
      "mode": "screen",
      "segment_index": 2
    }
  ]
}
```

**Storage Pattern:**
- Single parent `media_asset` record per question/answer
- Parent record stores all segments in `metadata` JSON field
- No child records needed (simplified from old multi-record approach)

---

## Testing & Verification

### Test Checklist

#### 1. Question Submission (Quick Consult & Deep Dive)
- [x] Record video segments
- [x] Upload attachments
- [x] Submit question
- [x] Verify media_asset created without owner_id/owner_type
- [x] Verify question.media_asset_id links to media_asset.id

#### 2. Answer Submission
- [x] Record answer with video/audio
- [x] Upload attachments
- [x] Submit answer
- [x] Verify media_asset created
- [x] Verify answer.media_asset_id links to media_asset.id
- [x] Verify payment capture works

#### 3. Expert Dashboard
- [x] View questions with media
- [x] Verify media displays correctly
- [x] Verify segment transformation works
- [x] Test Download All (ZIP) functionality

#### 4. Answer Review Page (Asker View)
- [x] View question with media
- [x] View answer with media
- [x] Verify both display correctly
- [x] Test Download All (ZIP) for both

#### 5. Cron Job
- [x] Cleanup orphaned media runs successfully
- [x] Correctly identifies orphaned records
- [x] Uses FK-based approach

### Verification Queries

**Check if any media_assets have owner_id/owner_type:**
```sql
SELECT * FROM media_asset
WHERE owner_id IS NOT NULL
   OR owner_type IS NOT NULL;
-- Should return 0 rows after migration
```

**Check FK relationships:**
```sql
-- Questions with valid media references
SELECT q.id, q.media_asset_id, m.id, m.asset_id
FROM question q
LEFT JOIN media_asset m ON q.media_asset_id = m.id
WHERE q.media_asset_id IS NOT NULL;

-- Answers with valid media references
SELECT a.id, a.media_asset_id, m.id, m.asset_id
FROM answer a
LEFT JOIN media_asset m ON a.media_asset_id = m.id
WHERE a.media_asset_id IS NOT NULL;
```

**Check for orphaned media:**
```sql
-- Media not referenced by any question or answer
SELECT m.id, m.asset_id, m.provider
FROM media_asset m
WHERE m.id NOT IN (
  SELECT media_asset_id FROM question WHERE media_asset_id IS NOT NULL
  UNION
  SELECT media_asset_id FROM answer WHERE media_asset_id IS NOT NULL
);
```

---

## Additional Improvements

### 1. Expert Dashboard Media Display

**Issue:** Media segments weren't displaying in expert's QuestionDetailModal

**Cause:** Xano was returning raw segment data `{uid, playback_url, mode}` but frontend expected `{id, url, metadata: {mode}}`

**Solution:** Added transformation lambda in `GET /me/questions`:

```javascript
return metadata.segments.map(function(seg) {
  return {
    id: seg.uid,
    url: seg.playback_url,
    duration_sec: seg.duration,
    segment_index: seg.segment_index,
    metadata: {
      mode: seg.mode
    }
  };
});
```

**Files Updated:**
- `GET /me/questions` (Xano) - Added transformation lambda
- `QuestionDetailModal.jsx` - Added debug logging

### 2. Download All (ZIP) Functionality

**Added to Expert Dashboard:**
- New `downloadQuestionAsZip()` function in QuestionDetailModal
- Downloads videos, audio, and attachments
- Proxies through backend to avoid CORS
- Shows notification if old videos can't be downloaded

**Video Download Handling:**
- New videos (uploaded with `downloadedVideoAllowed: true`) can be downloaded
- Old videos (uploaded without download setting) are skipped with notification
- Audio files and attachments always downloadable

**Implementation:**
- Uses `JSZip` library for client-side ZIP creation
- Cloudflare Stream videos: `https://customer-{account}.cloudflarestream.com/{videoId}/downloads/default.mp4`
- Proxied through `/api/media/download-video?url=...`
- Audio and attachments downloaded directly from R2

**Files Updated:**
- `QuestionDetailModal.jsx` - Added download function and UI
- `download-video.js` - Enhanced error handling for unavailable downloads

### 3. Answer Review Page Improvements

**Combined Question Attachments:**
- Merged media and file attachments under single "Question Attachments" heading
- Shows videos/audio players followed by file attachment links
- Cleaner, more organized UI

**Files Updated:**
- `AnswerReviewPage.jsx` - Lines 922-996 (combined attachments section)

---

## Rollback Plan

If issues arise after deployment, follow this rollback procedure:

### Step 1: Re-add Database Columns
```sql
ALTER TABLE media_asset
ADD COLUMN owner_type VARCHAR(50),
ADD COLUMN owner_id INT;
```

### Step 2: Populate owner_id from FKs
```sql
-- For questions
UPDATE media_asset m
JOIN question q ON q.media_asset_id = m.id
SET m.owner_type = 'question',
    m.owner_id = q.id;

-- For answers
UPDATE media_asset m
JOIN answer a ON a.media_asset_id = m.id
SET m.owner_type = 'answer',
    m.owner_id = a.id;
```

### Step 3: Revert Code Changes

**Frontend:**
1. Revert commits for StepPayment.jsx, useAnswerUpload.js, AskQuestionPage.jsx
2. Re-add owner_type/owner_id to all `apiClient.post('/media_asset')` calls

**Xano:**
1. Revert POST /media_asset to accept owner_type/owner_id inputs
2. Revert GET /review/{token}, GET /me/questions, POST /answer, GET /answer
3. Use owner_id queries instead of FK lookups

**Backend API:**
1. Revert media.js to accept owner params
2. Revert questionService.js, delete-account.js, cleanup-orphaned-media.js

### Step 4: Deploy Reverted Code

```bash
git revert <commit-hash>
git push origin main
```

### Step 5: Verify Rollback

- Test question submission with media
- Test answer submission with media
- Verify expert dashboard displays media
- Check cleanup cron job works

---

## Lessons Learned

### What Went Well

1. **Systematic Approach:** Updated frontend → Xano → backend API in sequence
2. **Comprehensive Testing:** Tested each component before moving to next
3. **Debug Logging:** Added extensive logging helped catch issues early
4. **Documentation:** Real-time documentation made rollback plan easy

### Challenges

1. **Data Transformation:** Frontend expected different format than Xano returned
   - Solution: Added transformation lambda in GET /me/questions

2. **Video Downloads:** Old videos don't support downloads
   - Solution: Graceful handling with user notification

3. **Cleanup Cron Logic:** Had to refactor from owner_id to FK-based
   - Solution: Build Set of referenced IDs for fast lookup

### Best Practices

1. **Always Transform Data at Source:** Better to transform in Xano lambda than fix in every frontend component
2. **Use Debug Logging Liberally:** Console logs helped catch the media display bug immediately
3. **Handle Old Data Gracefully:** Notify users instead of failing silently
4. **Test FK Relationships:** Verify FK constraints before dropping columns

---

## Future Considerations

### Potential Enhancements

1. **Cascade Deletes:** Add DB-level cascade on question/answer deletion
2. **Media Versioning:** Store version metadata for format migrations
3. **Streaming Optimization:** Pre-generate download URLs at upload time
4. **Batch Operations:** Optimize cleanup cron with bulk queries

### Monitoring

**Metrics to Track:**
- Media orphan rate (should be near 0%)
- Download success rate
- Media display errors in frontend
- Cleanup cron execution time

**Alerts:**
- High orphan count (> 1% of total media)
- Download failures (> 5% rate)
- Cron job failures

---

## Related Documentation

- [`docs/api-database/upload-system-master.md`](./upload-system-master.md) - Media upload system
- [`docs/features/ZIP-DOWNLOAD-FEATURE.md`](../features/ZIP-DOWNLOAD-FEATURE.md) - ZIP download implementation
- [`docs/api-database/xano-endpoints.md`](./xano-endpoints.md) - Xano API reference
- [`docs/CLAUDE.md`](../CLAUDE.md) - Main project documentation

---

**Document Maintained By:** Development Team
**Last Updated:** October 24, 2025
**Status:** ✅ Migration Complete & Verified
