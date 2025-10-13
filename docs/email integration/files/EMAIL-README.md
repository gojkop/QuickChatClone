# Email Templates & Service

Professional email templates for your Q&A platform with ZeptoMail integration.

## 📧 Available Templates

1. **`email-template-signin.html`** - Magic link authentication email
2. **`email-template-question-created.html`** - Confirmation when user submits a question
3. **`email-template-answer-received.html`** - Notification when expert answers
4. **`email-template-expert-new-question.html`** - Expert notification for new questions

## 🚀 Quick Start

### 1. Setup ZeptoMail

1. Sign up at [ZeptoMail](https://www.zoho.com/zeptomail/)
2. Get your API key from the ZeptoMail dashboard
3. Set up domain verification and DKIM/SPF records

### 2. Configure Environment Variables

Create a `.env` file:

```bash
# ZeptoMail Configuration
ZEPTOMAIL_API_KEY=your_api_key_here
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=Your Platform Name
BASE_URL=https://yourdomain.com

# Optional
NODE_ENV=production
```

### 3. Install Dependencies

```bash
npm install
# No external dependencies needed for basic implementation
# For production, consider: npm install handlebars
```

### 4. File Structure

Organize your files like this:

```
project/
├── src/
│   ├── services/
│   │   └── emailService.js
│   └── templates/
│       └── emails/
│           ├── signin.html
│           ├── question-created.html
│           ├── answer-received.html
│           └── expert-new-question.html
├── examples/
│   └── emailExamples.js
└── .env
```

### 5. Copy Template Files

Rename the template files:
- `email-template-signin.html` → `signin.html`
- `email-template-question-created.html` → `question-created.html`
- `email-template-answer-received.html` → `answer-received.html`
- `email-template-expert-new-question.html` → `expert-new-question.html`

## 💻 Usage Examples

### Send Sign-In Email

```javascript
const emailService = require('./src/services/emailService');

await emailService.sendSignInEmail(
  'user@example.com',
  'https://yourdomain.com/auth/verify?token=abc123'
);
```

### Send Question Created Confirmation

```javascript
const question = {
  id: 'q_12345',
  expertHandle: 'gojko',
  title: 'How do I implement progressive upload?',
  text: 'Additional context here...',
  payerEmail: 'asker@example.com',
  recordingUid: 'rec_abc123', // optional
  recordingMode: 'video', // optional
  recordingDuration: 45, // optional
  attachments: [], // optional
  createdAt: new Date()
};

await emailService.sendQuestionCreatedEmail(question);
```

### Send Answer Notification

```javascript
const answer = {
  text: 'Your answer text here...',
  recordingUid: 'rec_xyz789', // optional
  recordingMode: 'video', // optional
  recordingDuration: 180, // optional
  attachments: [], // optional
  createdAt: new Date()
};

await emailService.sendAnswerReceivedEmail(question, answer);
```

### Notify Expert of New Question

```javascript
const expert = {
  handle: 'gojko',
  name: 'Gojko Adzic',
  email: 'expert@example.com',
  stats: { pending: 3, answered: 127 } // optional
};

await emailService.sendExpertNewQuestionEmail(expert, question);
```

## 🎨 Customizing Templates

### Template Variables

Templates use Mustache-style syntax:
- `{{VARIABLE_NAME}}` - Simple variable replacement
- `{{#if CONDITION}}...{{/if}}` - Conditional blocks

### Available Variables

**Sign-In Template:**
- `SIGNIN_LINK` - Magic link URL
- `CURRENT_YEAR` - Current year
- `PLATFORM_NAME` - Your platform name

**Question Created Template:**
- `PAYER_NAME` - User's name
- `EXPERT_NAME` - Expert's handle
- `QUESTION_TITLE` - Question title
- `QUESTION_TEXT` - Question details
- `QUESTION_ID` - Unique question ID
- `QUESTION_URL` - Link to question
- `HAS_RECORDING` - Boolean for recording presence
- `IS_VIDEO` - Boolean for video vs audio
- `RECORDING_DURATION` - Duration in seconds
- `HAS_ATTACHMENTS` - Boolean for attachments
- `ATTACHMENT_COUNT` - Number of attachments

**Answer Received Template:**
- All question variables plus:
- `ANSWER_TEXT_PREVIEW` - First 300 chars of answer
- `ANSWER_IS_TRUNCATED` - Boolean if answer is longer
- `HAS_ANSWER_RECORDING` - Boolean
- `ANSWER_RECORDING_DURATION` - Duration
- `HAS_ANSWER_ATTACHMENTS` - Boolean
- `ANSWER_DATE` - Formatted date

### Styling

Templates use inline CSS for maximum email client compatibility. Key features:
- Mobile responsive (600px max width)
- Dark mode compatible colors
- Accessible contrast ratios
- Clean, modern design

## 🔧 Integration with Your API Routes

### Example: Question Creation Route

```javascript
// api/questions/create.js
const emailService = require('../services/emailService');

exports.handler = async (req, res) => {
  try {
    // 1. Create question in database
    const question = await db.questions.create(req.body);
    
    // 2. Send confirmation to user
    await emailService.sendQuestionCreatedEmail(question);
    
    // 3. Notify expert
    const expert = await db.experts.findOne({ handle: question.expertHandle });
    await emailService.sendExpertNewQuestionEmail(expert, question);
    
    res.json({ success: true, data: question });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
};
```

## 🧪 Testing

### Test with Example Script

```bash
node examples/emailExamples.js
```

### Test Individual Templates

```javascript
const emailService = require('./src/services/emailService');

// Test template rendering without sending
async function testTemplate() {
  const html = await emailService.loadTemplate('signin', {
    SIGNIN_LINK: 'https://example.com/test',
    CURRENT_YEAR: '2025',
    PLATFORM_NAME: 'Test Platform'
  });
  
  console.log(html);
}
```

## 📱 Email Client Compatibility

Templates tested and working in:
- ✅ Gmail (Web, iOS, Android)
- ✅ Apple Mail (macOS, iOS)
- ✅ Outlook (Web, Desktop, Mobile)
- ✅ Yahoo Mail
- ✅ ProtonMail
- ✅ Thunderbird

## 🔐 Security Best Practices

1. **Never expose API keys** - Use environment variables
2. **Validate email addresses** - Use proper email validation
3. **Rate limit** - Prevent email spam
4. **Magic link expiry** - Set short expiration (15 mins recommended)
5. **One-time use** - Invalidate tokens after use

## 🎯 Performance Tips

1. **Pre-compile templates** - Load templates once at startup
2. **Queue emails** - Use job queue for high volume (Bull, BullMQ)
3. **Batch sends** - Use ZeptoMail batch API for multiple recipients
4. **Cache rendered templates** - For frequently sent emails

## 🐛 Troubleshooting

### Emails not sending

1. Check API key is correct
2. Verify domain is verified in ZeptoMail
3. Check DKIM/SPF records are set up
4. Review ZeptoMail logs for errors

### Template variables not replacing

1. Ensure variable names match exactly (case-sensitive)
2. Check template file path is correct
3. Verify variables object has the required keys

### Styling issues

1. Use inline CSS only
2. Test in multiple email clients
3. Avoid complex CSS (flexbox, grid)
4. Use table layouts for structure

## 📚 Additional Resources

- [ZeptoMail API Documentation](https://www.zoho.com/zeptomail/help/api/)
- [Email Template Best Practices](https://www.campaignmonitor.com/resources/guides/email-design/)
- [HTML Email Development Guide](https://templates.mailchimp.com/development/)

## 📄 License

MIT License - Feel free to customize for your project!

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section
2. Review ZeptoMail documentation
3. Open an issue in your project repo
