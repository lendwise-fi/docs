import { h } from 'vue'

import { useData } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'

import LearnIndex from './components/LearnIndex.vue'
import GiscusComments from './components/GiscusComments.vue'
import HomePosts from './components/HomePosts.vue'
import PostMeta from './components/PostMeta.vue'
import './custom.css'

function Layout() {
  const { page, frontmatter } = useData()
  const isLearnPost =
    page.value.relativePath.startsWith('learn/') &&
    page.value.relativePath !== 'learn/index.md' &&
    frontmatter.value.comments !== false

  return h(DefaultTheme.Layout, null, {
    'doc-after': () => (isLearnPost ? h(GiscusComments) : null),
  })
}

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component('LearnIndex', LearnIndex)
    app.component('PostMeta', PostMeta)
    app.component('HomePosts', HomePosts)
  },
} satisfies Theme
