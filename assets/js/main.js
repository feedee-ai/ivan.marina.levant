(() => {
  'use strict';

  const D = JSON.parse(document.getElementById('i18n').textContent);
  const root = document.documentElement;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) root.classList.add('no-motion');

  /* ---------- Hero entrance ---------- */
  const ready = () => requestAnimationFrame(() => root.classList.add('is-ready'));
  if (document.fonts && document.fonts.ready) {
    Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 700))]).then(ready);
  } else ready();

  /* ---------- Topbar state + dock ---------- */
  const topbar = $('[data-topbar]');
  const dock = $('[data-dock]');
  const hero = $('.hero');
  const sentinel = document.createElement('div');
  sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:80px;pointer-events:none';
  document.body.prepend(sentinel);
  new IntersectionObserver(([e]) => topbar.toggleAttribute('data-scrolled', !e.isIntersecting)).observe(sentinel);

  let heroVisible = true, bookingVisible = false;
  const syncDock = () => dock && dock.toggleAttribute('data-show', !heroVisible && !bookingVisible);
  new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; syncDock(); }, { threshold: 0.15 }).observe(hero);
  const bookingSec = $('#booking');
  new IntersectionObserver(([e]) => { bookingVisible = e.isIntersecting; syncDock(); }, { threshold: 0.05 }).observe(bookingSec);

  /* ---------- Current section in nav ---------- */
  const navLinks = $$('.mainnav a');
  const sections = navLinks.map((a) => $(a.getAttribute('href'))).filter(Boolean);
  const navIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      navLinks.forEach((a) => a.toggleAttribute('aria-current', a.getAttribute('href') === '#' + e.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach((s) => navIO.observe(s));

  /* ---------- Menu ---------- */
  const menu = $('[data-menu]');
  const menuBtn = $('[data-menu-toggle]');
  const setMenu = (open) => {
    menuBtn.setAttribute('aria-expanded', String(open));
    root.toggleAttribute('data-menu-open', open);
    if (open) {
      menu.hidden = false;
      requestAnimationFrame(() => menu.setAttribute('data-open', ''));
      document.body.style.overflow = 'hidden';
      $('a', menu).focus({ preventScroll: true });
    } else {
      menu.removeAttribute('data-open');
      menu.hidden = true;
      document.body.style.overflow = '';
    }
  };
  menuBtn.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && root.hasAttribute('data-menu-open')) { setMenu(false); menuBtn.focus(); }
  });

  /* ---------- Reveals ---------- */
  const revealIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); revealIO.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -12% 0px' });
  $$('.reveal, [data-strike]').forEach((el) => revealIO.observe(el));

  /* ---------- Zones (tabs) ---------- */
  const zoneTabs = $$('[data-zone]');
  const selectZone = (id, focus) => {
    zoneTabs.forEach((tab) => {
      const on = tab.dataset.zone === id;
      tab.setAttribute('aria-selected', String(on));
      tab.tabIndex = on ? 0 : -1;
      if (on && focus) tab.focus();
      if (on && window.innerWidth < 960) tab.scrollIntoView({ inline: 'center', block: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' });
    });
    $$('[data-zone-panel]').forEach((p) => p.classList.toggle('is-active', p.dataset.zonePanel === id));
  };
  zoneTabs.forEach((tab, i) => {
    tab.addEventListener('click', () => selectZone(tab.dataset.zone));
    tab.addEventListener('keydown', (e) => {
      const keys = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
      if (e.key in keys) {
        e.preventDefault();
        const next = zoneTabs[(i + keys[e.key] + zoneTabs.length) % zoneTabs.length];
        selectZone(next.dataset.zone, true);
      }
    });
  });

  /* ---------- Myths ---------- */
  $$('[data-myth]').forEach((m) => {
    const btn = $('.myth__btn', m);
    btn.addEventListener('click', () => {
      const open = !m.classList.contains('is-open');
      m.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
    });
  });

  /* ---------- Reviews marquee ---------- */
  const marquee = $('[data-marquee]');
  if (marquee && !reduceMotion) {
    $$('.marquee__track', marquee).forEach((track) => {
      $$('.review', track).forEach((r) => {
        const c = r.cloneNode(true);
        c.setAttribute('aria-hidden', 'true');
        track.appendChild(c);
      });
      track.style.setProperty('--dur', `${Math.round(track.scrollWidth / 2 / 38)}s`);
    });
    new IntersectionObserver(([e]) => marquee.classList.toggle('is-running', e.isIntersecting)).observe(marquee);
  }

  /* ---------- Map (click to load) ---------- */
  const map = $('[data-map]');
  if (map) {
    $('[data-map-load]', map).addEventListener('click', () => {
      const f = document.createElement('iframe');
      f.src = map.dataset.src;
      f.title = 'Google Maps';
      f.loading = 'lazy';
      f.referrerPolicy = 'no-referrer-when-downgrade';
      map.appendChild(f);
      $('.map__cover', map).remove();
    });
  }

  /* ---------- Four hands canvas ---------- */
  const fourSec = $('#four-hands');
  const canvas = $('[data-four-canvas]');
  const seg = $('[data-four-modes]');
  const modeText = $('[data-four-text]');
  if (canvas && seg) {
    const ctx = canvas.getContext('2d');
    let W = 0, H = 0, dpr = 1;
    let mode = 'sync', k = 0, target = 0, userPicked = false, running = false, raf = 0, t = 0, last = 0;
    const SAND = [205, 178, 147], STONE = [241, 238, 233], PULSE = [210, 74, 60];
    const hands = [
      { side: -1, ph: 0, fa: 1.0, fb: 0.73, col: STONE },
      { side: -1, ph: Math.PI * 0.9, fa: 1.0, fb: 0.73, col: STONE },
      { side: 1, ph: 0, fa: 1.0, fb: 0.73, col: SAND },
      { side: 1, ph: Math.PI * 0.9, fa: 1.0, fb: 0.73, col: SAND },
    ];
    const asyncP = [
      { fa: 0.62, fb: 1.31, ph: 1.7, wob: 0.9 },
      { fa: 1.47, fb: 0.52, ph: 4.1, wob: 1.4 },
      { fa: 0.91, fb: 1.77, ph: 2.6, wob: 0.6 },
      { fa: 1.83, fb: 0.81, ph: 5.3, wob: 1.1 },
    ];
    const prev = hands.map(() => null);

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.round(r.width * dpr); H = Math.round(r.height * dpr);
      canvas.width = W; canvas.height = H;
      prev.fill(null);
      paintBase(1);
    };
    const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

    function paintBase(alpha) { // fade to transparent so the canvas never shows its own box
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = `rgba(0,0,0,${alpha})`;
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'source-over';
    }
    function guides() {
      const cx = W / 2, cy = H / 2, R = Math.min(W, H) / 2;
      ctx.lineWidth = 1 * dpr;
      for (let i = 1; i <= 4; i++) {
        ctx.strokeStyle = `rgba(241,238,233,${0.012 + i * 0.004})`;
        ctx.beginPath(); ctx.arc(cx, cy, R * (0.22 * i), 0, Math.PI * 2); ctx.stroke();
      }
      ctx.strokeStyle = 'rgba(241,238,233,0.05)';
      ctx.setLineDash([2 * dpr, 7 * dpr]);
      ctx.beginPath(); ctx.moveTo(cx, cy - R * 0.92); ctx.lineTo(cx, cy + R * 0.92); ctx.stroke();
      ctx.setLineDash([]);
    }
    function pos(h, i, time) {
      const cx = W / 2, cy = H / 2, R = Math.min(W, H) / 2;
      // synchronous: mirrored, shared rhythm
      const sx = cx + h.side * R * (0.3 + 0.2 * Math.sin(time * 0.9 + h.ph));
      const sy = cy + R * 0.58 * Math.sin(time * 0.45 + h.ph);
      // asynchronous: each hand its own tempo and direction
      const a = asyncP[i];
      const ax = cx + h.side * R * (0.3 + 0.24 * Math.sin(time * a.fa + a.ph) + 0.06 * Math.sin(time * 2.3 * a.wob));
      const ay = cy + R * 0.6 * Math.sin(time * a.fb * 0.6 + a.ph * 1.3) + R * 0.05 * Math.cos(time * 3.1 * a.wob);
      return [sx + (ax - sx) * k, sy + (ay - sy) * k];
    }
    function frame(now) {
      const dt = Math.min((now - (last || now)) / 1000, 0.05); last = now;
      t += dt * (1 + k * 0.35);
      k += (target - k) * Math.min(dt * 2.2, 1);
      paintBase(0.075);
      guides();
      const pts = hands.map((h, i) => pos(h, i, t));
      // symmetry threads in sync mode
      const symA = 0.22 * (1 - k);
      if (symA > 0.01) {
        ctx.strokeStyle = rgba(STONE, symA * 0.5);
        ctx.lineWidth = 1 * dpr;
        [[0, 2], [1, 3]].forEach(([a, b]) => { ctx.beginPath(); ctx.moveTo(...pts[a]); ctx.lineTo(...pts[b]); ctx.stroke(); });
      }
      pts.forEach((p, i) => {
        const h = hands[i];
        if (prev[i]) {
          ctx.strokeStyle = rgba(h.col, 0.55);
          ctx.lineWidth = 2.2 * dpr;
          ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(...prev[i]); ctx.lineTo(...p); ctx.stroke();
        }
        prev[i] = p;
        const g = ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], 22 * dpr);
        g.addColorStop(0, rgba(h.col, 0.5)); g.addColorStop(1, rgba(h.col, 0));
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p[0], p[1], 22 * dpr, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = rgba(h.col, 1); ctx.beginPath(); ctx.arc(p[0], p[1], 4 * dpr, 0, Math.PI * 2); ctx.fill();
      });
      // a slow "breath" at the centre: steady in sync, uneven in async
      const cx = W / 2, cy = H / 2;
      const br = (Math.sin(t * 0.7) * 0.5 + 0.5) * (1 - k) + (Math.sin(t * 1.9) * Math.sin(t * 0.37) * 0.5 + 0.5) * k;
      ctx.strokeStyle = rgba(k > 0.5 ? PULSE : SAND, 0.08 + 0.1 * br);
      ctx.lineWidth = 1.2 * dpr;
      ctx.beginPath(); ctx.arc(cx, cy, Math.min(W, H) * (0.06 + 0.03 * br), 0, Math.PI * 2); ctx.stroke();
      if (running) raf = requestAnimationFrame(frame);
    }
    function drawStatic() {
      paintBase(1); guides();
      hands.forEach((h, i) => {
        ctx.strokeStyle = rgba(h.col, 0.5); ctx.lineWidth = 1.6 * dpr; ctx.beginPath();
        for (let s = 0; s <= 400; s++) { const p = pos(h, i, s * 0.035); s ? ctx.lineTo(...p) : ctx.moveTo(...p); }
        ctx.stroke();
      });
    }
    const setMode = (m, byUser) => {
      if (byUser) userPicked = true;
      mode = m; target = m === 'async' ? 1 : 0;
      seg.dataset.mode = m;
      $$('button', seg).forEach((b) => b.setAttribute('aria-checked', String(b.dataset.mode === m)));
      modeText.textContent = modeText.dataset[m];
      if (reduceMotion) { k = target; drawStatic(); }
    };
    $$('button', seg).forEach((b) => b.addEventListener('click', () => setMode(b.dataset.mode, true)));
    seg.addEventListener('keydown', (e) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault();
        setMode(mode === 'sync' ? 'async' : 'sync', true);
        $(`[data-mode="${mode}"]`, seg).focus();
      }
    });
    resize();
    window.addEventListener('resize', () => { resize(); if (reduceMotion) drawStatic(); }, { passive: true });
    if (reduceMotion) drawStatic();
    else {
      new IntersectionObserver(([e]) => {
        running = e.isIntersecting;
        if (running) { last = 0; raf = requestAnimationFrame(frame); } else cancelAnimationFrame(raf);
      }).observe(canvas);
      setInterval(() => { if (!userPicked && running) setMode(mode === 'sync' ? 'async' : 'sync'); }, 7000);
    }
  }

  /* ======================================================================
     Booking (demo): availability is simulated, request goes to WhatsApp.
     ====================================================================== */
  const B = D.booking;
  const form = $('[data-booking]');
  const svcById = Object.fromEntries(D.services.map((s) => [s.id, s]));
  const pad = (n) => String(n).padStart(2, '0');
  const toMin = (hhmm) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };
  const OPEN = toMin(D.hours.open), CLOSE = toMin(D.hours.close), STEP = 30;
  const dayKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const fmtDay = new Intl.DateTimeFormat(D.locale, { weekday: 'short' });
  const fmtLong = new Intl.DateTimeFormat(D.locale, { weekday: 'short', day: 'numeric', month: 'short' });

  function rng(seed) { // mulberry32
    let a = 0; for (let i = 0; i < seed.length; i++) a = Math.imul(a ^ seed.charCodeAt(i), 2654435761) >>> 0;
    return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  const busyCache = {};
  function busy(master, key) { // simulated existing bookings for a master on a day
    const id = master + key;
    if (busyCache[id]) return busyCache[id];
    const r = rng(id), list = [];
    const n = 2 + Math.floor(r() * 3);
    for (let i = 0; i < n; i++) {
      const start = OPEN + Math.floor(r() * ((CLOSE - OPEN - 60) / STEP)) * STEP;
      list.push([start, start + (r() > 0.5 ? 90 : 60)]);
    }
    return (busyCache[id] = list);
  }
  const free = (master, key, s, e) => busy(master, key).every(([a, b]) => e <= a || s >= b);
  function slotsFor(date, serviceId, master, dur) {
    const key = dayKey(date), svc = svcById[serviceId];
    const now = new Date();
    const isToday = key === dayKey(now);
    const minStart = isToday ? now.getHours() * 60 + now.getMinutes() + 60 : 0;
    const pool = master === 'any' ? svc.masters.filter((m) => m !== 'both') : [master];
    const out = [];
    for (let s = OPEN; s + dur <= CLOSE; s += STEP) {
      if (s < minStart) continue;
      const e = s + dur;
      const ok = master === 'both' ? free('ivan', key, s, e) && free('marina', key, s, e) : pool.some((m) => free(m, key, s, e));
      if (ok) out.push(s);
    }
    return out;
  }
  const minToStr = (m) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
  const days = Array.from({ length: 14 }, (_, i) => { const d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + i); return d; });
  const dayLabel = (d, i) => (i === 0 ? B.today : i === 1 ? B.tomorrow : fmtDay.format(d));

  const state = { service: 'therapeutic', dur: 60, master: 'any', day: 0, time: null };
  const mastersFor = (svc) => (svc.masters.includes('both') ? ['both'] : svc.masters.length > 1 ? [...svc.masters, 'any'] : svc.masters);
  const priceText = (s) => (s.price === 0 ? D.free : s.price == null ? D.priceOnRequest : `${s.durations.length > 1 ? D.from + ' ' : ''}${s.price} ${D.units.eur}`);

  const boxSvc = $('[data-opts="service"]', form);
  const boxMaster = $('[data-opts="master"]', form);
  const boxDate = $('[data-opts="date"]', form);
  const boxTime = $('[data-opts="time"]', form);
  const noSlots = $('[data-no-slots]', form);

  function renderServices() {
    boxSvc.innerHTML = D.services.map((s) => `
      <label class="opt${s.signature ? ' opt--sig' : ''}">
        <input type="radio" name="service" value="${s.id}" ${state.service === s.id ? 'checked' : ''}>
        <span class="opt__name">${s.name}</span>
        <span class="opt__meta">${s.durations.map((d) => `${d} ${D.units.min}`).join(' / ')} · ${priceText(s)}</span>
      </label>`).join('');
    const svc = svcById[state.service];
    if (svc.durations.length > 1) {
      boxSvc.insertAdjacentHTML('beforeend', `<div class="durs"><span>${B.duration}</span>${svc.durations.map((d) => `
        <label class="opt"><input type="radio" name="dur" value="${d}" ${state.dur === d ? 'checked' : ''}><span class="opt__name">${d} ${D.units.min}</span></label>`).join('')}</div>`);
    }
  }
  function renderMasters() {
    const list = mastersFor(svcById[state.service]);
    if (!list.includes(state.master)) state.master = list[0];
    boxMaster.innerHTML = list.map((m) => `
      <label class="opt">
        <input type="radio" name="master" value="${m}" ${state.master === m ? 'checked' : ''}>
        <span class="opt__name">${D.masters[m]}</span>
        <span class="opt__meta">${D.mastersHint[m]}</span>
      </label>`).join('');
  }
  function renderDays() {
    boxDate.innerHTML = days.map((d, i) => {
      const n = slotsFor(d, state.service, state.master, state.dur).length;
      return `<button type="button" class="day" data-day="${i}" aria-pressed="${state.day === i}" ${n ? '' : 'disabled'} aria-label="${fmtLong.format(d)}">
        <small>${dayLabel(d, i)}</small><b>${d.getDate()}</b></button>`;
    }).join('');
  }
  function renderTimes() {
    const list = slotsFor(days[state.day], state.service, state.master, state.dur);
    if (state.time != null && !list.includes(state.time)) state.time = null;
    boxTime.innerHTML = list.map((m) => `<button type="button" class="time" data-time="${m}" aria-pressed="${state.time === m}">${minToStr(m)}</button>`).join('');
    noSlots.hidden = list.length > 0;
  }
  function summary() {
    const svc = svcById[state.service];
    const set = (k, v) => { const el = $(`[data-sum="${k}"]`, form); el.textContent = v || B.empty; el.classList.toggle('is-empty', !v); };
    set('service', `${svc.name}, ${state.dur} ${D.units.min}`);
    set('master', D.masters[state.master]);
    set('when', state.time != null ? `${fmtLong.format(days[state.day])}, ${minToStr(state.time)}` : '');
  }
  function renderAll() {
    const svc = svcById[state.service];
    if (!svc.durations.includes(state.dur)) state.dur = svc.durations[0];
    renderServices(); renderMasters();
    // keep the chosen day if it still has slots, otherwise jump to the first day that does
    if (!slotsFor(days[state.day], state.service, state.master, state.dur).length) {
      const firstFree = days.findIndex((d) => slotsFor(d, state.service, state.master, state.dur).length);
      state.day = Math.max(0, firstFree);
    }
    renderDays(); renderTimes(); summary();
  }

  form.addEventListener('change', (e) => {
    const { name, value } = e.target;
    if (name === 'service') { state.service = value; renderAll(); }
    if (name === 'dur') { state.dur = Number(value); renderAll(); }
    if (name === 'master') { state.master = value; renderAll(); }
  });
  boxDate.addEventListener('click', (e) => {
    const b = e.target.closest('[data-day]'); if (!b) return;
    state.day = Number(b.dataset.day);
    $$('.day', boxDate).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    renderTimes(); summary();
  });
  boxTime.addEventListener('click', (e) => {
    const b = e.target.closest('[data-time]'); if (!b) return;
    state.time = Number(b.dataset.time);
    $$('.time', boxTime).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    $('[data-err="slot"]', form).textContent = '';
    summary();
  });

  const waUrl = (msg) => {
    const who = state.master === 'ivan' ? 'ivan' : 'marina';
    return `https://wa.me/${D.phones[who].wa}?text=${encodeURIComponent(msg)}`;
  };
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.elements.name, phone = form.elements.phone, note = form.elements.note;
    const errs = {
      name: name.value.trim().length < 2 ? B.errName : '',
      phone: phone.value.replace(/\D/g, '').length < 7 ? B.errPhone : '',
      slot: state.time == null ? B.errSlot : '',
    };
    Object.entries(errs).forEach(([k, v]) => { $(`[data-err="${k}"]`, form).textContent = v; });
    name.setAttribute('aria-invalid', String(!!errs.name));
    phone.setAttribute('aria-invalid', String(!!errs.phone));
    if (errs.slot) { boxTime.scrollIntoView({ block: 'center', behavior: reduceMotion ? 'auto' : 'smooth' }); return; }
    if (errs.name) { name.focus(); return; }
    if (errs.phone) { phone.focus(); return; }
    const svc = svcById[state.service];
    const lines = [
      B.waHello,
      `${B.waService}: ${svc.name} (${state.dur} ${D.units.min})`,
      `${B.waMaster}: ${D.masters[state.master]}`,
      `${B.waWhen}: ${fmtLong.format(days[state.day])}, ${minToStr(state.time)}`,
      `${B.waName}: ${name.value.trim()}`,
      `${B.waPhone}: ${phone.value.trim()}`,
    ];
    if (note.value.trim()) lines.push(`${B.waNote}: ${note.value.trim()}`);
    const url = waUrl(lines.join('\n'));
    $('[data-ok-link]', form).href = url;
    $('[data-ok]', form).hidden = false;
    form.classList.add('is-done');
    window.open(url, '_blank', 'noopener');
  });
  $('[data-again]', form).addEventListener('click', () => {
    form.classList.remove('is-done');
    $('[data-ok]', form).hidden = true;
    state.time = null; renderAll();
  });

  // Any "book" button can preset the form.
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-book]');
    if (!a) return;
    const { service, master, note, day, time } = a.dataset;
    if (service && svcById[service]) state.service = service;
    if (master) state.master = master;
    if (day != null && day !== '') state.day = Number(day);
    if (time) state.time = Number(time);
    renderAll();
    if (time) {
      const t = Number(time);
      // availability for the preset combination may differ; renderAll keeps time only if still free
      if (slotsFor(days[state.day], state.service, state.master, state.dur).includes(t)) { state.time = t; renderTimes(); summary(); }
    }
    if (note && !form.elements.note.value) form.elements.note.value = note;
  });

  renderAll();


  /* ---------- Press: rotating reviews, timed by length so there is time to read ---------- */
  const qBox = $('[data-quotes]');
  if (qBox) {
    const qs = $$('[data-q]', qBox);
    const stack = $('[data-quotes-stack]', qBox);
    const bar = $('[data-q-bar]', qBox);
    const pauseBtn = $('[data-q-pause]', qBox);
    let cur = 0, userPaused = false, hover = false, inView = false;
    // ~200 words per minute plus a beat to take in the name: 6.5s for a short line, up to 16s for a long one
    const dur = (el) => Math.min(16000, Math.max(6500, 4000 + el.textContent.trim().split(/\s+/).length * 300));
    const restart = () => {
      bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = '';
      bar.style.animationDuration = `${dur(qs[cur])}ms`;
    };
    const show = (n) => {
      const out = qs[cur];
      out.classList.remove('is-on'); out.classList.add('is-leaving'); out.setAttribute('aria-hidden', 'true');
      setTimeout(() => out.classList.remove('is-leaving'), 700);
      cur = (n + qs.length) % qs.length;
      qs[cur].classList.add('is-on'); qs[cur].removeAttribute('aria-hidden');
      restart();
    };
    const sync = () => qBox.classList.toggle('is-paused', userPaused || hover || !inView || document.hidden);
    bar.addEventListener('animationend', () => show(cur + 1));
    $('[data-q-prev]', qBox).addEventListener('click', () => show(cur - 1));
    $('[data-q-next]', qBox).addEventListener('click', () => show(cur + 1));
    pauseBtn.addEventListener('click', () => {
      userPaused = !userPaused;
      pauseBtn.classList.toggle('is-play', userPaused);
      pauseBtn.setAttribute('aria-label', userPaused ? pauseBtn.dataset.labelPlay : pauseBtn.dataset.labelPause);
      stack.setAttribute('aria-live', userPaused ? 'polite' : 'off');
      sync();
    });
    stack.addEventListener('mouseenter', () => { hover = true; sync(); });
    stack.addEventListener('mouseleave', () => { hover = false; sync(); });
    qBox.addEventListener('focusin', () => { hover = true; sync(); });
    qBox.addEventListener('focusout', () => { hover = false; sync(); });
    let sx = null;
    stack.addEventListener('pointerdown', (e) => { sx = e.clientX; });
    stack.addEventListener('pointerup', (e) => {
      if (sx === null) return;
      const dx = e.clientX - sx; sx = null;
      if (Math.abs(dx) > 40) show(cur + (dx < 0 ? 1 : -1));
    });
    new IntersectionObserver(([e]) => { inView = e.isIntersecting; sync(); }, { threshold: .4 }).observe(qBox);
    document.addEventListener('visibilitychange', sync);
    restart(); sync();
  }

  /* ---------- Hero: nearest free windows ---------- */
  const heroSlots = $('[data-slots-list]');
  if (heroSlots) {
    const found = [];
    for (let i = 0; i < days.length && found.length < 6; i++) {
      const list = slotsFor(days[i], 'therapeutic', 'any', 60);
      // spread picks across the day instead of three neighbouring half-hours
      let lastPick = -999;
      for (const m of list) {
        if (m - lastPick >= 120) { found.push({ i, m }); lastPick = m; }
        if (found.length >= 6 || found.filter((f) => f.i === i).length >= 2) break;
      }
    }
    heroSlots.innerHTML = found.map((f) => `<a class="slot" href="#booking" data-book data-service="therapeutic" data-day="${f.i}" data-time="${f.m}"><span>${dayLabel(days[f.i], f.i)}</span><b>${minToStr(f.m)}</b></a>`).join('')
      + `<a class="slot slot--more" href="#booking" data-book>${$('[data-hero-slots]').dataset.more}</a>`;
  }
})();
