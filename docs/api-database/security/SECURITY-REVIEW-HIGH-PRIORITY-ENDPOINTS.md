# Security Review: High Priority Endpoints - October 26, 2025

Comprehensive security review of newly added high priority endpoint implementations.

---

## Executive Summary

**Review Date:** October 26, 2025
**Endpoints Reviewed:** 8
**Critical Issues Found:** 6
**Medium Issues Found:** 2
**Status:** 🔴 **REQUIRES IMMEDIATE FIXES**

### Issues Summary

| Endpoint | Critical Issues | Medium Issues | Status |
|----------|----------------|---------------|--------|
| `POST /offers/{id}/accept` | ✅ Lambda error handling | - | 🔴 Fix Required |
| `POST /offers/{id}/decline` | ✅ Lambda error handling | - | 🔴 Fix Required |
| `POST /payment/capture` | ✅ Wrong return pattern | - | 🔴 Fix Required |
| `POST /question/{id}/refund` | ✅ Wrong return pattern | ✅ Variable bug | 🔴 Fix Required |
| `DELETE /me/delete-account` | ✅ Variable reference bug | ✅ Query logic error | 🔴 Fix Required |
| `PUT /me/account` | - | - | ✅ Approved |
| `POST /expert/profile/availability` | - | - | ✅ Approved |
| `POST /upload/profile-picture` | - | - | ✅ Approved |

---

## Critical Issue #1: Lambda Error Handling Pattern ❌

### Affected Endpoints:
- `POST /offers/{id}/accept` (accept.md)
- `POST /offers/{id}/decline` (decline.md)

### Problem:

Both endpoints use `throw new Error()` inside `api.lambda` blocks for validation:

```javascript
// ❌ WRONG - This doesn't work reliably in Xano
api.lambda {
  code = """
    if (q.expert_profile_id !== expertProfileId) {
      throw new Error("This offer does not belong to you");
    }
  """
}
```

### Why This Fails:

From our security testing (October 26, 2025), we discovered that:
1. Xano lambdas with `throw new Error()` don't stop execution reliably
2. They return HTTP 200 with error in payload instead of proper HTTP status codes
3. Native conditionals with `debug.stop` are the correct pattern

### Correct Pattern:

```javascript
// ✅ CORRECT - Use native conditional with debug.stop
conditional {
  if ($question.expert_profile_id != $expert_profile.id) {
    debug.stop {
      value = '403 error "Forbidden: Not your offer to accept"'
    }
  }
}
```

### Impact:
- 🔴 **HIGH RISK** - Security checks may not execute properly
- Allows potential cross-expert attacks
- Tests will show false positives/negatives

### Recommendation:
**Replace ALL lambda validation blocks with native conditionals.**

---

## Critical Issue #2: Wrong Conditional Return Pattern ❌

### Affected Endpoints:
- `POST /payment/capture` (capture.md)
- `POST /question/{id}/refund` (refund.md)

### Problem:

Both endpoints use `return { value = {...} }` inside conditionals:

```javascript
// ❌ WRONG - Returns don't stop execution properly
conditional {
  if ($question.expert_profile_id != $expert_profile.id) {
    return {
      value = {
        "error": "Unauthorized - this question does not belong to you"
      }
    }
  }
}
```

### Why This Fails:

1. `return` inside conditionals doesn't stop execution like `debug.stop`
2. Code continues to execute after the "error" return
3. May still perform database operations after "blocking" request
4. Returns confusing response structure

### Correct Pattern:

```javascript
// ✅ CORRECT - Use debug.stop to halt execution
conditional {
  if ($question.expert_profile_id != $expert_profile.id) {
    debug.stop {
      value = '403 error "Forbidden: Not your question"'
    }
  }
}
```

### Impact:
- 🔴 **HIGH RISK** - Security checks don't actually block requests
- Database operations may still execute after "blocking"
- Inconsistent API responses

### Recommendation:
**Replace ALL `return` statements with `debug.stop` in security conditionals.**

---

## Critical Issue #3: Variable Reference Bug ❌

### Affected Endpoint:
- `DELETE /me/delete-account` (deleteacc.md)

### Problem:

Line 48 references wrong variable in questions foreach loop:

