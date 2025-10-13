# Xano API Endpoints Documentation

Complete reference for all Xano endpoints used in QuickChat application.

## Overview

QuickChat uses three Xano API groups:

1. **Authentication API** (`api:3B14WLbJ`) - Private, authenticated endpoints
   - Base URL: `https://xlho-4syv-navp.n7e.xano.io/api:3B14WLbJ`
   - Endpoints: /answer, /me/*, /expert/*, /media_asset, /question/hidden, /upload/*

2. **Public API** (`api:BQW1GS7L`) - Public, unauthenticated endpoints
   - Base URL: `https://xlho-4syv-navp.n7e.xano.io/api:BQW1GS7L`
   - Endpoints: /question, /public/*, /auth/linkedin/*, /internal/*, /feedback, /review/*

3. **Google OAuth API** (`api:[oauth-group]`) - Google authentication
   - Endpoints: /oauth/google/*

---

## Authentication Endpoints

### Google OAuth

#### `GET /oauth/google/init`
Initialize Google OAuth flow.

**API Group:** Google OAuth API
**Authentication:** None (public)
**Response:**
```json
{
  "url": "https://accounts.google.com/o/oauth2/v2/auth?..."
}
```

#### `GET /oauth/google/continue`
Complete Google OAuth flow and create/login user.

**API Group:** Google OAuth API
**Parameters:**
- `code` (query) - OAuth authorization code from Google

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "email": "user@example.com",
  "name": "John Doe"
}
```

### LinkedIn OAuth

#### `POST /auth/linkedin/create_user`
Create or update user from LinkedIn OAuth data.

**API Group:** Public API
**Authentication:** Internal API key
**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "x_api_key": "internal_api_key",
  "linkedin_id": "abc123",
  "email": "user@example.com",
  "name": "John Doe",
  "given_name": "John",
  "family_name": "Doe",
  "picture": "https://..."
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "email": "user@example.com",
  "name": "John Doe"
}
```

**Notes:**
- LinkedIn OAuth is handled entirely by Vercel (not Xano OAuth addon)
- This endpoint only creates/updates user and returns auth token

---

## User Endpoints

### `POST /me/bootstrap`
Bootstrap user data after authentication.

**API Group:** Authentication API
**Authentication:** Required (Bearer token)
**Response:**
```json
{
  "user": {
    "id": 33,
    "email": "user@example.com",
    "name": "John Doe",
    "expert_specialty": "...",
    "expert_price": 50
  },
  "expert_profile": {
    "id": 107,
    "handle": "johndoe",
    "bio": "...",
    "status": "SET"
  }
}
```

### `GET /me/profile`
Get current user's profile information.

**API Group:** Authentication API
**Authentication:** Required
**Response:**
```json
{
  "id": 33,
  "email": "user@example.com",
  "name": "John Doe",
  "expert_profile": {
    "id": 107,
    "handle": "johndoe",
    "bio": "Expert in...",
    "price_cents": 5000,
    "currency": "USD",
    "sla_hours": 24,
    "avatar_url": "https://...",
    "accepting_questions": true
  }
}
```

### `PUT /me/profile`
Update current user's profile.

**API Group:** Authentication API
**Authentication:** Required
**Request Body:**
```json
{
  "name": "John Doe",
  "expert_specialty": "Web Development",
  "expert_price": 75,
  "bio": "10 years experience..."
}
```

**Response:**
```json
{
  "success": true,
  "data": { /* updated profile */ }
}
```

### `GET /me/questions`
Get questions for authenticated user (expert's question queue).

**API Group:** Authentication API
**Authentication:** Required
**Query Parameters:**
- `status` (optional) - Filter by status: 'paid', 'answered', 'draft'

**Response:**
```json
[
  {
    "id": 118,
    "expert_profile_id": 107,
    "payer_email": "asker@example.com",
    "price_cents": 500,
    "currency": "USD",
    "status": "paid",
    "title": "How to...",
    "text": "Question details...",
    "created_at": 1760349011047,
    "attachments": "[...]",
    "media_asset_id": 97
  }
]
```

---

## Expert Profile Endpoints

### `GET /public/profile`
Get public expert profile by handle.

**API Group:** Public API
**Authentication:** None (public)
**Query Parameters:**
- `handle` (required) - Expert's unique handle

**Response:**
```json
{
  "expert_profile": {
    "id": 107,
    "handle": "johndoe",
    "price_cents": 5000,
    "currency": "USD",
    "sla_hours": 24,
    "bio": "Expert in...",
    "status": "SET",
    "public": true,
    "user_id": 33,
    "avatar_url": "https://...",
    "professional_title": "Senior Developer",
    "tagline": "Building amazing things",
    "accepting_questions": true
  },
  "user": {
    "name": "John Doe"
  }
}
```

**Notes:**
- User email is NOT included in public profile (security)
- Use internal endpoint to get email

### `POST /expert/profile/availability`
Toggle expert's accepting_questions status.

**API Group:** Authentication API
**Authentication:** Required
**Request Body:**
```json
{
  "accepting_questions": true
}
```

**Response:**
```json
{
  "success": true,
  "accepting_questions": true
}
```

### `POST /upload/profile-picture`
Upload expert profile picture.

**API Group:** Authentication API
**Authentication:** Required
**Request Body:**
```json
{
  "image_data": "data:image/png;base64,iVBORw0KGgo...",
  "filename": "avatar.png"
}
```

**Response:**
```json
{
  "success": true,
  "avatar_url": "https://pub-...r2.dev/profiles/..."
}
```

---

## Question Endpoints

### `POST /question`
Create new question record in database.

**API Group:** Public API
**Authentication:** None (public - payment creates question)
**Request Body:**
```json
{
  "expert_profile_id": 107,
  "payer_email": "asker@example.com",
  "price_cents": 500,
  "currency": "USD",
  "status": "paid",
  "sla_hours_snapshot": 24,
  "title": "How to...",
  "text": "Question details...",
  "attachments": "[{\"name\":\"file.pdf\",\"url\":\"https://...\"}]"
}
```

**Response:**
```json
{
  "id": 118,
  "expert_profile_id": 107,
  "payer_email": "asker@example.com",
  "status": "paid",
  "created_at": 1760349011047,
  "title": "How to...",
  "text": "Question details...",
  "attachments": "[...]"
}
```

**Notes:**
- Called by `/api/questions/create` endpoint (Vercel proxy)
- Email notification sent to expert after creation

### `GET /question/{id}`
Get question details by ID.

**API Group:** Public API
**Authentication:** Required (expert must own the question)
**URL Parameters:**
- `id` - Question ID

**Response:**
```json
{
  "id": 118,
  "expert_profile_id": 107,
  "payer_email": "asker@example.com",
  "payer_first_name": "Jane",
  "payer_last_name": "Smith",
  "price_cents": 500,
  "currency": "USD",
  "status": "paid",
  "title": "How to...",
  "text": "Question details...",
  "created_at": 1760349011047,
  "answered_at": 0,
  "attachments": "[...]",
  "media_asset_id": 97
}
```

### `POST /question/hidden`
Toggle question hidden status.

**API Group:** Authentication API
**Authentication:** Required
**Request Body:**
```json
{
  "question_id": 118,
  "hidden": true
}
```

**Response:**
```json
{
  "success": true,
  "hidden": true
}
```

---

## Answer Endpoints

### `POST /answer`
Create answer record in database.

**API Group:** Authentication API
**Authentication:** Required (expert)
**Request Body:**
```json
{
  "question_id": 118,
  "user_id": 33,
  "text_response": "Answer text...",
  "media_asset_id": 99,
  "attachments": "[{\"uid\":\"...\",\"url\":\"https://...\"}]"
}
```

**Response:**
```json
{
  "id": 87,
  "question_id": 118,
  "user_id": 33,
  "text_response": "Answer text...",
  "media_asset_id": 99,
  "attachments": "[...]",
  "created_at": 1760350000000,
  "question": {
    "id": 118,
    "title": "How to...",
    "payer_email": "asker@example.com",
    "payer_first_name": "Jane",
    "payer_last_name": "Smith"
  }
}
```

**Notes:**
- Called by `/api/answers/create` endpoint (Vercel consolidated proxy)
- Email notification sent to asker after answer creation
- Response includes embedded question object to avoid extra fetch
- Frontend also uses direct call to Xano with workaround email endpoint

### `GET /answer`
Get answer for a specific question.

**API Group:** Authentication API
**Authentication:** Required
**Query Parameters:**
- `question_id` (required) - Question ID

**Response:**
```json
{
  "id": 87,
  "question_id": 118,
  "user_id": 33,
  "text_response": "Answer text...",
  "media_asset_id": 99,
  "attachments": "[...]",
  "created_at": 1760350000000
}
```

---

## Media Asset Endpoints

### `POST /media_asset`
Create media asset record.

**API Group:** Authentication API (for authenticated users) or Public API (for questions)
**Authentication:** Optional (required for answer media)
**Request Body:**
```json
{
  "owner_type": "question",
  "owner_id": 118,
  "provider": "cloudflare_stream",
  "asset_id": "8a43b59f533e310c...",
  "url": "https://customer-...cloudflarestream.com/.../manifest/video.m3u8",
  "duration_sec": 120,
  "status": "ready",
  "segment_index": 0,
  "metadata": "{\"mode\":\"video\",\"segmentIndex\":0}"
}
```

**Response:**
```json
{
  "id": 97,
  "owner_type": "question",
  "owner_id": 118,
  "provider": "cloudflare_stream",
  "asset_id": "8a43b59f533e310c...",
  "duration_sec": 120,
  "status": "ready",
  "created_at": 1760349011047
}
```

**Notes:**
- `owner_type`: 'question' or 'answer'
- `provider`: 'cloudflare_stream' (video) or 'cloudflare_r2' (audio)
- `status`: 'uploading', 'ready', 'failed'
- `segment_index`: null for parent, 0+ for segments
- `metadata`: Must be JSON string

### `GET /media_asset`
List media assets with filtering.

**API Group:** Authentication API
**Authentication:** Required (internal operations)
**Query Parameters:**
- `owner_type` (optional) - Filter by owner type
- `owner_id` (optional) - Filter by owner ID

**Response:**
```json
[
  {
    "id": 97,
    "owner_type": "question",
    "owner_id": 118,
    "provider": "cloudflare_stream",
    "asset_id": "8a43b59f533e310c...",
    "duration_sec": 120,
    "status": "ready"
  }
]
```

### `GET /media_asset/{id}`
Get single media asset by ID.

**API Group:** Authentication API
**Authentication:** Required
**URL Parameters:**
- `id` - Media asset ID

**Response:**
```json
{
  "id": 97,
  "owner_type": "question",
  "owner_id": 118,
  "provider": "cloudflare_stream",
  "asset_id": "8a43b59f533e310c...",
  "url": "https://...",
  "duration_sec": 120,
  "status": "ready",
  "metadata": "{...}"
}
```

### `DELETE /media_asset/{id}`
Delete media asset record.

**API Group:** Authentication API
**Authentication:** Required
**URL Parameters:**
- `id` - Media asset ID

**Response:**
```json
{
  "success": true
}
```

**Notes:**
- Used by cleanup cron job for orphaned media
- Does NOT delete from Cloudflare (only database record)

---

## Internal Endpoints

### `GET /internal/user/{user_id}/email`
Get user email and name (internal use only).

**API Group:** Public API
**Authentication:** Internal API key (query param)
**URL Parameters:**
- `user_id` - User ID

**Query Parameters:**
- `x_api_key` (required) - Internal API key

**Response:**
```json
{
  "email": "user@example.com",
  "name": "John Doe"
}
```

**Notes:**
- Created for email notifications (not exposed in public profile)
- Requires `XANO_INTERNAL_API_KEY` environment variable
- Only accessible with valid API key
- Used by:
  - Question creation (get expert email)
  - Answer submission (get expert name)

**Security:**
- API key must be kept secret
- Never expose to frontend
- Only used in Vercel serverless functions

---

## Marketing Endpoints

### `GET /marketing/campaigns`
Get all marketing campaigns.

**API Group:** Authentication API
**Authentication:** Required
**Response:**
```json
[
  {
    "id": 1,
    "name": "Q4 Campaign",
    "status": "active",
    "budget": 5000,
    "impressions": 10000,
    "clicks": 500
  }
]
```

### `POST /marketing/campaigns`
Create new marketing campaign.

**API Group:** Authentication API
**Authentication:** Required
**Request Body:**
```json
{
  "name": "Q4 Campaign",
  "budget": 5000,
  "target_audience": "developers"
}
```

**Response:**
```json
{
  "id": 1,
  "name": "Q4 Campaign",
  "status": "draft",
  "created_at": 1760349011047
}
```

### `GET /marketing/traffic-sources`
Get traffic source analytics.

**API Group:** Authentication API
**Authentication:** Required
**Response:**
```json
[
  {
    "source": "google",
    "visits": 1500,
    "conversions": 50
  }
]
```

### `GET /marketing/share-templates`
Get social media share templates.

**API Group:** Authentication API
**Authentication:** Required
**Response:**
```json
[
  {
    "id": 1,
    "platform": "twitter",
    "template": "Check out my expert profile..."
  }
]
```

### `GET /marketing/insights`
Get marketing insights and analytics.

**API Group:** Authentication API
**Authentication:** Required
**Response:**
```json
{
  "total_impressions": 50000,
  "total_clicks": 2500,
  "conversion_rate": 5.2,
  "top_sources": [...]
}
```

---

## Database Tables

### users
Stores all user accounts (askers and experts).

**Fields:**
- `id` (int, auto-increment) - Primary key
- `email` (text) - User email
- `name` (text) - Full name
- `fname` (text) - First name
- `lname` (text) - Last name
- `auth_provider` (text) - 'google' or 'linkedin'
- `auth_provider_id` (text) - Provider's user ID
- `expert_specialty` (text) - Expert's specialty
- `expert_price` (int) - Price in cents
- `created_at` (timestamp)

### expert_profile
Extended profile information for experts.

**Fields:**
- `id` (int, auto-increment) - Primary key
- `user_id` (int) - Foreign key to users
- `handle` (text, unique) - Public URL handle
- `bio` (text) - Biography
- `price_cents` (int) - Price in cents
- `currency` (text) - Currency code (USD, EUR, etc.)
- `sla_hours` (int) - Response time SLA
- `status` (text) - 'SET', 'DRAFT', etc.
- `public` (boolean) - Profile visibility
- `avatar_url` (text) - Profile picture URL
- `professional_title` (text)
- `tagline` (text)
- `accepting_questions` (boolean)
- `charity_percentage` (int)
- `selected_charity` (text)
- `expertise` (json) - Array of expertise tags
- `socials` (json) - Social media links

### questions
Questions submitted to experts.

**Fields:**
- `id` (int, auto-increment) - Primary key
- `expert_profile_id` (int) - Foreign key to expert_profile
- `payer_email` (text) - Asker's email
- `payer_first_name` (text) - Asker's first name
- `payer_last_name` (text) - Asker's last name
- `price_cents` (int) - Amount paid
- `currency` (text) - Currency code
- `status` (text) - 'draft', 'paid', 'answered', 'refunded'
- `sla_hours_snapshot` (int) - SLA at time of question
- `title` (text) - Question title
- `text` (text) - Question details
- `attachments` (text) - JSON string of attachments
- `media_asset_id` (int) - Foreign key to media_assets
- `hidden` (boolean) - Hidden from expert's queue
- `created_at` (timestamp)
- `answered_at` (timestamp)
- `paid_at` (timestamp)
- `checkout_session_id` (text) - Stripe session
- `payment_intent_id` (text) - Stripe payment intent

### answers
Expert responses to questions.

**Fields:**
- `id` (int, auto-increment) - Primary key
- `question_id` (int) - Foreign key to questions
- `user_id` (int) - Foreign key to users (expert)
- `text_response` (text) - Answer text
- `media_asset_id` (int) - Foreign key to media_assets
- `attachments` (text) - JSON string of attachments
- `created_at` (timestamp)

### media_assets
References to Cloudflare media (videos, audio, files).

**Fields:**
- `id` (int, auto-increment) - Primary key
- `owner_type` (text) - 'question' or 'answer'
- `owner_id` (int) - Foreign key to questions/answers
- `provider` (text) - 'cloudflare_stream' or 'cloudflare_r2'
- `asset_id` (text) - Cloudflare UID
- `url` (text) - Playback/download URL
- `duration_sec` (int) - Duration in seconds
- `status` (text) - 'uploading', 'ready', 'failed'
- `segment_index` (int, nullable) - For multi-segment videos
- `metadata` (text) - JSON string with extra data
- `created_at` (timestamp)

---

## Common Patterns

### Authentication Header
All authenticated endpoints require:
```
Authorization: Bearer {jwt_token}
```

### JSON Fields
Some fields store JSON as text strings and must be stringified before sending:
- `questions.attachments`
- `answers.attachments`
- `media_assets.metadata`
- `expert_profile.expertise`
- `expert_profile.socials`

Example:
```javascript
const payload = {
  attachments: JSON.stringify([
    { name: "file.pdf", url: "https://..." }
  ])
};
```

### Error Responses
Xano returns errors in this format:
```json
{
  "error": "Validation failed",
  "details": { ... }
}
```

### Pagination
Most list endpoints support pagination:
```
GET /endpoint?page=1&per_page=20
```

---

## Environment Variables

### Required for Backend (Vercel)
```bash
# Xano Configuration
XANO_BASE_URL=https://xlho-4syv-navp.n7e.xano.io/api:3B14WLbJ
XANO_MEDIA_BASE_URL=https://xlho-4syv-navp.n7e.xano.io/api:BQW1GS7L
XANO_INTERNAL_API_KEY=your_internal_api_key

