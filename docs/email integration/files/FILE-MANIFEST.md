# Email Templates Package - File Manifest

## 📦 Package Contents

### 📧 HTML Email Templates (4 files)

1. **email-template-signin.html**
   - Magic link authentication email
   - Clean, secure design with expiration warning
   - Mobile responsive

2. **email-template-question-created.html**
   - User confirmation after submitting a question
   - Shows question details, recording info, attachments
   - Includes "what happens next" information

3. **email-template-answer-received.html**
   - Notifies user when expert answers their question
   - Shows question + answer preview
   - Highlights video/audio responses and attachments

4. **email-template-expert-new-question.html**
   - Alerts expert about new incoming questions
   - Shows full question details and asker info
   - Includes quick stats (optional)

### 💻 Service Files (3 files)

5. **emailService.js**
   - Main email service class
   - Handles ZeptoMail API integration
   - Template loading and variable replacement
   - Methods for each email type

6. **emailExamples.js**
   - Working examples for each email type
   - Copy-paste ready code snippets
   - Great for testing

7. **plaintext.js**
   - Plain text versions of all templates
   - Fallback for email clients that don't support HTML
   - Automatically used by emailService

### 📝 Documentation (2 files)

8. **EMAIL-README.md**
   - Complete setup guide
   - Usage examples
   - Troubleshooting
   - Best practices

9. **FILE-MANIFEST.md** (this file)
   - Quick reference
   - File descriptions

### ⚙️ Configuration (2 files)

10. **.env.example**
    - Template for environment variables
    - Copy to `.env` and customize

11. **setup-email-templates.sh**
    - Automated setup script
    - Organizes files in proper structure
    - Makes setup a breeze

---

## 🚀 Quick Start (3 Steps)

### Step 1: Setup Files
```bash
chmod +x setup-email-templates.sh
./setup-email-templates.sh
```

### Step 2: Configure Environment
```bash
cp .env.example .env
# Edit .env with your ZeptoMail API key
```

### Step 3: Test It
```bash
node examples/emailExamples.js
```

---

## 📁 Recommended File Structure

After running setup script:

```
your-project/
├── src/
│   ├── services/
│   │   └── emailService.js          ← Email service
│   └── templates/
│       └── emails/
│           ├── signin.html          ← Templates (renamed)
│           ├── question-created.html
│           ├── answer-received.html
│           ├── expert-new-question.html
│           └── plaintext.js         ← Plain text versions
├── examples/
│   └── emailExamples.js             ← Test examples
├── .env                              ← Your config (gitignored)
├── .env.example                      ← Template config
└── EMAIL-README.md                   ← Full documentation
```

---

## 🎯 Common Tasks

### Send a Sign-In Email
```javascript
const emailService = require('./src/services/emailService');
await emailService.sendSignInEmail(email, magicLink);
```

### Send Question Confirmation
```javascript
await emailService.sendQuestionCreatedEmail(questionObject);
```

### Notify User of Answer
```javascript
await emailService.sendAnswerReceivedEmail(questionObject, answerObject);
```

### Alert Expert of New Question
```javascript
await emailService.sendExpertNewQuestionEmail(expertObject, questionObject);
```

---

## 🔑 Required Environment Variables

```bash
ZEPTOMAIL_API_KEY=your_key        # Get from ZeptoMail dashboard
FROM_EMAIL=noreply@yourdomain.com # Must be verified in ZeptoMail
FROM_NAME=Your Platform Name      # Display name
BASE_URL=https://yourdomain.com   # Your app URL
```

---

## ✅ Checklist

Before going live:

- [ ] ZeptoMail account created
- [ ] Domain verified in ZeptoMail
- [ ] DKIM record added to DNS (TXT record)
- [ ] SPF record added to DNS (TXT record)
- [ ] API key added to `.env`
- [ ] Templates customized with your branding
- [ ] Test emails sent successfully
- [ ] Plain text versions reviewed
- [ ] Error handling implemented
- [ ] Rate limiting configured

---

## 🎨 Customization Tips

1. **Colors**: Search for hex codes in HTML templates and replace
2. **Fonts**: Update `font-family` in inline styles
3. **Logo**: Add `<img>` tag in header section
4. **Footer**: Update copyright and links in footer `<td>`
5. **Content**: Modify copy while keeping structure

---

## 📱 Template Features

All templates include:
- ✅ Mobile responsive design
- ✅ Dark mode compatible
- ✅ Inline CSS for compatibility
- ✅ Accessible color contrast
- ✅ Plain text fallback
- ✅ Professional styling
- ✅ Call-to-action buttons
- ✅ Security notices (where relevant)

---

## 🆘 Need Help?

1. Read `EMAIL-README.md` for detailed documentation
2. Check `emailExamples.js` for working code
3. Review ZeptoMail API docs
4. Test with different email clients

---

## 📊 Testing Checklist

Test in these email clients:
- [ ] Gmail (Web)
- [ ] Gmail (Mobile)
- [ ] Apple Mail (iOS)
- [ ] Outlook (Web)
- [ ] Outlook (Desktop)
- [ ] Yahoo Mail

---

## 🔒 Security Notes

- Never commit `.env` file
- Use short-lived magic links (15 min)
- Implement rate limiting
- Validate all email addresses
- Log email sending for audit trail

---

## 📈 Production Tips

- Use email queue (Bull/BullMQ) for high volume
- Cache compiled templates
- Monitor ZeptoMail sending limits
- Set up webhook for delivery tracking
- Implement retry logic for failures

---

Made with ❤️ for your Q&A platform
