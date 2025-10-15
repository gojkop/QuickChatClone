# QuickChat Admin System Architecture

Implementation Status and Rollout Plan (Updated: October 2025)

This section documents what has been implemented so far for the Admin Console MVP, the control-plane database on Neon, the additional Vercel project configuration, the current authentication model, the mock UI components delivered, and the next features to implement (aligned to the original architecture plan below).

1) Deployed Admin Console (separate Vercel project)
- Project: Admin Console deployed from the repo subfolder admin/
- Build: Vite + React (no Tailwind dependency)
- SPA routing: admin/vercel.json uses rewrites to send all paths to /index.html
- Root Directory: admin
- PostCSS override: admin/postcss.config.cjs with plugins: [] to avoid root Tailwind requirement
- Monorepo deploy rules: Main app can skip builds on admin-only changes via Vercel’s Ignored Build Step (bash). Admin project builds only on admin/ changes
- Routing fix: admin/src/main.jsx routes App for all subpaths ('/*') to avoid redirect loops

Recommended env vars (Admin Vercel project):
- DATABASE_URL: Neon connection string
- XANO_BASE_URL: https://xlho-4syv-navp.n7e.xano.io/api:3B14WLbJ (working group used for /auth/me)
- ADMIN_JWT_SECRET: Strong random secret for admin_session JWT
- CORS_ALLOW_ORIGIN: https://admin.mindpick.me (or leave unset; dynamic origin echoing enabled)

2) Control-plane: Neon database schema (created)
- Extensions: pgcrypto, citext
- Enums:
  - admin_role ('super_admin','support_admin')
  - content_type ('question','answer','profile')
  - flagged_reason ('inappropriate','spam','quality','pii_leak','auto_detected')
  - moderation_status ('pending','approved','rejected','escalated')
- Utility: set_updated_at() trigger function

Core tables:
- admin_users
  - id (uuid PK), xano_user_id (unique), email (citext), name, role (admin_role)
  - disabled (bool), token_version (int), created_at, updated_at + trigger
  - Indexes: role, email
- admin_audit_log
  - id, admin_user_id (FK), action, resource_type, resource_id, before_data, after_data, ip, user_agent, created_at
  - Indexes: (admin_user_id, created_at desc), (resource_type, resource_id)
- feature_flags
  - id, key (unique), name, description, enabled (bool), rollout_percentage (0..100), created_at, updated_at + trigger
  - Indexes: enabled, rollout_percentage
- feature_flag_targets
  - id, flag_id (FK), xano_user_id, created_at. Unique (flag_id, xano_user_id)
  - Indexes: flag_id, xano_user_id
- feature_flag_audit
  - id, flag_id (FK), admin_user_id (FK), action, old_value, new_value, created_at
  - Index: (flag_id, created_at desc)
- moderation_queue
  - id, content_type, content_id, flagged_reason, auto_detection_confidence (0..1), status, reviewed_by_admin_id (FK), reviewed_at, notes, created_at
  - Indexes: (status, created_at desc), (content_type, content_id)
- pro_overrides (optional for entitlements)
  - id, xano_user_id (unique), plan ('free','pro'), expires_at, reason, created_at

3) Authentication and session model (implemented)
Identity source of truth: Xano
- Validation endpoint used: XANO_BASE_URL/auth/me (fallback to /me if /auth/me not found)

Admin session (control plane):
- Endpoints:
  - POST /api/auth/verify
    - Accepts token from Authorization: Bearer, JSON body { token }, form-encoded token, or qc_session cookie (Xano JWT)
    - Validates token with Xano, checks Neon admin_users, then issues httpOnly admin_session cookie (JWT) with 15 min TTL
    - CORS is origin-aware and credentials allowed only for explicit origins
  - GET /api/me
    - If admin_session present and valid → returns { ok: true, role, admin_id, xano_user_id }
    - If admin_session missing: attempts qc_session → validates via Xano → checks Neon RBAC → mints admin_session → returns ok (bootstraps session)
    - Returns origin-aware CORS headers
  - POST /api/auth/logout
    - Clears admin_session cookie (Max-Age=0)

