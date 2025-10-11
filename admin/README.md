# mindPick Admin Console

Basic scaffold for a standalone Admin Console, designed to be deployed directly from the `admin/` subfolder as a separate Vercel project served on `admin.mindpick.me`. No functionality is implemented yet (no backend calls, no DB connections)!

## Overview

- Framework: Vite + React (client only for now)
- Server placeholders: `server/` folder reserved for future Node.js serverless functions (e.g., auth middleware, RBAC checks, feature flags, moderation actions)
- Deployment target: New Vercel project mapped to `admin/` subfolder (separate from the main app)

## Structure

admin/
├── index.html
├── package.json
├── vite.config.js
├── .gitignore
├── README.md ← this file
├── src/
│   ├── App.jsx        ← Placeholder Admin dashboard landing
│   └── main.jsx       ← App entry + Router
└── server/            ← Reserved for future serverless functions (no code yet)
    └── README.md

## Deploying on Vercel (no local run required)

1) Create a new Vercel project
   - Import your existing Git repository
   - In Project Settings → “Root Directory”, select `admin/`
   - Framework Preset: Vite
   - Build Command: `vite build` (or `npm run build`)
   - Output Directory: `dist`

2) Environment variables
   - None required yet for this placeholder.
   - Later (when wiring RBAC/Neon/Xano), add secrets only to this Admin project.

3) Domain
   - Assign `admin.mindpick.me` to this new Vercel project
   - Keep `noindex,nofollow` (already present in `index.html`) for the admin surface

## Notes for future implementation (no code yet)
- RBAC & Auth: Validate Xano session server-side and check Neon `admin_users` for roles/permissions.
- Feature Flags: Implement control-plane read/write in Admin; expose a read-optimized endpoint for runtime gating in the main app.
- Moderation: Maintain a `moderation_queue` in Neon referencing Xano entities; actions write back to Xano; audit all changes.
- Audit Logging: Every admin mutation must be logged with actor, resource, and before/after snapshot.
- Security: Consider 2FA for admins, short-lived admin sessions, optional IP allowlisting or Zero-Trust in front of the admin subdomain.

## What’s included
- Minimal landing UI (`src/App.jsx`)
- Router and entry point (`src/main.jsx`)
- Vite configuration (`vite.config.js`)
- `index.html` with `<meta name="robots" content="noindex,nofollow" />`
- Server placeholder (`server/README.md`)

## What’s NOT included (by design)
- No database connections
- No serverless functions
- No authentication or authorization
- No feature flags or moderation API
- No styling framework (Tailwind/Chakra/etc.)

When ready, you can add APIs under `admin/server` or convert this project to Next.js if you prefer built-in API routes.
