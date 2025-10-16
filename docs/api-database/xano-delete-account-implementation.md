# Xano Delete Account Endpoint Implementation

**Status:** ✅ Production Ready | **Version:** 1.0 | **Last Updated:** October 13, 2025

---

## Overview

This document describes the complete implementation of the account deletion feature for mindPick, allowing experts to permanently delete their accounts and all associated data from the platform.

### What's Implemented

- ✅ **Frontend:** Two-step confirmation UI in AccountModal.jsx
- ✅ **Backend:** Vercel serverless endpoint for deletion orchestration
- ✅ **Database:** Xano endpoint with complete data cleanup across all tables
- ✅ **Testing:** End-to-end testing completed successfully
- ✅ **UI Polish:** Button overlap bug fixed

### Key Features

- Two-step confirmation to prevent accidental deletion
- Separate loading states for save vs delete actions
- Complete data cleanup from all database tables
- Automatic logout and session cleanup
- JWT token invalidation
- Redirect to homepage after deletion
- User-friendly error handling

---

## Complete Step-by-Step Guide

This document provides detailed instructions for creating the `/me/delete-account` endpoint in Xano to handle complete user account deletion with all associated data.

## Endpoint Configuration

### 1. Create New Endpoint in Xano

**Location:** Authentication API (`api:3B14WLbJ`)

1. Open your Xano workspace
2. Navigate to **API** section
3. Select the **Authentication API** group (`api:3B14WLbJ`)
4. Click **Add API Endpoint**

**Endpoint Settings:**
- **Path:** `/me/delete-account`
- **Method:** `DELETE`
- **Name:** "Delete User Account"
- **Description:** "Permanently delete authenticated user account and all associated data"
- **Authentication:** ✅ Required (use your existing JWT auth)

---

## Complete Function Stack - Detailed Implementation

Below is the exact function stack you need to build in Xano. Each step includes the specific Xano function to use and its configuration.

---

### Step 1: Get Authenticated User

**Function:** `Get Authenticated User`

**Configuration:**
- This retrieves the currently logged-in user from the JWT token
- No parameters needed - authentication is automatic

**Output Variable:** `authUser`

**What this does:** Gets the user who is making the delete request (the user to be deleted)

---

### Step 2: Store User ID and Email

**Function:** `Set Variable`

**Purpose:** Save user data before deletion for logging and cleanup

**Variables to create:**
```
user_id = authUser.id
user_email = authUser.email
```

**Configuration:**
1. Add **Set Variable** function
2. Create variable `user_id` (integer)
3. Set value: `authUser.id`
4. Create variable `user_email` (text)
5. Set value: `authUser.email`

---

### Step 3: Get Expert Profile

**Function:** `Query Record` (Get Record From Table)

**Configuration:**
- **Table:** `expert_profile`
- **Filter:** Add filter
  - Field: `user_id`
  - Operator: `equals`
  - Value: `var.user_id`
- **Limit:** 1
- **Output:** Check "Continue if no results"

**Output Variable:** `expert_profile`

**Note:** This may return null if user is not an expert (asker only)

---

### Step 4: Get All Answers by User

**Function:** `Query All Records`

**Configuration:**
- **Table:** `answer`
- **Filter:** Add filter
  - Field: `user_id`
  - Operator: `equals`
  - Value: `var.user_id`
- **Output:** Returns array (even if empty)

**Output Variable:** `user_answers`

**What this does:** Retrieves all answers this expert has provided

---

### Step 5: Delete Media Assets from Answers

**Function:** `For Loop` → `Conditional` → `Delete Record`

**Configuration:**

**5a. Add For Loop:**
- **Loop through:** `var.user_answers`
- **Item name:** `answer`

**5b. Inside loop, add Conditional:**
- **Condition:** `answer.media_asset_id` **is not equal to** `null`

**5c. Inside conditional, add Delete Record:**
- **Table:** `media_asset`
- **Filter:** Add filter
  - Field: `id`
  - Operator: `equals`
  - Value: `answer.media_asset_id`

