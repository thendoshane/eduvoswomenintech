# WIT2026 branded live upgrade

## Brand assets
The attached Eduvos decorative assets are already included in:
`public/brand/decor/`

Optional speaker images:
`public/speakers/firstname-lastname.jpg`
Then use `/speakers/firstname-lastname.jpg` in Admin > Speakers.

The existing Eduvos logo and icon were NOT replaced.

## Environment variables to add
Keep your current `.env`. Add only:

```env
VITE_ERROR_REPORT_EMAIL=thendo.siphuma@eduvos.com
VITE_ERROR_REPORT_ENDPOINT=
```

`VITE_ERROR_REPORT_ENDPOINT` is optional. It must be a secure server-side webhook that accepts a POST and sends the email. Do not put a Resend API secret in any `VITE_` variable because Vite exposes those values to the browser.

## Deploy
```bash
npm install
npm run build
firebase deploy --only firestore:rules,database,hosting
```

## Brand colour
Main navy is at the bottom branding section of `src/styles.css`:
`--eduvos-navy:#173a67;`
Change that one value to change the main navy treatment.

## Teams
Admin > Settings now has `Teams join URL` and `Stream embed URL`.
A normal Teams meeting link opens Teams/browser. An inline player requires an embeddable broadcast URL allowed by Microsoft Teams.
