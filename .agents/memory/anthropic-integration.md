---
name: Anthropic AI integration
description: Replit-managed Anthropic integration setup, how to use it in api-server, and the generate-description feature.
---

# Anthropic AI Integration

## Setup
- Provisioned with `setupReplitAIIntegrations({ providerSlug: "anthropic" })` — requires phone verification on user's Replit account first
- Env vars auto-set: `AI_INTEGRATIONS_ANTHROPIC_BASE_URL`, `AI_INTEGRATIONS_ANTHROPIC_API_KEY`
- Lib copied to `lib/integrations-anthropic-ai/` (workspace package `@workspace/integrations-anthropic-ai`)
- Added to `artifacts/api-server/package.json` dependencies and both tsconfig.json files

## How to use in api-server routes
```typescript
import { anthropic } from '@workspace/integrations-anthropic-ai';
const message = await anthropic.messages.create({
  model: 'claude-sonnet-4-6',
  max_tokens: 8192,
  messages: [{ role: 'user', content: prompt }],
});
```

## What was built
- `artifacts/api-server/src/routes/generate-description.ts` — POST /api/schools/:id/generate-description
- Fetches school data from DB, builds Thai prompt, calls claude-sonnet-4-6, returns { description, tokens }
- Prompt: 500-800 Thai words, 6-section structure, max_tokens 8192
- Mounted in index.ts: `router.use("/schools", generateDescriptionRouter)`
- Admin UI: ✨ เขียนด้วย AI + 🔄 สร้างใหม่ buttons in SchoolForm (Schools.tsx ~line 76-160)
- schoolId prop passed from SchoolsPage to SchoolForm so the button knows which school to call

**Why:** AI_INTEGRATIONS_ANTHROPIC_API_KEY is a dummy string by design — works when BASE_URL is also set.