**What this does:**
- Loops through each answer
- If answer has associated media, deletes the media_asset record
- This removes video/audio records from database (Cloudflare files remain)

---

### Step 6: Delete All Answer Records

**Function:** `Delete All Records`

**Configuration:**
- **Table:** `answer`
- **Filter:** Add filter
  - Field: `user_id`
  - Operator: `equals`
  - Value: `var.user_id`

**What this does:** Removes all answer records created by this user

---

### Step 7: Get All Questions for Expert

**Function:** `Conditional` → `Query All Records`

**7a. Add Conditional:**
- **Condition:** `expert_profile` **is not equal to** `null`
- **Purpose:** Only run if user is an expert

**7b. Inside conditional, add Query All Records:**
- **Table:** `question`
- **Filter:** Add filter
  - Field: `expert_profile_id`
  - Operator: `equals`
  - Value: `expert_profile.id`

**Output Variable:** `user_questions`

**What this does:** Gets all questions assigned to this expert

---

### Step 8: Delete Media Assets from Questions

**Function:** `For Loop` → `Conditional` → `Delete Record`

**Configuration:**

**8a. Add For Loop (inside the Step 7 conditional):**
- **Loop through:** `var.user_questions`
- **Item name:** `question`

**8b. Inside loop, add Conditional:**
- **Condition:** `question.media_asset_id` **is not equal to** `null`

**8c. Inside conditional, add Delete Record:**
- **Table:** `media_asset`
- **Filter:** Add filter
  - Field: `id`
  - Operator: `equals`
  - Value: `question.media_asset_id`

**What this does:** Deletes media assets associated with questions to this expert

---

### Step 9: Delete All Question Records

**Function:** `Delete All Records` (inside Step 7 conditional)

**Configuration:**
- **Table:** `question`
- **Filter:** Add filter
  - Field: `expert_profile_id`
  - Operator: `equals`
  - Value: `expert_profile.id`

**What this does:** Removes all questions assigned to this expert

---

### Step 10: Delete Expert Profile

**Function:** `Conditional` → `Delete Record`

**10a. Add Conditional:**
- **Condition:** `expert_profile` **is not equal to** `null`

**10b. Inside conditional, add Delete Record:**
- **Table:** `expert_profile`
- **Filter:** Add filter
  - Field: `id`
  - Operator: `equals`
  - Value: `expert_profile.id`

**What this does:** Deletes the expert profile record if it exists

---

### Step 11: Delete Payment Records (Optional)

**Function:** `Delete All Records`

**Configuration:**
- **Table:** `payment`
- **Filter:** Add filter
  - Field: `user_id`
  - Operator: `equals`
  - Value: `var.user_id`

**What this does:** Removes payment history records

**⚠️ Warning:** Only do this if you don't need payment records for accounting/legal purposes. Consider archiving instead.

---

### Step 12: Delete User Account

**Function:** `Delete Record`

**Configuration:**
- **Table:** `user`
- **Filter:** Add filter
  - Field: `id`
  - Operator: `equals`
  - Value: `var.user_id`

**What this does:** Removes the user account record (final step)

---

### Step 13: Return Success Response

**Function:** `Response`

**Configuration:**
- **Status Code:** 200
- **Response Body:**
```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

**How to set this up in Xano:**
1. Add **Response** function
2. Set status code: `200`
3. In response body editor, add:
   - Key: `success`, Type: boolean, Value: `true`
   - Key: `message`, Type: text, Value: `"Account deleted successfully"`

---

## Visual Function Stack Summary

Here's how your function stack should look in Xano:

```
1. Get Authenticated User
   └→ authUser

2. Set Variable
   └→ user_id = authUser.id
   └→ user_email = authUser.email

3. Query Record (expert_profile)
   └→ expert_profile (nullable)

4. Query All Records (answer)
   └→ user_answers[]

