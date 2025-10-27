# Mobile Debugging Guide

## Issue: Back arrow not visible & Swipe still working

### Step 1: Check if changes are deployed
Open browser console and run:
```javascript
// Check if file has latest changes
console.log("Screen width:", window.innerWidth);
console.log("Is mobile threshold:", window.innerWidth < 1024);
```

### Step 2: Inspect Answer Panel Header
When on answer screen, open DevTools and:

1. Find the header element:
```
Right-click on header area → Inspect
```

2. Look for:
```html
<div class="flex-shrink-0 border-b border-gray-200 bg-gray-50">
  <div class="px-3 py-2 flex items-center gap-3">  <!-- should be px-3 py-2 on mobile -->
    <button aria-label="Back to question">
      <svg ...>  <!-- ArrowLeft icon -->
    </button>
    ...
  </div>
</div>
```

3. Check computed styles:
   - Button should be visible (not display:none or visibility:hidden)
   - Button should have padding: `p-1.5`
   - ArrowLeft should be size 20px

### Step 3: Check isMobile prop
In browser console when on answer screen:
```javascript
// Check React DevTools
// Select AnswerComposerPanel component
// Check props → isMobile should be true
```

### Step 4: Verify swipe prevention
Check the container div:
```javascript
// Find the panel container
const container = document.querySelector('[style*="overscrollBehavior"]');
console.log("Overscroll:", container?.style.overscrollBehavior);  // should be "none"
console.log("Touch action:", container?.style.touchAction);  // should be "pan-y"
```

### Step 5: Check for CSS conflicts
Look for these in DevTools Styles panel:
```css
/* These should NOT be present */
.arrow-hidden { display: none; }
.mobile-hide { display: none; }

/* Header padding should be */
.px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
.py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
```

### Step 6: Check React component tree
Using React DevTools:
```
1. Find AnswerComposerPanel
2. Check props:
   - question: {...}
   - profile: {...}
   - isMobile: true  ← Should be true on mobile
   - onClose: function
   - onAnswerSubmitted: function
```

### Step 7: Force cache clear
```
1. Open DevTools
2. Right-click refresh button
3. Click "Empty Cache and Hard Reload"
4. Or use: Cmd+Shift+R (Mac) / Ctrl+Shift+R (Windows)
```

### Step 8: Check for JavaScript errors
Open Console tab and look for:
```
- Red error messages
- Failed to compile messages
- Module not found errors
- Syntax errors
```

## Common Issues

### Issue 1: Old cached version
**Solution:** Hard refresh (Cmd+Shift+R)

### Issue 2: Build not deployed
**Solution:** Check if latest commit is deployed
- Check git log: `git log -1`
- Verify deployment succeeded

### Issue 3: isMobile prop not passed
**Check:** ExpertInboxPageV2.jsx line 1042
```javascript
<AnswerComposerPanel
  ...
  isMobile={screenWidth < 1024}  // ← Must be present
/>
```

### Issue 4: Conditional rendering broken
**Check:** AnswerComposerPanel.jsx line 76
```javascript
className={`${isMobile ? "px-3 py-2" : "px-4 py-3"} flex items-center gap-3`}
```

### Issue 5: ArrowLeft import missing
**Check:** Top of AnswerComposerPanel.jsx line 5
```javascript
import { ArrowLeft, Loader2, CheckCircle, Video, Mic, FileText } from 'lucide-react';
```

### Issue 6: iOS Safari z-index stacking
**Check:** AnswerComposerPanel.jsx lines 168-176
```javascript
<div className="flex-shrink-0 border-b border-gray-200 bg-gray-50 relative z-50">
  <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0 relative z-50">
    <ArrowLeft size={24} className="text-gray-900 stroke-[2.5]" />
  </button>
</div>
```

### Issue 7: iOS safe area not working
**Check:** Both QuestionDetailPanel.jsx and AnswerComposerPanel.jsx
```javascript
<div
  className="flex-1 overflow-y-auto overscroll-contain"
  style={isMobile ? { paddingBottom: 'calc(6rem + env(safe-area-inset-bottom))' } : {}}
>
```

## Quick Diagnostic Script

Run this in browser console when on answer screen:

```javascript
// Mobile Diagnostic
console.log("=== MOBILE DIAGNOSTIC ===");
console.log("Window width:", window.innerWidth);
console.log("Is mobile?:", window.innerWidth < 1024);

// Check container
const container = document.querySelector('[style*="overscrollBehavior"]');
console.log("Overscroll behavior:", container?.style.overscrollBehavior);
console.log("Touch action:", container?.style.touchAction);

// Check back button
const backButton = document.querySelector('[aria-label="Back to question"]');
console.log("Back button exists:", !!backButton);
console.log("Back button visible:", backButton ? window.getComputedStyle(backButton).display !== 'none' : false);
console.log("Back button position:", backButton?.getBoundingClientRect());
console.log("Back button z-index:", backButton ? window.getComputedStyle(backButton).zIndex : 'not found');
console.log("Back button computed styles:", backButton ? {
  position: window.getComputedStyle(backButton).position,
  zIndex: window.getComputedStyle(backButton).zIndex,
  opacity: window.getComputedStyle(backButton).opacity,
  visibility: window.getComputedStyle(backButton).visibility
} : 'not found');

// Check header
const header = document.querySelector('.flex-shrink-0.border-b');
console.log("Header padding:", header ? window.getComputedStyle(header.firstChild).padding : 'not found');

console.log("=== END DIAGNOSTIC ===");
```

Expected output:
```
Window width: 375 (or whatever mobile width)
Is mobile?: true
Overscroll behavior: none
Touch action: pan-y
Back button exists: true
Back button visible: true
Back button position: DOMRect { x: ..., y: ..., width: ..., height: ... }
Back button z-index: 50
Back button computed styles: { position: 'relative', zIndex: '50', opacity: '1', visibility: 'visible' }
Header padding: 8px 12px (px-3 py-2)
```

### Check iOS Safe Area
Run this to verify safe area is working:
```javascript
console.log("=== iOS SAFE AREA CHECK ===");
const scrollContainer = document.querySelector('.overflow-y-auto');
const computed = window.getComputedStyle(scrollContainer);
console.log("Padding bottom:", computed.paddingBottom);
console.log("Safe area inset bottom:", getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-bottom)'));
console.log("=== END CHECK ===");
```

## If Nothing Works

1. **Check if you're on the correct route:**
   - URL should be `/dashboard/inbox`
   - NOT `/expert` (old dashboard)

2. **Verify component is rendering:**
   ```javascript
   document.querySelector('.h-full.flex.flex-col.bg-white.relative')
   ```
   Should return the AnswerComposerPanel container

3. **Check for wrapper components hiding content:**
   - Look for parent divs with `overflow:hidden` or `height:0`
   - Check z-index stacking contexts

4. **Nuclear option - Rebuild:**
   ```bash
   rm -rf node_modules/.vite
   npm run dev
   ```
