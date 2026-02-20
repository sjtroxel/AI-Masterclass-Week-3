## Credential Handling
- NEVER hardcode credentials, API keys, or secrets in source files
- NEVER read from .env files directly in code
- NEVER log credentials, tokens, or sensitive user data
- DO use `import.meta.env.VITE_*` variables at runtime (frontend)
- Cloudinary config: use `import.meta.env.VITE_CLOUDINARY_CLOUD_NAME` and `VITE_CLOUDINARY_UPLOAD_PRESET`
- NOTE: Claude Code may auto-load .env — keep actual secrets outside the project directory when possible

## Sensitive Operations (require human approval)
- Any change to Supabase RLS policies
- Any change to auth flow or session handling in UserContext.tsx
- Any schema changes to user_favorites table
- Adding new external API integrations
- Changes to Vercel deployment configuration

## Defense in Depth
- Layer 3: Keep actual secrets outside project dir; project contains only `.env.example`
- Layer 4: Consider secret manager references (1Password op://) for production
- Layer 5: Add CI/CD scanning (gitleaks, dependabot) — not yet configured

## Client-Side Auth Warning
- ProtectedRoute only enforces routing — it is NOT a security boundary
- Supabase Row-Level Security (RLS) MUST be enabled on all tables for real data protection
