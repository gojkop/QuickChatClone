# Enable Downloads Migration Guide

**Date Created:** October 16, 2025
**Date Completed:** October 16, 2025
**Purpose:** Enable downloads for all existing Cloudflare Stream videos
**Status:** ✅ COMPLETED - Migration successful (19/19 videos)

---

## Overview

**⚠️ NOTE: This migration has been completed successfully and the migration code has been removed.**

This document is kept for historical reference only.

### Migration Results (October 16, 2025)

- **Total videos processed:** 19
- **Successfully enabled:** 19
- **Failed:** 0
- **Success rate:** 100%

All existing Cloudflare Stream videos now have downloads enabled. Videos uploaded after October 16, 2025 automatically have downloads enabled at upload time.

---

## Historical Context

This migration enabled video downloads for all existing Cloudflare Stream videos in the database. Videos uploaded after the download feature was implemented (October 16, 2025) automatically have downloads enabled, but older videos needed this one-time migration.

---

## Why This Is Needed

**The Problem:**
- Cloudflare Stream videos uploaded before October 16, 2025 don't have downloads enabled
- When users click "Download All" on answer pages, they get a 404 error
- The download URL `https://customer-xxx.cloudflarestream.com/{video_id}/downloads/default.mp4` returns 404

**The Solution:**
- Call Cloudflare API to enable downloads for each existing video
- After enablement, the downloads endpoint becomes available
- Future uploads automatically have downloads enabled

---

## Running the Migration on Production

### Method 1: Via Vercel Function (Recommended)

**Endpoint:** `https://mindpick.me/api/admin/enable-downloads-migration`

