'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('CES CertGen ServiceWorker registered successfully with scope:', registration.scope);
          })
          .catch((error) => {
            console.warn('CES CertGen ServiceWorker registration failed:', error);
          });
      });
    }
  }, []);

  return null;
}
