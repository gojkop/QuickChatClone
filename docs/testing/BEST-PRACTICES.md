# Testing Best Practices

Guidelines and best practices for testing QuickChat APIs, security, and features.

---

## General Principles

### 1. Security First

Always test security-critical scenarios:
- Authentication enforcement
- Authorization checks (ownership)
- Input validation
- Token protection
- Payment validation

**Rule:** Every endpoint that modifies data must have security tests.

### 2. Test Real Scenarios

Use realistic test data:
- ✅ Real expert tokens from browser
- ✅ Actual question/answer IDs from database
- ✅ Valid payment intent format
- ❌ Mock data that doesn't match production

### 3. Independent Tests

Each test should:
- Run independently (no dependencies on other tests)
- Clean up after itself (or use unique data)
- Not rely on specific database state
- Be repeatable

### 4. Clear Expectations

Every test should clearly define:
- **Purpose:** What are we testing?
- **Expected result:** What should happen?
- **Actual result:** What actually happened?
- **Pass/fail criteria:** When do we pass?

---

## Security Testing

### Authentication Testing

**Always test these scenarios:**

1. **Unauthenticated requests rejected:**
```javascript
const res = await request(endpoint, { method: 'POST' });
// No Authorization header
expect(res.status === 401 || isXanoError(res, '401'));
```

2. **Valid auth succeeds:**
```javascript
const res = await request(endpoint, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${VALID_TOKEN}` }
});
expect(res.ok && !isXanoError(res));
```

3. **Invalid token rejected:**
```javascript
const res = await request(endpoint, {
  method: 'POST',
  headers: { 'Authorization': 'Bearer invalid_token' }
});
expect(res.status === 401 || isXanoError(res, '401'));
```

### Authorization Testing

**Test ownership checks:**

1. **Owner can access:**
```javascript
const res = await request(`/question/${OWNED_QUESTION_ID}`, {
  headers: { 'Authorization': `Bearer ${OWNER_TOKEN}` }
});
expect(res.ok);
```

2. **Non-owner blocked:**
```javascript
const res = await request(`/question/${OTHER_EXPERT_QUESTION_ID}`, {
  headers: { 'Authorization': `Bearer ${MY_TOKEN}` }
});
expect(res.status === 403 || isXanoError(res, '403'));
```

### Input Validation Testing

**Test edge cases:**

1. **Valid input succeeds:**
```javascript
const res = await request(endpoint, {
  body: JSON.stringify({ rating: 5 })
});
expect(res.ok);
```

2. **Invalid input rejected:**
```javascript
const res = await request(endpoint, {
  body: JSON.stringify({ rating: 10 })
});
expect(res.status === 400 || isXanoError(res, '400'));
```

3. **Missing required fields:**
```javascript
const res = await request(endpoint, {
  body: JSON.stringify({}) // Missing required fields
});
expect(res.status === 400 || isXanoError(res, '400'));
```

---

## Xano-Specific Practices

### Understanding debug.stop

Xano's `debug.stop` returns HTTP 200 with error in payload:

```json
{
  "payload": "403 error \"Forbidden\"",
  "statement": "Stop & Debug"
}
```

**Always check both:**
```javascript
if (res.status === 403 || isXanoError(res, '403')) {
  // Handle error
}
```

### Variable Scoping

Always use `$var` prefix in Xano lambdas:

```javascript
// ✅ Correct
console.log("Value: " + $var.question.id);

// ❌ Wrong
console.log("Value: " + question.id); // Error: Cannot find name 'question'
```

### Conditionals vs Lambdas

Use native conditionals for validation:

```javascript
// ✅ Correct - Use conditional with debug.stop
conditional {
  if ($input.rating < 1 || $input.rating > 5) {
    debug.stop { value = '400 error "Invalid rating"' }
  }
}

// ❌ Wrong - Lambda with throw doesn't work reliably
api.lambda {
  code = """
    if ($input.rating < 1 || $input.rating > 5) {
      throw new Error('Invalid rating');
    }
  """
}
```

### Payment Checks First

Always check payments BEFORE creating records:

```javascript
// ✅ Correct order
stack {
  // 1. Check payment (FIRST)
  db.get payment_table_structure {
    field_name = "stripe_payment_intent_id"
    field_value = $input.stripe_payment_intent_id
  } as $existing_payment

  conditional {
    if ($existing_payment != null) {
      debug.stop { value = '400 error "Payment already used"' }
    }
  }

  // 2. Create question (AFTER check passes)
  db.add question { ... }
}

