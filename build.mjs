// Generates static pages: / (Ukrainian, default), /ru/, /es/, /en/.
// Usage: node build.mjs          → writes pages next to the sources (local preview, GitHub Pages)
//        node build.mjs --dist   → also assembles a clean deployable folder in dist/ (used by Vercel)
import { mkdirSync, writeFileSync, rmSync, cpSync } from 'node:fs';
import { render } from './src/render.mjs';
import uk from './src/i18n/uk.mjs';
import ru from './src/i18n/ru.mjs';
import es from './src/i18n/es.mjs';
import en from './src/i18n/en.mjs';

const langs = [uk, ru, es, en];
const toDist = process.argv.includes('--dist');
if (toDist) rmSync('dist', { recursive: true, force: true });

for (const t of langs) {
  const dir = t.code === 'uk' ? '.' : t.code;
  const base = t.code === 'uk' ? './' : '../';
  const html = render(t, langs, base);
  for (const root of toDist ? ['.', 'dist'] : ['.']) {
    mkdirSync(`${root}/${dir}`, { recursive: true });
    writeFileSync(`${root}/${dir}/index.html`, html);
  }
  console.log(`built ${dir}/index.html`);
}

if (toDist) {
  cpSync('assets', 'dist/assets', { recursive: true });
  console.log('assembled dist/');
}
