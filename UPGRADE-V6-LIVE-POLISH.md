# WIT2026 v6 update

No .env changes are required for this update.

## Replace files
Copy this update over the current project. Keep your existing `.env`, Eduvos logo and favicon files.

## Deploy
```bash
npm install
npm run build
firebase deploy --only firestore:rules,database,hosting
```

## Teams
A normal Microsoft Teams meeting/event page cannot be embedded in an iframe because Microsoft blocks framing with its Content-Security-Policy. v6 therefore does not iframe Teams URLs. Use the Teams join URL on the event or session. If you later receive a genuinely embeddable stream URL, add it in the optional Embeddable stream URL field and the site will render it inline.

## Images
Speaker photos: `public/speakers/firstname-lastname.jpg` -> `/speakers/firstname-lastname.jpg`
Contact photos: `public/contacts/firstname-lastname.jpg` -> `/contacts/firstname-lastname.jpg`

## Admin live alerts
Open `/admin` and click **Enable live alerts**. New Q&A questions, concerns, feedback comments and error reports then produce an in-app alert, optional browser notification and soft sound while the admin page is open.
