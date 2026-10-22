// Every link, image, script, poster and video on the built website points at a file that exists.
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, normalize } from 'node:path';
import brand from '../brand.json';

const docs = join(__dirname, '..', 'docs');
const walk = (dir: string): string[] => readdirSync(dir).flatMap((f) => { const p = join(dir, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
// The 404 page is served for any missing path, so it links from the site root.
const base = brand.domain ? '/' : `/${(brand.repo || '').split('/')[1]}/`;
// Where the site is served: link previews and search engines need full addresses.
const [owner, repo] = brand.repo.split('/');
const site = brand.domain ? `https://${brand.domain}/` : `https://${owner.toLowerCase()}.github.io/${repo}/`;
const fileFor = (url: string) => {
  const p = join(docs, url.slice(site.length).split('?')[0]);
  return existsSync(p) && statSync(p).isDirectory() ? join(p, 'index.html') : p;
};

describe('the built website', () => {
  const pages = existsSync(docs) ? walk(docs).filter((f) => f.endsWith('.html') && !f.includes(`${join('docs', 'play')}`)) : [];

  it('has its pages', () => {
    expect(pages.length).toBeGreaterThanOrEqual(9);
  });

  it('links only to files that exist', () => {
    const broken: string[] = [];
    for (const page of pages) {
      const html = readFileSync(page, 'utf8');
      const refs = [...html.matchAll(/\s(?:href|src|poster|data-src)="([^"]+)"/g)].map((m) => m[1]);
      for (const m of html.matchAll(/\ssrcset="([^"]+)"/g)) refs.push(...m[1].split(',').map((s) => s.trim().split(/\s+/)[0]));
      for (const ref of refs) {
        if (/^(https?:|mailto:|tel:|data:|#|javascript:)/.test(ref) || ref === '') continue;
        const clean = ref.split('#')[0].split('?')[0];
        if (!clean) continue;
        let target = clean.startsWith('/') ? join(docs, clean.slice(base.length - 1 >= 0 ? base.length : 1)) : normalize(join(dirname(page), clean));
        if (clean.startsWith('/') && !clean.startsWith(base)) target = join(docs, clean);
        if (existsSync(target) && statSync(target).isDirectory()) target = join(target, 'index.html');
        if (!existsSync(target)) broken.push(`${page.slice(docs.length)} -> ${ref}`);
      }
    }
    expect(broken).toEqual([]);
  });

  it('gives link previews and search engines full addresses that exist', () => {
    const wrong: string[] = [];
    for (const page of pages) {
      const html = readFileSync(page, 'utf8');
      const name = page.slice(docs.length);
      const meta = (re: RegExp) => html.match(re)?.[1] ?? '';
      const image = meta(/<meta property="og:image" content="([^"]+)"/);
      if (!image.startsWith(site) || !existsSync(fileFor(image))) wrong.push(`${name}: og:image ${image}`);
      const canonical = meta(/<link rel="canonical" href="([^"]+)"/);
      if (name === '/404.html') {
        if (canonical) wrong.push(`${name}: the not found page names an address`);
        continue;
      }
      if (canonical !== site + name.slice(1).replace(/index\.html$/, '')) wrong.push(`${name}: canonical ${canonical}`);
      if (meta(/<meta property="og:url" content="([^"]+)"/) !== canonical) wrong.push(`${name}: og:url differs from canonical`);
      for (const m of html.matchAll(/<link rel="alternate" hreflang="[^"]+" href="([^"]+)"/g)) {
        if (!m[1].startsWith(site) || !existsSync(fileFor(m[1]))) wrong.push(`${name}: alternate ${m[1]}`);
      }
    }
    expect(wrong).toEqual([]);
  });
});
