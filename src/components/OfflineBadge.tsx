import React, { useEffect, useState } from 'react';

function OfflineBadge() {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const handler = () => setOnline(navigator.onLine);
    window.addEventListener('online', handler);
    window.addEventListener('offline', handler);
    return () => {
      window.removeEventListener('online', handler);
      window.removeEventListener('offline', handler);
    };
  }, []);
  if (online) return null;
  return (
    <div
      role="status"
      aria-label="Offline"
      style={{
        background: '#ff9800',
        color: '#000',
        fontSize: '0.6rem',
        display: 'inline-block',
        padding: '2px 6px',
        borderRadius: 4,
        marginLeft: 8
      }}
    >
      Offline
    </div>
  );
}
export default OfflineBadge;