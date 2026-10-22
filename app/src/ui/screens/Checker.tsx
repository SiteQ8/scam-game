import { useRef, useState } from 'preact/hooks';
import { back } from '../../state/nav';
import { lang, t } from '../../i18n/i18n';
import { settings, updateProgress, progress } from '../../state/store';
import { check, locateEvidence, GCC_CODES, type CheckResult } from '../../engine/checker';
import { newlyUnlocked } from '../../engine/achievements';
import { CARDS } from '../../content/cards';
import { Icon } from '../components/Icon';
import { TopBar, toast } from '../components/common';
import { sfx } from '../../platform/audio';
import { impact } from '../../platform/haptics';

export function Checker() {
  const L = lang.value;
  const [text, setText] = useState('');
  const [res, setRes] = useState<CheckResult | null>(null);
  const [checked, setChecked] = useState('');
  const area = useRef<HTMLTextAreaElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  async function paste() {
    try {
      const v = await navigator.clipboard.readText();
      if (v) setText(v);
    } catch { area.current?.focus(); }
  }
  function run() {
    if (!text.trim()) { area.current?.focus(); return; }
    const r = check(text, { localCodes: settings.value.region === 'global' ? null : GCC_CODES });
    setRes(r);
    setChecked(text);
    impact('medium');
    void sfx(r.level === 'high' ? 'wrong' : 'reveal');
    updateProgress((p) => { p.checkerUses += 1; });
    const fresh = newlyUnlocked(progress.value, CARDS);
    if (fresh.length) { updateProgress((p) => { fresh.forEach((a) => { p.achievements[a.id] = Date.now(); }); }); toast(`${t('achievementUnlocked')}: ${fresh[0][L].title}`, 'award'); }
    requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: settings.value.reduceMotion ? 'auto' : 'smooth', block: 'start' }));
  }
  const evidence = (ev?: string) => {
    if (!ev) return null;
    const at = locateEvidence(checked, ev);
    return <span class="ev" dir="auto">{at ? checked.slice(at[0], at[1]) : ev}</span>;
  };
  const negatives = res ? res.findings.filter((f) => !f.positive) : [];
  const positives = res ? res.findings.filter((f) => f.positive) : [];
  return (
    <div class="screen">
      <TopBar title={t('checkerTitle')} onBack={back} />
      <div class="scroll"><div class="wrap">
        <p style={{ color: 'var(--text-2)', margin: '2px 2px 14px' }}>{t('checkerIntro')}</p>
        <div class="checker-input">
          <textarea ref={area} value={text} placeholder={t('pastePlaceholder')} onInput={(e) => setText((e.target as HTMLTextAreaElement).value)} autoComplete="off" autoCorrect="off" spellcheck={false} dir="auto" aria-label={t('pastePlaceholder')} />
        </div>
        <div class="btn-row" style={{ marginTop: '10px' }}>
          <button class="btn btn-secondary" onClick={paste}><Icon name="clipboard-paste" />{t('paste')}</button>
          <button class="btn btn-secondary" onClick={() => { setText(''); setRes(null); }} disabled={!text}><Icon name="x" />{t('clear')}</button>
        </div>
        <div style={{ marginTop: '10px' }}><button class="btn btn-primary" onClick={run} disabled={!text.trim()}><Icon name="scan-search" />{t('analyze')}</button></div>
        <div ref={resultRef}>
          {res && (
            <>
              <div class={`level ${res.level}`} role="status">
                <Icon name={res.level === 'high' ? 'shield-alert' : res.level === 'medium' ? 'triangle-alert' : 'info'} />
                <b>{res.level === 'high' ? t('levelHigh') : res.level === 'medium' ? t('levelMedium') : t('levelLow')}</b>
              </div>
              {negatives.length === 0 && <p style={{ color: 'var(--text-2)', marginBottom: '12px' }}>{t('noFlags')}</p>}
              {negatives.length > 0 && <h2 class="section-title" style={{ marginTop: '6px' }}>{t('flagsFound')}</h2>}
              {negatives.map((f) => (
                <div class="finding"><Icon name="flag" /><div><b>{f[L].title}</b><p>{f[L].body}</p>{evidence(f.evidence)}</div></div>
              ))}
              {positives.map((f) => (
                <div class="finding good" style={{ marginTop: '10px' }}><Icon name="shield-check" /><div><b>{f[L].title}</b><p>{f[L].body}</p>{evidence(f.evidence)}</div></div>
              ))}
              {res.links.length > 0 && (
                <div class="group">
                  <h2>{t('linksFound')}</h2>
                  <div class="panel">{res.links.map((l) => <div class="row"><Icon name="link" class="lead" /><span class="lbl" style={{ direction: 'ltr', textAlign: 'start', overflowWrap: 'anywhere' }}>{l.host}</span></div>)}</div>
                </div>
              )}
              <div class="group">
                <h2>{t('whatToDo')}</h2>
                <div class="panel"><ol class="todo"><li>{t('todo1')}</li><li>{t('todo2')}</li><li>{t('todo3')}</li><li>{t('todo4')}</li></ol></div>
              </div>
              <p class="note"><Icon name="info" /><span>{t('checkerDisclaimer')}</span></p>
            </>
          )}
        </div>
      </div></div>
    </div>
  );
}
