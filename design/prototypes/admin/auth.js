/* Kleo Homes — вход в прототип админки.
   ВАЖНО: это имитация для согласования интерфейса. Пароль хранится (в виде хеша)
   в браузере, письма не отправляются, а попадают в «демо-почту».
   В рабочей версии вход, сессии и письма восстановления делает сервер (Payload CMS auth + SMTP).
   Подключение с атрибутом data-guard закрывает страницу для неавторизованных. */
(function () {
  const K = { acc: 'kh_auth', ses: 'kh_session', reset: 'kh_reset', mail: 'kh_mail', fails: 'kh_fails' };
  const get = (st, k, d) => { try { return JSON.parse(st.getItem(k)) ?? d; } catch (e) { return d; } };
  const set = (st, k, v) => { try { st.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const SESSION_HOURS = 8, REMEMBER_DAYS = 14, RESET_MIN = 30, MAX_FAILS = 5, LOCK_SEC = 60;

  const rnd = (n = 16) => [...crypto.getRandomValues(new Uint8Array(n))].map(b => b.toString(16).padStart(2, '0')).join('');
  async function hash(pw, salt) {
    const data = new TextEncoder().encode(salt + ':' + pw);
    if (crypto.subtle) { const h = await crypto.subtle.digest('SHA-256', data); return [...new Uint8Array(h)].map(b => b.toString(16).padStart(2, '0')).join(''); }
    let h = 5381; for (const b of data) h = (h * 33) ^ b; return 'weak' + (h >>> 0).toString(16); // запасной вариант без SubtleCrypto
  }
  const norm = e => String(e || '').trim().toLowerCase();

  const account = () => get(localStorage, K.acc, null);
  function session() {
    const s = get(sessionStorage, K.ses, null) || get(localStorage, K.ses, null), a = account();
    if (!s || !a || s.exp < Date.now() || s.ver !== a.ver || s.email !== a.email) return null;
    return s;
  }

  function checkStrength(pw) {
    const errs = [];
    if (pw.length < 10) errs.push('не короче 10 символов');
    if (!/[a-zа-я]/i.test(pw)) errs.push('хотя бы одна буква');
    if (!/\d/.test(pw)) errs.push('хотя бы одна цифра');
    if (/^(.)\1+$/.test(pw) || /^(1234|qwer|пароль|password)/i.test(pw)) errs.push('слишком простой');
    return errs;
  }

  async function createAccount(email, pw, name) {
    const salt = rnd();
    set(localStorage, K.acc, { email: norm(email), name: name || 'Администратор', salt, hash: await hash(pw, salt), ver: 1, created: Date.now() });
  }

  function lockLeft() { const f = get(localStorage, K.fails, { n: 0, until: 0 }); return Math.max(0, Math.ceil((f.until - Date.now()) / 1000)); }
  async function login(email, pw, remember) {
    if (lockLeft()) return { ok: false, err: `Слишком много попыток. Подождите ${lockLeft()} сек.` };
    const a = account();
    const ok = a && a.email === norm(email) && a.hash === await hash(pw, a.salt);
    if (!ok) {
      const f = get(localStorage, K.fails, { n: 0, until: 0 }); f.n++;
      if (f.n >= MAX_FAILS) { f.until = Date.now() + LOCK_SEC * 1000; f.n = 0; }
      set(localStorage, K.fails, f);
      return { ok: false, err: 'Неверная почта или пароль' + (f.until > Date.now() ? `. Вход заблокирован на ${LOCK_SEC} сек.` : '') };
    }
    localStorage.removeItem(K.fails);
    const s = { email: a.email, ver: a.ver, exp: Date.now() + (remember ? REMEMBER_DAYS * 864e5 : SESSION_HOURS * 36e5) };
    sessionStorage.removeItem(K.ses); localStorage.removeItem(K.ses);
    set(remember ? localStorage : sessionStorage, K.ses, s);
    return { ok: true };
  }
  function logout() { sessionStorage.removeItem(K.ses); localStorage.removeItem(K.ses); location.href = 'login.html?out=1'; }

  // восстановление: ответ всегда одинаковый, чтобы не раскрывать, есть ли такая почта
  function requestReset(email) {
    const a = account();
    if (a && a.email === norm(email)) {
      const token = rnd(24);
      set(localStorage, K.reset, { token, email: a.email, exp: Date.now() + RESET_MIN * 6e4 });
      const link = new URL(`reset.html?token=${token}`, location.href).href;
      const mail = get(localStorage, K.mail, []);
      mail.unshift({ to: a.email, date: new Date().toLocaleString('ru-RU'), subject: 'Восстановление пароля Kleo Homes',
        body: `Здравствуйте!\n\nКто-то запросил сброс пароля для входа в админ-панель Kleo Homes. Если это были вы, перейдите по ссылке. Она действует ${RESET_MIN} минут и работает один раз.\n\nЕсли вы не запрашивали сброс, просто проигнорируйте письмо — пароль не изменится.`, link });
      set(localStorage, K.mail, mail.slice(0, 20));
    }
  }
  function checkToken(token) { const r = get(localStorage, K.reset, null); if (!r || !token || r.token !== token) return 'Ссылка недействительна'; if (r.exp < Date.now()) return 'Срок действия ссылки истёк, запросите новую'; return null; }
  async function resetPassword(token, pw) {
    const e = checkToken(token); if (e) return { ok: false, err: e };
    const a = account(); a.salt = rnd(); a.hash = await hash(pw, a.salt); a.ver++; a.changed = Date.now(); // ver++ завершает все прежние сессии
    set(localStorage, K.acc, a); localStorage.removeItem(K.reset); localStorage.removeItem(K.fails);
    return { ok: true };
  }
  async function changePassword(oldPw, newPw) {
    const a = account(); if (a.hash !== await hash(oldPw, a.salt)) return { ok: false, err: 'Текущий пароль неверный' };
    a.salt = rnd(); a.hash = await hash(newPw, a.salt); a.ver++; set(localStorage, K.acc, a);
    const s = { email: a.email, ver: a.ver, exp: Date.now() + SESSION_HOURS * 36e5 }; sessionStorage.removeItem(K.ses); localStorage.removeItem(K.ses); set(sessionStorage, K.ses, s);
    return { ok: true };
  }

  window.KHA = { account, session, login, logout, createAccount, checkStrength, requestReset, checkToken, resetPassword, changePassword, mail: () => get(localStorage, K.mail, []), clearMail: () => localStorage.removeItem(K.mail), lockLeft };

  // охрана страниц админки
  const me = document.currentScript;
  if (me && me.hasAttribute('data-guard') && !session()) {
    document.documentElement.style.visibility = 'hidden';
    location.replace('login.html?next=' + encodeURIComponent(location.pathname.split('/').pop() + location.search));
  }
})();
