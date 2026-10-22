import { useRef, useState } from 'preact/hooks';
import type { Card, Lang, LangBlock, Verdict } from '../../content/types';
import { Icon } from './Icon';
import { S } from '../../i18n/strings';
import { fmtNum } from '../../i18n/i18n';
import { bidi } from '../cards/marker';

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

export function SignalList({ card, lang, active, onSignal }: { card: Card; lang: Lang; active: number | null; onSignal: (i: number) => void }) {
  const block = card[lang] as LangBlock;
  return (
    <>
      <ul class="signals">
        {block.signals.map((s, i) => (
          <li key={i}>
            <button class={`signal ${s.kind} ${active === i ? 'active' : ''}`} onClick={() => onSignal(i)}>
              <span class="n">{i + 1}</span>
              <span>
                <span class="k">{S[KIND_LABEL[s.kind]][lang]}</span>
                <p>{bidi(s.why)}</p>
              </span>
            </button>
          </li>
        ))}
      </ul>
      <div class="lesson">
        <b><Icon name="shield-check" />{S.nextTime[lang]}</b>
        <p>{bidi(block.lesson)}</p>
      </div>
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
            <p>{card.verdict === 'scam' ? S.itWasScam[lang] : S.itWasLegit[lang]}</p>
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
