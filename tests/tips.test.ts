// The tip of the day: one a day for everyone, every topic labelled in both languages.
import { describe, it, expect } from 'vitest';
import { TIPS, tipFor } from '../app/src/content/tips';
import { TIP_TOPICS } from '../app/src/i18n/strings';

describe('tips', () => {
  it('give every topic a label in both languages', () => {
    for (const tip of TIPS) {
      expect(TIP_TOPICS[tip.topic]?.en, tip.id).toBeTruthy();
      expect(TIP_TOPICS[tip.topic]?.ar, tip.id).toBeTruthy();
    }
  });
  it('change every day and come round again after the last one', () => {
    expect(TIPS.length).toBeGreaterThanOrEqual(30);
    expect(tipFor(0).id).toBe(TIPS[0].id);
    expect(tipFor(1).id).not.toBe(tipFor(0).id);
    expect(tipFor(TIPS.length).id).toBe(TIPS[0].id);
    expect(tipFor(-1).id).toBe(TIPS[TIPS.length - 1].id);
  });
});