```javascript
// Line 43-52: Deleting question media
foreach ($user_questions) {
  each as $questions {
    conditional {
      if ($questions.media_asset_id != null) {
        db.bulk.delete media_asset {
          where = $db.media_asset.id == $answers.media_asset_id  // ❌ WRONG VARIABLE
        } as $media_asset
      }
    }
  }
}
```

### Why This Fails:

- Should be `$questions.media_asset_id` not `$answers.media_asset_id`
- References variable from DIFFERENT foreach loop (line 22-32)
- Will either:
  - Delete wrong media assets
  - Fail with "undefined variable" error
  - Leave orphaned media in database

### Correct Code:

```javascript
// ✅ CORRECT - Use correct variable
foreach ($user_questions) {
  each as $questions {
    conditional {
      if ($questions.media_asset_id != null) {
        db.bulk.delete media_asset {
          where = $db.media_asset.id == $questions.media_asset_id  // ✅ FIXED
        } as $media_asset
      }
    }
  }
}
```

### Impact:
- 🔴 **HIGH RISK** - Data corruption or orphaned media
- May delete wrong user's media assets
- Incomplete account deletion

### Recommendation:
**Fix variable reference immediately.**

---

## Critical Issue #4: Query Logic Error ❌

### Affected Endpoint:
- `DELETE /me/delete-account` (deleteacc.md)

### Problem:

Line 56 uses wrong field for deleting questions:

```javascript
// Line 55-57: Deleting questions
db.bulk.delete question {
  where = $db.question.expert_profile_id == $user_id  // ❌ WRONG - user_id not expert_profile.id
} as $question_deleted
```

### Why This Fails:

- `expert_profile_id` is a foreign key to `expert_profile.id`
- `$user_id` is the `user.id` value
- These are different tables with different IDs
- Will not delete any questions (no matches)

### Correct Code:

```javascript
// ✅ CORRECT - Use expert_profile.id
db.bulk.delete question {
  where = $db.question.expert_profile_id == $expert_profile.id  // ✅ FIXED
} as $question_deleted
```

### Impact:
- 🔴 **HIGH RISK** - Incomplete account deletion
- Leaves user's questions in database
- GDPR compliance violation
- Orphaned data

### Recommendation:
**Fix query to use correct foreign key reference.**

---

## Medium Issue #1: Variable Reference in Refund ⚠️

### Affected Endpoint:
- `POST /question/{id}/refund` (refund.md)

### Problem:

Line 52 attempts to access `$question_update` variable in response, but execution may not reach that code if conditional takes the error path (line 24-26).

```javascript
// Line 49-54: Response
response = {
  "success": true,
  "question_id": $question.id,
  "payment_status": $question_update.pricing_status,  // May be undefined
  "refunded_at": $payment_table_structure.refunded_at  // May be undefined
}
```

### Why This Can Fail:

- If question already answered, returns early (line 24-26)
- Variables `$question_update` and `$payment_table_structure` are undefined
- Response will error or return null values

### Correct Pattern:

