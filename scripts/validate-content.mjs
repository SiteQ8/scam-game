#!/usr/bin/env node
// Validates every card in content/cards/*.json against the rules in content/SCHEMA.md.
// Prints a summary and exits with code 1 when any error is found.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dir = process.argv[2] || join(root, 'content', 'cards');

export const CHANNELS = ['sms', 'notification', 'chat', 'email', 'call', 'web', 'qr', 'social', 'market'];
export const CATEGORIES = ['delivery', 'banking', 'accounts', 'government', 'telecom', 'utilities', 'shopping', 'marketplace', 'jobs', 'investment', 'romance', 'family', 'tech-support', 'prize', 'charity', 'travel', 'rental', 'education', 'subscriptions', 'business'];
export const TAGS = ['urgency', 'threat', 'payment', 'small-fee', 'lookalike-domain', 'shortened-link', 'otp', 'credentials', 'impersonation', 'unknown-number', 'new-number', 'voice-clone', 'too-good', 'gift-cards', 'crypto', 'remote-access', 'app-install', 'qr', 'attachment', 'off-platform', 'advance-fee', 'emotional', 'secrecy', 'official-channel', 'no-link', 'expected', 'verify-independently'];
const KINDS = ['red', 'green', 'trap'];

// Brand names that must never appear. Latin names match whole words. Arabic names match whole words with
// the usual attached prefixes (و ف ب ل ك and ال), so ordinary words that contain a name, such as قانون, أبلغ or تخزين, pass.
const BANNED_LATIN = ['kfh', 'kuwait finance house', 'boubyan', 'burgan', 'warba', 'gulf bank', 'al ahli', 'ahli bank', 'aramex', 'dhl', 'fedex', 'ups', 'usps', 'royal mail', 'amazon', 'ebay', 'paypal', 'apple', 'icloud', 'google', 'gmail', 'microsoft', 'hotmail', 'netflix', 'whatsapp', 'telegram', 'instagram', 'facebook', 'meta', 'tiktok', 'snapchat', 'twitter', 'linkedin', 'zain', 'ooredoo', 'stc', 'viva', 'talabat', 'deliveroo', 'careem', 'uber', 'binance', 'knet', 'mastercard', 'sahel', 'western union', 'moneygram', 'shein', 'temu', 'alibaba', 'aliexpress', 'samsung', 'huawei', 'qatar airways', 'kuwait airways', 'jazeera', 'noon.com', 'noon app', 'visa card', 'visa debit', 'visa credit', 'visa.com', 'emirates airline', 'fly emirates', 'emirates.com', 'outlook.com', 'microsoft outlook'];
const BANNED_ARABIC = ['الوطني للتمويل', 'بيت التمويل', 'بوبيان', 'برقان', 'وربة', 'بنك الخليج', 'الأهلي', 'أرامكس', 'ارامكس', 'واتساب', 'واتس اب', 'تيليجرام', 'تلغرام', 'انستغرام', 'إنستغرام', 'انستقرام', 'فيسبوك', 'تيك توك', 'سناب', 'تويتر', 'أوريدو', 'اوريدو', 'أوبر', 'نون', 'أمازون', 'امازون', 'باي بال', 'كي نت', 'كي-نت', 'ماستركارد', 'جوجل', 'قوقل', 'أبل', 'آبل', 'مايكروسوفت', 'نتفليكس', 'سهل الحكومي', 'تطبيق سهل'];
// Names that are also everyday Arabic words (زين means okay, طلبات orders, كريم generous, فيزا a travel visa):
// banned as a sender, contact or brand name, and in phrases that can only mean the brand.
const BRAND_WORDS_AR = ['زين', 'طلبات', 'كريم', 'فيزا'];
const BRAND_PHRASES_AR = ['شركة زين', 'زين للاتصالات', 'تطبيق زين', 'باقة زين', 'شريحة زين', 'فاتورة زين', 'تطبيق طلبات', 'طلبات دوت كوم', 'تطبيق كريم', 'كابتن كريم', 'بطاقة فيزا', 'فيزا كارد', 'فيزا الذهبية'];
// One bank's names are kept out of this repository entirely, by the author's request: only their fingerprints are listed.
const HIDDEN = new Set(['6afd038687a96730', '11544546304da480', '052f9bd22a9bf168']);
const fingerprint = (s) => createHash('sha256').update(s).digest('hex').slice(0, 16);
function hiddenBrand(s) {
  for (const words of [s.toLowerCase().match(/[a-z]+/g) || [], s.match(/[\u0600-\u06FF]+/g) || []]) {
    for (let n = 1; n <= 4; n++) for (let i = 0; i + n <= words.length; i++) {
      const gram = words.slice(i, i + n);
      if (HIDDEN.has(fingerprint(gram.join(' '))) || HIDDEN.has(fingerprint([gram[0].replace(/^[وفبلك]/, ''), ...gram.slice(1)].join(' ')))) return true;
    }
  }
  return false;
}
const AR_BOUND = '\\u0600-\\u06FF';
const arWord = (w) => new RegExp(`(^|[^${AR_BOUND}])(?:[وفبلك]?(?:ال)?)${w}(?=$|[^${AR_BOUND}])`);

