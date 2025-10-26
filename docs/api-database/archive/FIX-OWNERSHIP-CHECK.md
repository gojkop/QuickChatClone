# Fix: Ownership Check Not Blocking Cross-Expert Access

**Issue:** Expert B can update/answer Expert A's questions even though ownership check exists

**Test Results:**
- ✅ Expert A can update own question (279) - WORKS
- ❌ Expert A can update Expert B's question (264) - SHOULD FAIL but doesn't

---

## Root Cause Analysis

The ownership lambda is running but not blocking. Possible causes:

### Theory 1: Question Doesn't Belong to Any Expert

Check in your Xano database:
- Question 279: `expert_profile_id` = ?
- Question 264: `expert_profile_id` = ?

If either is NULL or doesn't match expected experts, that's the problem.

### Theory 2: Both Experts Share Same Profile

Check if:
- Expert A token → `user_id` = 18 → `expert_profile.id` = 139
- Expert B token → `user_id` = ? → `expert_profile.id` = ?

If both tokens resolve to the SAME expert_profile, they'll both pass ownership check.

### Theory 3: Lambda Not Throwing Error Properly

The lambda might be logging but not actually throwing the error.

---

## Debug Steps

### Step 1: Add Debug Logging

In PATCH /question/{id}, update the ownership lambda:

```javascript
api.lambda {
  code = """
    var questionExpertId = parseInt($var.existing_question.expert_profile_id);
    var expertId = parseInt($var.expert_profile.id);

    console.log("=== OWNERSHIP CHECK ===");
    console.log("Question belongs to expert_profile_id: " + questionExpertId);
    console.log("Request from expert_profile_id: " + expertId);
    console.log("Match: " + (questionExpertId === expertId));

    if (questionExpertId !== expertId) {
      console.log("BLOCKING - throwing 403 error");
      throw new Error('403 error "Forbidden: Not your question to update"');
    }

    console.log("ALLOWING - ownership verified");
  """
}
```

### Step 2: Test with Both Experts

**Test 1: Expert A updates own question (279)**
```bash
curl -X PATCH https://xlho-4syv-navp.n7e.xano.io/api:3B14WLbJ/question/279 \
  -H "Authorization: Bearer EXPERT_A_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "paid"}'
```

Expected: Success (200)

**Test 2: Expert A updates Expert B's question (264)**
```bash
curl -X PATCH https://xlho-4syv-navp.n7e.xano.io/api:3B14WLbJ/question/264 \
  -H "Authorization: Bearer EXPERT_A_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "paid"}'
```

Expected: 403 Forbidden

### Step 3: Check Xano Logs

Go to Xano → Logs and look for the console output.

**If you see:**
```
Question belongs to expert_profile_id: 139
Request from expert_profile_id: 139
Match: true
```

For BOTH tests → Question 264 is owned by Expert A (not Expert B!)

**If you see:**
```
Question belongs to expert_profile_id: 145
Request from expert_profile_id: 139
Match: false
BLOCKING - throwing 403 error
```

But test still succeeds → The error isn't being thrown properly.

---

## Quick Fixes

### Fix #1: Verify Question Ownership in Database

1. Go to Xano → Database → `question` table
2. Find question ID 279
   - `expert_profile_id` should be 139 (Expert A)
3. Find question ID 264
   - `expert_profile_id` should be different (Expert B)
4. If both are 139, you need to create a question owned by Expert B

### Fix #2: Use Alternative Error Throwing

If `throw new Error()` isn't working, use `debug.stop` instead:

Replace the lambda with a conditional:

```
conditional {
  if ($existing_question.expert_profile_id != $expert_profile.id) {
    debug.stop {
      value = '403 error "Forbidden: Not your question to update"'
    }
  }
}
```

This uses Xano's native conditional instead of JavaScript, which might be more reliable.

### Fix #3: Add Type Conversion in Conditional

If using conditional, convert types first:

```
api.lambda {
  code = """
    return {
      question_expert_id: parseInt($var.existing_question.expert_profile_id),
      current_expert_id: parseInt($var.expert_profile.id)
    };
  """
} as $ownership_check

conditional {
  if ($ownership_check.question_expert_id != $ownership_check.current_expert_id) {
    debug.stop {
      value = '403 error "Forbidden: Not your question to update"'
    }
  }
}
```

---

## What to Check Next

1. Add the debug logging
2. Run both curl tests
3. Share the Xano log output with the console.log messages
4. Check question ownership in database

This will tell us exactly what's happening and why the check isn't working.