Session bootstrapping and loops
- Client:
  - On page load, calls GET /api/me
  - If 401 and not yet tried, auto-calls POST /api/auth/verify (no body) to exchange qc_session → admin_session, then retries /api/me once
  - Guards ensure the bootstrap runs only once
- Routing fix: App is mounted for '/*' to prevent route redirect loops
- StrictMode removed in admin/src/main.jsx to avoid double-effect invocations in production

Feature Flags in plain language (simple on/off)

What is a feature flag?
- A feature flag is a named switch (on/off) that lets us enable or disable a piece of functionality without deploying code.
- Each flag has a key (e.g., deep_dive_question), a human name, an optional description, and a single boolean: enabled (true/false).

How it works at runtime (simple flow)
1) The Admin panel stores flags (key + enabled) in the control-plane database (Neon).
2) The app (frontend/backend) fetches the current flags from a read endpoint (e.g., GET /api/flags/public) and caches them.
3) In code, before showing or using a feature, we check the flag by key:
   - If enabled = true → show/allow the feature.
   - If enabled = false → hide/disable the feature (and protect server routes too).
4) Admins can flip the flag at any time in the Admin panel; apps will reflect it on the next refresh (or after a short cache period).

Admin side: what you do
- Create a flag with:
  - key: a permanent identifier used in code (e.g., deep_dive_question)
  - name: a human-friendly label (e.g., Deep Dive Question Type)
  - description: explain what the feature does
  - enabled: on/off
- To turn a feature on (or off), toggle the flag in the Admin → Feature Flags page. No deployment needed.

Example: Deep Dive Question Type (simple on/off)
Goal: Control whether users can choose a “Deep Dive” question option (longer answers, higher price).

1) Admin panel
   - Create the flag:
     - key: deep_dive_question
     - name: Deep Dive Question Type
     - description: Offer long-form, higher-priced question type
     - enabled: false (default)
   - When we’re ready to launch, toggle enabled: true.

2) Frontend (UI gating)
   - On the Ask page and Pricing page, check deep_dive_question.enabled.
     - If true: show “Deep Dive” option and pricing.
     - If false: hide “Deep Dive” option so users can’t select it.
   - This prevents confusing users when the feature is not ready.

3) Backend (server protection)
   - In the submission endpoint, double-check the flag before accepting a deep_dive type.
     - If flag is off, reject that type and return a friendly error.
   - This ensures the feature stays off even if the UI is bypassed.

4) Testing and rollout
   - Toggle the flag on in a preview/staging environment, verify UI shows the option and the backend accepts it.
   - Toggle it off and confirm the UI hides it and backend blocks it.
   - In production, flipping the flag on instantly enables the feature without redeploying.

Notes
- Keep flags simple: one boolean per feature. Avoid rollout percentages for the first iteration.
- Name keys clearly and consistently; keys are permanent because they’re referenced in code.
- Always guard on the server too (UI + server checks) for security and consistency.
- Document each flag (what it gates, where it is used, any dependencies).

4) Admin UI (mock MVP)
- Framework: Vite + React + React Router
- Layout (admin/src/components/Layout.jsx):
  - Sidebar: Dashboard, Feature Flags, Moderation, Experts, Transactions, Settings + Logout
- Pages (admin/src/pages):
  - Dashboard.jsx: KPI cards (experts, askers, GTV, pending), conversion funnel (mock), at-risk experts list, recent transactions, moderation queue snapshot
  - FeatureFlags.jsx: Table listing flags, enable/disable toggle (mock), creation form (key/name/description/enabled/rollout%), mock audit trail list
  - Moderation.jsx: Queue table with filters (pending/escalated/approved/rejected/all), detail panel (summary, actions, notes), mock context
  - Experts.jsx: Search/filter by availability/Stripe status, toggle availability (mock), impersonate/view (mock)
  - Transactions.jsx: Filterable list by status and range (mock), refund action (mock), Stripe events section (mock)
  - Settings.jsx: Admin users (RBAC) mock list (disable/enable, token_version bump), Security toggles (2FA, IP allowlist, rate limits), SLA & Alerts thresholds, API/Webhooks, Env summary, Feature Defaults

