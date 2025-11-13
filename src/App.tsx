import React, { useEffect, useState } from 'react';
import { AppData, Offer, Staple, ReceiptLine, ResaleItem } from './models/types';
import {
  loadData,
  saveData,
  createStaple,
  createOffer,
  createReceiptLine,
  createResaleItem,
  importData
} from './logic/storage';
import { evaluateStapleOffers } from './logic/scoring';
import { parseBulkOffers } from './logic/parser';
import OfflineBadge from './components/OfflineBadge';
import OfferForm from './components/forms/OfferForm';
import BulkPasteParser from './components/forms/BulkPasteParser';
import StapleForm from './components/forms/StapleForm';
import ActionList from './components/ActionList';
import ReceiptEditor from './components/ReceiptEditor';
import ResaleCalculator from './components/ResaleCalculator';
import InventoryTable from './components/InventoryTable';
import ExportImportPanel from './components/ExportImportPanel';
import SettingsPanel from './components/SettingsPanel';
import ResaleLeaderboard from './components/ResaleLeaderboard';

type View =
  | 'dashboard'
  | 'offers'
  | 'staples'
  | 'receipts'
  | 'resale'
  | 'settings'
  | 'data';

function App() {
  const [data, setData] = useState<AppData>(() => loadData());
  const [view, setView] = useState<View>('dashboard');

  useEffect(() => {
    const handler = () => {
      const hash = window.location.hash.replace('#', '') as View;
      if (hash) setView(hash);
    };
    window.addEventListener('hashchange', handler);
    handler();
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  useEffect(() => {
    saveData(data);
  }, [data]);

  // Derived evaluations
  const evaluations = data.staples.flatMap(staple =>
    evaluateStapleOffers(staple, data.offers, data.settings)
  );
  const topActions = evaluations.sort((a, b) => b.valueScore - a.valueScore).slice(0, 5);

  function upsertStaple(s: Staple) {
    setData(d => {
      const list = [...d.staples];
      const idx = list.findIndex(x => x.id === s.id);
      if (idx >= 0) list[idx] = s;
      else list.push(s);
      return { ...d, staples: list };
    });
  }

  function addOffer(o: Offer) {
    setData(d => ({ ...d, offers: [...d.offers, o] }));
  }

  function deleteOffer(id: string) {
    setData(d => ({ ...d, offers: d.offers.filter(o => o.id !== id) }));
  }

  function addStaple(name: string) {
    const staple = createStaple(name);
    upsertStaple(staple);
  }

  function deleteStaple(id: string) {
    setData(d => ({ ...d, staples: d.staples.filter(s => s.id !== id) }));
  }

  function addReceipt(lines: ReceiptLine[]) {
    setData(d => ({ ...d, receipts: [...d.receipts, ...lines] }));
    // Update staple stats
    lines.forEach(line => {
      if (!line.matchedStapleId) return;
      const staple = data.staples.find(s => s.id === line.matchedStapleId);
      if (!staple) return;
      const newUnits = (staple.unitsOnHand ?? 0) + line.qty;
      const newLastPurchase = line.date;
      const pricePerUnit = line.price;
      const lastLow = staple.lastLowPrice ?? pricePerUnit;
      const updatedLow = Math.min(lastLow, pricePerUnit);
      // consumption interval estimation (if we have previous purchase date)
      let interval = staple.consumptionIntervalDays;
      if (staple.lastPurchaseDate) {
        const prev = new Date(staple.lastPurchaseDate).getTime();
        const curr = new Date(line.date).getTime();
        const diffDays = Math.max(1, (curr - prev) / (1000 * 3600 * 24));
        // EMA update
        interval = (interval === undefined)
          ? diffDays / line.qty
          : 0.4 * (diffDays / line.qty) + 0.6 * interval;
      }
      upsertStaple({
        ...staple,
        unitsOnHand: newUnits,
        lastPurchaseDate: newLastPurchase,
        lastLowPrice: updatedLow,
        consumptionIntervalDays: interval
      });
    });
  }

  function createResale(stapleId: string, cost: number, markupPercent: number) {
    const expected = cost * (1 + markupPercent / 100);
    const projectedProfit = expected - cost;
    const item = createResaleItem({
      stapleId,
      acquiredUnitCost: cost,
      desiredMarkupPercent: markupPercent,
      expectedSalePrice: expected,
      projectedProfit
    });
    setData(d => ({ ...d, resaleInventory: [...d.resaleInventory, item] }));
  }

  function updateResaleItem(r: ResaleItem) {
    setData(d => {
      const list = [...d.resaleInventory];
      const idx = list.findIndex(x => x.id === r.id);
      if (idx >= 0) list[idx] = r;
      return { ...d, resaleInventory: list };
    });
  }

  function bulkPaste(raw: string) {
    const offers = parseBulkOffers(raw);
    setData(d => ({ ...d, offers: [...d.offers, ...offers] }));
  }

  function updateSettings(s: AppData['settings']) {
    setData(d => ({ ...d, settings: s }));
  }

  function performImport(raw: string, mode: 'merge' | 'overwrite') {
    const merged = importData(raw, mode);
    setData(merged);
  }

  function exportNow() {
    const raw = JSON.stringify(data, null, 2);
    const blob = new Blob([raw], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `coupon-data-${new Date().toISOString()}.json`;
    a.click();
  }

  return (
    <>
      <header>
        <h1 style={{ margin: 0, fontSize: '1.15rem' }}>Coupon & Resale Optimizer</h1>
        <OfflineBadge />
        <nav aria-label="Main">
          <small>
            <a href="#dashboard">Dashboard</a> | <a href="#offers">Offers</a> |{' '}
            <a href="#staples">Staples</a> | <a href="#receipts">Receipts</a> |{' '}
            <a href="#resale">Resale</a> | <a href="#settings">Settings</a> |{' '}
            <a href="#data">Data</a>
          </small>
        </nav>
      </header>
      <main>
        {view === 'dashboard' && (
          <section>
            <h2>Top Actions</h2>
            <ActionList evaluations={topActions} />
            <h3 className="hide-mobile">Quick Add Staple</h3>
            <StapleForm onAdd={addStaple} />
          </section>
        )}
        {view === 'offers' && (
          <section>
            <h2>Offers</h2>
            <OfferForm onCreate={addOffer} />
            <BulkPasteParser onBulk={bulkPaste} />
            <div className="grid" style={{ marginTop: '1rem' }}>
              {data.offers.map(o => (
                <div key={o.id} className="card">
                  <strong>{o.title}</strong> <small>({o.store})</small>
                  <div style={{ fontSize: '0.7rem' }}>
                    Type: {o.valueType} | Amount: {o.valueType === 'percent' ? `${o.valueAmount}%` : `$${o.valueAmount}`} | Base:{' '}
                    {o.basePrice ?? 'n/a'}
                  </div>
                  {o.notes && <div style={{ fontSize: '0.7rem' }}>{o.notes}</div>}
                  <button
                    className="danger"
                    style={{ marginTop: '0.5rem' }}
                    onClick={() => deleteOffer(o.id)}
                    aria-label={`Delete offer ${o.title}`}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}
        {view === 'staples' && (
          <section>
            <h2>Staples</h2>
            <StapleForm onAdd={addStaple} />
            <InventoryTable
              staples={data.staples}
              onDelete={deleteStaple}
              onUpdate={upsertStaple}
            />
          </section>
        )}
        {view === 'receipts' && (
          <section>
            <h2>Receipts</h2>
            <ReceiptEditor staples={data.staples} onAddReceipt={addReceipt} />
            <h3>Logged Lines</h3>
            <table aria-label="Receipt lines">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Store</th>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Qty</th>
                  <th>Matched</th>
                </tr>
              </thead>
              <tbody>
                {data.receipts.slice(-100).map(r => (
                  <tr key={r.id}>
                    <td>{r.date}</td>
                    <td>{r.store}</td>
                    <td>{r.name}</td>
                    <td>${r.price.toFixed(2)}</td>
                    <td>{r.qty}</td>
                    <td>{data.staples.find(s => s.id === r.matchedStapleId)?.name || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
        {view === 'resale' && (
          <section>
            <h2>Resale</h2>
            <ResaleCalculator
              staples={data.staples}
              onCreate={createResale}
              resaleItems={data.resaleInventory}
              onUpdate={updateResaleItem}
            />
            <ResaleLeaderboard items={data.resaleInventory} staples={data.staples} />
          </section>
        )}
        {view === 'settings' && (
          <section>
            <h2>Settings</h2>
            <SettingsPanel settings={data.settings} onChange={updateSettings} />
          </section>
        )}
        {view === 'data' && (
          <section>
            <h2>Data Export / Import</h2>
            <ExportImportPanel
              data={data}
              onExport={exportNow}
              onImport={(raw, mode) => performImport(raw, mode)}
            />
            <p style={{ fontSize: '0.75rem', opacity: 0.8 }}>
              Future Enhancements (not implemented): Price prediction (SMA), External API integration,
              Tag-based filtering.
            </p>
          </section>
        )}
      </main>
    </>
  );
}

export default App;