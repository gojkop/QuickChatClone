# ZeptoMail Email Notifications - Implementation Guide

## Overview

ZeptoMail has been integrated into QuickChat to send transactional email notifications for three key events:
1. **Sign In** - Welcome back notification when users sign in
2. **Create Question** - Notification to expert when a new question is received
3. **Answer Question** - Notification to asker when their question is answered

## Files Created/Modified

### New Files Created

1. **`/api/lib/zeptomail.js`** - ZeptoMail service module
   - Core email sending functionality
   - Three specialized notification functions:
     - `sendSignInNotification(user)`
     - `sendNewQuestionNotification(data)`
     - `sendAnswerReceivedNotification(data)`
   - Beautiful HTML email templates with responsive design

2. **`/api/answer/submit.js`** - Answer submission endpoint
   - Proxies answer submission to Xano
   - Fetches question and expert details
   - Sends email notification to asker
   - Non-blocking email sending

3. **`.env.local`** - Local environment variables
   - `ZEPTOMAIL_TOKEN` - Your ZeptoMail API token
   - `ZEPTOMAIL_FROM_EMAIL` - noreply@mindpick.me
   - `ZEPTOMAIL_FROM_NAME` - mindPick.me Notification

4. **`.gitignore`** - Protects sensitive credentials
   - Ensures `.env.local` is never committed to git

### Modified Files

1. **`/api/oauth/google/continue.js`**
   - Added sign-in notification after successful Google OAuth
   - Non-blocking email sending (doesn't delay response)

2. **`/api/oauth/linkedin/continue.js`**
   - Added sign-in notification after successful LinkedIn OAuth
   - Non-blocking email sending

3. **`/api/questions/create.js`**
   - Added new question notification to expert
   - Extracts expert email from profile data
   - Non-blocking email sending

4. **`/src/hooks/useAnswerUpload.js`**
   - Updated to call `/api/answer/submit` instead of Xano directly
   - Ensures email notifications are sent when answers are submitted

## Configuration

### Environment Variables

Add these to your **Vercel environment variables** (for production):

```
ZEPTOMAIL_TOKEN=Zoho-enczapikey yA6KbHtf6132yzhXEkFshJjZ8t1k//893nzi53uwfcAhK9e33aE5g0A9JtG9LzLejISF4PgAatwTIdi574tdL8JiMNUAKZTGTuv4P2uV48xh8ciEYNYjgZWuCrURGq9IdhIhCS44QvgnWA==
ZEPTOMAIL_FROM_EMAIL=noreply@mindpick.me
ZEPTOMAIL_FROM_NAME=mindPick.me Notification
```

### Local Development

For local development, the `.env.local` file has already been created with your credentials.

## Email Templates

### 1. Sign-In Notification
**Sent to:** User who signed in
**Trigger:** OAuth success (Google or LinkedIn)
**Content:**
- Welcome message
- Email and timestamp
- Quick links to key features
- Security notice

### 2. New Question Notification
**Sent to:** Expert
**Trigger:** New question created
**Content:**
- Question title and description
- Asker's email
- Question ID
- Direct link to expert dashboard
- SLA reminder

### 3. Answer Received Notification
**Sent to:** Asker
**Trigger:** Expert submits answer
**Content:**
- Expert name
- Question title
- Answer timestamp
- Direct link to view answer
- Feedback prompt

## Email Features

All emails include:
- ✅ Responsive HTML design
- ✅ Plain text fallback
- ✅ Professional branding
- ✅ Clear call-to-action buttons
- ✅ Automatic timestamp
- ✅ Security/informational notices

## Implementation Details

### Non-Blocking Email Sending

All email notifications are sent asynchronously using `.then()/.catch()` to avoid blocking the API response:

```javascript
if (userEmail) {
  sendSignInNotification({ email: userEmail, name: userName })
    .then(() => console.log('✅ Sign-in notification sent'))
    .catch((err) => console.error('❌ Failed to send sign-in notification:', err.message));
}
```

This ensures:
- Fast API responses
- Email failures don't break the user flow
- Errors are logged for debugging

### Error Handling

- Email failures are logged but don't throw errors
- Failed emails won't prevent sign-ins, questions, or answers
- All email errors are logged with descriptive messages

## Testing

### Local Testing

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Test each flow:
   - **Sign In**: Sign in with Google or LinkedIn
   - **Create Question**: Submit a question to an expert
   - **Answer Question**: Submit an answer as an expert

3. Check console logs for:
   - `✅ Sign-in notification sent`
   - `✅ Expert notification sent`
   - `✅ Answer notification sent to asker`

### Production Testing

After deploying to Vercel:
1. Add environment variables to Vercel
2. Deploy and test each email flow
3. Check Vercel function logs for email status
4. Verify emails are received in inboxes

## Deployment Checklist

- [ ] Add `ZEPTOMAIL_TOKEN` to Vercel environment variables
- [ ] Add `ZEPTOMAIL_FROM_EMAIL` to Vercel environment variables
- [ ] Add `ZEPTOMAIL_FROM_NAME` to Vercel environment variables
- [ ] Deploy to Vercel
- [ ] Test sign-in flow
- [ ] Test question creation flow
- [ ] Test answer submission flow
- [ ] Verify emails in inbox (check spam folder)

## ZeptoMail API Details

### API Endpoint
```
POST https://api.zeptomail.com/v1.1/email
```

### Authentication
```
Authorization: Zoho-enczapikey <your-token>
```

### Rate Limits
- Free tier: 10,000 emails/month
- Check your ZeptoMail dashboard for current usage

## Troubleshooting

### Emails Not Sending

1. **Check environment variables**
   ```bash
   # Local
   cat .env.local

   # Production
   vercel env ls
   ```

2. **Check Vercel function logs**
   - Look for email-related errors
   - Verify ZeptoMail API responses

3. **Check ZeptoMail dashboard**
   - View sent emails
   - Check for API errors
   - Verify sender address is active

### Common Issues

**Issue:** "Email service not configured"
**Solution:** Ensure `ZEPTOMAIL_TOKEN` is set in environment variables

**Issue:** Emails in spam folder
**Solution:** Verify domain DKIM/SPF records in ZeptoMail settings

**Issue:** Expert email not found
**Solution:** Ensure expert profile includes email field in Xano

## Future Enhancements

Possible improvements:
- [ ] Email templates with custom branding
- [ ] Email preferences/unsubscribe functionality
- [ ] Email analytics tracking
- [ ] Additional notification types (reminders, updates, etc.)
- [ ] Email queue for high-volume scenarios
- [ ] A/B testing for email content

## Support

For ZeptoMail support:
- Dashboard: https://www.zoho.com/zeptomail/
- Documentation: https://www.zoho.com/zeptomail/help/
- Support: Check ZeptoMail help center

For implementation questions, check:
- Console logs for detailed error messages
- Vercel function logs
- ZeptoMail API logs in dashboard
