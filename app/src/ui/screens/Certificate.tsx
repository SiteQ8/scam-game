import { useEffect, useRef, useState } from 'preact/hooks';
import { progress, settings, updateProgress } from '../../state/store';
import { back, push } from '../../state/nav';
import { lang, t, rankFor } from '../../i18n/i18n';
import { CHAPTERS, chapterDeck, byRegion } from '../../engine/deck';
import { isCore } from '../../engine/packs';
import { newlyUnlocked } from '../../engine/achievements';
import { CARDS } from '../../content/cards';
import { drawCertificate, CERT_W, CERT_H } from '../certificate/draw';
import { Icon } from '../components/Icon';
import { Strand, TopBar, toast } from '../components/common';
import { shareImage } from '../../platform/share';
import { sfx } from '../../platform/audio';
import { notify } from '../../platform/haptics';
import { siteUrl } from './Play';

/** A serial that looks official and means nothing: eight letters and digits drawn on the device. */
function makeSerial(): string {
  const abc = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  const s = Array.from(bytes, (b) => abc[b % abc.length]).join('');
  return `SD-${s.slice(0, 4)}-${s.slice(4)}`;
}

export function Certificate() {
  const L = lang.value;
  const p = progress.value;
  const pool = byRegion(CARDS, settings.value.region).filter(isCore);
  const passed = CHAPTERS.filter((c) => (p.journey[c.id]?.stars || 0) > 0).length;
  const eligible = passed === CHAPTERS.length;
  const [name, setName] = useState(p.certificate?.name || '');
  const [preview, setPreview] = useState('');
  const [busy, setBusy] = useState(false);
  const canvas = useRef<HTMLCanvasElement | null>(null);

  // The certificate is issued the first time the screen opens after the last chapter, with its date and number.
  useEffect(() => {
    if (!eligible || progress.value.certificate) return;
    updateProgress((q) => { q.certificate = { name: '', issued: Date.now(), serial: makeSerial() }; });
    const fresh = newlyUnlocked(progress.value, CARDS);
    if (fresh.length) {
      updateProgress((q) => { fresh.forEach((a) => { q.achievements[a.id] = Date.now(); }); });
      toast(`${t('achievementUnlocked')}: ${fresh[0][L].title}`, 'medal');
      void sfx('levelup');
      notify('success');
    }
  }, []);

  useEffect(() => {
    const cert = progress.value.certificate;
    if (!eligible || !cert) return;
    let cancelled = false;
    const tm = setTimeout(async () => {
      const stars = CHAPTERS.reduce((n, c) => n + (p.journey[c.id]?.stars || 0), 0);
      const sizes = CHAPTERS.reduce((n, c) => n + Math.max(1, chapterDeck(c.id, pool).length), 0);
      const best = CHAPTERS.reduce((n, c) => n + (p.journey[c.id]?.best || 0), 0);
      const game = L === 'ar' ? __BRAND__.nameAr || __BRAND__.nameEn : __BRAND__.nameEn;
      const date = new Intl.DateTimeFormat(L === 'ar' ? 'ar-u-nu-latn' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(cert.issued));
      const c = await drawCertificate({
        lang: L,
        game,
        name: name.trim(),
        title: t('certTitle'),
        awardedTo: t('certAwardedTo'),
        body: name.trim() ? t('certBody') : t('certBodyNoName'),
        stats: [
          { value: `${stars}/${CHAPTERS.length * 3}`, label: t('certStars') },
          { value: `${Math.round((best / sizes) * 100)}%`, label: t('accuracy') },
          { value: rankFor(p.xp).name, label: t('rank') },
        ],
        date,
        serial: t('certSerial', { n: cert.serial }),
        site: siteUrl().replace(/^https:\/\//, ''),
      });
      if (cancelled) return;
      canvas.current = c;
      setPreview(c.toDataURL('image/jpeg', 0.86));
    }, 220);
    return () => { cancelled = true; clearTimeout(tm); };
  }, [name, L, p.certificate?.serial]);

  async function share() {
    if (!canvas.current || busy) return;
    setBusy(true);
    void sfx('tap');
    updateProgress((q) => { if (q.certificate) q.certificate.name = name.trim(); });
    const game = L === 'ar' ? __BRAND__.nameAr || __BRAND__.nameEn : __BRAND__.nameEn;
    const r = await shareImage(canvas.current, 'certificate.png', `${t('certShareText', { game })}\n${siteUrl()}`);
    if (r === 'saved') toast(t('certSaved'), 'download');
    setBusy(false);
  }

  if (!eligible) {
    return (
      <div class="screen">
        <TopBar title={t('certificate')} onBack={back} />
        <div class="scroll"><div class="wrap cert-locked">
          <span class="seal"><Icon name="file-badge" /></span>
          <h2>{t('certificate')}</h2>
          <p>{t('certLocked')}</p>
          <Strand total={CHAPTERS.length} results={Array.from({ length: passed }, () => true)} current={passed} />
          <p class="num count">{t('certProgress', { x: passed, y: CHAPTERS.length })}</p>
          <button class="btn btn-primary" onClick={() => push({ name: 'journey' })}>{t('goJourney')}<Icon name="arrow-right" class="flip-rtl" /></button>
        </div></div>
      </div>
    );
  }

  return (
    <div class="screen">
      <TopBar title={t('certificate')} onBack={back} />
      <div class="scroll"><div class="wrap cert">
        <h2 class="cert-h">{t('certReady')}</h2>
        <p class="cert-sub">{t('certReadySub')}</p>
        <div class="cert-preview" style={{ aspectRatio: `${CERT_W} / ${CERT_H}` }}>
          {preview ? <img src={preview} alt={t('certTitle')} /> : <span class="loading" aria-hidden="true" />}
        </div>
        <label class="cert-field">
          <span>{t('certName')}</span>
          <input type="text" value={name} maxLength={36} autoComplete="name" enterKeyHint="done" onInput={(e) => setName((e.target as HTMLInputElement).value)} />
          <small>{t('certNameHint')}</small>
        </label>
        <button class="btn btn-primary" disabled={!preview || busy} onClick={share}><Icon name="share-2" />{t('certShare')}</button>
      </div></div>
    </div>
  );
}