**Step 1: Get your CRON_SECRET**

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Find `CRON_SECRET` (or create one if it doesn't exist)
3. Copy the value

**Step 2: Run the migration**

```bash
curl -X POST https://mindpick.me/api/admin/enable-downloads-migration \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -H "Content-Type: application/json"
```

Replace `YOUR_CRON_SECRET` with the actual value from Vercel.

**Step 3: Review the response**

You'll get a detailed JSON response:

```json
{
  "success": true,
  "message": "Migration complete: 32 succeeded, 0 failed",
  "stats": {
    "totalAssets": 45,
    "streamVideos": 32,
    "processed": 32,
    "succeeded": 32,
    "failed": 0,
    "successRate": 100
  },
  "videos": [
    {
      "videoId": "74e69d29a320be3740da2cfdcac51afa",
      "mediaAssetId": 123,
      "status": "success"
    },
    ...
  ]
}
```

### Method 2: Via Local Script (Alternative)

If you prefer to run locally with production credentials:

**Step 1: Set environment variables**

```bash
export XANO_PUBLIC_API_URL="https://xlho-4syv-navp.n7e.xano.io/api:BQW1GS7L"
export XANO_INTERNAL_API_KEY="your-internal-api-key"
export CLOUDFLARE_ACCOUNT_ID="your-account-id"
export CLOUDFLARE_STREAM_API_TOKEN="your-stream-token"
```

**Step 2: Run the script**

```bash
node api/scripts/enable-downloads-for-all-videos.js
```

---

## What Happens During Migration

1. **Fetch all media assets** from Xano database
2. **Filter for Cloudflare Stream videos** (excludes R2 audio files)
3. **For each video:**
   - Call `POST /accounts/{account_id}/stream/{video_id}/downloads`
   - Wait 200ms (rate limit protection)
   - Log success or error
4. **Return summary** with detailed results

---

## Expected Results

### Success Response

```json
{
  "success": true,
  "message": "Migration complete: 32 succeeded, 0 failed",
  "stats": {
    "totalAssets": 45,
    "streamVideos": 32,
    "processed": 32,
    "succeeded": 32,
    "failed": 0,
    "successRate": 100
  }
}
```

### Partial Success Response

```json
{
  "success": true,
  "message": "Migration complete: 30 succeeded, 2 failed",
  "stats": {
    "totalAssets": 45,
    "streamVideos": 32,
    "processed": 32,
    "succeeded": 30,
    "failed": 2,
    "successRate": 94
  },
  "errors": [
    {
      "videoId": "abc123...",
      "mediaAssetId": 456,
      "error": "Video not found"
    }
  ]
}
```

---

## Troubleshooting

### Error: "Unauthorized"

**Problem:** Invalid or missing authorization token

**Solution:**
- Verify you're using the correct `CRON_SECRET` from Vercel
- Check the Authorization header format: `Bearer YOUR_TOKEN`
- Make sure there are no extra spaces in the token

### Error: "Configuration error"

**Problem:** Missing Xano credentials in Vercel environment

**Solution:**
1. Go to Vercel → Settings → Environment Variables
2. Verify these are set:
   - `XANO_PUBLIC_API_URL`
   - `XANO_INTERNAL_API_KEY`
   - `CLOUDFLARE_ACCOUNT_ID`
   - `CLOUDFLARE_STREAM_API_TOKEN`

### Some Videos Fail with "Already enabled"

**Problem:** Downloads already enabled for these videos

**Solution:** This is normal and expected! The script continues with other videos.

### Error: "Function timeout"

**Problem:** Too many videos to process in 5 minutes

**Solution:**
- The function has a 5-minute timeout (300 seconds)
- With 200ms delay between videos, you can process ~1400 videos
- If you have more, run the migration multiple times (it's idempotent)

### Verify Downloads Work

After running the migration, test a download:

1. Go to an answer page: `https://mindpick.me/r/{token}`
2. Click "Download All"
3. Video should download as MP4 instead of showing 404

---

## Security

### Authentication

The endpoint is protected by:
- **Bearer token authentication** using `CRON_SECRET`
- **POST method only** (no GET access)
- **Server-side credential validation**

### Rate Limiting

- 200ms delay between video API calls
- Prevents hitting Cloudflare rate limits
- Safe for production use

### Idempotent

- Running the migration multiple times is safe
- Already-enabled videos are skipped gracefully
- No duplicate operations

---

## Monitoring

### Vercel Logs

Check migration progress in real-time:

1. Go to Vercel Dashboard → Your Project → Functions
2. Find `/api/admin/enable-downloads-migration`
3. Click to view logs
4. See detailed progress for each video

### Log Output Example

```
🚀 Starting downloads enablement migration
📡 Fetching all media assets from Xano...
✅ Found 45 total media assets
🎥 Found 32 Cloudflare Stream videos
📋 Processing 32 videos...
[1/32] Enabling downloads for video: 74e69d29a320be3740da2cfdcac51afa
✅ Downloads enabled for video: 74e69d29a320be3740da2cfdcac51afa
[2/32] Enabling downloads for video: abc123def456...
...
✅ Migration complete
   Succeeded: 32/32
   Failed: 0/32
```

---

## Post-Migration Verification

### Test the Fix

1. **Find a problematic video:**
   - Video ID: `74e69d29a320be3740da2cfdcac51afa` (from your example)
   - Answer page: `https://mindpick.me/r/HY48yc6aOl8xug6LvgM8Eib5br0BLFhB`

2. **Click "Download All"**
   - Should now download the video as MP4
   - No more 404 errors

3. **Test audio downloads:**
   - Audio files should also be included
   - They download directly from R2 (no migration needed)

### Check Video Count

Compare the migration stats with your database:

```sql
-- In Xano: Count all Cloudflare Stream videos
SELECT COUNT(*) FROM media_assets
WHERE provider = 'cloudflare_stream'
```

Should match `stats.streamVideos` in the migration response.

---

## Rollback

**Good news:** This migration is non-destructive!

- Enabling downloads doesn't modify videos
- No data is deleted or changed
- Videos still play normally in the player
- Rollback is not needed

If you want to **disable** downloads for some reason:

```bash
# For each video
curl -X DELETE "https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/stream/{VIDEO_ID}/downloads" \
  -H "Authorization: Bearer {API_TOKEN}"
```

---

## Future Videos

**Automatic enablement:**

All videos uploaded after October 16, 2025 automatically have downloads enabled via:

1. **Direct uploads:** Set `downloadedVideoAllowed: true` in upload request
2. **Backend uploads:** Call `enableDownloads()` after upload completes

No manual intervention needed for new videos! 🎉

---

## Summary

### Before Migration
❌ Old videos: 404 on download
✅ New videos: Downloads work
❌ Audio: Not included in downloads

### After Migration
✅ Old videos: Downloads work
✅ New videos: Downloads work
✅ Audio: Included in downloads

### Command to Run
```bash
curl -X POST https://mindpick.me/api/admin/enable-downloads-migration \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

---

## Support

**If you encounter issues:**

1. Check Vercel function logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test with a single video manually using curl
4. Review the errors array in the response JSON

**Manual enable for a single video:**

```bash
curl -X POST "https://api.cloudflare.com/client/v4/accounts/YOUR_ACCOUNT_ID/stream/74e69d29a320be3740da2cfdcac51afa/downloads" \
  -H "Authorization: Bearer YOUR_STREAM_TOKEN" \
  -H "Content-Type: application/json"
```

---

**Last Updated:** October 16, 2025
**Status:** ✅ Ready to run on production