5. For Loop (user_answers)
   └→ Loop Item: answer
      └→ Conditional (if answer.media_asset_id != null)
         └→ Delete Record (media_asset)

6. Delete All Records (answer)
   └→ WHERE user_id = var.user_id

7. Conditional (if expert_profile exists)
   ├→ Query All Records (question)
   │  └→ user_questions[]
   │
   ├→ For Loop (user_questions)
   │  └→ Loop Item: question
   │     └→ Conditional (if question.media_asset_id != null)
   │        └→ Delete Record (media_asset)
   │
   └→ Delete All Records (question)
      └→ WHERE expert_profile_id = expert_profile.id

8. Conditional (if expert_profile exists)
   └→ Delete Record (expert_profile)

9. Delete All Records (payment)
   └→ WHERE user_id = var.user_id

10. Delete Record (user)
    └→ WHERE id = var.user_id

11. Response (200)
    └→ { "success": true, "message": "Account deleted successfully" }
```

---

---

## Detailed Xano UI Instructions

### How to Add Each Function

**Adding Functions in Xano:**
1. Click the **"+"** button in the function stack
2. Select the function type from the dropdown
3. Configure the function parameters
4. Set the output variable name (if applicable)
5. Click **Save** or **Apply**

---

## Common Xano Functions Reference

### Query Record vs Query All Records

**Query Record (Get Record From Table):**
- Returns a single record (or null)
- Use when you expect 0 or 1 result
- Always check "Continue if no results" to avoid errors

**Query All Records:**
- Returns an array (even if empty)
- Use when you expect multiple results
- Can loop through the results

### Delete Record vs Delete All Records

**Delete Record:**
- Deletes one specific record
- Must provide exact filter conditions
- Use for single item deletion

**Delete All Records:**
- Deletes multiple records matching filter
- More efficient than looping with Delete Record
- Use for bulk deletion

### Conditionals

**How to add conditions:**
1. Add "Conditional" function
2. Click "Add Condition"
3. Select variable from dropdown
4. Choose operator (equals, not equals, is null, is not null, etc.)
5. Enter value or select another variable
6. Add functions inside the "IF TRUE" branch

**Common operators:**
- `equals` / `not equals`
- `is null` / `is not null`
- `greater than` / `less than`
- `contains` / `does not contain`

### For Loops

**How to create a loop:**
1. Add "For Loop" function
2. Select array variable to loop through
3. Name the loop item (e.g., "answer", "question")
4. Add functions inside the loop body
5. Access loop item properties using dot notation (e.g., `answer.id`)

---

## Troubleshooting Common Issues

### Issue 1: "Cannot read property 'id' of null"

**Cause:** Trying to access a property of a null variable

**Solution:**
- Add conditional check before accessing properties
- Use "is not null" condition
- Enable "Continue if no results" on queries

**Example:**
```
✅ Correct:
1. Query Record → expert_profile (with "Continue if no results")
2. Conditional → if expert_profile is not null
3. Inside: Use expert_profile.id

