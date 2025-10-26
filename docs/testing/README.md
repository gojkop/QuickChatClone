# QuickChat Testing Documentation

Complete guide to testing the QuickChat platform, including security validation, API testing, and best practices.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Test Suites](#test-suites)
3. [Running Tests](#running-tests)
4. [Test Configuration](#test-configuration)
5. [Documentation Files](#documentation-files)

---

## Overview

QuickChat uses automated testing to ensure security, reliability, and correctness of API endpoints. The primary focus is on security validation to protect user data and prevent unauthorized access.

**Test Coverage:**
- Authentication & authorization
- Cross-expert ownership checks
- Payment validation & fraud prevention
- Input validation & edge cases
- Token security & access control

---

## Test Suites

### Security Validation Suite

**Status:** ✅ Production Ready (October 26, 2025)

Automated security tests covering 16 critical security scenarios across all major API endpoints.

**Test Coverage:**
- ✅ PATCH /question/{id} - Authentication enforcement (3 tests)
- ✅ PATCH /question/{id} - Cross-expert ownership
- ✅ POST /answer - Cross-expert answer blocking
- ✅ POST /question/quick-consult - Payment reuse prevention (3 tests)
- ✅ POST /question/deep-dive - Payment reuse prevention
- ✅ POST /review/{token}/feedback - Invalid token rejection
- ✅ POST /review/{token}/feedback - Rating range validation
- ✅ GET /review/{token} - Token access control
- ✅ POST /offers/{id}/accept - Cross-expert ownership
- ✅ POST /offers/{id}/decline - Cross-expert ownership
- ✅ POST /payment/capture - Cross-expert ownership
- ✅ POST /question/{id}/refund - Cross-expert ownership

**Location:** `/tests/security-validation.cjs`

**Documentation:**
- [Security Validation Guide](./SECURITY-VALIDATION-GUIDE.md) - Complete test suite documentation
- [Xano Manual Testing](./XANO-MANUAL-TESTING.md) - Manual testing payloads for Xano Run & Debug

---

## Running Tests

### Security Tests

**Quick Run:**
```bash
./tests/run-security-tests.sh
```

**Manual Run:**
```bash
cd tests
node security-validation.cjs
```

**Expected Output:**
```
QuickChat Security Validation
==============================
Log file: /Users/.../tests/logs/security-test-YYYY-MM-DD_HH-MM-SS.log

✓ Node.js version: v24.10.0
✓ Loading test configuration from /Users/.../tests/.env

============================================================
XANO SECURITY VALIDATION TEST SUITE
Date: 2025-10-26T14:21:42.420Z
============================================================

✓ Passed:  16
✗ Failed:  0
⊘ Skipped: 0
Total: 16

ALL SECURITY TESTS PASSED!
Your endpoints are secure and ready for production.
```

### Test Logs

All test runs are logged to `/tests/logs/` with timestamp:
```
tests/logs/security-test-2025-10-26_15-21-42.log
```

Logs include:
- Complete test output
- Request/response details
- Error messages and stack traces
- Summary statistics

---

## Test Configuration

### Environment Variables

Test configuration is stored in `/tests/.env`:

```bash
# Xano API endpoints
XANO_AUTH_API=https://xlho-4syv-navp.n7e.xano.io/api:XEsV5Zbo
XANO_PUBLIC_API=https://xlho-4syv-navp.n7e.xano.io/api:BQW1GS7L

# Expert A credentials (required)
EXPERT_A_TOKEN=eyJhbGc...
EXPERT_A_PROFILE_ID=139

# Expert B credentials (optional - enables cross-expert tests)
EXPERT_B_TOKEN=eyJhbGc...
EXPERT_B_PROFILE_ID=138

# Test question IDs
EXPERT_A_QUESTION_ID=264
EXPERT_B_QUESTION_ID=279

# Review tokens (for feedback tests)
VALID_REVIEW_TOKEN=71890360-1fc6-4f26-9b5d-7338003b625c
```

**Getting Auth Tokens:**

1. Sign in to QuickChat in browser
2. Open Developer Tools → Console
3. Run: `localStorage.getItem('qc_token')`
4. Copy full token (including `eyJ...` prefix)
5. Paste into `.env` file

**Getting Profile IDs:**

1. Sign in as expert
2. Go to `/expert` dashboard
3. Open Network tab in DevTools
4. Look for `/me/questions` API call
5. Check response for `expert_profile_id`

---

## Documentation Files

| File | Description |
|------|-------------|
| [README.md](./README.md) | This file - Main testing documentation index |
| [SECURITY-VALIDATION-GUIDE.md](./SECURITY-VALIDATION-GUIDE.md) | Complete security test suite documentation |
| [XANO-MANUAL-TESTING.md](./XANO-MANUAL-TESTING.md) | Manual testing payloads for Xano Run & Debug |
| [BEST-PRACTICES.md](./BEST-PRACTICES.md) | Testing best practices and guidelines |

---

## Test Architecture

### Security Test Suite Structure

```
/tests
├── security-validation.cjs        # Main test script
├── run-security-tests.sh          # Shell wrapper
├── .env                           # Test configuration
└── logs/                          # Test execution logs
    └── security-test-*.log
```

### Key Components

**Request Helper (`request()`):**
- Handles all HTTP requests
- Supports GET, POST, PATCH, DELETE
- Automatic JSON parsing
- Error handling with status codes
- Returns: `{ ok, status, data, error }`

**Xano Error Helper (`isXanoError()`):**
- Detects Xano's `debug.stop` error format
- Checks for specific error codes (403, 404, 400)
- Handles HTTP 200 responses with error payloads

**Test Logger (`logTest()`):**
- Color-coded output (PASS=green, FAIL=red, SKIP=yellow)
- Structured test results
- Summary statistics

**Configuration Loader:**
- Loads `.env` file
- Validates required variables
- Checks for optional EXPERT_B setup

---

## Test Maintenance

### Adding New Tests

1. **Create test function:**
```javascript
async function testNewFeature() {
  console.log(`\n${COLORS.blue}┌─ Test Suite: New Feature${COLORS.reset}`);

  const res = await request(`${CONFIG.XANO_API}/endpoint`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${CONFIG.TOKEN}` },
    body: JSON.stringify({ /* test data */ }),
  });

  if (res.status === 200 && !isXanoError(res)) {
    logTest('Feature works', 'PASS', 'Success message');
  } else {
    logTest('Feature works', 'FAIL', 'Failure message');
  }

  console.log(`${COLORS.blue}└─${COLORS.reset}`);
}
```

2. **Add to main test runner:**
```javascript
async function runAllTests() {
  await testPatchQuestionAuthentication();
  await testPatchQuestionOwnership();
  await testNewFeature();  // Add here
  // ...
}
```

3. **Update documentation** in this README and SECURITY-VALIDATION-GUIDE.md

### Updating Test Data

When test data changes (question IDs, tokens, etc.):

1. Update `/tests/.env` file
2. Verify tests still pass
3. Update documentation with new IDs if needed

### Debugging Failed Tests

1. **Check test logs:** `/tests/logs/security-test-*.log`
2. **Verify .env configuration:** Ensure tokens and IDs are current
3. **Test in Xano:** Use Run & Debug with payloads from XANO-MANUAL-TESTING.md
4. **Check endpoint implementation:** Verify Xano function stack
5. **Compare with working endpoint:** Check differences in logic

---

## CI/CD Integration

### GitHub Actions (Future)

```yaml
name: Security Tests

on:
  push:
    branches: [main]
  pull_request:

jobs:
  security:
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
          EXPERT_A_TOKEN: ${{ secrets.EXPERT_A_TOKEN }}
          EXPERT_A_PROFILE_ID: ${{ secrets.EXPERT_A_PROFILE_ID }}
        run: ./tests/run-security-tests.sh
```

### Vercel Cron (Future)

Run security tests periodically in production:

```javascript
// /api/cron/run-security-tests.js
export default async function handler(req, res) {
  // Verify cron secret
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Run security validation
  // Send results to monitoring service
}
```

---

## Support

For questions or issues with testing:

1. Check [SECURITY-VALIDATION-GUIDE.md](./SECURITY-VALIDATION-GUIDE.md) for detailed test documentation
2. Check [XANO-MANUAL-TESTING.md](./XANO-MANUAL-TESTING.md) for manual testing procedures
3. Review test logs in `/tests/logs/`
4. Check Xano function stack for endpoint implementation
5. Open issue in GitHub repository

---

**Last Updated:** October 26, 2025
**Test Suite Version:** 1.0.0
**Status:** ✅ Production Ready
