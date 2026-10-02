// Generates static pages: / (Ukrainian, default), /ru/, /es/, /en/.
// Usage: node build.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import { render } from './src/render.mjs';
import uk from './src/i18n/uk.mjs';
import ru from './src/i18n/ru.mjs';
import es from './src/i18n/es.mjs';
import en from './src/i18n/en.mjs';

const langs = [uk, ru, es, en];

for (const t of langs) {
  const dir = t.code === 'uk' ? '.' : t.code;
  const base = t.code === 'uk' ? './' : '../';
  mkdirSync(dir, { recursive: true });
  writeFileSync(`${dir}/index.html`, render(t, langs, base));
  console.log(`built ${dir}/index.html`);
}
