// Generates the static site into site/: / (Ukrainian), /ru/, /es/, /en/.
// Run after editing texts (tools/i18n), prices or reviews (tools/data.mjs):  node tools/build.mjs
// Vercel does not build anything: it serves the committed site/ folder as is.
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { site, services, zones, reviews } from './data.mjs';
import uk from './i18n/uk.mjs';
import ru from './i18n/ru.mjs';
import es from './i18n/es.mjs';
import en from './i18n/en.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const langs = [uk, ru, es, en];
const ICONS = join(root, 'tools', 'icons');
const icon = (name, cls = 'i') => readFileSync(join(ICONS, `${name}.svg`), 'utf8')
  .replace('<svg ', `<svg class="${cls}" aria-hidden="true" focusable="false" `);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const V = Date.now().toString(36); // cache-busting for css/js

const img = (name, alt, { sizes = '100vw', cls = '', eager = false, w = 1400, h = 800 } = {}) =>
  `<img class="${cls}" src="/assets/img/${name}-800.webp" srcset="/assets/img/${name}-800.webp 800w, /assets/img/${name}-l.webp ${w}w" sizes="${sizes}" width="${w}" height="${h}" alt="${esc(alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;

const IMG = { // intrinsic sizes of the large variants
  'duo-work': [1400, 784], ivan: [864, 799], marina: [893, 770], 'ivan-back': [1400, 727], 'back-oil': [1400, 836],
  face: [1400, 758], 'tattoo-hands': [1400, 681], 'four-hands-feet': [1400, 788], 'four-hands-back': [1400, 612],
  'marina-work': [1400, 657], 'ivan-work': [720, 720], duo: [1094, 648], 'marina-back': [1400, 622], 'ivan-studio': [1400, 622], 'hands-back': [1400, 651],
};
const pic = (name, alt, o = {}) => img(name, alt, { ...o, w: IMG[name][0], h: IMG[name][1] });

const priceText = (t, s) => s.price === 0 ? t.services.free : s.price ? `${s.durations.length > 1 ? t.services.from + ' ' : ''}${s.price} €` : t.services.priceOnRequest;
const durText = (t, s) => s.durations.map((d) => `${d}`).join(' / ') + ' ' + t.units.min;
const masterText = (t, s) => s.masters.map((m) => t.masters[m]).join(' · ');

function render(t) {
  const base = t.path;
  const L = (p) => `${base}${p}`;
  const waIvan = `https://wa.me/${site.phones.ivan.wa}`;
  const waMarina = `https://wa.me/${site.phones.marina.wa}?text=${encodeURIComponent(t.booking.wa.hello)}`;
  const reviewsSorted = [...reviews].sort((a, b) => (a.lang === t.code ? -1 : 0) - (b.lang === t.code ? -1 : 0));

  const i18nForJs = {
    code: t.code, months: t.months, weekdays: t.weekdays, masters: t.masters, units: t.units,
    hero: { today: t.hero.today, tomorrow: t.hero.tomorrow },
    booking: t.booking, services: Object.fromEntries(services.map((s) => [s.id, { ...s, name: t.services.items[s.id].name, priceText: priceText(t, s) }])),
    phones: { ivan: site.phones.ivan.wa, marina: site.phones.marina.wa }, hours: site.hours,
  };

  const schema = {
    '@context': 'https://schema.org', '@type': 'HealthAndBeautyBusiness',
    '@id': site.url + '/#studio', name: 'Levant Massage by Marina & Ivan', url: site.url + base,
    image: site.url + '/assets/img/og.jpg', telephone: site.phones.marina.display,
    address: { '@type': 'PostalAddress', streetAddress: site.street, postalCode: site.postal, addressLocality: 'València', addressCountry: 'ES' },
    geo: { '@type': 'GeoCoordinates', latitude: site.geo.lat, longitude: site.geo.lng },
    openingHoursSpecification: [{ '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], opens: site.hours.open, closes: site.hours.close }],
    sameAs: [site.instagram], priceRange: '€€', availableLanguage: ['uk', 'ru', 'es', 'en'],
    employee: [{ '@type': 'Person', name: 'Ivan' }, { '@type': 'Person', name: 'Marina' }],
    makesOffer: services.filter((s) => s.id !== 'consult').map((s) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: t.services.items[s.id].name } })),
  };
  const faqSchema = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: t.visit.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) };

  const navItems = [['zones', '#zones'], ['four', '#four'], ['duet', '#duet'], ['services', '#services'], ['reviews', '#reviews'], ['contacts', '#contacts']];
  const langLinks = (cls) => langs.map((l) => `<a class="${cls}" href="${l.path}" hreflang="${l.htmlLang}" lang="${l.htmlLang}"${l.code === t.code ? ' aria-current="true"' : ''}>${l.label}</a>`).join('');

  // Score: 16 beats; sync = mirrored, async = offset tempos. Values are stroke lengths in beats.
  const beats = 16;
  const ivanNotes = [[0, 1.6], [2, 1.6], [4, 1.6], [6, 1.6], [8, 2.6], [11, .8], [12.4, 1.2], [14.2, 1.4]];
  const marinaNotes = [[0, 1.6], [2, 1.6], [4, 1.6], [6, 1.6], [8.7, .7], [9.8, 2.2], [12.6, .6], [13.6, 2.2]];
  const staff = (notes, y, who) => notes.map(([b, len], i) => {
    const x1 = 60 + (b / beats) * 880, x2 = 60 + ((b + len) / beats) * 880, mid = (x1 + x2) / 2;
    const lift = (i % 2 ? -1 : 1) * (who === 'm' ? -22 : 22) * (b >= 8 ? 1.4 : 1);
    return `<path class="note" data-at="${(b / beats).toFixed(3)}" d="M${x1.toFixed(1)} ${y} Q ${mid.toFixed(1)} ${y + lift} ${x2.toFixed(1)} ${y}"/>`;
  }).join('');

  const zoneTabs = zones.map((z, i) => `<button class="zone-tab" type="button" role="tab" id="zt-${z.id}" aria-controls="zp-${z.id}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-zone="${z.id}"><span>${esc(t.zones.items[z.id].name)}</span></button>`).join('');
  const zonePanels = zones.map((z, i) => {
    const it = t.zones.items[z.id];
    const who = z.master === 'any' ? t.masters.both : t.masters[z.master];
    return `<div class="zone-panel" role="tabpanel" id="zp-${z.id}" aria-labelledby="zt-${z.id}"${i === 0 ? '' : ' hidden'}>
      <figure class="zone-photo spot">${pic(z.img, '', { sizes: '(min-width: 960px) 40vw, 100vw' })}</figure>
      <dl class="zone-facts">
        <div><dt>${t.zones.signal}</dt><dd>${esc(it.signal)}</dd></div>
        <div><dt>${t.zones.cause}</dt><dd>${esc(it.cause)}</dd></div>
        <div><dt>${t.zones.action}</dt><dd>${esc(it.action)}</dd></div>
        <div><dt>${t.zones.who}</dt><dd class="who">${esc(who)}</dd></div>
      </dl>
      <a class="btn btn-line" href="#booking" data-book data-service="${z.service}" data-master="${z.master}" data-note="${esc(it.name)}">${t.zones.cta}${icon('arrow-right')}</a>
    </div>`;
  }).join('');

  const castCard = (who) => {
    const p = t.duet[who];
    return `<article class="cast cast-${who}">
      <figure class="cast-photo" data-spot>${pic(who, p.alt, { sizes: '(min-width: 960px) 45vw, 100vw' })}<span class="spotlight" aria-hidden="true"></span></figure>
      <div class="cast-body">
        <h3 class="cast-name">${t.masters[who]}</h3>
        <p class="cast-role">${esc(p.role)}</p>
        ${p.story.map((s) => `<p>${esc(s)}</p>`).join('')}
        <p class="cast-techs-label">${t.duet.techs}</p>
        <ul class="cast-techs">${p.techs.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
        <a class="btn btn-line" href="#booking" data-book data-master="${who}">${t.nav.book} ${t.mastersTo[who]}${icon('arrow-right')}</a>
      </div>
    </article>`;
  };

  const caseRows = t.cases.items.map((c) => `<article class="case">
      <header class="case-head"><h3>${esc(c.name)}</h3><p>${esc(c.who)}</p></header>
      <p class="case-req"><span>${t.cases.request}</span>${esc(c.request)}</p>
      <ol class="case-steps">${c.steps.map((s) => `<li${s.n ? '' : ' class="is-course"'}><span class="case-n">${s.n ? s.n : t.cases.course}</span><span class="case-n-label">${s.n ? t.cases.session(s.n).replace(/^\d+ /, '') : ''}</span><p>${esc(s.t)}</p></li>`).join('')}</ol>
    </article>`).join('');

  const sig = services.find((s) => s.signature);
  const serviceRows = services.filter((s) => !s.signature).map((s) => {
    const it = t.services.items[s.id];
    return `<li class="svc">
      <div class="svc-main"><h3>${esc(it.name)}</h3><p>${esc(it.desc)}</p></div>
      <p class="svc-meta"><span>${esc(masterText(t, s))}</span><span>${durText(t, s)}</span><span class="svc-price">${esc(priceText(t, s))}</span></p>
      <a class="svc-choose" href="#booking" data-book data-service="${s.id}" aria-label="${esc(t.services.choose + ': ' + it.name)}">${t.services.choose}${icon('arrow-right')}</a>
    </li>`;
  }).join('');

  const reviewCards = reviewsSorted.map((r) => `<figure class="review" lang="${r.lang}">
      <blockquote><p>${esc(r.text)}</p></blockquote>
      <figcaption><span class="review-name">${esc(r.name)}</span><span class="review-meta">Google · ${t.ago(r.ago)}</span></figcaption>
    </figure>`).join('');

  const faq = t.visit.faq.map((f) => `<details class="faq-item"><summary><span>${esc(f.q)}</span><span class="faq-icon" aria-hidden="true"></span></summary><div class="faq-a"><p>${esc(f.a)}</p></div></details>`).join('');

  return `<!doctype html>
<html lang="${t.htmlLang}">
<head>
<meta charset="utf-8">
<meta name="robots" content="noindex">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(t.meta.title)}</title>
<meta name="description" content="${esc(t.meta.description)}">
<link rel="canonical" href="${site.url}${base}">
${langs.map((l) => `<link rel="alternate" hreflang="${l.htmlLang}" href="${site.url}${l.path}">`).join('\n')}
<link rel="alternate" hreflang="x-default" href="${site.url}/">
<meta name="theme-color" content="#0c0c0e">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Levant Massage">
<meta property="og:locale" content="${t.ogLocale}">
<meta property="og:title" content="${esc(t.meta.title)}">
<meta property="og:description" content="${esc(t.meta.description)}">
<meta property="og:url" content="${site.url}${base}">
<meta property="og:image" content="${site.url}/assets/img/og.jpg">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png">
<link rel="preload" href="/assets/fonts/commissioner-${t.code === 'es' || t.code === 'en' ? 'latin' : 'cyrillic'}.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" as="image" href="/assets/img/marina-back-800.webp" imagesrcset="/assets/img/marina-back-800.webp 800w, /assets/img/marina-back-l.webp 1400w" imagesizes="(min-width: 960px) 52vw, 100vw">
<link rel="stylesheet" href="/assets/css/site.css?v=${V}">
<script>document.documentElement.classList.add('js');try{if(!sessionStorage.getItem('curtain')&&!matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.classList.add('curtain-on');sessionStorage.setItem('curtain','1')}}catch(e){}</script>
<script type="application/ld+json">${JSON.stringify(schema)}</script>
<script type="application/ld+json">${JSON.stringify(faqSchema)}</script>
</head>
<body>
<a class="skip" href="#main">${t.nav.skip}</a>
<div class="curtain" aria-hidden="true"><span class="curtain-l"></span><span class="curtain-r"></span></div>

<header class="top" data-top>
  <div class="top-in">
    <a class="logo" href="${base}" aria-label="${esc(t.nav.home)}"><span class="logo-dot" aria-hidden="true"></span>Levant</a>
    <nav class="nav" aria-label="${t.nav.menu}">${navItems.map(([k, h]) => `<a href="${h}">${t.nav[k]}</a>`).join('')}</nav>
    <div class="top-right">
      <div class="langs" role="group" aria-label="${t.nav.lang}">${langLinks('lang')}</div>
      <a class="btn btn-amber btn-sm top-cta" href="#booking" data-book>${t.nav.book}</a>
      <button class="menu-btn" type="button" aria-expanded="false" aria-controls="menu" data-menu-btn><span class="sr">${t.nav.menu}</span><span class="menu-lines" aria-hidden="true"></span></button>
    </div>
  </div>
  <div class="menu" id="menu" hidden data-menu>
    <nav aria-label="${t.nav.menu}">${navItems.map(([k, h]) => `<a href="${h}">${t.nav[k]}</a>`).join('')}</nav>
    <div class="menu-langs">${langLinks('lang')}</div>
    <a class="btn btn-amber" href="#booking" data-book>${t.nav.book}</a>
  </div>
</header>

<main id="main">
  <section class="hero" aria-labelledby="hero-title">
    <div class="hero-stage">
      <figure class="stage stage-a">${pic('marina-back', t.hero.photoAltMarina, { sizes: '(min-width: 960px) 52vw, 100vw', eager: true, cls: 'hero-img' })}</figure>
      <figure class="stage stage-b">${pic('ivan-studio', t.hero.photoAltIvan, { sizes: '(min-width: 960px) 46vw, 1px', cls: 'hero-img' })}</figure>
    </div>
    <div class="hero-copy">
      <p class="hero-credit">${t.hero.credit}</p>
      <h1 id="hero-title" class="hero-title">${t.hero.title}</h1>
      <p class="hero-sub">${esc(t.hero.sub)}</p>
      <div class="hero-actions">
        <a class="btn btn-amber btn-lg" href="#booking" data-book>${t.hero.cta}${icon('arrow-right')}</a>
        <a class="btn btn-ghost btn-lg" href="${waMarina}" target="_blank" rel="noopener">${icon('whatsapp-logo')}${t.hero.wa}</a>
      </div>
    </div>
    <div class="showtimes" aria-labelledby="st-title">
      <p class="showtimes-title" id="st-title">${t.hero.slots}<span>${t.hero.slotsNote}</span></p>
      <ul class="showtimes-list" data-showtimes aria-live="polite"></ul>
    </div>
  </section>

  <section class="press" aria-label="Google">
    <div class="press-score">
      <p class="press-num">${site.rating.value}</p>
      <p class="press-stars" aria-label="5/5">${icon('star', 'i star').repeat(5)}</p>
      <p class="press-label">${t.press.label}</p>
    </div>
    <figure class="press-quote">
      <blockquote><p>${esc(t.press.quote)}</p></blockquote>
      <figcaption>${esc(t.press.by)}</figcaption>
    </figure>
  </section>

  <section class="zones sec" id="zones" aria-labelledby="zones-title">
    <div class="wrap">
      <header class="sec-head"><h2 id="zones-title" class="h2">${t.zones.title}</h2><p class="lead">${esc(t.zones.sub)}</p></header>
      <div class="zones-grid">
        <div class="zone-tabs" role="tablist" aria-label="${esc(t.zones.title)}">${zoneTabs}</div>
        <div class="zone-panels">${zonePanels}</div>
      </div>
      <p class="zones-note">${esc(t.zones.note)}</p>
    </div>
  </section>

  <section class="four" id="four" aria-labelledby="four-title" data-score>
    <div class="four-pin">
      <figure class="four-photo">${pic('tattoo-hands', '', { sizes: '100vw' })}</figure>
      <div class="four-in wrap">
        <header class="four-head">
          <h2 id="four-title" class="h2">${t.four.title}</h2>
          <p class="lead">${esc(t.four.lead)}</p>
        </header>
        <div class="score" role="img" aria-label="${esc(t.four.scoreLabel)}">
          <svg viewBox="0 0 1000 260" preserveAspectRatio="none" aria-hidden="true">
            <g class="bars">${Array.from({ length: 5 }, (_, i) => `<line x1="${60 + i * 220}" y1="40" x2="${60 + i * 220}" y2="230"/>`).join('')}</g>
            <line class="staff-line" x1="60" y1="90" x2="940" y2="90"/><line class="staff-line" x1="60" y1="180" x2="940" y2="180"/>
            <g class="notes notes-ivan">${staff(ivanNotes, 90, 'i')}</g>
            <g class="notes notes-marina">${staff(marinaNotes, 180, 'm')}</g>
            <line class="playhead" x1="60" y1="30" x2="60" y2="240"/>
          </svg>
          <span class="staff-name staff-ivan">${t.four.staffIvan}</span><span class="staff-name staff-marina">${t.four.staffMarina}</span>
        </div>
        <div class="phases">
          <div class="phase" data-phase="sync"><h3>${t.four.sync.label}</h3><p>${esc(t.four.sync.text)}</p></div>
          <div class="phase" data-phase="async"><h3>${t.four.async.label}</h3><p>${esc(t.four.async.text)}</p></div>
        </div>
        <div class="four-foot">
          <p class="four-includes"><span>${t.four.includes}</span>${t.four.bonuses.map((b) => `<span class="tag">${esc(b)}</span>`).join('')}</p>
          <a class="btn btn-amber" href="#booking" data-book data-service="four" data-master="both">${t.nav.book}${icon('arrow-right')}</a>
        </div>
      </div>
    </div>
  </section>

  <section class="duet sec" id="duet" aria-labelledby="duet-title">
    <div class="wrap">
      <header class="sec-head"><h2 id="duet-title" class="h2">${t.duet.title}</h2><p class="lead">${esc(t.duet.sub)}</p></header>
      <div class="cast-grid">${castCard('ivan')}${castCard('marina')}</div>
    </div>
  </section>

  <section class="cases sec" aria-labelledby="cases-title">
    <div class="wrap">
      <header class="sec-head"><h2 id="cases-title" class="h2">${t.cases.title}</h2><p class="lead">${esc(t.cases.sub)}</p></header>
      <div class="case-list">${caseRows}</div>
    </div>
  </section>

  <section class="services sec" id="services" aria-labelledby="services-title">
    <div class="wrap">
      <header class="sec-head"><h2 id="services-title" class="h2">${t.services.title}</h2><p class="lead">${esc(t.services.sub)}</p></header>
      <article class="svc-sig">
        <figure class="svc-sig-photo spot">${pic('four-hands-back', '', { sizes: '(min-width: 960px) 40vw, 100vw' })}</figure>
        <div class="svc-sig-body">
          <p class="svc-sig-kicker">${t.services.signature}</p>
          <h3>${esc(t.services.items.four.name)}</h3>
          <p>${esc(t.services.items.four.desc)}</p>
          <p class="svc-meta"><span>${esc(masterText(t, sig))}</span><span>${durText(t, sig)}</span><span class="svc-price">${esc(priceText(t, sig))}</span></p>
          <a class="btn btn-amber" href="#booking" data-book data-service="four" data-master="both">${t.services.choose}${icon('arrow-right')}</a>
        </div>
      </article>
      <ul class="svc-list">${serviceRows}</ul>
      <p class="addons"><span>${t.services.addonsTitle}:</span> ${t.services.addons.join(', ')}</p>
    </div>
  </section>

  <section class="visit sec" aria-labelledby="visit-title">
    <div class="wrap visit-grid">
      <div>
        <h2 id="visit-title" class="h2">${t.visit.title}</h2>
        <ol class="visit-steps">${t.visit.steps.map((s) => `<li><h3>${esc(s.t)}</h3><p>${esc(s.d)}</p></li>`).join('')}</ol>
      </div>
      <div class="faq">
        <h3 class="faq-title">${t.visit.faqTitle}</h3>
        ${faq}
      </div>
    </div>
  </section>

  <section class="reviews sec" id="reviews" aria-labelledby="reviews-title">
    <div class="wrap reviews-head">
      <h2 id="reviews-title" class="h2">${t.reviews.title}</h2>
      <p class="lead">${esc(t.reviews.sub)}</p>
      <a class="link" href="${site.reviewsUrl}" target="_blank" rel="noopener">${icon('google-logo')}${t.reviews.all}${icon('arrow-up-right')}</a>
    </div>
    <div class="marquee" data-marquee><div class="marquee-track">${reviewCards}</div></div>
  </section>

  <section class="booking sec" id="booking" aria-labelledby="booking-title">
    <div class="wrap">
      <header class="sec-head"><h2 id="booking-title" class="h2">${t.booking.title}</h2><p class="lead">${esc(t.booking.sub)}</p></header>
      <form class="book" data-booking novalidate>
        <div class="book-steps">
          <fieldset class="bstep">
            <legend>${t.booking.service}</legend>
            <div class="chips chips-svc">${services.map((s) => `<label class="chip"><input type="radio" name="service" value="${s.id}"><span><b>${esc(t.services.items[s.id].name)}</b><small>${durText(t, s)} · ${esc(priceText(t, s))}</small></span></label>`).join('')}</div>
          </fieldset>
          <fieldset class="bstep">
            <legend>${t.booking.master}</legend>
            <div class="chips chips-row" data-masters>${['any', 'ivan', 'marina', 'both'].map((m) => `<label class="chip"><input type="radio" name="master" value="${m}"${m === 'any' ? ' checked' : ''}><span><b>${t.masters[m]}</b></span></label>`).join('')}</div>
          </fieldset>
          <fieldset class="bstep">
            <legend>${t.booking.date}</legend>
            <div class="dates" data-dates></div>
          </fieldset>
          <fieldset class="bstep">
            <legend>${t.booking.time}</legend>
            <div class="times" data-times><p class="muted">${t.booking.pickDate}</p></div>
          </fieldset>
          <fieldset class="bstep bstep-contact">
            <legend>${t.booking.contact}</legend>
            <div class="field"><label for="b-name">${t.booking.name}</label><input id="b-name" name="name" autocomplete="name" placeholder="${esc(t.booking.namePh)}" required><p class="err" data-err="name"></p></div>
            <div class="field"><label for="b-phone">${t.booking.phone}</label><input id="b-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="${esc(t.booking.phonePh)}" required><p class="err" data-err="phone"></p></div>
            <div class="field field-wide"><label for="b-note">${t.booking.note} <span class="opt">${t.booking.optional}</span></label><textarea id="b-note" name="note" rows="2" placeholder="${esc(t.booking.notePh)}"></textarea></div>
          </fieldset>
        </div>
        <aside class="ticket" aria-live="polite">
          <p class="ticket-title">${t.booking.summary}</p>
          <dl class="ticket-rows">
            <div><dt>${t.booking.service}</dt><dd data-sum="service">${t.booking.empty}</dd></div>
            <div><dt>${t.booking.master}</dt><dd data-sum="master">${t.masters.any}</dd></div>
            <div><dt>${t.booking.date}</dt><dd data-sum="when">${t.booking.empty}</dd></div>
          </dl>
          <p class="err" data-err="form"></p>
          <button class="btn btn-amber btn-lg btn-block" type="submit">${icon('whatsapp-logo')}${t.booking.submit}</button>
          <p class="ticket-demo">${esc(t.booking.demo)}</p>
          <div class="ticket-ok" data-ok hidden>
            <p class="ticket-title">${t.booking.okTitle}</p>
            <p>${esc(t.booking.okText)}</p>
            <a class="btn btn-amber btn-block" data-ok-link href="#" target="_blank" rel="noopener">${t.booking.okOpen}</a>
            <button class="btn btn-ghost btn-block" type="button" data-again>${t.booking.again}</button>
          </div>
        </aside>
      </form>
    </div>
  </section>

  <section class="contacts sec" id="contacts" aria-labelledby="contacts-title">
    <div class="wrap contacts-grid">
      <div>
        <h2 id="contacts-title" class="h2">${t.contact.title}</h2>
        <dl class="cdl">
          <div><dt>${icon('map-pin')}${t.contact.address}</dt><dd>${esc(site.address)}</dd></div>
          <div><dt>${icon('train')}${t.contact.metro}</dt><dd>${site.metro}</dd></div>
          <div><dt>${icon('clock')}${t.contact.hours}</dt><dd>${t.contact.hoursVal}</dd></div>
          <div><dt>${icon('whatsapp-logo')}${t.contact.phones}</dt><dd>
            <a href="${waIvan}" target="_blank" rel="noopener">${t.masters.ivan}: ${site.phones.ivan.display}</a><br>
            <a href="https://wa.me/${site.phones.marina.wa}" target="_blank" rel="noopener">${t.masters.marina}: ${site.phones.marina.display}</a></dd></div>
          <div><dt>${icon('instagram-logo')}Instagram</dt><dd><a href="${site.instagram}" target="_blank" rel="noopener">${site.instagramHandle}</a></dd></div>
        </dl>
        <a class="btn btn-line" href="${site.maps}" target="_blank" rel="noopener">${t.contact.route}${icon('arrow-up-right')}</a>
      </div>
      <div class="map" data-map data-src="${site.mapsEmbed}">
        <button class="map-btn" type="button" data-map-btn>${icon('map-pin')}<span>${t.contact.mapLoad}</span><small>${t.contact.mapNote}</small></button>
      </div>
    </div>
  </section>

  <section class="final" aria-labelledby="final-title">
    <div class="wrap">
      <h2 id="final-title" class="final-title">${esc(t.final.title)}</h2>
      <a class="btn btn-amber btn-lg" href="#booking" data-book>${t.final.cta}${icon('arrow-right')}</a>
    </div>
  </section>
</main>

<footer class="foot">
  <div class="wrap foot-in">
    <p class="logo"><span class="logo-dot" aria-hidden="true"></span>Levant</p>
    <p class="foot-small">Levant Massage by Marina &amp; Ivan · ${esc(site.address)}</p>
    <p class="foot-small">${esc(t.footer.disclaimer)}</p>
    <div class="langs">${langLinks('lang')}</div>
  </div>
</footer>

<div class="dock" data-dock>
  <a class="btn btn-amber" href="#booking" data-book>${t.nav.book}</a>
  <a class="btn btn-ghost dock-wa" href="${waMarina}" target="_blank" rel="noopener" aria-label="${esc(t.hero.wa)}">${icon('whatsapp-logo')}</a>
</div>

<script type="application/json" id="i18n">${JSON.stringify(i18nForJs).replace(/</g, '\\u003c')}</script>
<script src="/assets/js/site.js?v=${V}" defer></script>
</body>
</html>
`;
}

for (const t of langs) {
  const html = render(t);
  if (/[—–]/.test(html.replace(/<script[\s\S]*?<\/script>/g, ''))) console.warn(`! dash found in ${t.code}`);
  const dir = join(root, 'site', t.path === '/' ? '' : t.code);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), html);
  console.log('built', join('site', t.path, 'index.html'));
}
