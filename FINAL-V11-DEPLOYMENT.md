# WIT2026 v11 — Final deployment

Final visual polish only.

- Restores the original Home button label and behaviour: **Watch live**. It opens the event-level Teams URL configured in Admin.
- Desktop Eduvos decorative artwork is unchanged.
- Tablet and phone layouts now expose more of the existing blue/gold Eduvos edge artwork in white breathing spaces.
- Two additional small-screen-only edge motifs use existing clean Eduvos assets.
- No Firebase rules, Resend, `.env`, logo, icon, data model, admin logic, Q&A, programme, ratings or email behaviour changed.

## Deploy

```bash
npm run build
firebase deploy --only hosting
```

Hosting-only deployment is sufficient for v11.