# OAuth Configuration
XANO_GOOGLE_AUTH_BASE_URL=https://xlho-4syv-navp.n7e.xano.io/api:[oauth-group-id]
CLIENT_PUBLIC_ORIGIN=https://mindpick.me

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# LinkedIn OAuth
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
```

### Required for Frontend (Vite)
```bash
# No Xano credentials in frontend - uses proxy
VITE_CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
```

---

## Security Notes

1. **Email Privacy**: User emails are NOT exposed in public profile endpoints
2. **Internal Endpoints**: Use API key authentication for internal-only operations
3. **Token Expiration**: JWT tokens expire after 24 hours (86400 seconds)
4. **CORS**: Xano configured to allow requests from mindpick.me domain
5. **Rate Limiting**: Xano Free tier has rate limits (429 errors possible)

---

## API Groups Breakdown

### Authentication API (api:3B14WLbJ)
- User profile management (`/me/*`)
- Expert profile operations (`/expert/*`)
- Answer submission and retrieval (`/answer`)
- Media asset management (`/media_asset`, `/upload/*`)
- Question queue and management (`/me/questions`, `/question/hidden`)
- Marketing endpoints (`/marketing/*`)
- Requires authentication (Bearer token)

### Public API (api:BQW1GS7L)
- Question creation (`/question`)
- Public profile lookup (`/public/*`)
- LinkedIn OAuth (`/auth/linkedin/*`)
- Internal user data endpoint (`/internal/*`)
- Feedback and reviews (`/feedback`, `/review/*`)
- Allows unauthenticated access for specific endpoints

### Google OAuth API (api:[oauth-group])
- Google OAuth initialization (`/oauth/google/init`)
- Google OAuth callback (`/oauth/google/continue`)
- Handles Google authentication flow

**Why Three Groups?**
- Separation of authentication concerns
- Different access control requirements
- Allows public access to question submission
- OAuth isolated from main API operations
- Internal operations accessible with API key

---

## Common Operations

### Creating a Question
1. Frontend uploads media to Cloudflare
2. Frontend calls `/api/questions/create` (Vercel)
3. Vercel creates media_asset records in Xano
4. Vercel calls Xano `POST /question`
5. Vercel fetches expert email from internal endpoint
6. Vercel sends email notification via ZeptoMail
7. Returns question ID to frontend

### Submitting an Answer
1. Expert records answer in frontend
2. Segments uploaded progressively to Cloudflare
3. Frontend calls `/api/answers/create` (Vercel consolidated endpoint)
4. Vercel creates media_asset record in Authentication API
5. Vercel calls Xano `POST /answer` (Authentication API)
6. Xano returns answer with embedded question data
7. Vercel fetches expert name from `/internal/user/{id}/email` (Public API)
8. Vercel sends email notification to asker via ZeptoMail
9. Returns answer data to frontend

### User Sign-In
1. User clicks OAuth button
2. Redirected to Google/LinkedIn
3. OAuth callback redirects to `/auth/callback`
4. Frontend calls Vercel OAuth endpoint
5. Vercel exchanges code for token
6. Vercel creates/updates user in Xano
7. Vercel sends welcome email
8. Returns JWT token to frontend
9. Frontend stores token in localStorage

---

## Changelog

### 2025-10-13 (Updated)
- ✅ Corrected API group classifications based on actual Xano configuration
- ✅ Added Google OAuth API as third API group
- ✅ Updated all endpoint references to correct API groups
- ✅ Authentication API (`api:3B14WLbJ`): `/answer`, `/me/*`, `/expert/*`, `/media_asset`, `/question/hidden`, `/upload/*`
- ✅ Public API (`api:BQW1GS7L`): `/question`, `/public/*`, `/auth/linkedin/*`, `/internal/*`, `/feedback`, `/review/*`
- ✅ Google OAuth API: `/oauth/google/*`
- ✅ Updated consolidated answer endpoint documentation (`/api/answers/create`)
- ✅ Documented ZeptoMail email notification integration

### 2025-10-13 (Initial)
- ✅ Documented all Xano endpoints
- ✅ Added internal user data endpoint
- ✅ Documented API groups structure
- ✅ Added database table schemas
- ✅ Added common patterns and examples
- ✅ Added security notes

---

## Related Documentation

- [CLAUDE.md](./CLAUDE.md) - Main project documentation
- [zeptomail-implementation.md](./zeptomail-implementation.md) - Email notifications
- [quickchat-ai-implementation-spec.md](./quickchat-ai-implementation-spec.md) - AI features

---

## Support

For Xano-specific issues:
- Check Xano dashboard: https://app.xano.com
- Verify API group URLs match configuration
- Check authentication tokens are valid
- Review rate limits (Free tier: 1000 requests/day)

For application issues:
- Check Vercel logs for API errors
- Verify environment variables are set
- Test endpoints with `/api/test-xano-endpoints`
