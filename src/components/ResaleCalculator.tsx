import React, { useState } from 'react';
import { ResaleItem, Staple } from '../models/types';

interface Props {
  staples: Staple[];
  resaleItems: ResaleItem[];
  onCreate: (stapleId: string, cost: number, markupPercent: number) => void;
  onUpdate: (item: ResaleItem) => void;
}

const ResaleCalculator: React.FC<Props> = ({
  staples,
  resaleItems,
  onCreate,
  onUpdate
}) => {
  const [stapleId, setStapleId] = useState('');
  const [cost, setCost] = useState('');
  const [markup, setMarkup] = useState('15');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!stapleId || !cost) return;
    onCreate(stapleId, parseFloat(cost), parseFloat(markup));
    setCost('');
  }

  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>Resale Inventory</h3>
      <form onSubmit={submit} aria-label="Resale item create form">
        <label>
          Staple
          <select
            value={stapleId}
            onChange={e => setStapleId(e.target.value)}
            required
          >
            <option value="">Select</option>
            {staples.map(s => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Acquisition Cost
          <input
            type="number"
            step="0.01"
            value={cost}
            onChange={e => setCost(e.target.value)}
            required
          />
        </label>
        <label>
          Markup %
          <input
            type="number"
            step="1"
            value={markup}
            onChange={e => setMarkup(e.target.value)}
            required
          />
        </label>
        <button type="submit" style={{ marginTop: '0.5rem' }}>
          Add Resale Item
        </button>
      </form>
      <h4>Items</h4>
      <table>
        <thead>
          <tr>
            <th>Staple</th>
            <th>Cost</th>
            <th>Expected</th>
            <th>Profit</th>
            <th>Sold</th>
            <th>Revenue</th>
          </tr>
        </thead>
        <tbody>
          {resaleItems.map(r => {
            const staple = staples.find(s => s.id === r.stapleId);
            return (
              <tr key={r.id}>
                <td>{staple?.name || r.stapleId}</td>
                <td>${r.acquiredUnitCost.toFixed(2)}</td>
                <td>${r.expectedSalePrice.toFixed(2)}</td>
                <td>${r.projectedProfit.toFixed(2)}</td>
                <td>
                  <input
                    style={{ width: '3rem' }}
                    type="number"
                    value={r.soldUnits}
                    onChange={e =>
                      onUpdate({
                        ...r,
                        soldUnits: parseInt(e.target.value) || 0
                      })
                    }
                  />
                </td>
                <td>
                  <input
                    style={{ width: '5rem' }}
                    type="number"
                    step="0.01"
                    value={r.revenueCollected}
                    onChange={e =>
                      onUpdate({
                        ...r,
                        revenueCollected: parseFloat(e.target.value) || 0
                      })
                    }
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ResaleCalculator;