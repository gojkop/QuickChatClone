# Question Flow Architecture Documentation

This document provides comprehensive documentation for both the V1 and V2 question submission flows in the QuickChat application.

---

## Table of Contents

1. [V2 Question Flow (Current)](#v2-question-flow-current)
   - [Architecture Overview](#v2-architecture-overview)
   - [File Structure](#v2-file-structure)
   - [Flow Steps](#v2-flow-steps)
   - [Component Hierarchy](#v2-component-hierarchy)
   - [Data Flow](#v2-data-flow)
   - [Key Features](#v2-key-features)
2. [V1 Question Flow (Legacy)](#v1-question-flow-legacy)
   - [Architecture Overview](#v1-architecture-overview)
   - [File Structure](#v1-file-structure)
   - [How It Works](#v1-how-it-works)
3. [Comparison: V1 vs V2](#comparison-v1-vs-v2)
4. [API Integration](#api-integration)
5. [Media Upload System](#media-upload-system)

---

## V2 Question Flow (Current)

### V2 Architecture Overview

The V2 question flow is a **modern, accordion-based, multi-step form** with centralized state management. It provides a frictionless experience with real-time validation, background uploads, and mobile-first design.

**Key Principles:**
- **Accordion UI**: Steps expand/collapse based on user progress
- **Centralized State**: Single source of truth via `useFlowState` hook
- **Progressive Disclosure**: Advanced options hidden until needed
- **Background Uploads**: Media uploads happen asynchronously
- **Two-Tier System**: Quick Consult vs Deep Dive with different UX

### V2 File Structure

```
src/components/question-flow-v2/
├── compose/                          # Step 1: Compose Question
│   ├── TitleInput.jsx                # Question title input
│   ├── RecordingOptions.jsx          # Video/Audio/Screen recording buttons
│   ├── RecordingModal.jsx            # Modal for recording media
│   ├── RecordingSegmentList.jsx      # List of recorded segments with play/delete
│   ├── AdvancedOptions.jsx           # Collapsible advanced options
│   ├── PriceOfferInput.jsx           # Deep Dive: Price offer input
│   ├── ExpertMessageInput.jsx        # Deep Dive: Message to expert
│   ├── MindPilotPanel.jsx            # AI-powered question improvements
│   ├── QuickConsultComposer.jsx      # Quick Consult composition UI
│   └── DeepDiveComposer.jsx          # Deep Dive composition UI
│
├── review/                           # Step 2: Review & Contact
│   ├── QuestionSummaryCard.jsx       # Summary of question content
│   ├── PriceCard.jsx                 # Expert info and pricing display
│   └── ContactForm.jsx               # Email and name input
│
├── payment/                          # Step 3: Payment & Submit
│   └── PaymentPlaceholder.jsx        # Payment UI (Stripe integration pending)
│
├── steps/                            # Step orchestration
│   ├── StepCompose.jsx               # Wrapper for Step 1
│   ├── StepReview.jsx                # Wrapper for Step 2
│   └── StepPayment.jsx               # Wrapper for Step 3 (handles submission)
│
├── layout/                           # Layout components
│   ├── FlowContainer.jsx             # Main container with progress dots
│   ├── AccordionSection.jsx          # Accordion wrapper for each step
│   ├── ProgressDots.jsx              # Visual progress indicator
│   └── MobileStickyFooter.jsx        # Sticky footer for mobile
│
├── shared/                           # Shared components
│   └── SVGIcons.jsx                  # Reusable icon components
│
├── hooks/                            # Custom React hooks
│   └── useFlowState.js               # Centralized state management
│
└── AskQuestionPageV2.jsx             # Main page component (entry point)

src/hooks/
├── useRecordingSegmentUpload.js      # Recording upload logic
└── useAttachmentUpload.js            # File attachment upload logic

src/styles/
└── question-flow-v2.css              # V2-specific styles
```

### V2 Flow Steps

#### **Step 1: Compose Your Question**

**Purpose**: User creates their question with title, recordings, text, and attachments.

**Components Used**:
- `QuickConsultComposer.jsx` OR `DeepDiveComposer.jsx` (based on tier)
- `TitleInput.jsx` - Question title (min 5 characters)
- `RecordingOptions.jsx` - Record video/audio/screen
- `RecordingSegmentList.jsx` - Manage recorded segments
- `AdvancedOptions.jsx` - Screen recording (Quick Consult), written details, file attachments
- `MindPilotPanel.jsx` - AI suggestions (optional)

**Quick Consult Specific**:
- Video and Audio recording in main view
- Screen recording in Advanced Options
- Attach files in Advanced Options

**Deep Dive Specific**:
- Video, Audio, and Screen recording in main view
- `PriceOfferInput.jsx` - User proposes price
- `ExpertMessageInput.jsx` - Optional message to expert
- Written details always visible (recommended)
- Attach files in main view

**Data Collected**:
```javascript
{
  title: string,           // Required, min 5 chars
  recordings: array,       // Array of uploaded recording objects
  attachments: array,      // Array of uploaded file objects
  text: string,            // Optional written context
  tierSpecific: {          // Deep Dive only
    proposedPrice: string,
    askerMessage: string
  }
}
```

**Validation**:
- Title: minimum 5 characters
- Deep Dive: price must be within min/max range
- Cannot continue while uploads are in progress

---

#### **Step 2: Review & Contact Info**

**Purpose**: User reviews their question and provides contact information.

**Components Used**:
- `QuestionSummaryCard.jsx` - Shows title, recordings, text, attachments
- `PriceCard.jsx` - Shows expert info, SLA, and price
- `ContactForm.jsx` - Email (required), first name, last name (optional)

**Features**:
- Edit button to return to Step 1
- Real-time email validation
- Mobile-optimized input fields

**Data Collected**:
```javascript
{
  email: string,           // Required, validated
  firstName: string,       // Optional
  lastName: string         // Optional
}
```

**Validation**:
- Email must contain '@'
- Cannot continue without valid email

---

#### **Step 3: Payment & Submit**

**Purpose**: Process payment and submit question to backend.

**Components Used**:
- `PaymentPlaceholder.jsx` - Payment UI (Stripe integration pending)
- `StepPayment.jsx` - Handles submission logic

**Features**:
- Payment method selection (placeholder)
- Order summary
- Terms & conditions checkbox
- Mock Stripe integration

**Submission Process**:
1. User clicks "Pay & Submit Question"
2. `StepPayment.jsx` builds payload
3. POST to `/api/questions/quick-consult` or `/api/questions/deep-dive`
4. On success, navigate to `/question-sent?token={review_token}`

**Payload Format**:
```javascript
{
  expertHandle: string,
  title: string,
  text: string | null,
  payerEmail: string,
  payerFirstName: string | null,
  payerLastName: string | null,
  recordingSegments: [{
    uid: string,
    url: string,
    mode: 'video' | 'audio' | 'screen',
    duration: number
  }],
  attachments: [{
    name: string,
    url: string,
    size: number
  }],
  sla_hours_snapshot: number,
  stripe_payment_intent_id: string,
  // Deep Dive only:
  proposed_price_cents: number,
  asker_message: string | null
}
```

---

### V2 Component Hierarchy

```
AskQuestionPageV2
└── FlowContainer
    ├── ProgressDots
    ├── AccordionSection (Step 1)
    │   └── StepCompose
    │       └── QuickConsultComposer OR DeepDiveComposer
    │           ├── TitleInput
    │           ├── RecordingOptions
    │           │   ├── RecordingModal (when recording)
    │           │   └── (File attachment UI)
    │           ├── RecordingSegmentList
    │           ├── AdvancedOptions
    │           │   └── RecordingModal (for screen recording)
    │           ├── PriceOfferInput (Deep Dive only)
    │           ├── ExpertMessageInput (Deep Dive only)
    │           └── MindPilotPanel
    │
    ├── AccordionSection (Step 2)
    │   └── StepReview
    │       ├── QuestionSummaryCard
    │       ├── PriceCard
    │       └── ContactForm
    │
    └── AccordionSection (Step 3)
        └── StepPayment
            └── PaymentPlaceholder
```

---

### V2 Data Flow

#### State Management

**Centralized State Hook**: `useFlowState.js`

```javascript
const { state, actions } = useFlowState();

// State structure:
{
  currentStep: 1 | 2 | 3,
  completedSteps: [1, 2],
  compose: {
    title: '',
    recordings: [],
    attachments: [],
    text: '',
    tierSpecific: {}
  },
  review: {
    email: '',
    firstName: '',
    lastName: ''
  }
}

// Actions:
- actions.updateCompose(data)
- actions.updateReview(data)
- actions.completeStep(stepNumber)
- actions.goToStep(stepNumber)
```

#### Upload Hooks

**Recording Upload**: `useRecordingSegmentUpload.js`
- Routes audio to R2, video/screen to Cloudflare Stream
- Provides progress tracking (0-100%)
- Stores blob URL for immediate playback
- Supports drag-and-drop reordering
- Auto-retry on failure

```javascript
const segmentUpload = useRecordingSegmentUpload();

// Methods:
- segmentUpload.uploadSegment(blob, mode, index, duration)
- segmentUpload.removeSegment(segmentId)
- segmentUpload.reorderSegments(newArray)
- segmentUpload.getSuccessfulSegments()

// State:
- segmentUpload.segments        // Array of all segments
- segmentUpload.hasUploading    // Boolean
- segmentUpload.hasErrors       // Boolean
```

**Attachment Upload**: `useAttachmentUpload.js`
- Handles file attachments (max 3, 5MB each)
- Progress tracking per file
- Uploads to backend storage

```javascript
const attachmentUpload = useAttachmentUpload();

// Methods:
- attachmentUpload.uploadAttachment(file)
- attachmentUpload.removeUpload(uploadId)

// State:
- attachmentUpload.uploads      // Array of uploads
```

---

### V2 Key Features

#### 1. **Accordion Navigation**
- Only one step active at a time
- Previous steps can be edited
- Smooth scroll to active step
- Visual progress with dots

#### 2. **Recording System**
- Modal-based recording UI
- 3-second countdown before recording
- 90-second max duration per segment
- Real-time timer during recording
- Immediate preview after recording
- Save closes modal, upload happens in background
- Play/pause/delete for each segment
- Drag-and-drop reordering
- Uses blob URL for instant local playback

#### 3. **Two-Tier Differentiation**

**Quick Consult**:
- Fixed price (from tier config)
- Video + Audio in main view
- Screen recording in Advanced
- Simpler, faster flow

**Deep Dive**:
- User proposes price
- Optional message to expert
- All recording types in main view
- Written details emphasized
- Expert reviews offer before accepting

#### 4. **Mobile Optimization**
- Touch-optimized buttons (min 44px)
- Safe area padding for notched devices
- 16px font sizes to prevent iOS zoom
- Sticky footer for primary actions
- inputMode attributes for proper keyboards
- Responsive grid layouts

#### 5. **Real-time Validation**
- Inline error messages
- Character counters
- Progress indicators for uploads
- Button state updates (disabled when invalid)

#### 6. **Background Uploads**
- Uploads happen asynchronously
- User can continue working
- Progress bars show upload status
- Segments can be played during upload

---

## V1 Question Flow (Legacy)

### V1 Architecture Overview

The V1 question flow is a **traditional multi-page form** with step-by-step progression. It uses local component state and inline recording UI.

**Key Characteristics:**
- Page-based navigation (not accordion)
- Scattered state management
- Inline recording (not modal)
- Multi-segment recording with visual timeline
- Simple tier differentiation

### V1 File Structure

```
src/pages/
└── AskQuestionPage.jsx              # Main V1 page (monolithic)

src/components/
└── question-flow/                   # V1 components (if extracted)
    ├── RecordingInterface.jsx       # Inline recording UI
    ├── SegmentTimeline.jsx          # Visual timeline of segments
    └── QuestionForm.jsx             # Form inputs
```

**Note**: V1 is mostly contained in a single `AskQuestionPage.jsx` file (~500 lines), making it harder to maintain and test.

---

### V1 How It Works

#### Step-by-Step Flow

**1. Select Tier** (if applicable)
- User chooses Quick Consult or Deep Dive
- Tier config loaded from expert profile

**2. Compose Question**
- Title input
- Inline recording interface (camera/mic always visible)
- Multi-segment recording with visual timeline
- Written context (textarea)
- File attachments
- Deep Dive: price slider + message

**3. Review & Contact**
- Summary of question
- Email input
- Name inputs (optional)

**4. Payment & Submit**
- Stripe checkout (if implemented)
- Submit to backend

#### Key Differences from V2

| Aspect | V1 | V2 |
|--------|----|----|
| **UI Pattern** | Page-based, linear | Accordion, collapsible |
| **State Management** | Local component state | Centralized `useFlowState` |
| **Recording UI** | Inline, embedded | Modal popup |
| **Recording Preview** | Timeline with thumbnails | List with play buttons |
| **Mobile UX** | Basic responsive | Fully optimized |
| **Upload Feedback** | Basic spinner | Progress bars + percentage |
| **Code Organization** | Monolithic | Modular components |
| **File Size** | ~500 lines | ~50-100 lines per file |

#### V1 State Structure

```javascript
// Stored in local component state
const [questionData, setQuestionData] = useState({
  title: '',
  recordingSegments: [],
  text: '',
  attachments: [],
  proposedPrice: '', // Deep Dive only
  askerMessage: ''   // Deep Dive only
});

const [askerInfo, setAskerInfo] = useState({
  email: '',
  firstName: '',
  lastName: ''
});
```

#### V1 Submission Payload

**Same format as V2** (both use the same backend API):

```javascript
{
  expertHandle: string,
  title: string,
  text: string | null,
  payerEmail: string,
  payerFirstName: string | null,
  payerLastName: string | null,
  recordingSegments: [{
    uid: string,
    url: string,
    mode: string,
    duration: number
  }],
  attachments: [{
    name: string,
    url: string,
    size: number
  }],
  sla_hours_snapshot: number,
  stripe_payment_intent_id: string,
  proposed_price_cents: number,      // Deep Dive only
  asker_message: string | null        // Deep Dive only
}
```

**Endpoints**:
- Quick Consult: `POST /api/questions/quick-consult`
- Deep Dive: `POST /api/questions/deep-dive`

---

## Comparison: V1 vs V2

### Architecture

| Feature | V1 | V2 |
|---------|----|----|
| **Lines of Code** | ~500 (monolithic) | ~2000 (modular) |
| **Components** | 1-3 large components | 25+ small components |
| **State Management** | `useState` per component | Centralized `useFlowState` |
| **File Organization** | Single file | Organized by feature |
| **Reusability** | Low | High |
| **Testability** | Difficult | Easy (isolated components) |

### User Experience

| Feature | V1 | V2 |
|---------|----|----|
| **Navigation** | Linear, page-based | Accordion, non-linear |
| **Recording** | Inline (always visible) | Modal (on-demand) |
| **Upload Feedback** | Minimal | Detailed progress bars |
| **Mobile UX** | Basic | Fully optimized |
| **Error Handling** | Alerts | Inline messages |
| **Validation** | On submit | Real-time |
| **Edit Previous Steps** | Navigate back | Expand accordion |

### Performance

| Aspect | V1 | V2 |
|--------|----|----|
| **Initial Load** | Faster (1 file) | Slightly slower (code splitting) |
| **Runtime** | Similar | Similar |
| **Upload Performance** | Blocking | Background |
| **State Updates** | Full re-render | Optimized with hooks |

---

## API Integration

Both V1 and V2 use the same backend API.

### Endpoints

#### Quick Consult
```
POST /api/questions/quick-consult
```

**Request Body**:
```json
{
  "expertHandle": "john_doe",
  "title": "How do I optimize React performance?",
  "text": "Additional context...",
  "payerEmail": "user@example.com",
  "payerFirstName": "Jane",
  "payerLastName": "Smith",
  "recordingSegments": [
    {
      "uid": "abc123",
      "url": "https://stream.cloudflare.com/...",
      "mode": "video",
      "duration": 45
    }
  ],
  "attachments": [
    {
      "name": "screenshot.png",
      "url": "https://r2.storage.com/...",
      "size": 102400
    }
  ],
  "sla_hours_snapshot": 48,
  "stripe_payment_intent_id": "pi_mock_1234567890"
}
```

**Response**:
```json
{
  "success": true,
  "question_id": "q_abc123",
  "review_token": "rt_xyz789"
}
```

---

#### Deep Dive
```
POST /api/questions/deep-dive
```

**Request Body** (same as Quick Consult, plus):
```json
{
  "proposed_price_cents": 7500,
  "asker_message": "I'm happy to provide more details if needed."
}
```

---

## Media Upload System

### Architecture

```
Client (Browser)
    ↓
useRecordingSegmentUpload Hook
    ↓
    ├─→ Audio → POST /api/media/upload-audio → R2 Storage
    │                                            ↓
    │                                    Returns playback URL
    │
    └─→ Video/Screen → POST /api/media/get-upload-url
                            ↓
                    Returns Cloudflare upload URL
                            ↓
                    POST to Cloudflare Stream
                            ↓
                    Returns video UID
                            ↓
                    Build playback URL
```

### Media Types

| Type | Storage | Format | Max Duration | Playback URL Format |
|------|---------|--------|--------------|---------------------|
| **Audio** | R2 | audio/webm | 90s | https://r2.storage.com/{uid}.webm |
| **Video** | Cloudflare Stream | video/webm | 90s | https://customer-{accountId}.cloudflarestream.com/{uid}/manifest/video.m3u8 |
| **Screen** | Cloudflare Stream | video/webm | 90s | https://customer-{accountId}.cloudflarestream.com/{uid}/manifest/video.m3u8 |

### Upload Flow

1. **User records media** → Blob created in browser
2. **Hook creates segment entry** → State updated with `uploading: true`
3. **Blob URL created** → For immediate playback
4. **Upload starts** → POST to appropriate endpoint
5. **Progress updates** → 0% → 100%
6. **Upload completes** → State updated with result
7. **Playback available** → User can play from blob URL or cloud URL

### Segment Data Structure

```javascript
{
  id: "1234567890-0",           // Unique ID
  blob: Blob,                   // Original blob (for retry)
  blobUrl: "blob:http://...",   // For local playback
  mode: "video",                // video | audio | screen
  segmentIndex: 0,              // Order in sequence
  duration: 45,                 // Seconds
  uploading: false,             // Upload status
  progress: 100,                // 0-100
  error: null,                  // Error message if failed
  result: {                     // Upload result
    uid: "abc123",
    playbackUrl: "https://...",
    blobUrl: "blob:http://...", // Kept for playback
    duration: 45,
    mode: "video",
    size: 1024000,
    segmentIndex: 0
  }
}
```

---

## Best Practices

### When to Use V2
- ✅ New question flows
- ✅ Mobile-first experiences
- ✅ Complex multi-step forms
- ✅ Real-time validation needed
- ✅ Background upload requirements

### When to Use V1
- ✅ Simple, linear flows
- ✅ Quick prototypes
- ✅ Legacy compatibility needed
- ✅ Minimal maintenance resources

### Migration Path (V1 → V2)
1. Identify custom logic in V1
2. Extract to reusable hooks
3. Create V2 components with same logic
4. Test side-by-side
5. Feature flag rollout
6. Deprecate V1

---

## Troubleshooting

### Common Issues

#### "Black screen during recording"
**Cause**: Video element loses connection to MediaStream
**Solution**: Keep `videoRef.srcObject` connected during recording state

#### "Recordings not appearing in Expert dashboard"
**Cause**: Wrong payload format (using `media_urls` instead of `recordingSegments`)
**Solution**: Use correct field names from V1 payload format

#### "Duplicate segment lists"
**Cause**: RecordingSegmentList rendered in both RecordingOptions and Composer
**Solution**: Render only once in Composer, pass `showRecordingList={false}` to RecordingOptions

#### "Drag-and-drop not working"
**Cause**: Missing `reorderSegments` function in hook
**Solution**: Add `reorderSegments` callback to `useRecordingSegmentUpload`

#### "Play button not appearing"
**Cause**: Checking for `result` instead of `blobUrl`
**Solution**: Check `segment.blobUrl` for play button availability

---

## Future Enhancements

### V2 Roadmap
- [ ] Real Stripe integration
- [ ] Multi-language support
- [ ] Auto-save drafts to localStorage
- [ ] Voice-to-text transcription
- [ ] AI-powered question suggestions
- [ ] Collaborative editing
- [ ] Question templates
- [ ] Integration with screen capture tools

### Performance Optimizations
- [ ] Code splitting per step
- [ ] Lazy load RecordingModal
- [ ] Optimize blob storage (use IndexedDB)
- [ ] Implement upload queue with retry
- [ ] Add service worker for offline support

---

## Conclusion

**V2 represents a significant improvement over V1** in terms of:
- User experience (accordion, real-time validation, mobile UX)
- Developer experience (modular, testable, maintainable)
- Performance (background uploads, optimized state)
- Extensibility (easy to add new features)

**V1 remains valuable for**:
- Understanding the original requirements
- Legacy compatibility
- Reference implementation

Both flows serve the same backend API and produce identical payloads, ensuring seamless integration with the rest of the QuickChat platform.

---

**Last Updated**: 2025-01-XX
**Version**: 2.0
**Maintained By**: Development Team