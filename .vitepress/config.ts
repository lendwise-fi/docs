import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'LendWise',
  description:
    'DeFi lending yield, one view. Compare and optimize supply & borrow positions across Aave, Morpho, and Compound on 8 chains.',
  lang: 'en-US',
  cleanUrls: true,
  lastUpdated: true,

  head: [
    ['link', { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:site_name', content: 'LendWise' }],
  ],

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/logo.svg',
    // The "docs" badge next to the name is added in theme/custom.css
    siteTitle: 'LendWise',

    nav: [
      { text: 'Guide', link: '/guide/what-is-lendwise' },
      { text: 'API', link: '/api/' },
      { text: 'Research', link: '/research/' },
      { text: 'Blog', link: '/blog/' },
      { text: 'App ↗', link: 'https://lendwise.fi' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'What is LendWise', link: '/guide/what-is-lendwise' },
            { text: 'Getting started', link: '/guide/getting-started' },
          ],
        },
        {
          text: 'How it works',
          items: [
            { text: 'The optimizer', link: '/guide/optimization' },
            { text: 'Data & methodology', link: '/guide/methodology' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'GraphQL API',
          items: [
            { text: 'Overview', link: '/api/' },
            { text: 'Schema & queries', link: '/api/graphql' },
          ],
        },
      ],
      '/research/': [
        {
          text: 'Research',
          items: [{ text: 'Overview', link: '/research/' }],
        },
      ],
      '/blog/': [
        {
          text: 'Blog',
          items: [
            { text: 'All posts', link: '/blog/' },
            {
              text: 'Same asset, different yield',
              link: '/blog/same-asset-different-yield',
            },
            {
              text: 'Best USDC lending rates',
              link: '/blog/best-usdc-lending-rates',
            },
            {
              text: 'Aave vs Morpho vs Compound',
              link: '/blog/aave-vs-morpho-vs-compound',
            },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'x', link: 'https://x.com/lendwise_fi' },
      { icon: 'github', link: 'https://github.com/lendwise-fi' },
    ],

    search: { provider: 'local' },

    footer: {
      message: 'Not financial advice. DeFi lending carries smart-contract and market risk.',
      copyright: '© 2026 LendWise',
    },

    editLink: {
      pattern: 'https://github.com/lendwise-fi/docs/edit/main/:path',
      text: 'Edit this page on GitHub',
    },
  },
})
