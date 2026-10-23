import { back } from '../../state/nav';
import { lang, t } from '../../i18n/i18n';
import { TIP_TOPICS } from '../../i18n/strings';
import { dayIndex, dateOfDay } from '../../engine/daily';
import { tipFor, TIPS } from '../../content/tips';
import { Icon } from '../components/Icon';
import { TopBar, toast } from '../components/common';
import { shareText } from '../../platform/share';
import { siteUrl } from './Play';

/** The tips of the days so far, today first: one new tip a day, up to the whole set. */
export function Tips() {
  const L = lang.value;
  const today = dayIndex();
  const days = Array.from({ length: Math.min(TIPS.length, Math.max(1, today + 1)) }, (_, i) => today - i);
  const when = new Intl.DateTimeFormat(L === 'ar' ? 'ar-u-nu-latn' : 'en-GB', { day: 'numeric', month: 'long' });
  const label = (d: number) => (d === today ? t('today') : d === today - 1 ? t('yesterday') : when.format(dateOfDay(d)));
  async function share(text: string) {
    const r = await shareText(text, siteUrl() || undefined);
    if (r === 'copied') toast(t('copied'), 'copy');
  }
  return (
    <div class="screen">
      <TopBar title={t('tips')} onBack={back} />
      <div class="scroll"><div class="wrap">
        <p class="tips-intro">{t('tipsIntro')}</p>
        <div class="tip-list">
          {days.map((d) => {
            const tip = tipFor(d);
            return (
              <article class={`tip-item ${d === today ? 'today' : ''}`}>
                <div class="tip-meta"><span>{label(d)}</span><span class="topic">{TIP_TOPICS[tip.topic]?.[L]}</span></div>
                <p>{tip[L]}</p>
                <button class="icon-btn" onClick={() => share(tip[L])} aria-label={t('share')}><Icon name="share-2" /></button>
              </article>
            );
          })}
        </div>
      </div></div>
    </div>
  );
}
