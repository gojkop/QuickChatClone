# mindPick - Technical Architecture Overview

**Version:** 3.0  
**Last Updated:** October 2025  
**Status:** Production (Beta)

---

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    USERS / CLIENTS                           │
│                                                              │
│  Experts ←──────────→ www.mindpick.me                       │
│  Askers  ←──────────→ (Main App)                            │
│  Admins  ←──────────→ admin.mindpick.me                     │
│                       (Admin Console)                         │
└───────────────────────┬─────────────────────────────────────┘
                        │
        ┌───────────────┴───────────────┐
        │                               │
        ▼                               ▼
┌──────────────────┐           ┌──────────────────┐
│   VERCEL APP 1   │           │   VERCEL APP 2   │
│  Main Platform   │           │  Admin Console   │
│                  │           │                  │
│ • React + Vite   │           │ • React + Vite   │
│ • Tailwind CSS   │           │ • No Tailwind    │
│ • OAuth flows    │           │ • Admin RBAC     │
│ • Q&A interface  │           │ • Feature flags  │
│ • Media upload   │           │ • Analytics      │
└────────┬─────────┘           └────────┬─────────┘
         │                               │
         ▼                               ▼
┌────────────────────────────────────────────────────────────┐
│                   BACKEND SERVICES                          │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │   Xano DB   │  │  Neon DB    │  │   Stripe    │       │
│  │  (Primary)  │  │  (Control)  │  │  (Payments) │       │
│  └─────────────┘  └─────────────┘  └─────────────┘       │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │ Cloudflare  │  │  ZeptoMail  │  │   Gemini    │       │
│  │(Media/CDN)  │  │   (Email)   │  │    (AI)     │       │
│  └─────────────┘  └─────────────┘  └─────────────┘       │
└────────────────────────────────────────────────────────────┘
```

---

## Infrastructure Stack

### Hosting & Deployment

**Vercel Projects (2 deployments):**

| Project | Domain | Purpose | Build |
|---------|--------|---------|-------|
| **Main App** | www.mindpick.me | Expert/Asker platform | React + Vite |
| **Admin Console** | admin.mindpick.me | Admin operations | React + Vite (no Tailwind) |

**Configuration:**
- **Root Directory (Main):** `/` (project root)
- **Root Directory (Admin):** `/admin`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Node Version:** 18.x
- **Serverless Functions:** Node.js, 60s timeout

---

## Directory Structure

### Main Application (`/`)

```
project-root/
├── src/                        # Frontend React app
│   ├── pages/                  # Route pages
│   │   ├── HomePage.jsx
│   │   ├── AskQuestionPage.jsx
│   │   ├── ExpertDashboardPage.jsx
│   │   ├── SignInPage.jsx
│   │   └── TestAICoachPage.jsx
│   ├── components/             # UI components
│   │   ├── dashboard/          # Expert dashboard
│   │   ├── question/           # Question composition
│   │   ├── home/               # Landing page
│   │   └── common/             # Shared components
│   ├── hooks/                  # Custom React hooks
│   │   ├── useRecordingSegmentUpload.js
│   │   ├── useAttachmentUpload.js
│   │   ├── useQuestionCoach.js
│   │   └── useMarketing.js
│   ├── context/                # React Context
│   │   ├── AuthContext.jsx
│   │   └── FeatureFlagsContext.jsx
│   ├── api/                    # Axios client
│   │   └── index.js
│   └── router.jsx              # React Router config
│
├── api/                        # Vercel Serverless Functions
│   ├── questions/              # Question endpoints
│   │   ├── create.js
│   │   └── submit.js
│   ├── answer/                 # Answer endpoints
│   │   └── submit.js
│   ├── media/                  # Media upload
│   │   ├── get-upload-url.js   # Video (Stream)
│   │   ├── upload-audio.js     # Audio (R2)
│   │   └── upload-attachment.js # Files (R2)
│   ├── oauth/                  # Authentication
│   │   ├── google/
│   │   └── linkedin/
│   ├── ai/                     # AI features
│   │   └── coach/              # Question coaching
│   └── lib/                    # Shared utilities
│       ├── xano/               # Xano API client
│       ├── cloudflare/         # Media services
│       ├── llm-service.js      # AI abstraction
│       └── zeptomail.js        # Email service
│
├── public/                     # Static assets
├── vercel.json                 # Vercel config (main)
└── package.json
```

### Admin Console (`/admin`)

```
admin/
├── src/                        # Admin React app
│   ├── pages/                  # Admin pages
│   │   ├── Dashboard.jsx
│   │   ├── FeatureFlags.jsx
│   │   ├── Moderation.jsx
│   │   ├── Experts.jsx
│   │   └── Settings.jsx
│   ├── components/             # Admin UI
│   │   └── Layout.jsx
│   └── main.jsx
│
├── api/                        # Admin serverless functions
│   ├── auth/                   # Admin auth
│   │   ├── verify.js
│   │   └── logout.js
│   ├── flags/                  # Feature flags CRUD
│   │   ├── index.js            # GET/POST
│   │   └── public.js           # Public read-only
│   ├── feedback/               # Feedback system
│   └── _lib/                   # Admin utilities
│       └── respond.js
│
├── vercel.json                 # Admin routing config
├── postcss.config.cjs          # Override (no Tailwind)
└── package.json
```

---

## Database Architecture

### Xano (Primary Application Database)

**Purpose:** All user-facing data (questions, answers, profiles, payments)

**Key Tables:**
- `users` - User accounts (askers + experts)
- `expert_profile` - Expert profiles and settings
- `question` - Questions submitted to experts
- `answer` - Expert responses
- `media_asset` - Cloudflare media references
- `payment` - Stripe transaction records

**Access:**
- REST API: `https://xlho-4syv-navp.n7e.xano.io/api:3B14WLbJ`
- Authentication: JWT tokens (OAuth-generated)
- Rate Limits: Free tier limits apply

