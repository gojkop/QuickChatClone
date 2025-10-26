# Debug: PATCH /question/{id} - 500 Error

**Status:** 500 Internal Server Error
**What Changed:** Authentication now works (was 401, now 500)
**This means:** Your token is valid, but the endpoint has a bug

---

## Most Likely Cause: Lambda Variable Issue

Looking at your `id.md` file, the ownership check lambda at line 41-48:

```javascript
api.lambda {
  code = """
      // Only allow expert who owns the question to update it
      if ($var.existing_question.expert_profile_id !== $var.expert_profile.id) {
        throw new Error('403 error "Forbidden: Not your question to update"');
      }
    """
}
```

### Possible Issues:

1. **Type mismatch** - `expert_profile_id` might be an integer but `id` is a string
2. **Null/undefined** - One of the variables isn't set
3. **Variable scoping** - `$var` prefix might not work inside lambda

---

## How to Fix in Xano

### Step 1: Add Debug Logging

Open Xano → Authentication API → `PATCH /question/{id}` and update the lambda:

```javascript
api.lambda {
  code = """
    // Debug: Print values
    console.log("=== OWNERSHIP CHECK DEBUG ===");
    console.log("existing_question.expert_profile_id: " + $var.existing_question.expert_profile_id);
    console.log("expert_profile.id: " + $var.expert_profile.id);
    console.log("Types: " + typeof($var.existing_question.expert_profile_id) + " vs " + typeof($var.expert_profile.id));

    // Only allow expert who owns the question to update it
    if ($var.existing_question.expert_profile_id !== $var.expert_profile.id) {
      console.log("OWNERSHIP CHECK FAILED - Throwing 403");
      throw new Error('403 error "Forbidden: Not your question to update"');
    }

    console.log("OWNERSHIP CHECK PASSED");
  """
}
```

### Step 2: Test and Check Xano Logs

1. Run the test again: `./tests/run-security-tests.sh`
2. Go to Xano → Logs/History
3. Look for the console.log output
4. Check what values are being compared

---

## Common Fixes

### Fix #1: Type Coercion (if types don't match)

```javascript
api.lambda {
  code = """
    // Convert both to numbers for comparison
    var questionExpertId = Number($var.existing_question.expert_profile_id);
    var expertId = Number($var.expert_profile.id);

    console.log("Comparing: " + questionExpertId + " vs " + expertId);

    if (questionExpertId !== expertId) {
      throw new Error('403 error "Forbidden: Not your question to update"');
    }
  """
}
```

### Fix #2: Null Check (if variable is missing)

```javascript
api.lambda {
  code = """
    // Check if variables exist
    if (!$var.existing_question) {
      throw new Error('500 error "Question not loaded"');
    }

    if (!$var.expert_profile) {
      throw new Error('500 error "Expert profile not loaded"');
    }

    // Now do ownership check
    if ($var.existing_question.expert_profile_id !== $var.expert_profile.id) {
      throw new Error('403 error "Forbidden: Not your question to update"');
    }
  """
}
```

### Fix #3: Use Strict Equality with Type Check

```javascript
api.lambda {
  code = """
    // Ensure both are numbers before comparing
    var questionExpertId = parseInt($var.existing_question.expert_profile_id);
    var expertId = parseInt($var.expert_profile.id);

    if (isNaN(questionExpertId) || isNaN(expertId)) {
      throw new Error('500 error "Invalid ID format"');
    }

    if (questionExpertId !== expertId) {
      throw new Error('403 error "Forbidden: Not your question to update"');
    }
  """
}
```

---

## Alternative: Use Xano's Built-in Conditional

Instead of lambda, you can use Xano's conditional step:

**Replace the lambda with:**

1. Add Conditional step
2. Condition: `$existing_question.expert_profile_id` IS NOT EQUAL TO `$expert_profile.id`
3. If true → Add `debug.stop` with value: `403 error "Forbidden: Not your question to update"`

This avoids JavaScript type issues entirely.

---

## After Fixing

1. Remove or comment out the debug console.log statements
2. Run tests again: `./tests/run-security-tests.sh`
3. Expected result: PATCH tests should pass

---

## If Still Getting 500

If the ownership check isn't the issue, the error could be in:

1. **Line 50-61: The db.edit call**
   - Check if the data fields match your database schema
   - Check if any fields are required but missing

2. **Line 63-91: The safe_response lambda**
   - Check if all referenced fields exist in `$var.updated_question`
   - Check for typos in field names

To debug, move the lambdas one by one and add console.log to isolate which step is failing.
