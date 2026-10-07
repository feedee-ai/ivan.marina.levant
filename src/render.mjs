import { readFileSync } from 'node:fs';
import { site, services, reviews, zones } from './config.mjs';

const iconCache = {};
export function icon(name, cls = 'i') {
  if (!iconCache[name]) {
    const raw = readFileSync(new URL(`./icons/${name}.svg`, import.meta.url), 'utf8');
    iconCache[name] = raw.replace('<svg ', '<svg aria-hidden="true" focusable="false" ');
  }
  return iconCache[name].replace('<svg ', `<svg class="${cls}" `);
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const img = (base, name, alt, { cls = '', sizes = '100vw', eager = false, w = 1440, h = 800 } = {}) =>
  `<img class="${cls}" src="${base}assets/img/${name}.webp" srcset="${base}assets/img/${name}-sm.webp 760w, ${base}assets/img/${name}.webp 1440w" sizes="${sizes}" alt="${esc(alt)}" width="${w}" height="${h}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;

const waLink = (who, text = '') =>
  `https://wa.me/${site.phones[who].wa}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

function priceLabel(t, s) {
  if (s.price === 0) return `<span class="price price--free">${t.services.free}</span>`;
  if (s.price == null) return `<span class="price price--ask">${t.services.priceOnRequest}</span>`;
  return `<span class="price">${s.durations.length > 1 ? t.services.from + ' ' : ''}${s.price}&nbsp;${t.units.eur}</span>`;
}

export function render(t, langs, base) {
  const self = (code) => (code === 'uk' ? '' : `${code}/`);
  const href = (code) => `${base}${self(code)}`;
  const [qo, qc] = t.code === 'en' ? ['“', '”'] : ['«', '»'];
  const masterNames = (list) => list.map((m) => t.masters[m]).join(' · ');

  const imgW = { duo: [1440, 650], ivan: [1440, 760], marina: [1440, 790], face: [1440, 780], 'four-hands-feet': [1440, 810], 'four-hands-back': [1440, 630], 'marina-back': [1440, 640], 'back-oil': [1440, 860], 'tattoo-hands': [1440, 700], 'ivan-work': [1440, 780], 'marina-oil': [1440, 740], 'yoga-stretch': [1440, 850], 'ivan-studio': [1440, 640], 'hands-back': [1440, 670] };
  const pic = (name, alt, o = {}) => img(base, name, alt, { w: imgW[name]?.[0], h: imgW[name]?.[1], ...o });

  const clientData = {
    code: t.code, locale: t.locale,
    masters: t.masters, mastersHint: t.mastersHint, units: t.units,
    booking: t.booking, services: services.map((s) => ({ ...s, name: t.services.items[s.id].name })),
    phones: site.phones, hours: site.hours,
    priceOnRequest: t.services.priceOnRequest, free: t.services.free, from: t.services.from,
    hero: { demo: t.hero.demo },
  };

  const langSwitch = (cls) => `
    <nav class="${cls}" aria-label="${esc(t.nav.lang)}">
      ${langs.map((l) => `<a href="${href(l.code)}" hreflang="${l.htmlLang}" lang="${l.htmlLang}" ${l.code === t.code ? 'aria-current="page"' : ''} title="${esc(l.name)}">${l.label}</a>`).join('')}
    </nav>`;

  const navItems = [
    ['approach', '#approach'], ['zones', '#zones'], ['four', '#four-hands'], ['team', '#team'],
    ['services', '#services'], ['reviews', '#reviews'], ['contacts', '#contacts'],
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HealthAndBeautyBusiness',
    name: 'Levant Massage by Marina & Ivan',
    image: `${site.url}/assets/img/duo.webp`,
    url: `${site.url}/${self(t.code)}`,
    telephone: site.phones.marina.display,
    address: { '@type': 'PostalAddress', streetAddress: 'Carrer de Molina de Segura, 2', addressLocality: 'València', postalCode: '46018', addressRegion: 'Valencia', addressCountry: 'ES' },
    geo: { '@type': 'GeoCoordinates', latitude: site.geo.lat, longitude: site.geo.lng },
    openingHoursSpecification: [{ '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], opens: site.hours.open, closes: site.hours.close }],
    sameAs: [site.instagram],
    employee: [{ '@type': 'Person', name: 'Ivan' }, { '@type': 'Person', name: 'Marina' }],
  };

  return `<!doctype html>
<html lang="${t.htmlLang}">
<head>
<meta charset="utf-8">
<meta name="robots" content="noindex">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(t.meta.title)}</title>
<meta name="description" content="${esc(t.meta.description)}">
<meta name="theme-color" content="#121110">
<script>document.documentElement.classList.add('js')</script>
<link rel="canonical" href="${site.url}/${self(t.code)}">
${langs.map((l) => `<link rel="alternate" hreflang="${l.htmlLang}" href="${site.url}/${self(l.code)}">`).join('\n')}
<link rel="alternate" hreflang="x-default" href="${site.url}/">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(t.meta.title)}">
<meta property="og:description" content="${esc(t.meta.description)}">
<meta property="og:image" content="${site.url}/assets/img/duo.webp">
<meta property="og:locale" content="${t.locale.replace('-', '_')}">
<link rel="icon" href="${base}assets/img/favicon.svg" type="image/svg+xml">
<link rel="preload" href="${base}assets/fonts/oswald-${t.code === 'es' || t.code === 'en' ? 'latin' : 'cyrillic'}-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${base}assets/img/tattoo-hands.webp" as="image" imagesrcset="${base}assets/img/tattoo-hands-sm.webp 760w, ${base}assets/img/tattoo-hands.webp 1440w" imagesizes="(min-width: 960px) 90vw, 220vw">
<link rel="stylesheet" href="${base}assets/css/style.css">
<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
</head>
<body>
<a class="skip" href="#main">${t.nav.skip}</a>
<div class="grain" aria-hidden="true"></div>

<header class="topbar" data-topbar>
  <div class="topbar__in">
    <a class="brand" href="${href(t.code)}" aria-label="Levant Massage — Ivan &amp; Marina">
      <span class="brand__mark">Levant</span>
      <span class="brand__sub">Ivan &amp; Marina<br>massage · València</span>
    </a>
    <nav class="mainnav" aria-label="Main">
      ${navItems.map(([k, h]) => `<a href="${h}">${t.nav[k]}</a>`).join('')}
    </nav>
    ${langSwitch('langs langs--top')}
    <a class="btn btn--sand btn--sm topbar__cta" href="#booking" data-book>${t.nav.book}</a>
    <button class="menubtn" type="button" aria-expanded="false" aria-controls="menu" data-menu-toggle>
      <span class="menubtn__lines" aria-hidden="true"><span></span><span></span></span>
      <span class="sr">${t.nav.menu}</span>
    </button>
  </div>
</header>

<div class="menu" id="menu" hidden data-menu>
  <nav class="menu__nav" aria-label="Menu">
    ${navItems.map(([k, h], i) => `<a href="${h}" style="--i:${i}">${t.nav[k]}</a>`).join('')}
  </nav>
  <div class="menu__foot">
    ${langSwitch('langs langs--menu')}
    <a class="btn btn--sand" href="#booking" data-book>${t.nav.book}</a>
  </div>
</div>

<main id="main">

<!-- HERO -->
<section class="hero" aria-labelledby="hero-title">
  <div class="wrap hero__in">
    <div class="hero__copy">
      <h1 class="hero__title" id="hero-title">
        ${t.hero.lines.map((l, i) => `<span class="line" style="--d:${i}"><span>${l}</span></span>`).join('')}
      </h1>
      <p class="hero__lead">${t.hero.lead}</p>
      <div class="hero__actions">
        <a class="btn btn--sand" href="#booking" data-book>${icon('calendar-blank')}<span>${t.hero.ctaBook}</span></a>
        <a class="btn btn--ghost" href="${waLink('marina', t.booking.waHello)}" target="_blank" rel="noopener">${icon('whatsapp-logo')}<span>${t.hero.ctaConsult}</span></a>
      </div>
      <div class="slots" data-hero-slots data-more="${esc(t.hero.slotsAll)}">
        <div class="slots__head">
          <span>${t.hero.slotsTitle}</span><em class="demo-tag">${t.hero.demo}</em>
        </div>
        <div class="slots__list" data-slots-list></div>
      </div>
      <ul class="hero__facts">
        <li><a href="#reviews" class="rating">${icon('star', 'i i--star')}<strong>${t.reviews.title[0]}</strong><span>${t.hero.rating}</span></a></li>
        <li>${icon('train')}<span>${t.hero.place}</span></li>
        <li>${icon('clock')}<span>${t.hero.hours}</span></li>
      </ul>
    </div>
    <figure class="hero__media">
      <div class="cover" style="--ar:${1440 / 700}">
        ${pic('tattoo-hands', `${t.masters.both}: ${t.services.items.four.name}`, { cls: 'hero__img', sizes: '(min-width: 960px) 90vw, 220vw', eager: true })}
        <span class="tag-dot tag-dot--m" style="--x:50%;--y:30%" aria-hidden="true"><i></i><b>${t.masters.marina}</b></span>
        <span class="tag-dot tag-dot--i" style="--x:41%;--y:70%" aria-hidden="true"><i></i><b>${t.masters.ivan}</b></span>
      </div>
      <figcaption class="hero__plaque"><span>${t.services.signature}</span><strong>${t.services.items.four.name}</strong></figcaption>
    </figure>
  </div>
</section>

<!-- MANIFESTO -->
<section class="sec sec--stone manifesto" id="approach" aria-labelledby="manifesto-title">
  <div class="wrap manifesto__grid">
    <div class="manifesto__head">
      <p class="manifesto__myth" data-strike><span>${qo}${t.manifesto.myth}${qc}</span></p>
      <h2 class="display manifesto__title" id="manifesto-title">${t.manifesto.big.map((l) => `<span>${l.replace('≠', '<span class="neq">=</span>')}</span>`).join('')}</h2>
    </div>
    <div class="manifesto__body">
      <p class="lede">${t.manifesto.body}</p>
      <p class="manifesto__pull">${t.manifesto.pull}</p>
      <ul class="leaders">
        ${t.manifesto.points.map((p) => `<li><span class="leaders__dot" aria-hidden="true"></span><strong>${p.t}</strong><span>${p.d}</span></li>`).join('')}
      </ul>
    </div>
    <figure class="manifesto__photo reveal">
      ${pic('marina-back', t.masters.marina, { sizes: '(min-width: 960px) 40vw, 100vw' })}
    </figure>
  </div>
</section>

<!-- ZONES -->
<section class="sec sec--dark zones" id="zones" aria-labelledby="zones-title">
  <div class="wrap">
    <div class="sec__head">
      <h2 class="display" id="zones-title">${t.zones.title}</h2>
      <p class="sec__sub">${t.zones.sub}</p>
    </div>
    <div class="zones__grid" data-zones>
      <div class="zones__list" role="tablist" aria-label="${esc(t.zones.title)}">
        ${zones.map((z, i) => `<button class="zone-tab" role="tab" id="zt-${z.id}" aria-controls="zp-${z.id}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-zone="${z.id}">
          <span class="zone-tab__dot" aria-hidden="true"></span>
          <span class="zone-tab__name">${t.zones.items[z.id].name}</span>
          ${icon('arrow-right', 'i zone-tab__arrow')}
        </button>`).join('')}
        <p class="zones__note">${t.zones.note}</p>
      </div>
      <div class="zones__stage">
        ${zones.map((z, i) => {
          const zi = t.zones.items[z.id];
          const who = z.masters === 'both' ? t.masters.both : t.masters[z.masters];
          return `<div class="zone-panel${i === 0 ? ' is-active' : ''}" role="tabpanel" id="zp-${z.id}" aria-labelledby="zt-${z.id}" data-zone-panel="${z.id}">
            <figure class="zone-panel__photo">
              <div class="cover" style="--ar:${imgW[z.img][0] / imgW[z.img][1]}">
                ${pic(z.img, zi.name, { sizes: '(min-width: 960px) 52vw, 100vw' })}
                <span class="pin" style="--x:${z.dot.x}%;--y:${z.dot.y}%" aria-hidden="true"><i></i><b>${zi.dot}</b></span>
              </div>
            </figure>
            <dl class="zone-panel__info">
              <div><dt>${t.zones.signal}</dt><dd>${zi.signal}</dd></div>
              <div><dt>${t.zones.cause}</dt><dd>${zi.cause}</dd></div>
              <div><dt>${t.zones.action}</dt><dd>${zi.action}</dd></div>
              <div class="zone-panel__who"><dt>${t.zones.who}</dt><dd>${who}</dd></div>
            </dl>
            <a class="btn btn--sand" href="#booking" data-book data-service="${z.service}" data-note="${esc(zi.name)}">${t.zones.cta}${icon('arrow-right')}</a>
          </div>`;
        }).join('')}
      </div>
    </div>
  </div>
</section>

<!-- FOUR HANDS -->
<section class="sec sec--night four" id="four-hands" aria-labelledby="four-title">
  <div class="wrap four__grid">
    <div class="four__copy">
      <h2 class="display" id="four-title">${t.four.title.map((l) => `<span>${l}</span>`).join(' ')}</h2>
      <p class="lede">${t.four.lead}</p>
      <div class="seg" role="radiogroup" aria-label="${esc(t.four.modeLabel)}" data-four-modes>
        <button type="button" role="radio" aria-checked="true" data-mode="sync">${t.four.sync.label}</button>
        <button type="button" role="radio" aria-checked="false" data-mode="async">${t.four.async.label}</button>
        <span class="seg__thumb" aria-hidden="true"></span>
      </div>
      <p class="four__mode-text" aria-live="polite" data-four-text data-sync="${esc(t.four.sync.text)}" data-async="${esc(t.four.async.text)}">${t.four.sync.text}</p>
    </div>
    <div class="four__viz">
      <canvas class="four__canvas" data-four-canvas role="img" aria-label="${esc(t.four.canvasLabel)}"></canvas>
      <span class="four__axis-label four__axis-label--l" aria-hidden="true">${t.masters.marina}</span>
      <span class="four__axis-label four__axis-label--r" aria-hidden="true">${t.masters.ivan}</span>
    </div>
  </div>
  <div class="wrap four__lower">
    <ul class="four__effects">
      ${t.four.effects.map((e) => `<li><strong>${e.t}</strong><span>${e.d}</span></li>`).join('')}
    </ul>
    <figure class="four__photo reveal">
      ${pic('four-hands-feet', t.masters.both, { sizes: '(min-width: 960px) 50vw, 100vw' })}
      <figcaption class="plaque">
        <span>${t.four.bonusTitle}</span>
        <ul>${t.four.bonuses.map((b) => `<li>${icon('check')}${b}</li>`).join('')}</ul>
      </figcaption>
    </figure>
    <blockquote class="four__quote">
      <p>${qo}${t.four.quote}${qc}</p>
      <footer>— ${t.four.quoteBy}</footer>
    </blockquote>
    <a class="btn btn--sand four__cta" href="#booking" data-book data-service="four">${t.four.cta}${icon('arrow-right')}</a>
  </div>
</section>

<!-- TEAM -->
<section class="sec sec--stone team" id="team" aria-labelledby="team-title">
  <div class="wrap">
    <div class="team__head">
      <h2 class="display" id="team-title">${t.team.title}</h2>
      <p class="sec__sub">${t.team.sub}</p>
    </div>
    <figure class="team__duo reveal">
      ${pic('duo', t.masters.both, { sizes: '(min-width: 1200px) 1200px, 100vw' })}
      <figcaption class="team__duo-quote"><span>${qo}${t.team.quote}${qc}</span><small>— ${t.team.quoteBy}</small></figcaption>
    </figure>
    <div class="team__grid">
      ${['ivan', 'marina'].map((m) => {
        const p = t.team[m];
        return `<article class="person">
          <figure class="person__photo">${pic(m === 'ivan' ? 'ivan-studio' : 'marina-oil', p.name, { sizes: '(min-width: 960px) 45vw, 100vw' })}</figure>
          <h3 class="person__name">${p.name}</h3>
          <p class="person__role">${p.role}</p>
          ${p.bio.map((b) => `<p class="person__bio">${b}</p>`).join('')}
          <p class="person__techs-label">${t.team.techs}</p>
          <ul class="chips">${p.techs.map((x) => `<li>${x}</li>`).join('')}</ul>
          <a class="btn btn--ink" href="#booking" data-book data-master="${m}">${t.team.book[m]}${icon('arrow-right')}</a>
        </article>`;
      }).join('')}
    </div>
  </div>
</section>

<!-- CASES -->
<section class="sec sec--dark cases" id="cases" aria-labelledby="cases-title">
  <div class="wrap">
    <div class="sec__head">
      <h2 class="display" id="cases-title">${t.cases.title}</h2>
      <p class="sec__sub">${t.cases.sub}</p>
    </div>
    <ol class="cases__list">
      ${t.cases.items.map((c) => `<li class="case reveal">
        <div class="case__who">
          <h3 class="case__name">${c.name}</h3>
          <p>${c.who}</p>
        </div>
        <div class="case__body">
          <h4>${t.cases.problem}</h4>
          <p>${c.problem}</p>
          <h4>${t.cases.solution}</h4>
          <ul class="ticks">${c.solution.map((s) => `<li>${s}</li>`).join('')}</ul>
        </div>
        <div class="case__timeline">
          <h4>${t.cases.result}</h4>
          <ol>
            ${c.steps.map((s) => `<li>${s.n ? `<span class="case__n">${s.n}</span><span class="case__unit">${s.n === 1 ? t.cases.session : s.n < 5 ? t.cases.sessions : t.cases.sessions5}</span>` : `<span class="case__n case__n--word">${s.label}</span><span class="case__unit">&nbsp;</span>`}<p>${s.t}</p></li>`).join('')}
          </ol>
        </div>
      </li>`).join('')}
    </ol>
  </div>
</section>

<!-- SERVICES -->
<section class="sec sec--stone services" id="services" aria-labelledby="services-title">
  <div class="wrap">
    <div class="sec__head">
      <h2 class="display" id="services-title">${t.services.title}</h2>
      <p class="sec__sub">${t.services.sub}</p>
    </div>
    <ul class="svc-list">
      ${services.map((s) => {
        const it = t.services.items[s.id];
        return `<li class="svc ${s.signature ? 'svc--signature' : ''}">
          <div class="svc__main">
            ${s.signature ? `<span class="svc__badge">${icon('sparkle')}${t.services.signature}</span>` : ''}
            <h3 class="svc__name">${it.name}</h3>
            <p class="svc__desc">${it.desc}</p>
          </div>
          <p class="svc__meta"><span class="svc__who">${masterNames(s.masters)}</span><span class="svc__dur">${s.durations.map((d) => `${d}&nbsp;${t.units.min}`).join(' / ')}</span></p>
          <p class="svc__price">${priceLabel(t, s)}</p>
          <a class="btn ${s.signature ? 'btn--sand' : 'btn--line'} btn--sm" href="#booking" data-book data-service="${s.id}" aria-label="${esc(t.services.choose + ': ' + it.name)}">${t.services.choose}</a>
        </li>`;
      }).join('')}
    </ul>
    <div class="addons">
      <span class="addons__title">${t.services.addonsTitle}</span>
      <ul class="chips">${t.services.addons.map((a) => `<li>${a}</li>`).join('')}</ul>
    </div>
  </div>
</section>

<!-- MYTHS -->
<section class="sec sec--dark myths" aria-labelledby="myths-title">
  <div class="wrap">
    <div class="sec__head">
      <h2 class="display" id="myths-title">${t.myths.title.map((l) => `<span>${l}</span>`).join(' ')}</h2>
      <p class="sec__sub">${t.myths.sub}</p>
    </div>
    <ul class="myths__grid">
      ${t.myths.items.map((m, i) => `<li class="myth" data-myth>
        <button type="button" class="myth__btn" aria-expanded="false" aria-controls="myth-${i}">
          <span class="myth__label">${t.myths.myth}</span>
          <span class="myth__text">${m.m}</span>
          <span class="myth__plus" aria-hidden="true"></span>
        </button>
        <div class="myth__truth" id="myth-${i}"><div class="myth__truth-in">
          <span class="myth__label myth__label--truth">${t.myths.truth}</span>
          <p>${m.t}</p>
        </div></div>
      </li>`).join('')}
    </ul>
  </div>
</section>

<!-- PROCESS -->
<section class="sec sec--stone process" aria-labelledby="process-title">
  <div class="wrap">
    <h2 class="display" id="process-title">${t.process.title}</h2>
    <ol class="steps">
      ${t.process.steps.map((s, i) => `<li class="step reveal" style="--i:${i}"><span class="step__n">${i + 1}</span><h3>${s.t}</h3><p>${s.d}</p></li>`).join('')}
    </ol>
    <aside class="tip reveal">
      ${pic('face', '', { sizes: '(min-width: 960px) 30vw, 100vw' })}
      <div class="tip__text"><h3>${t.process.tipTitle}</h3><p>${t.process.tip}</p></div>
    </aside>
  </div>
</section>

<!-- REVIEWS -->
<section class="sec sec--dark reviews" id="reviews" aria-labelledby="reviews-title">
  <div class="wrap reviews__head">
    <h2 class="display reviews__title" id="reviews-title"><span class="reviews__score">${t.reviews.title[0]}</span> <span>${t.reviews.title[1]}</span></h2>
    <div class="reviews__meta">
      <span class="stars" aria-hidden="true">${icon('star', 'i i--star').repeat(5)}</span>
      <p class="sec__sub">${t.reviews.sub}</p>
      <a class="link" href="${site.maps}" target="_blank" rel="noopener">${icon('google-logo')}${t.reviews.all}${icon('arrow-up-right')}</a>
    </div>
  </div>
  <div class="marquee" data-marquee>
    ${[0, 1].map((row) => `<div class="marquee__row" data-row="${row}"><ul class="marquee__track">
      ${reviews.filter((_, i) => i % 2 === row).map((r) => `<li class="review" lang="${{ UA: 'uk', RU: 'ru', ES: 'es', EN: 'en' }[r.lang]}">
        <p>${r.text}</p>
        <footer><strong>${r.name}</strong><span>${r.lang} · ${r.ago[t.code]}</span></footer>
      </li>`).join('')}
    </ul></div>`).join('')}
  </div>
</section>

<!-- BOOKING -->
<section class="sec sec--stone booking" id="booking" aria-labelledby="booking-title">
  <div class="wrap">
    <div class="sec__head">
      <h2 class="display" id="booking-title">${t.booking.title}</h2>
      <p class="sec__sub">${t.booking.sub}</p>
    </div>
    <p class="demo-note">${icon('sparkle')}<span>${t.booking.demo}</span></p>
    <form class="book" data-booking novalidate>
      <div class="book__steps">
        <fieldset class="book__step">
          <legend><span class="book__n">1</span>${t.booking.steps.service}</legend>
          <div class="opts opts--svc" data-opts="service"></div>
        </fieldset>
        <fieldset class="book__step">
          <legend><span class="book__n">2</span>${t.booking.steps.master}</legend>
          <div class="opts opts--master" data-opts="master"></div>
        </fieldset>
        <fieldset class="book__step">
          <legend><span class="book__n">3</span>${t.booking.steps.date}</legend>
          <div class="days" data-opts="date"></div>
        </fieldset>
        <fieldset class="book__step">
          <legend><span class="book__n">4</span>${t.booking.steps.time}</legend>
          <div class="times" data-opts="time"></div>
          <p class="book__empty" data-no-slots hidden>${t.booking.noSlots}</p>
        </fieldset>
        <fieldset class="book__step">
          <legend><span class="book__n">5</span>${t.booking.steps.contact}</legend>
          <div class="fields">
            <label class="field"><span>${t.booking.name}</span><input name="name" autocomplete="name" placeholder="${esc(t.booking.namePh)}" required><em class="field__err" data-err="name"></em></label>
            <label class="field"><span>${t.booking.phone}</span><input name="phone" type="tel" autocomplete="tel" inputmode="tel" placeholder="${esc(t.booking.phonePh)}" required><em class="field__err" data-err="phone"></em></label>
            <label class="field field--wide"><span>${t.booking.note}</span><textarea name="note" rows="2" placeholder="${esc(t.booking.notePh)}"></textarea></label>
          </div>
        </fieldset>
      </div>
      <aside class="book__summary" aria-live="polite">
        <h3>${t.booking.summary}</h3>
        <dl data-summary>
          <div><dt>${t.booking.steps.service}</dt><dd data-sum="service">${t.booking.empty}</dd></div>
          <div><dt>${t.booking.steps.master}</dt><dd data-sum="master">${t.booking.empty}</dd></div>
          <div><dt>${t.booking.steps.date}</dt><dd data-sum="when">${t.booking.empty}</dd></div>
        </dl>
        <p class="book__err" data-err="slot"></p>
        <button class="btn btn--sand btn--block" type="submit">${icon('whatsapp-logo')}<span>${t.booking.submit}</span></button>
        <div class="book__ok" data-ok hidden>
          <h3>${icon('check')}${t.booking.okTitle}</h3>
          <p>${t.booking.okText}</p>
          <a class="btn btn--ghost btn--block" data-ok-link href="#" target="_blank" rel="noopener">${icon('whatsapp-logo')}<span>${t.booking.okOpen}</span></a>
          <button class="link" type="button" data-again>${t.booking.again}</button>
        </div>
      </aside>
    </form>
  </div>
</section>

<!-- CONTACTS -->
<section class="sec sec--dark contacts" id="contacts" aria-labelledby="contacts-title">
  <div class="wrap contacts__grid">
    <div class="contacts__info">
      <h2 class="display" id="contacts-title">${t.contact.title}</h2>
      <dl class="contacts__dl">
        <div><dt>${icon('map-pin')}${t.contact.address}</dt><dd>${site.address}</dd></div>
        <div><dt>${icon('train')}${t.contact.metro}</dt><dd>${site.metro}</dd></div>
        <div><dt>${icon('clock')}${t.contact.hours}</dt><dd>${t.contact.hoursVal}</dd></div>
      </dl>
      <ul class="contacts__people">
        ${['ivan', 'marina'].map((m) => `<li>
          <span class="contacts__name">${t.masters[m]}</span>
          <a class="btn btn--sand btn--sm" href="${waLink(m, t.booking.waHello)}" target="_blank" rel="noopener">${icon('whatsapp-logo')}<span>WhatsApp</span></a>
          <a class="btn btn--line-light btn--sm" href="tel:+${site.phones[m].wa}">${icon('phone')}<span>${site.phones[m].display}</span></a>
        </li>`).join('')}
      </ul>
      <p class="contacts__links">
        <a class="link" href="${site.instagram}" target="_blank" rel="noopener">${icon('instagram-logo')}${site.instagramHandle}${icon('arrow-up-right')}</a>
        <a class="link" href="${site.maps}" target="_blank" rel="noopener">${icon('map-pin')}${t.contact.route}${icon('arrow-up-right')}</a>
      </p>
    </div>
    <div class="map" data-map data-src="${site.mapsEmbed}">
      <span class="map__pin" aria-hidden="true"><i></i><b>Molina de Segura, 2</b></span>
      <div class="map__cover">
        <button class="btn btn--ghost" type="button" data-map-load>${icon('map-pin')}<span>${t.contact.mapLoad}</span></button>
        <small>${t.contact.mapNote}</small>
      </div>
    </div>
  </div>
</section>

<!-- FINAL -->
<section class="final" aria-labelledby="final-title">
  <div class="wrap final__in">
    <h2 class="final__title" id="final-title"><span>${t.final.title[0]}</span> <span>${t.final.title[1]}</span></h2>
    <div class="final__actions">
      <a class="btn btn--sand" href="#booking" data-book>${icon('calendar-blank')}<span>${t.final.cta}</span></a>
      <a class="btn btn--ghost" href="${waLink('marina', t.booking.waHello)}" target="_blank" rel="noopener">${icon('whatsapp-logo')}<span>${t.final.consult}</span></a>
    </div>
  </div>
</section>

</main>

<footer class="foot">
  <div class="wrap foot__in">
    <p class="brand brand--foot"><span class="brand__mark">Levant</span><span class="brand__sub">Ivan &amp; Marina<br>massage · València</span></p>
    ${langSwitch('langs langs--foot')}
    <p class="foot__small">© ${new Date().getFullYear()} ${t.footer.rights}. ${t.footer.disclaimer}</p>
  </div>
</footer>

<div class="dock" data-dock>
  <a class="btn btn--sand" href="#booking" data-book>${icon('calendar-blank')}<span>${t.nav.book}</span></a>
  <a class="dock__wa" href="${waLink('marina', t.booking.waHello)}" target="_blank" rel="noopener" aria-label="WhatsApp">${icon('whatsapp-logo')}</a>
</div>

<script id="i18n" type="application/json">${JSON.stringify(clientData).replace(/</g, '\\u003c')}</script>
<script src="${base}assets/js/main.js" defer></script>
</body>
</html>
`;
}
