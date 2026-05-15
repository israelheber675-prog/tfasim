import type { NextConfig } from 'next'
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
      handler: 'NetworkFirst',
      options: { cacheName: 'supabase-api', networkTimeoutSeconds: 10 },
    },
    {
      urlPattern: /\/_next\/static\/.*/i,
      handler: 'CacheFirst',
      options: { cacheName: 'static-assets' },
    },
    {
      urlPattern: /\/_next\/image\?.*/i,
      handler: 'StaleWhileRevalidate',
      options: { cacheName: 'image-cache' },
    },
  ],
})

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {},
  // Allow @react-pdf/renderer to run in API routes (uses canvas/fontkit)
  serverExternalPackages: ['@react-pdf/renderer', 'canvas', 'nodemailer'],
}

export default withPWA(nextConfig)