### Neon PostgreSQL (Admin Control Plane)

**Purpose:** Admin operations, feature flags, moderation, analytics

**Key Tables:**
- `admin_users` - Admin accounts with RBAC
- `admin_audit_log` - All admin actions logged
- `feature_flags` - Runtime feature control
- `feature_flag_audit` - Flag change history
- `feedback` - User feedback submissions
- `feedback_attachments` - Feedback files
- `moderation_queue` - Content review queue

**Access:**
- Connection string via `DATABASE_URL`
- Pooling enabled (serverless-friendly)
- Admin console only

---

## External Services

### Media Storage & Delivery

**Cloudflare Stream** (Video)
- **Purpose:** Video transcoding, adaptive bitrate, HLS delivery
- **Upload:** Direct upload via TUS protocol (FormData)
- **Playback:** `customer-{account}.cloudflarestream.com/{uid}/iframe`
- **Cost:** ~$5 per 1000 minutes stored

**Cloudflare R2** (Audio + Files)
- **Purpose:** Audio-only recordings, document attachments
- **Upload:** S3-compatible API
- **Access:** Public bucket at `pub-{account}.r2.dev`
- **Cost:** ~$0.015/GB/month (no egress fees)

### Authentication

**OAuth Providers:**
- **Google OAuth:** Xano handles full flow
- **LinkedIn OAuth:** Vercel handles flow, calls Xano for user creation
- **Tokens:** JWT stored in localStorage (`qc_token`)
- **Session:** 24-hour expiration

### AI Services

**Google Gemini** (Question Coach)
- **Model:** `gemini-2.0-flash`
- **Tier:** Free tier (1,500 requests/day)
- **Features:** Question validation, coaching, clarifications
- **Cost:** $0.00 (current usage)

**Future AI:**
- Expert Co-pilot (not yet implemented)
- Knowledge Graph (planned, Neo4j + OpenAI)

### Email Notifications

**ZeptoMail** (Transactional)
- **Region:** EU (`api.zeptomail.eu`)
- **Templates:** Sign-in, new question, answer received
- **Delivery:** Non-blocking, <5s typical
- **Cost:** Free tier (10,000/month)

### Payments

**Stripe** (Payment Processing)
- **Flow:** Pre-authorization → question created → charge on answer
- **Fees:** ~2.9% + €0.30 per transaction (expert pays)
- **Payouts:** Direct to expert Stripe accounts
- **Refunds:** Automated for SLA misses

---

## Request Flow Examples

### Question Submission

```
1. User records video → MediaRecorder API (browser)
2. Upload video → POST /api/media/get-upload-url
3. Frontend uploads → Cloudflare Stream (direct, FormData)
4. Get Cloudflare UID → Store in state
5. Submit question → POST /api/questions/create
6. Xano stores → question record + media_asset record
7. Email expert → ZeptoMail API (non-blocking)
8. AI processing → Background job (Tier 3 enhancement)
```

### Answer Submission

```
1. Expert records answer → AnswerRecorder component
2. Upload media → Same flow as question
3. Submit answer → POST /api/answer/submit
4. Xano stores → answer record + media_asset
5. Update question → status = 'answered'
6. Stripe charge → Capture pre-authorized payment
7. Email asker → ZeptoMail (answer received)
8. AI co-pilot → Process answer for knowledge graph (future)
```

### Feature Flag Check

```
1. App loads → Fetch flags from admin API
2. GET /api/flags/public → Edge-cached (5 min TTL)
3. Frontend stores → React Context
4. Component checks → if (isEnabled('feature_key'))
5. Admin updates flag → POST /api/flags (admin auth)
6. Propagates → Within 5 minutes (cache expiry)
```

