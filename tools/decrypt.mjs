#!/usr/bin/env node
// Restores editable plain-text sources in src/ from data/content.enc.
// Usage: NATGE_PASSWORD='…' node tools/decrypt.mjs
// Then edit src/*.js and run tools/encrypt.mjs. src/ is git-ignored and must never be committed.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { webcrypto as crypto } from 'node:crypto';

const pw = process.env.NATGE_PASSWORD;
if (!pw) { console.error('Set NATGE_PASSWORD'); process.exit(1); }
const env = JSON.parse(readFileSync('data/content.enc', 'utf8'));
const u = (s) => new Uint8Array(Buffer.from(s, 'base64'));
const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(pw), 'PBKDF2', false, ['deriveKey']);
const key = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt: u(env.salt), iterations: env.iter, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
let data;
try {
  data = JSON.parse(new TextDecoder().decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: u(env.iv) }, key, u(env.ct))));
} catch (e) { console.error('Wrong password or damaged file'); process.exit(1); }
mkdirSync('src', { recursive: true });
const map = { questions: 'QUIZ', news: 'NEWS', checklist: 'CHECKLIST', interview: 'INTERVIEW' };
for (const [f, k] of Object.entries(map)) {
  const p = `src/${f}.js`;
  if (existsSync(p) && !process.argv.includes('--force')) { console.log(`${p} exists, kept (use --force to overwrite)`); continue; }
  writeFileSync(p, `/* Decrypted from data/content.enc — edit, then run tools/encrypt.mjs. Never commit this file. */\nwindow.${k} = ${JSON.stringify(data[k], null, 2)};\n`);
  console.log(`${p} written`);
}
