# WIT2026 v8 — final public navigation cleanup

Changes:
1. Removed the public Live menu item and /live page.
2. Removed the Summit Experience / What to Expect panel from Home.
3. Home Watch live now opens the configured Teams join URL directly in a new tab.
4. Programme cards show direct Live Q&A and Watch online actions where available.
5. Session pages prioritise speakers first, then Live Q&A. Watch online is a secondary action lower on the session page.
6. Public users can submit ratings, but ratings/results are only visible in Admin > Feedback.
7. Bottom navigation is back to five clean items: Home, Programme, Speakers, Q&A, Info.

Deploy normally after testing:

npm run build
firebase deploy --only firestore:rules,database,hosting