---

## Key Integrations

### Authentication Flow (LinkedIn Example)

```
1. User clicks "Sign in with LinkedIn"
2. Vercel: /api/oauth/linkedin/init → Generate auth URL
3. Redirect to LinkedIn → User authorizes
4. LinkedIn redirects → /auth/callback
5. Vercel: /api/oauth/linkedin/continue → Exchange code
6. Vercel fetches → LinkedIn /v2/userinfo
7. Vercel calls Xano → /auth/linkedin/create_user
8. Xano returns → JWT token
9. Frontend stores → localStorage.qc_token
10. Redirect → /expert or /dashboard
```

### Media Upload Flow (Video)

```
1. Frontend: Record video blob → MediaRecorder
2. POST /api/media/get-upload-url → Get Cloudflare URL
3. FormData upload → Cloudflare Direct Upload
4. Cloudflare returns → { uid, uploadURL }
5. Frontend constructs → Playback URL
6. Submit question → Reference UID in Xano
7. Xano creates → media_asset record
```

### Payment Flow (Stripe)

```
1. User enters email → /ask page
2. Create PaymentIntent → Stripe API (pre-auth)
3. User submits question → Payment held
4. Expert answers → Trigger charge capture
5. Stripe transfers → Expert account (minus fees)
6. Update Xano → payment status
7. SLA miss → Automatic refund
```

---

## Environment Variables

### Main App (Vercel)

**Required:**
```bash
# Xano
XANO_BASE_URL=https://xlho-4syv-navp.n7e.xano.io/api:3B14WLbJ

# Cloudflare Media
CLOUDFLARE_ACCOUNT_ID=xxx
CLOUDFLARE_STREAM_API_TOKEN=xxx
CLOUDFLARE_R2_ACCESS_KEY=xxx
CLOUDFLARE_R2_SECRET_KEY=xxx
CLOUDFLARE_R2_BUCKET=quickchat-media
CLOUDFLARE_R2_PUBLIC_URL=https://pub-xxx.r2.dev

# OAuth
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
LINKEDIN_CLIENT_ID=xxx
LINKEDIN_CLIENT_SECRET=xxx
CLIENT_PUBLIC_ORIGIN=https://www.mindpick.me

# AI
LLM_PROVIDER=gemini
GOOGLE_AI_API_KEY=xxx

# Email
ZEPTOMAIL_TOKEN=Zoho-enczapikey xxx
ZEPTOMAIL_FROM_EMAIL=noreply@mindpick.me
ZEPTOMAIL_FROM_NAME=mindPick Notification

# Payments
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxx
```

**Frontend (Vite):**
```bash
VITE_CLOUDFLARE_ACCOUNT_ID=xxx
VITE_ADMIN_API_URL=https://admin.mindpick.me/api
VITE_APP_STAGE=production
VITE_SHOW_FEEDBACK=true
```

### Admin Console (Vercel)

**Required:**
```bash
# Database
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require

# Xano (for admin auth)
XANO_BASE_URL=https://xlho-4syv-navp.n7e.xano.io/api:3B14WLbJ

# Admin Auth
ADMIN_JWT_SECRET=xxx

# CORS
CORS_ALLOW_ORIGIN=https://admin.mindpick.me

# Optional: Jira Integration
JIRA_BASE_URL=https://mindpick.atlassian.net
JIRA_EMAIL=xxx
JIRA_API_TOKEN=xxx
JIRA_PROJECT_KEY=MINDPICK
JIRA_WEBHOOK_SECRET=xxx
```

---

## Security Model

### Authentication

**Main App:**
- JWT tokens from OAuth providers (Google/LinkedIn)
- Token stored in `localStorage.qc_token`
- Auto-logout on 401 (except during OAuth)
- Cross-tab sync via `localStorage` events

**Admin Console:**
- Separate `admin_session` JWT (15 min TTL)
- HttpOnly cookies (CSRF protection)
- Role-based access control (super_admin, support_admin)
- Token version check (revokable sessions)

### Authorization

**API Endpoints:**
- Authenticated: Require JWT in `Authorization: Bearer {token}`
- Public: Question submission, OAuth callbacks, feature flag reads
- Admin-only: All `/api/flags`, `/api/feedback`, etc.

**Row-Level Security:**
- Experts can only access their own questions/answers
- Admins can access all data (with audit logging)
- Askers access via unique playback tokens (no auth)

---

## Performance & Scaling

### Current Performance

| Metric | Target | Actual |
|--------|--------|--------|
| API response time (p95) | <200ms | ~120ms |
| Video upload (30s) | <10s | ~4s |
| Dashboard load | <2s | ~1.5s |
| Question submission | <5s | ~3s |

