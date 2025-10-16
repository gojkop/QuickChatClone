# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

QuickChat is a video-based Q&A platform connecting askers with experts. Users record video questions, experts respond with video answers. The platform includes AI-powered features for question coaching and expert assistance.

**Tech Stack:**
- Frontend: React 18 + Vite + Tailwind CSS + React Router
- Backend: Node.js serverless functions on Vercel
- Database: Xano (REST API)
- Auth: Google OAuth + LinkedIn OAuth + Magic Link (passwordless email)
- Media: Cloudflare Stream (video) + Cloudflare R2 (audio/files)
- AI: Google Gemini (free tier), multi-provider LLM service architecture

## Documentation & Resources

- **Documentation:** In the `docs` folder you will find documentation
- **Screenshots:** Screenshots can be found at `/Users/gojkop/Desktop/Screenshots` for troubleshooting

## Commands

### Development
```bash
npm run dev                 # Start Vite dev server (port 5173)
npm run build              # Production build
npm run preview            # Preview production build
```

### Deployment
```bash
npm run vercel:dev         # Run Vercel dev environment locally
npm run vercel:deploy      # Deploy to production on Vercel
```

### Testing AI Features
Visit `/test-ai-coach` in the browser for standalone AI coaching flow testing.

## Architecture

### Request Flow

**Question Submission:**
1. User records video/audio segments in browser (MediaRecorder API)
2. Each segment uploads to Cloudflare R2 via presigned URL (`/api/media/get-upload-url`)
3. Cloudflare Stream processes video segments
4. User submits question with media UIDs (`/api/questions/create`)
5. Xano stores question record with media_asset references
6. Optional: AI Coach analyzes and guides question improvement (Tier 1-2)

**Answer Submission:**
1. Expert records answer (video/audio segments)
2. Similar upload flow to Cloudflare R2/Stream
3. Media_asset records created for each segment
4. Answer record created with media references (`/api/answer`)
5. Background: Co-pilot processes answer for future retrieval (not yet implemented)

### Directory Structure

```
/src                          # Frontend React application
  /pages                      # Route pages
    - SignInPage.jsx          # OAuth login
    - ExpertDashboardPage.jsx # Expert's question queue
    - AskQuestionPage.jsx     # Question submission flow
    - TestAICoachPage.jsx     # AI Coach testing page
  /components
    /dashboard                # Expert dashboard components
      - AnswerRecorder.jsx    # Multi-segment video recording
      - QuestionTable.jsx     # Question list/queue
    /question                 # Question composition
      - QuestionComposer.jsx  # Question recording flow
      - QuestionCoachDialog.jsx   # AI coaching UI (Tier 2)
      - ValidationFeedback.jsx    # Question validation (Tier 1)
    /common                   # Shared components
  /hooks                      # Custom React hooks
    - useAnswerUpload.js      # Answer submission logic
    - useRecordingSegmentUpload.js  # Progressive segment uploads
    - useQuestionCoach.js     # AI coaching state management
    - useMarketing.js         # Marketing campaigns & analytics (NEW)
  /context
    - AuthContext.jsx         # Authentication state
  /api
    - index.js                # Axios client for Xano API
  router.jsx                  # React Router setup

/api                          # Vercel serverless functions
  /ai
    /coach                    # AI Question Coach (Feature 2)
      - quick-validate.js     # Tier 1: Rule-based validation
      - analyze-and-guide.js  # Tier 2: AI analysis + clarifications
      - save-responses.js     # Store clarification responses
  /media                      # Media upload handlers
    - get-upload-url.js       # Generate Cloudflare presigned URLs
    - upload-video.js         # Video upload to Stream
    - upload-audio.js         # Audio upload to R2
    - upload-attachment.js    # File attachments
  /questions                  # Question endpoints
    - create.js               # Create new question
    - submit.js               # Submit question for expert
  /marketing                  # Marketing & UTM tracking (NEW)
    - campaigns.js            # GET/POST campaigns
    - traffic-sources.js      # GET traffic breakdown
    - share-templates.js      # GET social media templates
    - insights.js             # GET performance insights
  /public                     # Public (unauthenticated) endpoints
    - track-visit.js          # POST UTM visit tracking
  /oauth                      # OAuth flows
    /google                   # Google OAuth
    /linkedin                 # LinkedIn OAuth
  /auth                       # Authentication endpoints
    /magic-link               # Magic link (passwordless) auth
      - send.js               # Initiate magic link flow
      - verify.js             # Verify token and authenticate
  /lib                        # Shared utilities
    /llm-providers            # LLM provider implementations
      - gemini.js             # Google Gemini (active)
      - openai.js             # OpenAI (stub)
      - anthropic.js          # Anthropic (stub)
      - groq.js               # Groq (stub)
    - llm-service.js          # Multi-provider LLM abstraction
    /xano                     # Xano API client
      - client.js             # HTTP wrapper
      - expert.js             # Expert-specific queries
      - question.js           # Question queries
      - media.js              # Media asset queries
    /cloudflare               # Cloudflare integrations
      - stream.js             # Video streaming
      - r2.js                 # Object storage
```

