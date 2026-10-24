/* Password gate: the study content is stored encrypted (data/content.enc, AES-256-GCM).
   It is decrypted in this browser only. With "remember", the derived key (not the password)
   is kept in this device's localStorage until "Lock this device" is used. */
(function () {
  'use strict';
  const KEY_STORE = 'natge.key';
  const view = document.getElementById('view');
  const fr = (navigator.language || '').startsWith('fr') || (function () { try { return (JSON.parse(localStorage.getItem('natge.v1')) || {}).settings.lang === 'fr'; } catch (e) { return false; } })();
  const T = fr
    ? { title: 'Contenu protégé', intro: 'Entrez le mot de passe pour ouvrir l’application.', label: 'Mot de passe', remember: 'Se souvenir sur cet appareil', unlock: 'Déverrouiller', busy: 'Déverrouillage…', wrong: 'Mot de passe incorrect. Réessayez.', load: 'Impossible de charger le contenu. Vérifiez votre connexion et réessayez.' }
    : { title: 'Protected content', intro: 'Enter the password to open the app.', label: 'Password', remember: 'Remember on this device', unlock: 'Unlock', busy: 'Unlocking…', wrong: 'Wrong password. Try again.', load: 'Could not load the content. Check your connection and try again.' };
  const b64 = (s) => Uint8Array.from(atob(s), c => c.charCodeAt(0));
  const enc = (u) => btoa(String.fromCharCode(...new Uint8Array(u)));
  let envelope = null;

  document.body.classList.add('locked');

  async function getEnvelope() {
    if (!envelope) {
      const r = await fetch('data/content.enc', { cache: 'no-cache' });
      if (!r.ok) throw new Error('load');
      envelope = await r.json();
    }
    return envelope;
  }
  async function decryptWith(key) {
    const e = await getEnvelope();
    const buf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64(e.iv) }, key, b64(e.ct));
    return JSON.parse(new TextDecoder().decode(buf));
  }
  function start(data) {
    window.QUIZ = data.QUIZ; window.NEWS = data.NEWS; window.CHECKLIST = data.CHECKLIST; window.INTERVIEW = data.INTERVIEW; window.LEARN = data.LEARN;
    document.body.classList.remove('locked');
    const s = document.createElement('script'); s.src = 'app.js'; document.body.appendChild(s);
  }
  window.natgeLock = function () { try { localStorage.removeItem(KEY_STORE); } catch (e) { } location.hash = '#/'; location.reload(); };

  function showForm(msg) {
    view.innerHTML = `
      <section class="panel" style="max-width:420px;margin:40px auto">
        <h1>${T.title}</h1>
        <p class="muted">${T.intro}</p>
        <form id="unlock" autocomplete="off">
          <label class="field" for="pw">${T.label}</label>
          <input id="pw" type="password" required autocomplete="current-password" style="width:100%;font:inherit;padding:12px;min-height:48px;border:2px solid var(--line);border-radius:6px;background:var(--surface);color:var(--ink);margin:6px 0 12px">
          <label style="display:flex;gap:10px;align-items:center;margin-bottom:14px"><input type="checkbox" id="rem" checked style="width:22px;height:22px"> ${T.remember}</label>
          <button class="btn red" type="submit" id="go" style="width:100%">${T.unlock}</button>
          <p id="msg" role="alert" style="color:var(--bad);margin:12px 0 0">${msg || ''}</p>
        </form>
      </section>`;
    const pw = document.getElementById('pw'); pw.focus();
    document.getElementById('unlock').addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const btn = document.getElementById('go'); btn.disabled = true; btn.textContent = T.busy;
      try {
        const e = await getEnvelope();
        const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(pw.value), 'PBKDF2', false, ['deriveKey']);
        const key = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt: b64(e.salt), iterations: e.iter, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, true, ['decrypt']);
        let data;
        try { data = await decryptWith(key); } catch (err) { btn.disabled = false; btn.textContent = T.unlock; pw.value = ''; document.getElementById('msg').textContent = T.wrong; pw.focus(); return; }
        if (document.getElementById('rem').checked) {
          try { localStorage.setItem(KEY_STORE, enc(await crypto.subtle.exportKey('raw', key))); } catch (err) { }
        }
        start(data);
      } catch (err) { btn.disabled = false; btn.textContent = T.unlock; document.getElementById('msg').textContent = T.load; }
    });
  }

  (async function boot() {
    if (!window.crypto || !crypto.subtle) { view.innerHTML = '<p class="panel">This browser cannot decrypt the content (HTTPS and a modern browser are required).</p>'; return; }
    let stored = null; try { stored = localStorage.getItem(KEY_STORE); } catch (e) { }
    if (stored) {
      try {
        const key = await crypto.subtle.importKey('raw', b64(stored), { name: 'AES-GCM' }, false, ['decrypt']);
        return start(await decryptWith(key));
      } catch (e) {
        // OperationError = the stored key no longer matches (password changed): forget it. Anything else = network.
        if (!e || e.name !== 'OperationError') return showForm(T.load);
        try { localStorage.removeItem(KEY_STORE); } catch (x) { }
      }
    }
    showForm();
  })();
})();
