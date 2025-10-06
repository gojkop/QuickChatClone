# Question Submission Implementation Guide

## Overview
This document details the implementation of the question submission system with Cloudflare Stream (video/audio) and R2 (file attachments) integration, including **progressive upload** for improved UX.

**Date**: October 2025  
**System**: QuickChat Question Submission Flow  
**Version**: 2.0 (Progressive Upload)

---

## ⚡ Quick Start - Progressive Upload (5 Minutes)

### What's New?
- ✅ **Segments upload as recorded** (no waiting!)
- ✅ **Files upload as selected** (background upload!)
- ✅ **Real-time status indicators** (✅ ⏳ ❌)
- ✅ **85-95% faster submission** (<1 second vs 10-30 seconds)

### Step 1: Create Backend Files (2 min)

```bash
# Create directories
mkdir -p api/media

# Create files
touch api/media/upload-recording-segment.js
touch api/media/upload-attachment.js
touch api/questions/create.js
```

Copy code from implementation artifacts.

### Step 2: Create Frontend Hooks (1 min)

```bash
# Create hooks directory
mkdir -p src/hooks

# Create hook files
touch src/hooks/useRecordingSegmentUpload.js
touch src/hooks/useAttachmentUpload.js
```

Copy hook code from implementation artifacts.

### Step 3: Update QuestionComposer (1 min)

```bash
# Backup current file
cp src/components/question/QuestionComposer.jsx src/components/question/QuestionComposer.jsx.backup
```

Replace with updated version from artifacts.

### Step 4: Update AskQuestionPage (1 min)

In `handleProceedToPayment`, change from:

```javascript
// ❌ OLD: Converting to base64 at submit time
const recordingBlob = await blobToBase64(questionData.mediaBlob);
const attachments = [];
for (const file of questionData.files) {
  const attachment = await fileToBase64(file);
  attachments.push(attachment);
}

const payload = {
  recordingBlob: recordingBlob,
  recordingMode: questionData.recordingMode,
  attachments: attachments,
  // ...
};
```

To:

```javascript
// ✅ NEW: Just send references (already uploaded!)
const payload = {
  expertHandle: expert.handle,
  title: questionData.title,
  text: questionData.text,
  payerEmail: askerInfo.email,
  payerFirstName: askerInfo.firstName || null,
  payerLastName: askerInfo.lastName || null,
  
  // These are already uploaded!
  recordingSegments: questionData.recordingSegments || [],
  attachments: questionData.attachments || [],
};

const response = await fetch('/api/questions/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
});
```

### Step 5: Test! (2 min)

```bash
# Terminal 1: Backend
npm run vercel:dev

# Terminal 2: Frontend
npm run dev
```

✅ Record segment → See "✅ Uploaded" → Submit instantly!

---

## Architecture

### Components
1. **Frontend**: React form (`src/pages/AskQuestionPage.jsx`)
2. **Backend**: Vercel serverless functions
   - `api/media/upload-recording-segment.js` ← NEW
   - `api/media/upload-attachment.js` ← NEW
   - `api/questions/create.js` ← NEW
3. **Storage**: 
   - Cloudflare Stream for video/audio recordings (multi-segment support)
   - Cloudflare R2 for file attachments
4. **Database**: Xano (tables: `question`, `media_asset`, `expert_profile`)

### Data Flow (Progressive Upload)

#### Old Flow (Blocking):
```
User submits question
    ↓
Frontend converts media/files to base64 (SLOW! 10-30s)
    ↓
POST to /api/questions/submit with huge payload
    ↓
Upload everything at once
    ↓
Success
```

#### New Flow (Progressive):
```
User records segment 1
    ↓
Upload immediately to Cloudflare Stream → get UID
    ↓
User records segment 2
    ↓
Upload immediately to Cloudflare Stream → get UID
    ↓
User adds files
    ↓
Upload immediately to R2 → get URLs
    ↓
User clicks submit
    ↓
POST to /api/questions/create with tiny payload (just references!)
    ↓
Create question + media_asset records
    ↓
Success in <1 second! ⚡
```

---

## Database Schema

