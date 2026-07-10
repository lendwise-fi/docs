import { defineConfig } from 'vitepress'

// Minimal structural types for the markdown-it core rule below — markdown-it
// is a transitive dependency of vitepress, so its own types aren't resolvable.
interface MdToken {
  type: string
  tag: string
  content: string
  children: MdToken[] | null
  attrSet(name: string, value: string): void
}
interface MdCoreState {
  env: { frontmatter?: { image?: string }; relativePath?: string }
  src: string
  tokens: MdToken[]
  Token: new (type: string, tag: string, nesting: -1 | 0 | 1) => MdToken
}

const WORDS_PER_MINUTE = 220

/**
 * Learn posts get a Medium-style header injected right after the H1:
 * `<PostMeta>` (author, follow, read time, date, comments/share bar) followed
 * by the `image` frontmatter rendered as a cover when present. The cover is
 * emitted as regular image tokens so VitePress applies base/asset handling.
 */
function injectPostHeader(state: MdCoreState): void {
  const path = state.env.relativePath ?? ''
  if (!path.startsWith('learn/') || path === 'learn/index.md') return

  const h1Close = state.tokens.findIndex(
    (t) => t.type === 'heading_close' && t.tag === 'h1'
  )
  if (h1Close === -1) return

  const minutes = Math.max(
    1,
    Math.round(state.src.split(/\s+/g).length / WORDS_PER_MINUTE)
  )
  const meta = new state.Token('html_block', '', 0)
  meta.content = `<PostMeta reading-time="${minutes} min read" />\n`

  const injected: MdToken[] = [meta]

  const image = state.env.frontmatter?.image
  if (image) {
    const pOpen = new state.Token('paragraph_open', 'p', 1)
    pOpen.attrSet('class', 'post-cover')
    const inline = new state.Token('inline', '', 0)
    inline.content = ''
    inline.children = []
    const img = new state.Token('image', 'img', 0)
    img.attrSet('src', image)
    img.attrSet('alt', '')
    img.children = []
    img.content = ''
    inline.children.push(img)
    const pClose = new state.Token('paragraph_close', 'p', -1)
    injected.push(pOpen, inline, pClose)
  }

  state.tokens.splice(h1Close + 1, 0, ...injected)
}

// https://vitepress.dev/reference/site-config
export default defineConfig({
  markdown: {
    config(md) {
      md.core.ruler.push('learn_post_header', (state) =>
        injectPostHeader(state as unknown as MdCoreState)
      )
    },
  },

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
      { text: 'Learn', link: '/learn/' },
      { text: 'App', link: 'https://lendwise.fi' },
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
      '/learn/': [
        {
          text: 'Learn',
          items: [
            { text: 'All posts', link: '/learn/' },
            {
              text: 'Same asset, different yield',
              link: '/learn/same-asset-different-yield',
            },
            {
              text: 'Best USDC lending rates',
              link: '/learn/best-usdc-lending-rates',
            },
            {
              text: 'Aave vs Morpho vs Compound',
              link: '/learn/aave-vs-morpho-vs-compound',
            },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'x', link: 'https://x.com/lendwisefi' },
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
