# Migration Scripts

This directory contains one-time migration scripts for database and media updates.

## Enable Downloads for Existing Videos

**Script:** `enable-downloads-for-all-videos.js`

**Purpose:** Enables downloads for all existing Cloudflare Stream videos in the database. This is needed because videos uploaded before the download feature was implemented don't have downloads enabled.

### Prerequisites

Make sure these environment variables are set:
- `XANO_PUBLIC_API_URL` - Xano Public API base URL
- `XANO_INTERNAL_API_KEY` - Internal API key for Xano
- `CLOUDFLARE_ACCOUNT_ID` - Your Cloudflare account ID
- `CLOUDFLARE_STREAM_API_TOKEN` - Cloudflare Stream API token

### Running the Script

From the project root directory:

```bash
node api/scripts/enable-downloads-for-all-videos.js
```

### What It Does

1. Fetches all `media_assets` from Xano database
2. Filters for Cloudflare Stream videos only
3. For each video, calls Cloudflare API to enable downloads:
   ```
   POST https://api.cloudflare.com/client/v4/accounts/{account_id}/stream/{video_id}/downloads
   ```
4. Logs results for each video (success/failure)
5. Provides summary at the end

### Expected Output

```
🚀 Starting downloads enablement migration

============================================================
📡 Fetching all media assets from Xano...
✅ Found 45 total media assets
🎥 Found 32 Cloudflare Stream videos

📋 Processing 32 videos...

[1/32] Enabling downloads for video: 74e69d29a320be3740da2cfdcac51afa
✅ Downloads enabled for video: 74e69d29a320be3740da2cfdcac51afa
[2/32] Enabling downloads for video: abc123def456...
✅ Downloads enabled for video: abc123def456...
...

============================================================
📊 MIGRATION SUMMARY
============================================================
✅ Successfully enabled: 32/32
❌ Failed: 0/32

✅ Migration complete!
```

### Troubleshooting

**Error: "Cannot find module"**
- Make sure you're running from the project root
- Check that `api/lib/cloudflare/stream.js` exists

**Error: "Cloudflare Stream credentials not configured"**
- Verify environment variables are set
- Check `.env` file or Vercel environment variables

**Error: 404 or 403 from Cloudflare**
- Verify your `CLOUDFLARE_STREAM_API_TOKEN` has correct permissions
- Check that `CLOUDFLARE_ACCOUNT_ID` is correct

**Some videos fail with "Already enabled"**
- This is normal - the video already has downloads enabled
- The script will continue with other videos

### Manual Fallback

If you need to enable downloads for a specific video manually:

```bash
curl -X POST "https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/stream/{VIDEO_ID}/downloads" \
  -H "Authorization: Bearer {API_TOKEN}" \
  -H "Content-Type: application/json"
```

Replace:
- `{ACCOUNT_ID}` - Your Cloudflare account ID
- `{VIDEO_ID}` - The video UID from Cloudflare Stream
- `{API_TOKEN}` - Your Cloudflare Stream API token

### Notes

- **Run this script only once** - it's designed for migrating existing videos
- **New videos** uploaded after the feature implementation will automatically have downloads enabled
- The script includes a 200ms delay between API calls to avoid rate limiting
- Downloads are enabled for **all videos**, not just answers - this is intentional for flexibility
