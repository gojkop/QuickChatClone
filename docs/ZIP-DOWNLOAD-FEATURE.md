# ZIP Download Feature

**Date Created:** October 16, 2025
**Status:** ✅ Production Ready
**Location:** Answer Review Page (`/r/{token}`)

---

## Overview

The ZIP Download feature allows users to download all media files (videos, audio) and attachments from both questions and answers as organized ZIP archives. This provides a convenient way to save all content locally in a single click.

---

## Features

### Download All - Answer Section
- **Location:** Answer section on `/r/` (AnswerReviewPage)
- **Button:** "Download All (ZIP)" with file count badge
- **Archive Name:** `answer-{questionId}.zip`
- **Contents:**
  - All video segments (downloaded from Cloudflare Stream)
  - All audio files (from R2)
  - All attachments (PDFs, documents, images)

### Download All - Question Section
- **Location:** Question section on `/r/` (AnswerReviewPage)
- **Button:** "Download All (ZIP)" with file count badge
- **Archive Name:** `question-{questionId}.zip`
- **Contents:**
  - All video segments (from question recording)
  - All audio files (from question recording)
  - All attachments uploaded with question

---

## Technical Implementation

### Dependencies

**JSZip Library:**
- Package: `jszip@^3.10.1`
- Purpose: Client-side ZIP file creation
- Docs: https://stuk.github.io/jszip/

### File Structure

```
/src/pages/AnswerReviewPage.jsx
  - downloadAsZip()          // Reusable ZIP creation function
  - handleDownloadAnswer()   // Answer download handler
  - handleDownloadQuestion() // Question download handler

/api/media/download-video.js // Video proxy endpoint (CORS fix)
/api/media/download-audio.js // Audio proxy endpoint (CORS fix)
```

### Core Function: downloadAsZip()

**Location:** `src/pages/AnswerReviewPage.jsx:198-304`

**Parameters:**
- `mediaAssets` - Array of media asset objects
- `attachments` - Array of attachment objects
- `zipFileName` - Name for the ZIP file

**Process:**
1. Initialize JSZip instance
2. Process media assets:
   - Identify video vs audio by metadata.mode or URL
   - For videos: Proxy through `/api/media/download-video`
   - For audio: Proxy through `/api/media/download-audio`
   - Generate sequential filenames (e.g., `part-1-video.mp4`)
3. Add all attachments with original filenames
4. Download files sequentially (prevents browser overload)
5. Generate ZIP blob
6. Trigger browser download
7. Clean up resources

**Error Handling:**
- Individual file failures are logged but don't stop ZIP creation
- Failed files are skipped, successful files are included
- User sees loading spinner during entire process
- Alert shown if all files fail

---

## Proxy Endpoints

### Why Proxies Are Needed

Cloudflare Stream and R2 URLs have CORS restrictions that prevent direct browser downloads when creating ZIP archives. The proxy endpoints fetch files server-side and stream them to the client with proper CORS headers.

### /api/media/download-video

**Purpose:** Proxy video downloads from Cloudflare Stream

**Method:** GET

**Query Parameters:**
- `url` - Cloudflare Stream download URL (must include `cloudflarestream.com`)

**Validation:**
- Only accepts Cloudflare Stream URLs
- Prevents abuse by URL validation

**Headers Set:**
- `Content-Type`: `video/mp4` (from Cloudflare response)
- `Content-Disposition`: `attachment` (force download)
- `Cache-Control`: `public, max-age=31536000` (1 year cache)

**Example:**
```
GET /api/media/download-video?url=https%3A%2F%2Fcustomer-xxx.cloudflarestream.com%2F{videoId}%2Fdownloads%2Fdefault.mp4
```

### /api/media/download-audio

**Purpose:** Proxy audio downloads from Cloudflare R2

**Method:** GET

**Query Parameters:**
- `url` - R2 audio file URL (must include `r2.dev` or `r2.cloudflarestorage.com`)

**Validation:**
- Only accepts R2 storage URLs
- Prevents abuse by URL validation

**Headers Set:**
- `Content-Type`: `audio/webm` (from R2 response)
- `Content-Disposition`: `attachment` (force download)
- `Cache-Control`: `public, max-age=31536000` (1 year cache)

**Example:**
```
GET /api/media/download-audio?url=https%3A%2F%2Fbucket.accountid.r2.cloudflarestorage.com%2Faudio%2Ffile.webm
```

---

## File Naming Convention

### Videos
- Pattern: `part-{index}-{mode}.mp4`
- Examples:
  - `part-1-video.mp4` (camera video)
  - `part-2-screen.mp4` (screen recording)
  - `part-3-screen-camera.mp4` (screen + camera)

