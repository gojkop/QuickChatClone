# Debug Instructions for Gray Overlay Bug

## Problem Description
1. Click on a question → Detail panel opens ✅
2. Click back (close detail) → Returns to question list ✅
3. Click on ANY question → Gray screen appears (detail panel shows but content is gray) 🐛
4. Browser refresh fixes it temporarily

Same issue occurs with Answer panel.

## Logging Added

I've added comprehensive console logging to track the exact flow:

### Console Log Prefixes:
- `🔵` - **PanelContainer** events (panel management)
- `🔷` - **Panel** component renders
- `🔶` - **Panel** overlay checks
- `📋` - **ExpertInboxPageV2** (main page events)

### Key Logs to Watch:

#### When Opening a Question:
```javascript
📋 handleQuestionOpen: { questionId: X, hasQuestion: true }
🔵 PanelContainer rendered: { panelCount: 2, panels: [...] }
🔷 Panel [list] rendered: { width: 30, isActive: false, ... }
🔷 Panel [detail] rendered: { width: 70, isActive: true, ... }
📋 renderPanel called: { type: 'detail', hasData: true, dataId: X }
🔶 Panel [detail] overlay check: { isActive: true, shouldShowOverlay: false }
```

#### When Clicking Back:
```javascript
🔵 Active panel [detail] close clicked
🔵 PanelContainer rendered: { panelCount: 1, panels: [...] }
🔷 Panel [list] rendered: { width: 100, isActive: true, ... }
```

#### When Opening AGAIN (The Bug):
```javascript
📋 handleQuestionOpen: { questionId: Y, hasQuestion: ??? }  ← CHECK THIS
🔵 PanelContainer rendered: { panelCount: 2, panels: [...] }
🔷 Panel [detail] rendered: { width: ???, isActive: ???, ... }  ← CHECK THESE
📋 renderPanel called: { type: 'detail', hasData: ???, dataId: ??? }  ← KEY!
🔶 Panel [detail] overlay check: { shouldShowOverlay: ??? }  ← IS THIS TRUE?
```

## Reproduction Steps

1. Open browser console
2. Go to https://mindpick.me/dashboard/inbox
3. Click on any question (e.g., Q-412)
4. **Look at logs** - Note the panel states
5. Click back arrow or click on question list area
6. **Look at logs** - Note panel close
7. Click on ANY question again
8. **LOOK AT LOGS CAREFULLY** - What's different?

## What to Look For

### Scenario 1: Question Data Not Passed
If you see:
```
📋 renderPanel called: { type: 'detail', hasData: false, dataId: undefined }
```
→ **Problem:** Panel is opening but question data is `null`
→ **Root Cause:** usePanelStack or openPanel not preserving data

### Scenario 2: Panel isActive Wrong
If you see:
```
🔷 Panel [detail] rendered: { width: 70, isActive: false, ... }
🔶 Panel [detail] overlay check: { isActive: false, shouldShowOverlay: true }
```
→ **Problem:** Detail panel thinks it's not active
→ **Root Cause:** activePanel calculation in PanelContainer wrong

### Scenario 3: Panel Width Wrong
If you see:
```
🔷 Panel [detail] rendered: { width: 0, ... }
```
→ **Problem:** Panel has zero width (hidden)
→ **Root Cause:** calculatePanelWidths in usePanelStack

### Scenario 4: Overlay Showing When It Shouldn't
If you see:
```
🔶 Panel [detail] overlay check: { shouldShowOverlay: true, opacity: 0.XXX }
```
→ **Problem:** Overlay is being rendered
→ **Root Cause:** Condition `!isActive && width > 0 && width < 40` is true when it shouldn't be

## Question Table Unclickable Issue

If clicking on question table doesn't work:

1. Check if overlay exists:
```
🔶 Panel [list] overlay check: { shouldShowOverlay: true }
```

2. If `shouldShowOverlay: true` for list panel, that's wrong because:
   - List panel should never have overlay when it's the only panel
   - Overlay blocks clicks with `position: absolute; inset: 0`

3. Check list panel state:
```
🔷 Panel [list] rendered: { width: ???, isActive: ???, ... }
```
   - If `width < 40` and `isActive: false` → Overlay will appear
   - This blocks all clicks to question table!

## Next Steps After Analyzing Logs

Please run the reproduction steps and paste the console logs here. Look for:

1. **The exact moment** when the bug occurs (after step 7)
2. **Any differences** between first open (step 3) and second open (step 7)
3. **Panel state** - especially `isActive`, `width`, and `hasData`
4. **Overlay state** - is `shouldShowOverlay: true` when it shouldn't be?

Once we see the logs, we'll know exactly which scenario is happening and can fix it properly.

## Temporary Workaround

If you need to work while debugging, you can temporarily disable the overlay entirely:

In `Panel.jsx` line 224-247, comment out the entire overlay section:
```javascript
// {(() => { ... })()}  // Comment this entire block
```

This will remove the clickable overlay feature but will fix the gray screen bug.
