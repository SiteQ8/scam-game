import type { JSX } from 'preact';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { Card, Lang, SmsBody, NotificationBody, ChatBody, EmailBody, CallBody, WebBody, QrBody, SocialBody, MarketBody, ChatMsg, LangBlock } from '../../content/types';
import { Icon } from '../components/Icon';
import type { IconName } from '../icons.generated';
import { createMarker, markNumbers, type Marker } from './marker';
import { S, CHANNEL_NAMES } from '../../i18n/strings';
import { settings } from '../../state/store';
import { playVoice, stopVoice, type VoiceHandle } from '../../platform/audio';
import { hashString } from '../../engine/random';

export type CardMode = 'play' | 'debrief' | 'hunt' | 'static';

interface Props {
  card: Card;
  lang: Lang;
  mode: CardMode;
  active?: number | null;
  huntFound?: Set<number>;
  marksOn?: boolean;
  onHuntTap?: (index: number | null, e: MouseEvent) => void;
  scrollRef?: { current: HTMLDivElement | null };
}

const CHANNEL_ICON: Record<string, IconName> = { sms: 'message-square', notification: 'bell', chat: 'message-circle', email: 'mail', call: 'phone', web: 'globe', qr: 'qr-code', social: 'users', market: 'shopping-bag' };
const tr = (lang: Lang, key: keyof typeof S) => S[key][lang];

export function CardView({ card, lang, mode, active = null, huntFound, marksOn, onHuntTap, scrollRef }: Props) {
  const block = card[lang] as LangBlock;
  const numbers = useMemo(() => markNumbers(card, lang), [card, lang]);
  const marker = createMarker(block.signals, { on: mode === 'debrief', active, hunt: mode === 'hunt' ? huntFound : undefined, numbers });
  const kind = (
    <div class="msg-kind">
      <Icon name={CHANNEL_ICON[card.channel]} />
      <span>{CHANNEL_NAMES[card.channel][lang]}</span>
    </div>
  );
  const onClick = (e: MouseEvent) => {
    if (mode !== 'hunt' || !onHuntTap) return;
    const el = (e.target as HTMLElement).closest('[data-i]') as HTMLElement | null;
    onHuntTap(el ? Number(el.dataset.i) : null, e);
  };
  let body;
  switch (card.channel) {
    case 'sms': body = <Sms b={block.card as SmsBody} m={marker} lang={lang} kind={kind} />; break;
    case 'notification': body = <Notification b={block.card as NotificationBody} m={marker} lang={lang} kind={kind} />; break;
    case 'chat': body = <Chat card={card} b={block.card as ChatBody} m={marker} lang={lang} kind={kind} mode={mode} />; break;
    case 'email': body = <Email b={block.card as EmailBody} m={marker} lang={lang} kind={kind} />; break;
    case 'call': body = <Call card={card} block={block} b={block.card as CallBody} m={marker} lang={lang} mode={mode} />; break;
    case 'web': body = <Web b={block.card as WebBody} m={marker} kind={kind} />; break;
    case 'qr': body = <Qr card={card} b={block.card as QrBody} m={marker} lang={lang} kind={kind} />; break;
    case 'social': body = <Social b={block.card as SocialBody} m={marker} lang={lang} kind={kind} />; break;
    case 'market': body = <Market b={block.card as MarketBody} m={marker} lang={lang} kind={kind} />; break;
  }
  return (
    <article class={`msg ch-${card.channel} ${mode === 'hunt' ? 'hunt' : ''} ${marksOn ? 'marks-on' : ''}`} dir={lang === 'ar' ? 'rtl' : 'ltr'} lang={lang} onClick={onClick}>
      <div class="msg-scroll" ref={scrollRef as never}>{body}</div>
    </article>
  );
}

