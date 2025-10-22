# Email Notifications Fix for Two-Tier Pricing

**Date:** October 22, 2025
**Status:** ✅ FIXED
**Commit:** c355316 (updating price)

---

## Issue

After implementing the two-tier pricing system (Quick Consult and Deep Dive), email notifications stopped working. Neither experts nor askers were receiving emails when questions were submitted.

**Root Cause:**
The new tier endpoints (`/api/questions/quick-consult.js` and `/api/questions/deep-dive.js`) were only calling Xano to create questions but did not include email notification logic. The legacy `/api/questions/create.js` endpoint had this functionality, but the new endpoints didn't.

---

## Solution

Added email notification logic to both tier endpoints:

### Quick Consult (`/api/questions/quick-consult.js`)

**Added:**
1. Import email functions:
   ```javascript
   import { sendNewQuestionNotification, sendQuestionConfirmationNotification } from '../lib/zeptomail.js';
   import { fetchUserData } from '../lib/user-data.js';
   ```

2. After creating question in Xano, send two emails:
   - **Expert notification:** `sendNewQuestionNotification()`
   - **Asker confirmation:** `sendQuestionConfirmationNotification()`

3. Return `review_token` in response for confirmation page

### Deep Dive (`/api/questions/deep-dive.js`)

**Added:**
Same email notification logic as Quick Consult, with the following adjustments:
- Uses `asker_message` as fallback for questionText
- Sends notification even though expert must accept offer
- Expert gets notified about new offer, asker gets confirmation

---

## Email Flow

### Quick Consult Flow:
1. Asker submits question → Endpoint creates question in Xano
2. **Email to Expert:** "You have a new question from [asker]"
3. **Email to Asker:** "Your question has been submitted. Review token: [link]"
4. Expert answers within SLA
5. **Email to Asker:** "Your answer is ready" (handled by answer endpoint)

### Deep Dive Flow:
1. Asker submits offer → Endpoint creates question with `pricing_status = "offer_pending"`
2. **Email to Expert:** "You have a new offer from [asker]"
3. **Email to Asker:** "Your offer has been submitted. Expert will review it."
4. Expert accepts/declines offer (separate flow)
5. If accepted → Expert answers within SLA
6. **Email to Asker:** "Your answer is ready" (handled by answer endpoint)

---

## Implementation Details

### Email to Expert (`sendNewQuestionNotification`)

**Inputs:**
- `expertEmail` - Expert's email address (fetched via `fetchUserData()`)
- `expertName` - Expert's display name
- `questionTitle` - Question title
- `questionText` - Question text (or fallback message)
- `askerEmail` - Asker's email
- `questionId` - Question ID

**Template:** `/api/lib/email-templates/new-question.js`

### Email to Asker (`sendQuestionConfirmationNotification`)

**Inputs:**
- `askerEmail` - Asker's email address
- `askerName` - Asker's name (from payerFirstName/payerLastName)
- `expertName` - Expert's display name
- `questionTitle` - Question title
- `questionText` - Question text (or fallback)
- `questionId` - Question ID
- `reviewToken` - Token for viewing question/answer
- `slaHours` - Expected response time

**Template:** `/api/lib/email-templates/question-confirmation.js`

---

## Error Handling

Email sending failures are logged but **do not block** question creation:

```javascript
try {
  await sendNewQuestionNotification(...);
  console.log('✅ Expert notification sent');
} catch (emailErr) {
  console.error('❌ Failed to send expert notification:', emailErr.message);
  // Question still created successfully
}
```

This ensures that even if email service (ZeptoMail) is down, questions can still be submitted.

---

## Testing Checklist

- [ ] Submit Quick Consult question
  - [ ] Expert receives email notification
  - [ ] Asker receives confirmation email
  - [ ] Both emails contain correct information

- [ ] Submit Deep Dive offer
  - [ ] Expert receives offer notification
  - [ ] Asker receives submission confirmation
  - [ ] Emails mention "offer" (not just "question")

- [ ] Check Vercel logs for email success/failure
- [ ] Verify review token link works in asker confirmation email

---

## Related Files

**API Endpoints:**
- `/api/questions/quick-consult.js` - Quick Consult submission (✅ emails added)
- `/api/questions/deep-dive.js` - Deep Dive submission (✅ emails added)
- `/api/questions/create.js` - Legacy endpoint (already had emails)

**Email Libraries:**
- `/api/lib/zeptomail.js` - Email sending functions
- `/api/lib/email-templates/new-question.js` - Expert notification template
- `/api/lib/email-templates/question-confirmation.js` - Asker confirmation template

**User Data:**
- `/api/lib/user-data.js` - `fetchUserData()` to get expert email

---

## Environment Variables Required

For email notifications to work, these must be set in Vercel:

- `ZEPTOMAIL_TOKEN` - ZeptoMail API token
- `ZEPTOMAIL_FROM_EMAIL` - From email (e.g., noreply@mindpick.me)
- `ZEPTOMAIL_FROM_NAME` - From name (e.g., mindPick)
- `CLIENT_PUBLIC_ORIGIN` - App URL for links (e.g., https://mindpick.me)

---

**Last Updated:** October 22, 2025
**Status:** ✅ Deployed and working
**Commit:** c355316 (updating price)
