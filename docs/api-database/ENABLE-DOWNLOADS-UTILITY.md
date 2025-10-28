# Enable Downloads Utility

**Purpose:** Retroactively enable downloads for all Cloudflare Stream videos that were uploaded before the automatic enable-downloads fix.

**Status:** Ready to use

---

## Problem

Videos uploaded before the `enable-downloads` fix don't have downloads enabled, causing 424 errors when users try to download them.

**Symptoms:**
- `❌ Failed to download part-X-video.mp4: 424` errors in browser console
- ZIP download fails for video segments
- Videos play fine but can't be downloaded

---

## Solution

Run the `enable-all-downloads` utility script to bulk-enable downloads for all Cloudflare Stream videos.

### Prerequisites

1. **Environment variables must be set:**
   ```bash
   CLOUDFLARE_ACCOUNT_ID=your_account_id
   CLOUDFLARE_STREAM_API_TOKEN=your_api_token
   ```

2. **Node.js installed** (v18+)

### Usage

#### Option 1: Via curl (easiest - no local setup needed)

```bash
curl -X POST "https://your-domain.vercel.app/api/utils/enable-all-downloads-endpoint?x_api_key=YOUR_INTERNAL_API_KEY"
```

Or with header:
```bash
curl -X POST \
  -H "x-api-key: YOUR_INTERNAL_API_KEY" \
  https://your-domain.vercel.app/api/utils/enable-all-downloads-endpoint
```

**Security:** Requires `XANO_INTERNAL_API_KEY` for authentication.

#### Option 2: Via npm script (local execution)

```bash
npm run enable-downloads
```

#### Option 3: Direct Node.js execution

```bash
node api/utils/enable-all-downloads.js
```

---

## What It Does

1. **Fetches all videos** from your Cloudflare Stream account
2. **Checks each video**:
   - ✅ If downloads already enabled → Skip
   - ⏳ If video not ready (still processing) → Skip
   - 🔓 If video ready but downloads not enabled → Enable downloads
3. **Rate limits** requests (500ms between videos)
4. **Prints summary** of results

---

## Expected Output

### Via curl (API endpoint):

```json
{
  "success": true,
  "message": "Processed 45 videos. Newly enabled: 12",
  "results": {
    "total": 45,
    "alreadyEnabled": 30,
    "newlyEnabled": 12,
    "notReady": 2,
    "failed": 1
  },
  "details": [
    { "videoId": "abc123def456", "status": "already_enabled" },
    { "videoId": "xyz789ghi012", "status": "newly_enabled" },
    { "videoId": "mno345pqr678", "status": "not_ready", "videoStatus": "inprogress" },
    { "videoId": "stu901vwx234", "status": "failed", "error": "Rate limit exceeded" }
  ]
}
```

### Via npm/node (CLI):

```
🚀 Starting bulk download enablement for Cloudflare Stream videos

📋 Fetching all videos from Cloudflare Stream...
✅ Found 45 videos

[1/45] Checking video: abc123def456
  ✅ Downloads already enabled

[2/45] Checking video: xyz789ghi012
  🔓 Enabling downloads...
  ✅ Downloads enabled successfully

[3/45] Checking video: mno345pqr678
  ⏳ Video not ready (status: inprogress), skipping

...

============================================================
📊 SUMMARY
============================================================
Total videos:          45
Already enabled:       30 ✅
Newly enabled:         12 🎉
Not ready (skipped):   2 ⏳
Failed:                1 ❌
============================================================

✅ Successfully enabled downloads for 12 videos!
⏳ 2 videos are still processing. Run this script again later.
```

---

## Troubleshooting

### Error: Missing Cloudflare credentials

**Symptom:**
```
❌ Missing Cloudflare credentials in environment variables
```

**Fix:**
- Check `.env` file has `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_STREAM_API_TOKEN`
- Make sure environment variables are loaded (use `dotenv` if needed)

### Videos show "not ready"

**Symptom:**
```
⏳ Video not ready (status: inprogress), skipping
```

**Explanation:**
- Video is still being processed by Cloudflare
- Downloads can only be enabled for videos with status = "ready"

**Fix:**
- Wait a few minutes for videos to finish processing
- Run the script again

### Some videos failed

**Symptom:**
```
❌ Failed: [error message]
```

**Common causes:**
1. **Video in error state** - Video upload/processing failed
2. **Rate limiting** - Too many API requests
3. **Permission issue** - API token doesn't have Stream edit permissions

**Fix:**
- Check Cloudflare Stream dashboard for video status
- Verify API token has "Stream: Edit" permission
- Re-run script after a few minutes

---

## Manual Video Fix

To enable downloads for a single specific video:

### Via Cloudflare Dashboard:

1. Go to https://dash.cloudflare.com
2. Navigate to **Stream** → **Videos**
3. Click on the video
4. Enable **"Allow downloads"** toggle
5. Click **Save**

### Via API:

```bash
curl -X POST "https://api.cloudflare.com/client/v4/accounts/{account_id}/stream/{video_id}/downloads" \
  -H "Authorization: Bearer {api_token}" \
  -H "Content-Type: application/json" \
  -d '{}'
```

---

## Frequency

### When to run:

1. **After deploying the enable-downloads fix** - To fix all existing videos
2. **If downloads were disabled for a period** - To catch any videos uploaded during that time
3. **On demand** - If users report 424 download errors

### Not needed for:

- **New video uploads** - The automatic enable-downloads endpoint handles them
- **Videos that already have downloads enabled** - Script will skip them

---

## Performance

- **Speed:** ~500ms per video (rate limited)
- **100 videos:** ~50 seconds
- **1000 videos:** ~8 minutes

**Optimization:** Can be sped up by reducing the rate limit delay, but be careful of API rate limits.

---

## Related Files

- **Utility script:** `api/utils/enable-all-downloads.js`
- **Automatic endpoint:** `api/media/enable-downloads.js`
- **Bug fix commit:** `e651749` - "Fix: Wait for Cloudflare Stream video processing before enabling downloads"

---

## Future Improvements

Potential enhancements:

1. **Background job** - Run automatically on a schedule (cron)
2. **Webhook integration** - Enable downloads when Cloudflare sends "ready" webhook
3. **Retry queue** - Store failed videos and retry them later
4. **Selective processing** - Only process videos from specific date range
5. **Progress persistence** - Resume from where it left off if interrupted

---

**Document Version:** 1.0
**Last Updated:** October 28, 2025
**Status:** Ready for Production Use
