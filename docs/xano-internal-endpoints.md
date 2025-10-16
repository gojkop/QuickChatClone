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

Unified endpoint to fetch all media records for cleanup operations. Returns both media assets and avatar URLs in a single call.

**Query Parameters:**
- `x_api_key` (required) - Internal API key for authentication

**Response:**
```json
{
  "media": [
    {
      "id": 123,
      "asset_id": "abc123",
      "provider": "cloudflare_stream",
      "owner_type": "question",
      "owner_id": 456,
      "created_at": "2025-10-14T10:00:00.000Z"
    }
  ],
  "avatars": [
    {
      "avatar_url": "https://pub-xxx.r2.dev/profiles/123456-abc.webp"
    }
  ],
  "question_attachments": [
    {
      "attachments": "[{\"url\":\"https://pub-xxx.r2.dev/question-attachments/123.pdf\",\"name\":\"file.pdf\"}]"
    }
  ],
  "answer_attachments": [
    {
      "attachments": "[{\"url\":\"https://pub-xxx.r2.dev/question-attachments/456.pdf\",\"name\":\"answer.pdf\"}]"
    }
  ],
  "magic_link_tokens": [
    {
      "id": 1,
      "email": "user@example.com",
      "token": "uuid-here",
      "created_at": 1705334400000,
      "expires_at": 1705335300000,
      "used": false,
      "used_at": 0
    }
  ]
}
```

**Used by:** `/api/cron/cleanup-orphaned-media.js`

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

---

### `DELETE /internal/magic-link-token`

Delete a magic link token record from the database.

**Query Parameters:**
- `x_api_key` (required) - Internal API key for authentication
- `token_id` (required) - ID of the token to delete

**Response:**
```json
{
  "success": true
}
```

**Used by:** `/api/cron/cleanup-orphaned-media.js` (token cleanup)

## Cron Job

The unified cleanup script `/api/cron/cleanup-orphaned-media.js` runs daily at 3:00 AM UTC and performs four cleanup operations:

**Part 1: Media Assets (Bidirectional Check)**
- **Part 1A (DB → Cloudflare):** Validates database records, checks if media is older than 48 hours, verifies parent exists, deletes orphaned media from Cloudflare and Xano
- **Part 1B (Cloudflare → DB):** Lists all Cloudflare files (Stream videos, R2 audio), compares against database, deletes files not in database

**Part 2: Profile Pictures**
- Lists all files in R2 under `profiles/` prefix
- Fetches all avatar URLs from `expert_profile` table
- Compares files against active URLs
- Deletes orphaned profile pictures from R2

**Part 3: Question/Answer Attachments**
- Lists all files in R2 under `question-attachments/` prefix
- Fetches all attachments JSON from both `question` and `answer` tables
- Parses JSON arrays to extract attachment URLs from both sources
- Compares files against active attachments
- Deletes orphaned attachment files from R2

**Part 4: Magic Link Tokens**
- Fetches all magic_link_tokens from database
- Deletes tokens matching cleanup criteria:
  - Expired tokens older than 7 days
  - Used tokens older than 30 days
  - Unused tokens older than 30 days
- Preserves recent tokens for debugging and audit trail

**Notification:** Sends email to admin if error rate exceeds 50%

## Xano Implementation Guide

### 1. Create GET /internal/media

**Function Stack:**

1. **Get Query Parameters**
   - `x_api_key` (text)

2. **Authenticate**
   ```javascript
   if (x_api_key !== env.XANO_INTERNAL_API_KEY) {
     return response({
       error: "Unauthorized"
     }, 401)
   }
   ```

3. **Query Records**
   - Variable `all_media`: Query all records from `media_assets` table
   - Variable `all_avatars`: Query all records from `expert_profile` table where `avatar_url IS NOT NULL`
   - Variable `all_question_attachments`: Query all records from `question` table where `attachments IS NOT NULL`
   - Variable `all_answer_attachments`: Query all records from `answer` table where `attachments IS NOT NULL`
   - Variable `all_magic_link_tokens`: Query all records from `magic_link_tokens` table

4. **Return Combined Response**
   ```javascript
   return {
     media: all_media,
     avatars: all_avatars,
     question_attachments: all_question_attachments,
     answer_attachments: all_answer_attachments,
     magic_link_tokens: all_magic_link_tokens
   }
   ```

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

### 3. Create DELETE /internal/magic-link-token

**Function Stack:**

1. **Get Query Parameters**
   - `x_api_key` (text)
   - `token_id` (integer)

2. **Authenticate**
   ```javascript
   if (x_api_key !== env.XANO_INTERNAL_API_KEY) {
     return response({
       error: "Unauthorized"
     }, 401)
   }
   ```

3. **Delete Record**
   - Delete from `magic_link_tokens` table where `id = token_id`

4. **Return Success**
   ```javascript
   return { success: true }
   ```

## Testing

Test the endpoints using curl:

```bash
# Test media endpoint (returns both media and avatars)
curl "https://your-xano-url/api:BQW1GS7L/internal/media?x_api_key=YOUR_KEY"

# Test media_asset delete endpoint
curl -X DELETE "https://your-xano-url/api:BQW1GS7L/internal/media_asset?x_api_key=YOUR_KEY&media_asset_id=123"

# Test magic_link_token delete endpoint
curl -X DELETE "https://your-xano-url/api:BQW1GS7L/internal/magic-link-token?x_api_key=YOUR_KEY&token_id=456"

# Test cleanup script
curl -X POST "https://quickchat-dev.vercel.app/api/cron/cleanup-orphaned-media" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```
