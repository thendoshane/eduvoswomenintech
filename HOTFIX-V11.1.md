# WIT2026 v11.1 emergency hotfix

This patch fixes the blank page caused by a partial upgrade where HomePage imported `speakerSlug` but the matching `src/lib/links.js` was not replaced.

It also hardens speaker/attendee profile session rendering so missing or malformed session entries cannot crash the page while reading session time fields.

## Replace files
Copy this patch over the current project and allow matching files to be replaced.

## Test
```bash
npm run dev
```
Check:
- `/`
- `/speakers`
- open a Speaker or Attendee profile
- `/programme`

## Build
```bash
npm run build
```

## Deploy
```bash
firebase deploy --only hosting
```

No Firebase rules, database structure, Resend settings, `.env`, logo, or favicon image are changed.
