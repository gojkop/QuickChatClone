# TUS Upload Implementation - Complete Progress Document

**Date**: October 7, 2025  
**Status**: In Progress - Stuck on Cloudflare decoding errors  
**Next Step**: Consider Option B (Cloudflare Workers)

---

## Problem Statement

### Original Issue
- Vercel serverless functions have a 4.5MB request body limit
- Users recording 30+ second videos hit this limit (~12-40MB files)
- Need to bypass Vercel for video uploads

### Video Size Context
- 10 seconds ≈ 4MB
- 30 seconds ≈ 12MB (would fail with old approach)
- 90 seconds ≈ 36MB (maximum allowed)

---

## What We Tried (Chronological)

### Attempt 1: TUS Client Library (tus-js-client)
**Approach**: Use official TUS client with Cloudflare Direct Creator Upload  
**Files Changed**: 
- Created `api/media/get-upload-url.js`
- Modified `src/hooks/useRecordingSegmentUpload.js`

**Issues**:
1. CORS errors - fixed by removing `http://` from `allowedOrigins`
2. TUS client tried to POST/create upload (Cloudflare already created it)
3. TUS v2 removed `resume` option - tried custom `urlStorage`
4. TUS kept trying HEAD/POST instead of PATCH

**Result**: ❌ Failed - TUS client incompatible with Cloudflare's pre-created URLs

### Attempt 2: Custom Chunked Uploader (5MB chunks)
**Approach**: Write our own chunked uploader using fetch  
**Changes**: Replaced TUS client with custom implementation

**Issues**:
1. First attempt: All PATCH - failed "must use POST"
2. Second attempt: POST first chunk, PATCH rest - "decoding error"
3. Third attempt: Added `Upload-Length` header - still "decoding error"

**Result**: ❌ Failed - Cloudflare couldn't decode chunked uploads

### Attempt 3: Full File Upload (Current State)
**Approach**: POST entire blob in one request (no chunking)  
**Current Code**: Removed TUS headers, just POST raw blob

**Status**: 🔄 Testing - awaiting results

---

## Current Implementation

### Files Modified

#### 1. `api/media/get-upload-url.js` (NEW FILE)
```javascript
// Generates Cloudflare Direct Creator Upload URL
// Returns: { uploadURL, uid }

export default async function handler(req, res) {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream/direct_upload`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_STREAM_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        maxDurationSeconds: 90,
        requireSignedURLs: false,
        allowedOrigins: [
          'localhost:3000',
          'localhost:3001', 
          'quickchat-deploy.vercel.app',
          '*.vercel.app',
        ],
      }),
    }
  );
  
  const data = await response.json();
  return res.json({
    success: true,
    data: {
      uploadURL: data.result.uploadURL,
      uid: data.result.uid,
    },
  });
}
```

**Key Points**:
- No `http://` or `https://` in `allowedOrigins`
- Returns TUS-compatible upload URL from Cloudflare

#### 2. `src/hooks/useRecordingSegmentUpload.js` (REPLACED)
**Original**: Used TUS client library  
**Current**: Custom uploader with simple POST

```javascript
// Current implementation (simplified)
const uploadEntireFile = async (blob, uploadURL) => {
  const response = await fetch(uploadURL, {
    method: 'POST',
    body: blob, // Raw blob, no headers
  });
  
  if (!response.ok) {
    throw new Error(`Upload failed: ${response.status}`);
  }
};
```

**State Management**: Same as before (segments array with progress)

#### 3. `package.json`
**Added**:
```json
"dependencies": {
  "tus-js-client": "^4.2.3"
}
```

**Note**: Currently unused but installed. Can be removed.

#### 4. Environment Variables
**Added to Vercel**:
- `VITE_CLOUDFLARE_ACCOUNT_ID` (frontend-accessible)

**Already Existed**:
- `CLOUDFLARE_ACCOUNT_ID` (backend)
- `CLOUDFLARE_STREAM_API_TOKEN` (backend)

---

## Error Patterns We Encountered

