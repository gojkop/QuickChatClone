# mindPick Feedback System - Implementation Documentation

## Strategic Overview

### Purpose & Vision

The mindPick Feedback System is a **product intelligence engine** that transforms user feedback from a reactive support tool into a proactive strategic asset. It serves dual purposes across our product lifecycle:

**Pre-GA Phase (Current):**
- Validate product-market fit through real user insights
- Identify and prioritize critical bugs blocking launch
- Gather feature requests to inform roadmap
- Test user journey flows and identify friction points
- Build relationship with early adopters through responsive feedback loops

**Post-GA Phase (Future):**
- Continuous product improvement through user voice
- Data-driven feature prioritization
- Early warning system for churn signals
- Customer satisfaction tracking (NPS-style)
- Support ticket deflection through pattern identification

### System Philosophy

**"Feedback, Not Support"**
- Users share suggestions voluntarily (not urgent help requests)
- No expectation of immediate response
- Drives product decisions, not operational fixes
- Complements (not replaces) traditional support systems

**Key Principles:**
1. **Frictionless Collection** - One-click widget, auto-captured context
2. **Rich Context** - Journey stage, device, user state automatically tracked
3. **Intelligent Routing** - Auto-categorization and priority detection
4. **Workflow Integration** - Seamless Jira sync for engineering
5. **Privacy-First** - Explicit consent, optional email, GDPR-ready

---

## System Architecture

### High-Level Components

