(() => {
  'use strict';
  const D = JSON.parse(document.getElementById('i18n').textContent);
  const root = document.documentElement;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pad = (n) => String(n).padStart(2, '0');

  /* ---------- Entrance ---------- */
  const ready = () => requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('is-ready')));
  const img = $('.hero-img');
  Promise.race([
    Promise.all([document.fonts ? document.fonts.ready : 0, img && !img.complete ? new Promise((r) => { img.onload = img.onerror = r; }) : 0]),
    new Promise((r) => setTimeout(r, 900)),
  ]).then(ready);
  const curtain = $('.curtain');
  if (curtain && root.classList.contains('curtain-on')) {
    $('.curtain-r', curtain).addEventListener('animationend', () => { curtain.remove(); root.classList.remove('curtain-on'); }, { once: true });
    setTimeout(() => curtain.isConnected && curtain.remove(), 2600);
  }

  /* ---------- Top bar, dock, current section ---------- */
  const top = $('[data-top]');
  const sentinel = document.createElement('div');
  sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:40px;pointer-events:none';
  document.body.prepend(sentinel);
  new IntersectionObserver(([e]) => top.toggleAttribute('data-scrolled', !e.isIntersecting)).observe(sentinel);

  const dock = $('[data-dock]');
  let heroIn = true, bookIn = false;
  const syncDock = () => dock.toggleAttribute('data-show', !heroIn && !bookIn);
  new IntersectionObserver(([e]) => { heroIn = e.isIntersecting; syncDock(); }, { threshold: .2 }).observe($('.hero'));
  new IntersectionObserver(([e]) => { bookIn = e.isIntersecting; syncDock(); }, { threshold: .05 }).observe($('#booking'));

  const navLinks = $$('.nav a');
  const navIO = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) navLinks.forEach((a) => a.toggleAttribute('aria-current', a.hash === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  navLinks.forEach((a) => { const s = $(a.hash); if (s) navIO.observe(s); });

  /* ---------- Menu ---------- */
  const menu = $('[data-menu]');
  const menuBtn = $('[data-menu-btn]');
  const setMenu = (open) => {
    menuBtn.setAttribute('aria-expanded', String(open));
    root.classList.toggle('menu-open', open);
    menu.hidden = !open;
    if (open) requestAnimationFrame(() => menu.setAttribute('data-open', '')); else menu.removeAttribute('data-open');
  };
  menuBtn.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); menuBtn.focus(); } });

  /* ---------- Reveals ---------- */
  if (!reduce) {
    const targets = [
      ...$$('.sec-head, .press-score, .press-quote, .zones-note, .cast-body, .case, .svc-sig-body, .svc, .visit-steps li, .faq, .reviews-head, .cdl, .final .wrap > *').map((el) => [el, 'rv']),
      ...$$('.zone-photo, .cast-photo, .svc-sig-photo').map((el) => [el, 'rv-photo']),
    ];
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -10% 0px' });
    targets.forEach(([el, c]) => {
      const r = el.getBoundingClientRect();
      if (r.top < innerHeight * .9) return; // already on screen: never hide it
      el.classList.add(c); io.observe(el);
    });
    // stagger siblings inside lists
    $$('.svc-list, .visit-steps').forEach((list) => $$(':scope > *', list).forEach((li, i) => { li.style.transitionDelay = `${(i % 4) * 60}ms`; }));
  }

  /* ---------- Zones (tabs) ---------- */
  const tabs = $$('[data-zone]');
  const pickZone = (tab, focus) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1;
      $('#' + t.getAttribute('aria-controls')).hidden = !on;
    });
    if (focus) tab.focus();
    if (innerWidth < 960) tab.scrollIntoView({ inline: 'center', block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => pickZone(t));
    t.addEventListener('keydown', (e) => {
      const d = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
      if (d) { e.preventDefault(); pickZone(tabs[(i + d + tabs.length) % tabs.length], true); }
      if (e.key === 'Home') { e.preventDefault(); pickZone(tabs[0], true); }
      if (e.key === 'End') { e.preventDefault(); pickZone(tabs[tabs.length - 1], true); }
    });
  });

  /* ---------- Four hands score: playhead follows the scroll through the pinned section ---------- */
  const score = $('[data-score]');
  if (score) {
    if (reduce) root.classList.add('static-score');
    else {
      const notes = $$('.note', score).map((n) => [n, +n.dataset.at]);
      const phases = $$('.phase', score);
      const pin = $('.four-pin', score);
      let raf = 0, last = -1;
      const frame = () => {
        const r = score.getBoundingClientRect();
        const span = r.height - innerHeight;
        const p = Math.min(1, Math.max(0, -r.top / (span || 1)));
        if (Math.abs(p - last) > .001) {
          last = p;
          pin.style.setProperty('--p', p.toFixed(4));
          notes.forEach(([n, at]) => n.classList.toggle('on', at <= p + .002));
          phases[0].classList.toggle('on', p < .5);
          phases[1].classList.toggle('on', p >= .5);
        }
        raf = requestAnimationFrame(frame);
      };
      new IntersectionObserver(([e]) => {
        if (e.isIntersecting && !raf) raf = requestAnimationFrame(frame);
        else if (!e.isIntersecting && raf) { cancelAnimationFrame(raf); raf = 0; }
      }).observe(score);
      phases[0].classList.add('on');
    }
  }

  /* ---------- Spotlight follows the pointer over the portraits ---------- */
  if (!reduce && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    $$('[data-spot]').forEach((fig) => {
      let f = 0, x = 50, y = 30;
      fig.addEventListener('pointermove', (e) => {
        const r = fig.getBoundingClientRect();
        x = ((e.clientX - r.left) / r.width) * 100; y = ((e.clientY - r.top) / r.height) * 100;
        if (!f) f = requestAnimationFrame(() => { fig.style.setProperty('--x', x + '%'); fig.style.setProperty('--y', y + '%'); f = 0; });
      });
      fig.addEventListener('pointerleave', () => { fig.style.setProperty('--x', '50%'); fig.style.setProperty('--y', '30%'); });
    });
  }

  /* ---------- Reviews marquee: duplicate once for a seamless loop ---------- */
  const track = $('.marquee-track');
  if (track && !reduce) $$(':scope > *', track).forEach((c) => { const k = c.cloneNode(true); k.setAttribute('aria-hidden', 'true'); track.appendChild(k); });

  /* ---------- Map on demand ---------- */
  const map = $('[data-map]');
  $('[data-map-btn]', map).addEventListener('click', () => {
    const f = document.createElement('iframe');
    f.src = map.dataset.src; f.loading = 'lazy'; f.title = 'Google Maps'; f.referrerPolicy = 'no-referrer-when-downgrade';
    map.replaceChildren(f);
  });

  /* ---------- Schedule (demo): stable pseudo-random busy slots per day ---------- */
  const B = D.booking;
  const [oh, om] = D.hours.open.split(':').map(Number);
  const [ch, cm] = D.hours.close.split(':').map(Number);
  const hash = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  const dayKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const slotsFor = (date, dur = 60, master = 'any') => {
    const out = [];
    const now = new Date();
    const start = oh * 60 + om, end = ch * 60 + cm;
    for (let m = start; m + dur <= end; m += 30) {
      const t = new Date(date); t.setHours(Math.floor(m / 60), m % 60, 0, 0);
      if (t - now < 90 * 60000) continue;
      const busy = hash(dayKey(date) + m + (master === 'both' ? 'b' : master)) % 100 < (master === 'both' ? 62 : 48);
      if (!busy) out.push(`${pad(Math.floor(m / 60))}:${pad(m % 60)}`);
    }
    return out;
  };
  const days = Array.from({ length: 14 }, (_, i) => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + i); return d; });
  const dayLabel = (d, i) => i === 0 ? D.hero.today : i === 1 ? D.hero.tomorrow : `${D.weekdays[d.getDay()]}, ${d.getDate()} ${D.months[d.getMonth()]}`;

  /* ---------- Booking ---------- */
  const form = $('[data-booking]');
  const state = { service: null, master: 'any', day: null, time: null };
  const datesEl = $('[data-dates]', form), timesEl = $('[data-times]', form);
  const svc = () => state.service && D.services[state.service];
  const dur = () => (svc() ? svc().durations[0] : 60);

  const renderDates = () => {
    datesEl.replaceChildren(...days.map((d, i) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'date'; b.dataset.i = i;
      b.setAttribute('aria-pressed', String(state.day === i));
      b.setAttribute('aria-label', dayLabel(d, i));
      b.innerHTML = `<small>${i === 0 ? D.hero.today : i === 1 ? D.hero.tomorrow : D.weekdays[d.getDay()]}</small><b>${d.getDate()}</b>`;
      return b;
    }));
  };
  const renderTimes = () => {
    if (state.day === null) { timesEl.innerHTML = `<p class="muted">${B.pickDate}</p>`; return; }
    const list = slotsFor(days[state.day], dur(), state.master);
    if (state.time && !list.includes(state.time)) state.time = null;
    if (!list.length) { timesEl.innerHTML = `<p class="muted">${B.noSlots}</p>`; return; }
    timesEl.replaceChildren(...list.map((t) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'time'; b.textContent = t; b.dataset.t = t;
      b.setAttribute('aria-pressed', String(state.time === t));
      return b;
    }));
  };
  const syncMasters = () => {
    const allowed = svc() ? svc().masters : null;
    $$('input[name="master"]', form).forEach((inp) => {
      const v = inp.value;
      const ok = !allowed || v === 'any' || allowed.includes(v);
      inp.disabled = !ok;
      if (!ok && inp.checked) { $('input[name="master"][value="any"]', form).checked = true; state.master = 'any'; }
    });
    if (allowed && allowed.length === 1) { const only = $(`input[name="master"][value="${allowed[0]}"]`, form); only.checked = true; state.master = allowed[0]; }
  };
  const setSum = (k, v) => { const el = $(`[data-sum="${k}"]`, form); el.textContent = v || B.empty; el.classList.toggle('is-empty', !v); };
  const syncSummary = () => {
    setSum('service', svc() ? `${svc().name}, ${svc().durations.join(' / ')} ${D.units.min} · ${svc().priceText}` : '');
    $('[data-sum="master"]', form).textContent = D.masters[state.master];
    setSum('when', state.day !== null && state.time ? `${dayLabel(days[state.day], state.day)}, ${state.time}` : '');
  };
  const refresh = () => { syncMasters(); renderDates(); renderTimes(); syncSummary(); };

  form.addEventListener('change', (e) => {
    if (e.target.name === 'service') { state.service = e.target.value; $('[data-err="form"]', form).textContent = ''; }
    if (e.target.name === 'master') state.master = e.target.value;
    if (e.target.name === 'service' || e.target.name === 'master') refresh();
  });
  datesEl.addEventListener('click', (e) => { const b = e.target.closest('.date'); if (!b) return; state.day = +b.dataset.i; state.time = null; renderDates(); renderTimes(); syncSummary(); });
  timesEl.addEventListener('click', (e) => { const b = e.target.closest('.time'); if (!b) return; state.time = b.dataset.t; renderTimes(); syncSummary(); $('[data-err="form"]', form).textContent = ''; });

  const preset = ({ service, master, day, time, note }) => {
    if (service) { const r = $(`input[name="service"][value="${service}"]`, form); if (r) { r.checked = true; state.service = service; } }
    if (master) { state.master = master; syncMasters(); const r = $(`input[name="master"][value="${state.master}"]`, form); if (r && !r.disabled) r.checked = true; else { state.master = 'any'; $('input[name="master"][value="any"]', form).checked = true; } }
    if (day !== undefined) { state.day = day; state.time = time || null; }
    if (note) { const n = $('#b-note', form); if (!n.value) n.value = note; }
    refresh();
  };
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-book]');
    if (!a) return;
    const { service, master, note } = a.dataset;
    if (service || master || note) preset({ service, master, note });
  });

  // Hero showtimes: the next free sessions, any master
  const st = $('[data-showtimes]');
  const nextSlots = [];
  for (let i = 0; i < days.length && nextSlots.length < 6; i++) {
    slotsFor(days[i], 60).filter((_, k) => k % 3 === 0).slice(0, 2).forEach((t) => nextSlots.length < 6 && nextSlots.push([i, t]));
  }
  st.replaceChildren(...nextSlots.map(([i, t]) => {
    const li = document.createElement('li');
    li.innerHTML = `<a class="slot" href="#booking" data-book><small>${dayLabel(days[i], i)}</small><b>${t}</b></a>`;
    li.firstChild.addEventListener('click', () => preset({ day: i, time: t }));
    return li;
  }));

  const err = (k, msg) => {
    const el = $(`[data-err="${k}"]`, form); el.textContent = msg || '';
    const inp = form.elements[k]; if (inp && inp.setAttribute) inp.setAttribute('aria-invalid', msg ? 'true' : 'false');
  };
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.elements.name.value.trim(), phone = form.elements.phone.value.trim(), note = form.elements.note.value.trim();
    err('name', name ? '' : B.errName);
    err('phone', phone.replace(/\D/g, '').length >= 6 ? '' : B.errPhone);
    err('form', !state.service ? B.errService : state.day === null || !state.time ? B.errSlot : '');
    const bad = $$('.err', form).find((x) => x.textContent);
    if (bad) { (bad.dataset.err === 'form' ? bad : form.elements[bad.dataset.err]).scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' }); if (bad.dataset.err !== 'form') form.elements[bad.dataset.err].focus({ preventScroll: true }); return; }
    const w = B.wa;
    const lines = [w.hello, '', `${w.service}: ${svc().name}`, `${w.master}: ${D.masters[state.master]}`,
      `${w.when}: ${dayLabel(days[state.day], state.day)} (${pad(days[state.day].getDate())}.${pad(days[state.day].getMonth() + 1)}), ${state.time}`,
      `${w.name}: ${name}`, `${w.phone}: ${phone}`];
    if (note) lines.push(`${w.note}: ${note}`);
    const to = state.master === 'ivan' ? D.phones.ivan : D.phones.marina;
    const url = `https://wa.me/${to}?text=${encodeURIComponent(lines.join('\n'))}`;
    const ticket = $('.ticket', form);
    $('[data-ok-link]', form).href = url;
    ticket.classList.add('is-done'); $('[data-ok]', form).hidden = false;
    window.open(url, '_blank', 'noopener');
  });
  $('[data-again]', form).addEventListener('click', () => { $('.ticket', form).classList.remove('is-done'); $('[data-ok]', form).hidden = true; });

  refresh();
})();
