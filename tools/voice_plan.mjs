// Lists every call and voice note that needs audio, with the text to speak and the voice to use.
// usage: node tools/voice_plan.mjs > .work/audio/plan.json
import { readFileSync, readdirSync } from 'node:fs';
const cards = readdirSync('content/cards').filter((f) => f.endsWith('.json')).flatMap((f) => JSON.parse(readFileSync(`content/cards/${f}`, 'utf8')));
const V = {
  ar: {
    male: { official: ['KJe6YIQ4MHI94EGaDZC7', 'nYestvBSdGD1X7eF34zc', 'DANw8bnAVbjDEHwZIoYa'], calm: ['KJe6YIQ4MHI94EGaDZC7', 'DANw8bnAVbjDEHwZIoYa'], friendly: ['oIf66LFdDEGImCUZmy8t', 'nYestvBSdGD1X7eF34zc'], urgent: ['oIf66LFdDEGImCUZmy8t', 'DANw8bnAVbjDEHwZIoYa'] },
    female: { official: ['3AH0h1SXwwhE8vUUWuQW', 'o0oG1TnHDWDdKbAeBgCO'], calm: ['3AH0h1SXwwhE8vUUWuQW'], friendly: ['o0oG1TnHDWDdKbAeBgCO', '3AH0h1SXwwhE8vUUWuQW'], urgent: ['o0oG1TnHDWDdKbAeBgCO'] },
    young: { male: 'oIf66LFdDEGImCUZmy8t', female: 'o0oG1TnHDWDdKbAeBgCO' },
  },
  en: {
    male: { official: ['cjVigY5qzO86Huf0OWal', 'IudHjFkI7DrAB5AYmMAs', 'QZA1myOcnbLYY9uuhixV'], calm: ['cjVigY5qzO86Huf0OWal', 'QZA1myOcnbLYY9uuhixV'], friendly: ['iP95p4xoKVk53GoZ742B', 'ArXfhUVzPRAarfbwzkDv'], urgent: ['IKne3meq5aSn9XLyUdCD', 'iP95p4xoKVk53GoZ742B'] },
    female: { official: ['6fLd3vCll0LutxnciLI8', '2oKmj8Mq72d27JWiLtSX'], calm: ['2oKmj8Mq72d27JWiLtSX'], friendly: ['6fLd3vCll0LutxnciLI8', 'cgSgspJ2msm6clMCkdW9'], urgent: ['cgSgspJ2msm6clMCkdW9'] },
    young: { male: 'bIHbv24MWmeRgasZH58o', female: 'cgSgspJ2msm6clMCkdW9' },
  },
};
const used = {};
function pick(lang, gender, age, tone) {
  if (age === 'young') return V[lang].young[gender];
  const list = V[lang][gender][tone] || V[lang][gender].calm;
  const key = `${lang}-${gender}-${tone}`;
  used[key] = (used[key] || 0) + 1;
  return list[(used[key] - 1) % list.length];
}
const TAG = { calm: '[calmly]', official: '[professional tone]', friendly: '[warmly]', urgent: '[urgently]' };
// The workspace's young Kuwaiti voice was not usable, so these calls use other Gulf voices.
const OVERRIDE = {
  'call-card-pin-unblock.ar': 'ru5xIfU6L5uUJi5V0843',
  'call-tech-support-remote.ar': 'lXwVtAOOlP0Qf7aXOebM',
  'call-courier-delivery-code.ar': 'ht2HShpHzhG4gY6wI5YF',
  'call-car-prize-fee.ar': 'KfYUTAF49N2CPU3iKuMi',
  'call-family-voice-clone.ar': 'lXwVtAOOlP0Qf7aXOebM',
  'call-driver-asks-directions.ar': 'ht2HShpHzhG4gY6wI5YF',
  'call-telecom-plan-change-confirm.ar': 'DANw8bnAVbjDEHwZIoYa',
};
// Voice notes: one voice per speaker, the same person keeps the same voice across cards.
const NOTE_VOICE = {
  'chat-voice-brother-accident': { ar: ['lXwVtAOOlP0Qf7aXOebM', '[nervously]'], en: ['bIHbv24MWmeRgasZH58o', '[nervously]'] },
  'chat-voice-son-trip-abroad': { ar: ['ru5xIfU6L5uUJi5V0843', '[anxiously]'], en: ['ArXfhUVzPRAarfbwzkDv', '[anxiously]'] },
  'chat-voice-mum-groceries': { ar: ['3AH0h1SXwwhE8vUUWuQW', '[warmly]'], en: ['aPS7uh3HYtOcVW1TGy2d', '[warmly]'] },
  'chat-voice-trading-mentor': { ar: ['RL04FaPrUG6vS8aWd9NZ', '[smoothly]'], en: ['QZA1myOcnbLYY9uuhixV', '[smoothly]'] },
  'chat-voice-delivery-driver': { ar: ['ht2HShpHzhG4gY6wI5YF', '[casually]'], en: ['iP95p4xoKVk53GoZ742B', '[casually]'] },
};
const plan = [];
for (const c of cards) {
  for (const lang of ['ar', 'en']) {
    const b = c[lang].card;
    if (c.channel === 'call') {
      const v = b.voice;
      const lines = b.lines.map((l, i) => ({ i, l })).filter((x) => x.l.who === 'caller');
      const text = `${TAG[v.tone] || ''} ` + lines.map((x) => x.l.text).join(' [long pause] ');
      plan.push({ kind: 'call', id: c.id, lang, file: `audio/calls/${c.id}.${lang}.mp3`, voice: OVERRIDE[`${c.id}.${lang}`] || pick(lang, v.gender, v.age, v.tone), lines: lines.map((x) => x.i), text: text.trim(), phone: true });
    }
    if (c.channel === 'chat') {
      b.messages.forEach((m, i) => {
        if (!m.voice) return;
        const nv = NOTE_VOICE[c.id]?.[lang];
        plan.push({ kind: 'voice', id: c.id, lang, idx: i, file: `audio/voice/${c.id}.${lang}.${i}.mp3`, voice: nv ? nv[0] : null, text: nv ? `${nv[1]} ${m.text}` : m.text, contact: b.contact, phone: false });
      });
    }
  }
}
console.log(JSON.stringify(plan, null, 1));
