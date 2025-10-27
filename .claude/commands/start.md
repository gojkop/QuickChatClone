---
description: Start new session - Ingest documentation and project context
---

# Start New Session Workflow

Perform the following tasks to understand the project context:

## 1. Read claude.md
- Read the entire claude.md file to understand:
  - Project architecture and structure
  - Recent work and decisions
  - Known issues and solutions
  - Code patterns and conventions
  - Important context from previous sessions

## 2. Review Project Documentation
- Read README.md for project overview
- Check docs/ directory for technical documentation
- Review package.json for dependencies and scripts
- Note any API documentation or component guides

## 3. Environment & Dependency Health Check
- Verify `.env` file exists and has required variables (don't show values)
- Check if `node_modules` exists (run `ls node_modules 2>/dev/null | head -1`)
- Review package.json for recent dependency changes
- Check for any `npm-debug.log` or `yarn-error.log` files

## 4. Check Recent Git Activity
- Run `git log --oneline -20` to see recent commits
- Run `git status` to check current working state
- Identify any uncommitted changes or work in progress
- Check if current branch is behind origin

## 5. Scan for Common Issues
- Search for `.only()` in test files (forgotten debug code)
- Look for merge conflict markers (`<<<<<<<`, `>>>>>>>`)
- Check for `debugger` statements in source code
- Search for hardcoded localhost URLs that should be env vars

## 6. Scan for TODOs and Pending Work
- Search codebase for TODO comments
- Check for any .md files with pending tasks
- Look for files with excessive debugging logs or temporary code
- Check for commented-out code blocks

## 7. Summarize Current State
Provide a concise summary including:
- 📋 **Project**: Brief description of what this project does
- 🏗️ **Architecture**: Key tech stack and structure
- 📝 **Recent Work**: Summary of last 5-10 commits
- ⚠️ **Current State**: Any uncommitted changes or WIP
- 🔧 **Environment**: Status of setup (deps installed, env configured)
- ⚠️ **Issues Found**: Any problems detected in scans
- 📌 **Pending Tasks**: TODOs or known issues to address
- 💡 **Ready to Work**: Confirm you're ready and ask what to work on

## Output Format
Keep the summary concise (1-2 paragraphs per section). Focus on actionable information that helps continue work efficiently.
