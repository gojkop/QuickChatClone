# QuickChat Admin System Architecture

## Executive Summary

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