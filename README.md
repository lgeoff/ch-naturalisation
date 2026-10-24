# ch-naturalisation

A bilingual (English / French) study companion for the ordinary Swiss naturalisation procedure in the canton of Geneva:

- **Themes** – multiple-choice practice by theme, with explanations and an official source for every answer. A theme is "stamped" once every question in it is answered correctly on the latest try.
- **Interview practice** – open questions the investigating officer may ask, with key points to compare against.
- **Mock test** – a timed test that mirrors the published format of the Geneva knowledge test, with a full review at the end.
- **Application** – a timeline of the documents and steps, built backwards from your planned filing month, with calendar reminders (.ics, works on iPhone and Android).
- **The test** – format, official study material and the current-events briefing.

The language can be switched at any time, including in the middle of a question.

## Password and encryption

The study content (questions, news, checklist, interview cards) is stored only as `data/content.enc`, encrypted with AES-256-GCM. The key is derived from a password with PBKDF2-SHA256 (600,000 iterations). The site asks for the password and decrypts the content in the browser; nothing is sent to a server. The code itself is public.

With "Remember on this device", the derived key (not the password) is kept in that browser until **The test → Lock this device** is used.

To edit the content (Node 18+):

```sh
NATGE_PASSWORD='…' node tools/decrypt.mjs   # writes editable src/*.js
# edit src/*.js
NATGE_PASSWORD='…' node tools/encrypt.mjs   # rebuilds data/content.enc
```

`src/` is git-ignored: never commit it.

## Privacy

The site contains no personal data. Quiz progress, checklist ticks and settings are stored only in the browser's `localStorage` on your own device. Images are loaded from Wikipedia's public API. The page is marked `noindex` and `robots.txt` disallows crawling.

## Files

| File | Content |
| --- | --- |
| `data/content.enc` | Encrypted study content |
| `unlock.js` | Password screen and decryption |
| `app.js`, `styles.css`, `index.html` | The app |
| `tools/encrypt.mjs`, `tools/decrypt.mjs` | Build and restore the encrypted content |
| `sw.js` | Offline support |

## Hosting

GitHub Pages → Settings → Pages → *Deploy from a branch* → `main` / `(root)`.

## Disclaimer

Unofficial. Requirements and fees can change: always confirm with the Canton of Geneva (ge.ch) and the State Secretariat for Migration (sem.admin.ch) before filing.
