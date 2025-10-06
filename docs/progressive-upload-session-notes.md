# Progressive Video Upload Implementation Session

**Date**: October 6, 2025  
**Session Duration**: Extended debugging session  
**Status**: ⚠️ **INCOMPLETE - Recording corruption issue unresolved**

---

## Executive Summary

This session focused on implementing progressive video upload functionality for QuickChat, allowing users to record video segments that upload to Cloudflare Stream. Multiple technical issues were resolved (OAuth, Xano API configuration), but a critical video file corruption issue remains undiagnosed and unresolved.

---

## Issues Resolved ✅

### 1. OAuth Google Sign-In Fixed

**Problem**: Google OAuth returning 500 errors after system changes.

**Root Causes Identified**:
- Environment variable name mismatch (`XANO_API_BASE_URL` vs `XANO_BASE_URL`)
- Import path typos (`claudflare` vs `cloudflare`)
- ES modules destructuring issues with `process.env`
- OAuth endpoints located in different Xano API group (`api:fALBm5Ej` vs `api:BQW1GS7L`)

**Solutions**:
```javascript
// Fixed environment variable usage
const XANO_BASE_URL = process.env.XANO_BASE_URL;
const XANO_AUTH_BASE_URL = process.env.XANO_AUTH_BASE_URL;

// Corrected import paths
import { ... } from '../lib/cloudflare/stream.js';
```

**New Environment Variable**:
- `XANO_AUTH_BASE_URL` = `https://x8ki-letl-twmt.n7.xano.io/api:fALBm5Ej`

---

### 2. Xano Questions API - Multi-Segment Support

**Problem**: GET `/me/questions` returning questions without associated recording segments.

**Solution**: Rebuilt Xano endpoint to query and attach media_asset records

**Final Xano Workflow**:
```
1. Get expert_profile by auth user
2. Query all questions for expert
3. Create empty result array
4. For each question:
   4.1. Query media_assets WHERE owner_type="question" AND owner_id=question.id
        ORDER BY segment_index ASC
   4.2. Build new object with all question fields + recording_segments array
   4.3. Append to result array
5. Return result array
```

**Critical Syntax**: Use `$question.id` (not `question.id`) when building objects in Xano's visual editor.

---

## Issues Unresolved ⚠️

### Video File Corruption (CRITICAL)

**Symptoms**:
- Backend receives only 7 bytes of data (expected: 100KB-10MB)
- Magic bytes: `a29bac6d` (expected: `1a45dfa3` for WebM)
- Cloudflare rejects with: "The file was not recognized as a valid video file"

**Current Upload Flow**:
```
Browser → MediaRecorder → Blob → Base64 → 
Backend (Vercel) → Buffer → FormData → Cloudflare Stream
```

**Possible Failure Points**:
1. MediaRecorder not capturing data
2. Blob creation failing
3. Base64 encoding corrupting data
4. Backend Buffer.from() corrupting data

**Debug Code Added** (not yet verified):
```javascript
// In AnswerRecorder.jsx - mediaRecorderRef.current.onstop
console.log('Chunks collected:', chunks.length);
console.log('Chunk sizes:', chunks.map(c => c.size));
console.log('Final blob size:', blob.size);
console.log('Blob magic bytes:', magicBytes);
```

**NEXT STEP REQUIRED**: User must check browser JavaScript console (not Network tab) after recording to provide these logs.

---

## Upload Approaches Attempted

### Approach 1: Backend Proxy (Initial)
**Status**: ❌ Failed - 413 Payload Too Large  
**Issue**: Vercel serverless functions limited to 4.5MB request body  
**Impact**: Videos >30 seconds exceed limit

### Approach 2: TUS Direct Upload
**Status**: ❌ Failed - CORS restrictions  
**Issue**: Browser can't upload directly to Cloudflare TUS endpoints  
**Library Tried**: tus-js-client

### Approach 3: Signed Upload URLs
**Status**: ❌ Failed - Configuration error  
**Issue**: `allowedOrigins` must not include protocol  
**Fix Applied**: Changed from `https://domain.com` to `domain.com`  
**New Issue**: Still returned 404/validation errors

### Approach 4: Backend Proxy (Current)
**Status**: ⚠️ In Progress - File corruption issue  
**Implementation**: Base64 encode in browser, decode in backend, upload to Cloudflare  
**Problem**: Blob arrives corrupted at backend