### Key Data Models (Xano)

**users** - User accounts (both askers and experts)
- id, email, name, google_id, linkedin_id
- expert_specialty, expert_price, expert_sla_hours

**questions** - Questions submitted to experts
- id, user_id (asker), expert_id, text_question
- media_asset_id (FK to media_assets)
- status: 'draft', 'pending', 'answered'
- created_at, answered_at

**answers** - Expert responses
- id, question_id, user_id (expert), text_response
- media_asset_id (FK to media_assets)
- attachments (JSON array)

**media_assets** - Cloudflare media references
- id, owner_type ('question' | 'answer'), owner_id
- provider ('cloudflare_stream' | 'cloudflare_r2')
- asset_id (Cloudflare UID), duration_sec, url
- metadata (JSON), segment_index (for multi-segment videos)
- status: 'uploading', 'ready', 'failed'

**question_coaching_sessions** - AI Coach state (partially implemented)
- id, session_id (UUID), question_id (nullable)
- initial_transcript, tier_1_validation (JSON)
- tier_2_analysis (JSON), tier_3_enhancement (JSON)
- coaching_tier_reached (0-3), converted_to_payment

**coaching_rate_limits** - AI Coach abuse prevention
- fingerprint, questions_started_today, questions_paid_today
- is_flagged, flag_reason

**utm_campaigns** - Marketing campaigns tracking
- id, expert_profile_id, name
- utm_source, utm_campaign, utm_medium, utm_content
- total_visits, total_questions, total_revenue_cents, conversion_rate
- status, created_at, updated_at
- Unique constraint: (expert_profile_id, utm_source, utm_campaign)

**campaign_visits** - Visitor tracking for campaigns
- id, campaign_id, expert_profile_id, question_id
- visitor_ip_hash, referrer, user_agent, country, device_type
- converted_to_question, visited_at

**magic_link_tokens** - Passwordless authentication tokens
- id, email, token (UUID), verification_code (6-digit)
- user_id (nullable), expires_at, used, used_at
- ip_address (hashed), created_at

## Authentication

Supports three authentication methods with JWT tokens stored in localStorage as `qc_token`:
1. **Google OAuth** - Sign in with Google account
2. **LinkedIn OAuth** - Sign in with LinkedIn account
3. **Magic Link** - Passwordless email authentication (NEW - Jan 2025)

### OAuth Flow (Google)

1. User clicks "Sign in with Google" → `/api/oauth/google/init`
2. Redirects to Google consent screen
3. Google redirects back to `/auth/callback`
4. `/api/oauth/google/continue` exchanges code for token via Xano
5. Xano creates/updates user, returns JWT token
6. Frontend stores token, redirects to `/expert` dashboard

### OAuth Flow (LinkedIn)

1. User clicks "Sign in with LinkedIn" → `/api/oauth/linkedin/init` (Vercel)
2. Vercel generates LinkedIn authorization URL directly
3. Redirects to LinkedIn authorization
4. LinkedIn redirects back to `/auth/callback`
5. `/api/oauth/linkedin/continue` exchanges code for access token (Vercel)
6. Vercel fetches user info from LinkedIn `/v2/userinfo`
7. Vercel calls Xano `/auth/linkedin/create_user` with user data
8. Xano creates/updates user, returns JWT token
9. Frontend stores token, redirects to `/expert` dashboard

**Architecture Note:** LinkedIn OAuth is **entirely handled by Vercel** (no Xano OAuth integration needed). This approach:
- Avoids Xano Free tier limitations with form-encoded OAuth requests
- Eliminates dependency on Xano OAuth marketplace addons
- Gives full control over the OAuth flow
- Only requires Xano for user creation and token generation

### Magic Link Flow (Passwordless)

1. User enters email on `/signin` → `/api/auth/magic-link/send` (Vercel)
2. Vercel calls Xano `/auth/magic-link/initiate` (Public API)
3. Xano generates UUID token, stores in `magic_link_tokens` table
4. Email sent with link: `https://mindpick.me/auth/magic-link?token={uuid}`
5. User clicks link → `/auth/magic-link` page
6. Frontend calls `/api/auth/magic-link/verify` (Vercel)
7. Vercel calls Xano `/auth/magic-link/verify` (Public API)
8. Xano validates token, creates/finds user, returns JWT
9. Frontend stores token, redirects to `/expert` dashboard

