# Answer System Integration Guide

**Status**: 🟡 Ready for Backend Integration  
**Date**: October 7, 2025

---

## ✅ What's Complete

### Frontend Components
- ✅ **AnswerRecorder.jsx** - Multi-segment recording with concatenation
- ✅ **AnswerReviewModal.jsx** - Upload & submission with progress tracking
- ✅ **AnswerSubmittedModal.jsx** - Success confirmation
- ✅ **AnswerReviewPage.jsx** - Public answer viewing page

### Frontend Hooks
- ✅ **useAnswerUpload.js** - Handles media + attachment uploads and submission

### API Endpoints (Structure Ready)
- ✅ `/api/answer/create` - Creates answer record in Xano
- ✅ `/api/media/get-upload-url` - Already working for video uploads
- ✅ `/api/media/upload-audio` - Already working for audio uploads  
- ✅ `/api/media/upload-attachment` - Already working for file uploads

---

## 🔧 Integration Steps

### Step 1: Add Answer Hook to Your Project

Create the file: `src/hooks/useAnswerUpload.js`

Copy the content from the artifact. This hook:
- Uploads answer media (video/audio)
- Uploads answer attachments
- Creates answer record in database
- Tracks upload progress

### Step 2: Update AnswerReviewModal

Replace your existing `src/components/dashboard/AnswerReviewModal.jsx` with the updated version.

Key changes:
- Imports `useAnswerUpload` hook
- Shows real-time upload progress
- Handles errors gracefully
- Displays upload stages

### Step 3: Add Backend Endpoint

Create file: `api/answer/create.js`

This endpoint:
- Validates answer data
- Creates answer record in Xano
- Returns review URL/token
- (TODO: Sends email notification)

### Step 4: Update Dashboard Integration

In your expert dashboard where you use AnswerRecorder:

```javascript
import { useState } from 'react';
import AnswerRecorder from '@/components/dashboard/AnswerRecorder';
import AnswerReviewModal from '@/components/dashboard/AnswerReviewModal';

function ExpertDashboard() {
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [answerData, setAnswerData] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const handleAnswerReady = (data) => {
    setAnswerData(data);
    setShowReviewModal(true);
  };

  const handleAnswerEdit = () => {
    setShowReviewModal(false);
    // Keep answerData so user can continue editing
  };

  const handleAnswerSuccess = (result) => {
    console.log('Answer submitted:', result);
    // Refresh question list
    // Remove question from pending
    setSelectedQuestion(null);
    setAnswerData(null);
  };

  return (
    <div>
      {selectedQuestion && !showReviewModal && (
        <AnswerRecorder
          question={selectedQuestion}
          onReady={handleAnswerReady}
          onCancel={() => setSelectedQuestion(null)}
        />
      )}

      <AnswerReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        answerData={answerData}
        question={selectedQuestion}
        onEdit={handleAnswerEdit}
        onSubmitSuccess={handleAnswerSuccess}
      />
    </div>
  );
}
```

---

## 🗄️ Xano Database Setup

### Create `answers` Table

You need to create an `answers` table in Xano with these fields:

| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| `id` | Integer (Auto-increment) | ✅ | Primary key |
| `question_id` | Integer (Foreign Key) | ✅ | Links to questions table |
| `expert_id` | Integer (Foreign Key) | ✅ | Expert who answered |
| `text_response` | Text | ❌ | Written answer text |
| `media_uid` | Text | ❌ | Cloudflare Stream/R2 UID |
| `media_url` | Text | ❌ | Full playback URL |
| `media_duration` | Integer | ❌ | Duration in seconds |
| `media_type` | Text | ❌ | 'video' or 'audio' |
| `attachments` | JSON | ❌ | Array of attachment objects |
| `status` | Text | ✅ | 'submitted', 'viewed', etc. |
| `view_count` | Integer | ✅ | Number of times viewed |
| `rating` | Integer | ❌ | 1-5 star rating from asker |
| `feedback_text` | Text | ❌ | Feedback from asker |
| `created_at` | Timestamp | ✅ | Auto-generated |
| `updated_at` | Timestamp | ✅ | Auto-updated |

