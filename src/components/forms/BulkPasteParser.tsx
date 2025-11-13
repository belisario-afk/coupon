import React, { useState } from 'react';

interface Props {
  onBulk: (raw: string) => void;
}

const BulkPasteParser: React.FC<Props> = ({ onBulk }) => {
  const [raw, setRaw] = useState('');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!raw.trim()) return;
    onBulk(raw);
    setRaw('');
  }

  return (
    <form onSubmit={submit} className="card" aria-label="Bulk offer paste form">
      <h3 style={{ marginTop: 0 }}>Bulk Paste Parser (Advanced)</h3>
      <p style={{ fontSize: '0.65rem' }}>
        Paste lines (one per offer set). Example:
        <br />
        Target | Tide 64-load | $14.99 base | -$3 manufacturer | 10% Circle | Ibotta $1.25 | Ends
        2025-11-30
      </p>
      <label>
        Raw Lines
        <textarea
          rows={4}
          value={raw}
          onChange={e => setRaw(e.target.value)}
          placeholder="Store | Item | $price base | -$discount | 10% Promo | Ibotta $1.25 | Ends YYYY-MM-DD"
        />
      </label>
      <button type="submit">Parse & Add Offers</button>
    </form>
  );
};

export default BulkPasteParser;