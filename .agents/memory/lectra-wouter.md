---
name: Lectra wouter routing conventions
description: How routing works in the Lectra artifact (wouter, not TanStack Router)
---

The Lectra app migrated from TanStack Router/Start to wouter.

**Rules:**
- `<Link href="/path">` not `<Link to="/path" params={...}>`
- No `asChild` prop — wouter Link renders `<a>` natively
- Navigation on button clicks: `const [, setLocation] = useLocation(); setLocation("/path")`
- `useParams<{ lang: string; id?: string }>()` for typed params
- Locale paths: `/${locale}/create`, `/${locale}/lesson/${id}`

**Why:** TanStack Router requires TanStack Start SSR runtime which doesn't exist in this pnpm workspace Vite setup.
