import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Lendwise',
  description:
    'DeFi lending yield, one view. Compare and optimize supply & borrow positions across Aave, Morpho, and Compound on 8 chains.',
  lang: 'en-US',
  // Served under https://lendwise.fi/docs via a rewrite in the dashboard project
  base: '/docs/',
  cleanUrls: true,
  lastUpdated: true,
  srcExclude: ['README.md'],

  sitemap: {
    hostname: 'https://lendwise.fi/docs/',
  },

  // Canonical URLs point to lendwise.fi so the *.vercel.app host never competes in search
  transformPageData(pageData) {
    const canonicalUrl = `https://lendwise.fi/docs/${pageData.relativePath}`
      .replace(/index\.md$/, '')
      .replace(/\.md$/, '')
    pageData.frontmatter.head ??= []
    pageData.frontmatter.head.push(['link', { rel: 'canonical', href: canonicalUrl }])
  },

  head: [
    ['link', { rel: 'icon', href: '/docs/favicon.svg', type: 'image/svg+xml' }],
    // Brand font for the navbar title — same Google Font as the web app logo
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    [
      'link',
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Zalando+Sans+SemiExpanded&display=swap',
      },
    ],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:site_name', content: 'Lendwise' }],
  ],

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/logo.svg',
    // The "docs" badge next to the name is added in theme/custom.css
    siteTitle: 'Lendwise',

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
            { text: 'What is Lendwise', link: '/guide/what-is-lendwise' },
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
      copyright: '© 2026 Lendwise',
    },

    editLink: {
      pattern: 'https://github.com/lendwise-fi/docs/edit/main/:path',
      text: 'Edit this page on GitHub',
    },
  },
})
