# Xano Auto-Update Pattern - Critical Bug Pattern

**Status:** ACTIVE ISSUE - Affects multiple endpoints
**Severity:** CRITICAL - Causes data corruption
**Last Updated:** January 28, 2025

---

## The Problem

Xano has **undocumented auto-update behavior** during `db.edit` operations. When you update a record with only some fields specified, Xano may automatically populate other fields from related records or context.

**Result:** Silent data corruption where fields get overwritten with unintended values.

---

## Real-World Cases

### Case 1: media_asset_id Corruption (Oct 2024)

**Bug:** When answering a question, the question's `media_asset_id` was overwritten with the answer's `media_asset_id`.

**Symptom:**
- Question created with `media_asset_id = 169`
- Answer created with `media_asset_id = 170`
- After answer submission: question's `media_asset_id` changed to `170` ❌

**Fix:** Explicitly preserve the field during update:
```xanoscript
db.edit question {
  field_name = "id"
  field_value = $input.question_id
  data = {
    status: "closed",
    answered_at: now,
    media_asset_id: $question.media_asset_id  // ← CRITICAL: Preserve original value
  }
}
```

**Documentation:** `BUGFIX-MEDIA-ASSET-ID-CORRUPTION.md`

---

### Case 2: attachments Corruption (Jan 2025)

**Bug:** When answering a question, the question's `attachments` field was overwritten with the answer's `attachments`.

**Symptom:**
- Question has attachments: `[{name: "doc.pdf", url: "..."}]`
- Answer has attachments: `[{name: "video.mp4", url: "..."}]`
- After answer submission: question's attachments now show video.mp4 ❌

**Fix:** Explicitly preserve the attachments field:
```xanoscript
db.edit question {
  field_name = "id"
  field_value = $input.question_id
  data = {
    status: "closed",
    answered_at: now,
    media_asset_id: $question.media_asset_id,
    attachments: $question.attachments  // ← CRITICAL: Preserve original value
  }
}
```

---

## Root Cause Analysis

**Why does this happen?**

We believe Xano is doing one or more of these:

1. **Field name matching:** When updating a record, if a field exists in the input context with the same name, Xano automatically uses it
2. **Relationship inference:** When both tables have similar fields (e.g., `media_asset_id`, `attachments`), Xano may auto-populate from the "active" context
3. **Default value behavior:** Xano may apply default values or context values when fields aren't explicitly set

**Evidence:**
- Only happens during `db.edit` operations
- Only affects fields NOT explicitly specified in the `data` object
- Happens even when those fields have no relationship or FK
- No console warnings or logs from Xano

---

## Pattern Recognition

**High-risk scenarios:**

✅ **Safe:**
```xanoscript
db.edit question {
  data = {
    status: "closed"
    // No other fields touched - no risk
  }
}
```

❌ **DANGEROUS:**
```xanoscript
// Context: Just created an answer with media_asset_id and attachments
db.edit question {
  data = {
    status: "closed",
    answered_at: now
    // BUG: media_asset_id and attachments will be auto-updated!
  }
}
```

✅ **SAFE:**
```xanoscript
// Fetch original record first
db.get question { ... } as $question

db.edit question {
  data = {
    status: "closed",
    answered_at: now,
    media_asset_id: $question.media_asset_id,  // Explicit preservation
    attachments: $question.attachments         // Explicit preservation
  }
}
```

---

## Prevention Checklist

When writing `db.edit` operations, always ask:

- [ ] Did I fetch the original record before editing?
- [ ] Are there fields with similar names in related tables?
- [ ] Are there JSON fields (attachments, metadata) that could be overwritten?
- [ ] Are there FK fields (media_asset_id, user_id) that should be preserved?
- [ ] Did I explicitly preserve ALL fields that should not change?

---

## Field Preservation Template

**Safe Update Template:**
```xanoscript
# Step 1: Fetch the record BEFORE editing
db.get question {
  field_name = "id"
  field_value = $input.question_id
} as $question

# Step 2: Edit with explicit preservation
db.edit question {
  field_name = "id"
  field_value = $input.question_id
  data = {
    # Fields you want to UPDATE
    status: "closed",
    answered_at: now,

    # Fields you want to PRESERVE (critical!)
    media_asset_id: $question.media_asset_id,
    attachments: $question.attachments,
    title: $question.title,
    text: $question.text,
    # ... any other fields that should not change
  }
} as $question_updated
```

---

## Testing Strategy

**How to detect this bug:**

1. **Before update:** Log/inspect the record
   ```xanoscript
   api.lambda {
     code = """
       console.log("BEFORE UPDATE:");
       console.log("  media_asset_id:", $var.question.media_asset_id);
       console.log("  attachments:", $var.question.attachments);
     """
   }
   ```

2. **Perform update:** Execute `db.edit`

3. **After update:** Log/inspect again
   ```xanoscript
   api.lambda {
     code = """
       console.log("AFTER UPDATE:");
       console.log("  media_asset_id:", $var.question_updated.media_asset_id);
       console.log("  attachments:", $var.question_updated.attachments);

       // Detect corruption
       if ($var.question.media_asset_id != $var.question_updated.media_asset_id) {
         console.error("❌ BUG DETECTED: media_asset_id changed!");
       }
     """
   }
   ```

4. **Compare:** Values should be identical unless explicitly updated

---

## Affected Endpoints

### ✅ Fixed
- `POST /answer` (questions/answer.xs) - media_asset_id and attachments now preserved

### ⚠️ Review Needed
All endpoints that use `db.edit` should be reviewed for this pattern:
- `PATCH /question/{id}`
- `POST /offers/{id}/accept`
- `POST /offers/{id}/decline`
- `POST /question/{id}/refund`
- Any other endpoint that updates records

---

## Best Practices

1. **Always fetch before edit:**
   ```xanoscript
   db.get table { ... } as $record
   db.edit table { data = { ..., field: $record.field } }
   ```

2. **Whitelist approach:** Explicitly list ALL fields in the update, even if unchanged

3. **Add debug logging:** Use Lambda functions to log before/after values during development

4. **Test with real data:** Create test cases with different field values to catch auto-updates

5. **Document assumptions:** Add comments explaining which fields are being preserved and why

---

## Communication with Xano

**This should be reported to Xano as a bug.**

**Expected behavior:**
- `db.edit` should ONLY update fields explicitly specified in `data`
- Fields not in `data` should remain unchanged
- No automatic population from context or related records

**Actual behavior:**
- Fields are auto-updated even when not specified
- No warning or error
- No documentation of this behavior

---

## Related Documentation

- `BUGFIX-MEDIA-ASSET-ID-CORRUPTION.md` - Original bug discovery
- `XANO-LAMBDA-TROUBLESHOOTING.md` - Lambda variable scoping issues
- `endpoints/questions/answer.xs` - Fixed endpoint implementation

---

**Action Required:** Review all `db.edit` operations across all 48 endpoints for this pattern.

**Status:** 2 cases fixed, ~46 endpoints need review.