### 1. CORS Error
```
validation failed: allowed origin must not specify protocol http://localhost:3000
```
**Solution**: Remove `http://` and `https://` from origins

### 2. TUS Resume Error
```
tus: unable to resume upload (new upload cannot be created without an endpoint)
```
**Cause**: TUS v2 API incompatibility

### 3. Decoding Error (Current)
```
Decoding Error: A portion of the request could not be decoded
```
**Possible Causes**:
- Wrong headers (TUS-specific headers causing issues)
- Cloudflare expects different format
- Blob not being sent correctly

---

## Architecture Options Going Forward

### Option A: Client-Side Compression (Stay on Vercel)
**Approach**: Compress video before upload to stay under 4.5MB

**Pros**:
- No infrastructure changes
- Works with existing Vercel setup

**Cons**:
- Requires WebCodecs API or ffmpeg.wasm (~10MB library)
- Client-side CPU intensive
- Quality loss from compression
- Still limited by compressed size

**Implementation Time**: 2-3 hours

**Libraries**:
- `@ffmpeg/ffmpeg` (10MB) - full transcoding
- WebCodecs API (native) - modern browsers only

### Option B: Cloudflare Workers (RECOMMENDED)
**Approach**: Move video upload endpoint to Cloudflare Workers

**Architecture**:
```
Browser → Cloudflare Workers → Cloudflare Stream
         (no size limit)
```

**Pros**:
- ✅ No 4.5MB limit
- ✅ Same ecosystem (Cloudflare)
- ✅ Fast (edge computing)
- ✅ Simple deployment
- ✅ Cheap ($5/month Workers plan)

**Cons**:
- New service to manage
- Slight learning curve

**Implementation Time**: 30-60 minutes

**Cost**: $5/month (Workers Paid plan for longer CPU time)

### Option C: Rollback to Base64 (Short-term)
**Approach**: Revert to original base64 upload, limit to 10-second videos

**Pros**:
- Works immediately
- No new code

**Cons**:
- ❌ Terrible UX (10-second limit)
- ❌ Doesn't solve the problem

---

## Option B: Cloudflare Workers Implementation Plan

### Step 1: Create Worker (5 minutes)

**File**: `cloudflare-worker/upload-video.js`

```javascript
export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      // Get blob from request
      const blob = await request.blob();

      // Create Direct Upload URL
      const uploadResponse = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/stream/direct_upload`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.CLOUDFLARE_STREAM_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            maxDurationSeconds: 90,
            requireSignedURLs: false,
          }),
        }
      );

      const uploadData = await uploadResponse.json();
      const { uploadURL, uid } = uploadData.result;

      // Upload to Cloudflare Stream
      const streamResponse = await fetch(uploadURL, {
        method: 'POST',
        body: blob,
      });

      if (!streamResponse.ok) {
        throw new Error('Stream upload failed');
      }

      return new Response(JSON.stringify({
        success: true,
        data: {
          uid,
          playbackUrl: `https://customer-${env.CLOUDFLARE_ACCOUNT_ID}.cloudflarestream.com/${uid}/manifest/video.m3u8`,
        },
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });

    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  },
};
```

### Step 2: Deploy Worker (10 minutes)

```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Create worker
wrangler init quickchat-upload

# Copy code above into worker

# Add secrets
wrangler secret put CLOUDFLARE_ACCOUNT_ID
wrangler secret put CLOUDFLARE_STREAM_API_TOKEN

# Deploy
wrangler publish
```

**Result**: Worker URL like `https://quickchat-upload.your-subdomain.workers.dev`

### Step 3: Update Frontend (5 minutes)

**File**: `src/hooks/useRecordingSegmentUpload.js`

```javascript
// Change this line:
const urlResponse = await fetch('/api/media/get-upload-url', {

// To this:
const uploadResponse = await fetch('https://quickchat-upload.your-subdomain.workers.dev', {
  method: 'POST',
  body: blob, // Send blob directly
});

const result = await uploadResponse.json();
// Use result.data.uid and result.data.playbackUrl
```

### Step 4: Remove Vercel Endpoint (2 minutes)