### Audio
- Pattern: `part-{index}-audio.{ext}`
- Extensions: `.webm`, `.mp3`, `.wav` (detected from URL)
- Example: `part-1-audio.webm`

### Attachments
- Pattern: Original filename preserved
- Fallback: `attachment-{index}` if filename missing
- Examples:
  - `contract.pdf`
  - `screenshot.png`
  - `attachment-1` (fallback)

---

## UI/UX Details

### Loading State

**Visual Indicators:**
- Spinner animation replaces download icon
- Text changes to "Creating ZIP..."
- Button becomes disabled (prevents double-clicks)
- Shared loading state between both download buttons

**Implementation:**
```jsx
{isDownloading ? (
  <>
    <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
    <span>Creating ZIP...</span>
  </>
) : (
  <>
    <svg>...</svg>
    Download All (ZIP)
    <span className="badge">{fileCount}</span>
  </>
)}
```

### File Count Badge

**Display:**
- Shows total number of files (media + attachments)
- Appears as small rounded pill next to button text
- Gray background, subtle styling

**Calculation:**
```javascript
(mediaAssets?.length || 0) + (attachments?.length || 0)
```

### Button Visibility

**Answer Download Button:**
- Always visible in answer section
- Disabled if no media or attachments

**Question Download Button:**
- Conditionally rendered based on content
- Only appears if question has media or attachments
- Located in collapsible question section footer

```jsx
{(data.media_assets?.length > 0 || data.attachments?.length > 0) && (
  <div className="download-footer">
    <button onClick={handleDownloadQuestion}>...</button>
  </div>
)}
```

---

## Console Logging

The download process includes detailed console logging for debugging:

```
📦 Creating answer-123.zip...
📥 Downloading 5 files...
[1/5] Downloading: part-1-video.mp4
✅ Added to ZIP: part-1-video.mp4
[2/5] Downloading: part-2-audio.webm
✅ Added to ZIP: part-2-audio.webm
[3/5] Downloading: attachment.pdf
✅ Added to ZIP: attachment.pdf
🗜️ Generating ZIP file...
✅ answer-123.zip downloaded successfully!
```

**Error Logging:**
```
❌ Failed to download part-3-video.mp4: 404
❌ Error downloading attachment.pdf: TypeError: Failed to fetch
```

---

## Browser Compatibility

### Supported Browsers

✅ **Chrome/Edge** (v90+)
✅ **Firefox** (v88+)
✅ **Safari** (v14+)
✅ **Mobile Browsers** (iOS Safari, Chrome Mobile)

### Required APIs

- **Blob API** - ZIP file generation
- **Fetch API** - File downloads
- **URL.createObjectURL** - Temporary download links
- **JSZip** - ZIP compression (included via npm)

### Known Limitations

- Large files (>1GB total) may cause memory issues on mobile
- Sequential downloads prevent parallel fetching (intentional, prevents browser limits)
- Browser must allow automatic downloads

---

## Performance Considerations

### Download Strategy

**Sequential vs Parallel:**
- Files downloaded **one at a time** (sequential)
- Prevents browser connection limits (typically 6 concurrent)
- Provides clear progress logging
- Reduces memory pressure

### Memory Management

**Resource Cleanup:**
- ZIP blob created in memory
- Temporary download link created via `URL.createObjectURL`
- Link revoked immediately after download starts
- DOM element removed after click

```javascript
const link = document.createElement('a');
link.href = URL.createObjectURL(zipBlob);
link.download = zipFileName;
document.body.appendChild(link);
link.click();
document.body.removeChild(link);
URL.revokeObjectURL(link.href); // Clean up
```

### Caching

**Backend Proxy Caching:**
- Video/audio files cached for 1 year
- Reduces server load on repeated downloads
- Cache-Control header: `public, max-age=31536000`

---

## Security

### URL Validation

**Video Proxy:**
```javascript
if (!url.includes('cloudflarestream.com')) {
  return res.status(400).json({ error: 'Invalid URL - must be Cloudflare Stream URL' });
}
```

**Audio Proxy:**
```javascript
if (!url.includes('r2.dev') && !url.includes('r2.cloudflarestorage.com')) {
  return res.status(400).json({ error: 'Invalid URL - must be R2 storage URL' });
}
```

### Rate Limiting

**Current Status:** No rate limiting implemented

**Potential Abuse Vectors:**
- Excessive ZIP downloads
- Proxy endpoint abuse

**Future Consideration:**
- Add rate limiting to proxy endpoints
- Track download counts per IP/session
- Implement CAPTCHA for suspicious activity

---

## Testing

### Manual Test Cases

