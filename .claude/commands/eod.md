---
description: End of day cleanup - Update docs, consolidate, remove logging
---

# End of Day Cleanup Workflow

Perform the following tasks in order:

## 1. Update Documentation with Today's Work
- Review all files modified today (use git status/diff)
- Update relevant documentation files (README.md, docs/, etc.) with new features, changes, and fixes
- Document any new APIs, components, or configuration changes
- Update any affected user guides or developer documentation

## 2. Consolidate All Documentation
- Review all documentation files for redundancy
- Merge duplicate information
- Ensure consistent formatting and structure
- Update table of contents if present
- Cross-reference related documentation sections

## 3. Update claude.md
- Add today's session summary to claude.md
- Document new patterns, decisions, or architecture changes
- Update any troubleshooting sections with issues encountered and solutions
- Add notes about technical debt or future improvements needed

## 4. Code Quality & Debug Cleanup
- Search for `console.log` statements added during debugging
- Search for `console.error` and `console.warn` (keep only essential ones)
- Look for `.only()` in test files (Mocha/Jest debug code)
- Search for `debugger` statements
- Remove or comment out verbose logging (keep only essential error/warning logs)
- Remove commented-out code blocks
- Remove unused imports
- Remove temporary debugging variables or functions
- Clean up any TODO comments that were completed
- Verify no test/debug files are left in production code

## 5. Security Scan
- Search for exposed API keys or tokens in code
- Check for hardcoded credentials or passwords
- Verify `.env` is in `.gitignore`
- Look for accidentally committed `.env` files
- Search for hardcoded production URLs that should be env vars
- Check for sensitive data in console.log statements

## 6. Git Housekeeping
- Run `git status` to see current state
- Check for large files (>1MB) being added: `git diff --stat`
- Note any new dependencies added today
- Suggest creating a commit with today's work (don't auto-commit)
- Check if main branch is behind origin
- Verify no sensitive files are staged

## 7. Performance Check
- Look for any large imports that could be optimized
- Check for new dependencies added (verify they're necessary)
- Note any TODO comments about performance improvements

## Output Format
After completing each step, provide:
- ✅ Step completed summary
- 📝 List of files modified
- ⚠️ Any issues or recommendations
- 🔒 Security concerns found
- 💾 Files ready to commit

At the end, provide:
- 📊 Final summary of all cleanup actions taken
- 🎯 Suggested commit message for today's work
- 📌 Outstanding issues to address tomorrow