**Key Features:**
- Time-limited tokens (15 minutes)
- One-time use links
- Rate limiting (3 per hour per email)
- Automatic user creation for new emails
- Welcome email for first-time users

**Security:**
- UUIDs prevent guessing
- Tokens marked as used immediately
- IP tracking for audit trail
- Handles email client pre-fetching

**Documentation:** See `docs/magic-link-authentication-guide.md` for complete implementation guide

### Auth Middleware

- **Frontend:** `src/api/index.js` intercepts all requests, adds `Authorization: Bearer {token}`
- **Auto-logout:** Triggered on 401 response (except during OAuth flow)
- **Cross-tab sync:** Uses localStorage events to sync authentication state
- **OAuth protection:** Uses `sessionStorage.qc_auth_in_progress` flag to prevent auto-logout during callback

## Media Upload System

Uses Cloudflare services for all media storage.

### Multi-Segment Recording

Both questions and answers support progressive recording with pause/resume:

1. User starts recording → segments created on pause
2. Each segment uploads immediately to Cloudflare
3. Segments stored as separate media_asset records with `segment_index`
4. Playback concatenates segments client-side

**Implementation:** `useRecordingSegmentUpload.js` handles progressive uploads during recording.

### Upload Flow

**Video (larger than 100MB or multi-segment):**
- Uses Cloudflare Stream Direct Upload
- Step 1: GET `/api/media/get-upload-url` → presigned upload URL
- Step 2: POST video blob to Cloudflare URL
- Returns: `{ uid, playbackUrl }`

**Audio (smaller files):**
- Uploads to Cloudflare R2
- POST audio blob to `/api/media/upload-audio`
- Backend handles R2 upload with presigned URL
- Returns: `{ uid, playbackUrl }`

**Attachments (PDFs, images, docs):**
- POST base64-encoded file to `/api/media/upload-attachment`
- Backend stores in R2
- Returns: `{ uid, url, filename, size, type }`

### Media Asset Records

Always create `media_asset` records in Xano after Cloudflare uploads:

```javascript
await apiClient.post('/media_asset', {
  owner_type: 'answer',      // or 'question'
  owner_id: answerId,        // FK reference
  provider: 'cloudflare_stream',
  asset_id: cloudflareUid,
  duration_sec: Math.round(duration),
  status: 'ready',
  url: playbackUrl,
  metadata: JSON.stringify({ /* extra data */ }),
  segment_index: 0           // null for parent, 0+ for segments
});
```

## Marketing Module

### Overview

The Marketing Module enables experts to track campaign performance, understand traffic sources, and optimize their marketing efforts through UTM parameter tracking.

**Status:** ✅ Production Ready (October 2025)

### Architecture

**UTM Tracking Flow:**
1. Expert creates campaign via POST /marketing/campaigns
2. Expert shares profile link with UTM parameters
3. Visitor clicks link → PublicProfilePage loads
4. Frontend extracts UTM params from URL
5. POST /public/track-visit logs visit (no auth required)
6. Visit stored in `campaign_visits` table
7. Metrics updated in `utm_campaigns` table

**Question Attribution Flow (Future):**
1. Visitor with UTM visit asks question
2. Question linked to campaign via `link_question_to_campaign()`
3. Metrics recalculated automatically
4. Expert sees conversion data

### API Endpoints

**Authenticated (for experts):**
- GET /marketing/campaigns - List all campaigns with metrics
- POST /marketing/campaigns - Create new campaign
- GET /marketing/traffic-sources - Traffic breakdown by source
- GET /marketing/share-templates - Pre-filled social media copy
- GET /marketing/insights - Performance insights & recommendations

**Public (no auth):**
- POST /public/track-visit - Track UTM visits from public profile

### Xano Functions

**update_campaign_metrics(campaign_id):**
- Recalculates: total_visits, total_questions, total_revenue_cents, conversion_rate
- Called when metrics need refreshing

**link_question_to_campaign(question_id, campaign_id):**
- Links question to source campaign
- Updates campaign.total_questions and campaign.total_revenue_cents
- Triggers metric recalculation

### Frontend Integration

**PublicProfilePage.jsx:**
- Automatically extracts UTM parameters on page load
- Calls `/public/track-visit` to log visit
- Supports: utm_source, utm_campaign, utm_medium, utm_content

**useMarketing.js hook:**
- `campaigns` - List of all campaigns
- `trafficSources` - Breakdown by source
- `shareTemplates` - Social media templates
- `insights` - Performance data
- `createCampaign()` - Create new campaign
- `refreshCampaigns()` - Reload data

### Example Usage

**Creating a campaign:**
```javascript
const { createCampaign } = useMarketing();

await createCampaign({
  name: "LinkedIn Launch",
  utm_source: "linkedin",
  utm_campaign: "q4_2025",
  utm_medium: "social",
  utm_content: "post_1"
});
```