❌ Wrong:
1. Query Record → expert_profile
2. Directly use expert_profile.id (will fail if null)
```

### Issue 2: "Foreign key constraint violation"

**Cause:** Trying to delete records in wrong order

**Solution:** Delete child records before parent records

**Correct deletion order:**
1. First: Delete `media_asset` (no foreign keys to it)
2. Then: Delete `answer` (references user and question)
3. Then: Delete `question` (references expert_profile)
4. Then: Delete `expert_profile` (references user)
5. Finally: Delete `user` (root record)

### Issue 3: Loop not working / No records found

**Cause:** Variable name mismatch or wrong filter

**Solution:**
- Check variable names match exactly (case-sensitive)
- Verify filter field names match database columns
- Use debugger to inspect variable values
- Check that array is not empty before looping

### Issue 4: Authentication error after deletion

**Expected behavior:** This is normal!

After deleting a user account:
- JWT token becomes invalid
- User is logged out automatically
- Frontend redirects to home page

---

## Testing the Endpoint

### Test Case 1: Delete Expert with Data

**Setup:**
1. Create test user via OAuth (e.g., Google)
2. Complete expert profile setup
3. Create 1-2 test questions assigned to this expert
4. Create 1-2 answers by this expert

**Test:**
1. Get auth token from localStorage
2. Call `DELETE /me/delete-account` with token
3. Check response is 200 with success message
4. Verify all records deleted from database

**Expected Results:**
- ✅ User record deleted
- ✅ Expert profile deleted
- ✅ Questions deleted
- ✅ Answers deleted
- ✅ Media assets deleted
- ✅ JWT token no longer works

### Test Case 2: Delete Asker (Non-Expert)

**Setup:**
1. Create test user via OAuth
2. Do NOT create expert profile
3. Submit 1-2 questions as an asker

**Test:**
1. Call `DELETE /me/delete-account`
2. Check response is 200

**Expected Results:**
- ✅ User record deleted
- ✅ No expert profile to delete (skipped)
- ✅ Questions remain (they belong to the expert, not the asker)
- ✅ JWT token no longer works

### Test Case 3: Delete User with No Data

**Setup:**
1. Create brand new user via OAuth
2. Don't create any questions or answers

**Test:**
1. Call `DELETE /me/delete-account`
2. Check response is 200

**Expected Results:**
- ✅ User record deleted
- ✅ No errors even with no data
- ✅ All loops handle empty arrays correctly

---

## Debugging in Xano

### Enable Debug Mode

1. In Xano endpoint editor, click **Run & Debug**
2. Select **Authenticated Request**
3. Provide a valid JWT token
4. Click **Run**
5. Inspect each function's output in the debug panel

### What to Check

**Step-by-step debugging:**
1. Verify `authUser` is populated with correct user ID
2. Check `expert_profile` query returns expected record (or null)
3. Verify `user_answers` array has expected count
4. Verify `user_questions` array has expected count
5. Check all delete operations succeed without errors
6. Confirm final response returns success message

### Common Debug Values

**authUser should contain:**
```json
{
  "id": 33,
  "email": "test@example.com",
  "name": "Test User",
  ...
}
```

**expert_profile should be either:**
```json
{
  "id": 107,
  "user_id": 33,
  "handle": "testuser",
  ...
}
```
or `null` (if not an expert)

---

## Alternative: Simpler Implementation (If Above Fails)

If you're having trouble with the complex function stack, here's a simpler approach:

### Create Custom SQL Query

**Function:** `Run Function Stack` → `Custom Query`

**SQL:**
```sql
-- Delete in correct order to avoid foreign key issues

-- 1. Delete media assets
DELETE FROM media_asset
WHERE owner_type = 'answer'
  AND owner_id IN (SELECT id FROM answer WHERE user_id = @user_id);

DELETE FROM media_asset
WHERE owner_type = 'question'
  AND owner_id IN (SELECT id FROM question WHERE expert_profile_id IN (SELECT id FROM expert_profile WHERE user_id = @user_id));

-- 2. Delete answers
DELETE FROM answer WHERE user_id = @user_id;

-- 3. Delete questions
DELETE FROM question
WHERE expert_profile_id IN (SELECT id FROM expert_profile WHERE user_id = @user_id);

-- 4. Delete expert profile
DELETE FROM expert_profile WHERE user_id = @user_id;

-- 5. Delete payments (optional)
DELETE FROM payment WHERE user_id = @user_id;