### question table
- `id` (integer, auto-increment)
- `expert_profile_id` (integer, FK to expert_profile)
- `title` (text)
- `text` (text, optional)
- `media_asset_id` (integer, FK to media_asset, optional) - **Links to first segment**
- `attachments` (text, JSON string)
- `payer_email` (text)
- `price_cents` (integer)
- `currency` (text)
- `status` (text: 'pending_payment', 'paid', 'answered')
- `created_at` (timestamp)
- `paid_at` (timestamp)
- `answered_at` (timestamp)

### media_asset table (UPDATED)
- `id` (integer, auto-increment)
- `owner_type` (text: 'question', 'answer', 'user')
- `owner_id` (integer, FK to owner table)
- `provider` (text: 'cloudflare_stream')
- `asset_id` (text, Cloudflare Stream video UID)
- `duration_sec` (integer)
- `status` (text: 'processing', 'ready')
- `url` (text, playback URL)
- `created_at` (timestamp)
- **`metadata` (text, JSON string, optional)** ← NEW
- **`segment_index` (integer, default 0)** ← NEW

**Metadata JSON Example:**
```json
{
  "segmentIndex": 0,
  "mode": "video",
  "originalFilename": "segment-0-1234567890.webm"
}
```

---

## Critical Implementation Details

### 1. Multi-Segment Recording
**Change**: Instead of concatenating segments, each segment uploads independently.

**Benefits**:
- No processing overhead
- Faster perceived upload time
- Individual segment control (retry, remove, reorder)
- Original quality preserved

**Implementation**:
```javascript
// Each segment creates its own media_asset record
for (const segment of recordingSegments) {
  await createMediaAsset({
    owner_type: 'question',
    owner_id: question.id,
    asset_id: segment.uid,
    segment_index: segment.segmentIndex,
    metadata: JSON.stringify({
      segmentIndex: segment.segmentIndex,
      mode: segment.mode
    })
  });
}
```

### 2. Circular Dependency Resolution
**Problem**: Question needs `media_asset_id`, but media_asset needs `question.id` as `owner_id`.

**Solution**: Create question first, then media_assets, then update question.

```javascript
// Step 1: Create question without media_asset_id
const question = await createQuestion({...});

// Step 2: Create media_asset records for each segment
const mediaAssets = [];
for (const segment of recordingSegments) {
  const mediaAsset = await createMediaAsset({
    owner_id: question.id,
    owner_type: 'question',
    asset_id: segment.uid,
    segment_index: segment.segmentIndex,
    ...
  });
  mediaAssets.push(mediaAsset);
}

// Step 3: Update question with first segment's media_asset_id
if (mediaAssets.length > 0) {
  await updateQuestion(question.id, {
    media_asset_id: mediaAssets[0].id
  });
}
```

### 3. ES Modules vs CommonJS
**Issue**: Vercel serverless functions use ES modules. Using `require()` causes "require is not defined" error.

**Solution**: Use ES imports at the top of the file:
```javascript
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import FormData from 'form-data';
import axios from 'axios';
```

### 4. FormData Upload to Cloudflare Stream
**Issue**: Using `fetch()` with FormData causes "Decoding Error" from Cloudflare API.

**Solution**: Use `axios` with proper headers:
```javascript
const formData = new FormData();
formData.append('file', buffer, {...});

await axios.post(streamUrl, formData, {
  headers: {
    'Authorization': `Bearer ${token}`,
    ...formData.getHeaders()
  },
  maxContentLength: Infinity,
  maxBodyLength: Infinity
});
```

### 5. Attachments Storage
Attachments are stored as JSON string in `question.attachments` field:
```json
[
  {
    "name": "document.pdf",
    "url": "https://pub-xxx.r2.dev/question-attachments/12345-document.pdf",
    "type": "application/pdf",
    "size": 54321
  }
]
```

---

## Environment Variables

### Required in Vercel
```bash
# Xano
XANO_BASE_URL=https://x8ki-letl-twmt.n7.xano.io/api:BQW1GS7L

# Cloudflare Account
CLOUDFLARE_ACCOUNT_ID=your_account_id

# Cloudflare Stream
CLOUDFLARE_STREAM_API_TOKEN=your_stream_api_token

# Cloudflare R2
CLOUDFLARE_R2_ACCESS_KEY=your_r2_access_key
CLOUDFLARE_R2_SECRET_KEY=your_r2_secret_key
CLOUDFLARE_R2_BUCKET=your_bucket_name

# Development
SKIP_STRIPE=true
NODE_ENV=development
```

