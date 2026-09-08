import { defineConfig } from 'astro/config'
import node from '@astrojs/node'

export default defineConfig({
  output: 'hybrid',
  adapter: node({
    mode: 'standalone'
  }),
  redirects: {
    '/tools': '/projects#tools',
    '/games': '/projects#games',
    '/settings': '/accessibility',
    '/projects/fractal': '/projects/fanctal',
    '/projects/cantor-sets': '/projects/cantor-pairing',
    '/projects/chi-squared': '/projects/distribution-functions',
    '/projects/t-student': '/projects/distribution-functions',
    '/projects/normal-distribution': '/projects/distribution-functions',
  },
  vite: {
    server: {
      headers: {
        'Cross-Origin-Opener-Policy': 'unsafe-none',
      },
    }, 
  },
})