**Generated campaign URL:**
```
https://mindpick.me/u/yourhandle?utm_source=linkedin&utm_campaign=q4_2025&utm_medium=social&utm_content=post_1
```

**Tracking happens automatically when visitors click the link.**

### Documentation

See `docs/marketing module/` for detailed implementation docs:
- `IMPLEMENTATION-MASTER-GUIDE.md` - Architecture overview
- `IMPLEMENTATION-STEP-3-ENDPOINTS.md` - API specifications
- `IMPLEMENTATION-COMPLETE.md` - Implementation summary
- `PROGRESS-2025-10-14.md` - Development log

## Download Features

### ZIP Download for Questions & Answers

**Status:** ✅ Production Ready (October 16, 2025)

Users can download all media files and attachments from questions and answers as organized ZIP archives on the answer review page (`/r/{token}`).

**Features:**
- Download all answer content (videos, audio, attachments) as `answer-{id}.zip`
- Download all question content (videos, audio, attachments) as `question-{id}.zip`
- Sequential file downloads to prevent browser overload
- Loading states with file count badges
- CORS-safe downloads via backend proxy endpoints

**Technical Implementation:**
- Library: `jszip@3.10.1` for client-side ZIP creation
- Proxy endpoints to avoid CORS errors:
  - `/api/media/download-video` - Proxies Cloudflare Stream downloads
  - `/api/media/download-audio` - Proxies R2 audio downloads
- Reusable `downloadAsZip()` function in `AnswerReviewPage.jsx`
- Files named systematically: `part-1-video.mp4`, `part-2-audio.webm`, etc.

**Documentation:** See `docs/ZIP-DOWNLOAD-FEATURE.md` for complete implementation details

## Profile Sharing Features

### QR Code Generator

**Status:** ✅ Production Ready (October 16, 2025)

Experts can generate and share QR codes for their profile, making it easy to share during in-person conversations, on business cards, or in presentations.

**Features:**
- Full-screen QR code modal with blurred backdrop
- mindPick logo embedded in center of QR code
- Download as high-res PNG (512x512px)
- Native share functionality on mobile devices
- Displays expert name and handle
- Available on both Expert Dashboard and Public Profile pages

**Component Location:**
- Main Component: `/src/components/dashboard/QRCodeModal.jsx`
- Integration: ExpertDashboardPage.jsx (desktop + mobile views)
- Integration: PublicProfilePage.jsx (next to share button)

**Usage:**
```javascript
import QRCodeModal from '@/components/dashboard/QRCodeModal';

// In component
const [isQRModalOpen, setIsQRModalOpen] = useState(false);

// Render modal
<QRCodeModal
  isOpen={isQRModalOpen}
  onClose={() => setIsQRModalOpen(false)}
  profileUrl={`https://mindpick.me/u/${handle}`}
  expertName={expertName}
  handle={handle}
/>
```

**Technical Details:**
- Library: `qrcode.react` (QRCodeSVG component)
- QR Error Correction: Level "H" (high) for reliable scanning with logo
- Logo: `/android-chrome-192x192.png` (48x48px in QR center)
- Display size: 256x256px
- Download size: 512x512px (print quality)
- SVG → Canvas conversion for PNG export
- Native share API for mobile sharing

**User Flow:**
1. Expert clicks QR button on dashboard or public profile
2. Full-screen modal appears with QR code
3. Expert can:
   - Show QR code to scan with phone camera
   - Download PNG for business cards/presentations
   - Share via native share sheet (mobile)
4. Click backdrop or X button to close

**Documentation:** See `/docs/marketing module/FEATURE-SHARE-PROFILE.md` for complete feature specification (Phase 2 completed)

## AI Features

### Current Status

**Feature 1: Expert Co-pilot** - Not implemented
- Will analyze incoming questions, search past answers, generate outlines
- Cost: ~$0.02 per question

**Feature 2: AI Question Coach** - Partially implemented (Tier 1-2 working)
- Tier 1 (Rule-based): Validates question quality, calculates clarity score - **Working**
- Tier 2 (AI-powered): Analyzes question, suggests clarifications - **Working**
- Tier 3 (Post-payment): Enhanced question for expert - **Not implemented**
- Cost: $0.00 (using Gemini free tier)

**Feature 3: Knowledge Graph** - Not implemented
- Will build Neo4j graph of expert's past Q&As for semantic retrieval
- Cost: ~$0.12 per Q&A

### LLM Service Architecture

Multi-provider abstraction in `api/lib/llm-service.js`:

```javascript
// Usage
import { callLLM } from '../lib/llm-service.js';

