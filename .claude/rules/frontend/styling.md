---
paths:
  - "strawberry-star-travel-app/src/**/*.{tsx,jsx,css}"
  - "strawberry-star-travel-app/src/**/*.module.css"
---

# Styling Rules

## Tailwind CSS 4
- Use Tailwind utility classes — no custom CSS unless Tailwind cannot express the need
- Class order convention: layout → spacing → colors → typography → effects (matches Prettier Tailwind plugin order)
- Dark/space aesthetic: bg-gray-950, bg-stone-950, text-zinc-100, border-red-700 are established patterns

## Glass-card Pattern
- Established pattern for cards: `bg-gray-950/70 backdrop-blur-xl border border-red-700/40 rounded-2xl shadow-xl`
- Use this for modal-style surfaces and content cards

## Starfield Background
- Use `<Starfield>` component for page backgrounds — pass `gradient` prop for color variation
- Do not add raw CSS backgrounds to pages that should have the Starfield

## No CSS Modules / Styled-Components
- This project uses Tailwind only — do not introduce CSS modules or styled-components
