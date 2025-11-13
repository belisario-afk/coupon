# Coupon & Resale Optimizer

A lightweight, client-only web app for a solo couponer who sources discounted Target & Walmart items and optionally resells them. Built with React + TypeScript, no server; deployable to GitHub Pages.

## Features (Phase 1)

- Offer Ingestion
  - Manual offer form (store, type, amounts, confidence)
  - Bulk paste parser: splits semi-structured lines into multiple stackable Offer entries
- Staples & Inventory
  - CRUD management
  - Automatic EMA-based consumption interval refinement on receipt logging
- Deal Scoring
  - Savings & recommendation logic (BUY vs WAIT) using urgency, confidence, and time cost
  - Supports flat, percent, gift card allocation, threshold simplified, rebate
- Dashboard
  - Top 5 recommended actions sorted by value score with rationale badges
- Receipt Logging
  - Quick multi-line form with fuzzy matching to staples
  - Updates units on hand, last low price, consumption interval
- Resale Module
  - Track acquisition cost, markup %, projected profit
  - Profit leaderboard, overstock flag
- Data Export/Import
  - JSON export / merge or overwrite import (with file or paste)
- Settings
  - Adjustable thresholds & time cost assumptions
- Offline Support
  - Service Worker caches static assets; offline badge
- Accessibility & Performance
  - Semantic elements, labels, focus indicators
  - Minimal bundle (React only, no heavy libs)
- Tests (Vitest)
  - Core scoring logic & bulk parser
- Tooling
  - ESLint + Prettier
  - Vite build
  - GitHub Actions deployment workflow
- PWA-lite manifest

## Data Model (TypeScript)

```ts
Offer {
  id, store, title, productTags[], valueType, valueAmount,
  basePrice?, startDate?, endDate?, confidence, notes?, stackRules?
}
Staple {
  id, name, tags[], avgPrice?, lastLowPrice?, lastPurchaseDate?,
  consumptionIntervalDays?, unitsOnHand?, priorityScore?
}
ReceiptLine {
  id, date, store, name, price, qty, matchedStapleId?
}
ResaleItem {
  id, stapleId, acquiredUnitCost, desiredMarkupPercent, expectedSalePrice,
  projectedProfit, listed?, soldUnits, revenueCollected
}
AppData { offers, staples, receipts, resaleInventory, settings }
```

## Calculation Logic

```
net_effective_cost =
  base_price
  - flat_discounts
  - percent_discount_amount
  - rebate_amount
  - gift_card_effective
  - threshold_prorated

raw_savings = base_price - net_effective_cost
savings_percent = (raw_savings / base_price) * 100

value_score =
  (raw_savings * confidence_multiplier * urgency_multiplier) / (time_cost_minutes + 1)

Recommendation:
WAIT if coverage_days > waitCoverageDays AND current_price > last_low_price * waitPriceMultiplier
BUY if savings_percent >= 25 OR raw_savings >= minRawSavings OR urgency_multiplier > 1
```

Gift Card Effective: gift_card value divided by `giftSplitCount` if provided.  
Threshold Simplification: discount applied if `thresholdScopeTotal >= thresholdTrigger`; allocated proportionally to item base price.

Urgency Multiplier: `1.3` if `(units_on_hand * consumptionIntervalDays) < (consumptionIntervalDays * urgencyLowCoverageRatio)` else `1.0`.

## Development

Install dependencies:

```bash
npm install
npm run dev
```

Run tests:

```bash
npm test
```

Build production:

```bash
npm run build
```

## Deployment to GitHub Pages

1. Ensure repository has Pages enabled (Settings > Pages).
2. Commit code to main.
3. GitHub Action workflow (see `.github/workflows/deploy.yml`) builds and publishes `dist` to `gh-pages` branch.
4. Configure Pages to serve from `gh-pages` branch root.
5. Access the app at `https://<username>.github.io/<repo>/`.

If hosting at a subpath (e.g. `/coupon-resale-optimizer/`), update Vite `base` in `vite.config.ts` if needed:
```ts
export default defineConfig({ base: '/coupon-resale-optimizer/', ... })
```

## Performance Notes

- Minimal dependencies (React + ReactDOM).
- Deferred heavy work: parsing only on submit.
- Avoided routing library; simple hash-based logic.
- No large polyfills; target modern browsers.

## Accessibility

- All form controls have explicit `<label>` elements.
- Buttons have `aria-label` where text might be ambiguous.
- Focus outlines preserved.
- Color contrast chosen for dark theme.

## Future Roadmap (Commented but Not Implemented)

- Price prediction using moving averages and seasonality tags.
- External API integration stub (e.g., product price checker).
- Tag-based filters for offers (e.g., hygiene, household).
- Enhanced threshold stacking across multiple line items.

## Service Worker

Provides simple offline caching of root assets. For dynamic module updates, version bump `CACHE` constant.

## Data Persistence

LocalStorage key `couponAppData`. JSON export/import supports migration and backup.

## License

MIT (add a LICENSE file if desired).

## Disclaimer

All calculations are heuristic and user-driven; verify deals manually.