function initial(name: string) {
  const s = name.trim();
  if (!s || /^[+\d(]/.test(s)) return null;
  return s[0].toUpperCase();
}

function Avatar({ name }: { name: string }) {
  const ch = initial(name);
  return <div class="avatar">{ch || <Icon name="user" />}</div>;
}

function Sms({ b, m, lang, kind }: { b: SmsBody; m: Marker; lang: Lang; kind: JSX.Element }) {
  return (
    <>
      {kind}
      <div class="convo-head">
        <Avatar name={b.sender} />
        <div class="who"><b>{m.seg(b.sender)}</b></div>
      </div>
      <div class="convo">
        <div class="stamp-time">{tr(lang, 'today')} <span class="num" dir="ltr">{b.time}</span></div>
        <div class="bubble them">{m.seg(b.body)}</div>
      </div>
    </>
  );
}

const APP_ICON: [RegExp, IconName][] = [
  [/bank|بنك|مصرف/i, 'landmark'], [/wallet|محفظ|pay|دفع/i, 'credit-card'], [/mail|بريد/i, 'mail'], [/message|رسائل|رسالة/i, 'message-square'],
  [/store|shop|متجر/i, 'shopping-bag'], [/courier|delivery|post|توصيل|شحن/i, 'truck'], [/telecom|اتصالات/i, 'radio-tower'], [/airline|travel|طيران|سفر/i, 'plane'],
];

function Notification({ b, m, lang, kind }: { b: NotificationBody; m: Marker; lang: Lang; kind: JSX.Element }) {
  const icon = APP_ICON.find(([re]) => re.test(b.app))?.[1] || 'bell';
  const time = b.time === 'now' ? tr(lang, 'now') : /^\d+m$/.test(b.time) ? tr(lang, 'minutesAgo').replace('{n}', b.time.replace('m', '')) : b.time;
  const clock = /^\d{2}:\d{2}$/.test(b.time) ? b.time : '9:41';
  return (
    <div class="lock">
      <div class="msg-kind" style={{ color: 'rgba(255,255,255,.65)', padding: 0 }}>{kind.props.children}</div>
      <div class="clock">{clock}</div>
      <div class="date">{tr(lang, 'today')}</div>
      <div class="notif">
        <div class="top"><span class="app-ico"><Icon name={icon} /></span><span>{m.seg(b.app)}</span><span class="time num">{time}</span></div>
        <b>{m.seg(b.title)}</b>
        <p>{m.seg(b.body)}</p>
      </div>
    </div>
  );
}

function Chat({ card, b, m, lang, kind, mode }: { card: Card; b: ChatBody; m: Marker; lang: Lang; kind: JSX.Element; mode: CardMode }) {
  return (
    <>
      {kind}
      <div class="convo-head">
        <Avatar name={b.contact} />
        <div class="who"><b>{m.seg(b.contact)}</b><span>{b.saved ? CHANNEL_NAMES.chat[lang] : tr(lang, 'notInContacts')}</span></div>
      </div>
      {!b.saved && <div class="unknown-banner"><Icon name="info" />{tr(lang, 'notInContacts')}</div>}
      <div class="convo">
        {b.messages.map((msg, i) => <Bubble key={i} msg={msg} m={m} lang={lang} mode={mode} id={`${card.id}-${i}`} />)}
      </div>
    </>
  );
}

function Bubble({ msg, m, lang, mode, id }: { msg: ChatMsg; m: Marker; lang: Lang; mode: CardMode; id: string }) {
  if (msg.voice) return <VoiceBubble msg={msg} m={m} lang={lang} mode={mode} id={id} />;
  return (
    <div class={`bubble ${msg.from}`}>
      {m.seg(msg.text)}
      {msg.time && <span class="t num" dir="ltr">{msg.time}</span>}
    </div>
  );
}

function bars(seed: string, n = 28) {
  const h = hashString(seed);
  return Array.from({ length: n }, (_, i) => 25 + (((h >> (i % 24)) ^ (i * 2654435761)) >>> 0) % 75);
}

function VoiceBubble({ msg, m, lang, mode, id }: { msg: ChatMsg; m: Marker; lang: Lang; mode: CardMode; id: string }) {
  const [playing, setPlaying] = useState(false);
  const [showText, setShowText] = useState(mode !== 'play' || !msg.audio);
  const handle = useRef<VoiceHandle | null>(null);
  const heights = useMemo(() => bars(id), [id]);
  useEffect(() => () => { if (handle.current) stopVoice(); }, []);
  useEffect(() => {
    if (mode === 'play' && msg.audio && settings.value.autoplay) {
      const tm = setTimeout(() => toggle(), 500);
      return () => clearTimeout(tm);
    }
  }, [msg.audio]);
  function toggle(e?: Event) {
    e?.stopPropagation();
    if (!msg.audio) { setShowText(true); return; }
    if (playing) { stopVoice(); setPlaying(false); return; }
    handle.current = playVoice(msg.audio, () => { setPlaying(false); setShowText(true); });
    setPlaying(true);
  }
  return (
    <div class={`bubble ${msg.from}`}>
      <div class="voice">
        <button class="play" onClick={toggle} aria-label={playing ? S.pause[lang] : S.voiceNote[lang]}>
          <Icon name={playing ? 'pause' : 'play'} />
        </button>
        <div class={`wave ${playing ? 'playing' : ''}`} aria-hidden="true">
          {heights.map((h, i) => <i style={{ height: `${h}%`, animationDelay: `${(i % 7) * 90}ms` }} />)}
        </div>
        <span class="dur" dir="ltr">{msg.duration}</span>
      </div>
      {showText ? (
        <div class="voice-transcript">{m.seg(msg.text)}</div>
      ) : (
        <button class="voice-transcript" onClick={(e) => { e.stopPropagation(); setShowText(true); }} style={{ textDecoration: 'underline' }}>{S.transcript[lang]}</button>
      )}
      {msg.time && <span class="t num" dir="ltr">{msg.time}</span>}
    </div>
  );
}

function Email({ b, m, lang, kind }: { b: EmailBody; m: Marker; lang: Lang; kind: JSX.Element }) {
  return (
    <>
      {kind}
      <div class="mail-head">
        <h4>{m.seg(b.subject)}</h4>
        <div class="mail-from">
          <Avatar name={b.fromName} />
          <div style={{ minWidth: 0 }}>
            <b>{m.seg(b.fromName)}</b>
            <span>{m.seg(b.fromAddress)}</span>
          </div>
        </div>
      </div>
      <div class="mail-body">
        {m.seg(b.body)}
        {b.button && (
          <div>
            <span class="mail-btn">{m.seg(b.button.label)}</span>
            <span class="mail-btn-url">{m.seg(b.button.url)}</span>
          </div>
        )}
        {b.attachment && <div><span class="attach"><Icon name="paperclip" />{m.seg(b.attachment)}</span></div>}
      </div>
      <span class="sr-only">{tr(lang, 'to')} {tr(lang, 'me')}</span>
    </>
  );
}

function Web({ b, m, kind }: { b: WebBody; m: Marker; kind: JSX.Element }) {
  return (
    <>
      {kind}
      <div class="browser-bar">
        <Icon name={b.secure ? 'lock' : 'triangle-alert'} />
        <span class="url">{m.seg(b.url)}</span>
      </div>
      <div class="page">
        <div class="tab-title">{m.seg(b.title)}</div>
        <h4>{m.seg(b.heading)}</h4>
        <p>{m.seg(b.text)}</p>
        {b.fields.map((f, i) => <div class="field" key={i}>{m.seg(f)}</div>)}
        <div class="cta">{m.seg(b.button)}</div>
      </div>
    </>
  );
}

function Qr({ card, b, m, lang, kind }: { card: Card; b: QrBody; m: Marker; lang: Lang; kind: JSX.Element }) {
  return (
    <>
      {kind}
      <div class="qr-scene">
        <div class="qr-place"><Icon name="map-pin" />{m.seg(b.place)}</div>
        <div class="poster">
          <h4>{m.seg(b.title)}</h4>
          {card.qr && (
            <svg class="qr" viewBox={card.qr.viewBox} shape-rendering="crispEdges" role="img" aria-label="QR">
              <path d={card.qr.d} stroke="#141820" fill="none" />
            </svg>
          )}
          <p>{m.seg(b.text)}</p>
        </div>
        <div class="qr-preview"><Icon name="scan-line" /><span>{S.scanOpens[lang]}: </span><span class="u">{m.seg(b.opens)}</span></div>
      </div>
    </>
  );
}

function Social({ b, m, lang, kind }: { b: SocialBody; m: Marker; lang: Lang; kind: JSX.Element }) {
  const label = b.kind === 'dm' ? S.directMessage[lang] : b.kind === 'post' ? S.post[lang] : S.comment[lang];
  return (
    <>
      {kind}
      <div class="profile">
        <Avatar name={b.displayName} />
        <div style={{ minWidth: 0 }}>
          <div class="name">{m.seg(b.displayName)}{b.verified && <Icon name="badge-check" />}</div>
          <div class="handle">{m.seg(b.handle)}</div>
          <div class="foll"><span class="num" dir="ltr">{b.followers}</span> {S.followers[lang]}</div>
        </div>
      </div>
      <div class="post-kind">{label}</div>
      <div class="post-body">{m.seg(b.text)}</div>
    </>
  );
}

function Market({ b, m, lang, kind }: { b: MarketBody; m: Marker; lang: Lang; kind: JSX.Element }) {
  return (
    <>
      {kind}
      <div class="listing">
        <div class="thumb"><Icon name="shopping-bag" /></div>
        <div style={{ minWidth: 0 }}>
          <b>{m.seg(b.item)}</b>
          <span class="num">{m.seg(b.price)}</span>
        </div>
      </div>
      <div class="convo">
        {b.messages.map((msg, i) => (
          <div class={`bubble ${msg.from}`} key={i}>{m.seg(msg.text)}{msg.time && <span class="t num" dir="ltr">{msg.time}</span>}</div>
        ))}
      </div>
      <span class="sr-only">{S.listing[lang]}</span>
    </>
  );
}

// ---------- Calls ----------
interface Timing { line: number; start: number; end: number }

function Call({ card, block, b, m, lang, mode }: { card: Card; block: LangBlock & { timing?: Timing[] }; b: CallBody; m: Marker; lang: Lang; mode: CardMode }) {
  const audioSrc = block.audio;
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [done, setDone] = useState(!audioSrc || mode !== 'play');
  const [dur, setDur] = useState(0);
  const handle = useRef<VoiceHandle | null>(null);
  const raf = useRef(0);

  useEffect(() => () => { cancelAnimationFrame(raf.current); if (handle.current) stopVoice(); }, []);
  useEffect(() => {
    if (mode === 'play' && audioSrc && settings.value.autoplay) {
      const tm = setTimeout(() => start(), 650);
      return () => clearTimeout(tm);
    }
  }, [card.id]);

  function tick() {
    const a = handle.current?.audio;
    if (a) { setTime(a.currentTime); if (a.duration && !Number.isNaN(a.duration)) setDur(a.duration); }
    raf.current = requestAnimationFrame(tick);
  }
  function start(e?: Event) {
    e?.stopPropagation();
    if (!audioSrc) return;
    if (playing) { stopVoice(); setPlaying(false); cancelAnimationFrame(raf.current); return; }
    handle.current = playVoice(audioSrc, () => { setPlaying(false); setDone(true); cancelAnimationFrame(raf.current); });
    setPlaying(true);
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(tick);
  }

  // When each line becomes visible while the call plays.
  const reveal = useMemo(() => {
    const callerIdx = b.lines.map((l, i) => (l.who === 'caller' ? i : -1)).filter((i) => i >= 0);
    let starts: Record<number, { start: number; end: number }> = {};
    if (block.timing && block.timing.length) {
      block.timing.forEach((tm) => { starts[tm.line] = { start: tm.start, end: tm.end }; });
    } else if (dur) {
      const weights = callerIdx.map((i) => b.lines[i].text.length + 12);
      const total = weights.reduce((a, c) => a + c, 0);
      let acc = 0;
      callerIdx.forEach((i, k) => { const s = (acc / total) * dur; acc += weights[k]; starts[i] = { start: s, end: (acc / total) * dur }; });
    } else starts = {};
    let lastEnd = 0;
    return b.lines.map((l, i) => {
      if (l.who === 'caller') { const s = starts[i]; lastEnd = s ? s.end : lastEnd; return s ? s.start : Infinity; }
      return lastEnd + 0.15;
    });
  }, [dur, block.timing, b.lines]);

  const visible = (i: number) => done || (playing && time + 0.05 >= reveal[i]);
  const unknown = !b.saved;
  return (
    <div class="call">
      <div class="msg-kind"><Icon name="phone-incoming" /><span>{S.incomingCall[lang]}</span></div>
      <div class={`big-avatar ${mode === 'play' && !done ? 'ringing' : ''}`}><Icon name={unknown ? 'user' : 'phone'} /></div>
      <div class="caller">{m.seg(b.caller)}</div>
      <div class="sub">{unknown ? S.unknownCaller[lang] : S.mobile[lang]}</div>
      <div style={{ marginTop: '16px' }}>
        {audioSrc && (
          <button class={`play-call ${playing ? 'on' : ''}`} onClick={start} aria-label={playing ? S.pause[lang] : S.listen[lang]}>
            <Icon name={playing ? 'pause' : done ? 'rotate-ccw' : 'play'} />
            <span>{playing ? S.pause[lang] : done && mode === 'play' ? S.replay[lang] : S.listen[lang]}</span>
          </button>
        )}
      </div>
      <div class="lines">
        {b.lines.map((l, i) => (
          <div class={`line ${l.who} ${visible(i) ? '' : 'pending'}`} key={i}>
            <span class="who">{l.who === 'you' ? S.callerYou[lang] : S.caller[lang]}</span>
            {visible(i) ? m.seg(l.text) : <span aria-hidden="true" class="dots">• • •</span>}
          </div>
        ))}
      </div>
      {!done && mode === 'play' && <div class="sub" style={{ marginTop: '12px' }}>{S.tapToHear[lang]}</div>}
    </div>
  );
}