```bash
# Delete old endpoint (no longer needed)
rm api/media/get-upload-url.js
```

### Step 5: Test & Deploy (10 minutes)

```bash
git add .
git commit -m "Switch to Cloudflare Workers for video upload"
git push origin main
```

---

## Rollback Plan

### Quick Rollback (5 minutes)

```bash
# Revert to last working commit
git log --oneline  # Find commit before TUS changes
git revert <commit-hash>
git push origin main
```

### Files to Restore
- `src/hooks/useRecordingSegmentUpload.js` (old base64 version)
- Delete `api/media/get-upload-url.js`

### Or Use Backup
See `docs/questions-guide.md` (document index 3) for the working base64 implementation.

---

## Testing Checklist

After implementing any solution:

**Basic Tests**:
- [ ] 5-second video uploads
- [ ] 15-second video uploads  
- [ ] 30-second video uploads (critical - would fail before)
- [ ] 60-second video uploads
- [ ] 90-second total across multiple segments

**Error Handling**:
- [ ] Network interruption during upload
- [ ] Cancel upload mid-way
- [ ] Retry failed upload

**Edge Cases**:
- [ ] Multiple segments in rapid succession
- [ ] Very large file (>50MB if possible)
- [ ] Audio-only recording

---

## Current State Summary

### What's Working ✅
- Getting upload URL from Cloudflare
- CORS configured correctly
- Frontend hooks properly integrated
- Multi-segment recording UI
- Progress tracking infrastructure

### What's Broken ❌
- Actual upload to Cloudflare (decoding errors)
- Can't upload videos >4.5MB currently

### What's Uncertain ❓
- Whether current POST approach will work
- If Cloudflare Direct Upload expects different format

---

## Recommended Next Steps

### Immediate (Next Chat)
1. **Check result of current test** (simple POST with no headers)
   - If ✅ works: Document solution and close
   - If ❌ fails: Proceed to Option B

2. **Implement Option B (Cloudflare Workers)**
   - Follow implementation plan above
   - 30-60 minutes total time
   - High confidence this will work

### Why Option B is Best
- Cloudflare Workers have **no request size limits**
- Same ecosystem (already using Cloudflare Stream)
- Clean architecture (Workers → Stream is direct)
- Cheap ($5/month)
- Well-documented and supported

### Alternative (If time-constrained)
- Temporarily limit videos to 10 seconds
- Schedule Option B implementation for later
- At least users can ask questions now

---

## Key Learnings

1. **TUS Client Libraries**: Often designed for standard TUS servers, not pre-created upload URLs
2. **Cloudflare Direct Upload**: Expects specific format that's not well documented
3. **Vercel Limitations**: 4.5MB limit is hard - can't be worked around easily
4. **Serverless Tradeoffs**: Great for most things, problematic for large uploads

---

## References

### Documentation
- Cloudflare Stream Direct Upload: https://developers.cloudflare.com/stream/uploading-videos/direct-creator-uploads/
- Cloudflare Workers: https://developers.cloudflare.com/workers/
- TUS Protocol: https://tus.io/protocols/resumable-upload.html
- Vercel Limits: https://vercel.com/docs/functions/serverless-functions/runtimes#request-body-size

### Internal Docs
- Original implementation: `docs/questions-guide.md` (document index 3)
- Frontend components: `src/components/question/QuestionComposer.jsx` (document index 4)

### Environment
- Production: https://quickchat-deploy.vercel.app
- Cloudflare Account: (from env vars)

---

## Questions to Ask in Next Chat

1. Did the current simple POST approach work?
2. Is budget approved for Cloudflare Workers ($5/month)?
3. What's the timeline pressure? (affects Option A vs B choice)
4. Any concerns about adding Cloudflare Workers to the stack?

---

## Token Usage Note
This chat reached ~95% token usage. Starting fresh in new chat recommended.

**To Resume**: 
1. Share this document
2. Share current test results
3. Decide on Option A vs Option B
4. Implement chosen solution

---

**Document Version**: 1.0  
**Last Updated**: October 7, 2025  
**Status**: Ready for handoff to next chat session