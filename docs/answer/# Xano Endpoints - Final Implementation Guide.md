# Final Implementation Steps

Everything is ready! Here's what to do in Xano to complete the answer system.

---

## ✅ Step 1: Update Database (2 minutes)

Add these 6 columns to the `answer` table:

```sql
ALTER TABLE answer ADD COLUMN text_response TEXT;
ALTER TABLE answer ADD COLUMN attachments TEXT;
ALTER TABLE answer ADD COLUMN view_count INT DEFAULT 0;
ALTER TABLE answer ADD COLUMN rating INT;
ALTER TABLE answer ADD COLUMN feedback_text TEXT;
ALTER TABLE answer ADD COLUMN feedback_at BIGINT;
```

**That's it for database!** No indexes needed since we're using the question's token.

---

## ✅ Step 2: Update Existing `/review/{token}` Endpoint (5 minutes)

Your existing endpoint already returns question + answer. Just enhance it to include answer's new fields and media.

### Current Function Stack
```
1. Get Record From question (where playback_token_hash = {token})
2. Query All Records From media_asset
3. Query All Records From answer
4. Get Record From expert_profile
5. Get Record From user
```

### Add These Steps

**After step 3 (Query answer):**

```
3a. IF answer exists THEN
      // Parse attachments JSON
      IF answer.attachments THEN
        var.answer_attachments = JSON.parse(answer.attachments)
      ELSE
        var.answer_attachments = []
      END IF
      
      // Get answer's media asset if it has one
      IF answer.media_asset_id THEN
        var.answer_media = Query media_asset WHERE id = answer.media_asset_id
      ELSE
        var.answer_media = null
      END IF
      
      // Increment view count
      UPDATE answer SET view_count = view_count + 1
      WHERE id = answer.id
    END IF
```

**In Response (step 6), enhance the answer object:**

```json
{
  "user": {...},
  "expert_profile": {...},
  "question": {...},
  "media_asset": {...},
  "answer": {
    "id": answer.id,
    "created_at": answer.created_at,
    "sent_at": answer.sent_at,
    "text_response": answer.text_response,
    "attachments": var.answer_attachments,
    "media": var.answer_media,
    "view_count": answer.view_count,
    "rating": answer.rating,
    "feedback_text": answer.feedback_text,
    "feedback_at": answer.feedback_at
  }
}
```

---

## ✅ Step 3: Create `POST /review/{token}/feedback` (10 minutes)

New endpoint for submitting feedback.

### Endpoint Setup
- **Method**: POST
- **Path**: `/review/{token}/feedback`
- **Authentication**: None (public)
- **Input param**: `token` (text, from URL)
- **Body params**: `rating` (int), `feedback_text` (text, optional)

### Function Stack

```
1. Get Record From question
   WHERE playback_token_hash = {token}
   IF not found THEN
     RETURN 404 error "Question not found"
   END IF

2. Query answer
   WHERE question_id = question.id
   IF not found THEN
     RETURN 404 error "No answer exists for this question"
   END IF

3. Validate Rating
   IF input.rating < 1 OR input.rating > 5 THEN
     RETURN 400 error "Rating must be between 1 and 5"
   END IF

4. Check Already Rated
   IF answer.feedback_at IS NOT NULL THEN
     RETURN 400 error "Feedback already submitted for this answer"
   END IF

5. Update answer record
   SET rating = input.rating
   SET feedback_text = input.feedback_text (can be null)
   SET feedback_at = Date.now()
   WHERE id = answer.id

6. (Optional) Notify Expert
   // TODO: Send email to expert about feedback
   // Get expert.email from user table
   // Send notification

7. Response
   RETURN {
     "success": true,
     "message": "Feedback submitted successfully"
   }
```

---

## ✅ Step 4: Update `POST /answer` Endpoint (15 minutes)

This endpoint now handles EVERYTHING - creating media_asset AND answer in one call.

### Input Parameters

| Name | Type | Required | Notes |
|------|------|----------|-------|
| question_id | int | Yes | Question being answered |
| user_id | int | Yes | Expert's user ID |
| text_response | text | No | Written answer |
| attachments | text | No | JSON string of files |
| media_asset_id | text | No | Cloudflare UID |
| media_url | text | No | Playback URL |
| media_duration | int | No | Duration in seconds |
| media_type | text | No | 'video' or 'audio' |
| media_size | int | No | File size in bytes |
| media_provider | text | No | 'cloudflare_stream' or 'cloudflare_r2' |

### Function Stack