-- 6. Delete user
DELETE FROM user WHERE id = @user_id;
```

**Parameters:**
- `@user_id` = `authUser.id`

**⚠️ Note:** This approach is faster but less flexible. Use the function stack approach for better control and debugging.

---

## Security Checklist

Before deploying:

- [ ] ✅ Endpoint requires authentication (JWT token)
- [ ] ✅ User can only delete their own account (not others)
- [ ] ✅ All related data is deleted (no orphaned records)
- [ ] ✅ Deletion order respects foreign key constraints
- [ ] ✅ Response doesn't leak sensitive information
- [ ] ✅ Tested with different user types (expert, asker, new user)
- [ ] ⚠️ Consider adding audit log before deletion
- [ ] ⚠️ Consider soft delete instead of hard delete
- [ ] ⚠️ Consider email confirmation before deletion

---

## Production Considerations

### 1. Add Audit Logging

Before Step 12 (Delete User), add:

**Function:** `Add Record`
- **Table:** `audit_log` (create this table)
- **Fields:**
  - `user_id`: `var.user_id`
  - `action`: `"account_deleted"`
  - `timestamp`: `Date.now()`
  - `details`: `JSON.stringify({ email: var.user_email })`

### 2. Implement Soft Delete

Instead of hard deletion, mark account as deleted:

**Replace Step 12 with:**
- **Function:** `Edit Record`
- **Table:** `user`
- **Filter:** `id = var.user_id`
- **Fields to update:**
  - `deleted`: `true`
  - `deleted_at`: `Date.now()`
  - `email`: `CONCAT("deleted_", var.user_id, "@deleted.local")`

**Benefits:**
- Allows account recovery within grace period
- Preserves data for legal/compliance
- Can still be fully deleted later

### 3. Send Confirmation Email

After Step 12, before Response:

**Function:** `HTTP Request` (to email service)
- **URL:** Your email API endpoint
- **Method:** POST
- **Body:**
```json
{
  "to": "{{var.user_email}}",
  "subject": "Account Deletion Confirmation",
  "template": "account_deleted"
}
```

### 4. Handle Pending Payments

Before Step 11, add check:

**Function:** `Query All Records`
- **Table:** `payment`
- **Filter:** `user_id = var.user_id AND status = 'pending'`
- **Output:** `pending_payments`

**Then add Conditional:**
- **Condition:** `pending_payments.length > 0`
- **IF TRUE:** Return error
  - Status: 400
  - Message: "Cannot delete account with pending payments"

---

## Quick Reference Card

### Xano Functions Used

| Function | Purpose | Output |
|----------|---------|--------|
| Get Authenticated User | Get logged-in user | authUser |
| Set Variable | Store values | Variable name you choose |
| Query Record | Get single record | Single object or null |
| Query All Records | Get multiple records | Array (can be empty) |
| For Loop | Iterate array | Loop through items |
| Conditional | If/else logic | Branch execution |
| Delete Record | Delete one record | Success/failure |
| Delete All Records | Bulk delete | Count of deleted records |
| Response | Return to client | HTTP response |

### Variable Naming Convention

Use clear, descriptive names:
- `user_id` - Current user's ID
- `expert_profile` - Expert profile record
- `user_answers` - Array of answers
- `user_questions` - Array of questions
- `answer` - Loop item in answers loop
- `question` - Loop item in questions loop

### Execution Order Matters!

Always delete child records before parent records:
```
Children First → Parents Last

media_asset (child of answer/question)
    ↓
answer (child of user)
    ↓
question (child of expert_profile)
    ↓
expert_profile (child of user)
    ↓
user (root parent)
```

---

## Function Stack (Old Section - Can be Removed)

### Step 1: Get Authenticated User
```
var.user = Get Authenticated User
```

This retrieves the currently authenticated user from the JWT token.

### Step 2: Get Expert Profile (if exists)
```
var.expert_profile = Query expert_profile
  WHERE user_id = var.user.id
  LIMIT 1
```

### Step 3: Delete Media Assets from User's Answers
```
// Get all answers by this user
var.user_answers = Query All Records From answer
  WHERE user_id = var.user.id

// For each answer, delete associated media
For Each var.answer in var.user_answers:
  IF var.answer.media_asset_id IS NOT NULL THEN
    Delete Record From media_asset
      WHERE id = var.answer.media_asset_id
  END IF