const result = await callLLM(prompt, {
  temperature: 0.7,
  max_tokens: 2048,
  requireJSON: true  // Auto-parses JSON responses
});
```

**Current Provider:** Gemini (`gemini-2.0-flash`) via free tier
- Set via `LLM_PROVIDER=gemini` environment variable
- Other providers (OpenAI, Anthropic, Groq) have stub implementations

**JSON Handling:**
- When `requireJSON: true`, response is automatically parsed
- Enhanced cleanup removes markdown code blocks if present

### AI Coach Implementation

**Tier 1 - Rule-Based Validation** (`/api/ai/coach/quick-validate`)
- No AI calls, pure JavaScript validation
- Checks: word count, vagueness (this/that/it), question marks, greetings
- Calculates clarity score (0-100)
- Returns feedback array with severity levels
- Cost: $0.00

**Tier 2 - AI Analysis** (`/api/ai/coach/analyze-and-guide`)
- Analyzes question text from Tier 1
- Generates: summary, missing context, 2-3 clarification questions
- Detects needed attachments via keyword matching
- Uses Gemini with `requireJSON: true`
- Cost: $0.00 (free tier)

**Session Management:**
- Currently uses mock/in-memory storage
- Session ID generated but not persisted to Xano yet
- Rate limiting not enforced (always returns `allowed: true`)

**Testing:** Visit `/test-ai-coach` for standalone testing flow

## Important Patterns

### Attachment Upload Validation

When handling pre-uploaded attachments (files uploaded before form submission), validate using the `url` property, not `uid`:

```javascript
// ✅ Correct - checks for url property
if (item.url && typeof item.url === 'string') {
  // Already uploaded attachment
  alreadyUploaded.push({
    uid: item.uid,  // May be undefined, that's OK
    url: item.url,
    filename: item.filename || item.name,
    size: item.size,
    type: item.type,
  });
}

// ❌ Incorrect - requires both uid and url
if (item.uid && item.url) {
  // This will reject valid attachments!
}
```

**Why:** The `/api/media/upload-attachment` endpoint returns `{name, url, type, size}` without a `uid` property. Requiring `uid` causes valid uploaded attachments to be rejected during form submission.

**Applies to:** Questions and Answers with file attachments (PDFs, images, documents).

### Xano Lambda Functions - Variable Scoping

**Critical Rule:** Xano Lambda functions cannot directly access variables from previous function stack steps by typing their names.

**Always use `$var.variableName` syntax:**

```javascript
// ❌ WRONG - Direct variable access doesn't work
var total = 0
for (var i = 0; i < conversions.length; i++) {
  var c = conversions[i]
}

// ✅ CORRECT - Must use $var prefix
var total = 0
for (var i = 0; i < $var.conversions.length; i++) {
  var c = $var.conversions[i]
}
```

**Common errors and solutions:**
- `Cannot find name 'conversions'` → Use `$var.conversions`
- `Cannot read properties of undefined (reading 'length')` → Add `$var` prefix
- Arrays empty when passed to helper functions → Avoid helper functions, keep logic in main function

**Best practices:**
1. Query all necessary data in separate steps before Lambda
2. Use JavaScript objects as maps for fast lookups
3. Avoid nested function calls with array parameters
4. Keep all logic flat in the main function's Lambda steps

**See:** `/docs/XANO-LAMBDA-TROUBLESHOOTING.md` for detailed troubleshooting guide

### API Client Usage

Always use the configured axios client from `src/api/index.js`:

```javascript
import apiClient from '@/api';

// Correct
const response = await apiClient.post('/answer', data);