// ❌ Wrong order - Payment created even if check fails
stack {
  db.add question { ... }  // Created first

  db.get payment_table_structure { ... }  // Checked second (too late!)
}
```

---

## Test Data Management

### Use Dynamic Data

Generate unique identifiers:

```javascript
// ✅ Good - Unique every time
const paymentId = `pi_test_${Date.now()}`;
const email = `test_${Date.now()}@example.com`;

// ❌ Bad - Same data causes failures
const paymentId = 'pi_test_123'; // Already used
const email = 'test@example.com'; // Already exists
```

### Clean Test Data

Create fresh data for critical tests:

```javascript
// ✅ Good - Create fresh question
const createRes = await createQuestion();
const questionId = createRes.data.question_id;

// Test with fresh question
const testRes = await answerQuestion(questionId);

// ❌ Bad - Use hardcoded question ID
const testRes = await answerQuestion(279); // Might be answered already
```

### Document Test IDs

Keep `.env` file documented:

```bash
# Expert A - Primary test expert
EXPERT_A_TOKEN=eyJhbGc...
EXPERT_A_PROFILE_ID=139  # Profile ID, not user_id
EXPERT_A_QUESTION_ID=264 # Unanswered question owned by Expert A

# Expert B - For cross-expert testing
EXPERT_B_TOKEN=eyJhbGc...
EXPERT_B_PROFILE_ID=138
EXPERT_B_QUESTION_ID=279 # Unanswered question owned by Expert B
```

---

## Error Handling

### Graceful Failures

Handle errors gracefully in tests:

```javascript
async function testFeature() {
  try {
    const res = await request(endpoint, options);

    if (res.ok && !isXanoError(res)) {
      logTest('Feature works', 'PASS', 'Success');
    } else if (res.status === 403 || isXanoError(res, '403')) {
      logTest('Feature works', 'FAIL', 'Unauthorized');
    } else {
      logTest('Feature works', 'SKIP', `Unexpected: ${res.status}`);
    }
  } catch (error) {
    logTest('Feature works', 'FAIL', `Error: ${error.message}`);
  }
}
```

### Log Meaningful Information

Include context in logs:

```javascript
// ✅ Good - Shows what failed
logTest('Cross-expert blocked', 'FAIL',
  `Expert B (${EXPERT_B_ID}) updated Expert A's question (${QUESTION_ID})`
);

// ❌ Bad - No context
logTest('Test failed', 'FAIL', 'Something went wrong');
```

### Skip Appropriately

Skip tests when preconditions aren't met:

```javascript
if (!process.env.EXPERT_B_TOKEN) {
  logTest('Cross-expert test', 'SKIP', 'EXPERT_B not configured');
  return;
}

// Continue with test
```

---

## Test Organization

### Group Related Tests

```javascript
async function testPatchQuestionSecurity() {
  console.log(`\n${COLORS.blue}┌─ Test Suite: PATCH /question/{id}${COLORS.reset}`);

  // Test 1.1: Authentication
  await testPatchQuestionAuth();

  // Test 1.2: Ownership
  await testPatchQuestionOwnership();

  // Test 1.3: Token protection
  await testPatchQuestionTokenProtection();

  console.log(`${COLORS.blue}└─${COLORS.reset}`);
}
```

### Clear Test Names

Use descriptive names:

```javascript
// ✅ Good
async function testCrossExpertAnswerBlocked() { ... }
async function testPaymentReusePreventionQuickConsult() { ... }
async function testInvalidRatingRejected() { ... }

// ❌ Bad
async function test1() { ... }
async function testAnswers() { ... }
async function testValidation() { ... }
```

### Document Test Purpose

Add comments explaining why:

```javascript
// Test that Expert B cannot answer Expert A's question
// This prevents experts from stealing each other's revenue
async function testCrossExpertAnswerBlocked() {
  // Create fresh question to avoid "already answered" error
  const questionId = await createTestQuestion();

  // Attempt answer with wrong expert credentials
  const res = await attemptAnswer(questionId, EXPERT_B_TOKEN);

  // Verify rejection
  expect(res.status === 403 || isXanoError(res, '403'));
}
```

---

## Debugging Failed Tests

### Step-by-Step Process

1. **Read the error message:**
   - What endpoint failed?
   - What was the expected result?
   - What actually happened?

2. **Check test logs:**
   - Look in `/tests/logs/security-test-*.log`
   - Find the failed test section
   - Check request/response details

3. **Verify configuration:**
   - Are tokens valid and current?
   - Are question IDs correct?
   - Are endpoints URLs right?

4. **Test manually in Xano:**
   - Use Run & Debug with payloads from XANO-MANUAL-TESTING.md
   - Add console.log() statements
   - Check Logs tab for output

5. **Compare with working endpoint:**
   - What's different?
   - Is the conditional missing?
   - Is the variable name wrong?

6. **Fix and retest:**
   - Apply fix in Xano
   - Run automated test again
   - Verify all tests still pass

### Common Issues Checklist

- [ ] Auth token expired? (Get fresh token from browser)
- [ ] Question ID wrong? (Check database for valid IDs)
- [ ] Endpoint URL changed? (Verify in Xano)
- [ ] Using `$auth.user.id` instead of `$auth.id`?
- [ ] Using lambda `throw` instead of conditional `debug.stop`?
- [ ] Payment check happening after record creation?
- [ ] Missing `$var` prefix in Xano lambdas?
- [ ] Conditional logic backwards?
- [ ] Wrong error code in assertion?

---

## Performance Considerations

### Minimize API Calls

Run tests efficiently:

```javascript
// ✅ Good - Reuse question for multiple checks
const question = await createQuestion();
await testAnswerAuth(question.id);
await testAnswerOwnership(question.id);
await testAnswerValidation(question.id);