### Xano Endpoint: `/answer` (POST)

Create an "Add Record" endpoint in Xano:

**Endpoint**: `POST /answer`

**Authentication**: API key required

**Inputs**:
```json
{
  "question_id": 123,
  "text_response": "Your answer text...",
  "media_uid": "abc123xyz",
  "media_url": "https://...",
  "media_duration": 847,
  "media_type": "video",
  "attachments": "[{\"name\":\"file.pdf\",\"url\":\"...\"}]",
  "status": "submitted"
}
```

**Response**:
```json
{
  "id": 456,
  "question_id": 123,
  "status": "submitted",
  "created_at": 1696723456789
}
```

### Additional Xano Endpoints Needed

#### 1. Get Answer by Review Token
`GET /answer/by-token/{token}`

Returns answer data for the public review page.

#### 2. Submit Feedback
`POST /answer/{id}/feedback`

Allows askers to rate and leave feedback.

#### 3. Update Question Status
`PATCH /question/{id}/status`

Mark question as 'answered' when answer is submitted.

---

## 🚀 Upload Flow Diagram

```
User Records Answer in AnswerRecorder
         ↓
User Clicks "Review Answer"
         ↓
AnswerReviewModal Opens
         ↓
User Clicks "Submit Answer"
         ↓
┌─────────────────────────────────────┐
│  useAnswerUpload.submitAnswer()     │
│                                     │
│  1. Upload Media                    │
│     ├─ Video → Stream (FormData)    │
│     └─ Audio → R2 (Binary)          │
│                                     │
│  2. Upload Attachments              │
│     └─ Files → R2 (Base64)          │
│                                     │
│  3. Create Answer Record            │
│     └─ POST /api/answer/create      │
│        └─ Xano: POST /answer        │
└─────────────────────────────────────┘
         ↓
AnswerSubmittedModal Shows Success
         ↓
Email Sent to Asker with Review Link
```

---

## 📧 Email Notification (TODO)

After answer is submitted, send email to question asker:

**Subject**: "Your question has been answered! 🎉"

**Body**:
```
Hi [Asker Name],

Great news! [Expert Name] has answered your question:
"[Question Title]"

View your answer:
[Review Link]

This answer includes:
• Video/Audio response ([duration])
• Written response
• [X] attachments

Please rate and provide feedback after viewing.

Thanks for using QuestionCharge!
```

**Implementation**:
- Use SendGrid, Mailgun, or similar
- Add to `/api/answer/create.js` after answer creation
- Include review token in link

---

## 🔐 Security Considerations

### Review Token System

The review token allows public access to answers. Currently using simple implementation:

