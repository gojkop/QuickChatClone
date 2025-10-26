# Security Validation Tests

Automated test suite to validate all Xano security fixes implemented in January 2025.

## Overview

This test suite validates:
- ✅ Authentication requirements
- ✅ Ownership verification
- ✅ Payment intent reuse prevention
- ✅ Token protection (never exposed to experts)
- ✅ Input validation

**Note:** The test suite can run with just one expert account. Cross-expert ownership tests will be skipped if a second expert is not configured.

## Quick Start

### 1. Install Dependencies

```bash
# No dependencies required - uses native Node.js fetch
# Requires Node.js 18+ (has native fetch)
node --version  # Should be >= 18.0.0
```

### 2. Configure Test Data

```bash
# From project root
cd tests
cp .env.example .env
nano .env  # Edit with your test data
```

Edit `.env` and add your test data:

```bash
# ============================================
# MINIMUM REQUIRED CONFIGURATION
# ============================================

# 1. Get Xano API URLs from Xano dashboard
XANO_AUTH_API=https://your-workspace.xano.io/api:3B14WLbJ
XANO_PUBLIC_API=https://your-workspace.xano.io/api:BQW1GS7L

# 2. Get expert token from browser localStorage after login
EXPERT_A_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ============================================
# OPTIONAL (for full test coverage)
# ============================================

# 3. Second expert (for cross-expert ownership tests)
EXPERT_B_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
EXPERT_B_QUESTION_ID=456  # Question owned by Expert B

# 4. Expert A's data (for more complete testing)
EXPERT_A_QUESTION_ID=123  # Question owned by Expert A
EXPERT_A_PROFILE_ID=1

# 5. Payment intent IDs (from Stripe test mode)
VALID_PAYMENT_INTENT=pi_test_new_12345       # Unused
USED_PAYMENT_INTENT=pi_test_used_67890       # Already used

# 6. Review token from question table
VALID_REVIEW_TOKEN=uuid-from-playback_token_hash-column
```

**With just the minimum configuration**, the test suite will:
- ✅ Test authentication requirements
- ✅ Test Expert A can update their own questions
- ✅ Test token protection (playback_token_hash never exposed)
- ⊘ Skip cross-expert ownership tests (requires EXPERT_B)

### 3. Run Tests

```bash
# From project root (recommended) - saves log file
./tests/run-security-tests.sh

# Or run directly (no log file)
node tests/security-validation.cjs

# Or from tests directory
cd tests
./run-security-tests.sh
```

**Output:** Test results are displayed on screen AND saved to:
```
tests/logs/security-test-YYYY-MM-DD_HH-MM-SS.log
```

This is useful for:
- Reviewing failures later
- Sharing results with team
- CI/CD log archives
- Debugging issues

## How to Get Test Data

### Get Expert Auth Tokens

1. Open your app in browser
2. Sign in as Expert A
3. Open DevTools (F12) → Console
4. Run: `localStorage.getItem('qc_token')`
5. Copy the token
6. Repeat for Expert B (use incognito window or different browser)

### Get Question IDs

**Option 1: From Xano Database**
1. Go to Xano → Database → `question` table
2. Find two questions owned by different experts
3. Note their `id` and `expert_profile_id`

**Option 2: From Expert Dashboard**
1. Log in as Expert A
2. View question in dashboard
3. Check URL or Network tab for question ID

### Get Review Token

1. Go to Xano → Database → `question` table
2. Copy any `playback_token_hash` value
3. Use in `.env` as `VALID_REVIEW_TOKEN`

### Get Payment Intent IDs

**For VALID_PAYMENT_INTENT:**
- Use any unique string starting with `pi_test_`
- Example: `pi_test_new_${Date.now()}`

**For USED_PAYMENT_INTENT:**
- Create a question first (use any payment intent)
- Then use that same payment intent ID here
- This tests that the same payment can't be used twice

## Test Suites

### Suite 1: PATCH /question/{id} - Authentication
- ✅ Requires authentication (401/403 without token)
- ✅ Expert can update own question
- ✅ Response doesn't include `playback_token_hash`

### Suite 2: PATCH /question/{id} - Ownership
- ✅ Expert A cannot update Expert B's question (403)

### Suite 3: POST /answer - Security
- ✅ Expert B cannot answer Expert A's question (403)

### Suite 4: Payment Intent Validation (Quick Consult)
- ✅ Cannot reuse payment intent (400)
- ✅ New payment intent accepted
- ✅ Response includes token for asker

### Suite 5: Payment Intent Validation (Deep Dive)
- ✅ Cannot reuse payment intent (400)

### Suite 6: Feedback Validation
- ✅ Invalid review token rejected (404)
- ✅ Rating must be 1-5 (400 for invalid range)

### Suite 7: Review Token Access
- ✅ Review page accessible with token
- ✅ Returns `playback_token_hash` (OK for asker)

## Expected Output

### ✅ Success (All Tests Pass)

```
============================================================
XANO SECURITY VALIDATION TEST SUITE
Date: 2025-01-26T10:30:00.000Z
============================================================

Configuration Check:
✓ Configuration complete

┌─ Test Suite: PATCH /question/{id} - Authentication
[PASS] PATCH /question/{id} requires authentication
  → Unauthenticated request rejected
[PASS] Expert can update own question
  → Update succeeded
[PASS] PATCH response hides playback_token_hash
  → Token not in response
└─

┌─ Test Suite: PATCH /question/{id} - Ownership
[PASS] Cross-expert update blocked
  → Ownership violation prevented
└─

... (more test suites)

============================================================
TEST SUMMARY
============================================================
✓ Passed:  12
✗ Failed:  0
⊘ Skipped: 0
Total: 12
============================================================

ALL SECURITY TESTS PASSED!
Your endpoints are secure and ready for production.
```

