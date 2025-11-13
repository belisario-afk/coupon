import { Offer } from '../models/types';
import { createOffer } from './storage';

/**
 * Bulk paste parser:
 * Accepts lines like:
 * Target | Tide 64-load | $14.99 base | -$3 manufacturer | 10% Circle | Ibotta $1.25 | Ends 2025-11-30
 *
 * Heuristics:
 * - First token store
 * - Next token title
 * - Tokens with $ and 'base' => base price
 * - Tokens with '-$' or 'manufacturer' => flat discount
 * - Percent value => percent discount
 * - 'Ibotta $x' => rebate
 * - 'gift card' or 'GC $x' => gift_card
 * - 'Ends YYYY-MM-DD' => endDate
 */
export function parseBulkOffers(input: string): Offer[] {
  const lines = input
    .split(/\n+/)
    .map(l => l.trim())
    .filter(Boolean);
  const offers: Offer[] = [];

  for (const line of lines) {
    const parts = line.split('|').map(p => p.trim());
    if (parts.length < 2) continue;
    const storePart = parts[0];
    const titlePart = parts[1];

    const base: Partial<Offer> = {
      store: storePart === 'Walmart' ? 'Walmart' : 'Target',
      title: titlePart,
      productTags: titlePart.toLowerCase().split(/\s+/),
      confidence: 0.6
    };

    let flatDiscountTotal = 0;
    let percentDiscountTotal = 0;
    let rebateTotal = 0;
    let giftCardValue = 0;
    let basePrice: number | undefined;
    let endDate: string | undefined;
    const notes: string[] = [];

    for (const tokenRaw of parts.slice(2)) {
      const token = tokenRaw.toLowerCase();
      // Base price
      const baseMatch = token.match(/\$([\d.]+)\s*base/);
      if (baseMatch) {
        basePrice = parseFloat(baseMatch[1]);
        continue;
      }
      // Flat discount
      const flatMatch = token.match(/-\$([\d.]+)/);
      if (flatMatch) {
        flatDiscountTotal += parseFloat(flatMatch[1]);
        continue;
      }
      // Percent discount
      const percentMatch = token.match(/([\d.]+)%/);
      if (percentMatch) {
        percentDiscountTotal += parseFloat(percentMatch[1]);
        continue;
      }
      // Rebate
      const rebateMatch = token.match(/ibotta\s*\$([\d.]+)/);
      if (rebateMatch) {
        rebateTotal += parseFloat(rebateMatch[1]);
        continue;
      }
      // Gift card
      const gcMatch = token.match(/(gift\s*card|gc)\s*\$([\d.]+)/);
      if (gcMatch) {
        giftCardValue += parseFloat(gcMatch[2]);
        continue;
      }
      // End date
      const endMatch = token.match(/ends\s*(\d{4}-\d{2}-\d{2})/);
      if (endMatch) {
        endDate = endMatch[1];
        continue;
      }
      notes.push(tokenRaw);
    }

    // Create separate offers per discount type to keep stacking explicit.
    if (basePrice !== undefined) {
      if (flatDiscountTotal !== 0) {
        offers.push(
          createOffer({
            ...base,
            basePrice,
            valueType: 'flat',
            valueAmount: flatDiscountTotal,
            endDate,
            notes: notes.join('; ')
          })
        );
      }
      if (percentDiscountTotal !== 0) {
        offers.push(
          createOffer({
            ...base,
            basePrice,
            valueType: 'percent',
            valueAmount: percentDiscountTotal,
            endDate,
            notes: notes.join('; ')
          })
        );
      }
      if (rebateTotal !== 0) {
        offers.push(
          createOffer({
            ...base,
            basePrice,
            valueType: 'rebate',
            valueAmount: rebateTotal,
            endDate,
            notes: notes.join('; ')
          })
        );
      }
      if (giftCardValue !== 0) {
        offers.push(
          createOffer({
            ...base,
            basePrice,
            valueType: 'gift_card',
            valueAmount: giftCardValue,
            endDate,
            notes: notes.join('; ')
          })
        );
      }
      // If no discount tokens produce at least an anchor offer with base price.
      if (
        flatDiscountTotal === 0 &&
        percentDiscountTotal === 0 &&
        rebateTotal === 0 &&
        giftCardValue === 0
      ) {
        offers.push(
          createOffer({
            ...base,
            basePrice,
            valueType: 'flat',
            valueAmount: 0,
            endDate,
            notes: notes.join('; ')
          })
        );
      }
    }
  }

  return offers;
}