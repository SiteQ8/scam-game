// brand.json is the one place for the repository, address, name and app id. After it changes, npm run brand
// must run, so nothing keeps a placeholder or an old value, and the native apps carry the same id and name.
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import brand from '../brand.json';

const root = join(__dirname, '..');
const read = (f: string) => readFileSync(join(root, f), 'utf8');
const walk = (dir: string): string[] => (existsSync(dir) ? readdirSync(dir).flatMap((f) => { const p = join(dir, f); return statSync(p).isDirectory() ? walk(p) : [p]; }) : []);
const docs = ['README.md', 'CONTRIBUTING.md', 'SECURITY.md', 'THIRD_PARTY_NOTICES.md'].map((f) => join(root, f)).filter(existsSync);
const storeFiles = walk(join(root, 'store')).filter((f) => /\.(txt|md|json)$/.test(f));
const statePath = join(root, 'brand.applied.json');
const applied = existsSync(statePath) ? JSON.parse(readFileSync(statePath, 'utf8')) : null;
const named = Boolean(brand.nameEn && brand.nameAr);
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

describe('brand', () => {
  it('has a reverse domain app id and a GitHub repository', () => {
    expect(brand.appId).toMatch(/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*){2,}$/);
    expect(brand.repo).toMatch(/^[A-Za-z0-9-]+\/[A-Za-z0-9._-]+$/);
    expect(read('android/app/build.gradle')).toContain(`applicationId "${brand.appId}"`);
    expect(read('ios/App/App.xcodeproj/project.pbxproj')).toContain(`PRODUCT_BUNDLE_IDENTIFIER = ${brand.appId};`);
  });

  it.skipIf(!applied)('has written the current repository and address everywhere', () => {
    const [owner, repo] = brand.repo.split('/');
    expect(applied.REPO, 'run: npm run brand').toBe(brand.repo);
    expect(applied.DOMAIN, 'run: npm run brand').toBe(brand.domain || `${owner.toLowerCase()}.github.io/${repo}`);
    const left = [...docs, ...storeFiles].filter((f) => /\{\{(DOMAIN|REPO)\}\}/.test(readFileSync(f, 'utf8')));
    expect(left, 'run: npm run brand').toEqual([]);
  });

  it.skipIf(!named)('gives the documents, the listings and both apps the chosen name', () => {
    const left = [...docs, ...storeFiles].filter((f) => /\{\{(NAME_EN|NAME_AR)\}\}/.test(readFileSync(f, 'utf8')));
    expect(left, 'run: npm run brand').toEqual([]);
    expect(read('android/app/src/main/res/values/strings.xml')).toContain(`<string name="app_name">${brand.nameEn.replace(/'/g, "\\'")}</string>`);
    expect(read('ios/App/App/Info.plist')).toMatch(new RegExp(`<key>CFBundleDisplayName</key>\\s*<string>${escape(brand.nameEn)}</string>`));
  });
});
