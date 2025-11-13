import { DealEvaluation, Offer, Staple, UserSettings } from '../models/types';

/**
 * Compute net effective cost for a staple + a set of stackable offers.
 * For simplicity we treat offers referencing the staple by tag overlap.
 * Multiple offers can stack except conflicting same type (we allow multiples).
 */
export function evaluateStapleOffers(
  staple: Staple,
  offers: Offer[],
  settings: UserSettings
): DealEvaluation[] {
  const relevant = offers.filter(o =>
    o.productTags.some(t => staple.name.toLowerCase().includes(t) || staple.tags.includes(t))
  );
  return relevant.map(o => computeEvaluation(staple, o, settings));
}

/**
 * Core formula:
 * net_effective_cost = base_price
 *   - flat_discounts
 *   - percent_discount_amount
 *   - rebate_amount
 *   - gift_card_effective
 *   - threshold_prorated (simplified threshold trigger)
 */
function computeEvaluation(
  staple: Staple,
  offer: Offer,
  settings: UserSettings
): DealEvaluation {
  const base = offer.basePrice ?? staple.avgPrice ?? staple.lastLowPrice ?? 0;
  let net = base;
  const rationale: string[] = [];
  let flatDiscount = 0;
  let percentDiscountAmount = 0;
  let rebateAmount = 0;
  let giftCardEffective = 0;
  let thresholdDiscount = 0;

  switch (offer.valueType) {
    case 'flat':
      flatDiscount = offer.valueAmount;
      break;
    case 'percent':
      percentDiscountAmount = (offer.valueAmount / 100) * base;
      break;
    case 'rebate':
      rebateAmount = offer.valueAmount;
      rationale.push('Rebate');
      break;
    case 'gift_card': {
      const split = offer.stackRules?.giftSplitCount ?? 1;
      giftCardEffective = offer.valueAmount / split;
      rationale.push('Gift Card');
      break;
    }
    case 'threshold': {
      const trigger = offer.stackRules?.thresholdTrigger ?? Infinity;
      const scopeTotal = offer.stackRules?.thresholdScopeTotal ?? base;
      if (scopeTotal >= trigger) {
        // proportional allocation
        thresholdDiscount = (offer.valueAmount * base) / scopeTotal;
        rationale.push('Threshold Allocation');
      }
      break;
    }
  }

  net =
    net -
    flatDiscount -
    percentDiscountAmount -
    rebateAmount -
    giftCardEffective -
    thresholdDiscount;

  const rawSavings =
    flatDiscount +
    percentDiscountAmount +
    rebateAmount +
    giftCardEffective +
    thresholdDiscount;

  const savingsPercent = base === 0 ? 0 : ((base - net) / base) * 100;

  // Urgency multiplier
  const units = staple.unitsOnHand ?? 0;
  const interval = staple.consumptionIntervalDays ?? 30;
  const coverageDays = units * interval;
  const urgencyMultiplier =
    coverageDays < interval * settings.urgencyLowCoverageRatio ? 1.3 : 1.0;
  if (urgencyMultiplier > 1) rationale.push('Low Stock');

  const timeCostMinutes = settings.timeCostByType[offer.valueType] ?? 1;
  const confidenceMultiplier = offer.confidence;
  const valueScore =
    (rawSavings * confidenceMultiplier * urgencyMultiplier) / (timeCostMinutes + 1);

  // Recommendation logic
  let recommendation: 'BUY' | 'WAIT' = 'WAIT';
  if (
    savingsPercent >= 25 ||
    rawSavings >= settings.minRawSavings ||
    urgencyMultiplier > 1
  ) {
    recommendation = 'BUY';
    rationale.push('High Value');
  }
  const lastLow = staple.lastLowPrice ?? base;
  if (
    coverageDays > settings.waitCoverageDays &&
    base > lastLow * settings.waitPriceMultiplier
  ) {
    recommendation = 'WAIT';
    rationale.push('Plenty Stock');
  }

  if (savingsPercent >= 25) rationale.push('High % Off');
  if (rawSavings >= settings.minRawSavings) rationale.push('Raw Savings');

  return {
    offer,
    staple,
    netEffectiveCost: Math.max(net, 0),
    rawSavings,
    savingsPercent,
    valueScore,
    recommendation,
    rationale
  };
}