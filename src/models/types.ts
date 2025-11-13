/**
 * Core data model interfaces.
 */

export type Store = 'Target' | 'Walmart';

export type OfferValueType =
  | 'flat'        // Fixed amount off
  | 'percent'     // Percent off
  | 'gift_card'   // Gift card reward
  | 'threshold'   // Spend threshold discount
  | 'rebate';     // Post-purchase rebate (Ibotta etc.)

export interface Offer {
  id: string;
  store: Store;
  title: string;
  productTags: string[];
  valueType: OfferValueType;
  valueAmount: number; // For percent, use 10 for 10%
  basePrice?: number;
  startDate?: string;
  endDate?: string;
  confidence: number; // multiplier (0..1+)
  notes?: string;
  stackRules?: {
    giftSplitCount?: number; // distribute gift_card value
    thresholdTrigger?: number; // minimum spend requirement for threshold
    thresholdScopeTotal?: number; // total simulated basket spend
  };
}

export interface Staple {
  id: string;
  name: string;
  tags: string[];
  avgPrice?: number;
  lastLowPrice?: number;
  lastPurchaseDate?: string;
  consumptionIntervalDays?: number; // average days per unit consumed
  unitsOnHand?: number;
  priorityScore?: number;
}

export interface ReceiptLine {
  id: string;
  date: string;
  store: Store;
  name: string;
  price: number;
  qty: number;
  matchedStapleId?: string;
}

export interface ResaleItem {
  id: string;
  stapleId: string;
  acquiredUnitCost: number;
  desiredMarkupPercent: number;
  expectedSalePrice: number;
  projectedProfit: number;
  listed?: boolean;
  soldUnits: number;
  revenueCollected: number;
}

export interface AppData {
  offers: Offer[];
  staples: Staple[];
  receipts: ReceiptLine[];
  resaleInventory: ResaleItem[];
  settings: UserSettings;
}

export interface UserSettings {
  waitCoverageDays: number; // coverage days threshold for WAIT logic
  waitPriceMultiplier: number; // lastLowPrice * multiplier comparison
  minRawSavings: number;
  urgencyLowCoverageRatio: number; // portion of consumptionInterval to trigger urgency
  timeCostByType: Record<OfferValueType, number>; // minutes cost
}

export interface DealEvaluation {
  offer: Offer;
  staple: Staple;
  netEffectiveCost: number;
  rawSavings: number;
  savingsPercent: number;
  valueScore: number;
  recommendation: 'BUY' | 'WAIT';
  rationale: string[];
}