import type { Card } from '../content/types';
import type { Progress } from '../state/store';
import { CHAPTERS } from './deck';
import type { IconName } from '../ui/icons.generated';

export interface Achievement {
  id: string;
  icon: IconName;
  en: { title: string; body: string };
  ar: { title: string; body: string };
  check: (p: Progress, cards: readonly Card[]) => boolean;
}

const trapCards = (cards: readonly Card[]) => cards.filter((c) => c.en.signals.some((s) => s.kind === 'trap'));

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first', icon: 'badge-check', en: { title: 'First catch', body: 'Judge your first card right.' }, ar: { title: 'أول كشف', body: 'احكم على أول بطاقة حكماً صحيحاً.' }, check: (p) => p.right >= 1 },
  { id: 'run10', icon: 'zap', en: { title: 'On a roll', body: 'Ten right calls in a row.' }, ar: { title: 'سلسلة ذهبية', body: 'عشرة أحكام صحيحة متتالية.' }, check: (p) => p.bestRun >= 10 },
  { id: 'perfectDaily', icon: 'star', en: { title: 'Clean case', body: 'Close a daily case with all ten right.' }, ar: { title: 'ملف نظيف', body: 'أغلق ملف اليوم بعشر إجابات صحيحة.' }, check: (p) => Object.values(p.daily).some((d) => d.done && d.results.length > 0 && d.results.every(Boolean)) },
  { id: 'streak3', icon: 'flame', en: { title: 'Three days', body: 'Play the daily case three days running.' }, ar: { title: 'ثلاثة أيام', body: 'العب ملف اليوم ثلاثة أيام متتالية.' }, check: (p) => p.dailyStreak.best >= 3 },
  { id: 'streak7', icon: 'flame', en: { title: 'A full week', body: 'Play the daily case seven days running.' }, ar: { title: 'أسبوع كامل', body: 'العب ملف اليوم سبعة أيام متتالية.' }, check: (p) => p.dailyStreak.best >= 7 },
  { id: 'streak30', icon: 'calendar', en: { title: 'A month on duty', body: 'Play the daily case thirty days running.' }, ar: { title: 'شهر من اليقظة', body: 'العب ملف اليوم ثلاثين يوماً متتالية.' }, check: (p) => p.dailyStreak.best >= 30 },
  { id: 'rush15', icon: 'timer', en: { title: 'Quick eye', body: 'Get 15 right in the 60 second rush.' }, ar: { title: 'عين سريعة', body: 'احكم على خمس عشرة بطاقة حكماً صحيحاً في سباق الستين ثانية.' }, check: (p) => p.rushBest >= 15 },
  { id: 'rush25', icon: 'hourglass', en: { title: 'Lightning', body: 'Get 25 right in the 60 second rush.' }, ar: { title: 'كالبرق', body: 'احكم على خمس وعشرين بطاقة حكماً صحيحاً في سباق الستين ثانية.' }, check: (p) => p.rushBest >= 25 },
  { id: 'chapters', icon: 'route', en: { title: 'Journey complete', body: 'Pass every chapter.' }, ar: { title: 'أكملت المسار', body: 'اجتز كل الفصول.' }, check: (p) => CHAPTERS.every((c) => (p.journey[c.id]?.stars || 0) >= 1) },
  { id: 'allStars', icon: 'trophy', en: { title: 'Top of the class', body: 'Three stars on every chapter.' }, ar: { title: 'الأول على الدفعة', body: 'ثلاث نجوم في كل فصل.' }, check: (p) => CHAPTERS.every((c) => (p.journey[c.id]?.stars || 0) >= 3) },
  { id: 'expert', icon: 'award', en: { title: 'Expert', body: 'Pass the expert chapter.' }, ar: { title: 'خبير', body: 'اجتز فصل الخبراء.' }, check: (p) => (p.journey.expert?.stars || 0) >= 1 },
  { id: 'voices', icon: 'phone', en: { title: 'Good ear', body: 'Judge every call in the game right at least once.' }, ar: { title: 'أذن واعية', body: 'احكم على كل مكالمات اللعبة حكماً صحيحاً ولو مرة.' }, check: (p, cards) => { const calls = cards.filter((c) => c.channel === 'call'); return calls.length > 0 && calls.every((c) => (p.cards[c.id]?.right || 0) > 0); } },
  { id: 'traps', icon: 'eye', en: { title: 'Not fooled', body: 'Judge ten cards with a reassuring trap right.' }, ar: { title: 'لم تنخدع', body: 'احكم على عشر بطاقات فيها طمأنة خادعة حكماً صحيحاً.' }, check: (p, cards) => trapCards(cards).filter((c) => (p.cards[c.id]?.right || 0) > 0).length >= 10 },
  { id: 'legit25', icon: 'shield-check', en: { title: 'Fair judge', body: 'Trust 25 genuine messages correctly.' }, ar: { title: 'حَكَم منصف', body: 'ثق بخمس وعشرين رسالة سليمة في محلها.' }, check: (p) => p.legitTrusted >= 25 },
  { id: 'judged100', icon: 'chart-column', en: { title: 'Busy desk', body: 'Judge 100 cards.' }, ar: { title: 'مكتب مزدحم', body: 'احكم على مئة بطاقة.' }, check: (p) => p.judged >= 100 },
  { id: 'hunt', icon: 'crosshair', en: { title: 'Sharp eyes', body: 'Find every warning sign in a flag hunt.' }, ar: { title: 'عين ثاقبة', body: 'اعثر على كل علامات التحذير في جولة صيد.' }, check: (p) => p.huntPerfect >= 1 },
  { id: 'party', icon: 'users', en: { title: 'Host', body: 'Finish a game with friends or family.' }, ar: { title: 'المضيف', body: 'أنهِ جولة مع الأهل أو الأصدقاء.' }, check: (p) => p.partyGames >= 1 },
  { id: 'checker', icon: 'scan-search', en: { title: 'Checked for real', body: 'Use the message checker.' }, ar: { title: 'فحص حقيقي', body: 'استخدم فاحص الرسائل.' }, check: (p) => p.checkerUses >= 1 },
];

/** Returns the ids that became unlocked with this progress snapshot. */
export function newlyUnlocked(p: Progress, cards: readonly Card[]): Achievement[] {
  return ACHIEVEMENTS.filter((a) => !p.achievements[a.id] && a.check(p, cards));
}
