import type { Card } from '../content/types';
import type { Progress } from '../state/store';
import { CHAPTERS } from './deck';
import { PACKS } from './packs';
import type { IconName } from '../ui/icons.generated';

export type BadgeGroup = 'skill' | 'daily' | 'journey' | 'modes';
export type Tier = 'bronze' | 'silver' | 'gold';

export interface Achievement {
  id: string;
  icon: IconName;
  group: BadgeGroup;
  tier: Tier;
  en: { title: string; body: string };
  ar: { title: string; body: string };
  /** How far along the player is, as [done, goal]; a badge without it is a single step. */
  progress?: (p: Progress, cards: readonly Card[]) => [number, number];
  check: (p: Progress, cards: readonly Card[]) => boolean;
}

const trapCards = (cards: readonly Card[]) => cards.filter((c) => c.en.signals.some((s) => s.kind === 'trap'));
const rightOnce = (p: Progress, list: readonly Card[]) => list.filter((c) => (p.cards[c.id]?.right || 0) > 0).length;
const stars = (rec: Record<string, { stars: number }>, id: string) => rec[id]?.stars || 0;

/** A badge reached by counting: its progress bar and its check come from the same number. */
function counted(a: Omit<Achievement, 'check' | 'progress'>, value: (p: Progress, cards: readonly Card[]) => number, goal: number | ((cards: readonly Card[]) => number)): Achievement {
  const g = (cards: readonly Card[]) => (typeof goal === 'number' ? goal : goal(cards));
  return {
    ...a,
    progress: (p, cards) => [Math.min(value(p, cards), g(cards)), g(cards)],
    check: (p, cards) => g(cards) > 0 && value(p, cards) >= g(cards),
  };
}

const PACK_BADGES: Record<string, { icon: IconName; en: string; ar: string; enBody: string; arBody: string }> = {
  banking: { icon: 'landmark', en: 'Vault guard', ar: 'حارس الخزنة', enBody: 'Complete the bank fraud pack.', arBody: 'أكمل حزمة الاحتيال المصرفي.' },
  delivery: { icon: 'package', en: 'Parcel sleuth', ar: 'متعقب الشحنات', enBody: 'Complete the deliveries pack.', arBody: 'أكمل حزمة التوصيل.' },
  jobs: { icon: 'briefcase', en: 'No easy money', ar: 'لا مال سهل', enBody: 'Complete the fake jobs pack.', arBody: 'أكمل حزمة الوظائف الوهمية.' },
  invest: { icon: 'trending-up', en: 'Steady hands', ar: 'يد ثابتة', enBody: 'Complete the investment and crypto pack.', arBody: 'أكمل حزمة الاستثمار والعملات الرقمية.' },
  gov: { icon: 'building-2', en: 'By the book', ar: 'حسب الأصول', enBody: 'Complete the fake government pack.', arBody: 'أكمل حزمة انتحال الجهات الحكومية.' },
  ai: { icon: 'sparkles', en: 'Real or not', ar: 'حقيقي أم مزيف', enBody: 'Complete the AI fakes pack.', arBody: 'أكمل حزمة التزييف بالذكاء الاصطناعي.' },
};