END For
```

### Step 4: Delete All Answers by User
```
Delete All Records From answer
  WHERE user_id = var.user.id
```

### Step 5: Delete Media Assets from User's Questions
```
IF var.expert_profile EXISTS THEN
  // Get all questions for this expert
  var.user_questions = Query All Records From question
    WHERE expert_profile_id = var.expert_profile.id

  // For each question, delete associated media
  For Each var.question in var.user_questions:
    IF var.question.media_asset_id IS NOT NULL THEN
      Delete Record From media_asset
        WHERE id = var.question.media_asset_id
    END IF
  END For
END IF
```

### Step 6: Delete All Questions by Expert
```
IF var.expert_profile EXISTS THEN
  Delete All Records From question
    WHERE expert_profile_id = var.expert_profile.id
END IF
```

### Step 7: Delete Payment Records
```
Delete All Records From payment
  WHERE user_id = var.user.id
```

**Note:** Consider checking if any payments are pending before deletion, or implement refund logic if needed.

### Step 8: Delete Coaching Sessions (if table exists)
```
IF question_coaching_sessions TABLE EXISTS THEN
  Delete All Records From question_coaching_sessions
    WHERE user_id = var.user.id
END IF
```

### Step 9: Delete Rate Limit Records (if table exists)
```
IF coaching_rate_limits TABLE EXISTS THEN
  Delete All Records From coaching_rate_limits
    WHERE user_id = var.user.id
END IF
```

### Step 10: Delete Expert Profile
```
IF var.expert_profile EXISTS THEN
  Delete Record From expert_profile
    WHERE id = var.expert_profile.id
END IF
```

### Step 11: Delete User Record
```
Delete Record From user
  WHERE id = var.user.id
```

### Step 12: Return Success Response
```
Response (200):
{
  "success": true,
  "message": "Account deleted successfully"
}
```

## Important Considerations

### 1. Cloudflare Media Cleanup
The endpoint only deletes database records. The actual media files on Cloudflare (Stream and R2) will remain. Options:

**Option A: Manual Cleanup (Recommended for now)**
- Run a periodic cron job that checks for media assets with deleted owners
- Delete orphaned media from Cloudflare

**Option B: Immediate Deletion**
- Add Cloudflare API calls in the delete function
- Requires Cloudflare credentials in Xano
- May slow down deletion process

### 2. Payment Handling
Consider these scenarios:

**Scenario 1: User has pending questions (paid but not answered)**
- Implement automatic refund before deletion
- Or prevent deletion if there are pending questions

**Scenario 2: User has active Stripe subscription**
- Cancel subscription before deletion
- Requires Stripe API integration in Xano

### 3. GDPR Compliance
To fully comply with GDPR "right to be forgotten":

- ✅ Delete all personal data from database
- ✅ Delete user authentication records
- ⚠️ Consider deleting or anonymizing questions/answers
- ⚠️ Delete audit logs containing user data (if any)

### 4. Soft Delete Alternative
Instead of hard deletion, consider implementing soft delete:

```
UPDATE user
SET deleted = true
SET deleted_at = Date.now()
SET email = CONCAT('deleted_', user.id, '@deleted.local')
WHERE id = var.user.id
```

Benefits:
- Allows for account recovery within grace period
- Preserves referential integrity
- Easier to audit

### 5. Email Notification
After successful deletion, consider sending a confirmation email:

```
// Before deleting user, store email
var.user_email = var.user.email

// After deletion
Send Email:
  To: var.user_email
  Subject: "Account Deletion Confirmation"
  Body: "Your mindPick account has been permanently deleted..."
