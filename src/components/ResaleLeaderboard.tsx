import React from 'react';
import { ResaleItem, Staple } from '../models/types';

interface Props {
  items: ResaleItem[];
  staples: Staple[];
}

const ResaleLeaderboard: React.FC<Props> = ({ items, staples }) => {
  const sorted = [...items].sort(
    (a, b) => b.projectedProfit - a.projectedProfit
  ).slice(0, 10);

  if (sorted.length === 0) return <p>No resale items yet.</p>;

  return (
    <div className="card" aria-label="Resale profit leaderboard">
      <h3 style={{ marginTop: 0 }}>Profit Leaderboard</h3>
      <table>
        <thead>
          <tr>
            <th>Staple</th>
            <th>Profit</th>
            <th>Sale Price</th>
            <th>Overstock?</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(i => {
            const staple = staples.find(s => s.id === i.stapleId);
            const units = staple?.unitsOnHand ?? 0;
            const interval = staple?.consumptionIntervalDays ?? 30;
            const overstock = units > 3 * (30 / interval); // heuristic
            return (
              <tr key={i.id}>
                <td>{staple?.name || i.stapleId}</td>
                <td>${i.projectedProfit.toFixed(2)}</td>
                <td>${i.expectedSalePrice.toFixed(2)}</td>
                <td style={{ color: overstock ? '#ff5252' : '#4caf50' }}>
                  {overstock ? 'Yes' : 'No'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ResaleLeaderboard;