export const ACHIEVEMENTS: Achievement[] = [
  // Skill
  { id: 'first', icon: 'badge-check', group: 'skill', tier: 'bronze', en: { title: 'First catch', body: 'Judge your first card right.' }, ar: { title: 'أول كشف', body: 'احكم على أول بطاقة حكماً صحيحاً.' }, check: (p) => p.right >= 1 },
  counted({ id: 'run10', icon: 'zap', group: 'skill', tier: 'silver', en: { title: 'On a roll', body: 'Ten right calls in a row.' }, ar: { title: 'سلسلة ذهبية', body: 'عشرة أحكام صحيحة متتالية.' } }, (p) => p.bestRun, 10),
  counted({ id: 'traps', icon: 'eye', group: 'skill', tier: 'silver', en: { title: 'Not fooled', body: 'Judge ten cards with a reassuring trap right.' }, ar: { title: 'لم تنخدع', body: 'احكم على عشر بطاقات فيها طمأنة خادعة حكماً صحيحاً.' } }, (p, cards) => rightOnce(p, trapCards(cards)), 10),
  counted({ id: 'legit25', icon: 'shield-check', group: 'skill', tier: 'silver', en: { title: 'Fair judge', body: 'Trust 25 genuine messages correctly.' }, ar: { title: 'حَكَم منصف', body: 'ثق بخمس وعشرين رسالة سليمة في محلها.' } }, (p) => p.legitTrusted, 25),
  counted({ id: 'voices', icon: 'phone', group: 'skill', tier: 'silver', en: { title: 'Good ear', body: 'Judge every call in the game right at least once.' }, ar: { title: 'أذن واعية', body: 'احكم على كل مكالمات اللعبة حكماً صحيحاً ولو مرة.' } }, (p, cards) => rightOnce(p, cards.filter((c) => c.channel === 'call')), (cards) => cards.filter((c) => c.channel === 'call').length),
  counted({ id: 'deepfakes', icon: 'scan-search', group: 'skill', tier: 'gold', en: { title: 'Deepfake spotter', body: 'Judge every AI fake in the game right at least once.' }, ar: { title: 'كاشف التزييف', body: 'احكم على كل بطاقات التزييف بالذكاء الاصطناعي حكماً صحيحاً ولو مرة.' } }, (p, cards) => rightOnce(p, cards.filter((c) => c.tags?.includes('deepfake'))), (cards) => cards.filter((c) => c.tags?.includes('deepfake')).length),
  counted({ id: 'judged100', icon: 'chart-column', group: 'skill', tier: 'bronze', en: { title: 'Busy desk', body: 'Judge 100 cards.' }, ar: { title: 'مكتب مزدحم', body: 'احكم على مئة بطاقة.' } }, (p) => p.judged, 100),
  counted({ id: 'judged500', icon: 'layers', group: 'skill', tier: 'gold', en: { title: 'Case archive', body: 'Judge 500 cards.' }, ar: { title: 'أرشيف الملفات', body: 'احكم على خمسمئة بطاقة.' } }, (p) => p.judged, 500),

  // Daily case
  { id: 'perfectDaily', icon: 'star', group: 'daily', tier: 'gold', en: { title: 'Clean case', body: 'Close a daily case with all ten right.' }, ar: { title: 'ملف نظيف', body: 'أغلق ملف اليوم بعشر إجابات صحيحة.' }, check: (p) => Object.values(p.daily).some((d) => d.done && d.results.length > 0 && d.results.every(Boolean)) },
  counted({ id: 'streak3', icon: 'flame', group: 'daily', tier: 'bronze', en: { title: 'Three days', body: 'Play the daily case three days running.' }, ar: { title: 'ثلاثة أيام', body: 'العب ملف اليوم ثلاثة أيام متتالية.' } }, (p) => p.dailyStreak.best, 3),
  counted({ id: 'streak7', icon: 'flame', group: 'daily', tier: 'silver', en: { title: 'A full week', body: 'Play the daily case seven days running.' }, ar: { title: 'أسبوع كامل', body: 'العب ملف اليوم سبعة أيام متتالية.' } }, (p) => p.dailyStreak.best, 7),
  counted({ id: 'streak14', icon: 'calendar-check', group: 'daily', tier: 'silver', en: { title: 'Two weeks', body: 'Play the daily case fourteen days running.' }, ar: { title: 'أسبوعان', body: 'العب ملف اليوم أربعة عشر يوماً متتالية.' } }, (p) => p.dailyStreak.best, 14),
  counted({ id: 'streak30', icon: 'calendar', group: 'daily', tier: 'gold', en: { title: 'A month on duty', body: 'Play the daily case thirty days running.' }, ar: { title: 'شهر من اليقظة', body: 'العب ملف اليوم ثلاثين يوماً متتالية.' } }, (p) => p.dailyStreak.best, 30),

  // Journey and packs
  counted({ id: 'chapters', icon: 'route', group: 'journey', tier: 'silver', en: { title: 'Journey complete', body: 'Pass every chapter.' }, ar: { title: 'أكملت المسار', body: 'اجتز كل الفصول.' } }, (p) => CHAPTERS.filter((c) => stars(p.journey, c.id) >= 1).length, CHAPTERS.length),
  counted({ id: 'allStars', icon: 'trophy', group: 'journey', tier: 'gold', en: { title: 'Top of the class', body: 'Three stars on every chapter.' }, ar: { title: 'الأول على الدفعة', body: 'ثلاث نجوم في كل فصل.' } }, (p) => CHAPTERS.filter((c) => stars(p.journey, c.id) >= 3).length, CHAPTERS.length),
  { id: 'expert', icon: 'award', group: 'journey', tier: 'gold', en: { title: 'Expert', body: 'Pass the expert chapter.' }, ar: { title: 'خبير', body: 'اجتز فصل الخبراء.' }, check: (p) => stars(p.journey, 'expert') >= 1 },
  ...PACKS.map((pk): Achievement => {
    const b = PACK_BADGES[pk.id];
    return { id: `pack-${pk.id}`, icon: b.icon, group: 'journey', tier: 'bronze', en: { title: b.en, body: b.enBody }, ar: { title: b.ar, body: b.arBody }, check: (p) => stars(p.packs, pk.id) >= 1 };
  }),
  counted({ id: 'allPacks', icon: 'medal', group: 'journey', tier: 'silver', en: { title: 'Collector', body: 'Complete all six packs.' }, ar: { title: 'جامع الحزم', body: 'أكمل الحزم الست كلها.' } }, (p) => PACKS.filter((pk) => stars(p.packs, pk.id) >= 1).length, PACKS.length),
  counted({ id: 'packStars', icon: 'trophy', group: 'journey', tier: 'gold', en: { title: 'Pack master', body: 'Three stars on every pack.' }, ar: { title: 'سيد الحزم', body: 'ثلاث نجوم في كل حزمة.' } }, (p) => PACKS.filter((pk) => stars(p.packs, pk.id) >= 3).length, PACKS.length),

  // Other ways to play
  counted({ id: 'rush15', icon: 'timer', group: 'modes', tier: 'silver', en: { title: 'Quick eye', body: 'Get 15 right in the 60 second rush.' }, ar: { title: 'عين سريعة', body: 'احكم على خمس عشرة بطاقة حكماً صحيحاً في سباق الستين ثانية.' } }, (p) => p.rushBest, 15),
  counted({ id: 'rush25', icon: 'hourglass', group: 'modes', tier: 'gold', en: { title: 'Lightning', body: 'Get 25 right in the 60 second rush.' }, ar: { title: 'كالبرق', body: 'احكم على خمس وعشرين بطاقة حكماً صحيحاً في سباق الستين ثانية.' } }, (p) => p.rushBest, 25),
  { id: 'hunt', icon: 'crosshair', group: 'modes', tier: 'silver', en: { title: 'Sharp eyes', body: 'Find every warning sign in a flag hunt.' }, ar: { title: 'عين ثاقبة', body: 'اعثر على كل علامات التحذير في جولة صيد.' }, check: (p) => p.huntPerfect >= 1 },
  { id: 'party', icon: 'users', group: 'modes', tier: 'bronze', en: { title: 'Host', body: 'Finish a game with friends or family.' }, ar: { title: 'المضيف', body: 'أنهِ جولة مع الأهل أو الأصدقاء.' }, check: (p) => p.partyGames >= 1 },
  { id: 'family', icon: 'accessibility', group: 'modes', tier: 'bronze', en: { title: 'Family table', body: 'Play a round in family and seniors mode.' }, ar: { title: 'جلسة العائلة', body: 'العب جولة في وضع العائلة وكبار السن.' }, check: (p) => (p.familyRounds || 0) >= 1 },
  { id: 'checker', icon: 'scan-search', group: 'modes', tier: 'bronze', en: { title: 'Checked for real', body: 'Use the message checker.' }, ar: { title: 'فحص حقيقي', body: 'استخدم فاحص الرسائل.' }, check: (p) => p.checkerUses >= 1 },
];

/** Returns the badges that became unlocked with this progress snapshot. */
export function newlyUnlocked(p: Progress, cards: readonly Card[]): Achievement[] {
  return ACHIEVEMENTS.filter((a) => !p.achievements[a.id] && a.check(p, cards));
}
