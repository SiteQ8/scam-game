export type Channel = 'sms' | 'notification' | 'chat' | 'email' | 'call' | 'web' | 'qr' | 'social' | 'market';
export type Verdict = 'scam' | 'legit';
export type Region = 'gcc' | 'global';
export type Lang = 'ar' | 'en';
export type SignalKind = 'red' | 'green' | 'trap';
export type Category =
  | 'delivery' | 'banking' | 'accounts' | 'government' | 'telecom' | 'utilities' | 'shopping' | 'marketplace'
  | 'jobs' | 'investment' | 'romance' | 'family' | 'tech-support' | 'prize' | 'charity' | 'travel' | 'rental'
  | 'education' | 'subscriptions' | 'business';

export type PackId = 'banking' | 'delivery' | 'jobs' | 'invest' | 'gov' | 'ai';

export interface Signal { kind: SignalKind; mark: string; why: string }
export interface ChatMsg { from: 'them' | 'me'; text: string; time?: string; voice?: boolean; duration?: string; audio?: string }
export interface CallLine { who: 'caller' | 'you'; text: string }

export interface SmsBody { sender: string; time: string; body: string }
export interface NotificationBody { app: string; title: string; body: string; time: string }
export interface ChatBody { contact: string; saved: boolean; messages: ChatMsg[] }
export interface EmailBody { fromName: string; fromAddress: string; subject: string; body: string; button?: { label: string; url: string }; attachment?: string }
export interface CallBody { caller: string; saved: boolean; voice: { gender: 'male' | 'female'; age: string; tone: string }; lines: CallLine[] }
export interface WebBody { url: string; secure: boolean; title: string; heading: string; text: string; fields: string[]; button: string }
export interface QrBody { place: string; title: string; text: string; opens: string }
export interface SocialBody { displayName: string; handle: string; verified: boolean; followers: string; kind: 'dm' | 'post' | 'comment'; text: string }
export interface MarketBody { item: string; price: string; messages: ChatMsg[] }

export type AnyBody = SmsBody | NotificationBody | ChatBody | EmailBody | CallBody | WebBody | QrBody | SocialBody | MarketBody;

export interface LangBlock { context?: string; card: AnyBody; signals: Signal[]; lesson: string; audio?: string; timing?: { line: number; start: number; end: number }[] }

export interface Card {
  id: string;
  channel: Channel;
  verdict: Verdict;
  category: Category;
  region: Region;
  difficulty: number;
  tags?: string[];
  /** Cards written for one of the themed packs; they are played from the pack and in the random modes. */
  pack?: PackId;
  qr?: { viewBox: string; d: string };
  ar: LangBlock;
  en: LangBlock;
}
