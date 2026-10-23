// Offline message checker: looks for well known warning signs in pasted text and links.
// It never says a message is safe, only what it found. Nothing leaves the device.

export interface Finding {
  id: string;
  weight: 0 | 1 | 2 | 3;
  positive?: boolean;
  evidence?: string;
  en: { title: string; body: string };
  ar: { title: string; body: string };
}

export interface LinkReport { raw: string; host: string; findings: string[] }

export interface CheckResult {
  findings: Finding[];
  links: LinkReport[];
  level: 'high' | 'medium' | 'low';
  score: number;
}

type Text = { title: string; body: string };
interface RuleText { en: Text; ar: Text }

const T: Record<string, RuleText> = {
  urgency: { en: { title: 'Pressure to act fast', body: 'Deadlines and threats of suspension are there to stop you from checking first.' }, ar: { title: 'ضغط لتتصرف بسرعة', body: 'المهل القصيرة والتهديد بالإيقاف غرضهما أن تتصرف قبل أن تتحقق.' } },
  threat: { en: { title: 'Threats of legal trouble', body: 'Real authorities do not threaten you by message or demand instant payment to avoid arrest.' }, ar: { title: 'تهديد بعواقب قانونية', body: 'الجهات الرسمية لا تهددك برسالة ولا تطلب دفعاً فورياً لتتجنب القبض أو القضايا.' } },
  payment: { en: { title: 'Asks for a payment', body: 'Unexpected fees, fines or charges sent by message are the most common scam hook.' }, ar: { title: 'يطلب منك دفع مبلغ', body: 'الرسوم والغرامات المفاجئة التي تصلك برسالة أشهر طُعم يستخدمه المحتالون.' } },
  secrets: { en: { title: 'Asks for a code, PIN or password', body: 'No bank, courier or government office ever needs your code, PIN or password.' }, ar: { title: 'يطلب رمزاً أو رقماً سرياً أو كلمة مرور', body: 'لا يحتاج أي بنك أو جهة توصيل أو جهة حكومية إلى رمزك أو رقمك السري أو كلمة مرورك أبداً.' } },
  prize: { en: { title: 'A prize you never entered for', body: 'Winning something you never entered usually ends with a fee or a request for your card.' }, ar: { title: 'جائزة لم تشارك فيها', body: 'الفوز بشيء لم تشارك فيه ينتهي غالباً بطلب رسوم أو بيانات بطاقتك.' } },
  tooGood: { en: { title: 'Returns that sound too good', body: 'Guaranteed or daily profits are the signature of investment scams.' }, ar: { title: 'أرباح أجمل من الحقيقة', body: 'الأرباح المضمونة أو اليومية علامة مميزة لاحتيال الاستثمار.' } },
  offPlatform: { en: { title: 'Moving you somewhere private', body: 'Scammers move the talk to another app or ask for secrecy so nobody can warn you.' }, ar: { title: 'ينقلك بعيداً عن الأعين', body: 'المحتال ينقل الحديث إلى تطبيق آخر أو يطلب منك الكتمان حتى لا ينبهك أحد.' } },
  oddPayment: { en: { title: 'A payment you cannot get back', body: 'Gift cards, crypto and transfers to personal accounts are hard or impossible to recover.' }, ar: { title: 'طريقة دفع لا تُسترجع', body: 'بطاقات الهدايا والعملات الرقمية والتحويل إلى حسابات شخصية أموال يصعب أو يستحيل استرجاعها.' } },
  remote: { en: { title: 'Asks you to install an app', body: 'Remote access apps and apps from links give a stranger control of your phone or computer.' }, ar: { title: 'يطلب منك تثبيت تطبيق', body: 'تطبيقات التحكم عن بعد والتطبيقات القادمة من روابط تمنح الغريب سيطرة على هاتفك أو جهازك.' } },
  newNumber: { en: { title: 'A new number for someone you know', body: 'Call the person on the number you already have before you send anything.' }, ar: { title: 'رقم جديد لشخص تعرفه', body: 'اتصل بالشخص على رقمه الذي تعرفه قبل أن ترسل أي شيء.' } },
  generic: { en: { title: 'A greeting with no name', body: 'Organisations you deal with usually know your name, so a generic greeting suggests a mass message.' }, ar: { title: 'تحية عامة بلا اسم', body: 'الجهات التي تتعامل معها تعرف اسمك غالباً، والتحية العامة توحي برسالة جماعية.' } },
  verifyAccount: { en: { title: 'Asks you to verify your details', body: 'Requests to confirm your details through a message are how account takeovers start.' }, ar: { title: 'يطلب تأكيد بياناتك', body: 'طلب تأكيد بياناتك عبر رسالة هو بداية الاستيلاء على الحسابات.' } },
  shortener: { en: { title: 'A shortened link', body: 'Short links hide the real address, so you cannot see where they lead.' }, ar: { title: 'رابط مختصر', body: 'الرابط المختصر يخفي العنوان الحقيقي فلا تعرف إلى أين يأخذك.' } },
  ipHost: { en: { title: 'A link made of numbers', body: 'Genuine services give their sites names, not raw numbers.' }, ar: { title: 'رابط من أرقام', body: 'الخدمات الحقيقية تضع لمواقعها أسماء لا أرقاماً مجردة.' } },
  punycode: { en: { title: 'Look-alike letters in the address', body: 'Some letters come from other alphabets to imitate a real name.' }, ar: { title: 'حروف مقلدة في العنوان', body: 'بعض الحروف مأخوذة من أبجديات أخرى لتقليد اسم حقيقي.' } },
  govMisuse: { en: { title: 'Pretends to be a government site', body: 'Government sites end with gov and a country code, such as gov.kw, while here gov is only a word inside the address.' }, ar: { title: 'ينتحل صفة موقع حكومي', body: 'المواقع الحكومية تنتهي بالكلمة gov ثم رمز الدولة مثل gov.kw، بينما الكلمة هنا مجرد جزء داخل العنوان.' } },
  manyHyphens: { en: { title: 'An address stuffed with words', body: 'Long addresses full of extra words and hyphens are built to look official.' }, ar: { title: 'عنوان محشو بالكلمات', body: 'العناوين الطويلة المليئة بالكلمات والشرطات مصممة لتبدو رسمية.' } },
  riskyTld: { en: { title: 'An ending common in scam links', body: 'Some endings are cheap and popular with throwaway scam sites, though not every site using them is a scam.' }, ar: { title: 'نهاية شائعة في روابط الاحتيال', body: 'بعض النهايات رخيصة وشائعة في مواقع الاحتيال المؤقتة، وإن لم يكن كل موقع يستخدمها احتيالاً.' } },
  noTls: { en: { title: 'Not a protected connection', body: 'The link starts with http, so anything you type can be read on the way.' }, ar: { title: 'اتصال غير محمي', body: 'الرابط يبدأ بالبادئة http لذا يمكن قراءة ما تكتبه في الطريق.' } },
  lureWords: { en: { title: 'Trust words inside the address', body: 'Words like secure, verify or pay in an address are decoration, not proof.' }, ar: { title: 'كلمات ثقة داخل العنوان', body: 'كلمات مثل secure و verify و pay داخل العنوان زينة لا دليل.' } },
  govOfficial: { en: { title: 'A real government domain', body: 'This address ends with an official government domain. Still type it yourself instead of tapping a link.' }, ar: { title: 'نطاق حكومي حقيقي', body: 'هذا العنوان ينتهي بنطاق حكومي رسمي، ومع ذلك اكتبه بنفسك بدل الضغط على الرابط.' } },
  foreignNumber: { en: { title: 'An international number', body: 'If you were not expecting a message from abroad, treat this number with care.' }, ar: { title: 'رقم دولي', body: 'إن لم تكن تنتظر رسالة من خارج البلد فتعامل مع هذا الرقم بحذر.' } },
  codeMessage: { en: { title: 'Looks like a genuine code message', body: 'Use the code only on the page where you started the action yourself, and never read it to anyone who calls.' }, ar: { title: 'تبدو رسالة رمز تحقق حقيقية', body: 'استخدم الرمز فقط في الصفحة التي بدأت منها العملية بنفسك، ولا تقرأه لأي شخص يتصل بك.' } },
};

