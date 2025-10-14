# Xano Internal Endpoints

Internal endpoints are used by cron jobs and other automated processes that need to access Xano data without user authentication.

## Authentication

All internal endpoints:
- Are located in the **Public API** group in Xano
- Accept `x_api_key` as a query parameter
- Validate the API key matches `XANO_INTERNAL_API_KEY` environment variable
- Return 401 if authentication fails

## Endpoints

### `GET /internal/media`

Unified endpoint to fetch media records for cleanup operations.

**Query Parameters:**
- `x_api_key` (required) - Internal API key for authentication
- `type` (required) - Type of media to fetch: `assets` or `avatars`

**Type: `assets`**

Returns all records from the `media_assets` table.

**Response:**
```json
[
  {
    "id": 123,
    "asset_id": "abc123",
    "provider": "cloudflare_stream",
    "owner_type": "question",
    "owner_id": 456,
    "created_at": "2025-10-14T10:00:00.000Z",
    ...
  }
]
```

**Used by:** `/api/cron/cleanup-orphaned-media.js` (Part 1)

**Type: `avatars`**

Returns all non-null avatar URLs from the `expert_profile` table.

**Response:**
```json
[
  {
    "avatar_url": "https://pub-xxx.r2.dev/profiles/123456-abc.webp"
  }
]
```

**Used by:** `/api/cron/cleanup-orphaned-media.js` (Part 2)

---

### `DELETE /internal/media_asset`

Delete a media asset record from the database.

**Query Parameters:**
- `x_api_key` (required) - Internal API key for authentication
- `media_asset_id` (required) - ID of the media asset to delete

**Response:**
```json
{
  "success": true
}
```

**Used by:** `/api/cron/cleanup-orphaned-media.js` (database cleanup)

## Cron Job

The unified cleanup script `/api/cron/cleanup-orphaned-media.js` runs daily at 3:00 AM UTC and performs two cleanup operations:

**Part 1: Media Assets**
- Fetches all records from `media_assets` table
- Checks if media is older than 48 hours
- Verifies if parent question/answer still exists
- Deletes orphaned media from Cloudflare (Stream/R2) and Xano

**Part 2: Profile Pictures**
- Lists all files in R2 under `profiles/` prefix
- Fetches all avatar URLs from `expert_profile` table
- Compares files against active URLs
- Deletes orphaned profile pictures from R2

**Notification:** Sends email to admin if error rate exceeds 50%

## Xano Implementation Guide

### 1. Create GET /internal/media

**Function Stack:**

1. **Get Query Parameters**
   - `x_api_key` (text)
   - `type` (text)

2. **Authenticate**
   ```javascript
   if (x_api_key !== env.XANO_INTERNAL_API_KEY) {
     return response({
       error: "Unauthorized"
     }, 401)
   }
   ```

3. **Branch on type parameter**

   **If type === "assets":**
   - Query all records from `media_assets` table
   - Return all records

   **If type === "avatars":**
   - Query all records from `expert_profile` table where `avatar_url IS NOT NULL`
   - Return records (or map to return only avatar_url field)

   **Else:**
   - Return error: "Invalid type parameter. Must be 'assets' or 'avatars'"

### 2. Create DELETE /internal/media_asset

**Function Stack:**

1. **Get Query Parameters**
   - `x_api_key` (text)
   - `media_asset_id` (integer)

2. **Authenticate**
   ```javascript
   if (x_api_key !== env.XANO_INTERNAL_API_KEY) {
     return response({
       error: "Unauthorized"
     }, 401)
   }
   ```

3. **Delete Record**
   - Delete from `media_assets` table where `id = media_asset_id`

4. **Return Success**
   ```javascript
   return { success: true }
   ```

## Testing

Test the endpoints using curl:

```bash
# Test assets endpoint
curl "https://your-xano-url/api:BQW1GS7L/internal/media?x_api_key=YOUR_KEY&type=assets"

# Test avatars endpoint
curl "https://your-xano-url/api:BQW1GS7L/internal/media?x_api_key=YOUR_KEY&type=avatars"

# Test delete endpoint
curl -X DELETE "https://your-xano-url/api:BQW1GS7L/internal/media_asset?x_api_key=YOUR_KEY&media_asset_id=123"
```
