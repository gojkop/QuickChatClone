# mindPilot Component Library

**Version:** 1.0.0  
**Status:** Production Ready  
**Last Updated:** October 2025

---

## Table of Contents

1. [Overview](#overview)
2. [Design Philosophy](#design-philosophy)
3. [Installation & Setup](#installation--setup)
4. [Component Reference](#component-reference)
5. [Usage Examples](#usage-examples)
6. [Best Practices](#best-practices)
7. [Styling Guide](#styling-guide)
8. [File Structure](#file-structure)

---

## Overview

mindPilot is the AI co-pilot feature for the mindPick platform. It provides intelligent assistance for both question askers and expert answerers through a suite of React components.

### What is mindPilot?

mindPilot transforms the Q&A experience by:
- **For Askers:** Analyzing questions, providing coaching, and improving clarity
- **For Experts:** Generating answer blueprints, tracking topics during recording, and enhancing answer quality

### Key Features

- ✨ **Wordmark + Icons Approach** - Uses universally recognized emoji icons instead of custom logos
- 🎨 **Dark Glassmorphic Design** - Modern UI with depth, blur, and glow effects
- 🎯 **9 Core Components** - Fully styled, production-ready React components
- 🚀 **Zero Custom Assets** - No SVGs, PNGs, or custom icon files to maintain
- 🔧 **Tailwind-based** - Easy to customize and extend
- ♿ **Accessible** - Semantic HTML and ARIA labels

---

## Design Philosophy

### 1. Wordmark + Icons Over Custom Logo

**Decision:** Use emoji icons (✨🧠🧭💡⭐⚡🎯🚀) + "mindPilot" wordmark instead of a custom logo.

**Rationale:**
- **Instant Recognition:** Sparkles (✨) universally means "AI" (ChatGPT, Notion AI, etc.)
- **Zero Learning Curve:** Users immediately understand AI is helping them
- **Contextual Flexibility:** Different icons for different contexts (🧠 = analysis, 🧭 = guidance)
- **No Design Debt:** No custom SVGs to scale, maintain, or update
- **Fast Implementation:** Ship today instead of weeks of logo iterations

**Industry Examples:**
- ChatGPT: ✨ Sparkles everywhere
- Notion AI: ✨ Sparkles + stars
- GitHub Copilot: Ghost icon + "Copilot" wordmark
- Google Gemini: ✨ Sparkles primarily

### 2. Dark Theme & Glassmorphism

**Core Aesthetic:**
- Dark backgrounds (#0F172A, #1E293B)
- Frosted glass effects (backdrop-blur)
- Multiple shadow layers for depth
- Glow effects on interactive elements
- Blue-to-purple gradients

**Why Dark Theme?**
- Modern, AI-forward feel
- Reduces eye strain for experts recording long answers
- Makes glow effects and animations stand out
- Differentiates mindPilot from mindPick base (which can be light)

### 3. Component-First Architecture

Each component is:
- **Self-contained:** Works independently
- **Composable:** Easy to combine into larger UIs
- **Customizable:** Props for all variations
- **Consistent:** Follows same design patterns

---

## Installation & Setup

### Prerequisites

- React 18+
- Tailwind CSS 3+
- Node.js 18+

### Step 1: Copy Component Files

Copy the mindPilot component library to your project:

```
src/components/mindpilot/
├── index.js                      # Barrel export file
├── MindPilotIcon.jsx
├── MindPilotWordmark.jsx
├── MindPilotButton.jsx
├── MindPilotBadge.jsx
├── MindPilotCard.jsx
├── MindPilotAlert.jsx
├── MindPilotProgress.jsx
├── MindPilotTopicList.jsx
└── MindPilotFloatingPanel.jsx
```

### Step 2: Add CSS Animations

Add these keyframe animations to `src/index.css`:

```css
/* mindPilot Animations */
@keyframes shimmer {
  0% { background-position: -200% 0; }
  50%, 100% { background-position: 200% 0; }
}

@keyframes shimmer-progress {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes pulse-record {
  0%, 100% { 
    opacity: 1; 
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); 
  }
  50% { 
    opacity: 0.5; 
    box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); 
  }
}
```

### Step 3: Import and Use

```jsx
import { 
  MindPilotCard, 
  MindPilotButton, 
  MindPilotAlert 
} from '@/components/mindpilot';

function QuestionAnalysis() {
  return (
    <MindPilotCard
      title="Question Analysis"
      subtitle="Analyzed in 2.8s"
      icon="sparkles"
    >
      <MindPilotAlert
        variant="success"
        title="Clarity Score: 85/100"
      />
      <MindPilotButton variant="primary" icon="sparkles">
        Get AI Coaching
      </MindPilotButton>
    </MindPilotCard>
  );
}
```

### Step 4: Verify Setup

Run your app and check:
- ✅ Components render correctly
- ✅ Shimmer animations work on badges/progress bars
- ✅ Recording dot pulses
- ✅ No console errors

---

## Component Reference

### 1. MindPilotIcon

**Purpose:** Display contextual emoji icons for different mindPilot features.

**Props:**

| Prop | Type | Default | Options | Description |
|------|------|---------|---------|-------------|
| `variant` | string | `'sparkles'` | `'sparkles'`, `'brain'`, `'compass'`, `'lightbulb'`, `'star'`, `'lightning'`, `'target'`, `'rocket'` | Icon type to display |
| `size` | string | `'md'` | `'sm'`, `'md'`, `'lg'`, `'xl'` | Icon size |
| `className` | string | `''` | Any Tailwind classes | Additional classes |

**Icon Meanings:**

- ✨ **Sparkles** - Primary AI indicator, general enhancement, magic
- 🧠 **Brain** - Analysis, thinking, intelligence, processing
- 🧭 **Compass** - Guidance, navigation, blueprint, direction
- 💡 **Lightbulb** - Suggestions, insights, tips, ideas
- ⭐ **Star** - Quality, excellence, featured, highlight
- ⚡ **Lightning** - Speed, instant, quick, automatic
- 🎯 **Target** - Precision, accuracy, focus, goals
- 🚀 **Rocket** - Launch, progress, improvement, boost

**Example:**

```jsx
<MindPilotIcon variant="sparkles" size="lg" />
<MindPilotIcon variant="brain" size="md" />
<MindPilotIcon variant="compass" size="sm" />
```

---

### 2. MindPilotWordmark

**Purpose:** Display mindPilot logo with icon + text.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `showIcon` | boolean | `true` | Whether to show icon |
| `iconVariant` | string | `'sparkles'` | Icon type (see MindPilotIcon) |
| `size` | string | `'md'` | Size: `'sm'`, `'md'`, `'lg'`, `'xl'` |
| `className` | string | `''` | Additional classes |

**Example:**

```jsx
// Full logo with icon
<MindPilotWordmark size="lg" />

// Wordmark only
<MindPilotWordmark showIcon={false} />

// Custom icon
<MindPilotWordmark iconVariant="compass" size="md" />
```

---

### 3. MindPilotButton

**Purpose:** Styled button with optional icon.

**Props:**

| Prop | Type | Default | Options | Description |
|------|------|---------|---------|-------------|
| `variant` | string | `'primary'` | `'primary'`, `'secondary'`, `'ghost'` | Button style |
| `size` | string | `'md'` | `'sm'`, `'md'`, `'lg'` | Button size |
| `icon` | string | `null` | Any icon variant or `null` | Optional icon |
| `disabled` | boolean | `false` | - | Disabled state |
| `onClick` | function | - | - | Click handler |
| `children` | node | - | - | Button content |
| `className` | string | `''` | - | Additional classes |

**Variants:**

- **Primary** - Gradient background, most prominent
- **Secondary** - Transparent with border, less prominent
- **Ghost** - No background, minimal styling

**Example:**

```jsx
<MindPilotButton 
  variant="primary" 
  icon="sparkles"
  onClick={handleClick}
>
  Get AI Coaching
</MindPilotButton>

<MindPilotButton variant="secondary" icon="compass">
  View Blueprint
</MindPilotButton>

<MindPilotButton variant="ghost">
  Skip for now
</MindPilotButton>
```

---

### 4. MindPilotBadge

**Purpose:** Small badge with shimmer effect.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | string | `'sparkles'` | Icon variant |
| `children` | node | - | Badge text |
| `className` | string | `''` | Additional classes |

**Example:**

```jsx
<MindPilotBadge icon="sparkles">
  Enhanced by mindPilot
</MindPilotBadge>

<MindPilotBadge icon="star">
  AI Generated
</MindPilotBadge>
```

---

### 5. MindPilotCard

**Purpose:** Glassmorphic card container.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | string | - | Card title |
| `subtitle` | string | - | Card subtitle (optional) |
| `icon` | string | - | Header icon variant (optional) |
| `children` | node | - | Card content |
| `className` | string | `''` | Additional classes |

**Example:**

```jsx
<MindPilotCard
  title="Question Analysis"
  subtitle="Analyzed by mindPilot in 2.8 seconds"
  icon="sparkles"
>
  <p>Card content goes here...</p>
</MindPilotCard>
```

---

### 6. MindPilotAlert

**Purpose:** Alert/notification box.

**Props:**

| Prop | Type | Default | Options | Description |
|------|------|---------|---------|-------------|
| `variant` | string | `'info'` | `'success'`, `'info'`, `'warning'`, `'error'` | Alert type |
| `title` | string | - | - | Alert title |
| `description` | string | - | - | Alert description |
| `icon` | string | - | - | Custom icon (optional, defaults based on variant) |
| `className` | string | `''` | - | Additional classes |

**Variants:**

- **Success** - Green, checkmark icon, positive feedback
- **Info** - Blue, lightbulb icon, suggestions/tips
- **Warning** - Amber, warning icon, caution messages
- **Error** - Red, X icon, error messages

**Example:**

```jsx
<MindPilotAlert
  variant="success"
  title="Analysis Complete"
  description="Your question is ready for submission."
/>

<MindPilotAlert
  variant="info"
  title="Suggestion"
  description="Consider adding more context."
/>
```

---

### 7. MindPilotProgress

**Purpose:** Animated progress bar with gradient fill.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | number | `0` | Current progress (0-100) |
| `max` | number | `100` | Maximum value |
| `label` | string | - | Progress label (optional) |
| `showPercentage` | boolean | `true` | Show percentage text |
| `className` | string | `''` | Additional classes |

**Example:**

```jsx
<MindPilotProgress
  value={60}
  label="Coverage: 3/5 topics"
  showPercentage={true}
/>

<MindPilotProgress value={75} />
```

---

### 8. MindPilotTopicList

**Purpose:** List of topics with status tracking.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `topics` | array | `[]` | Array of topic objects |
| `className` | string | `''` | Additional classes |

**Topic Object Structure:**

```javascript
{
  text: string,        // Topic text
  status: string,      // 'completed', 'active', 'pending'
  priority?: string    // 'high', 'medium', 'low' (optional)
}
```

**Helper Function:**

```javascript
import { createMindPilotTopic } from '@/components/mindpilot';

const topic = createMindPilotTopic(
  'Per-seat vs flat-fee pricing',  // text
  'completed',                       // status
  'high'                            // priority (optional)
);
```

**Example:**

```jsx
const topics = [
  { text: 'Introduction', status: 'completed' },
  { text: 'Main content', status: 'active' },
  { text: 'Conclusion', status: 'pending', priority: 'high' },
];

<MindPilotTopicList topics={topics} />
```

---

### 9. MindPilotFloatingPanel

**Purpose:** Floating co-pilot panel for recording.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | string | `'Recording Co-pilot'` | Panel title |
| `icon` | string | `'target'` | Header icon |
| `isRecording` | boolean | `false` | Show recording indicator |
| `timeDisplay` | string | - | Time display (e.g., "3:24 / ~10:00") |
| `children` | node | - | Panel content |
| `className` | string | `''` | Additional classes |

**Helper Function:**

```javascript
import { createMindPilotTimeDisplay } from '@/components/mindpilot';

const timeDisplay = createMindPilotTimeDisplay(
  204,  // current seconds (3:24)
  600   // estimated seconds (10:00)
);
// Returns: "3:24 / ~10:00"
```

**Example:**

```jsx
<MindPilotFloatingPanel
  title="Recording Co-pilot"
  icon="target"
  isRecording={true}
  timeDisplay="3:24 / ~10:00"
>
  <MindPilotProgress value={60} />
  <MindPilotTopicList topics={topics} />
</MindPilotFloatingPanel>
```

---

## Usage Examples

### Example 1: Question Analysis Card

```jsx
import { 
  MindPilotCard, 
  MindPilotAlert, 
  MindPilotButton 
} from '@/components/mindpilot';

function QuestionAnalysisCard() {
  return (
    <MindPilotCard
      title="Question Analysis"
      subtitle="Analyzed by mindPilot in 2.8 seconds"
      icon="sparkles"
    >
      <MindPilotAlert
        variant="success"
        title="Clarity Score: 85/100"
        description="Your question is clear and well-structured"
        className="mb-5"
      />
      
      <MindPilotAlert
        variant="info"
        title="Consider adding"
        description="Context about your team size and current pricing model"
        className="mb-6"
      />

      <div className="flex gap-3">
        <MindPilotButton variant="primary" icon="sparkles">
          Get AI Coaching
        </MindPilotButton>
        <MindPilotButton variant="ghost">
          Skip
        </MindPilotButton>
      </div>
    </MindPilotCard>
  );
}
```

### Example 2: Answer Blueprint Card

```jsx
import { 
  MindPilotCard, 
  MindPilotButton,
  MindPilotTopicList,
  createMindPilotTopic 
} from '@/components/mindpilot';

function AnswerBlueprintCard() {
  const topics = [
    createMindPilotTopic('Per-seat vs flat-fee models', 'pending', 'high'),
    createMindPilotTopic('Small team dynamics', 'pending', 'high'),
    createMindPilotTopic('Competitive analysis', 'pending', 'medium'),
  ];

  return (
    <MindPilotCard
      title="Answer Blueprint"
      subtitle="Generated by mindPilot"
      icon="compass"
    >
      <div className="mb-6">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Summary
        </div>
        <div className="text-sm text-slate-300 leading-relaxed">
          SaaS pricing strategy for small teams, comparing per-seat vs. 
          flat-fee models with focus on customer acquisition and retention.
        </div>
      </div>

      <div className="mb-6">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
          Key Topics (3)
        </div>
        <MindPilotTopicList topics={topics} />
      </div>

      <div className="p-4 bg-blue-500/10 rounded-xl border-l-4 border-blue-500 mb-6">
        <div className="text-sm text-slate-300">
          💡 Estimated optimal duration: ~10 minutes
        </div>
      </div>

      <MindPilotButton variant="primary" icon="target" className="w-full">
        Start Recording
      </MindPilotButton>
    </MindPilotCard>
  );
}
```

### Example 3: Recording Co-pilot Panel

```jsx
import { 
  MindPilotFloatingPanel,
  MindPilotProgress,
  MindPilotTopicList,
  createMindPilotTopic,
  createMindPilotTimeDisplay 
} from '@/components/mindpilot';
import { useState, useEffect } from 'react';

function RecordingCopilot() {
  const [recordingSeconds, setRecordingSeconds] = useState(204); // 3:24
  
  const topics = [
    createMindPilotTopic('Introduction', 'completed'),
    createMindPilotTopic('Per-seat pricing', 'completed'),
    createMindPilotTopic('Flat-fee pricing', 'completed'),
    createMindPilotTopic('Next: Small teams', 'active'),
    createMindPilotTopic('Competitive analysis', 'pending'),
  ];

  const timeDisplay = createMindPilotTimeDisplay(recordingSeconds, 600);

  return (
    <MindPilotFloatingPanel
      title="Recording Co-pilot"
      icon="target"
      isRecording={true}
      timeDisplay={timeDisplay}
    >
      <MindPilotProgress
        value={60}
        label="Coverage"
        showPercentage={true}
        className="mb-4"
      />

      <MindPilotTopicList topics={topics} />
    </MindPilotFloatingPanel>
  );
}
```

---

## Best Practices

### 1. Icon Selection

**Use the right icon for the right context:**

- **✨ Sparkles** - Default choice, general AI indicator
- **🧠 Brain** - When analyzing or processing
- **🧭 Compass** - When providing guidance or blueprints
- **💡 Lightbulb** - When suggesting or giving tips
- **⭐ Star** - When highlighting quality or excellence
- **⚡ Lightning** - When emphasizing speed
- **🎯 Target** - When focusing on precision
- **🚀 Rocket** - When showing progress or launch

**Example:**

```jsx
// Question analysis - use brain
<MindPilotCard icon="brain" title="Analyzing Question">

// Answer blueprint - use compass
<MindPilotCard icon="compass" title="Answer Blueprint">

// Suggestions - use lightbulb
<MindPilotAlert variant="info" icon="💡" title="Suggestion">
```

### 2. Alert Variants

**Choose the right variant for the message:**

- **Success** - Task completed, positive confirmation
- **Info** - Tips, suggestions, neutral information
- **Warning** - Missing info, potential issues
- **Error** - Failed operations, critical issues

### 3. Component Composition

**Build complex UIs by composing simple components:**

```jsx
// Good: Compose small components
<MindPilotCard>
  <MindPilotAlert />
  <MindPilotProgress />
  <MindPilotButton />
</MindPilotCard>

// Avoid: One giant custom component
<CustomComplexComponent />
```

### 4. Accessibility

All components include:
- Semantic HTML elements
- ARIA labels where needed
- Keyboard navigation support
- Focus states

**Ensure you:**
- Use descriptive button text
- Provide alt text for icons (built-in)
- Test with keyboard navigation
- Check color contrast

### 5. Performance

**Optimize component usage:**

```jsx
// Good: Import only what you need
import { MindPilotButton } from '@/components/mindpilot';

// Avoid: Importing everything
import * as MindPilot from '@/components/mindpilot';
```

### 6. Consistency

**Use components consistently across the platform:**

- Always use `MindPilotButton` for mindPilot actions
- Always use `MindPilotCard` for mindPilot UI sections
- Always use same icons for same contexts
- Keep similar spacing and layouts

---

## Styling Guide

### Color System

**Primary Colors:**
- Blue 500: `#3B82F6` - Main brand color
- Indigo 500: `#6366F1` - Secondary accent
- Purple 500: `#8B5CF6` - Tertiary accent

**Semantic Colors:**
- Success: `#10B981` (Green)
- Warning: `#F59E0B` (Amber)
- Error: `#EF4444` (Red)
- Info: `#0EA5E9` (Sky)

**Neutrals:**
- Slate 50-900 scale for text and backgrounds

### Gradients

**Primary Gradient:**
```css
background: linear-gradient(135deg, #3B82F6 0%, #6366F1 100%);
```

**Brand Gradient:**
```css
background: linear-gradient(135deg, #60A5FA 0%, #818CF8 50%, #A78BFA 100%);
```

### Typography

**Font:** Inter

**Scale:**
- 3XL: 36px / bold (Page headers)
- 2XL: 30px / bold (Section headers)
- XL: 24px / semibold (Card titles)
- LG: 20px / semibold (Subheadings)
- Base: 16px / medium (Body text)
- SM: 14px / medium (Labels)
- XS: 12px / medium (Captions)

**Letter Spacing:**
- Headers: -0.02em to -0.03em (tighter)
- Body: -0.01em

### Spacing

Components use consistent spacing:
- Card padding: 32px (p-8)
- Element gaps: 12-24px (gap-3 to gap-6)
- Section margins: 24-32px (mb-6 to mb-8)

### Shadows & Effects

**Shadows:**
```css
/* Small */
box-shadow: 0 2px 8px rgba(59, 130, 246, 0.15);

/* Medium */
box-shadow: 0 4px 16px rgba(59, 130, 246, 0.25);

/* Large */
box-shadow: 0 8px 32px rgba(59, 130, 246, 0.35);

/* Glow */
box-shadow: 0 0 20px rgba(59, 130, 246, 0.6);
```

**Backdrop Blur:**
```css
backdrop-filter: blur(20px);
```

---

## File Structure

```
src/components/mindpilot/
├── index.js                      # Barrel export + utilities
├── MindPilotIcon.jsx             # Icon component
├── MindPilotWordmark.jsx         # Logo component
├── MindPilotButton.jsx           # Button component
├── MindPilotBadge.jsx            # Badge component
├── MindPilotCard.jsx             # Card container
├── MindPilotAlert.jsx            # Alert component
├── MindPilotProgress.jsx         # Progress bar
├── MindPilotTopicList.jsx        # Topic list
└── MindPilotFloatingPanel.jsx   # Floating panel
```

### index.js Exports

The `index.js` file exports:

**Components:**
- All 9 components

**Constants:**
- `MINDPILOT_ICONS` - Icon variant names
- `MINDPILOT_SIZES` - Size options
- `MINDPILOT_BUTTON_VARIANTS` - Button variants
- `MINDPILOT_ALERT_VARIANTS` - Alert variants
- `MINDPILOT_TOPIC_STATUS` - Topic statuses
- `MINDPILOT_COLORS` - Color values
- `MINDPILOT_GRADIENTS` - Gradient strings
- `MINDPILOT_PRESETS` - Pre-configured props

**Utilities:**
- `getMindPilotIcon(variant)` - Get emoji by name
- `createMindPilotTopic(text, status, priority)` - Create topic object
- `calculateMindPilotProgress(topics)` - Calculate completion stats
- `formatMindPilotTime(seconds)` - Format time string
- `createMindPilotTimeDisplay(current, estimated)` - Create time display

---

## Troubleshooting

### Animations Not Working

**Problem:** Shimmer effect on badges/progress bars not working

**Solution:** Ensure CSS animations are added to `src/index.css` (see Installation Step 2)

### Icons Not Displaying

**Problem:** Emoji icons not showing

**Solution:** 
1. Check font support (Inter font should be loaded)
2. Verify emoji support in browser
3. Icons are emojis, not custom assets

### Styling Issues

**Problem:** Components look broken or unstyled

**Solution:**
1. Verify Tailwind CSS is configured
2. Check that Tailwind processes the component files
3. Ensure dark theme colors are available

### Import Errors

**Problem:** Cannot import components

**Solution:**
1. Check file paths match your project structure
2. Verify `index.js` exports are correct
3. Use correct import syntax: `import { Component } from '@/components/mindpilot'`

---

## Version History

### v1.0.0 (October 2025)
- Initial release
- 9 core components
- Full documentation
- Production ready

---

## Support & Contribution

### Documentation

- **Main Docs:** This file
- **Component Docs:** See Component Reference section
- **Examples:** See Usage Examples section

### Questions?

Contact the mindPick development team or refer to:
- mindPick Technical Architecture docs
- mindPick Strategy docs
- Component source code (fully commented)

---

## License

Part of the mindPick platform.  
© 2025 mindPick Team