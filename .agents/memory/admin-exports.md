---
name: Admin Named Exports Pattern
description: The admin panel App.tsx uses named imports, not default imports. All page components must use named exports.
---

# Admin Panel Export Pattern

## Rule
All admin page components use **named exports**, NOT `export default`.

## Pattern
```tsx
// CORRECT — what admin subagent built
export function BannersPage() { ... }
export function SettingsPage() { ... }
// App.tsx imports: import { BannersPage } from '@/pages/Banners'
```

## What NOT to do
- Do NOT add `export { default as BannersPage }` to a file with `export default function` — Babel rejects this syntax in the same file
- Do NOT assume new page files should use `export default` — match the named export pattern

**Why:** The admin subagent generated all pages with named exports (`export function XPage()`). The App.tsx was built to import them as named imports. Adding default exports alongside breaks the Babel parser.

**How to apply:** Any new page added to artifacts/admin/src/pages/ must use `export function PageNamePage()` pattern, and be registered in App.tsx as `import { PageNamePage } from '@/pages/PageName'`.
