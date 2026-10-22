import type { Card, Lang, SmsBody, NotificationBody, ChatBody, EmailBody, SocialBody, WebBody, QrBody, CallBody, MarketBody } from '../content/types';

/** A card's message as someone would paste it into the checker: what the other side wrote or said, not the player's replies. */
export function cardText(card: Card, lang: Lang): string {
  const body = card[lang].card;
  switch (card.channel) {
    case 'sms': { const c = body as SmsBody; return `${c.sender}\n${c.body}`; }
    case 'notification': { const c = body as NotificationBody; return `${c.app}: ${c.title}\n${c.body}`; }
    case 'chat': case 'market': return ((body as ChatBody | MarketBody).messages || []).filter((m) => m.from !== 'me').map((m) => m.text).join('\n');
    case 'email': { const c = body as EmailBody; return `${c.fromName} <${c.fromAddress}>\n${c.subject}\n\n${c.body}`; }
    case 'social': return (body as SocialBody).text;
    case 'web': { const c = body as WebBody; return `${c.url}\n${c.heading}\n${c.text}`; }
    case 'qr': { const c = body as QrBody; return `${c.title}\n${c.text}\n${c.opens}`; }
    case 'call': return ((body as CallBody).lines || []).filter((l) => l.who !== 'you').map((l) => l.text).join('\n');
    default: return '';
  }
}