// Incorrect - bypasses auth headers
const response = await fetch('https://xano.../answer', ...);
```

### Error Handling

Xano endpoints return errors in this format:
```javascript
{
  "error": "Validation failed",
  "details": { ... }
}
```

Handle gracefully in UI, never expose raw errors to users.

### Environment Variables

**Backend (Vercel):**
- `XANO_BASE_URL` - Xano API base URL (Authentication API group)
- `XANO_PUBLIC_API_URL` - Xano Public API URL (for magic link & LinkedIn: `https://xlho-4syv-navp.n7e.xano.io/api:BQW1GS7L`)
- `XANO_INTERNAL_API_KEY` - Internal API key for secure Xano calls
- `ZEPTOMAIL_TOKEN` - ZeptoMail API token (for magic link emails)
- `ZEPTOMAIL_FROM_EMAIL` - From email address (e.g., noreply@mindpick.me)
- `ZEPTOMAIL_FROM_NAME` - From name (e.g., QuickChat)
- `CLIENT_PUBLIC_ORIGIN` - Public app URL (e.g., https://mindpick.me)
- `LLM_PROVIDER` - AI provider (gemini, openai, anthropic, groq)
- `GOOGLE_AI_API_KEY` - Gemini API key
- `CLOUDFLARE_ACCOUNT_ID` - Cloudflare account ID
- `CLOUDFLARE_STREAM_API_TOKEN` - Stream API token
- `CLOUDFLARE_R2_ACCESS_KEY_ID` - R2 storage credentials
- `CLOUDFLARE_R2_SECRET_ACCESS_KEY`
- `CLOUDFLARE_R2_BUCKET_NAME`

**Frontend (Vite):**
- `VITE_CLOUDFLARE_ACCOUNT_ID` - For constructing playback URLs
- Auto-loaded from `.env.local` during development

**Xano Environment Variables:**
- `APP_URL` - Base URL for campaign link generation (e.g., `https://mindpick.me`)

### Media Playback URLs

**Stream (video):**
```
https://customer-{ACCOUNT_ID}.cloudflarestream.com/{UID}/manifest/video.m3u8
```

**R2 (audio/files):**
```
https://{BUCKET_NAME}.{ACCOUNT_ID}.r2.cloudflarestorage.com/{KEY}
```

Use presigned URLs for private access.

## Development Workflow

### Adding a New Feature

1. **Backend API:** Create endpoint in `/api/[feature]/[action].js`
2. **Xano Integration:** Use `xanoGet/xanoPost` from `api/lib/xano/client.js`
3. **Frontend Hook:** Create custom hook in `/src/hooks/use[Feature].js`
4. **Component:** Build UI in `/src/components/[category]/[Component].jsx`
5. **Route:** Add route in `src/router.jsx` if needed

### Working with AI Features

**Before implementing:**
- Check `docs/quickchat-ai-implementation-spec.md` for detailed specifications
- Tier 1 (validation) → Tier 2 (coaching) → Tier 3 (enhancement)
- Mock first, integrate with Xano after UI is confirmed

**Cost tracking:**
- Log all LLM calls with token counts
- Monitor Gemini free tier limits (1,500 requests/day)
- See `estimateCost()` in `api/lib/llm-service.js`

### Debugging

**Frontend:**
- Check browser console for API errors
- Check Network tab for Xano response bodies
- Auth issues: Check localStorage for `qc_token`

**Backend:**
- Check Vercel function logs in dashboard
- Add `console.log()` statements (visible in Vercel logs)
- Test endpoints locally with `npm run vercel:dev`

**Media uploads:**
- Check Cloudflare Stream/R2 dashboards
- Verify UIDs match between Cloudflare and Xano
- Check `media_assets` table for status

## Media Cleanup System

QuickChat implements a comprehensive automated cleanup system to remove orphaned media files from Cloudflare and Xano.

### Cron Job: cleanup-orphaned-media

**Script:** `/api/cron/cleanup-orphaned-media.js`
**Schedule:** Daily at 3:00 AM UTC
**Configuration:** `vercel.json`

The cleanup script runs in four parts:

#### Part 1: Media Assets (Videos & Audio)

**This runs in two directions to catch all orphaned media:**

**Part 1A - Database → Cloudflare (validate DB records):**
- Fetches all records from `media_assets` table
- Checks if media is older than 48 hours (grace period for uploads)
- Verifies if parent question/answer still exists
- Deletes orphaned media from:
  - Cloudflare Stream (videos)
  - Cloudflare R2 (audio in `audio/` folder)
  - Xano database (`media_assets` table)

**Part 1B - Cloudflare → Database (find files not in DB):**
- Lists all videos in Cloudflare Stream
- Lists all audio files in R2 `audio/` folder
- Compares against `media_assets` table
- Deletes files from Cloudflare that don't exist in database
- **Catches uploads that succeeded but never created DB records**

#### Part 2: Profile Pictures
- Lists all files in R2 under `profiles/` prefix
- Fetches all avatar URLs from `expert_profile` table
- Compares R2 files against active avatar URLs
- Deletes orphaned profile pictures from R2

#### Part 3: Attachments (PDFs, Documents)
- Lists all files in R2 under `question-attachments/` prefix
- Fetches attachments JSON from both `question` and `answer` tables
- Parses JSON arrays to extract attachment URLs
- Compares R2 files against active attachments
- Deletes orphaned attachment files from R2

#### Part 4: Magic Link Tokens
- Fetches all `magic_link_tokens` from database
- Deletes tokens matching cleanup criteria:
  - **Expired tokens** older than 7 days (grace period for debugging)
  - **Used tokens** older than 30 days (keep recent for audit trail)
  - **Unused tokens** older than 30 days (abandoned sign-in attempts)
- Preserves recent tokens for security auditing and debugging

### Xano Internal Endpoints

The cleanup system uses internal Xano endpoints that bypass user authentication.

#### GET /internal/media

**Location:** Public API group in Xano
**Auth:** `x_api_key` query parameter
**Used by:** Cleanup script to fetch all media records

**Response Format:**
```json
{
  "media": [...],                    // All media_assets records
  "avatars": [...],                  // All expert_profile.avatar_url
  "question_attachments": [...],     // All question.attachments (JSON)
  "answer_attachments": [...],       // All answer.attachments (JSON)
  "magic_link_tokens": [...]         // All magic_link_tokens records
}
```

#### DELETE /internal/media_asset

**Location:** Public API group in Xano
**Auth:** `x_api_key` query parameter
**Parameters:** `media_asset_id` (integer)
**Used by:** Cleanup script to delete orphaned media_asset records

#### DELETE /internal/magic-link-token

**Location:** Public API group in Xano
**Auth:** `x_api_key` query parameter
**Parameters:** `token_id` (integer)
**Used by:** Cleanup script to delete old magic link tokens

### Notifications

The cleanup script sends email notifications to `gojkop@gmail.com` when:
- Any error occurs during cleanup (via ZeptoMail)
- Error rate exceeds 50% (high error rate alert)

Email includes detailed breakdown of:
- Media assets deleted/errors
- Profile pictures deleted/errors
- Attachments deleted/errors
- Magic link tokens deleted/errors
- Total counts and error rate

### Manual Execution

To manually trigger the cleanup script:

```bash
curl -X POST https://quickchat-dev.vercel.app/api/cron/cleanup-orphaned-media \
  -H "Authorization: Bearer $CRON_SECRET"
```

**Expected Response:**
```json
{
  "success": true,
  "mediaAssets": {
    "deletedFromDB": 0,
    "deletedFromCloudflare": 0,
    "total": 0,
    "errors": 0
  },
  "profilePictures": {
    "deleted": 0,
    "errors": 0
  },
  "attachments": {
    "deleted": 0,
    "errors": 0
  },
  "magicLinkTokens": {
    "deleted": 0,
    "errors": 0
  },
  "totals": {
    "deleted": 0,
    "errors": 0
  },
  "message": "Cleaned up 0 orphaned items (0 media assets: 0 from DB + 0 from Cloudflare, 0 profile pictures, 0 attachments, 0 magic link tokens)"
}
```

### Monitoring

Check cleanup logs in Vercel dashboard:
1. Go to Vercel project → Functions
2. Find `/api/cron/cleanup-orphaned-media`
3. View execution logs for detailed output

Logs include:
- 🧹 Starting cleanup
- 📦 Part 1: Media assets cleanup
  - 📋 Part 1A: Database → Cloudflare validation
  - ☁️  Part 1B: Cloudflare → Database comparison
- 🖼️ Part 2: Profile pictures cleanup
- 📎 Part 3: Attachments cleanup
- 🔐 Part 4: Magic link tokens cleanup
- 🎉 Summary with totals

### Architecture Notes

**Why not use media_assets for attachments?**
- Attachments are stored directly in `question.attachments` and `answer.attachments` JSON fields
- This is a legacy design pattern from the original implementation
- Part 3 of cleanup handles this by parsing JSON and comparing against R2 files

**Grace Periods:**
- **Media assets:** 48-hour grace period before deletion (prevents deletion of recently uploaded media)
- **Profile pictures:** Deleted immediately if orphaned
- **Attachments:** Deleted immediately if orphaned
- **Magic link tokens:** 7-day grace period for expired tokens, 30-day grace period for used/unused tokens

**Storage Locations:**
- Videos: Cloudflare Stream
- Audio: Cloudflare R2 (various paths)
- Profile Pictures: R2 `profiles/` folder
- Attachments: R2 `question-attachments/` folder

For detailed implementation, see `docs/xano-internal-endpoints.md`.

## Known Limitations

1. **AI Coach:** Tier 3 (post-payment enhancement) not implemented
2. **Expert Co-pilot:** Entire feature not started (see spec doc)
3. **Knowledge Graph:** Not implemented (requires Neo4j setup)
4. **Rate Limiting:** AI Coach rate limits not enforced yet
5. **Session Persistence:** AI Coach sessions not saved to Xano
6. **Xano Free Tier:** Rate limiting may affect high-traffic usage (429 errors)
7. **Marketing Attribution:** Questions not automatically linked to campaigns yet (requires session tracking)

## Troubleshooting

### OAuth Configuration

**Google OAuth:**
- Endpoint: Xano handles full OAuth flow via `/oauth/google/continue`
- Xano directly exchanges authorization code for user token

**LinkedIn OAuth:**
- **Init endpoint:** `/api/oauth/linkedin/init` (Vercel) - generates LinkedIn auth URL directly
- **Continue endpoint:** `/api/oauth/linkedin/continue` (Vercel) - exchanges code with LinkedIn
- **No Xano OAuth integration needed** - Vercel handles entire OAuth flow
- Vercel exchanges code with LinkedIn, then creates user in Xano via `/auth/linkedin/create_user`

**Required Vercel Environment Variables:**
- **Google OAuth:**
  - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
  - `XANO_AUTH_BASE_URL` or `XANO_GOOGLE_AUTH_BASE_URL`
- **LinkedIn OAuth:**
  - `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`
  - `XANO_PUBLIC_API_URL` (Public API group: `https://xlho-4syv-navp.n7e.xano.io/api:BQW1GS7L`)
  - `XANO_INTERNAL_API_KEY` (for secure Xano API calls)
- **Common:**
  - `CLIENT_PUBLIC_ORIGIN` (e.g., https://mindpick.me for OAuth redirect URI)

### Xano LinkedIn Endpoint Configuration

**Endpoint:** `POST /auth/linkedin/create_user`

**Inputs:**
- `x_api_key` (text) - Internal API key for security
- `linkedin_id` (text) - LinkedIn user ID
- `email` (text)
- `name` (text)
- `given_name` (text)
- `family_name` (text)

**Function Stack:**
1. **Get Record From** `user` table WHERE `auth_provider_id = linkedin_id`
2. **Conditional:** If user doesn't exist → Add Record, Else → Edit Record
3. **Create Authentication Token:**
   - `dbtable`: `user` (CRITICAL - must reference the correct table)
   - `id`: `user.id` (reference the user from conditional)
   - `expiration`: 86400 (24 hours)
4. **Return:** `{ "token": token, "email": user.email, "name": user.name }`

**Common Configuration Errors:**
- ❌ `dbtable` not set or wrong table name → auth tokens won't work
- ❌ `id` field using static value → wrong user authenticated
- ✅ `dbtable = "user"` and `id = user.id` (from conditional result)

**User Table Schema:**
- `id` → int (auto-increment, never set manually)
- `auth_provider` → text ("google" or "linkedin")
- `auth_provider_id` → text (provider's user ID as string)
- `email`, `name`, `fname`, `lname` → text fields

### Common Issues

**LinkedIn OAuth 404 Error:**
- **Symptom:** `/api/oauth/linkedin/init` returns 404
- **Cause:** LinkedIn OAuth integration was removed from Xano
- **Solution:** The init endpoint now runs entirely in Vercel (no Xano dependency)
- **Fix applied:** `api/oauth/linkedin/init.js` generates auth URL directly

**429 Rate Limit Errors:**
- Xano Free tier has rate limits
- Affects high-frequency API calls
- Solution: Upgrade Xano plan or implement client-side caching

**LinkedIn User Not Found After Sign-in:**
- Check `auth_provider_id` is stored as TEXT (LinkedIn returns string IDs)
- Verify "Get Record" uses `WHERE auth_provider_id = linkedin_id`
- Do NOT use `WHERE id = linkedin_id` (type mismatch)

**Token Not Working:**
- Verify "Create Authentication Token" has `dbtable` set to correct table
- Ensure `id` parameter references `user.id` from conditional
- Check token is returned in response: `{ "token": token, ... }`

## Next Steps

**Recently Completed:**
- ✅ ZIP Download Feature - Download questions/answers as organized archives (October 16, 2025)
- ✅ QR Code Profile Sharing - Generate and share profile QR codes (October 16, 2025)
- ✅ Marketing Module - UTM tracking, campaign management, analytics (October 2025)
- ✅ Magic Link Authentication - Passwordless email sign-in (January 2025)

**Immediate Priority:** Complete AI Coach Xano integration
1. Create `question_coaching_sessions` table in Xano
2. Create `coaching_rate_limits` table in Xano
3. Create 5 Xano endpoints (check_limits, create_session, etc.)
4. Update `api/ai/coach/*.js` to use real Xano (remove mocks)
5. Test full flow with persistence

**Future Features:**
- Feature 1: Expert Co-pilot (vector search + AI analysis)
- Feature 3: Knowledge Graph (Neo4j + entity extraction)
- Tier 3 Enhancement (post-payment question enrichment)
- Marketing Module Phase 2:
  - Automatic question-to-campaign attribution
  - Session-based visitor tracking
  - Advanced analytics and charts

## Critical Notes

- Always stringify JSON fields before sending to Xano: `JSON.stringify(metadata)`
- Multi-segment videos: Create parent media_asset with `segment_index: null`
- Auth tokens: Never commit tokens or API keys to git
- Cloudflare UIDs: Store in Xano as `asset_id`, not as primary key
- OAuth state: Use sessionStorage for `qc_auth_in_progress` flag to prevent auto-logout
