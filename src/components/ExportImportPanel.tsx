import React, { useState } from 'react';
import { AppData } from '../models/types';

interface Props {
  data: AppData;
  onExport: () => void;
  onImport: (raw: string, mode: 'merge' | 'overwrite') => void;
}

const ExportImportPanel: React.FC<Props> = ({ onExport, onImport }) => {
  const [raw, setRaw] = useState('');
  const [mode, setMode] = useState<'merge' | 'overwrite'>('merge');

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result?.toString() || '';
      setRaw(text);
    };
    reader.readAsText(file);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!raw.trim()) return;
    onImport(raw, mode);
    setRaw('');
  }

  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>Export / Import</h3>
      <button onClick={onExport}>Export JSON</button>
      <form onSubmit={submit} style={{ marginTop: '0.75rem' }}>
        <label>
          Import Mode
          <select value={mode} onChange={e => setMode(e.target.value as any)}>
            <option value="merge">Merge</option>
            <option value="overwrite">Overwrite</option>
          </select>
        </label>
        <label>
          Paste JSON
          <textarea
            rows={4}
            value={raw}
            onChange={e => setRaw(e.target.value)}
            placeholder="Paste exported JSON here or choose file."
          />
        </label>
        <label>
          Or Select File
          <input type="file" accept="application/json" onChange={handleFile} />
        </label>
        <button type="submit" style={{ marginTop: '0.5rem' }}>
          Import
        </button>
      </form>
    </div>
  );
};

export default ExportImportPanel;