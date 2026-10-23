import { useRef, useState } from 'preact/hooks';
import type { Card, Lang, LangBlock, Verdict } from '../../content/types';
import { Icon } from './Icon';
import { S } from '../../i18n/strings';
import { fmtNum } from '../../i18n/i18n';
import { bidi, markNumbers } from '../cards/marker';

interface Props {
  card: Card;
  lang: Lang;
  said: Verdict;
  points: number;
  open: boolean;
  active: number | null;
  onSignal: (i: number) => void;
  peek: boolean;
  setPeek: (v: boolean) => void;
}

const KIND_LABEL = { red: 'redFlags', green: 'greenSignals', trap: 'traps' } as const;
type Kind = keyof typeof KIND_LABEL;

/**
 * What to take away first, then the evidence grouped by kind. The numbers match the marks on the card,
 * and the group that decides the verdict comes first.
 */
export function SignalList({ card, lang, active, onSignal }: { card: Card; lang: Lang; active: number | null; onSignal: (i: number) => void }) {
  const block = card[lang] as LangBlock;
  const numbers = markNumbers(card, lang);
  const order: Kind[] = card.verdict === 'scam' ? ['red', 'trap', 'green'] : ['green', 'trap', 'red'];
  const groups = order
    .map((k) => ({ k, items: block.signals.map((s, i) => ({ s, i, n: numbers[i] })).filter((x) => x.s.kind === k).sort((a, b) => a.n - b.n) }))
    .filter((g) => g.items.length);
  return (
    <>
      <div class="lesson">
        <b><Icon name="shield-check" />{S.nextTime[lang]}</b>
        <p>{bidi(block.lesson)}</p>
      </div>
      {groups.map((g) => (
        <section class="sig-group" key={g.k}>
          <h4 class={`sig-h ${g.k}`}>{S[KIND_LABEL[g.k]][lang]}</h4>
          <ul class="signals">
            {g.items.map(({ s, i, n }) => (
              <li key={i}>
                <button class={`signal ${s.kind} ${active === i ? 'active' : ''}`} onClick={() => onSignal(i)}>
                  <span class="n">{n}</span>
                  <p>{bidi(s.why)}</p>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}

/** The bottom sheet that explains a card after it is judged; drag or tap the handle to peek at the card. */
export function Debrief({ card, lang, said, points, open, active, onSignal, peek, setPeek }: Props) {
  const correct = said === card.verdict;
  const sheet = useRef<HTMLDivElement>(null);
  const drag = useRef({ y0: 0, dy: 0, on: false });
  const [dragY, setDragY] = useState<number | null>(null);

  const down = (e: PointerEvent) => { drag.current = { y0: e.clientY, dy: 0, on: true }; (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); };
  const move = (e: PointerEvent) => {
    if (!drag.current.on) return;
    const dy = e.clientY - drag.current.y0;
    drag.current.dy = dy;
    const resisted = peek ? Math.min(0, dy) * 0.9 + Math.max(0, dy) * 0.2 : Math.max(0, dy) + Math.min(0, dy) * 0.2;
    setDragY(resisted);
  };
  const up = () => {
    if (!drag.current.on) return;
    drag.current.on = false;
    const dy = drag.current.dy;
    setDragY(null);
    if (Math.abs(dy) < 6) { setPeek(!peek); return; }
    if (!peek && dy > 70) setPeek(true);
    else if (peek && dy < -50) setPeek(false);
  };

  const style = dragY !== null
    ? { transform: `${peek ? 'translateY(calc(100% - 96px))' : 'translateY(0)'} translateY(${dragY}px)`, transition: 'none' }
    : undefined;
  return (
    <div ref={sheet} class={`sheet ${open ? 'open' : ''} ${peek ? 'peek' : ''}`} style={style} role="region" aria-label={correct ? S.correct[lang] : S.wrong[lang]}>
      <div class="sheet-handle" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
        <div class="grab" />
        <div class={`verdict-head ${correct ? 'ok' : 'no'}`}>
          <span class="ring"><Icon name={correct ? 'check' : 'x'} /></span>
          <div>
            <h3>{correct ? S.correct[lang] : S.wrong[lang]}</h3>
            <p class={card.verdict === 'scam' ? 'v-scam' : 'v-legit'}>{card.verdict === 'scam' ? S.itWasScam[lang] : S.itWasLegit[lang]}</p>
          </div>
          {points > 0 && <span class="pts num" dir="ltr">+{fmtNum(points)}</span>}
        </div>
      </div>
      <div class="sheet-body">
        <SignalList card={card} lang={lang} active={active} onSignal={onSignal} />
      </div>
    </div>
  );
}