**Important**: Variable names must match exactly what's in the code:
- `CLOUDFLARE_R2_ACCESS_KEY` (not `ACCESS_KEY_ID`)
- `CLOUDFLARE_R2_SECRET_KEY` (not `SECRET_ACCESS_KEY`)
- `CLOUDFLARE_R2_BUCKET` (not `BUCKET_NAME`)

---

## API Endpoints

### NEW: POST /api/media/upload-recording-segment
**Purpose**: Upload individual recording segment to Cloudflare Stream

**Request**:
```json
{
  "recordingBlob": "data:video/webm;base64,...",
  "recordingMode": "video",
  "segmentIndex": 0
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "uid": "abc123",
    "playbackUrl": "https://customer-xxx.cloudflarestream.com/abc123/manifest/video.m3u8",
    "duration": 15,
    "mode": "video",
    "size": 2048000,
    "segmentIndex": 0
  }
}
```

### NEW: POST /api/media/upload-attachment
**Purpose**: Upload single file to Cloudflare R2

**Request**:
```json
{
  "file": {
    "name": "document.pdf",
    "type": "application/pdf",
    "data": "base64string..."
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "name": "document.pdf",
    "url": "https://pub-xxx.r2.dev/question-attachments/123-document.pdf",
    "type": "application/pdf",
    "size": 54321
  }
}
```

### NEW: POST /api/questions/create
**Purpose**: Create question with pre-uploaded content

**Request**:
```json
{
  "expertHandle": "gojko",
  "title": "My question",
  "text": "Details...",
  "payerEmail": "user@example.com",
  "recordingSegments": [
    {
      "uid": "abc123",
      "playbackUrl": "https://...",
      "duration": 15,
      "mode": "video",
      "segmentIndex": 0
    },
    {
      "uid": "def456",
      "playbackUrl": "https://...",
      "duration": 20,
      "mode": "video",
      "segmentIndex": 1
    }
  ],
  "attachments": [
    {
      "name": "file.pdf",
      "url": "https://...",
      "type": "application/pdf",
      "size": 12345
    }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "questionId": 123,
    "mediaAssetIds": [456, 457],
    "segmentCount": 2,
    "attachmentCount": 1,
    "status": "paid"
  }
}
```

---

## Xano Endpoints

### GET /me/questions (UPDATED)
**Purpose**: Fetch questions for authenticated expert

**Inputs**:
- `status` (text, optional) - Filter by status

**Logic** (UPDATED):
1. Get Record From `expert_profile` (by auth user)
2. Conditional: if expertProfile != null
3. Query All Records From `question` WHERE:
   - `expert_profile_id == expertProfile.id`
   - `status == input.status` (ignore if empty)
4. For Each question:
   - **Query ALL media_assets** WHERE owner_id == question.id AND owner_type == 'question'
   - Order by segment_index ASC
   - Attach as array: `question.recording_segments`
5. Return enriched questions

**Response**:
```json
{
  "id": 123,
  "title": "My question",
  "recording_segments": [
    {
      "id": 1,
      "asset_id": "abc123",
      "url": "https://...",
      "duration_sec": 15,
      "segment_index": 0
    },
    {
      "id": 2,
      "asset_id": "def456",
      "url": "https://...",
      "duration_sec": 20,
      "segment_index": 1
    }
  ]
}
```

### POST /question
**Purpose**: Create new question record

**Inputs**:
- `expert_profile_id` (integer)
- `payer_email` (text)
- `price_cents` (integer)
- `currency` (text)
- `status` (text)
- `sla_hours_snapshot` (integer)
- `title` (text)
- `text` (text, optional)
- `attachments` (text, optional JSON string)

**Logic**:
1. Add Record In `question` table
2. Return created question

**Response**: Question object with `id`

### POST /media_asset (UPDATED)
**Purpose**: Create media asset record for video/audio segment

