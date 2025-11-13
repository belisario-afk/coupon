import React, { useState } from 'react';
import { OfferValueType, Store } from '../../models/types';
import { createOffer } from '../../logic/storage';

interface Props {
  onCreate: (o: ReturnType<typeof createOffer>) => void;
}

const OfferForm: React.FC<Props> = ({ onCreate }) => {
  const [store, setStore] = useState<Store>('Target');
  const [title, setTitle] = useState('');
  const [valueType, setValueType] = useState<OfferValueType>('flat');
  const [valueAmount, setValueAmount] = useState(0);
  const [basePrice, setBasePrice] = useState<number | undefined>(undefined);
  const [confidence, setConfidence] = useState(0.6);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title) return;
    onCreate(
      createOffer({
        store,
        title,
        productTags: title.toLowerCase().split(/\s+/),
        valueType,
        valueAmount,
        basePrice,
        confidence
      })
    );
    setTitle('');
    setValueAmount(0);
  }

  return (
    <form onSubmit={submit} className="card" aria-label="Manual add offer form">
      <h3 style={{ marginTop: 0 }}>Add Offer</h3>
      <label>
        Store
        <select value={store} onChange={e => setStore(e.target.value as Store)}>
          <option>Target</option>
          <option>Walmart</option>
        </select>
      </label>
      <label>
        Title
        <input
          required
            aria-required="true"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
      </label>
      <label>
        Value Type
        <select
          value={valueType}
          onChange={e => setValueType(e.target.value as OfferValueType)}
        >
          <option value="flat">Flat</option>
          <option value="percent">Percent</option>
          <option value="gift_card">Gift Card</option>
          <option value="threshold">Threshold</option>
          <option value="rebate">Rebate</option>
        </select>
      </label>
      <label>
        Value Amount ({valueType === 'percent' ? '%' : '$'})
        <input
          type="number"
          step="0.01"
          value={valueAmount}
          onChange={e => setValueAmount(parseFloat(e.target.value) || 0)}
        />
      </label>
      <label>
        Base Price
        <input
          type="number"
          step="0.01"
          value={basePrice ?? ''}
          onChange={e =>
            setBasePrice(
              e.target.value === '' ? undefined : parseFloat(e.target.value) || 0
            )
          }
        />
      </label>
      <label>
        Confidence (0-1)
        <input
          type="number"
          step="0.05"
          min={0}
          max={1}
          value={confidence}
          onChange={e => setConfidence(parseFloat(e.target.value) || 0.6)}
        />
      </label>
      <button type="submit">Add Offer</button>
    </form>
  );
};

export default OfferForm;