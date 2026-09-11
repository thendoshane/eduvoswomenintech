# WIT2026 v7 update

## Added
- Manual speaker photo upload with image-link fallback. Uploaded image wins if both exist.
- Manual contact-person photo upload with image-link fallback.
- Homepage speaker count now matches only people visible on the public Speakers page.
- Restricted `/logs` audit trail using the same Firebase admin login.
- Live public summit ratings with newest/highest/lowest sorting.
- Admin feedback export to CSV.
- Structured **What to expect** section on the homepage.

## Firebase
No Firebase Storage is required. Uploaded photos are compressed in the browser and stored with the existing Firestore records, which keeps the implementation compatible with the current Spark setup.

Deploy the updated security rules because v7 adds `publicFeedback` and `auditLogs` permissions.

```bash
npm run build
firebase deploy --only firestore:rules,database,hosting
```

## Restricted logs
Open manually:

`https://wit2026.web.app/logs`

It uses the same Firebase Authentication + Firestore admin access as `/admin` and is not linked from the public site.
