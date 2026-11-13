'use client';

import { useEffect } from 'react';

// Registers the offline cache in production builds only.
export default function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker
      .register('/sw.js')
      .catch((err) => console.error('Offline support unavailable:', err));
  }, []);

  return null;
}