```

## Testing Checklist

Before deploying to production:

- [ ] Create test user account
- [ ] Add test data (questions, answers, media)
- [ ] Call DELETE `/me/delete-account`
- [ ] Verify all database records deleted:
  - [ ] User record removed
  - [ ] Expert profile removed
  - [ ] Questions removed
  - [ ] Answers removed
  - [ ] Media assets removed
  - [ ] Payment records removed
- [ ] Verify authentication no longer works (401 error)
- [ ] Verify deleted user cannot sign in again
- [ ] Check Xano logs for any errors

## Security Notes

1. **Authentication Required:** Endpoint must verify JWT token
2. **Self-Service Only:** Users can only delete their own account
3. **No Admin Override:** Do not allow deletion of other users without proper authorization
4. **Audit Logging:** Consider logging deletion events to separate audit table
5. **Rate Limiting:** Consider rate limiting to prevent abuse

## Frontend Integration

The frontend (`AccountModal.jsx`) already implements:
- Two-step confirmation (click twice to confirm)
- Loading state during deletion
- Auto-logout after successful deletion
- Redirect to homepage
- Error handling with user-friendly messages

## Alternative: Admin-Initiated Deletion

If you want admins to be able to delete user accounts:

1. Create separate endpoint: `DELETE /admin/users/{user_id}`
2. Require admin authentication
3. Add audit logging
4. Send email notification to user
5. Implement grace period before actual deletion

## Rollback Plan

If something goes wrong:

1. Database backup before deployment
2. Test on staging environment first
3. Monitor Xano logs during initial rollout
4. Have database restore procedure ready
5. Consider implementing deletion queue (process async)

## Related Documentation

- [xano-endpoints.md](./xano-endpoints.md) - All Xano API endpoints
- [CLAUDE.md](./CLAUDE.md) - Main project documentation
- AccountModal.jsx:68-100 - Frontend implementation

## Implementation Status

- ✅ Frontend implementation completed (AccountModal.jsx)
- ✅ Backend Vercel endpoint created (`/api/users/delete-account`)
- ✅ Xano endpoint created and working (`DELETE /me/delete-account`)
- ✅ End-to-end testing completed successfully
- ✅ UI bug fixes applied (button overlap fixed with min-width)
- ⏳ Cloudflare media cleanup not implemented (optional)
- ⏳ Stripe subscription cancellation not implemented (optional)
- ⏳ Email notification not implemented (optional)

## Completed Features

### Core Functionality
- ✅ Two-step confirmation (click twice to confirm)
- ✅ Separate loading states for Save and Delete actions
- ✅ Auto-logout after successful deletion
- ✅ Redirect to homepage after deletion
- ✅ Complete data cleanup from all database tables:
  - `user` table
  - `expert_profile` table
  - `question` table (all questions assigned to expert)
  - `answer` table (all answers by user)
  - `media_asset` table (all media owned by user)
  - `payment` table (optional)
- ✅ Error handling with user-friendly messages
- ✅ JWT token invalidation
- ✅ Consistent button sizing (no overlap)

### User Experience
- Warning message with confirmation requirement
- Visual feedback during deletion process
- Clear success/error messaging
- Graceful session cleanup

## Optional Enhancements (Future)

These features were not implemented but can be added later if needed:

1. **Cloudflare Media Cleanup**
   - Currently only deletes database records
   - Actual files remain on Cloudflare (Stream and R2)
   - Can implement periodic cleanup cron job

2. **Stripe Subscription Cancellation**
   - Automatically cancel active subscriptions before deletion
   - Requires Stripe API integration in Xano

3. **Email Confirmation**
   - Send confirmation email after account deletion
   - Can use existing ZeptoMail integration

4. **Soft Delete Option**
   - Mark account as deleted instead of hard delete
   - Allow recovery within grace period (e.g., 30 days)

5. **Audit Logging**
   - Log all account deletions to separate audit table
   - Track who deleted what and when

6. **Admin Recovery Tool**
   - Admin interface to restore deleted accounts
   - Useful for accidental deletions

---

**Created:** October 13, 2025
**Last Updated:** October 13, 2025
**Status:** ✅ Production Ready
**Version:** 1.0
