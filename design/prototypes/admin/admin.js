/* Kleo Homes — общий каркас прототипа админки. Требует ../assets/data.js */
(function () {
  const NAV = [
    ['objects', 'Объекты', 'objects.html', '<path d="M3 11l9-7 9 7v9H3z"/>'],
    ['posts', 'Новости и статьи', 'posts.html', '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>'],
    ['leads', 'Заявки', '#', '<path d="M4 4h16v12H7l-3 3z"/>', true],
    ['districts', 'Районы', '#', '<path d="M12 21s7-7 7-12a7 7 0 0 0-14 0c0 5 7 12 7 12z"/>', true],
    ['team', 'Команда', 'team.html', '<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3 3-5 6-5s6 2 6 5M17 11a3 3 0 1 0 0-6M21 20c0-2-1-4-4-4.5"/>'],
    ['reviews', 'Отзывы', '#', '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>', true],
    ['settings', 'Настройки', '#', '<circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1l2-1.6-2-3.4-2.4 1a7 7 0 0 0-1.7-1L14.5 3h-5l-.3 2.9a7 7 0 0 0-1.7 1l-2.4-1-2 3.4 2 1.6a7 7 0 0 0 0 2l-2 1.6 2 3.4 2.4-1a7 7 0 0 0 1.7 1l.3 2.9h5l.3-2.9a7 7 0 0 0 1.7-1l2.4 1 2-3.4-2-1.6c.1-.3.1-.7.1-1z"/>', true]
  ];

  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function shell(active, title, actionsHtml = '') {
    const body = document.body; body.classList.add('adm');
    const main = document.getElementById('adm-content');
    const wrap = document.createElement('div'); wrap.className = 'adm-shell';
    wrap.innerHTML = `
      <aside class="adm-side" id="adm-side" aria-label="Разделы админки">
        <a href="objects.html" class="logo"><span class="wm"><b>KLEO</b><small>ADMIN</small></span></a>
        <nav class="adm-nav">${NAV.map(([k, t, h, ic, soon]) => `<a href="${h}" ${k === active ? 'aria-current="page"' : ''} ${soon ? 'data-soon' : ''}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">${ic}</svg>${t}${soon ? '<span class="soon">позже</span>' : ''}</a>`).join('')}</nav>
        <div class="me"><div style="display:flex;gap:10px;align-items:center;margin-bottom:10px"><img src="${KH.IMG((KH.member('expert1') || KH.TEAM[0] || { img: KH.PHOTOS.office }).img, 96)}" alt="" style="width:40px;height:40px;border-radius:999px;object-fit:cover"><div><b>${esc((window.KHA && KHA.account()?.name) || 'Администратор')}</b><span style="font-size:12.5px">${esc((window.KHA && KHA.account()?.email) || '')}</span></div></div><a href="account.html" style="color:var(--sea-light)">Сменить пароль</a> · <a href="#" id="logout" style="color:var(--sea-light)">Выйти</a><br><a href="../home-v2.html" style="color:rgba(255,255,255,.6)">← На сайт</a></div>
      </aside>
      <div class="adm-main">
        <header class="adm-top">
          <button class="icon-btn adm-burger" type="button" aria-label="Меню разделов" aria-controls="adm-side" aria-expanded="false" style="border-color:var(--line)"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>
          <h1>${title}</h1>
          <div class="r">${actionsHtml}</div>
        </header>
        <div class="adm-body"><div class="adm-demo">Прототип админки: данные хранятся только в этом браузере (localStorage). В рабочей версии это Payload CMS с входом по паролю и ролями. <button type="button" class="mini-btn" id="reset-demo" style="margin-left:6px">Сбросить демо</button></div></div>
      </div>`;
    body.prepend(wrap);
    wrap.querySelector('.adm-body').appendChild(main);
    const side = wrap.querySelector('#adm-side'), burger = wrap.querySelector('.adm-burger');
    burger.addEventListener('click', () => { const o = side.classList.toggle('open'); burger.setAttribute('aria-expanded', o); });
    document.addEventListener('click', e => { if (side.classList.contains('open') && !side.contains(e.target) && !burger.contains(e.target)) { side.classList.remove('open'); burger.setAttribute('aria-expanded', false); } });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && side.classList.contains('open')) { side.classList.remove('open'); burger.focus(); } });
    wrap.querySelectorAll('[data-soon]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); toast('Этот раздел появится в следующих прототипах'); }));
    wrap.querySelector('#logout').addEventListener('click', e => { e.preventDefault(); KHA.logout(); });
    wrap.querySelector('#reset-demo').addEventListener('click', () => { if (confirm('Удалить все демо-изменения из этого браузера?')) { KH.resetDemo(); location.reload(); } });
  }

  function toast(msg) {
    let t = document.getElementById('toast');
    if (!t) { t = document.createElement('div'); t.id = 'toast'; t.setAttribute('role', 'status'); t.style.cssText = 'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);background:#0E1116;color:#fff;padding:12px 18px;border-radius:8px;font-size:14px;z-index:99;max-width:90vw;transition:opacity .3s'; document.body.appendChild(t); }
    t.textContent = msg; t.style.opacity = 1; clearTimeout(t._h); t._h = setTimeout(() => { t.style.opacity = 0; }, 2800);
  }

  const OBJ_ST = { published: 'Опубликован', draft: 'Черновик', reserved: 'Бронь', sold: 'Продан', rented: 'Сдан', hidden: 'Снят' };
  const POST_ST = { published: 'Опубликовано', draft: 'Черновик', scheduled: 'Запланировано' };
  const eur = n => Math.round(n).toLocaleString('ru-RU').replace(/ |,/g, ' ') + ' €';

  window.ADM = { shell, toast, OBJ_ST, POST_ST, eur, esc };
})();
