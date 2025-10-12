# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

QuickChat is a video-based Q&A platform connecting askers with experts. Users record video questions, experts respond with video answers. The platform includes AI-powered features for question coaching and expert assistance.

**Tech Stack:**
- Frontend: React 18 + Vite + Tailwind CSS + React Router
- Backend: Node.js serverless functions on Vercel
- Database: Xano (REST API)
- Auth: Google OAuth (LinkedIn OAuth in development)
- Media: Cloudflare Stream (video) + Cloudflare R2 (audio/files)
- AI: Google Gemini (free tier), multi-provider LLM service architecture

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
  /oauth                      # OAuth flows
    /google                   # Google OAuth
    /linkedin                 # LinkedIn OAuth (in progress)
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

## Authentication

Uses Google OAuth with JWT tokens stored in localStorage as `qc_token`.

**OAuth Flow:**
1. User clicks "Sign in with Google" → `/api/oauth/google/init`
2. Redirects to Google consent screen
3. Google redirects back to `/auth/callback`
4. `/api/oauth/google/continue` exchanges code for user info
5. Creates/updates user in Xano, returns JWT token
6. Frontend stores token, redirects to `/expert` dashboard

**LinkedIn OAuth:** In progress, similar flow with `/api/oauth/linkedin/*`

**Common Xano LinkedIn Issues:**
- "Not numeric" error: Usually caused by trying to manually set the `id` field when creating users. Remove any `id` field from "Add Record" inputs in Xano - it should auto-generate.
- LinkedIn returns string IDs: Store LinkedIn's user ID in a `linkedin_id` TEXT field, not in your numeric `id` field.
- Check Xano function stack: Remove any "Convert to Number" functions on `linkedin_id` or text fields.

**Auth Middleware:**
- Frontend: `src/api/index.js` intercepts all requests, adds `Authorization: Bearer {token}`
- Auto-logout on 401 (except during OAuth flow)
- Cross-tab sync via localStorage events

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
- `XANO_BASE_URL` - Xano API base URL
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

## Cron Jobs

**Daily Cleanup:** `/api/cron/cleanup-orphaned-media`
- Runs daily at 3 AM UTC
- Deletes media_assets without linked questions/answers
- Configured in `vercel.json`

## Known Limitations

1. **AI Coach:** Tier 3 (post-payment enhancement) not implemented
2. **Expert Co-pilot:** Entire feature not started (see spec doc)
3. **Knowledge Graph:** Not implemented (requires Neo4j setup)
4. **Rate Limiting:** AI Coach rate limits not enforced yet
5. **Session Persistence:** AI Coach sessions not saved to Xano
6. **LinkedIn OAuth:** In progress, requires Xano function stack configuration

## Troubleshooting

### LinkedIn OAuth Integration

**Architecture:** LinkedIn OAuth is handled by Vercel backend, which then calls Xano for user creation.

**Flow:**
1. Frontend → `/api/oauth/linkedin/init` → LinkedIn authorization
2. LinkedIn callback → `/api/oauth/linkedin/continue`
3. Vercel exchanges code for LinkedIn access token
4. Vercel fetches user info from LinkedIn `/v2/userinfo`
5. Vercel calls Xano `/auth/linkedin/create_user` with user data
6. Xano creates/updates user and returns auth token
7. Frontend receives token and authenticates user

**Why this approach:**
- Xano Free tier has limitations with form-encoded OAuth requests
- Vercel properly handles `application/x-www-form-urlencoded` format
- Xano focuses on simple user creation, not OAuth complexity

### Previous "Not numeric" Error (Fixed)

**Error:** `Exception: Not numeric` when running `linkedin_oauth_getaccesstoken`

**Root Causes (historical):**
1. Xano couldn't properly encode form data for LinkedIn token endpoint
2. The `linkedin_oauth` object schema had `id` field defined as numeric (should be text)
3. LinkedIn returns user IDs as strings, not numbers
4. LinkedIn doesn't return `id_token` like Google (can't use JWE Decode)

**Solution:** Use Vercel as proxy to handle LinkedIn OAuth, then call simplified Xano endpoint.

**New Xano Endpoint:** `POST /auth/linkedin/create_user`

**Inputs:**
- `linkedin_id` (text) - LinkedIn's user ID
- `email` (text)
- `name` (text)
- `given_name` (text)
- `family_name` (text)

**Function Stack:**
1. Get Record From user (WHERE auth_provider_id = linkedin_id)
2. Conditional: If user doesn't exist → Add Record, Else → Edit Record
3. Create Authentication Token
4. Return token + user data

**Required Environment Variables (Vercel):**
- `LINKEDIN_CLIENT_ID`
- `LINKEDIN_CLIENT_SECRET`
- `XANO_BASE_URL`

**Correct user creation inputs for your table:**
```
✅ name: {{first_name}} {{last_name}}
✅ email: {{email_from_linkedin}}
✅ fname: {{first_name}}
✅ lname: {{last_name}}
✅ auth_provider: "linkedin"
✅ auth_provider_id: {{linkedin_id_as_text}}
✅ linkedin_oauth: {
     "id": {{linkedin_id}},              // TEXT value, not numeric
     "name": {{first_name}} + " " + {{last_name}},
     "email": {{email}},
     "firstName": {{first_name}},
     "lastName": {{last_name}}
   }
❌ id: [REMOVE - auto-generated]
❌ created_at: [REMOVE - auto-generated]
```

**Important:** The `linkedin_oauth.id` field must be TEXT in the object schema, otherwise you'll get "Not numeric" error when LinkedIn returns a string ID.

**User table schema (actual):**
- `id` → int (auto-increment) - never set manually
- `auth_provider` → text (set to "linkedin")
- `auth_provider_id` → text (LinkedIn user ID as string)
- `linkedin_oauth` → object (full LinkedIn profile)
- `email`, `name`, `fname`, `lname` → text fields

**Common mistakes:**
- ❌ Using `WHERE id = {{linkedin_id}}` (compares int with text)
- ✅ Use `WHERE auth_provider_id = {{linkedin_id}}` (compares text with text)
- ❌ Converting `auth_provider_id` to number
- ✅ Keep `auth_provider_id` as text (LinkedIn IDs are strings)

**Note:** LinkedIn API returns user IDs as strings (e.g., "abc123xyz"), not numbers. Store in `auth_provider_id` TEXT field, separate from your auto-increment `id` field.

## Next Steps (from spec doc)

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

## Critical Notes

- Always stringify JSON fields before sending to Xano: `JSON.stringify(metadata)`
- Multi-segment videos: Create parent media_asset with `segment_index: null`
- Auth tokens: Never commit tokens or API keys to git
- Cloudflare UIDs: Store in Xano as `asset_id`, not as primary key
- OAuth state: Use sessionStorage for `qc_auth_in_progress` flag to prevent auto-logout
