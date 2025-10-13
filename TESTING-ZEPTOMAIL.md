# ZeptoMail Testing Guide

## Problem: Not receiving emails after creating a question

This is likely because **environment variables are not set in production (Vercel)**.

## Quick Fix: Add Environment Variables to Vercel

### Step 1: Go to Vercel Dashboard

1. Visit https://vercel.com/dashboard
2. Select your `quickchat-dev` project
3. Click on **Settings** tab
4. Click on **Environment Variables** in the left sidebar

### Step 2: Add These Environment Variables

Add the following three environment variables:

| Name | Value |
|------|-------|
| `ZEPTOMAIL_TOKEN` | `Zoho-enczapikey yA6KbHtf6132yzhXEkFshJjZ8t1k//893nzi53uwfcAhK9e33aE5g0A9JtG9LzLejISF4PgAatwTIdi574tdL8JiMNUAKZTGTuv4P2uV48xh8ciEYNYjgZWuCrURGq9IdhIhCS44QvgnWA==` |
| `ZEPTOMAIL_FROM_EMAIL` | `noreply@mindpick.me` |
| `ZEPTOMAIL_FROM_NAME` | `mindPick.me Notification` |

**Important:** Select **All Environments** (Production, Preview, Development) for each variable.

### Step 3: Redeploy

After adding the variables:
1. Go to **Deployments** tab
2. Click on the latest deployment
3. Click the **•••** menu (three dots)
4. Click **Redeploy**
5. Wait for deployment to complete

---

## Testing Methods

### Method 1: Test Email Endpoint (Fastest)

I've created a test endpoint that you can call directly:

**Test URL:**
```
https://your-domain.vercel.app/api/test-email?email=YOUR_EMAIL@example.com
```

Replace `YOUR_EMAIL@example.com` with your actual email address.

**What to expect:**
- ✅ Success: You'll see JSON response with `"success": true` and receive a test email
- ❌ Failure: You'll see an error message explaining what's wrong

**Test question notification:**
```
https://your-domain.vercel.app/api/test-email?email=YOUR_EMAIL@example.com&type=question
```

### Method 2: Check Browser Console

1. Open your QuickChat app in the browser
2. Open Developer Tools (F12 or Right-click → Inspect)
3. Go to **Console** tab
4. Create a question
5. Look for these messages:
   - `✅ Expert notification sent` (success)
   - `❌ Failed to send expert notification:` (failure with reason)

### Method 3: Check Vercel Function Logs

1. Go to Vercel Dashboard → Your Project
2. Click on **Logs** tab or **Functions** tab
3. Filter by `/api/questions/create`
4. Look for log entries when you create a question
5. Check for:
   - `📧 Sending email via ZeptoMail to: [email]`
   - `✅ Email sent successfully`
   - Or error messages

### Method 4: Local Testing

If you want to test locally before deploying:

1. **Start local server:**
   ```bash
   npm run dev
   ```

2. **Test the endpoint:**
   ```bash
   curl "http://localhost:5173/api/test-email?email=YOUR_EMAIL@example.com"
   ```

3. **Or visit in browser:**
   ```
   http://localhost:5173/api/test-email?email=YOUR_EMAIL@example.com
   ```

---

## Troubleshooting

### Issue: "ZEPTOMAIL_TOKEN environment variable is not set"

**Solution:** Add environment variables to Vercel (see Step 1-3 above)

### Issue: Email sent but not received

**Check these:**

1. **Spam/Junk folder** - Check if email landed in spam
2. **ZeptoMail Dashboard**
   - Go to https://www.zoho.com/zeptomail/
   - Check **Email Logs** to see if emails were sent
   - Look for delivery status
3. **Sender verification**
   - Verify `noreply@mindpick.me` is approved in ZeptoMail
   - Check domain DKIM/SPF records

### Issue: "Failed to send email" error

**Check:**

1. **API Token validity**
   - Go to ZeptoMail → Mail Agents → Setup Info → API
   - Verify token matches what you added to Vercel
   - Generate new token if needed

2. **ZeptoMail quota**
   - Check if you've exceeded free tier limits (10,000 emails/month)
   - View usage in ZeptoMail dashboard

3. **Sender email active**
   - Ensure `noreply@mindpick.me` is active in Sender Addresses

---

## Debug Checklist

Use this checklist to diagnose issues:

- [ ] Environment variables added to Vercel?
- [ ] Redeployed after adding environment variables?
- [ ] Test endpoint returns success?
- [ ] Browser console shows "Email sent successfully"?
- [ ] Checked spam/junk folder?
- [ ] Checked ZeptoMail email logs?
- [ ] Sender email verified in ZeptoMail?
- [ ] API token is valid?
- [ ] Not exceeded quota?

---

## Expected Behavior

When everything is working correctly:

### Creating a Question:
1. ✅ Question created in Xano
2. ✅ Console log: `✅ Expert notification sent`
3. ✅ Expert receives email with question details
4. ✅ Email includes link to expert dashboard

### Answering a Question:
1. ✅ Answer created in Xano
2. ✅ Console log: `✅ Answer notification sent to asker`
3. ✅ Asker receives email notification
4. ✅ Email includes link to view answer

### Signing In:
1. ✅ OAuth completes successfully
2. ✅ Console log: `✅ Sign-in notification sent`
3. ✅ User receives welcome email

---

## Quick Test Commands

Replace `YOUR_DOMAIN` with your actual Vercel domain:

```bash
# Test simple email
curl "https://YOUR_DOMAIN.vercel.app/api/test-email?email=YOUR_EMAIL"

# Test question notification
curl "https://YOUR_DOMAIN.vercel.app/api/test-email?email=YOUR_EMAIL&type=question"

# Check if environment variables are set (will fail if not)
curl "https://YOUR_DOMAIN.vercel.app/api/test-email?email=test@test.com"
```

---

## Need More Help?

If emails still aren't working after following these steps:

1. Run the test endpoint and share the error message
2. Check Vercel function logs and share relevant errors
3. Check ZeptoMail dashboard for bounce/failure logs
4. Verify your ZeptoMail account is active and not suspended

The test endpoint (`/api/test-email`) will give you specific error messages that will help diagnose the exact issue.
