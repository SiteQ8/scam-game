import { useState } from 'preact/hooks';
import { back, push } from '../../state/nav';
import { t } from '../../i18n/i18n';
import { Icon } from '../components/Icon';
import { Segmented, TopBar } from '../components/common';

export function PartySetup() {
  const [names, setNames] = useState<string[]>(['', '']);
  const [each, setEach] = useState(5);
  const set = (i: number, v: string) => setNames(names.map((n, k) => (k === i ? v : n)));
  const start = () => {
    const players = names.map((n, i) => n.trim().slice(0, 18) || t('playerN', { n: i + 1 }));
    push({ name: 'play', mode: 'party', party: { players, cardsEach: each } });
  };
  return (
    <div class="screen">
      <TopBar title={t('party')} onBack={back} />
      <div class="scroll"><div class="wrap">
        <p class="lead-text">{t('partyRule')}</p>
        <div class="group" style={{ marginTop: 0 }}>
          <h2>{t('players')}</h2>
          <div class="players">
            {names.map((n, i) => (
              <div class="player-row">
                <input value={n} placeholder={t('playerN', { n: i + 1 })} maxLength={18} onInput={(e) => set(i, (e.target as HTMLInputElement).value)} enterKeyHint="next" autoComplete="off" aria-label={t('playerN', { n: i + 1 })} />
                {names.length > 2 && <button class="icon-btn" onClick={() => setNames(names.filter((_, k) => k !== i))} aria-label={t('remove')}><Icon name="x" /></button>}
              </div>
            ))}
            {names.length < 6 && <button class="btn btn-secondary" onClick={() => setNames([...names, ''])}><Icon name="user" />{t('addPlayer')}</button>}
          </div>
        </div>
        <div class="group">
          <h2>{t('cardsEach')}</h2>
          <Segmented value={each} label={t('cardsEach')} options={[3, 5, 7].map((v) => ({ value: v, label: String(v) }))} onChange={setEach} />
        </div>
        <div style={{ marginTop: '26px' }}><button class="btn btn-primary" onClick={start}>{t('start')}<Icon name="arrow-right" class="flip-rtl" /></button></div>
      </div></div>
    </div>
  );
}