**Inputs**:
- `owner_type` (text) - 'question', 'answer', or 'user'
- `owner_id` (integer) - ID of owning record
- `provider` (text) - 'cloudflare_stream'
- `asset_id` (text) - Cloudflare Stream video UID
- `duration_sec` (integer, optional)
- `status` (text, optional)
- `url` (text, optional)
- **`metadata` (text, optional)** ← NEW
- **`segment_index` (integer, optional, default 0)** ← NEW

**Logic**:
1. Add Record In `media_asset` table with all fields
2. Return created media_asset

**Response**: Media asset object with `id`

### PATCH /question/{id}
**Purpose**: Update existing question

**Inputs**:
- `id` (integer, path parameter)
- `status` (text, optional)
- `paid_at` (timestamp, optional)
- `media_asset_id` (integer, optional)

**Logic**:
1. Get Record From `question` by id
2. Edit Record with provided fields
3. Return updated question

**Response**: Updated question object

---

## Frontend Implementation

### QuestionComposer.jsx (UPDATED)
**Key Changes**:

1. **Added upload hooks**:
```javascript
const segmentUpload = useRecordingSegmentUpload();
const attachmentUpload = useAttachmentUpload();
```

2. **Upload segment immediately after recording**:
```javascript
const saveSegment = async () => {
  // ... existing code to save locally ...
  
  // Upload immediately
  await segmentUpload.uploadSegment(
    currentSegment.blob,
    currentSegment.mode,
    segments.length
  );
};
```

3. **Upload files immediately when selected**:
```javascript
const handleFileChange = async (e) => {
  const newFiles = Array.from(e.target.files);
  
  for (const file of newFiles) {
    await attachmentUpload.uploadAttachment(file);
  }
};
```

4. **Return upload references instead of blobs**:
```javascript
validateAndGetData: async () => {
  return {
    title,
    text,
    recordingSegments: segmentUpload.getSuccessfulSegments(),
    attachments: attachmentUpload.uploads
      .filter(u => u.result)
      .map(u => u.result),
    recordingMode: 'multi-segment',
    recordingDuration: totalDuration
  };
}
```

### AskQuestionPage.jsx (UPDATED)
**Key Changes**:

**Before**:
```javascript
const payload = {
  recordingBlob: await blobToBase64(questionData.mediaBlob),
  recordingMode: questionData.recordingMode,
  attachments: await convertFilesToBase64(questionData.files)
};
```

**After**:
```javascript
const payload = {
  recordingSegments: questionData.recordingSegments || [],
  attachments: questionData.attachments || []
};
```

---

## Performance Comparison

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Upload time at submit | 10-30 seconds | <1 second | **95% faster** |
| Payload size | 20-100 MB | <1 KB | **99.9% smaller** |
| User wait time | 10-30 seconds | <1 second | **90% faster** |
| Error recovery | Restart everything | Retry single item | **Much better** |

---

## Troubleshooting

### Issue: "require is not defined"
**Cause**: Using CommonJS `require()` in ES module environment  
**Fix**: Replace with ES imports at top of file

### Issue: "No value provided for input HTTP label: Bucket"
**Cause**: Environment variable name mismatch  
**Fix**: Ensure env vars match code exactly (e.g., `CLOUDFLARE_R2_BUCKET` not `CLOUDFLARE_R2_BUCKET_NAME`)

### Issue: Stream upload "Decoding Error"
**Cause**: FormData encoding issues with fetch()  
**Fix**: Use axios with `formData.getHeaders()`

### Issue: Questions not showing in dashboard
**Cause**: Wrong filter or missing expert_profile_id link  
**Fix**: Check query filters match database column names exactly (`expert_profile_id` not `expert`)

### Issue: Media not linked to question
**Cause**: Creating media_asset before question exists  
**Fix**: Create question first, then media_assets with `owner_id = question.id`

### Issue: "Button won't enable" (NEW)
**Cause**: Uploads still in progress  
**Fix**: Check console for upload errors. Ensure hooks are imported correctly:
```javascript
import { useRecordingSegmentUpload } from '@/hooks/useRecordingSegmentUpload';
import { useAttachmentUpload } from '@/hooks/useAttachmentUpload';
```

### Issue: "Uploads failing silently" (NEW)
**Cause**: Missing environment variables  
**Fix**: Check Vercel dashboard → Project Settings → Environment Variables. Verify all Cloudflare credentials are set.

