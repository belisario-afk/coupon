import { describe, it, expect } from 'vitest';
import { parseBulkOffers } from '../src/logic/parser';

describe('parseBulkOffers', () => {
  it('parses sample line into offers', () => {
    const line =
      'Target | Tide 64-load | $14.99 base | -$3 manufacturer | 10% Circle | Ibotta $1.25 | Ends 2025-11-30';
    const offers = parseBulkOffers(line);
    // Expect separate offers for each discount
    expect(offers.length).toBeGreaterThanOrEqual(4);
    const percent = offers.find(o => o.valueType === 'percent');
    expect(percent?.valueAmount).toBe(10);
    const rebate = offers.find(o => o.valueType === 'rebate');
    expect(rebate?.valueAmount).toBe(1.25);
  });
});