5) Additional project notes
- Admin project deploys separately from the main app; monorepo-friendly
- SPA rewrites are in admin/vercel.json
- PostCSS override in admin/postcss.config.cjs avoids pulling Tailwind from root
- Dynamic CORS helper returns the request origin or configured CORS_ALLOW_ORIGIN and sets Allow-Credentials only for non-wildcard origins

6) What’s next (implementation roadmap)
- Feature Flags (server + UI):
  - Add POST /api/flags (create), PATCH /api/flags/:key (update), DELETE /api/flags/:key
  - Write feature_flag_audit entries and admin_audit_log records on each change
  - UI: Wire create/edit/enable/disable/delete to endpoints with optimistic updates

- Moderation MVP (server + UI):
  - Add GET /api/moderation (list with filters), GET /api/moderation/:id
  - Add POST /api/moderation/:id/approve|reject|escalate
  - Write back to Xano for content actions as appropriate, log to admin_audit_log
  - UI: Replace mock lists with data from Neon/Xano, add pagination/bulk actions

- Experts (server + UI):
  - Add GET /api/experts?search=&availability=&stripe=
  - Add POST /api/experts/:id/availability to toggle
  - Implement impersonation (view-only) with audit trail
  - UI: Add detail drawer with performance KPIs (avg response time, SLA compliance, earnings)

- Transactions (server + UI):
  - Add GET /api/transactions?status=&range=&query=
  - Add POST /api/transactions/:id/refund (Stripe + Xano) with confirmation, audit, and email notification
  - UI: Transaction detail timeline with Stripe events (payment_intent.created, charge.succeeded, payout.paid, etc.)

- Security & Observability:
  - Add 2FA (TOTP) for admins and “step-up” prompts for sensitive actions
  - Rate limiting for sensitive endpoints
  - Add Sentry (frontend and backend) and structured logs
  - Admin audit log UI (filter/search/export)

- QA/Validation:
  - E2E: Verify session bootstrap across production and preview domains
  - Ensure CORS_ALLOW_ORIGIN matches actual hostnames as needed
  - Confirm no infinite loops and minimal /api/me calls after initial load

7) Quick start for contributors
- Admin project location: admin/
- Run locally (optional):
  - npm install in admin/
  - npm run dev → http://localhost:5174
- Env required (Admin Vercel project):
  - DATABASE_URL, XANO_BASE_URL (api:3B14WLbJ), ADMIN_JWT_SECRET, optional CORS_ALLOW_ORIGIN
- First admin:
  - Insert into Neon admin_users with xano_user_id and role, disabled=false
- Test auth:
  - With qc_session set (from the main app login), admin auto-bootstraps
  - Manual fallback: POST /api/auth/verify with Authorization or JSON body { token }
