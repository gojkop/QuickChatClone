---
description: Create a standardized commit for mobile improvements
argument-hint: [brief description]
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git add:*), Bash(git commit:*)
---

# Mobile Feature Commit

Create a well-structured commit for mobile UX improvements with standardized formatting.

## Requirements:

1. **Review Changes**
   - Run `git status` to see modified files
   - Run `git diff` to review changes
   - Verify changes are related to mobile UX

2. **Commit Message Format**
   ```
   Mobile UX: [Brief description]

   [Detailed description of changes]

   Changes:
   - [File]: [What changed]
   - [File]: [What changed]

   Improvements:
   - ✅ [User-facing improvement]
   - ✅ [User-facing improvement]

   Testing:
   - Verified on mobile viewport (< 1024px)
   - [Any specific testing done]

   🤖 Generated with [Claude Code](https://claude.com/claude-code)

   Co-Authored-By: Claude <noreply@anthropic.com>
   ```

3. **Verify Mobile-Specific Files**
   Ensure changes are in mobile-relevant components:
   - Dashboard inbox components
   - Responsive layout files
   - Mobile detection logic
   - Touch interaction handlers

4. **Create Commit**
   - Stage all relevant files
   - Create commit with formatted message
   - Include context: $ARGUMENTS

## Steps:
1. Show current git status
2. Show diff summary
3. Draft commit message based on changes
4. Stage files with `git add`
5. Create commit with proper formatting
6. Show final commit with `git log -1`

Begin the commit process now, incorporating this context: $ARGUMENTS
