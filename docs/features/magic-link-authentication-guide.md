# Magic Link Authentication Implementation Guide

Complete guide for implementing passwordless email authentication in QuickChat using Xano.

**Status:** ✅ Production Ready | Last Updated: January 15, 2025

---
 
## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Xano Database Setup](#xano-database-setup)
4. [Xano Function Setup](#xano-function-setup)
5. [Xano Endpoints Setup](#xano-endpoints-setup)
6. [Testing](#testing)
7. [Security Considerations](#security-considerations)
8. [Troubleshooting](#troubleshooting)

---

## Overview

### What is Magic Link Authentication?

Magic link authentication (also called passwordless login) allows users to sign in by clicking a unique link sent to their email address. This eliminates the need for passwords while maintaining security through:

- Time-limited tokens (15 minutes)
- One-time use links
- Rate limiting (3 attempts per hour per email)
- IP tracking for security auditing

### Benefits

- **Enhanced Security**: No passwords to be stolen or leaked
- **Better UX**: No password to remember or reset
- **Modern Standard**: Used by Slack, Notion, Medium, and others
- **Easy Implementation**: Leverages existing email infrastructure

### User Flow

1. User enters email on sign-in page
2. System generates unique token and 6-digit backup code
3. Email sent with magic link: `https://mindpick.me/auth/magic-link?token={uuid}`
4. User clicks link → Token verified → JWT issued → User authenticated
5. New users get automatic account creation + welcome email

---

## Architecture

### Component Overview

**Frontend (React):**
- `SignInPage.jsx` - Email input form
- `MagicLinkCallbackPage.jsx` - Token verification page
- `src/api/auth.js` - API client methods

**Backend (Vercel):**
- `/api/auth/magic-link/send.js` - Initiate flow
- `/api/auth/magic-link/verify.js` - Verify token

**Xano (Database + Logic):**
- `magic_link_tokens` table - Token storage
- `/auth/magic-link/initiate` endpoint - Generate token
- `/auth/magic-link/verify` endpoint - Validate and authenticate

**Email (ZeptoMail):**
- Magic link email template
- Welcome email for new users

### Data Flow

```
User enters email
    ↓
POST /api/auth/magic-link/send (Vercel)
    ↓
POST /auth/magic-link/initiate (Xano)
    → Check rate limits
    → Generate UUID token + 6-digit code
    → Store in magic_link_tokens table
    → Return token & code
    ↓
Send email via ZeptoMail
    ↓
User clicks link
    ↓
GET /auth/magic-link?token={uuid} (Frontend)
    ↓
POST /api/auth/magic-link/verify (Vercel)
    ↓
POST /auth/magic-link/verify (Xano)
    → Validate token exists
    → Check not expired (< 15 min)
    → Check not already used
    → Mark token as used
    → Find or create user
    → Generate JWT token
    → Return auth token
    ↓
Frontend stores JWT in localStorage
    ↓
User redirected to /expert dashboard
```

---

## Xano Database Setup

### Step 1: Create `magic_link_tokens` Table

**Table Name:** `magic_link_tokens`

**Columns:**

| Column Name | Data Type | Properties |
|------------|-----------|-----------|
| `id` | int | Auto-increment, Primary Key |
| `email` | text | Required, Indexed |
| `token` | text | Required, Unique, Indexed |
| `verification_code` | text | Required (6 digits) |
| `user_id` | int | Nullable, FK to `users` table |
| `expires_at` | timestamp | Required |
| `used` | boolean | Default: false |
| `used_at` | timestamp | Nullable |
| `ip_address` | text | Store hashed IP |
| `created_at` | timestamp | Auto-generated |

**Indexes:**
- Index on `email` (for rate limiting lookups)
- Index on `token` (for fast verification)
- Index on `expires_at` (for cleanup queries)

**Notes:**
- `expires_at` should be set to `created_at + 15 minutes`
- `ip_address` should be hashed for privacy (SHA-256)
- `user_id` is null until first use (allows token creation before user exists)

---

## Xano Function Setup

### Function 1: `generate_magic_link_token()`

**Purpose:** Generate secure UUID v4 token and 6-digit verification code

**Inputs:** None

**Returns:**
```json
{
  "token": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "verification_code": "123456"
}
```

**Function Stack:**

1. **Add Variable:** `uuid_token`
   - Value: Generate UUID v4 (use Xano's UUID generator or create custom)
   - Example: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`

2. **Add Variable:** `verification_code`
   - Value: Generate 6-digit random number
   - Formula: `floor(random() * 900000) + 100000`
   - Example: `"742891"`

3. **Return:**
```json
{
  "token": uuid_token,
  "verification_code": verification_code
}
```

**Xano Implementation:**
```
1. Add custom function "generate_magic_link_token"
2. Add Variable → uuid_token → (Use Math.random or UUID addon)
3. Add Variable → verification_code → floor(random() * 900000) + 100000
4. Return → { token: uuid_token, verification_code: verification_code }
```

---

### Function 2: `check_magic_link_rate_limit(email)`

**Purpose:** Prevent abuse by limiting requests per email

**Inputs:**
- `email` (text)

**Returns:**
```json
{
  "allowed": true,
  "remaining_attempts": 2,
  "retry_after": 0
}
```
or
```json
{
  "allowed": false,
  "remaining_attempts": 0,
  "retry_after": 3600
}
```

**Function Stack:**

1. **Add Variable:** `one_hour_ago`
   - Value: `now() - 3600` (1 hour in seconds)

2. **Query Database:** Get count of recent tokens
   - Table: `magic_link_tokens`
   - Filter: `email = {email} AND created_at > {one_hour_ago}`
   - Return: Count

3. **Conditional:** If count >= 3
   - **True Branch:**
     - Return: `{ "allowed": false, "remaining_attempts": 0, "retry_after": 3600 }`
   - **False Branch:**
     - Return: `{ "allowed": true, "remaining_attempts": 3 - count, "retry_after": 0 }`

**Rate Limit Rules:**
- Maximum: 3 magic link requests per hour per email
- Counter resets after 1 hour from first request
- Prevents spam and abuse

---

## Xano Endpoints Setup

### Endpoint 1: POST `/auth/magic-link/initiate` (Public API)

**Purpose:** Generate magic link token and check rate limits

**API Group:** Public API (`api:BQW1GS7L`)

**Authentication:** None (public)

**Inputs:**

| Input Name | Type | Required | Description |
|-----------|------|----------|-------------|
| `email` | text | Yes | User's email address |
| `ip_address` | text | Yes | Client IP (hashed) |

**Function Stack:**

1. **Run Function:** `check_magic_link_rate_limit(email)`
   - Store result in variable: `rate_limit_check`

2. **Conditional:** If `rate_limit_check.allowed = false`
   - **Response (429):**
   ```json
   {
     "error": "rate_limit_exceeded",
     "retry_after": rate_limit_check.retry_after
   }
   ```

3. **Run Function:** `generate_magic_link_token()`
   - Store result in variable: `token_data`

4. **Add Variable:** `expires_at`
   - Value: `now() + 900` (15 minutes in seconds)

5. **Add Record to `magic_link_tokens`:**
   - `email`: `{email}` (lowercase and trimmed)
   - `token`: `{token_data.token}`
   - `verification_code`: `{token_data.verification_code}`
   - `expires_at`: `{expires_at}`
   - `used`: `false`
   - `ip_address`: `{ip_address}`
   - `created_at`: auto

6. **Response (200):**
```json
{
  "success": true,
  "token": token_data.token,
  "verification_code": token_data.verification_code,
  "expires_in_seconds": 900
}
```

**Error Responses:**

| Status | Error Code | Description |
|--------|-----------|-------------|
| 400 | `invalid_email` | Email format invalid |
| 429 | `rate_limit_exceeded` | Too many requests |
| 500 | `server_error` | Internal error |

---

### Endpoint 2: POST `/auth/magic-link/verify` (Public API)

**Purpose:** Verify token, create/find user, and generate JWT

**API Group:** Public API (`api:BQW1GS7L`)

**Authentication:** None (public)

**Inputs:**

| Input Name | Type | Required | Description |
|-----------|------|----------|-------------|
| `token` | text | Yes | UUID token from magic link |
| `ip_address` | text | No | Client IP for logging |

**Function Stack:**

1. **Get Record from `magic_link_tokens`:**
   - Filter: `token = {token}`
   - Store result in variable: `magic_link_record`

2. **Conditional:** If `magic_link_record` not found
   - **Response (404):**
   ```json
   {
     "error": "token_not_found"
   }
   ```

3. **Add Variable:** `now_timestamp`
   - Value: `now()`

4. **Conditional:** If `magic_link_record.expires_at < now_timestamp`
   - **Response (410):**
   ```json
   {
     "error": "token_expired"
   }
   ```

5. **Conditional:** If `magic_link_record.used = true`
   - **Response (410):**
   ```json
   {
     "error": "token_already_used"
   }
   ```

6. **Edit Record in `magic_link_tokens`:**
   - Record ID: `{magic_link_record.id}`
   - Set `used`: `true`
   - Set `used_at`: `{now_timestamp}`

7. **Get Record from `users`:**
   - Filter: `email = {magic_link_record.email}`
   - Store result in variable: `existing_user`

8. **Conditional:** If `existing_user` not found (New User)
   - **True Branch:**
     - **Add Record to `users`:**
       - `email`: `{magic_link_record.email}`
       - `name`: Extract from email (before @)
       - `auth_provider`: `"magic_link"`
       - `auth_provider_id`: `{magic_link_record.email}` (use email as ID)
       - `created_at`: auto
     - Store result in variable: `user`
     - Set variable: `is_new_user = true`

   - **False Branch:**
     - Set variable: `user = existing_user`
     - Set variable: `is_new_user = false`

9. **Create Authentication Token:**
   - **CRITICAL:** Set `dbtable` to `"user"` (exact table name)
   - **CRITICAL:** Set `id` to `{user.id}` (from conditional result)
   - Expiration: `86400` (24 hours)
   - Store result in variable: `auth_token`

10. **Response (200):**
```json
{
  "token": auth_token,
  "email": user.email,
  "name": user.name,
  "is_new_user": is_new_user
}
```

**Error Responses:**

| Status | Error Code | Description |
|--------|-----------|-------------|
| 404 | `token_not_found` | Invalid token |
| 410 | `token_expired` | Token expired (>15 min) |
| 410 | `token_already_used` | Token already consumed |
| 500 | `server_error` | Internal error |

**IMPORTANT NOTES:**

1. **Authentication Token Configuration:**
   - ❌ Common mistake: Forgetting to set `dbtable` parameter
   - ✅ Must set `dbtable = "user"` (your users table name)
   - ✅ Must set `id = user.id` (from the user record)
   - Without these, the JWT token won't authenticate properly

2. **User Creation:**
   - Use email as `auth_provider_id` for magic link users
   - Extract name from email (before @ symbol) as default
   - Set `auth_provider = "magic_link"` for tracking

3. **Token Security:**
   - Mark token as used immediately
   - Check expiration before marking as used
   - Log IP address for security auditing

---

## Testing

### Manual Testing Checklist

**1. Test Magic Link Send:**

```bash
# Test via frontend
Go to: http://localhost:5173/signin
Enter email: test@example.com
Click "Continue with Email"

# Expected: Success message "Check your inbox!"
```

**2. Test Email Delivery:**

```bash
# Check inbox for email
Subject: "Your QuickChat Sign-In Link"
Body: Contains magic link URL
Alternative: 6-digit verification code

# Expected: Email received within seconds
```

**3. Test Token Verification:**

```bash
# Click magic link from email
URL: https://mindpick.me/auth/magic-link?token={uuid}

# Expected:
- Redirected to callback page
- Shows "Verifying..." state
- Then "Welcome!" state
- Redirects to /expert dashboard
- JWT token stored in localStorage
```

**4. Test Rate Limiting:**

```bash
# Request 4 magic links for same email within 1 hour

# Expected after 3rd request:
Error: "Too many requests. Please try again in X minutes."
Status: 429
```

**5. Test Token Expiration:**

```bash
# Request magic link
# Wait 16 minutes
# Click link

# Expected:
Error: "This link has expired. Please request a new one."
Status: 410
```

**6. Test Token Reuse:**

```bash
# Click magic link once (successful)
# Click same link again

# Expected:
Error: "This link has already been used. Please request a new one."
Status: 410
```

**7. Test New User Flow:**

```bash
# Use email that doesn't exist in system
# Complete magic link flow

# Expected:
- User account created
- Welcome email sent
- JWT token issued
- Redirected to /expert dashboard
```

### Xano Testing

**Test Endpoint 1: Initiate**

```bash
# POST to Xano Public API
POST https://xlho-4syv-navp.n7e.xano.io/api:BQW1GS7L/auth/magic-link/initiate

Body:
{
  "email": "test@example.com",
  "ip_address": "192.168.1.1"
}

# Expected Response (200):
{
  "success": true,
  "token": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "verification_code": "123456",
  "expires_in_seconds": 900
}
```

**Test Endpoint 2: Verify**

```bash
# POST to Xano Public API
POST https://xlho-4syv-navp.n7e.xano.io/api:BQW1GS7L/auth/magic-link/verify

Body:
{
  "token": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "ip_address": "192.168.1.1"
}

# Expected Response (200):
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "email": "test@example.com",
  "name": "test",
  "is_new_user": true
}
```

---

## Security Considerations

### Token Security

**Time-Limited Tokens:**
- Tokens expire after 15 minutes
- Balances security and user experience
- Prevents stale links from being exploited

**One-Time Use:**
- Tokens marked as used immediately after verification
- Prevents replay attacks
- Mitigates email client pre-fetching issues

**Unique Tokens:**
- UUIDs are cryptographically random
- Collision probability: ~1 in 2^122
- No predictable patterns

### Rate Limiting

**Email-Based Limits:**
- Max 3 requests per hour per email
- Prevents spam and abuse
- Doesn't prevent legitimate retries

**IP Tracking:**
- Hash IP addresses for privacy (SHA-256)
- Enables security auditing
- Helps detect suspicious patterns

### Email Security

**Email Client Pre-fetching:**
- Some email clients (Outlook, Gmail) click links for malware scanning
- One-time use tokens handle this gracefully
- User can request new link if needed

**Email Enumeration Prevention:**
- Always return success message
- Don't reveal if email exists in system
- Security through ambiguity

### Database Security

**Sensitive Data:**
- Hash IP addresses before storage
- Don't store passwords (passwordless!)
- Minimal data retention

**Token Cleanup:**
- ✅ **Automated cleanup runs daily at 3:00 AM UTC**
- Expired tokens deleted after 7 days (grace period for debugging)
- Used tokens deleted after 30 days (audit trail)
- Unused tokens deleted after 30 days (abandoned attempts)
- Part of unified cleanup system (see `docs/xano-internal-endpoints.md`)

**Cleanup Implementation:**
The cleanup is handled by `/api/cron/cleanup-orphaned-media.js` which also cleans:
- Orphaned media assets (videos/audio)
- Orphaned profile pictures
- Orphaned attachments
- Old magic link tokens

**Manual Cleanup (if needed):**
```bash
# Trigger cleanup manually
curl -X POST "https://quickchat-dev.vercel.app/api/cron/cleanup-orphaned-media" \
  -H "Authorization: Bearer $CRON_SECRET"
```

---

## Implementation Issues & Solutions

### Issue 1: Missing /auth/magic-link Route

**Problem:** MagicLinkCallbackPage showed blank page when clicking magic link

**Root Cause:** The app uses `App.jsx` for routing (loaded via `index.jsx`), but the `/auth/magic-link` route was only added to `router.jsx` (which isn't used)

**Solution:**
```javascript
// src/App.jsx
import MagicLinkCallbackPage from '@/pages/MagicLinkCallbackPage';

// Add route:
<Route path="/auth/magic-link" element={<MagicLinkCallbackPage />} />

// Also hide navbar/footer:
const hideLayout = [
  '/auth/callback',
  '/auth/magic-link',  // Add this
  '/invite-sent',
  //...
];
```

**Lesson:** Always verify which routing system your app actually uses

---

### Issue 2: Xano Debug Mode Response Wrapper

**Problem:** Verify endpoint returned 500 error: "Invalid response from Xano"

**Root Cause:** Xano endpoints with "Stop & Debug" steps wrap responses in:
```json
{
  "payload": { ...actual data... },
  "statement": "Stop & Debug"
}
```

The code expected data at root level, not nested in `payload`.

**Solution:**
```javascript
// api/auth/magic-link/verify.js
let actualResponse = xanoResponse;
if (xanoResponse.payload) {
  actualResponse = xanoResponse.payload;
}

// Then use actualResponse for all data access
if (actualResponse.error) { ... }
if (actualResponse.token) { ... }
```

**Lesson:** Always unwrap Xano debug responses; works in both debug and production modes

---

### Issue 3: React StrictMode Double-Render

**Problem:** Error message flashed briefly before successful login

**Root Cause:** React's StrictMode intentionally runs useEffect twice:
1. First call: Verify token → SUCCESS → save JWT
2. Second call: Verify same token → ERROR (already used)

**Solution:**
```javascript
// src/pages/MagicLinkCallbackPage.jsx
const hasVerifiedRef = React.useRef(false);

React.useEffect(() => {
  // Skip if already verified (prevents StrictMode double-render)
  if (hasVerifiedRef.current) {
    return;
  }
  hasVerifiedRef.current = true;

  // Verification logic...
}, [searchParams, login, navigate]);
```

**Lesson:** Use `useRef` flag to prevent duplicate API calls in StrictMode

---

### Issue 4: Xano Query Type Mismatch

**Problem:** Endpoint returned errors about `magic_link_record = null` and `magic_link_record.used` failing

**Root Cause:** Used "Query All Records From" which returns an array, but code expected a single object

**Solution:** Change Xano step 1 from "Query All Records From" to "Get Record From" with filter `token = {token}`

**Lesson:** "Get Record" returns single object or null; "Query All Records" always returns array

---

### Issue 5: Missing Xano Public API Configuration

**Problem:** 404 error when calling `/auth/magic-link/initiate`

**Root Cause:** Endpoint was in wrong API group (Authentication API instead of Public API)

**Solution:**
- Create endpoints in **Public API** group (no authentication required)
- Set `XANO_PUBLIC_API_URL` in Vercel environment variables
- Use `{ usePublicApi: true }` when calling from Vercel:
```javascript
const xanoResponse = await xanoPost(
  '/auth/magic-link/verify',
  { token, ip_address },
  { usePublicApi: true }
);
```

**Lesson:** Unauthenticated endpoints (like magic link verification) must be in Public API group

---

## Troubleshooting

### Issue: Email not received

**Possible Causes:**
1. ZeptoMail configuration incorrect
2. Email in spam folder
3. Invalid email address
4. ZeptoMail rate limits hit

**Solutions:**
- Check Vercel logs for ZeptoMail errors
- Verify ZEPTOMAIL_TOKEN environment variable set
- Check ZeptoMail dashboard for delivery status
- Ask user to check spam folder

---

### Issue: Token verification fails with 404

**Possible Causes:**
1. Token doesn't exist in database
2. Token already used and deleted
3. Database connection issue

**Solutions:**
- Check Xano `magic_link_tokens` table for token
- Verify token string is exact match (UUID format)
- Check Xano endpoint logs for errors

---

### Issue: Rate limit triggers too quickly

**Possible Causes:**
1. Clock skew between servers
2. Incorrect `one_hour_ago` calculation
3. Tokens not being cleaned up

**Solutions:**
- Verify `now()` function returns correct timestamp
- Check `one_hour_ago = now() - 3600` calculation
- Manually delete old tokens to reset counter

---

### Issue: Authentication token doesn't work

**Possible Causes:**
1. `dbtable` not set in "Create Authentication Token" step
2. `id` parameter incorrect
3. Wrong table name used

**Solutions:**
- **CRITICAL:** Verify `dbtable` set to `"user"` (your table name)
- **CRITICAL:** Verify `id` parameter uses `user.id` from conditional
- Test JWT token with `/me/bootstrap` endpoint
- Check Xano authentication settings

**Example Configuration:**
```
Create Authentication Token:
  dbtable: "user"           // ← Must be exact table name
  id: user.id               // ← Must reference user from conditional
  expiration: 86400         // 24 hours
```

---

### Issue: Welcome email not sent to new users

**Possible Causes:**
1. Vercel function error
2. ZeptoMail error (non-blocking)
3. Email template issue

**Solutions:**
- Check Vercel logs for email errors
- Verify `sendWelcomeEmail` function in zeptomail.js
- Welcome email failure doesn't block authentication

---

### Issue: Magic link page shows "Verifying..." indefinitely

**Possible Causes:**
1. Frontend can't reach Vercel API
2. Xano endpoint error
3. CORS issue
4. Network error

**Solutions:**
- Check browser console for errors
- Verify `/api/auth/magic-link/verify` returns response
- Check Xano endpoint is in Public API group (no auth)
- Test with browser DevTools Network tab

---

## Environment Variables

### Vercel (Backend)

```bash
# ZeptoMail
ZEPTOMAIL_TOKEN=your_zeptomail_api_token
ZEPTOMAIL_FROM_EMAIL=noreply@mindpick.me
ZEPTOMAIL_FROM_NAME=QuickChat

# Xano
XANO_PUBLIC_API_URL=https://xlho-4syv-navp.n7e.xano.io/api:BQW1GS7L
XANO_INTERNAL_API_KEY=your_internal_api_key

# App
CLIENT_PUBLIC_ORIGIN=https://mindpick.me
```

### Frontend (Vite)

No additional environment variables needed. The frontend uses relative API paths that proxy through Vercel.

---

## Integration with Existing Auth

### Coexistence with OAuth

Magic link authentication works alongside Google and LinkedIn OAuth:

**Shared Components:**
- Same JWT token format
- Same localStorage key (`qc_token`)
- Same AuthContext
- Same `/expert` dashboard

**User Table Schema:**
- `auth_provider`: `"google"` | `"linkedin"` | `"magic_link"`
- `auth_provider_id`: Provider's user ID or email

**User can sign in with any method:**
- User created with Google can later use magic link
- Magic link user can later use OAuth
- Email is the common identifier

---

## Metrics and Monitoring

### Key Metrics to Track

1. **Magic Link Requests:**
   - Total requests per day
   - Unique emails per day
   - Rate limit hits

2. **Verification Success Rate:**
   - Successful verifications
   - Expired tokens
   - Already-used tokens
   - Not-found tokens

3. **User Conversion:**
   - New users via magic link
   - Returning users
   - Time from send to verify

4. **Email Delivery:**
   - Sent successfully
   - Failed sends
   - Bounce rate

### Monitoring Queries

**Recent Magic Link Activity:**
```sql
SELECT
  DATE(created_at) as date,
  COUNT(*) as total_requests,
  COUNT(DISTINCT email) as unique_emails,
  SUM(CASE WHEN used = true THEN 1 ELSE 0 END) as successful_verifications
FROM magic_link_tokens
WHERE created_at > now() - 604800  // Last 7 days
GROUP BY DATE(created_at)
ORDER BY date DESC
```

**Rate Limit Statistics:**
```sql
SELECT
  email,
  COUNT(*) as requests_count
FROM magic_link_tokens
WHERE created_at > now() - 3600  // Last hour
GROUP BY email
HAVING COUNT(*) >= 3
```

---

## Next Steps

### Phase 1: ✅ Frontend Implementation (COMPLETE)
- [x] Vercel API endpoints
- [x] Email templates
- [x] SignInPage updates
- [x] MagicLinkCallbackPage
- [x] Router configuration (App.jsx)
- [x] API client methods

### Phase 2: ✅ Xano Configuration (COMPLETE)
- [x] Create `magic_link_tokens` table
- [x] Create `generate_magic_link_token()` function
- [x] Create `check_magic_link_rate_limit()` function
- [x] Create `/auth/magic-link/initiate` endpoint
- [x] Create `/auth/magic-link/verify` endpoint

### Phase 3: ✅ Testing & Deployment (COMPLETE)
- [x] Test magic link send flow
- [x] Test token verification
- [x] Test rate limiting
- [x] Test new user creation
- [x] Test with real email addresses
- [x] Deploy to production

### Phase 4: ✅ Automated Cleanup (COMPLETE)
- [x] Integrated with nightly cleanup cron job
- [x] Expired tokens cleanup (>7 days)
- [x] Used tokens cleanup (>30 days)
- [x] Unused tokens cleanup (>30 days)
- [x] Automated monitoring via Vercel logs

### Phase 5: 📊 Monitoring & Optimization (TODO)
- [ ] Set up metrics tracking
- [ ] Monitor email delivery rates
- [ ] Monitor verification success rates
- [ ] Optimize token expiration time if needed
- [ ] Add analytics for user behavior

---

## Support

For issues with implementation:

1. **Xano Configuration:** Check Xano dashboard endpoint logs
2. **Email Delivery:** Check ZeptoMail dashboard
3. **Frontend Issues:** Check browser console and Vercel logs
4. **Token Issues:** Query `magic_link_tokens` table directly

**Documentation:**
- Xano: https://docs.xano.com
- ZeptoMail: https://www.zoho.com/zeptomail/help/
- Magic Link Best Practices: https://www.ietf.org/archive/id/draft-ietf-oauth-security-topics-22.html

---

## Changelog

### 2025-01-16 (Automated Cleanup)
- ✅ Integrated magic link token cleanup with nightly cron job
- ✅ Automated deletion of old tokens (expired >7d, used >30d, unused >30d)
- ✅ Added Xano internal endpoints for cleanup
- ✅ Updated documentation across all files

### 2025-01-15 (Production Release)
- ✅ Created magic link authentication system
- ✅ Frontend implementation complete (React + Vercel API)
- ✅ Backend Xano configuration complete
- ✅ Email integration with ZeptoMail
- ✅ End-to-end testing completed
- ✅ Deployed to production (mindpick.me)
- ✅ Documentation complete with known issues & solutions

**Key Features:**
- Passwordless email authentication
- Time-limited tokens (15 minutes)
- One-time use links
- Rate limiting (3 per hour)
- New user auto-creation
- Welcome email for first-time users
- Works alongside Google/LinkedIn OAuth
- Automated token cleanup (nightly)

**Issues Resolved:**
- Fixed missing /auth/magic-link route in App.jsx
- Fixed Xano debug mode response wrapper handling
- Fixed React StrictMode double-render
- Fixed Xano query type mismatch
- Configured Public API for unauthenticated endpoints
- Fixed missing expert_profile creation in magic link flow

---

**Last Updated:** January 16, 2025
**Status:** ✅ Production Ready | Fully Operational