---

## Files Modified

### Backend
- `api/oauth/google/init.js` - Fixed OAuth initialization
- `api/oauth/google/continue.js` - Fixed OAuth callback
- `api/media/upload-video.js` - Current upload endpoint with validation
- `api/media/get-signed-upload-url.js` - Attempted approach (not in use)

### Frontend
- `src/hooks/useRecordingSegmentUpload.js` - Upload hook with base64 conversion
- `src/components/dashboard/QuestionDetailModal.jsx` - Display recording segments
- `src/components/dashboard/AnswerRecorder.jsx` - Added debug logging

### Configuration
- `package.json` - Added then removed tus-js-client dependency

---

## Environment Variables (Vercel)

**All Environments (Production, Preview, Development)**:

```bash
# Xano APIs
XANO_BASE_URL=https://x8ki-letl-twmt.n7.xano.io/api:BQW1GS7L
XANO_AUTH_BASE_URL=https://x8ki-letl-twmt.n7.xano.io/api:fALBm5Ej

# Cloudflare
CLOUDFLARE_ACCOUNT_ID=[your_account_id]
CLOUDFLARE_STREAM_API_TOKEN=[your_token]
CLOUDFLARE_R2_ACCESS_KEY=[your_key]
CLOUDFLARE_R2_SECRET_KEY=[your_secret]
CLOUDFLARE_R2_BUCKET=[your_bucket]

# Application
CLIENT_PUBLIC_ORIGIN=quickchat-deploy.vercel.app
SKIP_STRIPE=true
NODE_ENV=development
```

---

## Database Schema Changes (Xano)

### media_asset Table
**Existing Fields**:
- `id`, `owner_type`, `owner_id`, `provider`, `asset_id`, `duration_sec`, `status`, `url`, `created_at`

**Added Fields**:
- `segment_index` (integer, default: 0) - For multi-segment ordering
- `metadata` (text, JSON) - Stores segment-specific data like mode

**Example metadata**:
```json
{
  "segmentIndex": 0,
  "mode": "video",
  "originalFilename": "segment-0-1234567890.webm"
}
```

---

## Key Learnings

### Xano Quirks
1. Variable syntax differs in object builders: `$variable` vs `var:variable`
2. Cannot modify loop variables directly; must build new array
3. Text filters need literal strings, not variables with quotes
4. Different API groups require separate base URLs

### Vercel Limitations
1. 4.5MB payload limit on serverless functions
2. Must use ES modules syntax (not CommonJS)
3. Environment variables don't take effect until redeployment

### Cloudflare Stream
1. Direct upload requires TUS protocol (complex, CORS issues)
2. Signed URLs have strict `allowedOrigins` format requirements
3. Standard API upload works but requires backend proxy
4. Validates file format strictly - rejects corrupted files immediately

### MediaRecorder API
1. `start()` without timeslice may be more reliable than `start(100)`
2. Blob must be created from collected chunks array
3. WebM files should start with magic bytes `1a45dfa3`
4. Need to verify stream tracks have `readyState: "live"` before recording

---

## Diagnostic Steps for Next Session

### 1. Verify MediaRecorder Capture (Priority: CRITICAL)

Add to `AnswerRecorder.jsx` in `startRecording()`:

```javascript
const streamToRecord = liveStreamRef.current;

// Check stream health
console.log('Stream tracks:', streamToRecord.getTracks().map(t => ({
  kind: t.kind,
  enabled: t.enabled,
  readyState: t.readyState,
  muted: t.muted
})));

const mimeType = currentSegment.mode === 'audio' 
  ? 'audio/webm' 
  : 'video/webm;codecs=vp8,opus';

// Check codec support
console.log('Using mimeType:', mimeType);
console.log('MediaRecorder.isTypeSupported:', 
  MediaRecorder.isTypeSupported(mimeType));
```

**Expected Output**:
- Tracks: `readyState: "live"`, `enabled: true`
- isTypeSupported: `true`

**If tracks show "ended" or "false"**: Stream is dead before recording starts  
**If isTypeSupported is false**: Browser doesn't support the codec

### 2. Check Blob Before Upload

After recording stops, verify in browser console:
- Chunks collected: Should be > 0 (typically 20-50 for a 10-second video)
- Chunk sizes: Should be > 1000 bytes each
- Final blob size: Should be 100KB-10MB for 10-second video
- Blob magic bytes: Should be `1a45dfa3`

