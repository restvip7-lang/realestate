/* Kleo Homes — общие скрипты публичных страниц прототипа. Требует data.js. */
(function () {
  document.documentElement.classList.add('js');

  const RATES = { EUR: [1, '€'], USD: [1.09, '$'], TRY: [45.2, '₺'], RUB: [98, '₽'], KZT: [560, '₸'], GBP: [0.84, '£'] }; // демо-курсы
  let cur = KH.get('kh_cur', 'EUR');
  if (!RATES[cur]) cur = 'EUR';

  const num = n => Math.round(n).toLocaleString('ru-RU').replace(/ |,/g, ' ');
  const fmt = (eur, sfx = '') => { const [r, s] = RATES[cur]; return `${num(eur * r)} ${s}${sfx}`; };
  const priceOf = o => o.deal === 'rent' ? fmt(o.price, ' / мес') : fmt(o.price);

  const ROOMS_HINT = r => { const [a, b] = r.split('+'); return a === '1' && b === '0' ? 'Студия: одна комната с кухней' : `${a} спальн${a === '1' ? 'я' : a < 5 ? 'и' : 'ей'} + ${b} гостиная`; };
  const BADGE = { new: ['new', 'Новостройка'], sea: ['sea', 'Вид на море'] };
  const ICON_HEART = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0E1116" stroke-width="2" aria-hidden="true"><path d="M12 21s-8-5.3-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.7-8 11-8 11z"/></svg>';
  const ICON_PIN = '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7z"/></svg>';

  const favs = new Set(KH.get('kh_favs', []));
  const syncFavCount = () => document.querySelectorAll('[data-fav-count]').forEach(el => { el.textContent = favs.size; el.hidden = !favs.size; });

  function imgSrc(o, w) { return o.cover || KH.IMG(o.img, w); }

  function card(o) {
    const d = KH.district(o.district);
    const badges = (o.deal === 'rent' ? [['rent', 'Аренда']] : []).concat((o.badges || []).slice(0, 1).map(b => BADGE[b]).filter(Boolean));
    const floor = o.type === 'villa' ? `${o.floors} этажа` : `${o.floor} этаж`;
    return `<article class="card rv" data-id="${o.id}">
      <div class="ph"><img src="${imgSrc(o, 640)}" alt="${KH.TYPES[o.type]} ${o.rooms}, ${d.name}, Аланья" loading="lazy" width="640" height="480">
        <div class="badges">${badges.map(([c, t]) => `<span class="badge ${c}">${t}</span>`).join('')}</div>
        <button class="fav" type="button" data-fav="${o.id}" aria-pressed="${favs.has(o.id)}" aria-label="Добавить в избранное">${ICON_HEART}</button>
        <span class="photos"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="12" cy="12" r="3"/></svg>${o.photos || 1} фото</span>
      </div>
      <div class="bd">
        <span class="loc">${ICON_PIN}${d.name} · Аланья</span>
        <h3><a href="property.html?id=${o.id}">${o.title}</a></h3>
        <div class="specs"><span><abbr title="${ROOMS_HINT(o.rooms)}">${o.rooms}</abbr></span><span>${o.area} м²</span><span>${floor}</span><span>${o.sea} м до моря</span></div>
        <div class="price-row"><span class="price" data-price="${o.id}">${priceOf(o)}</span><span class="more">Подробнее →</span></div>
        <span class="upd">${o.deal === 'rent' ? 'Свободна с ' + o.rent.from : fmt(o.price / o.area, '/м²') + ' · цена обновлена ' + o.checked} · <span class="id">ID ${o.id}</span></span>
      </div>
    </article>`;
  }

  function onCurrency(fn) { document.addEventListener('kh:currency', fn); }
  function setCurrency(c) {
    cur = c; KH.set('kh_cur', c);
    document.querySelectorAll('.cur-sel').forEach(s => { s.value = c; });
    document.querySelectorAll('[data-eur]').forEach(el => { el.textContent = fmt(+el.dataset.eur, el.dataset.sfx || ''); });
    document.dispatchEvent(new CustomEvent('kh:currency'));
  }

  function initHeader() {
    document.querySelectorAll('.cur-sel').forEach(s => {
      s.innerHTML = Object.entries(RATES).map(([k, [, sym]]) => `<option value="${k}">${sym} ${k}</option>`).join('');
      s.value = cur;
      s.addEventListener('change', () => setCurrency(s.value));
    });
    document.querySelectorAll('.seg').forEach(g => g.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      g.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b));
      if (g.dataset.lang && b.textContent !== 'RU') toast('EN и TR версии появятся после утверждения текстов');
    }));

    // мобильное меню
    const menu = document.getElementById('mmenu'), opener = document.querySelector('.burger');
    if (menu && opener) {
      const close = () => { menu.classList.remove('open'); opener.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; opener.focus(); };
      opener.addEventListener('click', () => {
        menu.classList.add('open'); opener.setAttribute('aria-expanded', 'true'); document.body.style.overflow = 'hidden';
        menu.querySelector('.panel button, .panel a').focus();
      });
      menu.addEventListener('click', e => { if (e.target.closest('[data-close]') || e.target.closest('.panel nav a')) close(); });
      document.addEventListener('keydown', e => {
        if (!menu.classList.contains('open')) return;
        if (e.key === 'Escape') close();
        if (e.key === 'Tab') { // держим фокус внутри меню
          const f = [...menu.querySelectorAll('a,button,select')]; const first = f[0], last = f[f.length - 1];
          if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
          else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      });
    }

    // избранное
    document.addEventListener('click', e => {
      const b = e.target.closest('[data-fav]'); if (!b) return;
      e.preventDefault();
      const id = +b.dataset.fav; favs.has(id) ? favs.delete(id) : favs.add(id);
      KH.set('kh_favs', [...favs]);
      document.querySelectorAll(`[data-fav="${id}"]`).forEach(x => x.setAttribute('aria-pressed', favs.has(id)));
      syncFavCount();
    });
    syncFavCount();
    setCurrency(cur);
  }

  let io;
  function reveal(root = document) {
    if (!('IntersectionObserver' in window)) { root.querySelectorAll('.rv').forEach(el => el.classList.add('in')); return; }
    io = io || new IntersectionObserver(es => es.forEach(x => { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } }), { rootMargin: '0px 0px -40px 0px' });
    root.querySelectorAll('.rv:not(.in)').forEach(el => io.observe(el));
  }

  function toast(msg) {
    let t = document.getElementById('toast');
    if (!t) { t = document.createElement('div'); t.id = 'toast'; t.setAttribute('role', 'status'); t.style.cssText = 'position:fixed;left:50%;bottom:90px;transform:translateX(-50%);background:#0E1116;color:#fff;padding:12px 18px;border-radius:8px;font-size:14px;z-index:99;max-width:90vw;transition:opacity .3s'; document.body.appendChild(t); }
    t.textContent = msg; t.style.opacity = 1; clearTimeout(t._h); t._h = setTimeout(() => { t.style.opacity = 0; }, 2600);
  }

  // простая проверка формы: data-required, type=tel
  function validate(form) {
    let ok = true;
    form.querySelectorAll('.fld').forEach(f => {
      let bad = false, badEl = null;
      f.querySelectorAll('input,select,textarea').forEach(el => {
        let b = false;
        if (el.type === 'checkbox') b = el.required && !el.checked;
        else if (el.hasAttribute('required') && !String(el.value).trim()) b = true;
        else if (el.type === 'tel' && el.value && !/^[\d\s()+-]{6,}$/.test(el.value)) b = true;
        if (b && !badEl) badEl = el; bad = bad || b;
      });
      f.classList.toggle('invalid', bad); if (bad && ok) { badEl.focus(); ok = false; }
    });
    return ok;
  }

  window.KHS = { fmt, priceOf, card, setCurrency, onCurrency, initHeader, reveal, toast, validate, imgSrc, ROOMS_HINT, get cur() { return cur; } };
})();