- Where to add endpoints:
  - admin/api/* (Node.js serverless functions)
- Where to add UI:
  - admin/src/pages/* and admin/src/components/*

The sections below contain the original architecture specification and phased roadmap for reference.


## Executive Summary - TEST

A modern, secure admin system for managing a C2C async consulting marketplace with payment processing, SLA monitoring, and content moderation.

---

## 🎯 Phase 1: MVP Admin Core (Weeks 1-2)

### 1.1 Authentication & Authorization

**Implementation:**
```javascript
// Xano: Create admin_users table
{
  id: int (PK),
  email: text,
  name: text,
  role: enum('super_admin', 'support_admin'),
  last_login: timestamp,
  created_at: timestamp
}

// Middleware: Check admin authentication
function requireAdmin(request) {
  const token = request.headers.authorization;
  const user = validateToken(token);
  
  if (!user || !['super_admin', 'support_admin'].includes(user.role)) {
    return { error: 'Unauthorized', status: 403 };
  }
  
  return { user };
}
```

**Security:**
- Separate admin JWT tokens with 4-hour expiration
- IP whitelist for admin access (optional but recommended)
- 2FA via email verification for sensitive actions
- All admin actions logged to `admin_audit_log` table

### 1.2 Core Data Models

**Expert Users Table (`users` - filter by role='expert'):**
```sql
SELECT 
  u.id,
  u.name,
  u.email,
  u.stripe_account_id,
  u.price_per_question,
  u.sla_hours,
  u.status,
  COUNT(DISTINCT q.id) as total_questions,
  SUM(CASE WHEN q.status = 'completed' THEN q.amount ELSE 0 END) as total_revenue,
  AVG(CASE WHEN q.completed_at IS NOT NULL 
      THEN EXTRACT(EPOCH FROM (q.completed_at - q.created_at))/3600 
      END) as avg_response_hours,
  SUM(CASE WHEN q.completed_at <= (q.created_at + INTERVAL '1 hour' * u.sla_hours) 
      THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(q.id), 0) as sla_compliance_rate
FROM users u
LEFT JOIN questions q ON q.expert_id = u.id
WHERE u.role = 'expert'
GROUP BY u.id;
```

**Transactions Table Schema:**
```javascript
{
  id: string (PK - Stripe payment_intent_id),
  expert_id: int (FK),
  asker_id: int (FK),
  question_id: int (FK),
  amount: decimal(10,2),
  platform_fee: decimal(10,2),
  expert_payout: decimal(10,2),
  stripe_fee: decimal(10,2),
  status: enum('pending', 'completed', 'refunded', 'disputed'),
  stripe_payout_id: string,
  created_at: timestamp,
  completed_at: timestamp,
  refunded_at: timestamp
}
```

### 1.3 Feature Flags System

**Database Schema:**
```javascript
// feature_flags table
{
  id: int (PK),
  key: string (unique - e.g. 'ai_transcription'),
  name: string,
  description: text,
  enabled: boolean,
  rollout_percentage: int (0-100),
  target_user_ids: json[], // Specific user whitelist
  created_at: timestamp,
  updated_at: timestamp
}

// feature_flag_audit table
{
  id: int (PK),
  flag_id: int (FK),
  admin_user_id: int (FK),
  action: enum('enabled', 'disabled', 'rollout_changed'),
  old_value: json,
  new_value: json,
  created_at: timestamp
}
```

**Xano Function: Check Feature Flag**
```javascript
function isFeatureEnabled(userId, featureKey) {
  const flag = queryOne('feature_flags', { key: featureKey });
  
  if (!flag || !flag.enabled) return false;
  if (flag.rollout_percentage === 100) return true;
  
  // Check whitelist
  if (flag.target_user_ids?.includes(userId)) return true;
  
  // Consistent hash-based rollout
  const hash = hashUserId(userId, featureKey);
  return (hash % 100) < flag.rollout_percentage;
}
```

### 1.4 Key Metrics Dashboard

**Real-time Stats API (`/admin/stats/overview`):**
```javascript
{
  experts: {
    total: int,
    active_last_30d: int,
    new_this_month: int
  },
  askers: {
    total: int,
    active_last_30d: int,
    repeat_rate: float // % who asked 2+ questions
  },
  gtv: {
    today: float,
    this_month: float,
    last_month: float,
    growth_rate: float
  },
  questions: {
    total: int,
    pending: int,
    completed_today: int,
    avg_response_hours: float
  },
  sla: {
    compliance_rate: float,
    missed_today: int,
    auto_refunds_today: int
  },
  platform_health: {
    cloudflare_storage_usage: float, // GB
    avg_video_upload_time: float, // seconds
    error_rate_24h: float // %
  }
}
```

---

## 🚀 Phase 2: Operations & Support (Weeks 3-4)

### 2.1 Transaction Deep Dive

**View Transaction Details:**
```javascript
// GET /admin/transactions/:id
{
  transaction: {
    id, amount, platform_fee, status, created_at
  },
  expert: { id, name, email, stripe_account_id },
  asker: { id, name, email },
  question: {
    id,
    text_preview: "First 200 chars...",
    media_url: "cloudflare_url",
    duration_seconds: int,
    created_at: timestamp
  },
  answer: {
    id,
    media_url: "cloudflare_url",
    duration_seconds: int,
    created_at: timestamp,
    response_time_hours: float
  },
  stripe_events: [
    { type: 'payment_intent.created', created: timestamp },
    { type: 'charge.succeeded', created: timestamp },
    { type: 'payout.paid', created: timestamp }
  ],
  timeline: [
    { event: 'Question submitted', timestamp },
    { event: 'Payment captured', timestamp },
    { event: 'Answer submitted', timestamp },
    { event: 'Payout initiated', timestamp }
  ]
}
```

**Actions:**
- Issue refund (with reason logging)
- Manually mark SLA compliance
- Flag for review
- Export conversation (GDPR compliance)

### 2.2 Content Moderation Queue

**Moderation Schema:**
```javascript
// moderation_queue table
{
  id: int (PK),
  content_type: enum('question', 'answer', 'profile'),
  content_id: int,
  flagged_reason: enum('inappropriate', 'spam', 'quality', 'pii_leak', 'auto_detected'),
  auto_detection_confidence: float, // 0-1
  status: enum('pending', 'approved', 'rejected', 'escalated'),
  reviewed_by_admin_id: int,
  reviewed_at: timestamp,
  notes: text
}
```

**Auto-flagging Rules (Xano Background Task):**
```javascript
// Run every 5 minutes
function autoModeration() {
  // Flag questions/answers containing:
  const suspiciousPatterns = [
    /\b(credit card|ssn|social security)\b/i,
    /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/, // CC numbers
    /\b[A-Z]{2}\d{6,9}\b/, // Passport numbers
    /\b(fuck|shit|scam)\b/i // Basic profanity
  ];
  
  const recentContent = query(`
    SELECT * FROM questions 
    WHERE created_at > NOW() - INTERVAL '5 minutes' 
    AND moderation_status IS NULL
  `);
  
  recentContent.forEach(item => {
    const text = extractTextFromMedia(item.media_url); // Via Cloudflare Workers AI
    const matched = suspiciousPatterns.some(p => p.test(text));
    
    if (matched) {
      insert('moderation_queue', {
        content_type: 'question',
        content_id: item.id,
        flagged_reason: 'auto_detected',
        auto_detection_confidence: 0.85
      });
    }
  });
}
```

### 2.3 Expert Health Monitoring

**At-Risk Experts Detection:**
```javascript
// Xano Query: Flag experts needing attention
SELECT 
  u.id,
  u.name,
  u.email,
  COUNT(q.id) FILTER (WHERE q.status = 'pending' AND NOW() > q.created_at + INTERVAL '1 hour' * u.sla_hours * 0.8) as approaching_sla_miss,
  COUNT(q.id) FILTER (WHERE q.status = 'missed_sla') as recent_misses,
  AVG(EXTRACT(EPOCH FROM (q.completed_at - q.created_at))/3600) as avg_response_hours,
  CASE 
    WHEN COUNT(q.id) FILTER (WHERE q.status = 'missed_sla' AND q.created_at > NOW() - INTERVAL '7 days') > 2 
    THEN 'critical'
    WHEN COUNT(q.id) FILTER (WHERE q.status = 'pending' AND NOW() > q.created_at + INTERVAL '1 hour' * u.sla_hours * 0.8) > 0 
    THEN 'warning'
    ELSE 'healthy'
  END as health_status
FROM users u
LEFT JOIN questions q ON q.expert_id = u.id AND q.created_at > NOW() - INTERVAL '30 days'
WHERE u.role = 'expert'
GROUP BY u.id
HAVING health_status IN ('critical', 'warning');
```

**Admin Actions:**
- Send reminder email
- Temporary pause new questions
- Suggest SLA adjustment
- View historical performance trends

---

## 🔧 Phase 3: Advanced Features (Weeks 5-8)

### 3.1 Analytics & Reporting

**Custom Report Builder:**
```javascript
// Predefined report templates
const reports = {
  monthly_gtv: {
    dimensions: ['month', 'expert_category'],
    metrics: ['gtv', 'transaction_count', 'avg_price'],
    filters: { date_range: 'last_12_months' }
  },
  expert_cohorts: {
    dimensions: ['signup_month'],
    metrics: ['retention_rate', 'avg_questions_per_expert', 'churn_rate'],
    groupBy: 'month'
  },
  conversion_funnel: {
    steps: [
      'link_visits',
      'question_started',
      'payment_initiated',
      'payment_completed',
      'answer_received'
    ],
    conversion_rates: true
  }
};
```

**Export Functionality:**
- CSV export with custom date ranges
- Schedule weekly email reports
- API access for data warehouse integration

### 3.2 Support Tools

**Impersonate User (with audit trail):**
```javascript
// POST /admin/impersonate
{
  admin_id: int,
  target_user_id: int,
  reason: string, // Required
  duration_minutes: int // Max 60
}

// Creates temporary JWT with:
{
  user_id: target_user_id,
  impersonated_by: admin_id,
  expires_at: timestamp,
  permissions: ['view_only'] // Cannot make payments or changes
}

// Audit log entry automatically created
```

**Support Ticket Integration:**
```javascript
// Link to external tools like Intercom, Zendesk
{
  ticket_id: string,
  user_id: int,
  quick_actions: [
    'view_transactions',
    'view_questions',
    'issue_refund',
    'reset_password'
  ]
}
```

### 3.3 Financial Reconciliation

**Stripe Payout Reconciliation Dashboard:**
```javascript
// Compare Xano transactions vs Stripe payouts
const reconciliation = {
  period: '2025-10-01 to 2025-10-31',
  expected_payouts: 24680.00,
  actual_stripe_payouts: 24680.00,
  discrepancy: 0.00,
  pending_payouts: 3200.00,
  
  breakdown: [
    {
      expert_id: 123,
      expert_name: 'Sarah Chen',
      xano_total: 3375.00,
      stripe_payout: 3375.00,
      status: 'matched'
    }
  ],
  
  issues: [
    {
      type: 'missing_payout',
      expert_id: 456,
      amount: 150.00,
      investigation_link: '/admin/transactions?expert_id=456&status=pending_payout'
    }
  ]
};
```

---

## 🛡️ Security & Compliance

### 4.1 Admin Audit Log

**Every admin action logged:**
```javascript
// admin_audit_log table
{
  id: int (PK),
  admin_user_id: int (FK),
  action: string, // 'view_user', 'issue_refund', 'toggle_feature_flag'
  resource_type: string, // 'user', 'transaction', 'feature_flag'
  resource_id: string,
  ip_address: string,
  user_agent: string,
  request_body: json,
  response_status: int,
  created_at: timestamp
}
```

**GDPR Compliance Tools:**
```javascript
// User data export (GDPR Article 15)
POST /admin/gdpr/export-user-data
{
  user_id: int,
  include: ['profile', 'transactions', 'questions', 'answers', 'analytics']
}
// Returns ZIP file with all user data

// Right to be forgotten (GDPR Article 17)
POST /admin/gdpr/delete-user
{
  user_id: int,
  anonymize_transactions: boolean, // Keep financial records but anonymize PII
  reason: string
}
```

### 4.2 Rate Limiting & Monitoring

**Admin API Rate Limits:**
```javascript
const rateLimits = {
  '/admin/*': '1000 requests per hour per IP',
  '/admin/gdpr/*': '10 requests per hour', // Sensitive operations
  '/admin/impersonate': '5 requests per day per admin'
};
```

**Alert System (integrate with Sentry/email):**
```javascript
const alerts = [
  {
    condition: 'sla_compliance_rate < 90% for 24h',
    severity: 'critical',
    notify: ['admin@quickchat.com']
  },
  {
    condition: 'payment_failure_rate > 5% in last hour',
    severity: 'high',
    notify: ['tech@quickchat.com']
  },
  {
    condition: 'moderation_queue_length > 20',
    severity: 'medium',
    notify: ['support@quickchat.com']
  }
];
```

---

## 📊 Implementation Roadmap

### **Week 1: Foundation**
- [ ] Admin authentication system (Xano + JWT)
- [ ] Basic dashboard with key metrics
- [ ] User list view with search/filter
- [ ] Transaction list view

### **Week 2: Feature Management**
- [ ] Feature flags system (database + API)
- [ ] Feature flag UI in admin panel
- [ ] Rollout percentage logic
- [ ] Audit logging for flag changes

### **Week 3: Operations**
- [ ] Transaction detail view
- [ ] Refund functionality
- [ ] Content moderation queue
- [ ] Auto-flagging rules (background task)

### **Week 4: Monitoring**
- [ ] Expert health dashboard
- [ ] SLA monitoring alerts
- [ ] Email notification system
- [ ] Export functionality (CSV)

### **Week 5-6: Analytics**
- [ ] Custom report builder
- [ ] Cohort analysis
- [ ] Conversion funnel tracking
- [ ] Scheduled email reports

### **Week 7-8: Advanced**
- [ ] Financial reconciliation tool
- [ ] GDPR compliance endpoints
- [ ] Support ticket integration
- [ ] User impersonation (with audit trail)

---

## 🏗️ Technical Stack Decisions

### **Frontend: Next.js Admin App**
```bash
/admin-dashboard
  ├── /app
  │   ├── /dashboard
  │   ├── /experts
  │   ├── /transactions
  │   ├── /features
  │   └── /settings
  ├── /components
  │   ├── /charts (recharts for data viz)
  │   ├── /tables (TanStack Table for sorting/filtering)
  │   └── /modals
  └── /lib
      ├── /api (Xano client)
      └── /auth (Admin JWT handling)
```

**Libraries:**
- **TanStack Table** - Advanced table features (sorting, filtering, pagination)
- **Recharts** - Data visualization
- **date-fns** - Date manipulation
- **zod** - Runtime validation
- **react-hook-form** - Form handling

### **Backend: Xano Functions**
```javascript
// Organized Xano function groups:
1. admin_auth/* - Authentication and authorization
2. admin_metrics/* - Dashboard metrics and analytics
3. admin_users/* - User management CRUD
4. admin_transactions/* - Transaction operations
5. admin_features/* - Feature flag management
6. admin_moderation/* - Content moderation
7. admin_reports/* - Report generation and exports
```

### **Database Indexing (Xano):**
```sql
-- Critical indexes for performance
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_questions_expert_status ON questions(expert_id, status);
CREATE INDEX idx_questions_created_at ON questions(created_at DESC);
CREATE INDEX idx_transactions_status_date ON transactions(status, created_at);
CREATE INDEX idx_feature_flags_key ON feature_flags(key);
```

---

## 💡 Best Practices & Patterns

### 1. **Optimistic UI Updates**
```javascript
// Update UI immediately, rollback on error
const toggleFeatureFlag = async (flagId) => {
  // Optimistic update
  setFlags(prev => prev.map(f => 
    f.id === flagId ? { ...f, enabled: !f.enabled } : f
  ));
  
  try {
    await api.admin.features.toggle(flagId);
  } catch (error) {
    // Rollback on error
    setFlags(prev => prev.map(f => 
      f.id === flagId ? { ...f, enabled: !f.enabled } : f
    ));
    toast.error('Failed to toggle feature');
  }
};
```

### 2. **Real-time Data with Polling**
```javascript
// Polling for dashboard metrics (every 30s)
useEffect(() => {
  const fetchMetrics = async () => {
    const data = await api.admin.metrics.overview();
    setMetrics(data);
  };
  
  fetchMetrics();
  const interval = setInterval(fetchMetrics, 30000);
  
  return () => clearInterval(interval);
}, []);
```

### 3. **Error Boundaries**
```javascript
// Wrap admin routes in error boundaries
<ErrorBoundary fallback={<AdminErrorPage />}>
  <AdminDashboard />
</ErrorBoundary>
```

### 4. **Progressive Enhancement**
- Core admin functions work without JS (server-side rendering)
- Advanced features (charts, real-time updates) enhance with JS
- Mobile-responsive for emergency admin access

---

## 🚨 Common Pitfalls to Avoid

1. **Not logging admin actions** - Always audit sensitive operations
2. **Direct database queries from frontend** - Use Xano API layer
3. **No rate limiting** - Prevent abuse of admin endpoints
4. **Ignoring GDPR** - Build compliance tools from day one
5. **Hard-coding feature flags** - Always use database-driven flags
6. **No rollback strategy** - Test refunds and reversals thoroughly
7. **Poor error handling** - Admin tools must be bulletproof

---

## 📚 Next Steps

1. **Set up Xano admin tables** (user, audit log, feature flags)
2. **Create admin JWT authentication** flow separate from user auth
3. **Build MVP dashboard** (overview metrics + user list)
4. **Implement feature flags** system first (highest ROI)
5. **Set up monitoring** for SLA compliance and payment health

**Estimated Time to Minimum Viable Admin: 2-3 weeks** for a single developer with Next.js + Xano experience.
