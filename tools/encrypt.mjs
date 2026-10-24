#!/usr/bin/env node
// Builds data/content.enc from the plain-text sources in src/ (which are never committed).
// Usage: NATGE_PASSWORD='…' node tools/encrypt.mjs
// Format: AES-256-GCM, key from PBKDF2-SHA256 (600,000 iterations), readable by the browser's WebCrypto.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { webcrypto as crypto } from 'node:crypto';
import vm from 'node:vm';

const pw = process.env.NATGE_PASSWORD;
if (!pw) { console.error('Set NATGE_PASSWORD'); process.exit(1); }
const FILES = ['questions', 'news', 'checklist', 'interview'];
const ITER = 600000;

const sandbox = { window: {} };
vm.createContext(sandbox);
for (const f of FILES) {
  const p = `src/${f}.js`;
  if (!existsSync(p)) { console.error(`Missing ${p} — run tools/decrypt.mjs first`); process.exit(1); }
  vm.runInContext(readFileSync(p, 'utf8'), sandbox, { filename: p });
}
const w = sandbox.window;
for (const k of ['QUIZ', 'NEWS', 'CHECKLIST', 'INTERVIEW']) if (!w[k]) { console.error(`src did not define window.${k}`); process.exit(1); }
const plain = new TextEncoder().encode(JSON.stringify({ QUIZ: w.QUIZ, NEWS: w.NEWS, CHECKLIST: w.CHECKLIST, INTERVIEW: w.INTERVIEW }));

const salt = crypto.getRandomValues(new Uint8Array(16));
const iv = crypto.getRandomValues(new Uint8Array(12));
const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(pw), 'PBKDF2', false, ['deriveKey']);
const key = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: ITER, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt']);
const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plain));
const b64 = (u) => Buffer.from(u).toString('base64');
writeFileSync('data/content.enc', JSON.stringify({ v: 1, kdf: 'PBKDF2-SHA256', iter: ITER, salt: b64(salt), iv: b64(iv), ct: b64(ct) }));
console.log(`data/content.enc written (${(ct.length / 1024).toFixed(0)} KB, ${w.QUIZ.questions.length} questions)`);
