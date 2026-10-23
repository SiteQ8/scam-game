// Applies the repository, web address, name and app id from brand.json to the files that cannot read it at build time:
// the repository documents, the store listings, the app names on iPhone and Android and the bundle id.
// The website, the web app and the Capacitor config read brand.json themselves.
//
// It works in two stages, and is safe to run again at any time:
//   before the name: brand.json has the repository; the address is the GitHub Pages one (owner.github.io/repo)
//   with the name:   nameEn, nameAr and domain are filled; the documents move to the new address and the apps get the name
// What was last written into the documents is kept in brand.applied.json, so a later run can replace it.
//
// usage: node scripts/apply-brand.mjs          apply it
//        node scripts/apply-brand.mjs --check  only list what is still missing
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync, mkdirSync, unlinkSync, rmdirSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const brand = JSON.parse(readFileSync(join(root, 'brand.json'), 'utf8'));
const statePath = join(root, 'brand.applied.json');
const applied = existsSync(statePath) ? JSON.parse(readFileSync(statePath, 'utf8')) : {};
const checkOnly = process.argv.includes('--check');

const problems = [];
if (!/^[A-Za-z0-9-]+\/[A-Za-z0-9._-]+$/.test(brand.repo || '')) problems.push('repo (owner/name on GitHub) is empty');
if (brand.domain && !/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(brand.domain)) problems.push('domain is not a host name (for example name.3li.info)');
if (!/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*){2,}$/.test(brand.appId || '')) problems.push('appId (for example com.eworldq8.name) is not a reverse domain id');
const named = Boolean(brand.nameEn?.trim() && brand.nameAr?.trim());
const [owner, repoName] = (brand.repo || '/').split('/');
// Without a custom domain the site is served by GitHub Pages under the repository's name.
const host = brand.domain || `${owner.toLowerCase()}.github.io/${repoName}`;

const VALUES = { DOMAIN: host, REPO: brand.repo, ...(named ? { NAME_EN: brand.nameEn, NAME_AR: brand.nameAr } : {}) };
const DOCS = ['README.md', 'CONTRIBUTING.md', 'SECURITY.md', 'THIRD_PARTY_NOTICES.md'];
const walk = (dir) => (existsSync(dir) ? readdirSync(dir).flatMap((f) => { const p = join(dir, f); return statSync(p).isDirectory() ? walk(p) : [p]; }) : []);
const textFiles = [...DOCS.map((f) => join(root, f)).filter(existsSync), ...walk(join(root, 'store')).filter((f) => /\.(txt|md|json)$/.test(f))];

if (checkOnly || problems.length) {
  if (problems.length) console.log(`brand.json is not complete:\n  ${problems.join('\n  ')}`);
  if (!named) console.log('the name is not chosen yet: the documents keep their name placeholders and the apps keep their current name');
  const pending = textFiles.filter((f) => /\{\{(NAME_EN|NAME_AR|DOMAIN|REPO)\}\}/.test(readFileSync(f, 'utf8')));
  console.log(pending.length ? `files with placeholders:\n  ${pending.map((f) => relative(root, f)).join('\n  ')}` : 'no file has a placeholder');
  process.exit(problems.length && !checkOnly ? 1 : 0);
}

// 1. Documents and store listings: placeholders first, then any value written by an earlier run.
const swaps = Object.entries(VALUES).flatMap(([k, v]) => [[`{{${k}}}`, v], ...(applied[k] && applied[k] !== v ? [[applied[k], v]] : [])]);
for (const f of textFiles) {
  const before = readFileSync(f, 'utf8');
  let s = before;
  for (const [from, to] of swaps) s = s.split(from).join(to);
  if (s !== before) { writeFileSync(f, s); console.log('updated', relative(root, f)); }
}
writeFileSync(statePath, `${JSON.stringify({ ...applied, ...VALUES }, null, 2)}\n`);

// Android string resources also need apostrophes and quotes escaped; a plist only needs XML escaping.
const androidText = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/'/g, "\\'").replace(/"/g, '\\"');
const plistText = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const edit = (file, fn) => {
  const p = join(root, file);
  const before = readFileSync(p, 'utf8');
  const after = fn(before);
  if (after !== before) { writeFileSync(p, after); console.log('updated', file); }
};