/** Arabic normalisation so spelling variants match (أ إ آ ا، ى ي، ة ه، no harakat or tatweel). */
export function normAr(s: string): string {
  return s
    .replace(/[ً-ْٰـ]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي');
}

interface TextRule { id: string; weight: 1 | 2 | 3; en: RegExp[]; ar: string[] }

const TEXT_RULES: TextRule[] = [
  { id: 'urgency', weight: 2, en: [/\burgent(ly)?\b/, /\bimmediately\b/, /\b(within|in) (1|2|12|24|48|72) ?(hours?|hrs?|h)\b/, /\b(1|2|12|24|48|72) hours only\b/, /\b(final|last) (notice|warning|reminder|chance)\b/, /\bact now\b/, /\bexpires? (today|soon|tonight)\b/, /\b(only )?until (tonight|today)\b/, /\bwill be (suspended|blocked|closed|deactivated|cancell?ed|terminated|frozen)\b/, /\b(has|have) been (temporarily )?(suspended|blocked|locked|frozen|deactivated)\b/], ar: ['فورا', 'عاجل', 'خلال 24 ساعه', 'خلال ساعه', 'خلال ساعتين', 'خلال 48 ساعه', 'خلال 12 ساعه', 'خلال 72 ساعه', 'خلال 6 ساعات', 'خلال 3 ساعات', 'بعد 24 ساعه', 'لمده 24 ساعه', 'تنتهي الليله', 'ينتهي الليله', 'تنتهي اليوم', 'لين الليله', 'حتى الليله', 'اخر فرصه', 'اخر تنبيه', 'اخر انذار', 'سيتم ايقاف', 'سيتم تعليق', 'سيتم اغلاق', 'سيتم حظر', 'سيتم تجميد', 'تم ايقاف بطاقتك', 'تم ايقاف حسابك', 'تم تعليق حسابك', 'تم حظر حسابك', 'تم تجميد حسابك', 'قبل انتهاء'] },
  { id: 'threat', weight: 2, en: [/legal action/, /\barrest(ed)?\b/, /\bcourt\b/, /travel ban/, /\bpenalt(y|ies)\b/, /\bwarrant\b/, /\blawsuit\b/], ar: ['اجراء قانوني', 'اجراءات قانونيه', 'منع سفر', 'منع من السفر', 'القبض', 'المحكمه', 'قضيه ضدك', 'بلاغ ضدك'] },
  { id: 'payment', weight: 2, en: [/\b(pay|payment|fee|fees|charge|deposit|customs duty|redelivery|outstanding balance|overdue|top up)\b/, /\b(send|transfer|wire) (me |us )?(a |an )?([a-z]+ )?(£|\$|€)\d[\d,.]*/, /\b(send|transfer|wire) (me |us )?\d[\d,.]* ?(kd|kwd|sar|aed|qar|bhd|omr|usd|dollars|pounds|dinars?)\b/], ar: ['ادفع', 'الدفع', 'سداد', 'رسوم', 'جمارك', 'مستحقات', 'غرامه', 'فاتوره متاخره', 'عربون', 'اشحن رصيدك'] },
  { id: 'secrets', weight: 3, en: [/\b(otp|one[ -]time (pass)?code|verification code|security code|access code|pin|cvv|cvc|password|passcode|card number|expiry date)\b/, /\b(\d|four|six)[ -]digit code\b/, /\bread (it|the code|me the code) (out|back|to me)\b/], ar: ['رمز التحقق', 'ادخله هنا', 'ادخل الرمز هنا', 'اكتب الرمز هنا', 'الرمز السري', 'الرقم السري', 'كلمه المرور', 'كلمه مرورك', 'كلمه السر', 'رقم البطاقه', 'تاريخ انتهاء البطاقه', 'الرمز اللي وصلك', 'الكود اللي وصلك', 'قول لي الرمز', 'اقرا لي الرمز', 'عطني الرمز', 'رقم الدخول', 'رمز من ست ارقام', 'رمز من 6 ارقام', 'كود من ست ارقام', 'كود من 6 ارقام'] },
  { id: 'prize', weight: 2, en: [/\bcongratulations\b/, /\byou('ve| have)? won\b/, /\bwinner\b/, /\bprize\b/, /\bfree gift\b/, /\bclaim (your|now)\b/], ar: ['مبروك', 'فزت', 'ربحت', 'جائزه', 'هديه مجانيه', 'الفائز', 'استلم جائزتك'] },
  { id: 'tooGood', weight: 2, en: [/guaranteed (return|profit|income)s?/, /\b(daily|weekly) (profit|return|income)s?\b/, /\brisk[ -]free\b/, /\bdouble your\b/, /\bpassive income\b/, /\bearn (up to )?(\$|£|€)?\d[\d,]*( to (\$|£|€)?\d[\d,]*)? ?(usd|kd|kwd|dollars|sar|aed|qar)? (a|per) (day|hour|week)\b/, /\blik(e|ing) videos\b/], ar: ['ارباح مضمونه', 'ربح مضمون', 'دخل يومي', 'ربح يومي', 'بدون مخاطره', 'بدون اي مخاطره', 'ضاعف', 'دخل اضافي من البيت', 'دولار يوميا', 'دينار يوميا', 'الاعجاب بمقاطع', 'اعجاب على فيديوهات'] },
  { id: 'offPlatform', weight: 2, en: [/\bmove (this|the) (chat|conversation)\b/, /\bmessage me on\b/, /\bcontinue on (another|the other) app\b/, /\bkeep (this|it) (between us|secret|private)\b/, /\bdon'?t tell (anyone|your)\b/, /\bdon'?t mention (this|it)\b/], ar: ['خلنا نكمل', 'كلمني على', 'لا تقول لاحد', 'لا تقول لموظفين', 'لا تقول للموظفين', 'لا تخبر', 'بيني وبينك', 'بيني وبينج', 'خليها سر', 'لا تعلم احد'] },
  { id: 'oddPayment', weight: 3, en: [/gift ?cards?/, /\bcrypto(currency)?\b/, /\bbitcoin\b/, /\busdt\b/, /\bwire (it|the money) to\b/, /\b(transfer|send|wire|return) (it |the money )?(straight |directly )?(back )?to (my|this|his|her) (personal |own )?([a-z]+'s )?account\b/, /\b(safe|temporary) account\b/], ar: ['بطاقات هدايا', 'بطاقه هدايا', 'عملات رقميه', 'بيتكوين', 'كريبتو', 'حول المبلغ', 'تحويل الى حساب', 'حسابي الشخصي', 'حساب اخوي', 'حساب امان', 'حساب امن', 'حساب موقت'] },
  { id: 'remote', weight: 3, en: [/\b(anydesk|teamviewer|remote (access|control|desktop|support) (app|tool|software))\b/, /\.apk\b/, /\b(install|download) (this|the|our) app\b/], ar: ['التحكم عن بعد', 'الدعم عن بعد', 'ثبت التطبيق', 'حمل التطبيق', 'نزل التطبيق', 'تطبيق الدعم الفني'] },
  { id: 'newNumber', weight: 3, en: [/\bmy new number\b/, /\bhi (mum|mom|dad)\b/, /\bmy (old )?phone (broke|is broken|died|fell)\b/, /\bthis is my new\b/], ar: ['رقمي الجديد', 'هذا رقمي', 'تلفوني خرب', 'جوالي خرب', 'جوالي طاح', 'تلفوني طاح', 'غيرت رقمي'] },
  { id: 'generic', weight: 1, en: [/\bdear (customer|user|client|member|account holder)\b/, /\bvalued customer\b/], ar: ['عزيزي العميل', 'عميلنا العزيز', 'عزيزي المستخدم', 'عميلنا الكريم'] },
  { id: 'verifyAccount', weight: 2, en: [/\b(verify|confirm|update|validate|reactivate) (your )?(account|identity|details|information|card)\b/, /\bunusual (activity|sign[ -]?in|payment)\b/, /\bsign in (below|here|now) to\b/], ar: ['تحديث بياناتك', 'حدث بياناتك', 'تاكيد بياناتك', 'اكد بياناتك', 'توثيق حسابك', 'نشاط غير معتاد', 'غير معتاده', 'تفعيل حسابك', 'سجل الدخول من الزر', 'سجل الدخول من الرابط'] },
];

const SHORTENERS = new Set(['bit.ly', 'bitly.com', 'tinyurl.com', 't.co', 'goo.gl', 'ow.ly', 'is.gd', 'v.gd', 'buff.ly', 'cutt.ly', 'rebrand.ly', 'shorturl.at', 'tiny.cc', 'rb.gy', 's.id', 't.ly', 'shorte.st', 'adf.ly', 'bl.ink', 'lnk.to', 'surl.li', 'qrco.de', 'tinu.be', 'u.to', 'clck.ru']);
const RISKY_TLDS = new Set(['top', 'xyz', 'icu', 'click', 'link', 'live', 'shop', 'online', 'site', 'website', 'info', 'buzz', 'cyou', 'rest', 'monster', 'cfd', 'sbs', 'quest', 'bond', 'tk', 'ml', 'ga', 'cf', 'gq', 'zip', 'mov', 'support', 'help', 'vip', 'win', 'loan', 'work', 'cam', 'lol', 'fun', 'today', 'services', 'center']);
const LURE = ['secure', 'verify', 'verification', 'login', 'signin', 'update', 'account', 'confirm', 'billing', 'pay', 'payment', 'fine', 'fines', 'refund', 'parcel', 'delivery', 'track', 'redelivery', 'support', 'wallet', 'unlock', 'reward', 'claim', 'bonus', 'official'];
const GOV_TAIL = /(^|\.)gov(\.[a-z]{2})?$/;

const URL_RE = /\b((?:https?:\/\/)?(?:[a-z0-9¡-￿](?:[a-z0-9¡-￿-]{0,61}[a-z0-9¡-￿])?\.)+(?:[a-z¡-￿]{2,63}|xn--[a-z0-9-]{2,59}))(?::\d{2,5})?(?:[/?#][^\s"'<>]*)?/gi;
const IP_URL_RE = /\b(?:https?:\/\/)?\d{1,3}(?:\.\d{1,3}){3}(?::\d{2,5})?(?:[/?#][^\s"'<>]*)?/g;
const EMAIL_RE = /[a-z0-9._%+-]+@([a-z0-9.-]+\.[a-z]{2,})/gi;

function hostOf(raw: string): string {
  const withScheme = /^https?:\/\//i.test(raw) ? raw : `http://${raw}`;
  try { return new URL(withScheme).hostname.toLowerCase(); } catch { return raw.replace(/^https?:\/\//i, '').split(/[/?#:]/)[0].toLowerCase(); }
}

export function extractLinks(text: string): string[] {
  const emails = new Set<string>();
  for (const m of text.matchAll(EMAIL_RE)) emails.add(m[0].toLowerCase());
  const found: string[] = [];
  const cleaned = text.replace(EMAIL_RE, ' ');
  for (const m of cleaned.matchAll(IP_URL_RE)) found.push(m[0]);
  const scan = cleaned.replace(IP_URL_RE, ' ');
  for (const m of scan.matchAll(URL_RE)) {
    const v = m[0].replace(/[.,;:!?)\]]+$/, '');
    const at = m.index ?? 0;
    // ignore numbers like 0.350 and abbreviations such as د.ك
    if (/^\d+(\.\d+)+$/.test(v)) continue;
    // a file name (invoice.pdf), a handle (@shop.official) or part of a longer word is not a link
    if (/[A-Za-z0-9_@.-]/.test(scan[at - 1] || '') || /[A-Za-z0-9_]/.test(scan[at + m[0].length] || '')) continue;
    if (!v.includes('/') && /\.(pdf|html?|docx?|xlsx?|pptx?|zip|rar|exe|apk|jpe?g|png|gif|txt|csv|js|svg|mp3|mp4|wav)$/i.test(v)) continue;
    found.push(v);
  }
  return [...new Set(found)];
}

export function analyzeLink(raw: string): LinkReport {
  const host = hostOf(raw);
  const findings: string[] = [];
  const labels = host.split('.');
  const tld = labels[labels.length - 1] || '';
  const isIp = /^\d{1,3}(\.\d{1,3}){3}$/.test(host);
  if (SHORTENERS.has(host)) findings.push('shortener');
  if (isIp) findings.push('ipHost');
  if (host.includes('xn--') || /[^\x00-\x7f]/.test(host)) findings.push('punycode');
  if (!isIp) {
    if (GOV_TAIL.test(host)) findings.push('govOfficial');
    else if (/(^|[.-])gov([.-]|$)|gov(kw|sa|ae|qa|bh|om)/.test(host)) findings.push('govMisuse');
    const hyphens = (host.match(/-/g) || []).length;
    if (hyphens >= 2 || labels.length >= 5) findings.push('manyHyphens');
    if (RISKY_TLDS.has(tld)) findings.push('riskyTld');
    const lures = LURE.filter((w) => host.includes(w)).length;
    if (lures >= 1 && !GOV_TAIL.test(host) && (hyphens >= 1 || lures >= 2)) findings.push('lureWords');
  }
  if (/^http:\/\//i.test(raw)) findings.push('noTls');
  return { raw, host, findings };
}

/** Where a finding's evidence sits in the original text; Arabic matching ignores spelling variants. */
export function locateEvidence(text: string, evidence: string | undefined): [number, number] | null {
  if (!evidence) return null;
  const direct = text.toLowerCase().indexOf(evidence.toLowerCase());
  if (direct >= 0) return [direct, direct + evidence.length];
  const target = normAr(evidence).toLowerCase();
  if (!target) return null;
  let norm = '';
  const map: number[] = [];
  for (let i = 0; i < text.length; i++) {
    for (const ch of normAr(text[i]).toLowerCase()) { norm += ch; map.push(i); }
  }
  const at = norm.indexOf(target);
  return at < 0 ? null : [map[at], map[at + target.length - 1] + 1];
}

const LINK_WEIGHT: Record<string, 0 | 1 | 2 | 3> = { shortener: 3, ipHost: 3, punycode: 3, govMisuse: 3, manyHyphens: 2, riskyTld: 1, noTls: 1, lureWords: 1, govOfficial: 0 };
export const GCC_CODES = ['965', '966', '971', '973', '974', '968'];

export interface CheckOptions { localCodes: string[] | null }

/** localCodes: country calling codes treated as local (the Gulf by default); null skips the check. */
export function check(text: string, opts: CheckOptions = { localCodes: GCC_CODES }): CheckResult {
  const input = text.slice(0, 6000);
  const links = extractLinks(input).map(analyzeLink);
  // Words inside an address (pay, fee, secure) are judged by the link rules, so the text rules read the message without them.
  let prose = input.replace(EMAIL_RE, (m) => ' '.repeat(m.length));
  for (const l of links) prose = prose.split(l.raw).join(' '.repeat(l.raw.length));
  const lower = prose.toLowerCase();
  const ar = normAr(prose);
  const findings: Finding[] = [];
  const add = (id: string, weight: 0 | 1 | 2 | 3, evidence?: string, positive = false) => {
    if (findings.some((f) => f.id === id)) return;
    findings.push({ id, weight, evidence, positive, en: T[id].en, ar: T[id].ar });
  };

  const looksLikeCode = /\b\d{4,8}\b/.test(input) && /(do not share|don't share|never share|لا تشارك|لا تعط)/i.test(input) && links.length === 0;

  for (const rule of TEXT_RULES) {
    if (looksLikeCode && (rule.id === 'secrets' || rule.id === 'payment')) continue;
    const hits: Array<{ at: number; text: string }> = [];
    for (const re of rule.en) { const m = lower.match(re); if (m) hits.push({ at: m.index ?? 0, text: m[0] }); }
    for (const w of rule.ar.map(normAr)) { const at = ar.indexOf(w); if (at >= 0) hits.push({ at, text: w }); }
    const hit = hits.sort((a, b) => a.at - b.at)[0];
    if (hit) add(rule.id, rule.weight, hit.text);
  }

  for (const l of links) for (const id of l.findings) add(id, LINK_WEIGHT[id], l.host, id === 'govOfficial');

  if (opts.localCodes) {
    for (const m of input.matchAll(/\+\s?(\d[\d\s•]{6,})/g)) {
      const digits = m[1].replace(/\D/g, '');
      if (!opts.localCodes.some((g) => digits.startsWith(g))) { add('foreignNumber', 1, m[0].trim()); break; }
    }
  }

  if (looksLikeCode) add('codeMessage', 0, undefined, true);

  const score = findings.reduce((s, f) => s + (f.positive ? 0 : f.weight), 0);
  const hasStrong = findings.some((f) => !f.positive && f.weight === 3);
  const level: CheckResult['level'] = score >= 5 ? 'high' : score >= 2 || hasStrong ? 'medium' : 'low';
  findings.sort((a, b) => Number(!!a.positive) - Number(!!b.positive) || b.weight - a.weight);
  return { findings, links, level, score };
}
