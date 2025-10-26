# Phase 2 & 3 Feature Improvements

## Phase 2: Enhanced Navigation & Performance

### URL Deep Linking
- **Feature:** Direct links to specific questions via URL hash
- **Example:** `/dashboard/inbox#question-123` opens question #123 automatically
- **Benefits:** Share links to specific questions, bookmark important questions

### Keyboard Navigation
- **j/k** - Navigate questions up/down (when list view is active)
- **Enter** - Open selected question
- **a** - Answer current question (when detail panel is open)
- **Esc** - Close top panel
- **Shift+Esc** - Close all panels
- **?** - Show keyboard shortcuts help modal

### Mobile Bottom Sheet
- **Feature:** Native-like drawer interface on mobile
- **Gestures:** Swipe up to expand, swipe down to minimize
- **Snap Points:** Peek (30%), Half (60%), Full (95%)

### Virtual Scrolling
- **Feature:** Auto-enabled when >50 questions
- **Benefits:** Smooth scrolling with 100+ questions
- **Tech:** Uses @tanstack/react-virtual

---

## Phase 3: UX Polish & Productivity

### 1. Toast Notifications
**What:** Non-intrusive feedback messages
**Features:**
- Success, error, info, warning types
- Auto-dismiss after 3 seconds
- Up to 5 toasts stack vertically
- Action buttons (e.g., Undo)

### 2. Pin Questions
**What:** Keep important questions at top of list
**How to use:**
- Click pin icon on question row
- Press **p** keyboard shortcut
- Pinned questions show filled amber pin icon
- Persists across sessions (localStorage)

### 3. Bulk Selection & Undo
**What:** Select multiple questions with undo safety net
**Features:**
- Click checkbox to select individual questions
- **Shift+Click** to select range
- Bulk hide with 10-second undo window
- Undo button appears in toast notification

### 4. Copy Question Link
**What:** Share direct links to questions
**How to use:**
- Click link icon in question detail footer
- Press **c** keyboard shortcut (when detail panel open)
- Shows "Copied!" confirmation
- Link format: `{origin}/dashboard/inbox#question-{id}`

### 5. Question Preview on Hover
**What:** See question details without opening
**Features:**
- Hover over question row for 300ms
- Shows question text (200 chars), price, media type, time left
- Smart positioning (doesn't go off-screen)

### 6. Improved Detail Panel UX
**Changes:**
- Back arrow (←) instead of X button
- Removed confusing three-dots menu
- Copy link button in footer
- Consistent navigation pattern

---

## Quick Test Instructions

### Basic Navigation (2 min)
1. Open `/dashboard/inbox`
2. Press **j** three times → selection moves down
3. Press **k** once → selection moves up
4. Press **Enter** → question detail opens
5. Press **Esc** → detail closes
6. Press **?** → help modal appears

### Pin & Sort (1 min)
1. Hover over any question → click pin icon
2. Question jumps to top with "Pinned Questions" header
3. Refresh page → question stays pinned
4. Click pin again → question unpins and returns to normal position

### Bulk Operations (2 min)
1. Click checkbox on question #1
2. **Shift+Click** checkbox on question #5 → all 5 selected
3. Click "Hide Selected" → toast appears with "Undo" button
4. Click "Undo" (within 10 seconds) → questions restored
5. Toast shows "Questions restored"

### Copy Link (30 sec)
1. Open any question detail
2. Press **c** key → toast shows "Question link copied"
3. Paste in new browser tab → opens same question

### Hover Preview (30 sec)
1. Hover mouse over question row for 1 second
2. Preview card appears to the right
3. Shows question text, price, media icon, time left
4. Move mouse away → preview disappears

### Mobile Features (1 min - mobile device/responsive mode)
1. Resize browser to <768px width
2. Click question → bottom sheet slides up
3. Drag sheet handle down → snaps to 30% height
4. Swipe right from left edge → sheet closes

### Keyboard Shortcuts (30 sec)
1. Press **?** → help modal shows all shortcuts
2. Test each shortcut from the list
3. Press **Esc** or click X to close modal

---

## Troubleshooting

**Keyboard shortcuts not working?**
- Make sure you're not typing in an input field
- Click on the page first to ensure focus

**Pin not persisting?**
- Check browser allows localStorage
- Private/incognito mode may clear on close

**Undo button not appearing?**
- Undo only works for bulk hide operation
- 10-second timeout (button disappears after)

**Hover preview not showing?**
- Must hover for 300ms (brief hover won't trigger)
- Check question has content to preview

---

## Dependencies Added

```json
"@tanstack/react-virtual": "^3.10.8"
```

---

## Files Created

**Phase 2:**
- `/src/hooks/dashboardv2/useURLSync.js`
- `/src/components/dashboardv2/inbox/BottomSheet.jsx`
- `/src/components/dashboardv2/inbox/VirtualQuestionTable.jsx`

**Phase 3:**
- `/src/hooks/dashboardv2/useToast.js`
- `/src/hooks/dashboardv2/usePinnedQuestions.js`
- `/src/hooks/dashboardv2/useBulkSelect.js`
- `/src/hooks/dashboardv2/useUndoStack.js`
- `/src/components/dashboardv2/inbox/PinButton.jsx`
- `/src/components/dashboardv2/inbox/QuestionPreview.jsx`
- `/src/components/dashboardv2/inbox/KeyboardShortcutsModal.jsx`
- `/src/utils/clipboard.js`

**Modified:**
- `/src/components/common/Toast.jsx` - Multi-toast support + backward compatibility
- `/src/pages/ExpertInboxPageV2.jsx` - Integrated all features
- `/src/components/dashboardv2/inbox/QuestionTable.jsx` - Pin button, hover preview
- `/src/components/dashboardv2/inbox/QuestionDetailPanel.jsx` - UX fixes, copy link