### ❌ Failure (Security Issue Detected)

```
[FAIL] PATCH response hides playback_token_hash
  → ⚠️  TOKEN LEAKED TO EXPERT!

[FAIL] Cross-expert update blocked
  → ⚠️  OWNERSHIP CHECK FAILED!

============================================================
TEST SUMMARY
============================================================
✓ Passed:  10
✗ Failed:  2
⊘ Skipped: 0
Total: 12
============================================================

SECURITY ISSUES DETECTED!
Review failed tests above and fix before deploying.
```

## Viewing Test Logs

All test runs are saved to timestamped log files:

```bash
# View latest log
cat tests/logs/security-test-*.log | tail -100

# View specific log
cat tests/logs/security-test-2025-01-26_14-30-45.log

# List all logs
ls -lh tests/logs/

# View only failed tests from latest log
grep -A 2 "\[FAIL\]" tests/logs/security-test-*.log | tail -20

# Clean old logs (keep last 10)
cd tests/logs
ls -t *.log | tail -n +11 | xargs rm -f
```

**Log files include:**
- Timestamp of test run
- Node.js version
- All test results (PASS/FAIL/SKIP)
- Error messages and stack traces
- Final summary

## Troubleshooting

### Error: "Missing configuration"

**Cause:** Environment variables not set

**Solution:**
1. Check `.env` file exists in `tests/` directory
2. Ensure all variables are filled in
3. Try running: `node -r dotenv/config tests/security-validation.js`

### Error: "fetch is not defined"

**Cause:** Node.js version too old

**Solution:**
- Upgrade to Node.js 18+: `nvm install 18` or download from nodejs.org
- Or install `node-fetch`: `npm install node-fetch`

### Status 401/403 on valid requests

**Cause:** Invalid or expired auth token

**Solution:**
1. Get fresh token from browser localStorage
2. Ensure token is for correct expert account
3. Check token isn't expired (usually 24 hours)

### Status 404 on questions

**Cause:** Question IDs don't exist or wrong expert

**Solution:**
1. Verify question IDs in Xano database
2. Ensure `EXPERT_A_QUESTION_ID` belongs to Expert A
3. Ensure `EXPERT_B_QUESTION_ID` belongs to Expert B

### Payment tests skip/fail

**Cause:** Invalid payment intent format or already used

**Solution:**
1. Use fresh payment intent IDs
2. Format: `pi_test_something_unique`
3. For `USED_PAYMENT_INTENT`, create question first with that ID

## CI/CD Integration

### GitHub Actions

```yaml
name: Security Validation

on: [push, pull_request]

jobs:
  security-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Run security tests
        env:
          XANO_AUTH_API: ${{ secrets.XANO_AUTH_API }}
          XANO_PUBLIC_API: ${{ secrets.XANO_PUBLIC_API }}
          EXPERT_A_TOKEN: ${{ secrets.TEST_EXPERT_A_TOKEN }}
          EXPERT_B_TOKEN: ${{ secrets.TEST_EXPERT_B_TOKEN }}
          EXPERT_A_QUESTION_ID: ${{ secrets.TEST_QUESTION_A }}
          EXPERT_B_QUESTION_ID: ${{ secrets.TEST_QUESTION_B }}
          EXPERT_A_PROFILE_ID: ${{ secrets.TEST_PROFILE_A }}
          VALID_PAYMENT_INTENT: pi_test_ci_${{ github.run_id }}
          USED_PAYMENT_INTENT: pi_test_used_static
          VALID_REVIEW_TOKEN: ${{ secrets.TEST_REVIEW_TOKEN }}
        run: node tests/security-validation.js
```

### Vercel Deploy Hook

```bash
# Add to vercel.json
{
  "buildCommand": "npm run build && node tests/security-validation.js"
}
```

## Test Maintenance

### When to Update Tests

- ✅ After adding new endpoints
- ✅ After modifying authentication logic
- ✅ After changing ownership verification
- ✅ After updating payment flow
- ✅ Before production deployments

### Recommended Schedule

- **Daily:** Run locally during development
- **Per PR:** Run in CI/CD pipeline
- **Weekly:** Full security audit with manual review
- **Monthly:** Update test data (tokens, question IDs)

## Additional Security Testing

### Manual Tests

1. **Browser DevTools Network Tab**
   - Check all API responses for `playback_token_hash`
   - Should NEVER appear in expert-facing endpoints

2. **Xano Logs**
   - Search for: `"Ownership verified"`
   - Search for: `"Forbidden"`
   - Verify ownership checks are being logged

3. **Stripe Dashboard**
   - Check for duplicate payment intents
   - Verify payment amounts match expert pricing

### Load Testing

```bash
# Install artillery
npm install -g artillery

# Run load test
artillery quick --count 10 --num 100 \
  https://your-xano.io/api:BQW1GS7L/question/quick-consult
```

## Support

If tests fail unexpectedly:
1. Check `/docs/api-database/XANO-SECURITY-IMPLEMENTATION-COMPLETE.md`
2. Review `/docs/api-database/XANO-SECURITY-FIXES-GUIDE.md`
3. Verify all endpoints updated per documentation
4. Check Xano logs for detailed error messages

## Related Documentation

- [Xano Security Fixes Guide](../docs/api-database/XANO-SECURITY-FIXES-GUIDE.md)
- [Security Audit](../docs/api-database/XANO-SECURITY-AUDIT-JAN-2025.md)
- [Implementation Complete](../docs/api-database/XANO-SECURITY-IMPLEMENTATION-COMPLETE.md)
- [Stripe Security](../docs/integrations/STRIPE-SECURITY-UPDATE-JAN-2025.md)