```
┌─────────────────────────────────────────────────────────────┐
│                    USER TOUCHPOINTS                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Main App (www.mindpick.me)                                 │
│  └─ FeedbackWidget.jsx                                      │
│     └─ Collects feedback + context                          │
│     └─ Posts to Admin API                                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                         │
                         ↓ HTTPS POST
┌─────────────────────────────────────────────────────────────┐
│                    ADMIN BACKEND                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Admin API (admin.mindpick.me/api)                          │
│  ├─ Feedback CRUD endpoints                                 │
│  ├─ Analytics aggregation                                   │
│  ├─ Jira integration                                        │
│  └─ Webhook receiver                                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                         │
                         ↓ SQL
┌─────────────────────────────────────────────────────────────┐
│                   CONTROL PLANE DB                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Neon PostgreSQL                                             │
│  ├─ feedback (main table)                                   │
│  ├─ feedback_attachments                                    │
│  ├─ feedback_comments                                       │
│  ├─ feedback_tags                                           │
│  ├─ feedback_analytics (aggregated)                         │
│  └─ admin_audit_log (existing)                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                         │
                         ↓ Admin Auth
┌─────────────────────────────────────────────────────────────┐
│                    ADMIN UI                                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Admin Dashboard (admin.mindpick.me/feedback)               │
│  ├─ KPI cards (total, rating, pending)                     │
│  ├─ Filterable feedback table                               │
│  ├─ Detail panel with full context                          │
│  ├─ Jira ticket creation                                    │
│  ├─ Comment system                                          │
│  └─ Analytics charts                                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                         │
                         ↓ REST API
┌─────────────────────────────────────────────────────────────┐
│                  EXTERNAL SYSTEMS                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Jira (mindpick.atlassian.net)                              │
│  ├─ Create tickets from feedback                            │
│  ├─ Upload attachments                                      │
│  ├─ Two-way sync via webhooks                               │
│  └─ Status/priority mapping                                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend (Widget - Main App):**
- React 18 with hooks
- React Router for navigation
- Auth Context for user state
- Native File API for attachments
- LocalStorage for session tracking

**Frontend (Dashboard - Admin App):**
- Vite + React
- React Router v6
- Recharts for analytics visualization
- Custom UI component library
- Toast notifications

**Backend (Admin API):**
- Vercel Serverless Functions (Node.js 18+)
- Neon Serverless PostgreSQL
- JWT for admin sessions
- Jira REST API v3

**Infrastructure:**
- Vercel (2 projects: main app + admin)
- Neon (serverless Postgres)
- Cloudflare R2 (file storage)
- Jira Cloud

---

## Database Architecture

### Schema Design Principles

1. **Separate Control Plane** - Feedback system uses Neon DB (not Xano) for admin operations
2. **Soft Deletes** - All records have `deleted_at` for audit trail
3. **Temporal Tracking** - `created_at`, `updated_at`, `resolved_at` for analytics
4. **JSON Flexibility** - JSONB fields for dynamic data (viewport, previous_actions)
5. **Relational Integrity** - Foreign keys where appropriate, but loose coupling to Xano

### Core Tables

#### **feedback** (Main Table)
**Purpose:** Store all user feedback with rich metadata

**Key Fields:**
- `id` (UUID, PK) - Unique identifier
- `user_id` (INT, nullable) - Xano user ID (if authenticated)
- `session_id` (VARCHAR) - Browser fingerprint for tracking
- `email` (CITEXT, nullable) - Contact info
- `type` (ENUM) - bug, feature, feedback, question, other
- `message` (TEXT) - User's feedback (10-2000 chars)
- `rating` (INT 1-5, nullable) - Satisfaction rating
- `status` (ENUM) - new, in_progress, resolved, archived, duplicate, wont_fix
- `priority` (ENUM) - low, medium, high, critical

**Context Fields:**
- `page_url` (TEXT) - Where feedback originated
- `page_title` (VARCHAR)
- `referrer` (TEXT)
- `user_agent` (TEXT)
- `device_type` (ENUM) - desktop, tablet, mobile
- `viewport` (JSONB) - {width, height}

**User State:**
- `user_role` (ENUM) - guest, asker, expert
- `is_authenticated` (BOOLEAN)
- `account_age_days` (INT)

**Journey Tracking:**
- `journey_stage` (ENUM) - awareness, consideration, conversion, retention
- `previous_actions` (JSONB) - Last 5 user actions
- `time_on_page` (INT) - Seconds
- `scroll_depth` (NUMERIC) - Percentage
- `interactions_count` (INT)

**Type-Specific Fields:**

*For Bugs:*
- `bug_severity` (ENUM) - low, medium, high, critical
- `expected_behavior` (TEXT)
- `actual_behavior` (TEXT)
- `reproduction_steps` (TEXT)

*For Features:*
- `problem_statement` (TEXT)
- `current_workaround` (TEXT)
- `similar_features` (TEXT[])
- `priority_vote` (INT 1-10)

**AI/ML Fields (Async Processing):**
- `sentiment_score` (NUMERIC -1 to 1)
- `detected_emotions` (TEXT[])
- `urgency_level` (ENUM) - low, medium, high
- `auto_category_confidence` (NUMERIC)

**Workflow:**
- `assigned_to` (INT) - Admin user ID
- `jira_ticket_key` (VARCHAR) - MINDPICK-123
- `jira_ticket_url` (TEXT)
- `jira_created_at` (TIMESTAMP)
- `jira_synced_at` (TIMESTAMP)

**Timestamps:**
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)
- `resolved_at` (TIMESTAMP, nullable)
- `archived_at` (TIMESTAMP, nullable)
- `deleted_at` (TIMESTAMP, nullable)

**Privacy:**
- `analytics_consent` (BOOLEAN)
- `contact_consent` (BOOLEAN)
- `screenshot_consent` (BOOLEAN)

**Indexes:**
- `idx_feedback_user_id` - Filter by user
- `idx_feedback_type` - Filter by type
- `idx_feedback_status` - Filter by status
- `idx_feedback_created_at` - Sort by date (DESC)
- `idx_feedback_priority` - Filter by priority
- `idx_feedback_jira_ticket` - Find by Jira key
- `idx_feedback_session` - Track user sessions
- `idx_feedback_journey` - Filter by journey stage
- `idx_feedback_message_fts` - Full-text search (GIN)

#### **feedback_attachments**
**Purpose:** Store file attachments (screenshots, videos, logs)

**Fields:**
- `id` (SERIAL, PK)
- `feedback_id` (UUID, FK → feedback.id)
- `file_type` (ENUM) - screenshot, video, log, document
- `file_name` (VARCHAR)
- `file_size` (INT) - Bytes, max 10MB
- `mime_type` (VARCHAR)
- `storage_provider` (VARCHAR) - 'cloudflare_r2'
- `storage_key` (TEXT) - R2 object key
- `storage_url` (TEXT) - Public URL
- `width` (INT, nullable) - For images
- `height` (INT, nullable)
- `detected_text` (TEXT, nullable) - OCR results
- `uploaded_at` (TIMESTAMP)

**Indexes:**
- `idx_attachments_feedback` - Get all attachments for feedback

#### **feedback_comments**
**Purpose:** Internal admin notes on feedback

**Fields:**
- `id` (SERIAL, PK)
- `feedback_id` (UUID, FK → feedback.id)
- `admin_user_id` (INT, FK → admin_users.id, nullable)
- `comment` (TEXT)
- `is_internal` (BOOLEAN) - True = admin-only, False = visible to user
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Indexes:**
- `idx_comments_feedback` - Get comments for feedback (DESC)
- `idx_comments_admin` - Get comments by admin

#### **feedback_tags**
**Purpose:** Reusable categorization labels

**Fields:**
- `id` (SERIAL, PK)
- `name` (VARCHAR, UNIQUE) - e.g., "login", "payment", "ui-ux"
- `color` (VARCHAR) - Hex code for UI
- `description` (TEXT)
- `created_at` (TIMESTAMP)

**Seed Tags:**
- login, payment, ui-ux, performance, feature-request, bug, critical, enhancement, documentation, mobile, expert-dashboard, ask-flow, video-quality, sla

#### **feedback_tag_assignments**
**Purpose:** Many-to-many relationship between feedback and tags

**Fields:**
- `feedback_id` (UUID, FK → feedback.id)
- `tag_id` (INT, FK → feedback_tags.id)
- `assigned_by` (INT, FK → admin_users.id)
- `assigned_at` (TIMESTAMP)

**Primary Key:** (`feedback_id`, `tag_id`)

**Indexes:**
- `idx_tag_assignments_feedback`
- `idx_tag_assignments_tag`

#### **feedback_analytics**
**Purpose:** Daily aggregated metrics for dashboard (performance optimization)

**Fields:**
- `date` (DATE, PK)
- `total_count` (INT)
- `bug_count` (INT)
- `feature_count` (INT)
- `feedback_count` (INT)
- `question_count` (INT)
- `other_count` (INT)
- `avg_rating` (NUMERIC)
- `ratings_count` (INT)
- `authenticated_count` (INT)
- `anonymous_count` (INT)
- `with_email_count` (INT)
- `wants_followup_count` (INT)
- `desktop_count` (INT)
- `mobile_count` (INT)
- `tablet_count` (INT)
- `awareness_count` (INT)
- `consideration_count` (INT)
- `conversion_count` (INT)
- `retention_count` (INT)
- `resolved_count` (INT)
- `avg_resolution_hours` (NUMERIC)
- `jira_tickets_created` (INT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Updated By:** Daily cron job or on-demand aggregation

#### **feedback_similarities**
**Purpose:** Track similar feedback for duplicate detection (future AI feature)

**Fields:**
- `feedback_id_1` (UUID, FK → feedback.id)
- `feedback_id_2` (UUID, FK → feedback.id)
- `similarity_score` (NUMERIC 0-1) - Cosine similarity
- `detected_at` (TIMESTAMP)

**Constraint:** `feedback_id_1 < feedback_id_2` (avoid duplicates)

### Database Triggers

**`update_updated_at_column`**
- Automatically sets `updated_at = NOW()` on UPDATE
- Applied to: feedback, feedback_comments

**`log_feedback_changes`**
- Logs significant changes to `admin_audit_log`
- Tracks: status, priority, assigned_to, jira_ticket_key changes
- Captures before/after snapshots

### Views

**`active_feedback`**
- Pre-filtered view excluding archived/deleted items
- Used by dashboard for quick queries

**`urgent_feedback`**
- High/critical priority + new status
- Sorted by priority DESC, created_at ASC

**`feedback_with_tags`**
- Joins feedback with all assigned tags (JSON aggregation)
- Performance optimization for list view

---

## Journey Stage Detection

### Automatic Classification Logic

Journey stages are **automatically inferred** from the page URL and authentication state. This provides context without user input.

**Implementation Pattern:**
```javascript
function detectJourneyStage(pathname, isAuthenticated) {
  // Awareness: Public marketing pages
  if (['/', '/pricing', '/social-impact', '/faq'].includes(pathname)) {
    return 'awareness';
  }
  
  // Consideration: Exploring experts, comparing options
  if (pathname.startsWith('/u/') || pathname === '/experts') {
    return 'consideration';
  }
  
  // Conversion: Taking action to transact
  if (['/ask', '/signin', '/payment'].some(p => pathname.includes(p))) {
    return 'conversion';
  }
  
  // Retention: Active usage of the product
  if (isAuthenticated && ['/expert', '/dashboard'].some(p => pathname.includes(p))) {
    return 'retention';
  }
  
  return null; // Unknown stage
}
```

### Strategic Value by Stage

**Awareness (Homepage, Pricing):**
- Feedback here affects EVERY visitor
- High priority for conversion optimization
- Examples: "Pricing is unclear", "Video doesn't load"

**Consideration (Expert Profiles):**
- Impacts decision to transact
- Trust and credibility signals
- Examples: "How do I know this expert is good?", "Pricing seems high"

**Conversion (Ask Flow, Payment):**
- CRITICAL - directly blocks revenue
- Immediate fixes needed
- Examples: "Payment page feels sketchy", "Can't upload video"

**Retention (Dashboards):**
- Affects churn and LTV
- Feature requests and enhancements
- Examples: "Add export feature", "Dashboard is slow"

---

## API Architecture

### Endpoint Design Principles

1. **RESTful Conventions** - Standard HTTP methods (GET, POST, PATCH, DELETE)
2. **Admin Authentication Required** - All endpoints except POST /feedback
3. **Pagination** - List endpoints support page, limit, offset
4. **Filtering** - Query params for type, status, priority, journey, etc.
5. **Soft Deletes** - DELETE = set deleted_at, not physical deletion
6. **Audit Trail** - All mutations logged to admin_audit_log

### Core Endpoints

#### **POST /api/feedback**
**Purpose:** Create new feedback (public endpoint, no auth required)

**Request Body:**
```json
{
  // Required
  "type": "bug|feature|feedback|question|other",
  "message": "string (10-2000 chars)",
  "page_url": "string",
  "session_id": "string",
  "user_agent": "string",
  
  // Optional but recommended
  "user_id": 123,
  "email": "user@example.com",
  "wants_followup": true,
  "rating": 4,
  "device_type": "desktop|mobile|tablet",
  "viewport": {"width": 1920, "height": 1080},
  "journey_stage": "awareness|consideration|conversion|retention",
  "is_authenticated": true,
  "user_role": "guest|asker|expert",
  
  // Type-specific (bug)
  "bug_severity": "low|medium|high|critical",
  "expected_behavior": "Should redirect to dashboard",
  "actual_behavior": "Button spins forever",
  "reproduction_steps": "1. Click login, 2. Wait",
  
  // Type-specific (feature)
  "problem_statement": "I'm trying to export data",
  "current_workaround": "Manual copy-paste",
  
  // Engagement
  "time_on_page": 120,
  "scroll_depth": 75.5,
  "interactions_count": 15,
  "previous_actions": [{"action": "click_button", "timestamp": 1234567890}],
  
  // Attachments (if any)
  "attachments": [
    {
      "file_type": "screenshot",
      "file_name": "bug.png",
      "file_size": 245678,
      "mime_type": "image/png",
      "storage_key": "feedback/uuid_bug.png",
      "storage_url": "https://r2.cloudflare.com/..."
    }
  ],
  
  // Privacy
  "analytics_consent": true,
  "contact_consent": true,
  "screenshot_consent": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "feedback_id": "uuid-here",
  "message": "Thank you! Your feedback helps us improve."
}
```

**Validation:**
- Message: 10-2000 characters
- Type: must be valid enum
- Rating: 1-5 if provided
- File size: max 10MB per attachment

---

#### **GET /api/feedback**
**Purpose:** List feedback with filters (admin only)

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20, max: 100)
- `type` (bug|feature|feedback|question|other)
- `status` (new|in_progress|resolved|archived|duplicate|wont_fix)
- `priority` (low|medium|high|critical)
- `journey_stage` (awareness|consideration|conversion|retention)
- `search` (full-text search on message)
- `assigned_to` (admin_user_id or 'unassigned')
- `has_email` (true|false)
- `date_from` (ISO date)
- `date_to` (ISO date)
- `sort_by` (created_at|updated_at|priority|rating|type|status)
- `sort_order` (asc|desc)

**Response (200 OK):**
```json
{
  "feedback": [
    {
      "id": "uuid",
      "type": "bug",
      "message": "Login button not working",
      "status": "new",
      "priority": "high",
      "journey_stage": "conversion",
      "rating": 2,
      "email": "user@example.com",
      "page_url": "/signin",
      "device_type": "desktop",
      "created_at": "2025-10-12T14:30:00Z",
      "tags": [
        {"id": 1, "name": "login", "color": "#EF4444"}
      ],
      "attachment_count": 2,
      "comment_count": 1,
      "jira_ticket_key": null
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 328,
    "pages": 17
  }
}
```

---

#### **GET /api/feedback/:id**
**Purpose:** Get single feedback with all related data (admin only)

**Response (200 OK):**
```json
{
  "feedback": {
    "id": "uuid",
    "type": "bug",
    "message": "...",
    // ... all fields from main table
    "tags": [{"id": 1, "name": "login", "color": "#EF4444"}]
  },
  "attachments": [
    {
      "id": 1,
      "file_name": "screenshot.png",
      "file_size": 245678,
      "storage_url": "https://...",
      "uploaded_at": "2025-10-12T14:31:00Z"
    }
  ],
  "comments": [
    {
      "id": 1,
      "comment": "Following up with user",
      "admin_name": "Bogdan",
      "created_at": "2025-10-12T15:00:00Z"
    }
  ],
  "similar": [
    {
      "id": "other-uuid",
      "message": "Login problems",
      "similarity_score": 0.87
    }
  ]
}
```

---

#### **PATCH /api/feedback/:id**
**Purpose:** Update feedback status, priority, assignment (admin only)

**Request Body:**
```json
{
  "status": "in_progress",
  "priority": "high",
  "assigned_to": 123
}
```

**Response (200 OK):**
```json
{
  "feedback": {/* updated record */},
  "message": "Feedback updated successfully"
}
```

**Auto-Behavior:**
- Setting status to 'resolved' → sets `resolved_at = NOW()`
- Setting status to 'archived' → sets `archived_at = NOW()`
- All changes logged to `admin_audit_log`

---

#### **DELETE /api/feedback/:id**
**Purpose:** Soft delete feedback (admin only)

**Response (200 OK):**
```json
{
  "message": "Feedback archived successfully"
}
```

**Behavior:** Sets `deleted_at = NOW()`, does NOT physically delete

---

#### **POST /api/feedback/comments**
**Purpose:** Add internal comment to feedback (admin only)

**Request Body:**
```json
{
  "feedback_id": "uuid",
  "comment": "Following up with user about this issue",
  "is_internal": true
}
```

**Response (200 OK):**
```json
{
  "comment": {
    "id": 1,
    "feedback_id": "uuid",
    "comment": "...",
    "admin_name": "Bogdan",
    "created_at": "2025-10-12T15:00:00Z"
  }
}
```

---

#### **GET /api/feedback/tags**
**Purpose:** List all available tags (admin only)

**Response (200 OK):**
```json
{
  "tags": [
    {"id": 1, "name": "login", "color": "#EF4444", "description": "Login issues"},
    {"id": 2, "name": "payment", "color": "#F59E0B"}
  ]
}
```

---

#### **POST /api/feedback/tags**
**Purpose:** Assign tags to feedback (admin only)

**Request Body:**
```json
{
  "feedback_id": "uuid",
  "tag_ids": [1, 2, 5]
}
```

**Response (200 OK):**
```json
{
  "message": "Tags updated successfully"
}
```

**Behavior:** Replaces ALL existing tags with new set

---

#### **GET /api/feedback/analytics**
**Purpose:** Get dashboard statistics (admin only)

**Query Parameters:**
- `days` (default: 30) - Look back period

**Response (200 OK):**
```json
{
  "summary": {
    "total_count": 328,
    "avg_rating": "4.2",
    "new_count": 42,
    "in_progress_count": 15,
    "resolved_count": 265,
    "with_email_count": 198,
    "with_jira_count": 87,
    "avg_response_hours": "18.5"
  },
  "by_type": [
    {"type": "bug", "count": 120},
    {"type": "feature", "count": 95}
  ],
  "by_journey": [
    {"journey_stage": "conversion", "count": 145},
    {"journey_stage": "awareness", "count": 98}
  ],
  "by_device": [
    {"device_type": "desktop", "count": 215},
    {"device_type": "mobile", "count": 98}
  ],
  "trend": [
    {
      "date": "2025-10-01",
      "count": 12,
      "bugs": 5,
      "features": 4,
      "feedback": 3,
      "avg_rating": "4.1"
    }
  ],
  "top_pages": [
    {"page_url": "/signin", "count": 45},
    {"page_url": "/pricing", "count": 32}
  ]
}
```

---

#### **POST /api/feedback/jira**
**Purpose:** Create Jira ticket from feedback (admin only)

**Query Parameter:**
- `id` - Feedback UUID

**Request Body:** (Optional - can pass via query or body)
```json
{
  "feedback_id": "uuid"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "jira_ticket": {
    "key": "MINDPICK-123",
    "id": "10001",
    "url": "https://mindpick.atlassian.net/browse/MINDPICK-123"
  },
  "message": "Jira ticket created successfully"
}
```

**Behavior:**
1. Fetches feedback + attachments from DB
2. Creates Jira ticket with auto-generated description
3. Uploads attachments to Jira
4. Updates feedback record with `jira_ticket_key`, `jira_ticket_url`, `jira_created_at`
5. Logs action to `admin_audit_log`

**Error (409 Conflict):**
```json
{
  "error": "Jira ticket already exists",
  "ticket_key": "MINDPICK-123",
  "ticket_url": "https://..."
}
```

---

#### **POST /api/jira-webhook**
**Purpose:** Receive webhooks from Jira for two-way sync (public, webhook-verified)

**Request Body (from Jira):**
```json
{
  "webhookEvent": "jira:issue_updated",
  "issue": {
    "key": "MINDPICK-123",
    "fields": {
      "status": {"name": "Done"},
      "priority": {"name": "High"}
    }
  }
}
```

**Response (200 OK):**
```json
{
  "message": "Webhook processed"
}
```

**Behavior:**
1. Finds feedback by `jira_ticket_key`
2. Maps Jira status/priority to feedback equivalents
3. Updates feedback record
4. Adds internal comment about sync
5. Sets `jira_synced_at = NOW()`

**Status Mapping:**
- Jira "To Do" → feedback "new"
- Jira "In Progress" → feedback "in_progress"
- Jira "Done"/"Closed" → feedback "resolved"

**Priority Mapping:**
- Jira "Highest" → feedback "critical"
- Jira "High" → feedback "high"
- Jira "Medium" → feedback "medium"
- Jira "Low" → feedback "low"

---

## Jira Integration Details

### Ticket Creation Flow

**When admin clicks "Create Jira Ticket":**

1. **Fetch Feedback Data**
   - Get full feedback record
   - Get all attachments
   - Get existing comments

2. **Build Jira Payload**
   - **Summary:** `[FEEDBACK-{id_short}] {message_preview}`
   - **Description:** Auto-generated markdown with:
     - Reporter info (email, user ID)
     - User message
     - Context (page, device, journey stage)
     - Bug details (expected/actual behavior)
     - Feature details (problem statement)
     - Link back to admin dashboard
   - **Issue Type:** Maps feedback type → Jira issue type
     - bug → Bug
     - feature → Story
     - feedback/question/other → Task
   - **Priority:** Maps feedback priority → Jira priority
   - **Labels:** 
     - user-feedback
     - {type}
     - journey-{stage}
     - {device_type}
     - authenticated/anonymous

3. **Create Issue via API**
   - POST to `/rest/api/3/issue`
   - Basic auth with email + API token

4. **Upload Attachments**
   - For each attachment, download from R2
   - POST to `/rest/api/3/issue/{key}/attachments`
   - Set X-Atlassian-Token: no-check

5. **Update Feedback Record**
   - Set jira_ticket_key, jira_ticket_url
   - Set jira_created_at
   - Log to audit trail

### Two-Way Sync

**Jira → Admin Dashboard (via webhook):**

When issue is updated in Jira:
1. Webhook fires to `/api/jira-webhook`
2. Find feedback by ticket key
3. Map status/priority changes
4. Update feedback record
5. Add internal comment about sync

**Admin Dashboard → Jira:**

When feedback is updated in admin:
1. If jira_ticket_key exists
2. Call Jira API to update issue
3. Add comment to Jira ticket
4. Transition status if changed

### Webhook Configuration

**In Jira:**
1. Settings → System → Webhooks
2. Create new webhook:
   - URL: `https://admin.mindpick.me/api/jira-webhook`
   - Events: Issue updated, Comment created
   - JQL: `project = MINDPICK AND labels = user-feedback`
   - Secret: Store in `JIRA_WEBHOOK_SECRET` env var

---

## Widget Implementation Details

### Progressive Disclosure Flow

**Step 1: Type Selection**
```
┌─────────────────────────────────┐
│  What brings you here today?    │
├─────────────────────────────────┤
│  [🐛 Report a bug         ]     │
│  [💡 Suggest a feature    ]     │
│  [😊 Share feedback       ]     │
│  [❓ Ask a question       ]     │
└─────────────────────────────────┘
```

**Step 2: Form (Adaptive Fields)**

*Always Show:*
- Current page (read-only badge)
- Rating (1-5 stars, optional)
- Message (textarea, 10-2000 chars, required)
- Email (pre-filled if authenticated)
- Want follow-up? (checkbox, only if email provided)

*For Bugs:*
- Expected behavior (input)
- Actual behavior (input)
- Auto-infer severity from message keywords

*For Features:*
- What problem does this solve? (input)
- Current workaround? (input)

*Attachments:*
- Add screenshot/video button
- File preview with remove option

**Step 3: Success**
```
┌─────────────────────────────────┐
│    [Team Photo]                 │
│         ✓                       │
│                                 │
│    Thank You! 🙏                │
│                                 │
│  Bogdan & Gojko appreciate      │
│  your feedback!                 │
│                                 │
│  ⭐⭐⭐⭐⭐                     │
└─────────────────────────────────┘
```

Auto-closes after 5 seconds, resets state.

### Context Capture (Automatic)

**User Never Sees These:**
- `session_id` - Browser fingerprint via localStorage
- `user_agent` - navigator.userAgent
- `device_type` - Detected from UA string
- `viewport` - window.innerWidth/innerHeight
- `referrer` - document.referrer
- `time_on_page` - Tracked from page load
- `scroll_depth` - Max scroll percentage reached
- `interactions_count` - Clicks + keystrokes
- `previous_actions` - Last 5 actions from sessionStorage
- `journey_stage` - Inferred from URL + auth state
- `user_id`, `user_role`, `account_age_days` - From auth context

### Widget Variants

**Pre-GA (Beta):**
- High visibility FAB with pulsing animation
- "Beta" badge
- Prominent positioning
- Auto-prompt after 3 minutes on page

**Post-GA (Production):**
- Subtle FAB, no animation
- No badge
- Standard positioning
- Smart prompts (after failed action, journey completion)

### Session Tracking

**Purpose:** Track feedback across sessions without forcing login

**Implementation:**
- Generate unique `session_id` on first visit
- Store in localStorage: `feedback_session_id`
- Format: `fp_{timestamp}_{random}`
- Persist across page loads
- Never expires (until localStorage cleared)

### Action Tracking

**Purpose:** Provide context about what user did before feedback

**Implementation:**
- Store last 10 actions in sessionStorage
- Each action: `{action, timestamp, url}`
- Include in feedback payload as `previous_actions`
- Examples: 'click_button', 'submit_form', 'page_view'

---

## Admin Dashboard Features

### KPI Cards

**Total Feedback**
- Count of all non-deleted feedback
- Change % vs previous period

**Avg Rating**
- Average of all ratings
- Trend indicator

**Pending**
- Count of status = 'new'
- Red if > threshold

**Avg Response Time**
- Average hours from created_at to resolved_at
- Only for resolved items

### Filters

**Available Filters:**
- Free-text search (message, email, page URL)
- Type dropdown (bug, feature, etc.)
- Status dropdown (new, in progress, etc.)
- Priority dropdown
- Journey stage dropdown
- Assigned to (admin dropdown + "unassigned")
- Has email (yes/no)
- Date range (from/to)

**Sort Options:**
- Created date (default DESC)
- Updated date
- Priority
- Rating
- Type
- Status

### Feedback Table

**Columns Shown:**
- Type icon + badges (status, priority, type)
- Journey stage icon
- Message preview (2 lines)
- Metadata row (date, page, email, attachments, comments, Jira)

**Row Actions:**
- Click to open detail panel
- Checkbox for bulk actions (future)

### Detail Panel (Slide-out)

**Sections:**
1. **Header** - ID, date, close button
2. **Type & Status** - Badges for type, priority, status
3. **User Info** - Email, user ID, role, account age
4. **Message** - Full text
5. **Bug/Feature Details** - Type-specific fields
6. **Context** - Page, device, journey, rating
7. **Tags** - Colored pills
8. **Attachments** - List with download links
9. **Internal Comments** - Timeline of admin notes
10. **Add Comment** - Textarea + submit
11. **Actions**
    - Create Jira Ticket (or show existing)
    - Email User (mailto link)
    - Status dropdown (updates immediately)
    - Priority dropdown (updates immediately)

### Analytics Charts

**Feedback Volume Trend (Line Chart):**
- X: Last 30 days
- Y: Count
- Lines: Total, Bugs, Features

**Journey Distribution (Donut Chart):**
- Segments: Awareness, Consideration, Conversion, Retention
- Center text: Total count

**Device Breakdown (Bar Chart):**
- Bars: Desktop, Mobile, Tablet

**Top Pages (Table):**
- Page URL + count
- Top 10

---

## Deployment Architecture

### Infrastructure Overview

```
Production Setup:

┌─────────────────────────────────┐
│  Main App (www.mindpick.me)     │
│  Vercel Project 1               │
│  - Frontend: React SPA          │
│  - FeedbackWidget               │
│  - Env: VITE_ADMIN_API_URL      │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  Admin (admin.mindpick.me)      │
│  Vercel Project 2               │
│  - Frontend: React SPA          │
│  - Backend: Serverless API      │
│  - Root Dir: admin/             │
│  - Env: DATABASE_URL, JIRA_*    │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  Database (Neon PostgreSQL)     │
│  - feedback tables              │
│  - admin_users (existing)       │
│  - Pooling: enabled             │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  Storage (Cloudflare R2)        │
│  - Attachments                  │
│  - Public bucket                │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  Jira (mindpick.atlassian.net)  │
│  - Project: MINDPICK            │
│  - Webhook to admin API         │
└─────────────────────────────────┘
```

### Environment Variables

**Admin Vercel Project:**
```bash
# Database
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require

# Xano (for admin auth)
XANO_BASE_URL=https://x8ki-letl-twmt.n7.xano.io/api:3B14WLbJ

# Admin JWT
ADMIN_JWT_SECRET=generate-strong-random-secret-min-32-chars

# CORS
CORS_ALLOW_ORIGIN=https://admin.mindpick.me

# Jira (Optional)
JIRA_BASE_URL=https://mindpick.atlassian.net
JIRA_EMAIL=your-email@mindpick.me
JIRA_API_TOKEN=your-jira-api-token
JIRA_PROJECT_KEY=MINDPICK
JIRA_WEBHOOK_SECRET=webhook-secret-for-verification

# Links
ADMIN_BASE_URL=https://admin.mindpick.me

# Feature Flags
ENABLE_FLAG_CACHE=true
```

**Main App Vercel Project:**
```bash
# Admin API endpoint
VITE_ADMIN_API_URL=https://admin.mindpick.me/api

# App stage
VITE_APP_STAGE=beta  # or 'production'

# Widget visibility
VITE_SHOW_FEEDBACK=true
```

---

## Deployment Steps

### 1. Database Setup

**Create Neon Database:**
1. Log into Neon console
2. Create new database: `mindpick-admin`
3. Copy connection string

**Run Migration:**
```bash
cd admin
export DATABASE_URL="your-neon-connection-string"
./scripts/migrate-feedback.sh
```

**Create First Admin User:**
```sql
-- Get your Xano user ID first
-- Then insert:
INSERT INTO admin_users (
  xano_user_id,
  email,
  name,
  role,
  disabled,
  token_version
) VALUES (
  'YOUR_XANO_USER_ID',
  'bogdan@mindpick.me',
  'Bogdan',
  'super_admin',
  false,
  0
);
```

### 2. Jira Setup (Optional)

**Create API Token:**
1. Jira → Profile → Security → API Tokens
2. Create token, save securely

**Create Project:**
1. Create project with key `MINDPICK`
2. Configure issue types (Bug, Story, Task)

**Configure Webhook:**
1. Jira → Settings → System → Webhooks
2. Create webhook:
   - URL: `https://admin.mindpick.me/api/jira-webhook`
   - Events: Issue updated, Comment created
   - JQL: `project = MINDPICK AND labels = user-feedback`

### 3. Deploy Admin Project

```bash
cd admin

# Install dependencies
npm install

# Build locally to verify
npm run build

# Deploy to Vercel
vercel --prod

# Set environment variables in Vercel dashboard
# Or via CLI:
vercel env add DATABASE_URL production
vercel env add ADMIN_JWT_SECRET production
# ... (add all env vars)
```

**Vercel Configuration:**
- Project Name: mindpick-admin
- Framework: Vite
- Root Directory: admin/
- Build Command: npm run build
- Output Directory: dist
- Domain: admin.mindpick.me

### 4. Deploy Main App

```bash
cd ..  # back to root

# Install dependencies
npm install

# Build locally to verify
npm run build

# Deploy to Vercel
vercel --prod

# Set environment variables
vercel env add VITE_ADMIN_API_URL production
vercel env add VITE_APP_STAGE production
vercel env add VITE_SHOW_FEEDBACK production
```

### 5. Verify Deployment

**Test Checklist:**
1. Visit main app → Click feedback widget → Submit
2. Check admin dashboard → Verify feedback appears
3. Click feedback → Verify all context captured
4. Update status/priority → Verify changes saved
5. Create Jira ticket → Verify ticket created
6. Update Jira ticket → Verify sync back to admin
7. Add comment → Verify saved
8. Test filters and search

---

## Testing Strategy

### Unit Tests (Not Implemented Yet)

**Widget:**
- Journey stage detection logic
- Device type detection
- Session ID generation
- Form validation

**API:**
- Feedback creation validation
- Filter query building
- Jira payload generation
- Status/priority mapping

### Integration Tests

**End-to-End Flow:**
1. User submits feedback from main app
2. Feedback appears in admin dashboard
3. Admin creates Jira ticket
4. Admin updates feedback status
5. Jira webhook syncs back
6. Feedback marked resolved

**Test Data:**
- Create 100+ test feedback items
- Various types, priorities, journey stages
- With/without email, attachments
- Authenticated and anonymous users

### Performance Tests

**Load Testing:**
- 100 concurrent feedback submissions
- Dashboard with 10,000+ feedback items
- Search performance with full-text queries
- Analytics aggregation speed

**Optimization Targets:**
- API response < 200ms (p95)
- Dashboard load < 2s
- Widget submit < 1s

---

## Monitoring & Observability

### Metrics to Track

**Usage Metrics:**
- Feedback submissions per day
- Submission rate by page
- Journey stage distribution
- Device type breakdown
- Authenticated vs anonymous ratio
- Email opt-in rate

**Quality Metrics:**
- Average rating
- Bug vs feature ratio
- Critical/high priority percentage
- Response time (created → resolved)
- Jira ticket creation rate

**Operational Metrics:**
- API error rate
- Average API response time
- Database connection pool usage
- Failed Jira sync attempts

### Alerting

**Critical Alerts:**
- API error rate > 5%
- Database connection failures
- Jira API failures

**Warning Alerts:**
- Pending feedback > 50
- Average response time > 48 hours
- Critical bugs unassigned > 1 hour

### Logging

**What to Log:**
- All API requests (method, path, status, duration)
- Failed validations (with sanitized input)
- Jira API calls (success/failure)
- Admin actions (who did what when)
- Database errors

**Where to Log:**
- Vercel logs (automatic)
- Sentry for errors
- Admin audit log table
- (Future) Datadog/LogRocket

---

## Security Considerations

### Authentication & Authorization

**Widget (Public):**
- No auth required for submitting feedback
- Rate limiting by session_id: 10 per hour
- CAPTCHA after 3 submissions (future)

**Admin API:**
- Requires valid admin_session JWT
- Short-lived tokens (15 minutes)
- HttpOnly cookies
- CORS restricted to admin.mindpick.me

**Admin Dashboard:**
- Protected by admin authentication
- Session validation on every request
- Token version check (revokable sessions)

### Input Validation

**Feedback Submission:**
- Sanitize all text inputs (prevent XSS)
- Validate enum values (type, priority, etc.)
- Check message length (10-2000 chars)
- Validate file uploads (type, size)
- Rate limiting by IP and session

**Admin Operations:**
- Validate all UUIDs
- Check admin permissions
- Sanitize search queries
- Prevent SQL injection (parameterized queries)

### Data Privacy

**PII Handling:**
- Email is optional
- Explicit consent checkboxes
- No credit card or sensitive data stored
- IP addresses not stored
- User agents stored (needed for context)

**GDPR Compliance:**
- Right to access (export all feedback by user_id)
- Right to deletion (soft delete → hard delete after 90 days)
- Consent tracking (analytics_consent, contact_consent)
- Data retention policy (1 year max)

### File Upload Security

**Attachments:**
- Max size: 10MB per file
- Allowed types: images (png, jpg), videos (mp4, webm), logs (txt)
- Virus scanning (future integration)
- Stored in separate R2 bucket
- Pre-signed URLs for downloads
- No executable files

---

## Future Enhancements

### Phase 2 Features (Post-Launch)

**AI/ML Integration:**
- Auto-categorization (bug vs feature)
- Sentiment analysis (positive/negative)
- Duplicate detection (similarity scoring)
- Priority prediction
- Auto-response templates

**Enhanced Analytics:**
- Cohort analysis (retention by feedback engagement)
- NPS-style surveys
- Feature request voting
- Impact analysis (feedback → revenue)

**Workflow Improvements:**
- Bulk actions (assign, tag, archive multiple)
- Saved filters and views
- Email notifications to users
- SLA tracking and alerts
- Custom fields

**Integration Expansions:**
- Slack notifications
- Linear integration (alternative to Jira)
- Intercom/Zendesk sync
- Zapier webhooks

### Optimization Opportunities

**Performance:**
- Redis caching for analytics
- ElasticSearch for full-text search
- CDN for attachments
- Database read replicas

**UX:**
- In-app screenshot tool (no upload needed)
- Voice note recording
- Video screen recording
- Annotation tools

**Admin Experience:**
- Keyboard shortcuts
- Bulk import/export
- Custom reports
- Team collaboration (assign, mention)

---

## Troubleshooting Guide

### Common Issues

**Widget Not Appearing:**
- Check `VITE_SHOW_FEEDBACK=true` in env
- Verify `VITE_ADMIN_API_URL` is correct
- Check browser console for errors
- Ensure FeedbackWidget is imported in App.jsx

**Feedback Not Saving:**
- Check admin API logs in Vercel
- Verify DATABASE_URL is correct
- Check CORS settings
- Validate request payload

**Jira Ticket Creation Fails:**
- Verify JIRA_API_TOKEN is valid
- Check JIRA_PROJECT_KEY exists
- Ensure issue types (Bug, Story, Task) exist
- Check Jira API logs for errors

**Admin Authentication Issues:**
- Verify ADMIN_JWT_SECRET is set
- Check admin_users table for user
- Ensure user is not disabled
- Check token_version matches

**Webhook Not Syncing:**
- Verify webhook URL is correct
- Check Jira webhook logs
- Verify JIRA_WEBHOOK_SECRET matches
- Check admin API logs

### Debug Commands

**Check Database Connection:**
```bash
psql $DATABASE_URL -c "SELECT COUNT(*) FROM feedback"
```

**Test Jira API:**
```bash
curl -u email@example.com:API_TOKEN \
  https://mindpick.atlassian.net/rest/api/3/myself
```

**Test Admin API:**
```bash
curl -X GET https://admin.mindpick.me/api/health
```

**Check Widget Submission:**
```bash
curl -X POST https://admin.mindpick.me/api/feedback \
  -H "Content-Type: application/json" \
  -d '{"type":"feedback","message":"Test message","page_url":"/test","session_id":"test123","user_agent":"curl"}'
```

---

## Success Metrics

### Launch Goals (First 30 Days)

**Engagement:**
- 50+ feedback submissions
- 5%+ submission rate (submissions / active users)
- 60%+ completion rate (started → submitted)
- 40%+ email opt-in rate

**Quality:**
- Average rating ≥ 4.0
- 20+ bugs identified
- 30+ feature requests collected
- 80%+ feedback has journey stage captured

**Operations:**
- Average response time < 48 hours for high priority
- 90%+ of critical bugs get Jira tickets within 1 hour
- 0 missed critical bugs
- Admin dashboard used daily by team

### Long-Term Success (6 Months)

**Product Impact:**
- 50% of roadmap informed by feedback
- 10+ features launched based on requests
- 30% reduction in support tickets (via proactive fixes)
- Improved NPS/satisfaction scores

**Scale:**
- 500+ feedback submissions
- 10+ active admins using dashboard
- 100+ Jira tickets created from feedback
- Feedback-to-feature pipeline < 2 weeks

---

## Maintenance & Operations

### Daily Tasks

- Review new feedback (5-10 min)
- Triage high/critical items
- Create Jira tickets for actionable bugs
- Respond to users who requested follow-up

### Weekly Tasks

- Review analytics dashboard
- Identify trending issues
- Update tags and categorization
- Share feedback summary with team
- Archive resolved items

### Monthly Tasks

- Aggregate analytics report
- Review journey stage patterns
- Assess Jira sync health
- Clean up old attachments (90+ days)
- Review and update tags

### Quarterly Tasks

- Analyze feedback impact on roadmap
- User satisfaction trend analysis
- System performance review
- Security audit
- Feature enhancement planning

---

## Appendix

### Glossary

**Journey Stage:** Where user is in their relationship with the product (awareness → consideration → conversion → retention)

**Session ID:** Browser fingerprint for tracking feedback across page loads without requiring login

**Feedback Type:** Category of feedback (bug, feature, feedback, question, other)

**Priority:** Urgency level (low, medium, high, critical)

**Status:** Processing state (new, in_progress, resolved, archived, duplicate, wont_fix)

**Jira Sync:** Two-way synchronization between feedback system and Jira tickets

**Soft Delete:** Marking record as deleted without physically removing from database

**Admin Session:** Short-lived JWT token (15 min) for admin authentication

### References

**Internal Documentation:**
- Feature Flags System: `docs/admin-architecture-doc-spec.md`
- Admin Authentication: `admin/README.md`
- API Response Helpers: `admin/api/_lib/respond.js`

**External Resources:**
- Jira REST API: https://developer.atlassian.com/cloud/jira/platform/rest/v3/
- Neon PostgreSQL: https://neon.tech/docs
- Vercel Serverless: https://vercel.com/docs/functions

---

**Document Version:** 1.0  
**Last Updated:** October 12, 2025  
**Authors:** Bogdan (Product), Gojko (Technical), Claude (Documentation)  
**Status:** Approved for Implementation