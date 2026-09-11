# WIT2026 Resend connection

This project now sends:

1. System error reports automatically to `thendo.siphuma@eduvos.com`.
2. Event-team contact messages automatically to the selected approved contact.
3. The Resend API key stays server-side in Vercel and is never included in the Firebase/Vite bundle.

## 1. Rotate the exposed Resend key
The old key was shared in chat. Revoke it in Resend and create a new sending key.

## 2. Deploy the email endpoint to Vercel
Push this repository to GitHub, then import the repository into Vercel.

The endpoint is:

`api/send-email.js`

Vercel will expose it as:

`https://YOUR-VERCEL-PROJECT.vercel.app/api/send-email`

## 3. Add these Environment Variables in Vercel
Do NOT prefix these with VITE_.

```
RESEND_API_KEY=re_NEW_KEY_HERE
ERROR_REPORT_TO=thendo.siphuma@eduvos.com
RESEND_FROM=Women in Tech Summit <events@YOUR_VERIFIED_RESEND_DOMAIN>
ALLOWED_ORIGINS=https://wit2026.web.app,http://localhost:5173
CONTACT_RECIPIENTS=siba.maphukata@eduvos.com,danica.heusdens@eduvos.com,yvonne.fayeti@eduvos.com,siyaxolisa.dayisi@eduvos.com
```

For initial error-only testing, if the Resend account itself uses `thendo.siphuma@eduvos.com`, you may temporarily use:

`RESEND_FROM=Women in Tech Summit <onboarding@resend.dev>`

Resend's test domain can only send to the email address attached to the Resend account. Sending attendee messages to the other Eduvos contacts requires a verified domain.

## 4. Verify a domain in Resend
To email Siba, Danica, Yvonne and Siyaxolisa automatically, verify a domain you control in the Resend dashboard and use an address on that domain in `RESEND_FROM`.

## 5. Add one value to the existing Firebase/Vite .env
Only add this to your existing `.env`:

```
VITE_RESEND_ENDPOINT=https://YOUR-VERCEL-PROJECT.vercel.app/api/send-email
```

Do not put the Resend API key in `.env` if the variable begins with `VITE_`.

## 6. Redeploy
Vercel: redeploy after setting its environment variables.

Firebase frontend:

```
npm run build
firebase deploy --only hosting
```

## 7. Test
- Trigger a friendly error/report: it should still be logged to RTDB and an email should arrive at Thendo's address.
- Info > Contact the team > Message: the selected contact should receive the message without opening the attendee's mail app.