After fixing `return` to `debug.stop` (Issue #2), this will be resolved automatically since execution stops before reaching response.

### Impact:
- 🟡 **MEDIUM RISK** - Runtime errors on error paths
- Confusing error responses

### Recommendation:
**Will be resolved by fixing Issue #2.**

---

## Approved Endpoints ✅

### 1. PUT /me/account (account.md)

**Status:** ✅ Approved
**Security:** Adequate

**Analysis:**
- Uses `auth = "user"` correctly
- Updates only authenticated user's record via `$auth.id`
- All fields are optional and trimmed
- No cross-user risks

**Minor Recommendation:**
- Consider adding email validation if email updates are added
- Consider rate limiting to prevent spam updates

---

### 2. POST /expert/profile/availability (availability.md)

**Status:** ✅ Approved
**Security:** Good

**Analysis:**
- Uses `auth = "user"` correctly
- Updates by `user_id` which matches `$auth.id`
- Boolean field cannot be exploited
- Simple and secure

**No issues found.**

---

### 3. POST /upload/profile-picture (upload.md)

**Status:** ✅ Approved
**Security:** Good

**Analysis:**
- Uses `auth = "user"` correctly
- Updates by `user_id` which matches `$auth.id`
- Handles empty/null values
- Updates only own profile

**Minor Recommendation:**
- Consider adding URL validation to prevent XSS
- Check that image_url is from trusted domain (Cloudflare R2)

---

## Security Testing Status

### Currently Tested (12 tests):
- ✅ PATCH /question/{id}
- ✅ POST /answer
- ✅ POST /question/quick-consult
- ✅ POST /question/deep-dive
- ✅ GET /review/{token}
- ✅ POST /review/{token}/feedback

### Pending Testing (After Fixes):
- ⏳ POST /offers/{id}/accept
- ⏳ POST /offers/{id}/decline
- ⏳ POST /payment/capture
- ⏳ POST /question/{id}/refund
- ⏳ DELETE /me/delete-account
- ⏳ PUT /me/account
- ⏳ POST /expert/profile/availability
- ⏳ POST /upload/profile-picture

**Cannot proceed with testing until critical issues are fixed.**

---

## Corrected Implementations

### 1. POST /offers/{id}/accept (CORRECTED)

```javascript
query "offers/{id}/accept" verb=POST {
  auth = "user"

  input {
    int id
  }

  stack {
    db.get expert_profile {
      field_name = "user_id"
      field_value = $auth.id
    } as $expert_profile

    conditional {
      if ($expert_profile == null) {
        debug.stop {
          value = '404 error "Expert profile not found"'
        }
      }
    }

    db.get question {
      field_name = "id"
      field_value = $input.id
    } as $question

    conditional {
      if ($question == null) {
        debug.stop {
          value = '404 error "Offer not found"'
        }
      }
    }

    // ✅ FIXED: Use conditional instead of lambda
    conditional {
      if ($question.expert_profile_id != $expert_profile.id) {
        debug.stop {
          value = '403 error "Forbidden: Not your offer to accept"'
        }
      }
    }

    conditional {
      if ($question.pricing_status != "offer_pending") {
        debug.stop {
          value = '400 error "This offer cannot be accepted (status: ' + $question.pricing_status + ')"'
        }
      }
    }

    // Check offer expiration
    api.lambda {
      code = """
        var now = Date.now();
        var expiresAt = $var.question.offer_expires_at;

        if (expiresAt && expiresAt < now) {
          return true;  // Expired
        }
        return false;  // Not expired
      """
      timeout = 10
    } as $is_expired

    conditional {
      if ($is_expired == true) {
        debug.stop {
          value = '400 error "This offer has expired"'
        }
      }
    }

    // Calculate SLA deadline
    api.lambda {
      code = """
        var now = Date.now();
        var slaHours = $var.expert_profile.tier2_sla_hours || 48;
        var deadline = now + (slaHours * 60 * 60 * 1000);
        return deadline;
      """
      timeout = 10
    } as $sla_deadline

    db.edit question {
      field_name = "id"
      field_value = $question.id
      data = {
        pricing_status    : "offer_accepted"
        sla_start_time    : now
        sla_deadline      : $sla_deadline
        expert_reviewed_at: now
      }
    } as $updated_question

    db.get payment_table_structure {
      field_name = "question_id"
      field_value = $question.id
    } as $payment

    db.edit payment_table_structure {
      field_name = "id"
      field_value = $payment.id
      data = {status: "accepted", accepted_at: now}
    } as $updated_payment

    api.lambda {
      code = "return $var.expert_profile.tier2_sla_hours || 48;"
      timeout = 10
    } as $sla_hours
  }

  response = {
    "success": true,
    "question_id": $question.id,
    "status": "offer_accepted",
    "sla_deadline": $sla_deadline,
    "sla_hours": $sla_hours
  }
}
```

---

### 2. POST /offers/{id}/decline (CORRECTED)

```javascript
query "offers/{id}/decline" verb=POST {
  auth = "user"

  input {
    int id
    text decline_reason? filters=trim
  }

  stack {
    db.get expert_profile {
      field_name = "user_id"
      field_value = $auth.id
    } as $expert_profile

    conditional {
      if ($expert_profile == null) {
        debug.stop {
          value = '404 error "Expert profile not found"'
        }
      }
    }

    db.get question {
      field_name = "id"
      field_value = $input.id
    } as $question

    conditional {
      if ($question == null) {
        debug.stop {
          value = '404 error "Offer not found"'
        }
      }
    }

    // ✅ FIXED: Use conditional instead of lambda
    conditional {
      if ($question.expert_profile_id != $expert_profile.id) {
        debug.stop {
          value = '403 error "Forbidden: Not your offer to decline"'
        }
      }
    }

    conditional {
      if ($question.pricing_status != "offer_pending") {
        debug.stop {
          value = '400 error "This offer cannot be declined (status: ' + $question.pricing_status + ')"'
        }
      }
    }

    db.edit question {
      field_name = "id"
      field_value = $question.id
      data = {
        pricing_status    : "offer_declined"
        status            : "declined"
        decline_reason    : $input.decline_reason
        expert_reviewed_at: now
      }
    } as $updated_question

    db.get payment_table_structure {
      field_name = "question_id"
      field_value = $question.id
    } as $payment

    conditional {
      if ($payment != null) {
        db.edit payment_table_structure {
          field_name = "id"
          field_value = $payment.id
          data = {status: "refunded", refunded_at: now}
        } as $updated_payment
      }
    }
  }

  response = {
    "success": true,
    "question_id": $input.id,
    "status": "offer_declined",
    "refund_status": "initiated"
  }
}
```

---

### 3. POST /payment/capture (CORRECTED)

```javascript
query "payment/capture" verb=POST {
  auth = "user"

  input {
    int question_id?
  }

  stack {
    db.get expert_profile {
      field_name = "user_id"
      field_value = $auth.id
    } as $expert_profile

    conditional {
      if ($expert_profile == null) {
        debug.stop {
          value = '404 error "Expert profile not found"'
        }
      }
    }

    db.get question {
      field_name = "id"
      field_value = $input.question_id
    } as $question

    conditional {
      if ($question == null) {
        debug.stop {
          value = '404 error "Question not found"'
        }
      }
    }

    // ✅ FIXED: Use debug.stop instead of return
    conditional {
      if ($question.expert_profile_id != $expert_profile.id) {
        debug.stop {
          value = '403 error "Forbidden: Not your question"'
        }
      }
    }

    db.get payment_table_structure {
      field_name = "question_id"
      field_value = $input.question_id
    } as $payment

    conditional {
      if ($payment == null) {
        debug.stop {
          value = '404 error "Payment not found"'
        }
      }
    }

    conditional {
      if ($payment.status == "captured") {
        debug.stop {
          value = '400 error "Payment already captured"'
        }
      }
    }

    db.edit payment_table_structure {
      field_name = "id"
      field_value = $payment.id
      data = {
        status           : "captured"
        captured_at      : now
        capture_attempted: true
      }
    } as $payment_update
  }

  response = {
    "success": true,
    "payment_id": $payment.id,
    "question_id": $payment.question_id,
    "status": "captured",
    "captured_at": $payment_update.captured_at
  }
}
```

---

### 4. POST /question/{question_id}/refund (CORRECTED)

```javascript
query "question/{question_id}/refund" verb=POST {
  auth = "user"

  input {
    bool payment_canceled?
    text? payment_intent_id? filters=trim
    text? refund_reason? filters=trim
    int question_id?
  }

  stack {
    db.get expert_profile {
      field_name = "user_id"
      field_value = $auth.id
    } as $expert_profile

    conditional {
      if ($expert_profile == null) {
        debug.stop {
          value = '404 error "Expert profile not found"'
        }
      }
    }

    // ✅ FIXED: Simplified query with proper ownership check
    db.get question {
      field_name = "id"
      field_value = $input.question_id
    } as $question

    conditional {
      if ($question == null) {
        debug.stop {
          value = '404 error "Question not found"'
        }
      }
    }

    conditional {
      if ($question.expert_profile_id != $expert_profile.id) {
        debug.stop {
          value = '403 error "Forbidden: Not your question to refund"'
        }
      }
    }

    // ✅ FIXED: Use debug.stop instead of return
    conditional {
      if ($question.answered_at != null) {
        debug.stop {
          value = '400 error "Cannot refund - question already answered"'
        }
      }
    }

    db.get payment_table_structure {
      field_name = "question_id"
      field_value = $question.id
    } as $payment

    conditional {
      if ($payment == null) {
        debug.stop {
          value = '404 error "Payment not found"'
        }
      }
    }

    conditional {
      if ($payment.status == "refunded") {
        debug.stop {
          value = '400 error "Payment already refunded"'
        }
      }
    }

    db.edit payment_table_structure {
      field_name = "id"
      field_value = $payment.id
      data = {status: "refunded", refunded_at: now}
    } as $payment_update

    db.edit question {
      field_name = "id"
      field_value = $input.question_id
      data = {
        status           : "refunded"
        payment_intent_id: $input.payment_intent_id
        pricing_status   : "refunded"
        refunded_at      : now
      }
    } as $question_update
  }

  response = {
    "success": true,
    "question_id": $question.id,
    "payment_status": $question_update.pricing_status,
    "refunded_at": $payment_update.refunded_at
  }
}
```

---

### 5. DELETE /me/delete-account (CORRECTED)

```javascript
query "me/delete-account" verb=DELETE {
  auth = "user"

  input {
  }

  stack {
    var $user_id {
      value = $auth.id
    }

    db.get expert_profile {
      field_name = "user_id"
      field_value = $user_id
    } as $expert_profile

    conditional {
      if ($expert_profile == null) {
        debug.stop {
          value = '404 error "Expert profile not found"'
        }
      }
    }

    // Delete user's answers and their media
    db.query answer {
      where = $db.answer.user_id == $user_id
      return = {type: "list"}
    } as $user_answers

    foreach ($user_answers) {
      each as $answers {
        conditional {
          if ($answers.media_asset_id != null) {
            db.bulk.delete media_asset {
              where = $db.media_asset.id == $answers.media_asset_id
            } as $media_asset
          }
        }
      }
    }

    db.bulk.delete answer {
      where = $db.answer.user_id == $user_id
    } as $answer_deleted

    // Delete user's questions and their media
    db.query question {
      where = $db.question.expert_profile_id == $expert_profile.id
      return = {type: "list"}
    } as $user_questions

    foreach ($user_questions) {
      each as $questions {
        conditional {
          if ($questions.media_asset_id != null) {
            // ✅ FIXED: Use $questions not $answers
            db.bulk.delete media_asset {
              where = $db.media_asset.id == $questions.media_asset_id
            } as $media_asset
          }
        }
      }
    }

    // ✅ FIXED: Use $expert_profile.id not $user_id
    db.bulk.delete question {
      where = $db.question.expert_profile_id == $expert_profile.id
    } as $question_deleted

    // Delete marketing data
    db.bulk.delete campaign_visit {
      where = $db.campaign_visit.expert_profile_id == $expert_profile.id
    } as $campaign_visit

    db.bulk.delete utm_campaign {
      where = $db.utm_campaign.expert_profile_id == $expert_profile.id
    } as $utm_campaigns

    // Delete expert profile
    db.del expert_profile {
      field_name = "id"
      field_value = $expert_profile.id
    }

    // Finally delete user record
    db.del user {
      field_name = "id"
      field_value = $user_id
    }
  }

  response = {
    "success": true,
    "message": "Account deleted successfully"
  }
}
```

---

## Action Items

### Immediate (Today):
1. ✅ Complete security review
2. ⏳ Apply corrected implementations to Xano
3. ⏳ Test each endpoint manually in Xano Run & Debug
4. ⏳ Verify all security checks work properly

### Short-term (Next 2 Days):
5. ⏳ Create automated security tests for these endpoints
6. ⏳ Run full security test suite (should be 20 tests passing)
7. ⏳ Update endpoint documentation with security notes

### Long-term (Next Week):
8. ⏳ Implement remaining lower-priority endpoint tests
9. ⏳ Create security testing guide for future endpoints
10. ⏳ Set up CI/CD for automated security testing

---

## Key Learnings

### ✅ DO:
1. **Use `conditional` with `debug.stop`** for all security checks
2. **Always check resource ownership** before modifications
3. **Validate null/undefined** for all database queries
4. **Use correct variable references** (check foreach scope)
5. **Test in Xano Run & Debug** before considering complete

### ❌ DON'T:
1. **Never use `throw new Error()` in lambdas** for security
2. **Never use `return` in security conditionals** (doesn't stop execution)
3. **Don't assume variables exist** without null checks
4. **Don't mix up variables** from different loops
5. **Don't skip manual testing** after implementation

---

## Conclusion

**Status:** 🔴 **CRITICAL FIXES REQUIRED**

**Summary:**
- 6 of 8 endpoints have critical security issues
- All issues are fixable with provided corrected code
- Cannot proceed with automated testing until fixes applied
- Estimated fix time: 2-3 hours

**Next Step:**
Apply the corrected implementations to Xano and verify each endpoint manually before proceeding with automated testing.

---

**Review Completed By:** Claude Code
**Review Date:** October 26, 2025
**Status:** Ready for Implementation