### Caching Strategy

**Edge Caching:**
- Feature flags: 5 min (`s-maxage=300`)
- Static assets: 1 year (Vite build hashes)

**Application Caching:**
- Marketing analytics: 30 seconds (future)
- Expert profiles: 5 minutes (future)

### Scalability Limits (Current)

**Bottlenecks:**
- Xano Free Tier: Rate limits (~1000 req/hour)
- Cloudflare Stream: Processing delay (1-2 min)
- Vercel Functions: 60s timeout (chunked upload workaround)

**Mitigation:**
- Upgrade Xano to Pro ($99/month) at 500+ questions/day
- Implement Redis caching for hot paths
- Use background jobs for slow operations

---

## Monitoring & Observability

### Logging

**Vercel Function Logs:**
- All serverless function invocations
- Console.log statements visible
- Automatic error capture

**Application Logs:**
- LLM API calls (cost tracking)
- Upload failures (media)
- Payment events (Stripe webhooks)
- Admin actions (audit log in Neon)

### Error Tracking

**Current:** Console logging + Vercel logs

**Planned:**
- Sentry integration (frontend + backend)
- Structured logging (JSON format)
- Alert thresholds (error rate >5%)

### Metrics Dashboards

**Admin Console:**
- Total feedback submissions
- Feature flag usage
- Moderation queue length
- Admin action audit trail

**Planned:**
- Question submission funnel
- Expert response time (SLA compliance)
- Payment success rate
- User retention cohorts

---

## Deployment Process

### Main App

```bash
# Automatic on push to main
git push origin main

# Manual via CLI
vercel --prod

# Preview deployments
git push origin feature-branch
# → Automatic preview URL
```

### Admin Console

```bash
# Deploy admin project
cd admin
vercel --prod

# Set environment variables
vercel env add DATABASE_URL production
vercel env add ADMIN_JWT_SECRET production
```

### Database Migrations

**Xano:**
- Manual via Xano UI
- No migration scripts (UI-driven)

**Neon:**
- SQL migrations in `/admin/migrations/`
- Run manually via `psql` or Neon console

---

## Development Workflow

### Local Development

```bash
# Main app
npm install
npm run dev          # Port 5173

# Admin console
cd admin
npm install
npm run dev          # Port 5174

# Test endpoints locally
npm run vercel:dev   # Port 3000
```

### Environment Setup

1. Copy `.env.example` → `.env.local`
2. Get credentials from Vercel dashboard
3. Test with `/api/test-llm` and `/api/test-email`

### Common Commands

```bash
# Build for production
npm run build
npm run preview

# Deploy
git push origin main

# View logs
vercel logs

# Check environment
vercel env ls
```

---

## Architecture Decisions

### Why Two Vercel Projects?

**Rationale:**
- Separate concerns (main app vs admin)
- Independent deploys (admin changes don't affect main)
- Different dependencies (admin has no Tailwind)
- Security isolation (admin on separate domain)

### Why Xano + Neon (Two Databases)?

**Xano (Main):**
- ✅ Fast REST API generation
- ✅ OAuth integrations built-in
- ✅ No backend code needed for CRUD
- ❌ Limited for complex queries

**Neon (Admin):**
- ✅ Full PostgreSQL for complex joins
- ✅ Better for admin analytics
- ✅ Audit logging with triggers
- ✅ Lower cost at scale

### Why Cloudflare Over AWS?

**Cloudflare Stream:**
- ✅ Adaptive bitrate out-of-box
- ✅ No egress fees
- ✅ Global CDN included

**Cloudflare R2:**
- ✅ S3-compatible API
- ✅ $0 egress fees (vs. AWS $0.09/GB)
- ✅ 10x cheaper storage

---

## Known Limitations

**Current:**
1. Xano rate limits (free tier)
2. No real-time notifications (polling only)
3. Single-region deployment (EU-focused)
4. No mobile app (PWA in progress)

**Planned Improvements:**
1. WebSocket support (real-time updates)
2. Multi-region Vercel deployment
3. Redis caching layer
4. Dedicated mobile apps (React Native)

---

## Support & Maintenance

**Documentation:**
- Main: `docs/CLAUDE.md`
- Architecture: This file
- Feature specs: `docs/` folder

**Monitoring:**
- Vercel Dashboard: https://vercel.com/{project}
- Xano Dashboard: https://app.xano.io
- Neon Console: https://console.neon.tech

**Incident Response:**
1. Check Vercel function logs
2. Check Xano API status
3. Check Cloudflare status page
4. Review recent deployments
5. Rollback if needed: `vercel rollback`

---

**Document Version:** 1.0  
**Maintained By:** Bogdan & Gojko  
**Last Review:** October 13, 2025  
**Next Review:** After major architectural changes