import React from 'react';
import { Staple } from '../models/types';

interface Props {
  staples: Staple[];
  onDelete: (id: string) => void;
  onUpdate: (s: Staple) => void;
}

const InventoryTable: React.FC<Props> = ({ staples, onDelete, onUpdate }) => {
  return (
    <table aria-label="Staple inventory table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Units</th>
          <th>Last Low</th>
          <th>Interval (days)</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {staples.map(s => (
          <tr key={s.id}>
            <td>{s.name}</td>
            <td>
              <input
                aria-label={`Units on hand for ${s.name}`}
                style={{ width: '4rem' }}
                type="number"
                value={s.unitsOnHand ?? 0}
                onChange={e =>
                  onUpdate({
                    ...s,
                    unitsOnHand: parseInt(e.target.value) || 0
                  })
                }
              />
            </td>
            <td>${(s.lastLowPrice ?? 0).toFixed(2)}</td>
            <td>
              <input
                aria-label={`Consumption interval for ${s.name}`}
                style={{ width: '4rem' }}
                type="number"
                value={s.consumptionIntervalDays ?? ''}
                onChange={e =>
                  onUpdate({
                    ...s,
                    consumptionIntervalDays:
                      e.target.value === '' ? undefined : parseFloat(e.target.value) || undefined
                  })
                }
              />
            </td>
            <td>
              <button
                className="danger"
                onClick={() => onDelete(s.id)}
                aria-label={`Delete staple ${s.name}`}
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default InventoryTable;