import { AppData, Offer, ReceiptLine, ResaleItem, Staple, UserSettings } from '../models/types';
import { makeId } from './utils';

const STORAGE_KEY = 'couponAppData';

export function defaultSettings(): UserSettings {
  return {
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
}

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { offers: [], staples: [], receipts: [], resaleInventory: [], settings: defaultSettings() };
    const parsed: AppData = JSON.parse(raw);
    // Merge defaults for newly added settings keys if any
    parsed.settings = { ...defaultSettings(), ...parsed.settings };
    return parsed;
  } catch {
    return { offers: [], staples: [], receipts: [], resaleInventory: [], settings: defaultSettings() };
  }
}

export function saveData(data: AppData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function exportData(data: AppData): string {
  return JSON.stringify(data, null, 2);
}

export function importData(raw: string, mode: 'merge' | 'overwrite'): AppData {
  const current = loadData();
  const incoming: AppData = JSON.parse(raw);
  if (mode === 'overwrite') {
    saveData(incoming);
    return incoming;
  }
  // Merge lists by id (simple)
  const mergeById = <T extends { id: string }>(a: T[], b: T[]): T[] => {
    const map = new Map(a.map(x => [x.id, x]));
    for (const item of b) map.set(item.id, item);
    return Array.from(map.values());
  };
  const merged: AppData = {
    offers: mergeById(current.offers, incoming.offers),
    staples: mergeById(current.staples, incoming.staples),
    receipts: mergeById(current.receipts, incoming.receipts),
    resaleInventory: mergeById(current.resaleInventory, incoming.resaleInventory),
    settings: { ...current.settings, ...incoming.settings }
  };
  saveData(merged);
  return merged;
}

/**
 * Convenience creation helpers.
 */
export function createStaple(name: string): Staple {
  return {
    id: makeId(),
    name,
    tags: [],
    unitsOnHand: 0,
    consumptionIntervalDays: undefined
  };
}

export function createOffer(partial: Partial<Offer>): Offer {
  return {
    id: makeId(),
    store: 'Target',
    title: partial.title || 'Untitled',
    productTags: partial.productTags || [],
    valueType: partial.valueType || 'flat',
    valueAmount: partial.valueAmount ?? 0,
    basePrice: partial.basePrice,
    confidence: partial.confidence ?? 0.6,
    startDate: partial.startDate,
    endDate: partial.endDate,
    notes: partial.notes,
    stackRules: partial.stackRules
  };
}

export function createReceiptLine(partial: Partial<ReceiptLine>): ReceiptLine {
  return {
    id: makeId(),
    date: partial.date || new Date().toISOString().slice(0, 10),
    store: partial.store || 'Target',
    name: partial.name || 'Item',
    price: partial.price ?? 0,
    qty: partial.qty ?? 1,
    matchedStapleId: partial.matchedStapleId
  };
}

export function createResaleItem(partial: Partial<ResaleItem>): ResaleItem {
  return {
    id: makeId(),
    stapleId: partial.stapleId!,
    acquiredUnitCost: partial.acquiredUnitCost ?? 0,
    desiredMarkupPercent: partial.desiredMarkupPercent ?? 15,
    expectedSalePrice: partial.expectedSalePrice ?? 0,
    projectedProfit: partial.projectedProfit ?? 0,
    listed: partial.listed ?? false,
    soldUnits: partial.soldUnits ?? 0,
    revenueCollected: partial.revenueCollected ?? 0
  };
}