// 2. The application id on both platforms
edit('android/app/src/main/res/values/strings.xml', (s) => s
  .replace(/(<string name="package_name">)[^<]*(<\/string>)/, `$1${brand.appId}$2`)
  .replace(/(<string name="custom_url_scheme">)[^<]*(<\/string>)/, `$1${brand.appId}$2`));
edit('android/app/build.gradle', (s) => s.replace(/applicationId "[^"]+"/, `applicationId "${brand.appId}"`));
edit('ios/App/App.xcodeproj/project.pbxproj', (s) => s.replace(/PRODUCT_BUNDLE_IDENTIFIER = [^;]+;/g, `PRODUCT_BUNDLE_IDENTIFIER = ${brand.appId};`));

// The Android namespace and the Java package of the main activity follow the id, so the code reads like the app it builds.
const gradlePath = join(root, 'android/app/build.gradle');
const oldNs = readFileSync(gradlePath, 'utf8').match(/namespace = "([^"]+)"/)?.[1];
if (oldNs && oldNs !== brand.appId) {
  edit('android/app/build.gradle', (s) => s.replace(/namespace = "[^"]+"/, `namespace = "${brand.appId}"`));
  const javaRoot = join(root, 'android/app/src/main/java');
  const from = join(javaRoot, ...oldNs.split('.'));
  const to = join(javaRoot, ...brand.appId.split('.'));
  if (existsSync(from)) {
    mkdirSync(to, { recursive: true });
    for (const f of readdirSync(from).filter((x) => x.endsWith('.java'))) {
      const src = readFileSync(join(from, f), 'utf8').replace(/^package [^;]+;/m, `package ${brand.appId};`);
      writeFileSync(join(to, f), src);
      unlinkSync(join(from, f));
      console.log('moved', relative(root, join(from, f)), 'to', relative(root, join(to, f)));
    }
    // Remove the folders the old package leaves empty.
    for (let d = from; d.startsWith(javaRoot) && d !== javaRoot && readdirSync(d).length === 0; d = dirname(d)) rmdirSync(d);
  }
}

// 3. The name under the icon, once there is one: English and Arabic on Android, English on iPhone
if (named) {
  edit('android/app/src/main/res/values/strings.xml', (s) => s
    .replace(/(<string name="app_name">)[^<]*(<\/string>)/, `$1${androidText(brand.nameEn)}$2`)
    .replace(/(<string name="title_activity_main">)[^<]*(<\/string>)/, `$1${androidText(brand.nameEn)}$2`));
  mkdirSync(join(root, 'android/app/src/main/res/values-ar'), { recursive: true });
  const arStrings = `<?xml version='1.0' encoding='utf-8'?>\n<resources>\n    <string name="app_name">${androidText(brand.nameAr)}</string>\n    <string name="title_activity_main">${androidText(brand.nameAr)}</string>\n</resources>\n`;
  const arPath = join(root, 'android/app/src/main/res/values-ar/strings.xml');
  if (!existsSync(arPath) || readFileSync(arPath, 'utf8') !== arStrings) { writeFileSync(arPath, arStrings); console.log('updated', relative(root, arPath)); }
  edit('ios/App/App/Info.plist', (s) => s.replace(/(<key>CFBundleDisplayName<\/key>\s*<string>)[^<]*(<\/string>)/, `$1${plistText(brand.nameEn)}$2`));
  // iPhone shows the name in the phone's language: English by default, Arabic on an Arabic phone.
  const stringsText = (s) => s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  for (const [dir, value] of [['en.lproj', brand.nameEn], ['ar.lproj', brand.nameAr]]) {
    const p = join(root, 'ios/App/App', dir, 'InfoPlist.strings');
    const text = `/* The app's name under its icon. Written by scripts/apply-brand.mjs from brand.json. */\n"CFBundleDisplayName" = "${stringsText(value)}";\n`;
    mkdirSync(dirname(p), { recursive: true });
    if (!existsSync(p) || readFileSync(p, 'utf8') !== text) { writeFileSync(p, text); console.log('updated', relative(root, p)); }
  }
}

console.log(`applied: https://${host}/, github.com/${brand.repo}, ${brand.appId}${named ? `, ${brand.nameEn} / ${brand.nameAr}` : ', name not chosen yet'}`);
console.log('next: npm run build:site, then npx cap sync');
