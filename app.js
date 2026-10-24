/* Naturalisation GE — study & application companion.
   All personal state (progress, checklist, settings) lives in this browser's localStorage only. */
(function () {
  'use strict';

  const QUIZ = window.QUIZ, NEWS = window.NEWS || { questions: [], briefs: [], upcoming: [] }, CHECK = window.CHECKLIST, IV = window.INTERVIEW || { cards: [], categories: [] };
  const ALLQ = QUIZ.questions.concat((NEWS.questions || []).map(q => Object.assign({ theme: 'news' }, q)));
  const THEMES = QUIZ.themes;
  const byId = Object.fromEntries(ALLQ.map(q => [q.id, q]));

  /* ---------- storage ---------- */
  const KEY = 'natge.v1';
  const store = (() => {
    let s = {};
    try { s = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { s = {}; }
    s.progress = s.progress || {}; s.checks = s.checks || {}; s.exams = s.exams || [];
    s.settings = Object.assign({ lang: (navigator.language || 'en').startsWith('fr') ? 'fr' : 'en', target: '2027-09', origin: '' }, s.settings || {});
    s.stamped = s.stamped || {}; s.interview = s.interview || {};
    return s;
  })();
  function save() { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) { /* private mode */ } }

  /* ---------- i18n ---------- */
  const UI = {
    en: {
      appName: 'Naturalisation', tabPassport: 'Themes', tabExam: 'Mock test', tabChecklist: 'Application', tabInfo: 'The test',
      homeTitle: 'Your study passport',
      homeIntro: 'Each theme is a stamp. A theme gets stamped once you have answered every one of its questions correctly at least on your latest try.',
      stampedOf: (a, b) => `<b>${a}</b> of ${b} themes stamped`,
      mastered: (a, b) => `${a}/${b} mastered`, stampWord: 'Mastered',
      startExam: 'Take a mock test', reviewMistakes: (n) => `Review ${n} mistake${n === 1 ? '' : 's'}`, noMistakes: 'No mistakes to review',
      continueTheme: 'Practise', tf: 'True or false', single: 'One answer', multi: 'Several answers possible',
      check: 'Check answer', next: 'Next question', finish: 'See results', correct: 'Correct', wrong: 'Not quite',
      correctAnswerIs: 'Correct answer:', source: 'Source', often: '★ often asked',
      qOf: (a, b) => `Question ${a} of ${b}`, sessionDone: 'Session complete', sessionScore: (a, b) => `${a} of ${b} correct`,
      againTheme: 'Practise again', backHome: 'Back to themes', pick: 'Select an answer first',
      examTitle: 'Mock test', examIntro: 'Mirrors the format of the Geneva knowledge test as closely as published information allows. No feedback until the end.',
      examStart: 'Start the mock test', examTime: 'Time limit', examQuestions: 'Questions', examPass: 'Pass mark',
      examHistory: 'Previous attempts', examPassed: 'Pass', examFailed: 'Not yet', timeUp: 'Time is up',
      examReview: 'Review your answers', yourAnswer: 'Your answer:', none: 'none', quit: 'Quit',
      quitConfirm: 'Quit this test? Your answers so far will be lost.',
      appTitle: 'Your application', appIntro: 'A timeline built backwards from the month you plan to file. Ticks are saved only on this device.',
      target: 'Planned filing month', origin: 'Birth certificate from', originNone: 'Choose…', originNZ: 'New Zealand', originHK: 'Hong Kong', originOther: 'Another country',
      daysLeft: 'days to filing', doneCount: (a, b) => `${a} of ${b} tasks done`,
      addAll: 'Add all deadlines to my calendar', addOne: 'Add to calendar', icsHint: 'Creates a calendar file with an alert 7 days and 1 day before each deadline. On iPhone, open it and tap “Add all”.',
      due: 'Due', overdue: 'Overdue', details: 'Details', links: 'Official links',
      infoTitle: 'About the test', newsTitle: 'Swiss & Geneva news to know', newsUpdated: (d) => `Updated ${d}`,
      upcoming: 'Coming up', studyMaterial: 'Official study material', resetAll: 'Reset all progress on this device', lockDevice: 'Lock this device (forget the password)',
      resetConfirm: 'Erase quiz progress, checklist ticks and settings on this device?', resetDone: 'Progress erased',
      imgCredit: 'Image: Wikipedia', themeNews: 'Current events',
      ivTheme: 'Interview practice', ivIntro: 'Open questions the officer may ask after you file. Answer out loud, in French, then compare with the key points.', ivHear: 'What you are likely to hear', ivShow: 'Show the key points', ivOk: 'I could answer this', ivAgain: 'Practise again', ivDone: 'Practice round complete', ivScore: (a, b) => `${a} of ${b} answered confidently`, ivTip: 'Tip', ivReady: (a, b) => `${a}/${b} ready`, ivUpdated: (d) => `Office holders and votes checked on ${d}.`, ivStart: 'Start interview practice', offlineNote: 'Works offline once loaded. Add it to your home screen from the browser’s Share menu.',
      verified: (d) => `Answers checked against official sources on ${d}.`
    },
    fr: {
      appName: 'Naturalisation', tabPassport: 'Thèmes', tabExam: 'Test blanc', tabChecklist: 'Dossier', tabInfo: 'L’examen',
      homeTitle: 'Votre passeport de révision',
      homeIntro: 'Chaque thème est un timbre. Il est tamponné lorsque vous avez répondu juste à toutes ses questions lors de votre dernier essai.',
      stampedOf: (a, b) => `<b>${a}</b> thème${a > 1 ? 's' : ''} tamponné${a > 1 ? 's' : ''} sur ${b}`,
      mastered: (a, b) => `${a}/${b} maîtrisées`, stampWord: 'Maîtrisé',
      startExam: 'Passer un test blanc', reviewMistakes: (n) => `Revoir ${n} erreur${n > 1 ? 's' : ''}`, noMistakes: 'Aucune erreur à revoir',
      continueTheme: 'S’entraîner', tf: 'Vrai ou faux', single: 'Une seule réponse', multi: 'Plusieurs réponses possibles',
      check: 'Valider', next: 'Question suivante', finish: 'Voir les résultats', correct: 'Juste', wrong: 'Pas tout à fait',
      correctAnswerIs: 'Bonne réponse :', source: 'Source', often: '★ souvent posée',
      qOf: (a, b) => `Question ${a} sur ${b}`, sessionDone: 'Série terminée', sessionScore: (a, b) => `${a} sur ${b} justes`,
      againTheme: 'Recommencer', backHome: 'Retour aux thèmes', pick: 'Choisissez d’abord une réponse',
      examTitle: 'Test blanc', examIntro: 'Reproduit le format du test de connaissances genevois aussi fidèlement que le permettent les informations publiées. Correction à la fin seulement.',
      examStart: 'Commencer le test blanc', examTime: 'Durée', examQuestions: 'Questions', examPass: 'Seuil de réussite',
      examHistory: 'Essais précédents', examPassed: 'Réussi', examFailed: 'Pas encore', timeUp: 'Temps écoulé',
      examReview: 'Revoir vos réponses', yourAnswer: 'Votre réponse :', none: 'aucune', quit: 'Quitter',
      quitConfirm: 'Quitter ce test ? Vos réponses seront perdues.',
      appTitle: 'Votre dossier', appIntro: 'Un calendrier construit à rebours depuis le mois où vous prévoyez de déposer votre demande. Les coches sont enregistrées uniquement sur cet appareil.',
      target: 'Mois de dépôt prévu', origin: 'Acte de naissance de', originNone: 'Choisir…', originNZ: 'Nouvelle-Zélande', originHK: 'Hong Kong', originOther: 'Un autre pays',
      daysLeft: 'jours avant le dépôt', doneCount: (a, b) => `${a} tâche${a > 1 ? 's' : ''} sur ${b} faite${a > 1 ? 's' : ''}`,
      addAll: 'Ajouter toutes les échéances à mon agenda', addOne: 'Ajouter à l’agenda', icsHint: 'Crée un fichier d’agenda avec un rappel 7 jours et 1 jour avant chaque échéance. Sur iPhone, ouvrez-le puis touchez « Tout ajouter ».',
      due: 'Échéance', overdue: 'En retard', details: 'Détails', links: 'Liens officiels',
      infoTitle: 'À propos de l’examen', newsTitle: 'Actualité suisse et genevoise à connaître', newsUpdated: (d) => `Mis à jour le ${d}`,
      upcoming: 'À venir', studyMaterial: 'Documentation officielle', resetAll: 'Effacer toute la progression sur cet appareil', lockDevice: 'Verrouiller cet appareil (oublier le mot de passe)',
      resetConfirm: 'Effacer la progression, les coches et les réglages sur cet appareil ?', resetDone: 'Progression effacée',
      imgCredit: 'Image : Wikipédia', themeNews: 'Actualité',
      ivTheme: 'Entraînement à l’entretien', ivIntro: 'Questions ouvertes que l’enquêteur peut poser après le dépôt. Répondez à voix haute, en français, puis comparez avec les points clés.', ivHear: 'Ce que vous entendrez probablement', ivShow: 'Afficher les points clés', ivOk: 'J’ai su répondre', ivAgain: 'À retravailler', ivDone: 'Série terminée', ivScore: (a, b) => `${a} sur ${b} réponses maîtrisées`, ivTip: 'Conseil', ivReady: (a, b) => `${a}/${b} prêtes`, ivUpdated: (d) => `Personnes en fonction et votations vérifiées le ${d}.`, ivStart: 'Commencer l’entraînement à l’entretien', offlineNote: 'Fonctionne hors ligne une fois chargée. Ajoutez-la à l’écran d’accueil depuis le menu Partager du navigateur.',
      verified: (d) => `Réponses vérifiées auprès de sources officielles le ${d}.`
    }
  };
  let lang = store.settings.lang;
  const t = (k, ...a) => { const v = UI[lang][k]; return typeof v === 'function' ? v(...a) : (v ?? k); };
  const L = (o) => (o == null ? '' : typeof o === 'string' ? o : (o[lang] ?? o.en ?? ''));
  const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmtDate = (d) => d.toLocaleDateString(lang === 'fr' ? 'fr-CH' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  function setLang(l) {
    lang = l; store.settings.lang = l; save();
    document.documentElement.lang = l;
    document.querySelectorAll('.lang button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === l)));
    document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    render(true);
  }
  document.querySelectorAll('.lang button').forEach(b => b.addEventListener('click', () => setLang(b.dataset.lang)));

  /* ---------- helpers ---------- */
  const view = document.getElementById('view');
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const themeOf = (id) => id === 'news' ? { id: 'news', glyph: '📰', title: { en: UI.en.themeNews, fr: UI.fr.themeNews } } : THEMES.find(x => x.id === id);
  const qsOfTheme = (id) => ALLQ.filter(q => q.theme === id);
  const isMastered = (q) => { const p = store.progress[q.id]; return !!(p && p.last); };
  const mistakes = () => ALLQ.filter(q => store.progress[q.id] && store.progress[q.id].last === false);
  function toast(msg) { const el = document.createElement('div'); el.className = 'toast'; el.setAttribute('role', 'status'); el.textContent = msg; document.body.appendChild(el); setTimeout(() => el.remove(), 2200); }

  /* Images: thumbnail looked up from Wikipedia's public API at runtime (cached). */
  const imgCache = (() => { try { return JSON.parse(localStorage.getItem('natge.img')) || {}; } catch (e) { return {}; } })();
  function loadImg(spec, fig) {
    if (!spec) return;
    const [wl, title] = spec.includes(':') && spec.indexOf(':') <= 3 ? [spec.slice(0, spec.indexOf(':')), spec.slice(spec.indexOf(':') + 1)] : ['en', spec];
    const put = (d) => {
      if (!d || !d.src) { fig.remove(); return; }
      fig.innerHTML = `<img src="${esc(d.src)}" alt="" referrerpolicy="no-referrer"><figcaption><a href="${esc(d.page)}" target="_blank" rel="noopener" style="color:#fff">${esc(t('imgCredit'))}</a></figcaption>`;
      const img = fig.querySelector('img');
      img.onerror = () => { if (d.fallback && img.src !== d.fallback) img.src = d.fallback; else fig.remove(); };
    };
    if (imgCache[spec]) return put(imgCache[spec]);
    fetch(`https://${wl}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`)
      .then(r => r.ok ? r.json() : null)
      .then(j => {
        const thumb = j && j.thumbnail ? j.thumbnail.source : null;
        const big = thumb && j.originalimage && j.originalimage.width >= 640 ? thumb.replace(/\/\d+px-/, '/640px-') : thumb;
        const d = thumb ? { src: big, fallback: thumb, page: j.content_urls ? j.content_urls.mobile.page : `https://${wl}.wikipedia.org/wiki/${title}` } : null;
        if (d) { imgCache[spec] = d; try { localStorage.setItem('natge.img', JSON.stringify(imgCache)); } catch (e) { } }
        put(d);
      }).catch(() => fig.remove());
  }

  /* ---------- routing ---------- */
  let session = null; // active quiz session (practice / exam / review)
  function route() { return (location.hash.replace(/^#\/?/, '') || '').split('/'); }
  window.addEventListener('hashchange', () => render(false));

  function render(keep) {
    const [r, arg] = route();
    const tab = r === 'exam' ? 'exam' : r === 'checklist' ? 'checklist' : r === 'info' ? 'info' : 'home';
    document.querySelectorAll('.tabbar a').forEach(a => { if (a.dataset.tab === tab) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    const key = location.hash;
    if (session && session.key !== key) { clearInterval(timerInt); session = null; }
    if (r === 'theme' && arg) return renderPractice(arg, key);
    if (r === 'review') return renderPractice('__review', key);
    if (r === 'exam') return session && session.key === key && session.mode === 'exam' ? renderQuestion() : renderExamIntro();
    if (r === 'checklist') return renderChecklist();
    if (r === 'info') return renderInfo();
    if (r === 'interview') return renderInterview(key);
    renderHome();
    if (!keep) window.scrollTo(0, 0);
  }

  /* ---------- home ---------- */
  function renderHome() {
    const themes = THEMES.concat(NEWS.questions && NEWS.questions.length ? [themeOf('news')] : []);
    let stamped = 0;
    const cards = themes.map(th => {
      const qs = qsOfTheme(th.id); const m = qs.filter(isMastered).length; const done = qs.length > 0 && m === qs.length;
      if (done) stamped++;
      const fresh = done && !store.stamped[th.id];
      if (fresh) store.stamped[th.id] = 1;
      if (!done && store.stamped[th.id]) delete store.stamped[th.id];
      return `<li><a class="stamp ${done ? 'done' : ''}" href="#/theme/${th.id}">
        <span class="glyph" aria-hidden="true">${th.glyph}</span>
        <h3>${esc(L(th.title))}</h3>
        <div><div class="meter" aria-hidden="true"><span style="width:${qs.length ? Math.round(100 * m / qs.length) : 0}%"></span></div>
        <div class="count">${t('mastered', m, qs.length)}</div></div>
        ${done ? `<span class="ink ${fresh ? 'fresh' : ''}" aria-label="${esc(t('stampWord'))}">${esc(t('stampWord'))}<br>GE</span>` : ''}
      </a></li>`;
    }).join('');
    let ivCard = '';
    if (IV.cards.length) {
      const n = IV.cards.length, m = IV.cards.filter(c => store.interview[c.id] === 'ok').length, done = m === n;
      if (done) stamped++;
      const fresh = done && !store.stamped.interview;
      if (fresh) store.stamped.interview = 1;
      if (!done && store.stamped.interview) delete store.stamped.interview;
      ivCard = `<li><a class="stamp ${done ? 'done' : ''}" href="#/interview">
        <span class="glyph" aria-hidden="true">🗣️</span>
        <h3>${esc(t('ivTheme'))}</h3>
        <div><div class="meter" aria-hidden="true"><span style="width:${Math.round(100 * m / n)}%"></span></div>
        <div class="count">${t('ivReady', m, n)}</div></div>
        ${done ? `<span class="ink ${fresh ? 'fresh' : ''}" aria-label="${esc(t('stampWord'))}">${esc(t('stampWord'))}<br>GE</span>` : ''}
      </a></li>`;
    }
    save();
    const totalThemes = themes.length + (IV.cards.length ? 1 : 0);
    const mk = mistakes().length;
    view.innerHTML = `
      <section class="passport-head">
        <h1>${t('homeTitle')}</h1>
        <p>${t('homeIntro')}</p>
        <div class="tally">${t('stampedOf', stamped, totalThemes)}</div>
      </section>
      <ul class="stamps">${cards}${ivCard}</ul>
      <div class="btn-row">
        <a class="btn red" href="#/exam">${t('startExam')}</a>
        ${mk ? `<a class="btn secondary" href="#/review">${t('reviewMistakes', mk)}</a>` : `<button class="btn secondary" disabled>${t('noMistakes')}</button>`}
      </div>
      <p class="small muted">${t('verified', QUIZ.verified)}</p>`;
  }

  /* ---------- practice ---------- */
  function renderPractice(themeId, key) {
    if (!session || session.key !== key) {
      let pool;
      if (themeId === '__review') pool = mistakes();
      else pool = qsOfTheme(themeId);
      if (!pool.length) { location.hash = '#/'; return; }
      // unmastered first, then the rest; cap at 10 per session
      const un = shuffle(pool.filter(q => !isMastered(q))), ma = shuffle(pool.filter(isMastered));
      const list = un.concat(ma).slice(0, 10);
      session = makeSession(key, 'practice', list, themeId);
    }
    renderQuestion();
  }
  function makeSession(key, mode, list, themeId) {
    return {
      key, mode, themeId, i: 0, list: list.map(q => ({ id: q.id, order: q.keep ? q.options.map((_, k) => k) : shuffle(q.options.map((_, k) => k)), sel: [], checked: false })),
      started: Date.now(), deadline: null, finished: false
    };
  }

  function record(q, ok) {
    const p = store.progress[q.id] || { n: 0, ok: 0 };
    p.n++; if (ok) p.ok++; p.last = ok; store.progress[q.id] = p; save();
  }
  const sameSet = (a, b) => a.length === b.length && a.every(x => b.includes(x));

  let timerInt = null;
  function renderQuestion() {
    clearInterval(timerInt);
    const s = session;
    if (s.finished) return renderResults();
    const item = s.list[s.i], q = byId[item.id], th = themeOf(q.theme);
    const multi = q.answer.length > 1 || q.multi;
    const exam = s.mode === 'exam';
    const showFb = item.checked && !exam;
    const crumb = exam ? t('examTitle') : s.themeId === '__review' ? t('reviewMistakes', s.list.length) : L(th.title);
    const opts = item.order.map((k, pos) => {
      let cls = multi ? 'multi' : 'single';
      if (showFb) {
        const isAns = q.answer.includes(k), chosen = item.sel.includes(k);
        if (isAns && chosen) cls += ' correct'; else if (chosen) cls += ' wrong'; else if (isAns) cls += ' correct missed';
      }
      return `<li><button type="button" class="opt ${cls}" data-k="${k}" aria-pressed="${item.sel.includes(k)}" ${showFb ? 'disabled' : ''}>
        <span class="key" aria-hidden="true">${'ABCDEFG'[pos]}</span><span>${esc(L(q.options[k]))}</span></button></li>`;
    }).join('');
    let fb = '';
    if (showFb) {
      const ok = sameSet(item.sel, q.answer);
      fb = `<div class="feedback ${ok ? 'ok' : 'ko'}" role="status"><strong>${ok ? t('correct') : t('wrong')}</strong>
        ${ok ? '' : `<div>${t('correctAnswerIs')} ${q.answer.map(k => esc(L(q.options[k]))).join(' · ')}</div>`}
        <div>${esc(L(q.explain))}</div>
        ${q.source ? `<div class="source">${t('source')}: <a href="${esc(q.source)}" target="_blank" rel="noopener">${esc(new URL(q.source).hostname.replace('www.', ''))}</a></div>` : ''}</div>`;
    }
    const last = s.i === s.list.length - 1;
    const actionBtn = exam
      ? `<button class="btn" id="go" ${item.sel.length ? '' : 'disabled'}>${last ? t('finish') : t('next')}</button>`
      : item.checked
        ? `<button class="btn" id="go">${last ? t('finish') : t('next')}</button>`
        : `<button class="btn" id="check" ${item.sel.length ? '' : 'disabled'}>${t('check')}</button>`;
    view.innerHTML = `
      <div class="qtop"><span class="crumb">${esc(crumb)}</span>
        ${exam ? `<span class="timer" id="timer" aria-live="off"></span>` : ''}
        <button class="linkbtn" id="quit">${t('quit')}</button></div>
      <div class="progress" aria-hidden="true"><span style="width:${Math.round(100 * (s.i + (item.checked ? 1 : 0)) / s.list.length)}%"></span></div>
      <article class="qcard">
        ${q.img ? `<figure class="qimg" id="qimg" style="margin:0"></figure>` : ''}
        <div class="qbody">
          <div class="small muted">${t('qOf', s.i + 1, s.list.length)}${q.often ? `<span class="flag-often">${t('often')}</span>` : ''}</div>
          <span class="qtype">${q.keep ? t('tf') : multi ? t('multi') : t('single')}</span>
          <h2 class="qtext" id="qtext">${esc(L(q.q))}</h2>
          <ul class="options" role="group" aria-labelledby="qtext">${opts}</ul>
          ${fb}
          <div class="btn-row">${actionBtn}</div>
        </div>
      </article>`;
    if (q.img) loadImg(q.img, document.getElementById('qimg'));
    view.querySelectorAll('.opt').forEach(b => b.addEventListener('click', () => {
      const k = +b.dataset.k;
      if (multi) item.sel = item.sel.includes(k) ? item.sel.filter(x => x !== k) : item.sel.concat(k);
      else item.sel = [k];
      renderQuestion();
      const again = view.querySelector(`.opt[data-k="${k}"]`); if (again) again.focus();
    }));
    const check = document.getElementById('check');
    if (check) check.addEventListener('click', () => { item.checked = true; record(q, sameSet(item.sel, q.answer)); renderQuestion(); const f = view.querySelector('.feedback'); if (f) f.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); });
    const go = document.getElementById('go');
    if (go) go.addEventListener('click', () => {
      if (exam) item.checked = true;
      if (last) { finish(); } else { s.i++; renderQuestion(); window.scrollTo(0, 0); }
    });
    document.getElementById('quit').addEventListener('click', () => {
      if (exam && !confirm(t('quitConfirm'))) return;
      clearInterval(timerInt); session = null; location.hash = '#/';
    });
    if (exam) startTimer();
  }

  function startTimer() {
    const el = document.getElementById('timer');
    const tick = () => {
      const left = Math.max(0, session.deadline - Date.now());
      const m = Math.floor(left / 60000), sec = Math.floor(left / 1000) % 60;
      if (el) { el.textContent = `${m}:${String(sec).padStart(2, '0')}`; el.classList.toggle('low', left < 120000); }
      if (left <= 0) { clearInterval(timerInt); toast(t('timeUp')); finish(); }
    };
    tick(); timerInt = setInterval(tick, 1000);
  }

  function finish() {
    clearInterval(timerInt);
    const s = session; s.finished = true;
    if (s.mode === 'exam') {
      let ok = 0;
      s.list.forEach(it => { const q = byId[it.id]; const good = sameSet(it.sel, q.answer); if (good) ok++; if (it.sel.length) record(q, good); });
      s.score = ok;
      store.exams.unshift({ d: new Date().toISOString().slice(0, 10), ok, n: s.list.length }); store.exams = store.exams.slice(0, 20); save();
    } else {
      s.score = s.list.filter(it => sameSet(it.sel, byId[it.id].answer)).length;
    }
    renderResults(); window.scrollTo(0, 0);
  }

  function renderResults() {
    const s = session, n = s.list.length, ok = s.score;
    const exam = s.mode === 'exam';
    const passN = exam ? Math.ceil(n * QUIZ.exam.passRatio) : null;
    const pass = exam ? ok >= passN : ok === n;
    const review = s.list.map((it, idx) => {
      const q = byId[it.id]; const good = sameSet(it.sel, q.answer);
      return `<div class="review-item"><div class="small muted">${idx + 1}. ${esc(L(themeOf(q.theme).title))}</div>
        <div style="font-weight:700">${good ? '✓' : '✗'} ${esc(L(q.q))}</div>
        ${good ? '' : `<div class="small">${t('yourAnswer')} ${it.sel.length ? it.sel.map(k => esc(L(q.options[k]))).join(' · ') : t('none')}</div>
        <div class="small">${t('correctAnswerIs')} <b>${q.answer.map(k => esc(L(q.options[k]))).join(' · ')}</b></div>
        <div class="small muted">${esc(L(q.explain))}</div>`}</div>`;
    }).join('');
    view.innerHTML = `
      <h1>${exam ? t('examTitle') : t('sessionDone')}</h1>
      <div class="score-big ${pass ? 'pass' : 'fail'}">${ok}/${n}</div>
      <p>${exam ? `${pass ? t('examPassed') : t('examFailed')} · ${t('examPass')}: ${passN}/${n}` : t('sessionScore', ok, n)}</p>
      <div class="btn-row">
        <button class="btn" id="again">${exam ? t('startExam') : t('againTheme')}</button>
        <a class="btn secondary" href="#/">${t('backHome')}</a>
      </div>
      ${exam ? `<section class="panel"><h2>${t('examReview')}</h2>${review}</section>` : ''}`;
    document.getElementById('again').addEventListener('click', () => {
      const key = location.hash; session = null;
      if (exam) { startExam(); } else { render(false); }
    });
  }

  /* ---------- exam ---------- */
  function renderExamIntro() {
    const E = QUIZ.exam;
    const hist = store.exams.slice(0, 8).map(e => `<li>${e.d}: ${e.ok}/${e.n} — ${e.ok >= Math.ceil(e.n * E.passRatio) ? t('examPassed') : t('examFailed')}</li>`).join('');
    view.innerHTML = `
      <h1>${t('examTitle')}</h1>
      <p>${t('examIntro')}</p>
      <section class="panel lake">
        <dl class="facts">
          <dt>${t('examQuestions')}</dt><dd>${E.count}</dd>
          <dt>${t('examTime')}</dt><dd>${E.minutes} min</dd>
          <dt>${t('examPass')}</dt><dd>${Math.ceil(E.count * E.passRatio)}/${E.count}</dd>
        </dl>
        <p class="small" style="margin-top:12px">${esc(L(E.note))}</p>
      </section>
      <div class="btn-row"><button class="btn red" id="start">${t('examStart')}</button></div>
      ${hist ? `<section class="panel"><h2>${t('examHistory')}</h2><ul class="info-list">${hist}</ul></section>` : ''}`;
    document.getElementById('start').addEventListener('click', startExam);
  }
  function startExam() {
    const E = QUIZ.exam;
    // spread across themes according to configured weights
    const picked = [];
    Object.entries(E.weights).forEach(([th, w]) => {
      const pool = shuffle(qsOfTheme(th)); picked.push(...pool.slice(0, Math.round(E.count * w)));
    });
    const rest = shuffle(ALLQ.filter(q => !picked.includes(q)));
    while (picked.length < E.count && rest.length) picked.push(rest.pop());
    const list = shuffle(picked.slice(0, E.count));
    session = makeSession(location.hash || '#/exam', 'exam', list, null);
    session.deadline = Date.now() + E.minutes * 60000;
    renderQuestion();
  }

  /* ---------- interview practice ---------- */
  function renderInterview(key) {
    if (!session || session.key !== key) {
      const un = shuffle(IV.cards.filter(c => store.interview[c.id] !== 'ok')), ok = shuffle(IV.cards.filter(c => store.interview[c.id] === 'ok'));
      session = { key, mode: 'interview', i: 0, list: un.concat(ok).map(c => c.id), reveal: false, ok: 0, finished: false };
    }
    const s = session;
    if (s.finished) {
      view.innerHTML = `<h1>${t('ivDone')}</h1>
        <div class="score-big ${s.ok === s.list.length ? 'pass' : 'fail'}">${s.ok}/${s.list.length}</div>
        <p>${t('ivScore', s.ok, s.list.length)}</p>
        <div class="btn-row"><button class="btn" id="again">${t('againTheme')}</button><a class="btn secondary" href="#/">${t('backHome')}</a></div>`;
      document.getElementById('again').addEventListener('click', () => { session = null; renderInterview(key); });
      return;
    }
    const c = IV.cards.find(x => x.id === s.list[s.i]);
    const cat = IV.categories.find(x => x.id === c.cat);
    view.innerHTML = `
      <div class="qtop"><span class="crumb">${esc(t('ivTheme'))} · ${esc(L(cat.title))}</span><button class="linkbtn" id="quit">${t('quit')}</button></div>
      <div class="progress" aria-hidden="true"><span style="width:${Math.round(100 * s.i / s.list.length)}%"></span></div>
      ${s.i === 0 && !s.reveal ? `<p class="small muted">${esc(t('ivIntro'))}</p>` : ''}
      <article class="qcard"><div class="qbody">
        <div class="small muted">${t('qOf', s.i + 1, s.list.length)}</div>
        <span class="qtype">${esc(t('ivHear'))}</span>
        <h2 class="qtext" lang="fr">« ${esc(c.q.fr)} »</h2>
        ${lang === 'en' ? `<p class="muted" style="margin-top:-8px">${esc(c.q.en)}</p>` : ''}
        ${s.reveal ? `<div class="feedback ok"><ul class="info-list" style="margin:0">${c.points.map(p => `<li>${esc(L(p))}</li>`).join('')}</ul>
            ${c.tip ? `<p style="margin:10px 0 0"><strong style="display:inline">${t('ivTip')}:</strong> ${esc(L(c.tip))}</p>` : ''}
            ${c.source ? `<div class="source">${t('source')}: <a href="${esc(c.source)}" target="_blank" rel="noopener">${esc(new URL(c.source).hostname.replace('www.', ''))}</a></div>` : ''}</div>
          <div class="btn-row"><button class="btn" id="ok">${t('ivOk')}</button><button class="btn secondary" id="again">${t('ivAgain')}</button></div>`
        : `<div class="btn-row"><button class="btn" id="show">${t('ivShow')}</button></div>`}
      </div></article>
      <p class="small muted">${esc(t('ivUpdated', IV.updated))}</p>`;
    const next = (ok) => { store.interview[c.id] = ok ? 'ok' : 'again'; save(); if (ok) s.ok++; s.reveal = false; if (s.i === s.list.length - 1) s.finished = true; else s.i++; renderInterview(key); window.scrollTo(0, 0); };
    const show = document.getElementById('show'); if (show) show.addEventListener('click', () => { s.reveal = true; renderInterview(key); });
    const ok = document.getElementById('ok'); if (ok) ok.addEventListener('click', () => next(true));
    const ag = document.getElementById('again'); if (ag) ag.addEventListener('click', () => next(false));
    document.getElementById('quit').addEventListener('click', () => { session = null; location.hash = '#/'; });
  }

  /* ---------- checklist ---------- */
  function filingDate() { const [y, m] = store.settings.target.split('-').map(Number); return new Date(y, m - 1, 1); }
  function itemDue(it) { const d = filingDate(); d.setDate(d.getDate() + it.offsetDays); return d; }
  function visibleItems() {
    const o = store.settings.origin;
    return CHECK.phases.map(p => ({ p, items: p.items.filter(it => !it.origin || it.origin === o || (it.origin === 'other' && o === '')) }));
  }

  function renderChecklist() {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const fd = filingDate();
    const days = Math.ceil((fd - today) / 86400000);
    const phases = visibleItems();
    const all = phases.flatMap(x => x.items);
    const doneN = all.filter(it => store.checks[it.id]).length;
    let nowMarked = false;
    const html = phases.map(({ p, items }) => {
      if (!items.length) return '';
      const dates = items.map(itemDue).sort((a, b) => a - b);
      const allDone = items.every(it => store.checks[it.id]);
      let cls = allDone ? 'past' : '';
      if (!allDone && !nowMarked) { cls = 'now'; nowMarked = true; }
      const range = p.window ? L(p.window) : fmtDate(dates[0]);
      return `<li class="phase ${cls}"><span class="phase-dot" aria-hidden="true"></span>
        <div class="phase-date">${esc(range)}</div><h2>${esc(L(p.title))}</h2>
        ${p.intro ? `<p class="small muted">${esc(L(p.intro))}</p>` : ''}
        ${items.map(it => {
          const due = itemDue(it), done = !!store.checks[it.id], late = !done && due < today;
          return `<div class="task ${done ? 'done' : ''}">
            <input type="checkbox" id="c-${it.id}" data-id="${it.id}" ${done ? 'checked' : ''}>
            <div style="flex:1;min-width:0">
              <label for="c-${it.id}" class="task-title">${esc(L(it.title))}</label>${it.origin === 'nz' || it.origin === 'hk' ? `<span class="tag nz">${it.origin.toUpperCase()}</span>` : ''}${it.fixed ? `<span class="tag">${esc(L(it.fixed))}</span>` : ''}
              <div class="task-due ${late ? 'late' : ''}">${late ? t('overdue') : t('due')}: ${fmtDate(due)}</div>
              ${(it.detail || it.list || it.links) ? `<details><summary>${t('details')}</summary>
                ${it.detail ? `<p>${esc(L(it.detail))}</p>` : ''}
                ${it.list ? `<ul>${it.list.map(x => `<li>${esc(L(x))}</li>`).join('')}</ul>` : ''}
                ${it.links ? `<p class="small">${it.links.map(l => `<a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(L(l.label))}</a>`).join('<br>')}</p>` : ''}
                <button class="linkbtn" data-ics="${it.id}">${t('addOne')}</button>
              </details>` : ''}
            </div></div>`;
        }).join('')}</li>`;
    }).join('');
    const opt = (v, label) => `<option value="${v}" ${store.settings.origin === v ? 'selected' : ''}>${label}</option>`;
    view.innerHTML = `
      <h1>${t('appTitle')}</h1>
      <p>${t('appIntro')}</p>
      <section class="panel">
        <div class="settings-grid">
          <label class="field">${t('target')}<input type="month" id="target" value="${store.settings.target}" min="2026-11"></label>
          <label class="field">${t('origin')}<select id="origin">${opt('', t('originNone'))}${opt('nz', t('originNZ'))}${opt('hk', t('originHK'))}${opt('other', t('originOther'))}</select></label>
        </div>
        <div class="countdown" style="margin-top:14px"><span><span class="n">${Math.max(0, days)}</span> ${t('daysLeft')}</span><span class="muted">${t('doneCount', doneN, all.length)}</span></div>
      </section>
      ${CHECK.notice ? `<section class="panel gold small">${esc(L(CHECK.notice))}</section>` : ''}
      <ol class="timeline">${html}</ol>
      <section class="panel lake">
        <button class="btn" id="icsAll" style="width:100%">${t('addAll')}</button>
        <p class="small" style="margin:10px 0 0">${t('icsHint')}</p>
      </section>
      <p class="small muted">${esc(L(CHECK.disclaimer))}</p>`;
    document.getElementById('target').addEventListener('change', e => { if (e.target.value) { store.settings.target = e.target.value; save(); renderChecklist(); } });
    document.getElementById('origin').addEventListener('change', e => { store.settings.origin = e.target.value; save(); renderChecklist(); });
    view.querySelectorAll('input[type=checkbox][data-id]').forEach(cb => cb.addEventListener('change', () => {
      if (cb.checked) store.checks[cb.dataset.id] = new Date().toISOString().slice(0, 10); else delete store.checks[cb.dataset.id];
      save(); renderChecklist();
      const again = document.getElementById(cb.id); if (again) again.focus();
    }));
    view.querySelectorAll('[data-ics]').forEach(b => b.addEventListener('click', () => {
      const it = all.find(x => x.id === b.dataset.ics); downloadICS([it], 'deadline');
    }));
    document.getElementById('icsAll').addEventListener('click', () => downloadICS(all.filter(it => !store.checks[it.id]), 'naturalisation-deadlines'));
  }

  function downloadICS(items, name) {
    const pad = (n) => String(n).padStart(2, '0');
    const ymd = (d) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
    const fold = (s) => s.replace(/[\\;,]/g, m => '\\' + m).replace(/\n/g, '\\n');
    const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
    const ev = items.map(it => {
      const d = itemDue(it), e = new Date(d); e.setDate(e.getDate() + 1);
      const desc = [L(it.detail), ...(it.list || []).map(x => '- ' + L(x)), ...(it.links || []).map(l => L(l.label) + ': ' + l.url)].filter(Boolean).join('\n');
      return ['BEGIN:VEVENT', `UID:${it.id}-${store.settings.target}@natge`, `DTSTAMP:${stamp}`,
        `DTSTART;VALUE=DATE:${ymd(d)}`, `DTEND;VALUE=DATE:${ymd(e)}`,
        `SUMMARY:${fold('🇨🇭 ' + L(it.title))}`, `DESCRIPTION:${fold(desc)}`,
        'BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${fold(L(it.title))}`, 'TRIGGER:-P7D', 'END:VALARM',
        'BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${fold(L(it.title))}`, 'TRIGGER:-PT15H', 'END:VALARM',
        'END:VEVENT'].join('\r\n');
    });
    const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//natge//study//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', ...ev, 'END:VCALENDAR'].join('\r\n');
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name + '.ics';
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }

  /* ---------- info ---------- */
  function renderInfo() {
    const I = QUIZ.info;
    const briefs = (NEWS.briefs || []).map(b => `<div class="news-item"><div class="date">${esc(b.date)}</div><strong>${esc(L(b.title))}</strong><div class="small">${esc(L(b.text))}</div>
      ${b.source ? `<div class="source"><a href="${esc(b.source)}" target="_blank" rel="noopener">${t('source')}</a></div>` : ''}</div>`).join('');
    const up = (NEWS.upcoming || []).map(u => `<li><b>${esc(u.date)}</b> — ${esc(L(u.title))}</li>`).join('');
    view.innerHTML = `
      <h1>${t('infoTitle')}</h1>
      ${I.sections.map(sec => `<section class="panel"><h2>${esc(L(sec.title))}</h2>
        ${sec.text ? `<p>${esc(L(sec.text))}</p>` : ''}
        ${sec.list ? `<ul class="info-list">${sec.list.map(x => `<li>${esc(L(x))}</li>`).join('')}</ul>` : ''}
        ${sec.source ? `<p class="source small"><a href="${esc(sec.source)}" target="_blank" rel="noopener">${t('source')}</a></p>` : ''}</section>`).join('')}
      ${IV.cards.length ? `<div class="btn-row"><a class="btn" href="#/interview">${t('ivStart')}</a></div>` : ''}
      <section class="panel"><h2>${t('studyMaterial')}</h2><ul class="info-list">${I.links.map(l => `<li><a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(L(l.label))}</a></li>`).join('')}</ul></section>
      <section class="panel"><h2>${t('newsTitle')}</h2><p class="small muted">${t('newsUpdated', NEWS.updated)}</p>${briefs}
        ${up ? `<h3>${t('upcoming')}</h3><ul class="info-list">${up}</ul>` : ''}</section>
      <p class="small muted">${t('offlineNote')}</p>
      <p><button class="linkbtn" id="lock">${t('lockDevice')}</button></p>
      <button class="linkbtn" id="reset">${t('resetAll')}</button>`;
    document.getElementById('lock').addEventListener('click', () => { if (window.natgeLock) window.natgeLock(); });
    document.getElementById('reset').addEventListener('click', () => {
      if (!confirm(t('resetConfirm'))) return;
      store.progress = {}; store.checks = {}; store.exams = []; store.stamped = {}; store.interview = {}; store.settings.origin = ''; store.settings.target = '2027-09'; save(); toast(t('resetDone'));
    });
  }

  /* ---------- boot ---------- */
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => { });
  setLang(lang);
})();