const DASHES = /[‒–—―−]/;
const SPACED_HYPHEN = /(^|\s)-(\s|$)/;
const AR_LETTER = /[؀-ۿ]/;
const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
const DOMAIN = /(?:https?:\/\/)?(?:[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\.)+[A-Za-z]{2,}(?:\/[^\s،,]*)?/g;
const CURRENCY = /(د\.ك|ر\.س|د\.إ|ر\.ق|د\.ب|ر\.ع)/g;
const NUMBER = /\d+\.\d+/g;
const RESERVED_PHONES = [/^\+44\s?7700\s?900\d{3}$/, /^\+1\s?\(?202\)?\s?555\s?01\d{2}$/];
const LEGIT_DOMAIN = /(^|\.)(gov\.kw|gov|example|example\.com|example\.net|example\.org)$/i;

const errors = [];
const warnings = [];
const err = (id, msg) => errors.push(`${id}: ${msg}`);
const warn = (id, msg) => warnings.push(`${id}: ${msg}`);

function stripAllowed(s) {
  return s.replace(EMAIL, ' ').replace(DOMAIN, ' ').replace(CURRENCY, ' ').replace(NUMBER, ' ');
}

export function textFields(channel, card) {
  const out = [];
  const push = (v) => { if (typeof v === 'string' && v.length) out.push(v); };
  if (!card || typeof card !== 'object') return out;
  switch (channel) {
    case 'sms': push(card.sender); push(card.body); break;
    case 'notification': push(card.app); push(card.title); push(card.body); break;
    case 'chat': push(card.contact); (card.messages || []).forEach((m) => push(m && m.text)); break;
    case 'email': push(card.fromName); push(card.fromAddress); push(card.subject); push(card.body); if (card.button) { push(card.button.label); push(card.button.url); } push(card.attachment); break;
    case 'call': push(card.caller); (card.lines || []).forEach((l) => push(l && l.text)); break;
    case 'web': push(card.url); push(card.title); push(card.heading); push(card.text); (card.fields || []).forEach(push); push(card.button); break;
    case 'qr': push(card.place); push(card.title); push(card.text); push(card.opens); break;
    case 'social': push(card.displayName); push(card.handle); push(card.text); break;
    case 'market': push(card.item); push(card.price); (card.messages || []).forEach((m) => push(m && m.text)); break;
    default: break;
  }
  return out;
}

const isStr = (v) => typeof v === 'string' && v.trim().length > 0;
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

function checkMessages(id, where, list) {
  if (!Array.isArray(list) || list.length < 1 || list.length > 5) { err(id, `${where}.messages must have 1 to 5 items`); return; }
  list.forEach((m, i) => {
    if (!m || !['them', 'me'].includes(m.from)) err(id, `${where}.messages[${i}].from must be them or me`);
    if (!isStr(m && m.text)) err(id, `${where}.messages[${i}].text missing`);
    if (m && m.time !== undefined && !TIME.test(m.time)) err(id, `${where}.messages[${i}].time must be HH:MM`);
    if (m && m.voice) {
      if (m.voice !== true) err(id, `${where}.messages[${i}].voice must be true when present`);
      if (!/^\d:[0-5]\d$/.test(m.duration || '')) err(id, `${where}.messages[${i}].duration must be like 0:12`);
    }
  });
}

function checkCard(id, channel, lang, card) {
  const where = `${lang}.card`;
  if (!card || typeof card !== 'object') { err(id, `${where} missing`); return; }
  const need = (k) => { if (!isStr(card[k])) err(id, `${where}.${k} missing`); };
  const identity = { sms: ['sender'], notification: ['app'], chat: ['contact'], email: ['fromName'], call: ['caller'], social: ['displayName', 'handle'], web: ['title'], qr: ['place'] }[channel] || [];
  for (const f of identity) {
    if (typeof card[f] !== 'string') continue;
    for (const w of BRAND_WORDS_AR) if (arWord(w).test(card[f])) err(id, `${where}.${f}: "${w}" cannot be a sender or brand name`);
  }
  const bool = (k) => { if (typeof card[k] !== 'boolean') err(id, `${where}.${k} must be true or false`); };
  switch (channel) {
    case 'sms': need('sender'); need('body'); if (!TIME.test(card.time || '')) err(id, `${where}.time must be HH:MM`); break;
    case 'notification': need('app'); need('title'); need('body'); if (!(card.time === 'now' || /^\d{1,2}m$/.test(card.time || '') || TIME.test(card.time || ''))) err(id, `${where}.time must be now, 2m or HH:MM`); break;
    case 'chat': need('contact'); bool('saved'); checkMessages(id, where, card.messages); break;
    case 'email': need('fromName'); need('fromAddress'); need('subject'); need('body');
      if (card.button !== undefined && (!card.button || !isStr(card.button.label) || !isStr(card.button.url))) err(id, `${where}.button needs label and url`);
      if (card.attachment !== undefined && !isStr(card.attachment)) err(id, `${where}.attachment must be a file name`);
      break;
    case 'call': {
      need('caller'); bool('saved');
      const v = card.voice || {};
      if (!['male', 'female'].includes(v.gender) || !['young', 'adult', 'older'].includes(v.age) || !['calm', 'urgent', 'friendly', 'official'].includes(v.tone)) err(id, `${where}.voice needs gender, age and tone from the allowed values`);
      if (!Array.isArray(card.lines) || card.lines.length < 2 || card.lines.length > 6) err(id, `${where}.lines must have 2 to 6 items`);
      else {
        let words = 0;
        card.lines.forEach((l, i) => {
          if (!l || !['caller', 'you'].includes(l.who)) err(id, `${where}.lines[${i}].who must be caller or you`);
          if (!isStr(l && l.text)) err(id, `${where}.lines[${i}].text missing`);
          else if (l.who === 'caller') words += l.text.trim().split(/\s+/).length;
        });
        if (words < 15 || words > 75) err(id, `${where}: caller lines have ${words} words, expected 20 to 60`);
      }
      break;
    }
    case 'web': need('url'); bool('secure'); need('title'); need('heading'); need('text'); need('button');
      if (!Array.isArray(card.fields) || card.fields.length > 4 || card.fields.some((f) => !isStr(f))) err(id, `${where}.fields must be 0 to 4 labels`);
      if (/^https?:\/\//i.test(card.url || '')) err(id, `${where}.url must not include the scheme`);
      break;
    case 'qr': need('place'); need('title'); need('text'); need('opens'); break;
    case 'social': need('displayName'); need('handle'); bool('verified'); need('followers'); need('text');
      if (!['dm', 'post', 'comment'].includes(card.kind)) err(id, `${where}.kind must be dm, post or comment`);
      break;
    case 'market': need('item'); need('price'); checkMessages(id, where, card.messages); break;
    default: break;
  }
}

function allStrings(obj, out = []) {
  if (typeof obj === 'string') out.push(obj);
  else if (Array.isArray(obj)) obj.forEach((v) => allStrings(v, out));
  else if (obj && typeof obj === 'object') Object.values(obj).forEach((v) => allStrings(v, out));
  return out;
}

function checkCommonText(id, lang, s) {
  if (DASHES.test(s)) err(id, `${lang}: dash character in "${s.slice(0, 60)}"`);
  if (SPACED_HYPHEN.test(s.replace(DOMAIN, ' '))) err(id, `${lang}: hyphen used as a dash in "${s.slice(0, 60)}"`);
  const low = s.toLowerCase();
  for (const b of BANNED_LATIN) {
    const re = new RegExp(`(^|[^a-z0-9])${b.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z0-9]|$)`, 'i');
    if (re.test(low)) err(id, `${lang}: brand name "${b}" is not allowed`);
  }
  for (const b of BANNED_ARABIC) if (arWord(b).test(s)) err(id, `${lang}: brand name "${b}" is not allowed`);
  for (const b of BRAND_PHRASES_AR) if (s.includes(b)) err(id, `${lang}: brand name "${b}" is not allowed`);
  if (hiddenBrand(s)) err(id, `${lang}: a bank name that must never appear is in "${s.slice(0, 60)}"`);
  // Phone numbers
  for (const m of s.match(/\+\d[\d\s()]{6,}\d/g) || []) {
    const digits = m.replace(/\D/g, '');
    if (digits.length >= 8 && !RESERVED_PHONES.some((re) => re.test(m.trim()))) err(id, `${lang}: unmasked phone number "${m}" (mask Gulf numbers or use a reserved range)`);
  }
  for (const m of s.replace(/\+\d[\d\s()]{6,}\d/g, ' ').match(/(?<![\d.])\d[\d ]{6,}\d(?![\d.])/g) || []) {
    const digits = m.replace(/\D/g, '');
    if (digits.length === 8 && /^[2569]/.test(digits)) err(id, `${lang}: looks like a real local number "${m}"`);
    else if (digits.length >= 8) warn(id, `${lang}: long digit run "${m}" (fine only for a labelled code or reference)`);
  }
}

function checkArabicSentence(id, where, s) {
  if (!isStr(s)) { err(id, `${where} missing`); return; }
  const t = s.trim();
  if (!AR_LETTER.test(t)) err(id, `${where}: Arabic text expected`);
  if (!t.endsWith('.')) err(id, `${where}: must end with a period`);
  const inner = stripAllowed(t.slice(0, -1));
  if (inner.includes('.')) err(id, `${where}: period in the middle: "${t.slice(0, 80)}"`);
  if (/[!؟?]/.test(inner)) err(id, `${where}: question or exclamation mark inside an explanation`);
  if (/[A-Za-z]/.test(stripAllowed(t))) err(id, `${where}: Latin letters in an Arabic explanation: "${t.slice(0, 80)}"`);
  if (t.length > 260) warn(id, `${where}: long (${t.length} chars)`);
}

function checkArabicCardText(id, where, s) {
  const inner = stripAllowed(s.trim().replace(/[.]$/, ''));
  if (inner.includes('.')) err(id, `${where}: period in the middle of Arabic text: "${s.slice(0, 80)}"`);
}

function checkEnglishSentence(id, where, s) {
  if (!isStr(s)) { err(id, `${where} missing`); return; }
  if (AR_LETTER.test(s)) err(id, `${where}: Arabic letters in English text`);
  const sentences = stripAllowed(s).split(/[.!?](\s|$)/).filter((x) => x && x.trim().length > 1);
  if (sentences.length > 2) warn(id, `${where}: more than two sentences`);
  if (s.length > 240) warn(id, `${where}: long (${s.length} chars)`);
}

function domainsIn(strings) {
  const out = [];
  for (const s of strings) {
    for (const e of s.match(EMAIL) || []) out.push(e.split('@')[1].toLowerCase());
    for (const d of s.replace(EMAIL, ' ').match(DOMAIN) || []) out.push(d.replace(/^https?:\/\//i, '').split('/')[0].toLowerCase());
  }
  return out;
}

// ---------- run ----------
if (!existsSync(dir)) { console.error(`No folder ${dir}`); process.exit(1); }
const files = readdirSync(dir).filter((f) => f.endsWith('.json')).sort();
const cards = [];
for (const f of files) {
  let data;
  try { data = JSON.parse(readFileSync(join(dir, f), 'utf8')); } catch (e) { errors.push(`${f}: invalid JSON (${e.message})`); continue; }
  if (!Array.isArray(data)) { errors.push(`${f}: the file must hold a JSON array`); continue; }
  data.forEach((c) => cards.push({ c, f }));
}

const seen = new Set();
for (const { c, f } of cards) {
  const id = c && c.id ? c.id : `${f}:(no id)`;
  if (!c || typeof c !== 'object') { err(id, 'not an object'); continue; }
  if (!/^[a-z0-9]+(-[a-z0-9]+)+$/.test(c.id || '')) err(id, 'id must be lowercase kebab-case');
  if (seen.has(c.id)) err(id, `duplicate id (also in another card) in ${f}`);
  seen.add(c.id);
  if (!CHANNELS.includes(c.channel)) { err(id, `channel must be one of ${CHANNELS.join(', ')}`); continue; }
  if (!(c.id || '').startsWith(`${c.channel}-`)) err(id, `id must start with "${c.channel}-"`);
  if (!['scam', 'legit'].includes(c.verdict)) err(id, 'verdict must be scam or legit');
  if (!CATEGORIES.includes(c.category)) err(id, `category "${c.category}" is not allowed`);
  if (!['gcc', 'global'].includes(c.region)) err(id, 'region must be gcc or global');
  if (!Number.isInteger(c.difficulty) || c.difficulty < 1 || c.difficulty > 5) err(id, 'difficulty must be 1 to 5');
  if (c.tags !== undefined && (!Array.isArray(c.tags) || c.tags.some((t) => !TAGS.includes(t)))) err(id, `tags must come from: ${TAGS.join(', ')}`);

  for (const lang of ['ar', 'en']) {
    const block = c[lang];
    if (!block || typeof block !== 'object') { err(id, `${lang} block missing`); continue; }
    checkCard(id, c.channel, lang, block.card);
    const fields = textFields(c.channel, block.card);
    const sig = block.signals;
    if (!Array.isArray(sig) || sig.length < 2 || sig.length > 4) err(id, `${lang}.signals must have 2 to 4 items`);
    else {
      const reds = sig.filter((s) => s && s.kind === 'red').length;
      const greens = sig.filter((s) => s && s.kind === 'green').length;
      if (c.verdict === 'scam' && (reds < 2 || greens > 0)) err(id, `${lang}: a scam card needs at least 2 red signals and no green (has ${reds} red, ${greens} green)`);
      if (c.verdict === 'legit' && (greens < 2 || reds > 0)) err(id, `${lang}: a legit card needs at least 2 green signals and no red (has ${greens} green, ${reds} red)`);
      const marks = [];
      sig.forEach((s, i) => {
        if (!s || !KINDS.includes(s.kind)) err(id, `${lang}.signals[${i}].kind must be red, green or trap`);
        if (!isStr(s && s.mark)) { err(id, `${lang}.signals[${i}].mark missing`); return; }
        if (!fields.some((t) => t.includes(s.mark))) err(id, `${lang}.signals[${i}].mark "${s.mark}" is not an exact substring of the card text`);
        if (s.mark.length > 90) warn(id, `${lang}.signals[${i}].mark is long, keep marks short`);
        marks.push(s.mark);
        if (lang === 'ar') checkArabicSentence(id, `ar.signals[${i}].why`, s.why); else checkEnglishSentence(id, `en.signals[${i}].why`, s.why);
      });
      marks.forEach((m, i) => marks.forEach((n, j) => {
        if (i < j && (m === n || m.includes(n) || n.includes(m))) err(id, `${lang}: marks "${m}" and "${n}" repeat or contain one another`);
      }));
    }
    if (lang === 'ar') checkArabicSentence(id, 'ar.lesson', block.lesson); else checkEnglishSentence(id, 'en.lesson', block.lesson);
    if (block.context !== undefined) {
      if (lang === 'ar') checkArabicSentence(id, 'ar.context', block.context); else checkEnglishSentence(id, 'en.context', block.context);
      if (isStr(block.context) && block.context.length > 110) err(id, `${lang}.context is too long, keep it under 90 characters`);
    }

    for (const s of allStrings(block)) checkCommonText(id, lang, s);
    if (lang === 'ar') for (const s of fields) checkArabicCardText(id, 'ar.card', s);
    if (lang === 'en') for (const s of fields) if (AR_LETTER.test(s)) err(id, `en.card: Arabic letters in "${s.slice(0, 50)}"`);

    if (c.verdict === 'legit') {
      for (const d of domainsIn(fields)) if (!LEGIT_DOMAIN.test(d)) err(id, `${lang}: a legit card may only show .gov.kw, .gov or example.com style addresses, found ${d}`);
    }
  }
}

// ---------- summary ----------
const count = (key) => cards.reduce((acc, { c }) => { const k = c && c[key]; acc[k] = (acc[k] || 0) + 1; return acc; }, {});
const fmt = (o) => Object.entries(o).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(', ');
console.log(`Cards: ${cards.length} in ${files.length} files`);
console.log(`Verdict: ${fmt(count('verdict'))}`);
console.log(`Channel: ${fmt(count('channel'))}`);
console.log(`Region: ${fmt(count('region'))}`);
console.log(`Difficulty: ${fmt(count('difficulty'))}`);
console.log(`Category: ${fmt(count('category'))}`);
if (warnings.length) { console.log(`\nWarnings (${warnings.length}):`); warnings.forEach((w) => console.log(`  ${w}`)); }
if (errors.length) { console.log(`\nErrors (${errors.length}):`); errors.forEach((e) => console.log(`  ${e}`)); process.exit(1); }
console.log('\nOK');
