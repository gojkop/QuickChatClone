# Admin Server

This folder is reserved for server-side code for the Admin Console (to be deployed with the admin subfolder as a separate Vercel project).

Planned contents (no functionality yet):
- API routes (Node.js serverless functions) for:
  - Auth middleware (validate Xano session, check Neon RBAC)
  - Feature flags read/write (control plane)
  - Moderation actions (approve/reject/hide → write back to Xano)
  - Admin audit logging
- Middleware utilities (e.g., request validation, error handling)
- Config (env access, constants, schemas)

Notes:
- Keep secrets in the Admin Vercel project env only (not in client).
- Use short-lived admin sessions and audit every mutation.
- Reference Xano entities by ID; fetch details from Xano on demand to minimize PII in Neon.