```
1. Validate Input
   IF !input.media_asset_id AND !input.text_response THEN
     RETURN 400 error "Answer must include media or text"
   END IF

2. Get question record
   var.question = Query question WHERE id = input.question_id
   IF !var.question THEN
     RETURN 404 error "Question not found"
   END IF
   IF var.question.answered_at IS NOT NULL THEN
     RETURN 400 error "Question already answered"
   END IF

3. Create media_asset record (if media provided)
   var.media_asset_id = null
   
   IF input.media_asset_id THEN
     // Create media_asset record
     var.new_media = Add Record to media_asset
       owner_type: "answer"
       owner_id: null  // Will be updated in step 6
       provider: input.media_provider
       asset_id: input.media_asset_id
       duration_sec: input.media_duration
       status: "ready"
       url: input.media_url
       metadata: {
         "type": input.media_type,
         "size": input.media_size
       }
       segment_index: null
       created_at: Date.now()
     
     var.media_asset_id = var.new_media.id
   END IF

4. Add Record to answer table
   var.created_answer = Add Record to answer
     question_id: input.question_id
     user_id: input.user_id
     media_asset_id: var.media_asset_id (can be null)
     text_response: input.text_response || ""
     attachments: input.attachments (can be null)
     view_count: 0
     rating: null
     feedback_text: null
     feedback_at: null
     created_at: Date.now()
     sent_at: Date.now()

5. Update question record
   UPDATE question
   SET status = "answered"
   SET answered_at = Date.now()
   WHERE id = input.question_id

6. Update media_asset owner (if created)
   IF var.media_asset_id THEN
     UPDATE media_asset
     SET owner_id = var.created_answer.id
     WHERE id = var.media_asset_id
   END IF

7. Send Email Notification
   // Email to: var.question.payer_email
   // Subject: "🎉 Your question has been answered!"
   // Body: Include link to /r/{var.question.playback_token_hash}
   
8. Response
   RETURN {
     "id": var.created_answer.id,
     "question_id": var.created_answer.question_id,
     "playback_token_hash": var.question.playback_token_hash,
     "created_at": var.created_answer.created_at,
     "sent_at": var.created_answer.sent_at
   }
```

---

## ✅ Step 5: Test Everything (10 minutes)

You don't need a separate `/media_asset` endpoint! The `POST /answer` endpoint handles it all.

### Testing Sequence

```bash
curl -X POST {XANO_URL}/answer \
  -H "Authorization: Bearer YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "question_id": 1,
    "user_id": 1,
    "media_asset_id": 5,
    "text_response": "Test answer"
  }'
```

Expected: Returns answer + playback_token_hash

### 3. Test Answer Viewing (Public)

```bash
curl {XANO_URL}/review/{playback_token_hash}
```

Expected: Returns question + answer with all fields

### 4. Test Feedback Submission (Public)

```bash
curl -X POST {XANO_URL}/review/{playback_token_hash}/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 5,
    "feedback_text": "Great answer!"
  }'
```

Expected: Returns success message

### 5. View Again (Check Feedback)

```bash
curl {XANO_URL}/review/{playback_token_hash}
```

Expected: Answer now has rating and feedback_text

---

## 📋 Checklist Before Going Live

### Database
- [ ] 6 columns added to `answer` table
- [ ] Test data inserted successfully

### Xano Endpoints
- [ ] `/review/{token}` returns enhanced answer object
- [ ] `/review/{token}/feedback` created and working
- [ ] `/answer` (POST) creates media_asset internally and returns playback_token_hash

### Testing
- [ ] Can create answer with video media
- [ ] Can create answer with audio media
- [ ] Can create answer with just text
- [ ] Can view answer publicly (no auth)
- [ ] Can submit feedback publicly (no auth)
- [ ] Feedback appears when viewing again
- [ ] media_asset record is created automatically
- [ ] media_asset.owner_id gets updated to answer.id
- [ ] question.status changes to "answered"
- [ ] question.answered_at gets set

### Frontend
- [ ] All files updated (already done!)
- [ ] Environment variables set in Vercel
- [ ] Test on staging/dev environment
- [ ] Test full flow: record → upload → submit → view

### Email (Optional - Can Add Later)
- [ ] Email sent when answer created
- [ ] Email sent when feedback received
- [ ] Review link in email works

---

## 🎯 What Happens After Implementation

**Simplified Flow - Only One Backend Call!**

1. **Expert records answer** in AnswerRecorder (frontend)
2. **Frontend concatenates segments** into one file
3. **Frontend uploads to Cloudflare** (Stream for video, R2 for audio)
4. **Frontend calls POST /answer** with media info + text + attachments
5. **Xano creates media_asset** record internally
6. **Xano creates answer** record with media_asset_id
7. **Xano updates** question status and media_asset.owner_id
8. **Xano returns** playback_token_hash
9. **Frontend shows success** modal with review link
10. **Asker receives email** with link to `/r/{playback_token_hash}`
11. **Asker views answer** at public review page
12. **Asker submits feedback** (rating + text)
13. **Expert sees feedback** in their dashboard

---

## 🚨 Common Issues & Solutions

### "Question already answered"
- Check question.answered_at is null before creating answer
- Or allow multiple answers per question (your choice)

### "Media asset owner_id not updating"
- Ensure step 5 in POST /answer function stack runs
- Check media_asset_id exists before updating

### "Review link doesn't work"
- Verify playback_token_hash is returned in POST /answer response
- Check frontend uses correct URL format: `/r/{token}`

### "Feedback already submitted"
- Check answer.feedback_at is null before allowing update
- Or allow updating feedback (remove that check)

---

## ✅ You're Ready!

All frontend code is updated and ready. Once you complete these 4 Xano steps, the entire answer system will work end-to-end!

**Estimated Time**: 25-35 minutes for all Xano changes

**Next Steps**:
1. Add database columns (2 min)
2. Update `/review/{token}` endpoint (5 min)
3. Create `/review/{token}/feedback` endpoint (10 min)
4. Update `/answer` endpoint to create media_asset (15 min)
5. Test everything (10 min)

Then you're live! 🚀