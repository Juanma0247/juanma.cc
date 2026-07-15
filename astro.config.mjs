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
  },
  vite: {
    server: {
      headers: {
        'Cross-Origin-Opener-Policy': 'unsafe-none',
      },
    }, 
  },
})
