import React, { useState } from 'react';

interface Props {
  onAdd: (name: string) => void;
}

const StapleForm: React.FC<Props> = ({ onAdd }) => {
  const [name, setName] = useState('');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd(name.trim());
    setName('');
  }

  return (
    <form onSubmit={submit} aria-label="Add staple form">
      <label>
        New Staple
        <input
          required
          aria-required="true"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g., Tide Pods"
        />
      </label>
      <button type="submit" style={{ marginTop: '0.5rem' }}>
        Add Staple
      </button>
    </form>
  );
};

export default StapleForm;