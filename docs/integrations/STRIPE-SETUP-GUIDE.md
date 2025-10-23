# Stripe Setup Guide

**Last Updated:** October 23, 2025

Complete guide for setting up Stripe for QuickChat's payment integration.

---

## 1. Create Stripe Account

### Sign Up

1. Go to https://stripe.com
2. Click "Start now" or "Sign up"
3. Fill in your details:
   - Email address
   - Full name
   - Country (determines available payment methods and currencies)
   - Password

4. Verify your email address

**You now have a Stripe account!** You can start testing immediately in **Test Mode**.

---

## 2. Get Your API Keys

Stripe provides two sets of API keys:
- **Test keys** - For development and testing (start with `sk_test_` and `pk_test_`)
- **Live keys** - For production (start with `sk_live_` and `pk_live_`)

### Get Test Keys (For Development)

1. Log in to https://dashboard.stripe.com
2. Make sure you're in **Test Mode** (toggle in top-right corner should show "Test mode")
3. Go to **Developers** → **API keys**
4. You'll see two keys:
   - **Publishable key** (starts with `pk_test_...`) - Safe to use in frontend
   - **Secret key** (starts with `sk_test_...`) - Keep this secret, backend only!

5. Click "Reveal test key" to see the secret key
6. Copy both keys to your `.env.local`:

```bash
# Backend
STRIPE_ENABLED=true
STRIPE_SECRET_KEY=sk_test_51ABCdefgh1234567890...
STRIPE_PUBLIC_KEY=pk_test_51ABCdefgh1234567890...

# Frontend
VITE_STRIPE_ENABLED=true
VITE_STRIPE_PUBLIC_KEY=pk_test_51ABCdefgh1234567890...
```

### Get Live Keys (For Production)

⚠️ **IMPORTANT:** Live keys require completing business verification first!

1. Complete business verification (see section 3)
2. Toggle to **Live Mode** (top-right corner)
3. Go to **Developers** → **API keys**
4. Copy **Publishable key** (starts with `pk_live_...`)
5. Click "Reveal live key" to see **Secret key** (starts with `sk_live_...`)
6. Add to Vercel environment variables (NEVER commit live keys to git!)

---

## 3. Complete Business Verification (Required for Live Mode)

Before you can accept real payments, Stripe requires business verification.

### What You'll Need

- **Business information:**
  - Business name
  - Business type (Individual, Company, Non-profit, etc.)
  - Business address
  - Industry/category
  - Business description

- **Personal information:**
  - Full legal name
  - Date of birth
  - Address
  - Phone number
  - Last 4 digits of SSN (US) or equivalent ID

- **Bank account information:**
  - Bank account number
  - Routing number
  - Account holder name

### Steps

1. In Stripe Dashboard, click **Finish account setup** banner at top
2. Fill in all required information:
   - **Business details**
   - **Personal details** (for account verification)
   - **Bank account** (for payouts)
   - **Payout schedule** (daily, weekly, monthly)

