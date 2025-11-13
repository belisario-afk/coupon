import React, { useState } from 'react';
import { Staple, Store } from '../models/types';
import { createReceiptLine } from '../logic/storage';
import { fuzzyMatch } from '../logic/utils';

interface Props {
  staples: Staple[];
  onAddReceipt: (lines: ReturnType<typeof createReceiptLine>[]) => void;
}

const ReceiptEditor: React.FC<Props> = ({ staples, onAddReceipt }) => {
  const [store, setStore] = useState<Store>('Target');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [items, setItems] = useState<
    { name: string; price: string; qty: string; matched?: string }[]
  >([{ name: '', price: '', qty: '1' }]);

  function addRow() {
    setItems([...items, { name: '', price: '', qty: '1' }]);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const lines = items
      .filter(i => i.name && i.price)
      .map(i => {
        const price = parseFloat(i.price) || 0;
        const qty = parseInt(i.qty) || 1;
        const match = fuzzyMatch(
          i.name,
          staples.map(s => s.name)
        );
        const stapleId = staples.find(s => s.name === match)?.id;
        return createReceiptLine({
          date,
          store,
          name: i.name,
          price,
          qty,
          matchedStapleId: stapleId
        });
      });
    if (lines.length) onAddReceipt(lines);
    setItems([{ name: '', price: '', qty: '1' }]);
  }

  return (
    <form onSubmit={submit} className="card" aria-label="Receipt entry form">
      <h3 style={{ marginTop: 0 }}>Log Receipt</h3>
      <label>
        Date
        <input type="date" value={date} onChange={e => setDate(e.target.value)} />
      </label>
      <label>
        Store
        <select value={store} onChange={e => setStore(e.target.value as Store)}>
          <option>Target</option>
          <option>Walmart</option>
        </select>
      </label>
      <div style={{ marginTop: '0.5rem' }}>
        {items.map((row, idx) => (
          <div
            key={idx}
            style={{ display: 'grid', gap: '0.5rem', gridTemplateColumns: '2fr 1fr 1fr' }}
          >
            <input
              aria-label={`Item name ${idx + 1}`}
              placeholder="Item name"
              value={row.name}
              onChange={e => {
                const list = [...items];
                list[idx].name = e.target.value;
                setItems(list);
              }}
            />
            <input
              aria-label={`Item price ${idx + 1}`}
              placeholder="Price"
              type="number"
              step="0.01"
              value={row.price}
              onChange={e => {
                const list = [...items];
                list[idx].price = e.target.value;
                setItems(list);
              }}
            />
            <input
              aria-label={`Item quantity ${idx + 1}`}
              placeholder="Qty"
              type="number"
              value={row.qty}
              onChange={e => {
                const list = [...items];
                list[idx].qty = e.target.value;
                setItems(list);
              }}
            />
          </div>
        ))}
      </div>
      <div style={{ marginTop: '0.5rem' }}>
        <button type="button" className="secondary" onClick={addRow}>
          + Row
        </button>
        <button type="submit" style={{ marginLeft: '0.5rem' }}>
          Save Receipt
        </button>
      </div>
    </form>
  );
};

export default ReceiptEditor;