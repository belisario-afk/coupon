import { describe, it, expect } from 'vitest';
import { evaluateStapleOffers } from '../src/logic/scoring';
import { Offer, Staple, UserSettings } from '../src/models/types';

const settings: UserSettings = {
  waitCoverageDays: 14,
  waitPriceMultiplier: 1.1,
  minRawSavings: 3,
  urgencyLowCoverageRatio: 0.3,
  timeCostByType: {
    flat: 0.5,
    percent: 0.5,
    gift_card: 1.5,
    threshold: 2,
    rebate: 2.5
  }
};

describe('evaluateStapleOffers', () => {
  const staple: Staple = {
    id: 's1',
    name: 'Tide Pods',
    tags: ['tide', 'pods'],
    lastLowPrice: 14,
    unitsOnHand: 0,
    consumptionIntervalDays: 30
  };

  const offers: Offer[] = [
    {
      id: 'o1',
      store: 'Target',
      title: 'Tide 64-load $14.99 -$3',
      productTags: ['tide'],
      valueType: 'flat',
      valueAmount: 3,
      basePrice: 14.99,
      confidence: 0.6
    },
    {
      id: 'o2',
      store: 'Target',
      title: 'Tide 10% Circle',
      productTags: ['tide'],
      valueType: 'percent',
      valueAmount: 10,
      basePrice: 14.99,
      confidence: 0.6
    }
  ];

  it('computes evaluations', () => {
    const evals = evaluateStapleOffers(staple, offers, settings);
    expect(evals.length).toBe(2);
    const flat = evals.find(e => e.offer.id === 'o1')!;
    expect(flat.rawSavings).toBeCloseTo(3);
    const percent = evals.find(e => e.offer.id === 'o2')!;
    expect(percent.rawSavings).toBeCloseTo(1.499); // 10% of 14.99
  });

  it('sets recommendation BUY when savings percent high or raw savings threshold', () => {
    const evals = evaluateStapleOffers(staple, offers, settings);
    expect(evals.some(e => e.recommendation === 'BUY')).toBe(true);
  });
});