### 3. Test Blob Playback Locally

Before upload, try playing the blob:
```javascript
const url = URL.createObjectURL(blob);
const video = document.createElement('video');
video.src = url;
video.controls = true;
document.body.appendChild(video);
video.play();
```

**If video plays**: Problem is in upload process  
**If video doesn't play**: Problem is in recording process

---

## Recommended Solutions by Scenario

### Scenario A: Blob is Valid Locally
**Problem**: Corruption during upload  
**Solutions**:
1. Check base64 encoding/decoding process
2. Verify Buffer.from() usage in backend
3. Test with smaller video (< 1MB)
4. Consider chunked upload approach

### Scenario B: Blob is Corrupted Locally
**Problem**: MediaRecorder not capturing properly  
**Solutions**:
1. Try different mimeType: `video/webm` (without codecs)
2. Increase timeslice: `start(1000)` instead of `start(100)`
3. Check for browser compatibility issues
4. Verify getUserMedia constraints

### Scenario C: No Chunks Collected
**Problem**: MediaRecorder not receiving data  
**Solutions**:
1. Verify stream tracks are active
2. Check browser permissions
3. Test with different recording mode (audio only)
4. Ensure recording runs for >1 second

---

## Alternative Approaches to Consider

### 1. Client-Side Video Compression
**Pros**: Reduces payload size, stays under 4.5MB limit  
**Cons**: Adds processing time, may reduce quality  
**Library**: WebCodecs API or ffmpeg.wasm

### 2. Chunked Upload
**Pros**: No size limits, resumable  
**Cons**: Complex implementation, needs backend coordination  
**Implementation**: Split blob into chunks, upload sequentially

### 3. Streaming Upload
**Pros**: No buffering, immediate processing  
**Cons**: Very complex, requires WebSocket or similar  
**Technology**: MediaStream Recording API with real-time upload

### 4. Direct S3/R2 Upload
**Pros**: Bypasses Vercel limits, simple presigned URLs  
**Cons**: Requires transcoding step, more infrastructure  
**Flow**: Browser → R2 → Trigger function → Transcode → Cloudflare Stream

---

## Token Usage Summary
- **Session Usage**: ~75K / 190K tokens (39%)
- **Remaining Capacity**: 115K tokens
- **Status**: Adequate for continued debugging

---

## Action Items

### Immediate (Next 5 Minutes)
- [ ] Check browser JavaScript console logs after recording
- [ ] Copy all console output and share with developer
- [ ] Verify debug code is deployed and active

### Short Term (Next Session)
- [ ] Diagnose corruption source based on console logs
- [ ] Implement fix based on diagnostic results
- [ ] Test with various video lengths (5s, 10s, 30s)
- [ ] Verify upload works end-to-end

### Medium Term (Next Sprint)
- [ ] Implement progress indicators during upload
- [ ] Add retry logic for failed uploads
- [ ] Consider chunked upload for large files
- [ ] Add client-side compression if needed

### Long Term (Future Enhancement)
- [ ] Optimize video codec selection
- [ ] Add thumbnail generation
- [ ] Implement resumable uploads
- [ ] Add video preview before upload

---

## Files to Deploy

**Backend**:
```bash
api/oauth/google/init.js
api/oauth/google/continue.js
api/media/upload-video.js
```

**Frontend**:
```bash
src/hooks/useRecordingSegmentUpload.js
src/components/dashboard/QuestionDetailModal.jsx
src/components/dashboard/AnswerRecorder.jsx
```

**Deployment Command**:
```bash
git add -A
git commit -m "fix: Add video upload debugging and OAuth fixes"
git push
```

---

## Conclusion

OAuth and Xano configuration issues were successfully resolved. The video upload functionality is partially implemented but blocked by a critical file corruption issue. The root cause cannot be determined without browser console logs showing MediaRecorder output. Next session should begin by reviewing these logs to identify whether the problem is in recording, blob creation, encoding, or backend processing.

**Session Status**: Incomplete - requires user input to proceed  
**Blocker**: Missing browser console diagnostic output  
**Estimated Time to Resolution**: 1-2 hours once logs are provided

---

**Document Version**: 1.0  
**Last Updated**: October 6, 2025  
**Next Review**: After diagnostic logs received