**✅ Test 1: Download Answer with Mixed Media**
1. Navigate to answer page with video + audio + attachments
2. Click "Download All (ZIP)" in answer section
3. Verify ZIP contains all files with correct names
4. Verify videos play correctly from ZIP
5. Verify audio files play correctly from ZIP
6. Verify attachments open correctly from ZIP

**✅ Test 2: Download Question with Media**
1. Navigate to answer page
2. Expand question section
3. Click "Download All (ZIP)" in question section
4. Verify ZIP contains all question files
5. Verify filename is `question-{id}.zip`

**✅ Test 3: Loading States**
1. Click download button
2. Verify spinner appears
3. Verify button is disabled during download
4. Verify both download buttons share loading state
5. Verify normal state returns after completion

**✅ Test 4: CORS Fix**
1. Open browser console
2. Click download button
3. Verify no CORS errors appear
4. Verify all files download successfully

**✅ Test 5: Error Handling**
1. Test with broken video URL (404)
2. Verify error logged in console
3. Verify other files still download
4. Verify ZIP still created with successful files

---

## Troubleshooting

### Issue: CORS Errors in Console

**Symptom:**
```
Access to fetch at 'https://customer-xxx.cloudflarestream.com/...'
blocked by CORS policy: No 'Access-Control-Allow-Origin' header
```

**Solution:**
- Ensure video/audio files are proxied through backend
- Check `/api/media/download-video` and `/api/media/download-audio` endpoints
- Verify URL encoding is correct

### Issue: ZIP File is Empty

**Symptom:** ZIP downloads but contains no files

**Debugging:**
1. Check browser console for download errors
2. Verify `mediaAssets` and `attachments` arrays are populated
3. Check network tab for failed proxy requests
4. Verify Cloudflare Stream downloads are enabled (see ENABLE-DOWNLOADS-MIGRATION.md)

**Common Causes:**
- Video downloads not enabled in Cloudflare Stream
- Proxy endpoints returning errors
- Invalid media asset URLs

### Issue: Download Button Doesn't Appear

**Symptom:** No download button visible in question/answer section

**Debugging:**
1. Check if media_assets array is empty
2. Check if attachments array is empty
3. Verify conditional rendering logic

**For Question Section:**
```jsx
{(data.media_assets?.length > 0 || data.attachments?.length > 0) && (
  // Button renders here
)}
```

### Issue: "Creating ZIP..." Stuck Forever

**Symptom:** Loading spinner never disappears

**Debugging:**
1. Check browser console for errors
2. Look for failed fetch requests in Network tab
3. Verify proxy endpoints are responding

**Common Causes:**
- Proxy endpoint crashed or timed out
- Network connectivity issues
- File too large causing memory issues

---

## Migration Notes

### Enabling Downloads for Existing Videos

Videos uploaded before October 16, 2025 may not have downloads enabled. See `docs/ENABLE-DOWNLOADS-MIGRATION.md` for the migration guide.

**Quick Check:**
```bash
curl -X POST https://mindpick.me/api/admin/enable-downloads-migration \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

---

## Future Enhancements

### Potential Improvements

1. **Progress Indicator**
   - Show "Downloading 3/5 files..." instead of generic spinner
   - Add progress bar for large downloads

2. **Parallel Downloads**
   - Download multiple files concurrently
   - Respect browser connection limits

3. **Download Queue**
   - Queue multiple ZIP downloads
   - Download in background, notify when ready

4. **Selective Downloads**
   - Checkboxes to select which files to include
   - "Download All" vs "Download Selected"

5. **Format Options**
   - Choose video quality/format
   - Convert audio to MP3 before download

6. **Cloud Export**
   - Export to Google Drive
   - Export to Dropbox
   - Generate shareable link

---

## Related Documentation

- **Migration Guide:** `docs/ENABLE-DOWNLOADS-MIGRATION.md`
- **Upload System:** `docs/upload-system-master.md`
- **Cloudflare Integration:** `docs/mindpick-technical-architecture.md`
- **Main Documentation:** `docs/CLAUDE.md`

---

## Changelog

### October 16, 2025 - Initial Release

**Added:**
- ZIP download functionality for answers
- ZIP download functionality for questions
- Video download proxy endpoint
- Audio download proxy endpoint (already existed, extended for ZIP)
- Loading states and file count badges
- Sequential download with error handling

**Fixed:**
- CORS errors when downloading videos from Cloudflare Stream
- Mixed media downloads (video + audio + attachments)

**Technical Details:**
- Library: JSZip 3.10.1
- Files: 2 modified, 1 created
- Commits:
  - `b386dbf` - Add ZIP download functionality
  - `cb50573` - Fix CORS error for video downloads

---

**Last Updated:** October 16, 2025
**Status:** ✅ Production Ready
**Maintainer:** Development Team