```javascript
function generateReviewToken(answerId) {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${random}-${answerId}`;
}
```

**For Production**:
1. Use `crypto.randomBytes(32).toString('hex')`
2. Store tokens in `answer_review_tokens` table
3. Add expiration dates (e.g., 30 days)
4. Validate tokens on each request

### Rate Limiting

Add rate limiting to prevent abuse:
- Max 10 answer submissions per expert per hour
- Max 1000 answer views per token per day

---

## 🧪 Testing Checklist

### Video Answer
- [ ] Record 2-3 video segments
- [ ] Segments concatenate successfully
- [ ] Upload to Stream completes
- [ ] Answer creates in database
- [ ] Review page shows video player
- [ ] Video playback works

### Audio Answer
- [ ] Record 2-3 audio segments
- [ ] Segments concatenate successfully
- [ ] Upload to R2 completes
- [ ] Answer creates in database
- [ ] Review page shows audio player
- [ ] Audio playback works

### Text + Attachments
- [ ] Submit answer with text only
- [ ] Submit answer with attachments
- [ ] Attachments upload to R2
- [ ] Review page shows attachments
- [ ] Attachment downloads work

### Mixed Answer
- [ ] Submit video + text + attachments
- [ ] All components upload successfully
- [ ] Review page shows all elements
- [ ] Everything renders correctly

### Error Handling
- [ ] Media upload fails → shows error
- [ ] Attachment upload fails → continues
- [ ] Database creation fails → shows error
- [ ] Retry works after failure

---

## 🐛 Known Issues & Limitations

### 1. Duration Calculation
**Issue**: Some concatenated videos may not have accurate duration metadata.

**Workaround**: Frontend calculates duration from segments and passes to backend.

**Fix**: Use FFmpeg to re-encode concatenated video with proper metadata.

### 2. Large File Uploads
**Issue**: Vercel has 60-second function timeout, files >50MB may timeout.

**Workaround**: Client-side compression before upload.

**Fix**: Implement chunked upload for large files.

### 3. No Upload Progress
**Issue**: Using `fetch()` doesn't provide upload progress events.

**Workaround**: Show stage-based progress (media → attachments → submitting).

**Fix**: Switch to XMLHttpRequest for real progress tracking.

### 4. Review Token Storage
**Issue**: Tokens are generated but not stored in database.

**Workaround**: Token includes answer ID for lookup.

**Fix**: Create `answer_review_tokens` table in Xano.

---

## 📊 Analytics & Metrics

Track these metrics for answers:

### Engagement Metrics
- Answer submission rate
- Average time to answer
- Completion rate (started vs submitted)
- View count per answer

### Quality Metrics
- Average rating
- Feedback response rate
- Media vs text-only answers
- Average answer length

### Technical Metrics
- Upload success rate
- Upload duration (by type)
- Error rate by stage
- Retry rate

---

## 🔮 Future Enhancements

### Phase 2
- [ ] Real-time upload progress bars
- [ ] Video thumbnails for answers
- [ ] Answer editing (within 5 minutes)
- [ ] Draft answers (save and continue later)

### Phase 3
- [ ] AI-powered answer quality suggestions
- [ ] Automatic transcription for video/audio
- [ ] Answer templates for common questions
- [ ] Batch answer submission

### Phase 4
- [ ] Live answer sessions (video calls)
- [ ] Screen annotation tools
- [ ] Answer revisions based on feedback
- [ ] Answer marketplace (resell answers)

---

## 🆘 Troubleshooting

### "Upload failed" Error
**Check**:
1. Environment variables are set (Cloudflare credentials)
2. Network inspector for actual error message
3. Console logs for detailed error info
4. Cloudflare dashboard for quota/limits

### Video Not Playing on Review Page
**Check**:
1. `media_url` is correct format
2. Stream video is done processing (can take 1-2 min)
3. Browser supports WebM/HLS playback
4. No CORS issues (check `allowedOrigins`)

### Answer Not Creating in Database
**Check**:
1. Xano endpoint exists and is public
2. `XANO_BASE_URL` and `XANO_API_KEY` are set
3. Question ID exists and is valid
4. Required fields are being sent

### Email Not Sending
**Check**:
1. Email service is configured
2. API keys are valid
3. Email function is uncommented
4. Check email service logs

---

## 📞 Support

For questions or issues:
1. Check console logs for detailed errors
2. Review network tab for failed requests
3. Verify environment variables
4. Check Xano logs for database issues

---

## ✅ Pre-Launch Checklist

Before going live:

### Code
- [ ] All TODOs in code are addressed
- [ ] Error handling is comprehensive
- [ ] Console logs are cleaned up (or behind debug flag)
- [ ] Loading states are user-friendly

### Backend
- [ ] Xano endpoints are created and tested
- [ ] Database schema is finalized
- [ ] API authentication is working
- [ ] Rate limiting is in place

### Infrastructure
- [ ] Environment variables are set in Vercel
- [ ] Cloudflare quotas are sufficient
- [ ] Email service is configured
- [ ] CDN/caching is optimized

### Testing
- [ ] All test cases pass
- [ ] Load testing completed
- [ ] Security audit done
- [ ] Mobile experience verified

### Documentation
- [ ] API documentation updated
- [ ] User guides created
- [ ] Expert onboarding flow documented
- [ ] Support processes defined

---

**Last Updated**: October 7, 2025  
**Version**: 1.0  
**Status**: Ready for Xano Integration