---

## Testing Checklist

### Basic Tests:
- [ ] Submit question with title only
- [ ] Submit question with title + text
- [ ] Submit question with video segment
- [ ] Submit question with audio segment
- [ ] Submit question with multiple segments
- [ ] Submit question with 1 attachment
- [ ] Submit question with multiple attachments
- [ ] Submit question with segments + attachments

### Progressive Upload Tests (NEW):
- [ ] Record segment → see "⏳ Uploading..."
- [ ] Upload completes → see "✅ Uploaded"
- [ ] Record 2nd segment → uploads in background
- [ ] Add file → see "⏳ Uploading..."
- [ ] File upload completes → see "✅ Uploaded"
- [ ] Button disabled while uploading
- [ ] Button enabled when all uploaded
- [ ] Submit works instantly (<1 second)

### Backend Tests:
- [ ] Verify question appears in expert dashboard
- [ ] Verify multiple media_asset records created (one per segment)
- [ ] Verify media_asset.segment_index is correct (0, 1, 2, ...)
- [ ] Verify attachments JSON stored correctly
- [ ] Check Cloudflare Stream for all segments
- [ ] Check Cloudflare R2 for all uploaded files
- [ ] Verify GET /me/questions returns all segments in order

---

## Migration from Old System

### If you have existing `/api/questions/submit.js`:

1. **Keep it** for backward compatibility (optional)
2. **Create new endpoints** for progressive upload
3. **Update frontend** to use new flow
4. **Test both flows** work
5. **Remove old endpoint** once confident

### Database Migration:

```sql
-- Add new fields to media_asset table
ALTER TABLE media_asset ADD COLUMN metadata TEXT;
ALTER TABLE media_asset ADD COLUMN segment_index INTEGER DEFAULT 0;

-- No data migration needed - old records still work
```

---

## Key Files Reference

### Backend:
- `/api/media/upload-recording-segment.js` ← NEW
- `/api/media/upload-attachment.js` ← NEW
- `/api/questions/create.js` ← NEW
- `/api/lib/cloudflare/stream.js` - Cloudflare Stream helper
- `/api/lib/cloudflare/r2.js` - Cloudflare R2 helper
- `/api/lib/xano/question.js` - Xano question operations
- `/api/lib/xano/media.js` - Xano media operations

### Frontend:
- `/src/hooks/useRecordingSegmentUpload.js` ← NEW
- `/src/hooks/useAttachmentUpload.js` ← NEW
- `/src/pages/AskQuestionPage.jsx` - Question form page (UPDATED)
- `/src/components/question/QuestionComposer.jsx` - Recording component (UPDATED)
- `/src/components/question/AskReviewModal.jsx` - Review before submit
- `/src/pages/ExpertDashboardPage.jsx` - Expert view of questions

---

## Dependencies

```json
{
  "@aws-sdk/client-s3": "^3.490.0",
  "axios": "^1.6.8",
  "form-data": "^4.0.0",
  "react": "^18.2.0",
  "react-router-dom": "^6.22.3"
}
```

**Note**: No new dependencies needed for progressive upload!

---

## Future Enhancements

### Completed:
- ✅ **Progressive Upload**: Upload segments/files as created (DONE!)
- ✅ **Real-time Status**: Show upload progress indicators (DONE!)
- ✅ **Individual Retry**: Retry failed uploads separately (DONE!)

### Planned:
1. **Stripe Integration**: Replace dev mode payment skip with real Stripe checkout
2. **Client-side Compression**: Compress videos before upload
3. **Resumable Uploads**: Continue interrupted uploads
4. **Video Thumbnails**: Extract and store video thumbnails from Stream
5. **Draft System**: Save incomplete questions for later
6. **Parallel Uploads**: Upload multiple files simultaneously

---

## Contact & Support

For issues or questions about this implementation:
1. Check browser console (F12) for errors
2. Check Vercel function logs for error details
3. Verify environment variables are set correctly
4. Review Xano API endpoint configurations
5. Check Cloudflare dashboard for upload status

---

*Last Updated: October 6, 2025*  
*Version: 2.0 - Progressive Upload*