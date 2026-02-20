---
paths:
  - "strawberry-star-travel-app/src/features/**/*.{tsx,jsx}"
  - "strawberry-star-travel-app/src/components/**/*.{tsx,jsx}"
  - "strawberry-star-travel-app/src/auth/**/*.{tsx,jsx}"
---

# Component Rules

## Structure
- Default export for all components: `export default function StarCard()`
- Keep components focused — if a component fetches data AND renders, extract the fetch to a hook
- Data fetching belongs in hooks (`src/hooks/`), not components

## State & Props
- Use React.useState (namespace import pattern used in hooks: `import React from "react"`)
- In feature components, prefer destructured hooks: `const { user } = useUser()`
- Prop types defined as inline TypeScript interfaces above the component

## Auth in Components
- ONLY access auth via `useUser()` — never access Supabase client directly in a component
- ProtectedRoute wraps authenticated routes — do not re-implement auth checks inside components

## React Router
- Use `<Link>` for internal navigation, not `<a href>`
- Route definitions live in the main router/App file, not scattered in features