3. Submit documents if requested:
   - Government ID (passport, driver's license)
   - Business registration documents (if applicable)
   - Proof of address

4. Wait for verification (usually 1-2 business days)
5. Once verified, you can toggle to **Live Mode** and accept real payments!

---

## 4. Configure Payment Settings

### Accepted Payment Methods

By default, Stripe enables **credit and debit cards**. To enable additional methods:

1. Go to **Settings** → **Payment methods**
2. Enable additional methods:
   - ✅ **Cards** (Visa, Mastercard, Amex, Discover) - Always enabled
   - ☑️ **Apple Pay** - Enable for iOS/Safari users
   - ☑️ **Google Pay** - Enable for Android/Chrome users
   - ☑️ **Link** - Stripe's one-click checkout
   - ☑️ **ACH Direct Debit** - Bank transfers (US only)
   - ☑️ **SEPA Direct Debit** - Bank transfers (Europe)

**Recommendation for QuickChat:**
- ✅ **Cards** (required)
- ✅ **Apple Pay** (recommended for better conversion)
- ✅ **Google Pay** (recommended for better conversion)
- ✅ **Link** (recommended for returning customers)

3. Click **Save changes**

### Currency Settings

1. Go to **Settings** → **Account details**
2. Select your **default currency** (e.g., USD)
3. Enable additional currencies if needed (multi-currency support)

**Note:** Currency is set per payment intent in code, so you can accept multiple currencies.

---

## 5. Configure Radar (Fraud Prevention)

Stripe Radar helps prevent fraudulent payments.

### Basic Configuration (Free)

1. Go to **Radar** → **Rules**
2. Default rules are already enabled:
   - Block payments with high risk scores
   - Block payments from countries with high fraud rates
   - Require 3D Secure authentication for risky payments

3. Review and customize rules if needed

### Recommended Rules for QuickChat

```
Block if:
- Risk score > 75
- Card country != Billing country AND Risk score > 50
- Elevated risk from billing country

Allow if:
- Cardholder successfully passed 3D Secure authentication
```

**Custom Rule Example:**
- Block payments from VPN/proxy IP addresses with risk > 60

---

## 6. Configure Email Receipts

Stripe can automatically send email receipts to customers.

### Enable Email Receipts

1. Go to **Settings** → **Email**
2. Under **Customer emails**, enable:
   - ✅ **Successful payments** - Send receipt on payment success
   - ✅ **Refunds** - Send notification on refunds
   - ☑️ **Disputes** - Send notification on chargebacks

3. Customize email template:
   - Add your logo
   - Customize colors
   - Add custom footer text

**Note:** QuickChat already sends custom email notifications via ZeptoMail, so Stripe receipts are optional.

---

## 7. Configure Webhooks (Optional, for Future Use)

Webhooks allow Stripe to notify your server about payment events.

### When You Need Webhooks

- Handling failed payments
- Processing refunds
- Detecting disputes/chargebacks
- Subscription renewals (future feature)

### Setup Webhooks

1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter your endpoint URL:
   - **Test Mode:** `https://your-vercel-app.vercel.app/api/webhooks/stripe`
   - **Live Mode:** `https://yourdomain.com/api/webhooks/stripe`

4. Select events to listen to:
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`
   - ✅ `payment_intent.canceled`
   - ✅ `charge.refunded`
   - ✅ `charge.dispute.created`

5. Click **Add endpoint**

6. Copy the **Signing secret** (starts with `whsec_...`)
7. Add to your environment variables:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

**Note:** Webhook handling is not yet implemented in QuickChat but can be added later.

---

## 8. Test Your Integration

### Using Test Cards

Stripe provides test cards for different scenarios:

#### Successful Payments
```
Card: 4242 4242 4242 4242
Exp: Any future date (e.g., 12/25)
CVC: Any 3 digits (e.g., 123)
ZIP: Any 5 digits (e.g., 12345)
```

#### Declined Payments
```
Card: 4000 0000 0000 0002  (Generic decline)
Card: 4000 0000 0000 9995  (Insufficient funds)
Card: 4000 0000 0000 0069  (Expired card)
```

#### 3D Secure Authentication
```
Card: 4000 0025 0000 3155  (Requires authentication)
Card: 4000 0000 0000 3220  (3DS2 - Authentication required)
```

#### International Cards
```
Card: 4000 0056 6555 1028  (Visa debit - Brazil)
Card: 4000 0840 0000 0001  (Visa - United States)
Card: 4000 0003 6000 0006  (Visa - France)
```

Full list: https://stripe.com/docs/testing#cards

### Test in Dashboard

1. Go to **Payments** (in Test Mode)
2. You should see test payments appear here after testing
3. Click on a payment to see details
4. Try refunding a test payment to verify refund flow

---

## 9. Production Checklist

Before going live with Stripe:

### Account Setup
- [ ] Business verification completed
- [ ] Bank account added for payouts
- [ ] Tax information provided (if required)
- [ ] Business description updated

### Payment Configuration
- [ ] Payment methods enabled (Cards, Apple Pay, Google Pay)
- [ ] Currency configured
- [ ] Radar fraud rules reviewed
- [ ] Email receipts configured (optional)

### API Keys
- [ ] Live API keys generated
- [ ] Live secret key added to Vercel (NOT git!)
- [ ] Live public key added to Vercel
- [ ] `STRIPE_ENABLED=true` in production

### Testing
- [ ] Tested successful payment with test card
- [ ] Tested declined payment with test card
- [ ] Tested refund flow
- [ ] Verified payment shows in Stripe Dashboard
- [ ] Verified question created in QuickChat

### Legal & Compliance
- [ ] Terms of Service updated (mention Stripe)
- [ ] Privacy Policy updated (mention payment data)
- [ ] Refund policy defined
- [ ] Dispute handling process defined

---

## 10. Switching to Live Mode

### Step 1: Verify Account is Ready

1. In Stripe Dashboard, check for any warnings/alerts
2. Ensure "Finish account setup" banner is gone
3. Verify bank account is connected

### Step 2: Get Live API Keys

1. Toggle to **Live Mode** (top-right)
2. Go to **Developers** → **API keys**
3. Copy **Publishable key** (`pk_live_...`)
4. Reveal and copy **Secret key** (`sk_live_...`)

### Step 3: Update Environment Variables

**In Vercel Dashboard:**
1. Go to your project → **Settings** → **Environment Variables**
2. Update or add:
   ```
   STRIPE_ENABLED=true
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_PUBLIC_KEY=pk_live_...
   VITE_STRIPE_ENABLED=true
   VITE_STRIPE_PUBLIC_KEY=pk_live_...
   ```
3. Select environment: **Production**
4. Save

### Step 4: Redeploy

```bash
npm run vercel:deploy
```

### Step 5: Test Live Payment

⚠️ **Use a real card for this test** (you'll charge yourself)

1. Submit a test question with minimum amount
2. Use your own card
3. Verify payment succeeds
4. Check Stripe Dashboard → Payments (Live Mode)
5. Refund the test payment

**You're now live!** 🎉

---

## 11. Monitoring & Analytics

### View Payments

1. Go to **Payments** in Stripe Dashboard
2. Filter by:
   - Date range
   - Status (Succeeded, Failed, Refunded)
   - Amount range
   - Customer email

### View Analytics

1. Go to **Home** for overview dashboard
2. Key metrics:
   - **Gross volume** - Total payment amount
   - **Net volume** - After refunds and disputes
   - **Success rate** - % of successful payments
   - **Fee breakdown** - Stripe fees charged

### Export Data

1. Go to **Payments** or **Balance**
2. Click **Export**
3. Select format (CSV, Excel)
4. Choose date range
5. Download report

---

## 12. Stripe Fees

### Standard Pricing (US)

**Per successful card charge:**
- 2.9% + $0.30 per transaction

**Example:**
- $50 question = $1.75 fee (you receive $48.25)
- $100 question = $3.20 fee (you receive $96.80)

**Additional fees:**
- International cards: +1.5%
- Currency conversion: +1%
- Disputes: $15 per dispute (refunded if you win)

**No monthly fees, no setup fees, no hidden costs.**

### Optimizing Fees

1. **Encourage domestic cards** - Lower fees
2. **Use Link** - Stripe's one-click checkout (no extra fees)
3. **Set minimum amounts** - $10+ to reduce % impact
4. **Reduce disputes** - Clear policies and good customer service

### Calculate Net Revenue

```javascript
// Gross amount: $100
const grossAmount = 100.00;

// Stripe fee: 2.9% + $0.30
const stripeFee = (grossAmount * 0.029) + 0.30;
// = $3.20

// Net amount you receive
const netAmount = grossAmount - stripeFee;
// = $96.80
```

---

## 13. Support & Resources

### Stripe Support

- **Documentation:** https://stripe.com/docs
- **Support:** https://support.stripe.com
- **Status:** https://status.stripe.com
- **API Reference:** https://stripe.com/docs/api

### Testing Tools

- **Test Cards:** https://stripe.com/docs/testing
- **API Logs:** Dashboard → **Developers** → **Logs**
- **Event Inspector:** Dashboard → **Developers** → **Events**

### QuickChat Support

- **Integration Guide:** `/docs/integrations/STRIPE-INTEGRATION.md`
- **Troubleshooting:** See integration guide
- **Two-Tier Pricing Docs:** `/docs/two-tier question model/`

---

## Quick Reference

### API Keys Location
Dashboard → **Developers** → **API keys**

### Test Cards
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

### Fees
2.9% + $0.30 per transaction

### Support
https://support.stripe.com

### Feature Flag
```bash
STRIPE_ENABLED=false  # Testing with mock payments
STRIPE_ENABLED=true   # Real Stripe payments
```

---

**Last Updated:** October 23, 2025
**Questions?** Check https://stripe.com/docs or contact Stripe support
