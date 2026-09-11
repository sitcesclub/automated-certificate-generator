import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'CES Automated Certificate Generator',
    short_name: 'CES CertGen',
    description: 'Offline-First Automated Certificate Generator for Computer Engineers\' Society',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: '#1e293b',
    icons: [
      {
        src: '/web-app-manifest-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/web-app-manifest-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/favicon-96x96.png',
        sizes: '96x96',
        type: 'image/png',
      },
    ],
  };
}
