import { describe, it, expect } from 'vitest';
import { check, extractLinks, analyzeLink, GCC_CODES } from '../app/src/engine/checker';
import { cardText } from '../app/src/engine/card-text';
import { CARDS } from '../app/src/content/cards';

const ids = (t: string, opts?: Parameters<typeof check>[1]) => check(t, opts).findings.map((f) => f.id);

describe('message checker', () => {
  it('flags a classic parcel fee scam as high', () => {
    const r = check('POST: Your parcel is held. Pay the 0.350 KWD redelivery fee within 24 hours at parcel-fee-kw.com/pay');
    expect(r.level).toBe('high');
    expect(ids('Pay the fee within 24 hours at parcel-fee-kw.com/pay')).toEqual(expect.arrayContaining(['urgency', 'payment']));
  });
  it('understands Arabic wording and spelling variants', () => {
    const r = check('عزيزي العميل سيتم ايقاف حسابك خلال 24 ساعة، يرجى تحديث بياناتك وإدخال رمز التحقق عبر الرابط secure-bank-verify.info');
    expect(r.findings.map((f) => f.id)).toEqual(expect.arrayContaining(['urgency', 'secrets', 'verifyAccount', 'generic']));
    expect(r.level).toBe('high');
  });
  it('treats a genuine code message as a code message, not a scam', () => {
    const r = check('رمز التحقق لعملية الشراء هو 482915، لا تشارك هذا الرمز مع أي شخص');
    expect(r.findings.map((f) => f.id)).toContain('codeMessage');
    expect(r.findings.map((f) => f.id)).not.toContain('secrets');
    expect(r.level).toBe('low');
  });
  it('recognises real government domains and misused ones', () => {
    expect(analyzeLink('https://traffic.gov.kw/fines').findings).toContain('govOfficial');
    expect(analyzeLink('kw-gov-fines.com/pay').findings).toContain('govMisuse');
    expect(analyzeLink('kw.gov-pay.net').findings).toContain('govMisuse');
  });
  it('spots shortened links, raw IP links, look-alike letters and plain http', () => {
    expect(analyzeLink('bit.ly/3xYz').findings).toContain('shortener');
    expect(analyzeLink('http://185.22.10.4/login').findings).toEqual(expect.arrayContaining(['ipHost', 'noTls']));
    expect(analyzeLink('xn--bnk-cpa.com').findings).toContain('punycode');
  });
  it('does not treat amounts or currency abbreviations as links', () => {
    expect(extractLinks('ادفع 0.350 د.ك الآن')).toEqual([]);
    expect(extractLinks('Total 12.500 KWD')).toEqual([]);
  });
  it('flags a foreign number only when Gulf codes are local', () => {
    expect(ids('Call +44 7700 900417 now')).toContain('foreignNumber');
    expect(ids('Call +965 6••• ••42 now')).not.toContain('foreignNumber');
    expect(ids('Call +44 7700 900417 now', { localCodes: null })).not.toContain('foreignNumber');
  });
  it('never calls an empty or harmless text high risk', () => {
    expect(check('').level).toBe('low');
    expect(check('See you at dinner tonight at 8').level).toBe('low');
  });
});

describe('words inside an address belong to the address', () => {
  it('takes text cues from the message, not from the link', () => {
    const r = check('البريد: شحنتك متوقفة، ادفع رسوم إعادة التوصيل عبر الرابط parcel-fee-kw.com/pay');
    expect(r.findings.find((f) => f.id === 'payment')?.evidence).toBe('ادفع');
    expect(ids('Your order is ready, track it at secure-pay-track.com')).not.toContain('payment');
    expect(ids('Your order is ready, track it at secure-pay-track.com')).toEqual(expect.arrayContaining(['manyHyphens', 'lureWords']));
  });
});

describe('links are not invented from file names or handles', () => {
  it('ignores attachments and social handles', () => {
    expect(check('Please open Bank_Details_Letter.pdf before Friday').links).toHaveLength(0);
    expect(check('Follow @tech.giveaways.official1 for the draw').links).toHaveLength(0);
    expect(check('Pay now at kw-card-update.top/verify').links.map((l) => l.host)).toEqual(['kw-card-update.top']);
    expect(check('email me at someone@example.com today').links).toHaveLength(0);
  });
});

describe('the checker on the game\'s own cards', () => {
  // Every scam in the game shows at least some warning signs, and no genuine message is called a strong scam.
  for (const lang of ['en', 'ar'] as const) {
    it(`rates every scam card as a warning and no genuine card as a strong scam (${lang})`, () => {
      const missed = CARDS.filter((c) => c.verdict === 'scam' && check(cardText(c, lang), { localCodes: GCC_CODES }).level === 'low').map((c) => c.id);
      const alarmed = CARDS.filter((c) => c.verdict === 'legit' && check(cardText(c, lang), { localCodes: GCC_CODES }).level === 'high').map((c) => c.id);
      expect(missed).toEqual([]);
      expect(alarmed).toEqual([]);
    });
  }
});
