import React from 'react';
import { UserSettings } from '../models/types';

interface Props {
  settings: UserSettings;
  onChange: (s: UserSettings) => void;
}

const SettingsPanel: React.FC<Props> = ({ settings, onChange }) => {
  function update<K extends keyof UserSettings>(key: K, value: UserSettings[K]) {
    onChange({ ...settings, [key]: value });
  }

  function updateTimeCost(type: keyof UserSettings['timeCostByType'], value: number) {
    onChange({
      ...settings,
      timeCostByType: { ...settings.timeCostByType, [type]: value }
    });
  }

  return (
    <form className="card" aria-label="Settings panel">
      <h3 style={{ marginTop: 0 }}>Deal Logic Settings</h3>
      <label>
        WAIT Coverage Days
        <input
          type="number"
          value={settings.waitCoverageDays}
          onChange={e => update('waitCoverageDays', parseInt(e.target.value))}
        />
      </label>
      <label>
        WAIT Price Multiplier
        <input
          type="number"
          step="0.01"
            value={settings.waitPriceMultiplier}
          onChange={e =>
            update('waitPriceMultiplier', parseFloat(e.target.value) || 1.1)
          }
        />
      </label>
      <label>
        Minimum Raw Savings ($)
        <input
          type="number"
          step="0.5"
          value={settings.minRawSavings}
          onChange={e =>
            update('minRawSavings', parseFloat(e.target.value) || 3)
          }
        />
      </label>
      <label>
        Urgency Low Coverage Ratio
        <input
          type="number"
          step="0.05"
          value={settings.urgencyLowCoverageRatio}
          onChange={e =>
            update(
              'urgencyLowCoverageRatio',
              parseFloat(e.target.value) || settings.urgencyLowCoverageRatio
            )
          }
        />
      </label>
      <fieldset style={{ marginTop: '0.75rem' }}>
        <legend style={{ fontSize: '0.85rem' }}>Time Cost (minutes)</legend>
        {Object.entries(settings.timeCostByType).map(([k, v]) => (
          <label key={k}>
            {k}
            <input
              type="number"
              step="0.1"
              value={v}
              onChange={e =>
                updateTimeCost(
                  k as keyof UserSettings['timeCostByType'],
                  parseFloat(e.target.value) || 0
                )
              }
            />
          </label>
        ))}
      </fieldset>
    </form>
  );
};

export default SettingsPanel;