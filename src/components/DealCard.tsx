import React from 'react';
import { DealEvaluation } from '../models/types';

interface Props {
  eval: DealEvaluation;
}

const DealCard: React.FC<Props> = ({ eval: ev }) => {
  return (
    <div
      className={`card ${ev.recommendation === 'BUY' ? 'buy' : 'wait'}`}
      role="article"
      aria-label={`Deal for ${ev.staple.name}`}
    >
      <strong>{ev.staple.name}</strong> <small>{ev.offer.store}</small>
      <div style={{ fontSize: '0.7rem', marginTop: 4 }}>
        Net: ${ev.netEffectiveCost.toFixed(2)} | Savings: ${ev.rawSavings.toFixed(2)} (
        {ev.savingsPercent.toFixed(1)}%) | Score: {ev.valueScore.toFixed(2)}
      </div>
      <div
        style={{
          fontSize: '0.7rem',
          marginTop: 2,
          fontWeight: 600,
          color: ev.recommendation === 'BUY' ? '#4caf50' : '#ff5252'
        }}
      >
        {ev.recommendation}
      </div>
      <div className="badges" aria-label="Rationale badges">
        {ev.rationale.map(r => (
          <span key={r} className="badge">
            {r}
          </span>
        ))}
      </div>
    </div>
  );
};

export default DealCard;