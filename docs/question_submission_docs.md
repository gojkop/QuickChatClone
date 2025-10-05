# Question Submission Implementation Guide

## Overview
This document details the implementation of the question submission system with Cloudflare Stream (video/audio) and R2 (file attachments) integration.

**Date**: October 2025  
**System**: QuickChat Question Submission Flow

---

## Architecture

### Components
1. **Frontend**: React form (`src/pages/AskQuestionPage.jsx`)
2. **Backend**: Vercel serverless function (`api/questions/submit.js`)
3. **Storage**: 
   - Cloudflare Stream for video/audio recordings
   - Cloudflare R2 for file attachments
4. **Database**: Xano (tables: `question`, `media_asset`, `expert_profile`)

### Data Flow
```
User submits question
    ↓
Frontend converts media/files to base64
    ↓
POST to /api/questions/submit
    ↓
Vercel Function:
  1. Get expert profile by handle
  2. Upload recording to Cloudflare Stream → get video UID
  3. Upload attachments to Cloudflare R2 → get URLs
  4. Create question record in Xano (without media_asset_id)
  5. Create media_asset record (with owner_id = question.id)
  6. Update question with media_asset_id
  7. Mark as paid (dev mode only)
    ↓
Return success to frontend
```

---

## Database Schema

### question table
- `id` (integer, auto-increment)
- `expert_profile_id` (integer, FK to expert_profile)
- `title` (text)
- `text` (text, optional)
- `media_asset_id` (integer, FK to media_asset, optional)
- `attachments` (text, JSON string)
- `payer_email` (text)
- `price_cents` (integer)
- `currency` (text)
- `status` (text: 'pending_payment', 'paid', 'answered')
- `created_at` (timestamp)
- `paid_at` (timestamp)
- `answered_at` (timestamp)

### media_asset table
- `id` (integer, auto-increment)
- `owner_type` (text: 'question', 'answer', 'user')
- `owner_id` (integer, FK to owner table)
- `provider` (text: 'cloudflare_stream')
- `asset_id` (text, Cloudflare Stream video UID)
- `duration_sec` (integer)
- `status` (text: 'processing', 'ready')
- `url` (text, playback URL)
- `created_at` (timestamp)

---

## Critical Implementation Details

### 1. Circular Dependency Resolution
**Problem**: Question needs `media_asset_id`, but media_asset needs `question.id` as `owner_id`.

**Solution**: Create question first, then media_asset, then update question.

```javascript
// Step 1: Create question without media_asset_id
const question = await createQuestion({...});

// Step 2: Create media_asset with owner_id = question.id
const mediaAsset = await createMediaAsset({
  owner_id: question.id,
  owner_type: 'question',
  ...
});

// Step 3: Update question with media_asset_id
await updateQuestion(question.id, {
  media_asset_id: mediaAsset.id
});
```

### 2. ES Modules vs CommonJS
**Issue**: Vercel serverless functions use ES modules. Using `require()` causes "require is not defined" error.

**Solution**: Use ES imports at the top of the file:
```javascript
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import FormData from 'form-data';
import axios from 'axios';
```

### 3. FormData Upload to Cloudflare Stream
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

### 4. Attachments Storage
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

## Xano Endpoints

### GET /me/questions
**Purpose**: Fetch questions for authenticated expert

**Inputs**:
- `status` (text, optional) - Filter by status

**Logic**:
1. Get Record From `expert_profile` (by auth user)
2. Conditional: if expertProfile != null
3. Query All Records From `question` WHERE:
   - `expert_profile_id == expertProfile.id`
   - `status == input.status` (ignore if empty)
4. For Each question: Get media_asset if exists
5. Return enriched questions

**Response**: Array of question objects

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

### POST /media_asset
**Purpose**: Create media asset record for video/audio

**Inputs**:
- `owner_type` (text) - 'question', 'answer', or 'user'
- `owner_id` (integer) - ID of owning record
- `provider` (text) - 'cloudflare_stream'
- `asset_id` (text) - Cloudflare Stream video UID
- `duration_sec` (integer, optional)
- `status` (text, optional)
- `url` (text, optional)

**Logic**:
1. Add Record In `media_asset` table
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

### AskQuestionPage.jsx
**Key Functions**:

1. **handleContinueToReview**: Validates form and opens review modal
2. **handleProceedToPayment**: Submits question to backend

**Payload Structure**:
```javascript
{
  expertHandle: "gojko",
  title: "My question title",
  text: "Additional context...",
  recordingMode: "video", // or "audio"
  recordingBlob: "base64string...",
  attachments: [
    {
      name: "file.pdf",
      data: "base64string...",
      type: "application/pdf"
    }
  ],
  payerEmail: "user@example.com",
  payerFirstName: "John",
  payerLastName: "Doe"
}
```

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
**Fix**: Create question first, then media_asset with `owner_id = question.id`

---

## Testing Checklist

- [ ] Submit question with title only
- [ ] Submit question with title + text
- [ ] Submit question with video recording
- [ ] Submit question with audio recording
- [ ] Submit question with 1 attachment
- [ ] Submit question with multiple attachments
- [ ] Submit question with video + attachments
- [ ] Verify question appears in expert dashboard
- [ ] Verify media_asset record created with correct owner_id
- [ ] Verify attachments JSON stored correctly
- [ ] Check Cloudflare Stream for uploaded video
- [ ] Check Cloudflare R2 for uploaded files

---

## Future Enhancements

1. **Stripe Integration**: Replace dev mode payment skip with real Stripe checkout
2. **Progress Indicators**: Show upload progress for large files
3. **File Validation**: Add size limits and type checking on backend
4. **Retry Logic**: Handle failed uploads with automatic retry
5. **Webhook Handler**: Process Stripe payment confirmations
6. **Video Thumbnails**: Extract and store video thumbnails from Stream
7. **Compression**: Compress large videos before upload

---

## Key Files Reference

- `/api/questions/submit.js` - Main submission handler
- `/src/pages/AskQuestionPage.jsx` - Question form page
- `/src/components/question/QuestionComposer.jsx` - Recording component
- `/src/components/question/AskReviewModal.jsx` - Review before submit
- `/src/pages/ExpertDashboardPage.jsx` - Expert view of questions

---

## Dependencies

```json
{
  "@aws-sdk/client-s3": "^3.x",
  "axios": "^1.6.8",
  "form-data": "^4.0.0",
  "react": "^18.2.0",
  "react-router-dom": "^6.22.3"
}
```

---

## Contact & Support

For issues or questions about this implementation:
1. Check Vercel function logs for error details
2. Verify environment variables are set correctly
3. Review Xano API endpoint configurations
4. Check Cloudflare dashboard for upload status

---

*Last Updated: October 6, 2025*