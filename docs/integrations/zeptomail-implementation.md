# ZeptoMail Email Notifications - Implementation Documentation

## Overview 

ZeptoMail has been successfully integrated into QuickChat to send transactional email notifications for four key events:
1. **Sign In** - Welcome back notification when users sign in via OAuth
2. **Create Question** - Dual notifications:
   - Expert notification when a new question is received
   - Payer/asker confirmation that their question was submitted successfully
3. **Answer Question** - Notification to asker when their question is answered

**Status:** ✅ Fully implemented and tested
**Region:** EU (https://api.zeptomail.eu)

---

## Architecture

### Directory Structure

```
/api
  /lib
    /email-templates          # Organized email templates
      sign-in.js              # Sign-in notification template
      new-question.js         # New question notification template
      answer-received.js      # Answer received notification template
    zeptomail.js              # Core ZeptoMail service (refactored)
    user-data.js              # Modular user data fetching utilities

  /oauth
    /google
      continue.js             # Google OAuth + sign-in email
    /linkedin
      continue.js             # LinkedIn OAuth + sign-in email

  /questions
    create.js                 # Question creation + expert email

  /answer
    submit.js                 # Answer submission + asker email

  test-email.js               # Test endpoint for email verification
  diagnose-zeptomail.js       # Diagnostic endpoint for troubleshooting
```

### Key Components

#### 1. **Email Templates** (`/api/lib/email-templates/`)
Separated email templates for easy maintenance and customization:
- **sign-in.js** - Welcome back email with security notice
- **new-question.js** - Expert notification with question details
- **question-confirmation.js** - Payer/asker confirmation that question was submitted
- **answer-received.js** - Asker notification with answer link

Each template exports a function that returns:
```javascript
{
  subject: string,
  htmlBody: string,
  textBody: string
}
```

#### 2. **ZeptoMail Service** (`/api/lib/zeptomail.js`)
Core email service with clean, maintainable functions:
- `sendEmail()` - Generic email sending function
- `sendSignInNotification()` - Sign-in email wrapper
- `sendNewQuestionNotification()` - Expert notification email wrapper
- `sendQuestionConfirmationNotification()` - Payer/asker confirmation email wrapper
- `sendAnswerReceivedNotification()` - Answer received email wrapper

#### 3. **User Data Utilities** (`/api/lib/user-data.js`)
Modular functions for fetching and processing user information:
- `fetchUserData(userId)` - Fetch user email and name from internal Xano endpoint
- `getAskerName(questionData)` - Construct full name from payer fields (first + last name)
- `getAskerEmail(questionData)` - Extract asker email from question data

#### 4. **Integration Points**
Email notifications are triggered at:
- **OAuth callbacks** - Non-blocking after successful authentication
- **Question creation** - Non-blocking dual emails after question is saved to Xano:
  1. Expert notification (new question received)
  2. Payer/asker confirmation (question submitted successfully)
- **Answer submission** - Non-blocking after answer is saved to Xano

---

## Configuration

### Environment Variables

Required environment variables (set in Vercel):

| Variable | Value | Description |
|----------|-------|-------------|
| `ZEPTOMAIL_TOKEN` | `Zoho-enczapikey yA6K...` | Full API token from ZeptoMail |
| `ZEPTOMAIL_FROM_EMAIL` | `noreply@mindpick.me` | Verified sender email |
| `ZEPTOMAIL_FROM_NAME` | `mindPick.me Notification` | Sender display name |

**Important Notes:**
- The token must include the full `Zoho-enczapikey` prefix
- Sender email must be verified in ZeptoMail dashboard
- EU region endpoint is used: `https://api.zeptomail.eu/v1.1/email`

### Vercel Setup

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Add the three variables above
3. Select **All Environments** (Production, Preview, Development)
4. Click **Save** and **Redeploy**

---

## Email Templates

### 1. Sign-In Notification

**Triggered:** After successful Google or LinkedIn OAuth
**Sent to:** User's email address
**Subject:** "Welcome back to mindPick.me"

**Content:**
- Welcome message with user's name
- Email address and sign-in timestamp
- Quick links to dashboard features
- Security notice (if user didn't sign in)

**Template:** `/api/lib/email-templates/sign-in.js`

---

### 2. New Question Notification (to Expert)

**Triggered:** When a new question is created
**Sent to:** Expert's email address (from expert profile)
**Subject:** "New Question Received on mindPick.me"

**Content:**
- Question title and description
- Asker's email address
- Question ID and timestamp
- Direct link to expert dashboard
- SLA reminder

**Template:** `/api/lib/email-templates/new-question.js`

---

### 3. Question Confirmation (to Payer/Asker)

**Triggered:** When a new question is created
**Sent to:** Payer's email address (from question submission)
**Subject:** "Question Submitted Successfully - mindPick.me"

**Content:**
- Confirmation message
- Question title and description
- Expert's name
- Question ID and timestamp
- Expected response time (SLA hours)
- Link to view questions dashboard
- "What's Next" guidance

**Template:** `/api/lib/email-templates/question-confirmation.js`

---

### 4. Answer Received Notification

**Triggered:** When expert submits an answer
**Sent to:** Asker's email address (payer_email from question)
**Subject:** "Your Question Has Been Answered on mindPick.me"

**Content:**
- Expert's name
- Question title
- Answer timestamp
- Direct link to view answer
- Feedback prompt

**Template:** `/api/lib/email-templates/answer-received.js`

---

## Testing

### Test Endpoint

Use the test endpoint to verify email configuration:

```bash
https://your-domain.vercel.app/api/test-email?email=YOUR_EMAIL
```

**Response:**
```json
{
  "success": true,
  "message": "Test email sent successfully",
  "config": {
    "fromEmail": "noreply@mindpick.me",
    "fromName": "mindPick.me Notification",
    "toEmail": "your@email.com",
    "type": "simple"
  }
}
```

### Diagnostic Endpoint

Use the diagnostic endpoint for detailed troubleshooting:

```bash
https://your-domain.vercel.app/api/diagnose-zeptomail?email=YOUR_EMAIL
```

**Response includes:**
- Environment variable status
- Token validation
- API connection test
- Specific error suggestions

### Manual Testing

#### Test Sign-In Email:
1. Sign out of your account
2. Sign back in with Google or LinkedIn
3. Check email inbox (and spam folder)
4. Verify email is received within 30 seconds

#### Test Question Emails:
1. Create a new question for an expert
2. Check expert's email inbox for "New Question Received" notification
3. Check payer/asker's email inbox for "Question Submitted Successfully" confirmation
4. Verify question details are correct in both emails
5. Click dashboard links to verify they work

#### Test Answer Email:
1. Submit an answer as an expert
2. Check asker's email inbox
3. Verify answer notification is received
4. Click view answer link to verify it works

---

## Monitoring

### ZeptoMail Dashboard

Monitor sent emails at: https://www.zoho.com/zeptomail/

**Email Logs show:**
- Sent emails count
- Delivery status
- Bounce/failure reasons
- API usage statistics

### Vercel Function Logs

Check Vercel logs for email activity:

1. Go to **Vercel Dashboard** → Your Project → **Logs** or **Functions**
2. Filter by function: `/api/oauth/*/continue`, `/api/questions/create`, `/api/answer/submit`
3. Look for log messages:
   - `📧 Sending email via ZeptoMail to: [email]`
   - `✅ Email sent successfully to: [email]`
   - `❌ Failed to send email:` (with error details)

### Console Logs

Each email attempt logs:
```
📧 Sending email via ZeptoMail to: user@example.com
📧 Subject: Welcome back to mindPick.me
✅ Email sent successfully to: user@example.com
```

Or on failure:
```
❌ ZeptoMail API error: { code: 'TM_4001', message: 'Access Denied' }
```

---

## Troubleshooting

### Common Issues

#### Issue: "Access Denied" (TM_4001)

**Causes:**
- Wrong API region (using .com instead of .eu)
- Sender email not verified in ZeptoMail
- Invalid or expired API token
- Mail Agent is inactive

**Solution:**
1. Verify you're using EU endpoint: `https://api.zeptomail.eu`
2. Check sender email is verified: ZeptoMail → Sender Addresses
3. Verify API token: ZeptoMail → Mail Agents → Setup Info → API
4. Check Mail Agent is active

#### Issue: Emails Not Received

**Check:**
1. **Spam/Junk folder** - First emails often go to spam
2. **ZeptoMail logs** - Verify email was actually sent
3. **Vercel logs** - Check if send was triggered
4. **Sender reputation** - New senders may have delivery delays

#### Issue: "ZEPTOMAIL_TOKEN not set"

**Solution:**
1. Add environment variables to Vercel
2. Redeploy after adding variables
3. Verify variables are set for correct environment (Production/Preview)

#### Issue: Wrong API Region Error

**Symptom:** 403 or Access Denied errors
**Solution:** Ensure code uses `https://api.zeptomail.eu` (not `.com`)

---

## Code Examples

### Using Modular User Data Functions

The refactored code uses modular functions from `/api/lib/user-data.js` for cleaner, reusable user data handling:

**Fetching Expert Data:**
```javascript
import { fetchUserData } from '../lib/user-data.js';

// Fetch expert email and name
const expertData = await fetchUserData(userId);

if (expertData?.email) {
  await sendNewQuestionNotification({
    expertEmail: expertData.email,
    expertName: expertData.name || 'Expert',
    // ... other fields
  });
}
```

**Getting Asker Information:**
```javascript
import { getAskerName, getAskerEmail } from '../lib/user-data.js';

// Extract asker data from question
const askerEmail = getAskerEmail(questionData);
const askerName = getAskerName(questionData);  // Handles first + last name

await sendAnswerReceivedNotification({
  askerEmail,
  askerName,
  // ... other fields
});
```

**Benefits of Modular Approach:**
- ✅ Single source of truth for user data fetching
- ✅ Consistent error handling across endpoints
- ✅ Easy to test and maintain
- ✅ Reusable across multiple endpoints
- ✅ Clear separation of concerns

### Adding a New Email Template

1. Create template file:
```javascript
// api/lib/email-templates/my-template.js
export function getMyTemplate(data) {
  const subject = 'My Subject';
  const htmlBody = `<div>My HTML content with ${data.name}</div>`;
  const textBody = `My plain text content with ${data.name}`;

  return { subject, htmlBody, textBody };
}
```

2. Add function to zeptomail.js:
```javascript
import { getMyTemplate } from './email-templates/my-template.js';

export async function sendMyNotification(data) {
  const { subject, htmlBody, textBody } = getMyTemplate(data);

  return sendEmail({
    to: data.email,
    toName: data.name,
    subject,
    htmlBody,
    textBody,
  });
}
```

3. Call from your API endpoint:
```javascript
import { sendMyNotification } from './lib/zeptomail.js';

// Non-blocking email
sendMyNotification(data)
  .then(() => console.log('✅ Email sent'))
  .catch(err => console.error('❌ Email failed:', err.message));
```

### Customizing Email Templates

Edit template files in `/api/lib/email-templates/`:

**Example:** Change sign-in email colors
```javascript
// api/lib/email-templates/sign-in.js
// Change from blue (#3498db) to green (#10b981)
<div style="border-left: 4px solid #10b981;">
```

**Best Practices:**
- Keep inline styles for email compatibility
- Test in multiple email clients
- Maintain plain text version for accessibility
- Keep HTML simple (avoid complex CSS)

---

## Performance

### Email Sending Performance

- **Non-blocking:** All emails sent asynchronously
- **No user delay:** API responses not affected by email sending
- **Timeout:** Emails timeout after 10 seconds
- **Retry:** No automatic retry (failed emails are logged)

### ZeptoMail Limits

- **Free Tier:** 10,000 emails/month
- **Rate Limits:** Check ZeptoMail dashboard for account limits
- **Delivery Time:** Usually < 5 seconds

---

## Security

### Token Security

- ✅ Token stored in environment variables (not in code)
- ✅ Token never exposed to frontend
- ✅ Token not logged (only first 30 chars for debugging)
- ✅ `.env.local` in `.gitignore`

### Email Security

- ✅ SPF/DKIM configured via ZeptoMail
- ✅ HTTPS-only API communication
- ✅ Sender email domain verified
- ✅ No user input in sender fields

---

## Maintenance

### Regular Checks

**Monthly:**
- Check email delivery rates in ZeptoMail dashboard
- Review bounce/failure logs
- Monitor quota usage

**Quarterly:**
- Review email content for accuracy
- Test all email flows
- Update templates if needed

### Updating Templates

1. Edit template in `/api/lib/email-templates/`
2. Test locally with `/api/test-email`
3. Deploy to Vercel
4. Send test emails to verify changes

---

## API Reference

### User Data Functions (`/api/lib/user-data.js`)

#### fetchUserData(userId)

Fetch user email and name from internal Xano endpoint.

**Parameters:**
```javascript
userId: number  // User ID to fetch
```

**Returns:** `Promise<{email: string, name: string} | null>`

**Example:**
```javascript
const userData = await fetchUserData(123);
if (userData) {
  console.log(userData.email, userData.name);
}
```

#### getAskerName(questionData)

Construct full name from question payer data.

**Parameters:**
```javascript
questionData: Object  // Question object with payer fields
```

**Returns:** `string` - Full name (first + last) or fallback

**Example:**
```javascript
const name = getAskerName(questionData);
// Returns: "John Doe" or "John" or email username or "there"
```

#### getAskerEmail(questionData)

Extract asker email from question data.

**Parameters:**
```javascript
questionData: Object  // Question object
```

**Returns:** `string | null`

### Email Functions (`/api/lib/zeptomail.js`)

### sendEmail(options)

Core email sending function.

**Parameters:**
```javascript
{
  to: string,           // Recipient email
  toName: string,       // Recipient name (optional)
  subject: string,      // Email subject
  htmlBody: string,     // HTML content
  textBody: string      // Plain text content (optional)
}
```

**Returns:** `Promise<Object>` - ZeptoMail API response

### sendSignInNotification(user)

Send sign-in notification.

**Parameters:**
```javascript
{
  email: string,        // User email
  name: string          // User name
}
```

### sendNewQuestionNotification(data)

Send new question notification to expert.

**Parameters:**
```javascript
{
  expertEmail: string,
  expertName: string,
  questionTitle: string,
  questionText: string,
  askerEmail: string,
  questionId: number
}
```

### sendAnswerReceivedNotification(data)

Send answer notification to asker.

**Parameters:**
```javascript
{
  askerEmail: string,
  askerName: string,
  expertName: string,
  questionTitle: string,
  questionId: number,
  answerId: number
}
```

### sendQuestionConfirmationNotification(data)

Send question confirmation to payer/asker.

**Parameters:**
```javascript
{
  askerEmail: string,
  askerName: string,
  expertName: string,
  questionTitle: string,
  questionText: string,
  questionId: number,
  slaHours: number  // optional
}
```

---

## Support

### ZeptoMail Resources

- **Dashboard:** https://www.zoho.com/zeptomail/
- **Documentation:** https://www.zoho.com/zeptomail/help/
- **Support:** Via ZeptoMail help center

### Internal Documentation

- **Main docs:** `docs/CLAUDE.md`
- **Testing guide:** `TESTING-ZEPTOMAIL.md`
- **Email templates:** `api/lib/email-templates/`

---

## Changelog

### v1.2.0 (2025-10-13)
- ✅ Fixed bug: Added question confirmation email to payer/asker
- ✅ Created new email template: `question-confirmation.js`
- ✅ Added `sendQuestionConfirmationNotification()` function to zeptomail.js
- ✅ Updated `/api/questions/create.js` to send dual emails:
  1. Expert notification (existing)
  2. Payer/asker confirmation (new)
- ✅ Both emails now sent when question is created
- ✅ Updated documentation to reflect new email flow

### v1.1.0 (2025-10-13)
- ✅ Modular refactoring: Created `/api/lib/user-data.js`
- ✅ Added `fetchUserData()` function for reusable user fetching
- ✅ Added `getAskerName()` function for consistent name handling
- ✅ Added `getAskerEmail()` function for cleaner email extraction
- ✅ Refactored question and answer endpoints to use modular functions
- ✅ Improved asker name to include full name (first + last)
- ✅ Single source of truth for user data operations

### v1.0.0 (2025-10-13)
- ✅ Initial implementation complete
- ✅ Three email notifications working
- ✅ EU region endpoint configured
- ✅ Templates organized into separate files
- ✅ Test and diagnostic endpoints added
- ✅ Non-blocking email sending with await
- ✅ Comprehensive error logging
- ✅ Production tested and verified

---

## Summary

✅ **Email notifications are fully operational**

**Active Notifications:**
1. Sign-in welcome email
2. New question notifications (dual emails):
   - Expert notification (new question received)
   - Payer/asker confirmation (question submitted successfully)
3. Answer received notification to askers

**Status:** Production-ready and tested
**Region:** EU (api.zeptomail.eu)
**Performance:** Non-blocking, < 5 second delivery
**Monitoring:** ZeptoMail dashboard + Vercel logs

For questions or issues, check the diagnostic endpoint first, then review Vercel function logs and ZeptoMail dashboard.