// ❌ Bad - Create new question for each test
await testAnswerAuth(await createQuestion().id);
await testAnswerOwnership(await createQuestion().id);
await testAnswerValidation(await createQuestion().id);
```

### Parallel When Possible

Run independent tests in parallel:

```javascript
// ✅ Good - Parallel execution
await Promise.all([
  testEndpoint1(),
  testEndpoint2(),
  testEndpoint3(),
]);

// ❌ Bad - Sequential when not needed
await testEndpoint1();
await testEndpoint2();
await testEndpoint3();
```

### Cleanup Old Data

Remove test data periodically:

```bash
# Delete old test questions
DELETE FROM question
WHERE title LIKE 'Test%'
AND created_at < NOW() - INTERVAL 7 DAY;

# Delete old test payments
DELETE FROM payment_table_structure
WHERE stripe_payment_intent_id LIKE 'pi_test_%'
AND created_at < NOW() - INTERVAL 7 DAY;
```

---

## CI/CD Integration

### Automated Test Runs

**When to run tests:**
- Before every deployment
- On every pull request
- On schedule (daily/weekly)
- After Xano endpoint changes

**Example GitHub Actions:**
```yaml
name: Security Tests
on:
  push:
    branches: [main]
  pull_request:
  schedule:
    - cron: '0 0 * * *' # Daily at midnight

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - name: Run tests
        run: ./tests/run-security-tests.sh
      - name: Upload logs
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: test-logs
          path: tests/logs/
```

### Test Environment

Use separate test environment:

```bash
# Production
XANO_AUTH_API=https://prod.xano.io/api:XYZ123

# Testing
XANO_AUTH_API=https://test.xano.io/api:ABC456
```

### Notifications

Alert on failures:

```javascript
// Send to Slack/Discord/Email
if (failedTests > 0) {
  await sendAlert({
    title: 'Security Tests Failed',
    message: `${failedTests} tests failed`,
    logs: logFileUrl
  });
}
```

---

## Documentation Standards

### Test Documentation

Every test suite should have:

1. **Purpose:** What does this test?
2. **Coverage:** What scenarios are tested?
3. **Prerequisites:** What's needed to run?
4. **Expected results:** What indicates success?
5. **Troubleshooting:** Common issues and fixes

### Code Comments

Comment non-obvious logic:

```javascript
// Create fresh question to prevent "already answered" false failure
const questionRes = await createTestQuestion();

// Use Expert B token with Expert A's question (should fail)
const answerRes = await request(endpoint, {
  headers: { 'Authorization': `Bearer ${EXPERT_B_TOKEN}` },
  body: JSON.stringify({
    question_id: questionRes.data.question_id, // Owned by Expert A
    user_id: EXPERT_B_USER_ID, // Expert B trying to answer
  })
});

// Xano returns 200 with error in payload, not 403 status
if (res.status === 403 || isXanoError(res, '403')) {
  logTest('Cross-expert blocked', 'PASS');
}
```

### Update Documentation

Keep docs current:
- Update when tests change
- Document new test scenarios
- Remove deprecated tests
- Update configuration examples

---

## Related Documentation

- [README.md](./README.md) - Main testing documentation
- [SECURITY-VALIDATION-GUIDE.md](./SECURITY-VALIDATION-GUIDE.md) - Security test suite
- [XANO-MANUAL-TESTING.md](./XANO-MANUAL-TESTING.md) - Manual testing guide

---

**Last Updated:** October 26, 2025
**Version:** 1.0.0
**Status:** ✅ Production Ready
