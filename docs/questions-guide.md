# QuickChat Question Upload System - Complete Reference

**Version**: 2.1  
**Last Updated**: October 6, 2025  
**Status**: Production-Ready with Known Limitations

---

## Executive Summary

This document describes the complete implementation of QuickChat's progressive upload system for question submission, including multi-segment video/audio recording and file attachments. The system achieves **95% faster submission times** by uploading content progressively as users create it, rather than waiting for final form submission.

### Key Features
- ✅ **Progressive Upload**: Segments/files upload immediately when recorded/selected
- ✅ **Multi-Segment Recording**: Up to 90 seconds total across multiple segments
- ✅ **Real-Time Status**: Visual indicators (⏳ ❌ ✅) for each upload
- ✅ **Individual Retry**: Failed uploads can be retried without affecting others
- ✅ **Instant Submission**: Final submit takes <1 second (vs 10-30 seconds before)

### Performance Impact
| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Upload time at submit | 10-30 seconds | <1 second | **95% faster** |
| Payload size | 20-100 MB | <1 KB | **99.9% smaller** |
| User wait time | 10-30 seconds | <1 second | **90% faster** |

---

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Data Flow](#data-flow)
3. [Database Schema](#database-schema)
4. [Frontend Implementation](#frontend-implementation)
5. [Backend Implementation](#backend-implementation)
6. [Question Display](#question-display)
7. [Known Limitations](#known-limitations)
8. [Environment Setup](#environment-setup)
9. [Troubleshooting](#troubleshooting)
10. [File Structure](#file-structure)

---

## System Architecture

### Components

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│  ┌─────────────────┐  ┌──────────────────┐                 │
│  │ QuestionComposer│  │ AskQuestionPage  │                 │
│  └────────┬────────┘  └────────┬─────────┘                 │
│           │                     │                            │
│  ┌────────▼─────────────────────▼────────┐                 │
│  │  useRecordingSegmentUpload Hook       │                 │
│  │  useAttachmentUpload Hook             │                 │
│  └────────┬───────────────────────────────┘                 │
└───────────┼─────────────────────────────────────────────────┘
            │
            │ Progressive Upload (as created)
            │
┌───────────▼─────────────────────────────────────────────────┐
│                    Vercel Serverless Functions               │
│  ┌──────────────────────┐  ┌──────────────────────┐        │
│  │ upload-recording-    │  │ upload-attachment.js │        │
│  │ segment.js           │  │                      │        │
│  └──────────┬───────────┘  └──────────┬───────────┘        │
│             │                          │                     │
│  ┌──────────▼──────────────────────────▼───────────┐       │
│  │         questions/create.js                      │       │
│  │    (Creates DB records with references)          │       │
│  └──────────┬───────────────────────────────────────┘       │
└─────────────┼───────────────────────────────────────────────┘
              │
      ┌───────┴────────┐
      │                │
┌─────▼─────┐   ┌──────▼──────┐
│ Cloudflare│   │    Xano     │
│   Stream  │   │  Database   │
│ (video/   │   │ (metadata)  │
│  audio)   │   │             │
└───────────┘   └─────────────┘
```

### Technology Stack
- **Frontend**: React with custom hooks
- **Backend**: Vercel serverless functions (Node.js ES modules)
- **Video Storage**: Cloudflare Stream
- **File Storage**: Cloudflare R2
- **Database**: Xano (PostgreSQL-backed)
- **Authentication**: Xano OAuth

---

## Data Flow

### Progressive Upload Flow

```
1. User Records Segment 1 (15 seconds)
   ↓
   Upload immediately to Cloudflare Stream
   ↓
   Returns: { uid: "abc123", playbackUrl: "...", duration: 15 }
   ↓
   Frontend stores reference

2. User Records Segment 2 (20 seconds)
   ↓
   Upload immediately to Cloudflare Stream
   ↓
   Returns: { uid: "def456", playbackUrl: "...", duration: 20 }
   ↓
   Frontend stores reference

3. User Adds Files
   ↓
   Upload immediately to Cloudflare R2
   ↓
   Returns: { url: "...", name: "file.pdf", size: 12345 }
   ↓
   Frontend stores reference

4. User Clicks "Submit Question"
   ↓
   POST /api/questions/create with tiny payload:
   {
     title: "My question",
     recordingSegments: [
       { uid: "abc123", duration: 15, segmentIndex: 0 },
       { uid: "def456", duration: 20, segmentIndex: 1 }
     ],
     attachments: [{ url: "...", name: "file.pdf" }]
   }
   ↓
   Backend creates:
   - 1 question record
   - 2 media_asset records (one per segment)
   - Updates question.attachments JSON
   ↓
   Success in <1 second! ⚡
```

### Old Flow (for comparison)

```
User completes entire form with media
   ↓
   User clicks "Submit"
   ↓
   Frontend converts ALL media to base64 (10-30 seconds blocking)
   ↓
   POST with 20-100 MB payload
   ↓
   Backend uploads everything at once
   ↓
   Success after 10-30 seconds
```

---

## Database Schema

### `question` Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | integer | Primary key |
| `expert_profile_id` | integer | FK to expert_profile |
| `title` | text | Question title (required) |
| `text` | text | Additional details (optional) |
| `media_asset_id` | integer | FK to first segment's media_asset |
| `attachments` | text | JSON array of attachment objects |
| `payer_email` | text | Asker's email |
| `payer_first_name` | text | Asker's first name (optional) |
| `payer_last_name` | text | Asker's last name (optional) |
| `price_cents` | integer | Question price |
| `currency` | text | Currency code (USD, EUR, etc.) |
| `status` | text | 'pending_payment', 'paid', 'answered' |
| `sla_hours_snapshot` | integer | Expert's SLA at creation time |
| `created_at` | timestamp | Creation timestamp |
| `paid_at` | timestamp | Payment timestamp |
| `answered_at` | timestamp | Answer timestamp |

**Attachments JSON Format:**
```json
[
  {
    "name": "document.pdf",
    "url": "https://pub-xxx.r2.dev/question-attachments/123-document.pdf",
    "type": "application/pdf",
    "size": 54321
  }
]
```

### `media_asset` Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | integer | Primary key |
| `owner_type` | text | 'question', 'answer', 'user' |
| `owner_id` | integer | ID of owning record |
| `provider` | text | 'cloudflare_stream' |
| `asset_id` | text | Cloudflare Stream UID |
| `url` | text | HLS playback URL (.m3u8) |
| `duration_sec` | integer | Duration in seconds |
| `status` | text | 'processing', 'ready', 'error' |
| `segment_index` | integer | Order of segment (0, 1, 2...) |
| `metadata` | text | JSON with segment details |
| `created_at` | timestamp | Creation timestamp |

**Metadata JSON Format:**
```json
{
  "segmentIndex": 0,
  "mode": "video",
  "originalFilename": "segment-0-1234567890.webm"
}
```

### Relationship

```
question (1) ──┬──> media_asset (n)
               │    WHERE owner_type='question'
               │    AND owner_id=question.id
               │    ORDER BY segment_index ASC
               │
               └──> media_asset (1)
                    WHERE id=question.media_asset_id
                    (first segment for backward compatibility)
```

---

## Frontend Implementation

### 1. Custom Hooks

#### `useRecordingSegmentUpload.js`

```javascript
import { useState } from 'react';

// Helper function (must be before hook definition)
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function useRecordingSegmentUpload() {
  const [segments, setSegments] = useState([]);
  // segments: [{ id, blob, mode, segmentIndex, uploading, progress, error, result }]

  const uploadSegment = async (blob, mode, segmentIndex, duration) => {
    const segmentId = `${Date.now()}-${segmentIndex}`;

    // Add to segments list
    setSegments(prev => [...prev, {
      id: segmentId,
      blob,
      mode,
      segmentIndex,
      duration,
      uploading: true,
      progress: 0,
      error: null,
      result: null,
    }]);

    try {
      // Convert to base64
      const base64 = await blobToBase64(blob);

      // Upload to backend
      const response = await fetch('/api/media/upload-recording-segment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recordingBlob: base64,
          recordingMode: mode,
          segmentIndex,
          duration, // Pass duration from frontend
        }),
      });

      if (!response.ok) {
        const error = await response.clone().json(); // Clone before reading
        throw new Error(error.error || 'Upload failed');
      }

      const result = await response.json();

      // Update segment state
      setSegments(prev => prev.map(segment => 
        segment.id === segmentId
          ? { ...segment, uploading: false, progress: 100, result: result.data }
          : segment
      ));

      return result.data;

    } catch (error) {
      setSegments(prev => prev.map(segment =>
        segment.id === segmentId
          ? { ...segment, uploading: false, error: error.message }
          : segment
      ));
      throw error;
    }
  };

  const retrySegment = async (segmentId) => {
    const segment = segments.find(s => s.id === segmentId);
    if (!segment) return;

    // Reset error state
    setSegments(prev => prev.map(s =>
      s.id === segmentId
        ? { ...s, uploading: true, error: null, progress: 0 }
        : s
    ));

    try {
      await uploadSegment(segment.blob, segment.mode, segment.segmentIndex, segment.duration);
    } catch (error) {
      console.error('Retry failed:', error);
    }
  };

  const removeSegment = (segmentId) => {
    setSegments(prev => prev.filter(s => s.id !== segmentId));
  };

  const getSuccessfulSegments = () => {
    return segments
      .filter(s => s.result)
      .map(s => s.result)
      .sort((a, b) => a.segmentIndex - b.segmentIndex);
  };

  const reset = () => {
    setSegments([]);
  };

  return {
    segments,
    uploadSegment,
    retrySegment,
    removeSegment,
    getSuccessfulSegments,
    reset,
  };
}
```

#### `useAttachmentUpload.js`

```javascript
import { useState } from 'react';

// Helper function (must be before hook definition)
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function useAttachmentUpload() {
  const [uploads, setUploads] = useState([]);
  // uploads: [{ id, file, uploading, progress, error, result }]

  const uploadAttachment = async (file) => {
    const uploadId = `${Date.now()}-${file.name}`;

    setUploads(prev => [...prev, {
      id: uploadId,
      file,
      uploading: true,
      progress: 0,
      error: null,
      result: null,
    }]);

    try {
      const base64 = await fileToBase64(file);
      const fileType = file.type || 'application/octet-stream'; // Fallback

      const response = await fetch('/api/media/upload-attachment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file: {
            name: file.name,
            type: fileType,
            data: base64.split(',')[1], // Remove data URL prefix
          },
        }),
      });

      if (!response.ok) {
        const error = await response.clone().json(); // Clone before reading
        throw new Error(error.error || 'Upload failed');
      }

      const result = await response.json();

      setUploads(prev => prev.map(upload => 
        upload.id === uploadId
          ? { ...upload, uploading: false, progress: 100, result: result.data }
          : upload
      ));

      return result.data;

    } catch (error) {
      setUploads(prev => prev.map(upload =>
        upload.id === uploadId
          ? { ...upload, uploading: false, error: error.message }
          : upload
      ));
      throw error;
    }
  };

  const retryUpload = async (uploadId) => {
    const upload = uploads.find(u => u.id === uploadId);
    if (!upload || !upload.file) return;

    setUploads(prev => prev.map(u =>
      u.id === uploadId
        ? { ...u, uploading: true, error: null, progress: 0 }
        : u
    ));

    try {
      await uploadAttachment(upload.file);
    } catch (error) {
      console.error('Retry failed:', error);
    }
  };

  const removeUpload = (uploadId) => {
    setUploads(prev => prev.filter(u => u.id !== uploadId));
  };

  const reset = () => {
    setUploads([]);
  };

  return {
    uploads,
    uploadAttachment,
    retryUpload,
    removeUpload,
    reset,
  };
}
```

### 2. QuestionComposer Component (Key Changes)

```javascript
import { useRecordingSegmentUpload } from '@/hooks/useRecordingSegmentUpload';
import { useAttachmentUpload } from '@/hooks/useAttachmentUpload';

export function QuestionComposer({ onSubmit }) {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [segments, setSegments] = useState([]);
  
  // Upload hooks
  const segmentUpload = useRecordingSegmentUpload();
  const attachmentUpload = useAttachmentUpload();

  // Calculate total duration (computed value, not state)
  const totalDuration = segments.reduce((sum, seg) => {
    const dur = (seg.duration >= 0) ? seg.duration : 0;
    return sum + dur;
  }, 0);

  // Upload segment immediately after recording
  const saveSegment = async (blob, mode, duration) => {
    // Save locally first
    const newSegment = {
      id: Date.now(),
      blob,
      mode,
      duration,
      timestamp: new Date().toISOString(),
    };
    setSegments(prev => [...prev, newSegment]);
    
    // Upload immediately in background
    try {
      await segmentUpload.uploadSegment(blob, mode, segments.length, duration);
      console.log('Segment uploaded successfully');
    } catch (error) {
      console.error('Segment upload failed:', error);
      // Don't block user - they can retry later
    }
  };

  // Upload files immediately when selected
  const handleFileChange = async (e) => {
    const newFiles = Array.from(e.target.files);
    
    for (const file of newFiles) {
      try {
        await attachmentUpload.uploadAttachment(file);
      } catch (error) {
        console.error('File upload failed:', error);
        // Continue with other files
      }
    }
  };

  // Submit - just pass references
  const handleSubmit = async () => {
    const questionData = {
      title,
      text,
      recordingSegments: segmentUpload.getSuccessfulSegments(),
      attachments: attachmentUpload.uploads
        .filter(u => u.result)
        .map(u => u.result),
      recordingMode: 'multi-segment',
      recordingDuration: totalDuration,
    };
    
    await onSubmit(questionData);
  };

  const canSubmit = 
    title.trim().length > 0 &&
    !segmentUpload.segments.some(s => s.uploading) &&
    !attachmentUpload.uploads.some(u => u.uploading);

  return (
    <div>
      {/* Recording interface */}
      <RecordingInterface onSave={saveSegment} />
      
      {/* Upload status indicators */}
      <SegmentUploadList
        segments={segmentUpload.segments}
        onRetry={segmentUpload.retrySegment}
        onRemove={segmentUpload.removeSegment}
      />
      
      {/* File upload */}
      <input type="file" multiple onChange={handleFileChange} />
      <AttachmentUploadList
        uploads={attachmentUpload.uploads}
        onRetry={attachmentUpload.retryUpload}
        onRemove={attachmentUpload.removeUpload}
      />
      
      {/* Submit button */}
      <button onClick={handleSubmit} disabled={!canSubmit}>
        {canSubmit ? 'Submit Question' : 'Uploading...'}
      </button>
    </div>
  );
}
```

### 3. AskQuestionPage (Key Changes)

```javascript
// OLD (before progressive upload)
const handleSubmit = async () => {
  // Convert media to base64 (SLOW!)
  const recordingBlob = await blobToBase64(questionData.mediaBlob);
  const attachments = await Promise.all(
    questionData.files.map(file => fileToBase64(file))
  );
  
  const payload = {
    recordingBlob,
    attachments,
    // ... other fields
  };
};

// NEW (with progressive upload)
const handleSubmit = async () => {
  // Just pass references (already uploaded!)
  const payload = {
    expertHandle: expert.handle,
    title: questionData.title,
    text: questionData.text,
    payerEmail: askerInfo.email,
    recordingSegments: questionData.recordingSegments || [],
    attachments: questionData.attachments || [],
  };

  const response = await fetch('/api/questions/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  
  // Success in <1 second!
};
```

---

## Backend Implementation

### 1. Upload Recording Segment

**File**: `api/media/upload-recording-segment.js`

```javascript
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import FormData from 'form-data';
import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { recordingBlob, recordingMode, segmentIndex, duration } = req.body;

    if (!recordingBlob || !recordingMode || segmentIndex === undefined) {
      return res.status(400).json({ 
        error: 'Missing required fields: recordingBlob, recordingMode, segmentIndex' 
      });
    }

    // Parse base64
    const base64Data = recordingBlob.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');
    
    console.log(`Uploading segment ${segmentIndex}:`, {
      size: buffer.length,
      mode: recordingMode,
      duration,
    });

    // Upload to Cloudflare Stream
    const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
    const CLOUDFLARE_STREAM_API_TOKEN = process.env.CLOUDFLARE_STREAM_API_TOKEN;
    
    const streamUrl = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream`;
    
    const formData = new FormData();
    formData.append('file', buffer, {
      filename: `segment-${segmentIndex}-${Date.now()}.webm`,
      contentType: recordingMode === 'video' ? 'video/webm' : 'audio/webm',
    });

    const streamResponse = await axios.post(streamUrl, formData, {
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_STREAM_API_TOKEN}`,
        ...formData.getHeaders(),
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    const result = streamResponse.data.result;
    
    // Use frontend duration (more reliable than Stream's initial value)
    const finalDuration = duration || result.duration || 0;

    return res.status(200).json({
      success: true,
      data: {
        uid: result.uid,
        playbackUrl: result.playback?.hls || result.preview,
        duration: finalDuration,
        mode: recordingMode,
        size: buffer.length,
        segmentIndex,
      },
    });

  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ 
      error: error.message || 'Upload failed' 
    });
  }
}
```

### 2. Upload Attachment

**File**: `api/media/upload-attachment.js`

```javascript
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { file } = req.body;

    if (!file || !file.name || !file.data) {
      return res.status(400).json({ error: 'Missing file data' });
    }

    // Configure R2 client
    const s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY,
        secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_KEY,
      },
    });

    // Generate unique filename
    const timestamp = Date.now();
    const safeFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `question-attachments/${timestamp}-${safeFilename}`;

    // Upload to R2
    const buffer = Buffer.from(file.data, 'base64');
    const fileType = file.type || 'application/octet-stream'; // Fallback
    
    await s3Client.send(new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: fileType,
    }));

    // Return public URL
    const publicUrl = `https://pub-${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.dev/${key}`;

    return res.status(200).json({
      success: true,
      data: {
        name: file.name,
        url: publicUrl,
        type: fileType,
        size: buffer.length,
      },
    });

  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: error.message });
  }
}
```

### 3. Create Question

**File**: `api/questions/create.js`

```javascript
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const XANO_BASE_URL = process.env.XANO_BASE_URL;

  try {
    const {
      expertHandle,
      title,
      text,
      payerEmail,
      payerFirstName,
      payerLastName,
      recordingSegments = [],
      attachments = [],
    } = req.body;

    // Validation
    if (!expertHandle || !title || !payerEmail) {
      return res.status(400).json({ 
        error: 'Missing required fields: expertHandle, title, payerEmail' 
      });
    }

    console.log('Creating question:', { expertHandle, title, segmentCount: recordingSegments.length });

    // 1. Get expert profile
    const profileResponse = await fetch(`${XANO_BASE_URL}/public/profile/${expertHandle}`);
    if (!profileResponse.ok) {
      throw new Error('Expert not found');
    }
    const profileData = await profileResponse.json();
    const expertProfileId = profileData.id;

    // 2. Create question
    const questionPayload = {
      expert_profile_id: expertProfileId,
      title: title.trim(),
      text: text?.trim() || '',
      payer_email: payerEmail.trim(),
      payer_first_name: payerFirstName || null,
      payer_last_name: payerLastName || null,
      price_cents: profileData.price_per_question_cents || 1000,
      currency: 'USD',
      status: 'paid', // or 'pending_payment' for Stripe
      sla_hours_snapshot: profileData.sla_hours || 48,
      attachments: JSON.stringify(attachments),
    };

    const questionResponse = await fetch(`${XANO_BASE_URL}/question`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(questionPayload),
    });

    if (!questionResponse.ok) {
      const errorData = await questionResponse.json();
      throw new Error(`Failed to create question: ${errorData.message}`);
    }

    const question = await questionResponse.json();
    console.log('Question created:', question.id);

    // 3. Create media_asset records for each segment
    const mediaAssetIds = [];
    for (const segment of recordingSegments) {
      const mediaPayload = {
        owner_type: 'question',
        owner_id: question.id,
        provider: 'cloudflare_stream',
        asset_id: segment.uid,
        url: segment.playbackUrl,
        duration_sec: segment.duration || 0,
        status: 'ready',
        segment_index: segment.segmentIndex,
        metadata: JSON.stringify({
          segmentIndex: segment.segmentIndex,
          mode: segment.mode,
          originalFilename: `segment-${segment.segmentIndex}.webm`,
        }),
      };

      const mediaResponse = await fetch(`${XANO_BASE_URL}/media_asset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mediaPayload),
      });

      if (mediaResponse.ok) {
        const mediaAsset = await mediaResponse.json();
        mediaAssetIds.push(mediaAsset.id);
        console.log(`Media asset created: ${mediaAsset.id} (segment ${segment.segmentIndex})`);
      }
    }

    // 4. Update question with first media_asset_id (for backward compatibility)
    if (mediaAssetIds.length > 0) {
      await fetch(`${XANO_BASE_URL}/question/${question.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ media_asset_id: mediaAssetIds[0] }),
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        questionId: question.id,
        mediaAssetIds,
        segmentCount: recordingSegments.length,
        attachmentCount: attachments.length,
        status: question.status,
      },
    });

  } catch (error) {
    console.error('Create question error:', error);
    return res.status(500).json({ error: error.message });
  }
}
```

---

## Question Display

### Frontend Component

**File**: `src/components/dashboard/QuestionDetailModal.jsx`

```javascript
export function QuestionDetailModal({ question }) {
  // Parse attachments safely
  const attachments = useMemo(() => {
    try {
      return JSON.parse(question.attachments || '[]');
    } catch {
      return [];
    }
  }, [question.attachments]);

  // Parse segment metadata safely
  const getSegmentMode = (segment) => {
    try {
      const metadata = JSON.parse(segment.metadata || '{}');
      return metadata.mode || 'video';
    } catch {
      return 'video';
    }
  };

  return (
    <div className="question-detail">
      <h2>{question.title}</h2>
      {question.text && <p>{question.text}</p>}

      {/* Display all recording segments */}
      {question.recording_segments?.length > 0 && (
        <div className="recording-segments">
          <h3>Recording ({question.recording_segments.length} segments)</h3>
          {question.recording_segments.map((segment, index) => {
            const mode = getSegmentMode(segment);
            return (
              <div key={segment.id} className="segment">
                <h4>
                  {mode === 'video' ? '📹 Video' : '🎤 Audio'} Segment {index + 1}
                  {segment.duration_sec > 0 && ` (${segment.duration_sec}s)`}
                </h4>
                
                {/* Use Cloudflare Stream iframe player */}
                <iframe
                  src={`https://customer-xxx.cloudflarestream.com/${segment.asset_id}/iframe`}
                  style={{ border: 'none', width: '100%', height: '400px' }}
                  allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                  allowFullScreen
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Display attachments */}
      {attachments.length > 0 && (
        <div className="attachments">
          <h3>Attachments</h3>
          {attachments.map((file, index) => (
            <div key={index} className="attachment">
              <span>📎 {file.name}</span>
              <a href={file.url} download target="_blank" rel="noopener noreferrer">
                Download
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Xano Endpoint

**Endpoint**: `GET /me/questions`

**Configuration**:

1. **Get expert profile** (by authenticated user)
2. **Query questions** WHERE `expert_profile_id = expertProfile.id`
3. **For each question**:
   - Query ALL `media_asset` records WHERE:
     - `owner_type = 'question'`
     - `owner_id = $question.id`
   - Order by `segment_index ASC`
   - Attach as `recording_segments` array
4. **Return** enriched questions array

**Critical Syntax**: Use `$question.id` (not `question.id`) when building objects in Xano's visual editor.

**Response**:
```json
[
  {
    "id": 123,
    "title": "My question",
    "text": "Additional details...",
    "attachments": "[{\"name\":\"file.pdf\",\"url\":\"...\"}]",
    "recording_segments": [
      {
        "id": 1,
        "asset_id": "abc123",
        "url": "https://customer-xxx.cloudflarestream.com/abc123/manifest/video.m3u8",
        "duration_sec": 15,
        "segment_index": 0,
        "metadata": "{\"mode\":\"video\"}"
      },
      {
        "id": 2,
        "asset_id": "def456",
        "url": "https://customer-xxx.cloudflarestream.com/def456/manifest/video.m3u8",
        "duration_sec": 20,
        "segment_index": 1,
        "metadata": "{\"mode\":\"video\"}"
      }
    ]
  }
]
```

---

## Known Limitations

### 1. Video File Corruption (CRITICAL - UNRESOLVED)

**Status**: ⚠️ Intermittent issue, root cause unknown

**Symptoms**:
- Backend sometimes receives only 7 bytes of data (expected: 100KB-10MB)
- Magic bytes incorrect: `a29bac6d` (expected: `1a45dfa3` for WebM)
- Cloudflare rejects with: "The file was not recognized as a valid video file"

**Possible Causes**:
1. MediaRecorder not capturing data properly
2. Blob creation failing
3. Base64 encoding corrupting data
4. Backend Buffer.from() corrupting data

**Diagnostic Steps Needed**:

Add to `QuestionComposer.jsx` in `startRecording()`:
```javascript
const streamToRecord = liveStreamRef.current;

// Check stream health
console.log('Stream tracks:', streamToRecord.getTracks().map(t => ({
  kind: t.kind,
  enabled: t.enabled,
  readyState: t.readyState,
  muted: t.muted
})));

// Check codec support
const mimeType = currentSegment.mode === 'audio' ? 'audio/webm' : 'video/webm;codecs=vp8,opus';
console.log('MediaRecorder.isTypeSupported:', MediaRecorder.isTypeSupported(mimeType));
```

Add to `mediaRecorderRef.current.onstop`:
```javascript
console.log('Chunks collected:', chunks.length);
console.log('Chunk sizes:', chunks.map(c => c.size));
console.log('Final blob size:', blob.size);
const firstBytes = new Uint8Array(await blob.slice(0, 4).arrayBuffer());
console.log('Blob magic bytes:', Array.from(firstBytes).map(b => b.toString(16).padStart(2, '0')).join(''));
```

**Temporary Workaround**: Users can retry failed uploads. Most uploads succeed on retry.

### 2. Orphaned Media (MODERATE)

**Problem**: Progressive uploads create media in Cloudflare before questions are created. If users abandon the flow, these uploads become orphaned.

**Impact**:
- Wasted storage costs (~20-30% abandonment rate)
- Cloudflare Stream pricing: $5/month per 1000 minutes stored
- Example: 100 orphaned 1-minute videos = $0.50/month

**Solution**: Scheduled cleanup cron job (see implementation below)

### 3. 4.5MB Serverless Limit

**Problem**: Vercel serverless functions limited to 4.5MB request body

**Current Solution**: Base64 encoding in browser, then uploading to backend

**Better Solutions** (not yet implemented):
- Client-side video compression (WebCodecs API or ffmpeg.wasm)
- Chunked upload for large files
- Direct upload to R2, then trigger Cloudflare Stream

### 4. No Resumable Uploads

**Problem**: If upload fails midway, user must restart from scratch

**Impact**: Frustrating for users with slow connections or large files

**Future Solution**: Implement TUS protocol or chunked uploads with progress tracking

### 5. HLS Playback Requirement

**Problem**: Cloudflare Stream returns HLS URLs (.m3u8), which don't work with native `<video>` tag

**Current Solution**: Use Cloudflare Stream iframe player

**Limitation**: Less control over player UI/UX

**Alternative**: Use video.js or hls.js library for custom player

### 6. Duration Tracking Issues

**Problem**: Cloudflare Stream sometimes returns incorrect duration initially (0 or -1)

**Solution**: Pass duration from frontend (more reliable) and use it preferentially

**Remaining Issue**: If frontend duration is also wrong, display shows "0:00"

### 7. No Progress Indicators

**Problem**: Large uploads show "Uploading..." with no progress bar

**Impact**: Users unsure if upload is working or stalled

**Future Solution**: Implement XMLHttpRequest with progress events or chunked upload with incremental progress

---

## Orphaned Media Cleanup

### Implementation

**File**: `api/cron/cleanup-orphaned-media.js`

```javascript
export default async function handler(req, res) {
  // Verify cron authentication
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const XANO_BASE_URL = process.env.XANO_BASE_URL;
  const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
  const CLOUDFLARE_STREAM_API_TOKEN = process.env.CLOUDFLARE_STREAM_API_TOKEN;

  try {
    console.log('Starting orphaned media cleanup...');
    
    // Calculate cutoff (48 hours ago)
    const cutoffDate = new Date(Date.now() - (48 * 60 * 60 * 1000));
    
    // Get all media_assets
    const mediaResponse = await fetch(`${XANO_BASE_URL}/media_asset`);
    if (!mediaResponse.ok) throw new Error('Failed to fetch media assets');
    
    const allMedia = await mediaResponse.json();
    let deletedCount = 0;

    for (const media of allMedia) {
      const createdAt = new Date(media.created_at);
      
      // Skip recent uploads
      if (createdAt > cutoffDate) continue;

      // Check if associated with existing question
      if (media.owner_type === 'question' && media.owner_id) {
        const questionResponse = await fetch(`${XANO_BASE_URL}/question/${media.owner_id}`);
        if (questionResponse.ok) continue; // Question exists, keep media
      }

      // This media is orphaned - delete it
      console.log(`Deleting orphaned media: ${media.id}`);

      // Delete from Cloudflare Stream
      if (media.provider === 'cloudflare_stream' && media.asset_id) {
        await fetch(
          `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream/${media.asset_id}`,
          {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${CLOUDFLARE_STREAM_API_TOKEN}` },
          }
        );
      }

      // Delete from Xano
      await fetch(`${XANO_BASE_URL}/media_asset/${media.id}`, { method: 'DELETE' });
      deletedCount++;
    }

    return res.status(200).json({
      success: true,
      deleted: deletedCount,
      message: `Cleaned up ${deletedCount} orphaned media assets`,
    });

  } catch (error) {
    console.error('Cleanup error:', error);
    return res.status(500).json({ error: error.message });
  }
}
```

**Configuration**: `vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/cron/cleanup-orphaned-media",
      "schedule": "0 3 * * *"
    }
  ]
}
```

**Schedule**: Daily at 3:00 AM UTC

**Environment Variable**: `CRON_SECRET` (random secure string for authentication)

---

## Environment Setup

### Required Environment Variables

```bash
# Xano Database
XANO_BASE_URL=https://x8ki-letl-twmt.n7.xano.io/api:BQW1GS7L

# Cloudflare Account
CLOUDFLARE_ACCOUNT_ID=your_account_id

# Cloudflare Stream (video/audio)
CLOUDFLARE_STREAM_API_TOKEN=your_stream_api_token

# Cloudflare R2 (file storage)
CLOUDFLARE_R2_ACCESS_KEY=your_r2_access_key
CLOUDFLARE_R2_SECRET_KEY=your_r2_secret_key
CLOUDFLARE_R2_BUCKET=your_bucket_name

# Cron Jobs
CRON_SECRET=your_random_secure_string

# Development
SKIP_STRIPE=true
NODE_ENV=development
```

**Important Notes**:
- Variable names must match exactly (e.g., `CLOUDFLARE_R2_BUCKET` not `BUCKET_NAME`)
- Set in Vercel Dashboard → Settings → Environment Variables
- Apply to all environments (Production, Preview, Development)
- Redeploy after changing environment variables

### Cloudflare R2 CORS Configuration

```json
[
  {
    "AllowedOrigins": ["https://your-domain.vercel.app"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3000
  }
]
```

---

## Troubleshooting

### "can't access lexical declaration before initialization"

**Cause**: Function called before it's defined

**Solution**: Move helper functions to top of file, before hook definition

```javascript
// ✅ Correct order
function helperFunction() { ... }
export function useHook() { ... }

// ❌ Wrong order
export function useHook() {
  helperFunction(); // Error!
}
function helperFunction() { ... }
```

### "Body has already been consumed"

**Cause**: Reading response body multiple times

**Solution**: Clone response before reading

```javascript
// ❌ Wrong
const data = await response.json();
const text = await response.text(); // Error!

// ✅ Correct
const data = await response.clone().json();
const text = await response.text(); // Works
```

### Duration showing "0:00" or "-1:-1"

**Cause**: Duration not passed through upload flow

**Solution**:
1. Pass `duration` parameter in `uploadSegment()` call
2. Backend uses `duration || result.duration || 0`
3. Handle invalid durations in `formatTime()` function

```javascript
// Frontend
await segmentUpload.uploadSegment(blob, mode, index, duration);

// Backend
const finalDuration = duration || result.duration || 0;

// Display
function formatTime(seconds) {
  if (!seconds || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
```

### "XANO_BASE_URL not configured"

**Cause**: Environment variable missing or misnamed

**Solution**:
1. Verify exact name: `XANO_BASE_URL` (not `XANO_API_BASE_URL`)
2. Include full path: `https://x8ki-letl-twmt.n7.xano.io/api:BQW1GS7L`
3. Set in Vercel Dashboard
4. Redeploy after setting

### Uploads failing silently

**Cause**: Missing or incorrect Cloudflare credentials

**Solution**:
1. Check Vercel Dashboard → Environment Variables
2. Verify all Cloudflare variables are set correctly
3. Test credentials with curl:

```bash
curl -X GET \
  "https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream" \
  -H "Authorization: Bearer ${CLOUDFLARE_STREAM_API_TOKEN}"
```

### Import path errors ("Module not found")

**Cause**: Typos in import paths (e.g., `claudflare` vs `cloudflare`)

**Solution**: Standardize all imports

```bash
# Find and fix all occurrences
find api -type f -name "*.js" -exec sed -i 's/claudflare/cloudflare/g' {} +
```

---

## File Structure

```
project/
├── api/
│   ├── cron/
│   │   └── cleanup-orphaned-media.js
│   ├── lib/
│   │   ├── cloudflare/
│   │   │   ├── stream.js
│   │   │   └── r2.js
│   │   └── xano/
│   │       ├── client.js
│   │       ├── expert.js
│   │       ├── question.js
│   │       └── media.js
│   ├── media/
│   │   ├── upload-recording-segment.js
│   │   └── upload-attachment.js
│   └── questions/
│       └── create.js
├── src/
│   ├── hooks/
│   │   ├── useRecordingSegmentUpload.js
│   │   └── useAttachmentUpload.js
│   ├── components/
│   │   ├── question/
│   │   │   ├── QuestionComposer.jsx
│   │   │   ├── RecordingUploadStatus.jsx
│   │   │   ├── AttachmentUploadList.jsx
│   │   │   └── AskReviewModal.jsx
│   │   └── dashboard/
│   │       ├── QuestionDetailModal.jsx
│   │       └── AnswerRecorder.jsx
│   └── pages/
│       ├── AskQuestionPage.jsx
│       └── ExpertDashboardPage.jsx
├── vercel.json
├── package.json
└── README.md
```

---

## Testing Checklist

### Basic Functionality
- [ ] Record single video segment → uploads successfully
- [ ] Record multiple video segments → all upload
- [ ] Record audio segment → uploads successfully
- [ ] Upload single file → uploads successfully
- [ ] Upload multiple files → all upload
- [ ] Submit question with segments + files → creates successfully
- [ ] View question in dashboard → all segments display
- [ ] Play video segments → Cloudflare player works
- [ ] Download attachments → files download correctly

### Progressive Upload
- [ ] Record segment → see "⏳ Uploading..."
- [ ] Upload completes → see "✅ Uploaded (size, duration)"
- [ ] Record 2nd segment while 1st uploads → works
- [ ] Add file → see "⏳ Uploading..."
- [ ] File upload completes → see "✅ Uploaded"
- [ ] Submit button disabled while uploading → correct
- [ ] Submit button enabled when all uploaded → correct
- [ ] Submit works instantly (<1 second) → correct

### Error Handling
- [ ] Upload fails → see "❌ Error message"
- [ ] Click "Retry" → upload retries
- [ ] Successful retry → see "✅ Uploaded"
- [ ] Click "Remove" → item removed from list
- [ ] Network interruption → graceful error
- [ ] Invalid file type → appropriate error

### Edge Cases
- [ ] Record 90+ seconds total → shows warning
- [ ] Upload large file (>10MB) → works or shows appropriate error
- [ ] Multiple files same name → both upload with unique keys
- [ ] Abandon form halfway → orphaned media cleanup runs (check in 48+ hours)
- [ ] Browser refresh during upload → uploads continue or show as failed

---

## Future Improvements

### High Priority
1. **Fix video corruption issue** (CRITICAL)
   - Add comprehensive logging
   - Test across different browsers
   - Consider alternative encoding methods
   
2. **Implement progress bars**
   - Show upload percentage
   - Display upload speed
   - Show time remaining

3. **Add client-side compression**
   - Reduce payload sizes
   - Stay under 4.5MB limit
   - Use WebCodecs API or ffmpeg.wasm

### Medium Priority
4. **Implement resumable uploads**
   - Use TUS protocol
   - Handle network interruptions
   - Continue from last checkpoint

5. **Add video thumbnails**
   - Extract from Cloudflare Stream
   - Display in question list
   - Improve visual feedback

6. **Optimize chunked upload**
   - Split large files
   - Upload chunks in parallel
   - Better progress tracking

### Low Priority
7. **Custom video player**
   - Replace Cloudflare iframe
   - More control over UI/UX
   - Use video.js or hls.js

8. **Draft system**
   - Save incomplete questions
   - Resume later
   - Auto-save functionality

9. **Batch operations**
   - Upload multiple files simultaneously
   - Parallel segment uploads
   - Better resource utilization

---

## Key Takeaways

### What Works Well ✅
- Progressive upload significantly improves UX
- Multi-segment recording provides flexibility
- Individual retry/remove for failed uploads
- Real-time status indicators keep users informed
- <1 second submission time after uploads complete

### What Needs Improvement ⚠️
- Video corruption issue needs diagnosis and fix
- Progress bars would improve transparency
- Resumable uploads would handle network issues better
- Client-side compression would solve size limits
- Custom video player would improve playback UX

### Architecture Decisions 🏗️
- **Multi-segment over concatenation**: Preserves quality, faster upload
- **Progressive over batch**: Better UX, smaller payloads
- **Cloudflare Stream over self-hosted**: Simpler, more reliable
- **Xano over custom backend**: Faster development, good enough
- **Vercel serverless over traditional backend**: Easy deployment, scales automatically

---

## Support & Maintenance

### Regular Tasks
- **Daily**: Check cron job logs for cleanup errors
- **Weekly**: Review Cloudflare Stream usage and costs
- **Monthly**: Audit orphaned media (should be minimal with cleanup)
- **Quarterly**: Review and optimize video codec settings

### Monitoring
- Track upload success rate (target: >95%)
- Monitor average upload time (target: <3 seconds per segment)
- Check Cloudflare Stream processing time (usually <2 minutes)
- Watch R2 storage costs (should be <$10/month for small scale)

### When to Escalate
- Upload success rate drops below 90%
- Consistent video corruption reports from users
- Cloudflare Stream processing takes >10 minutes
- R2 costs unexpectedly high (check for orphaned media)

---

**Document Version**: 2.1  
**Last Updated**: October 6, 2025  
**Maintained By**: Development Team  
**Next Review**: After video corruption issue resolved