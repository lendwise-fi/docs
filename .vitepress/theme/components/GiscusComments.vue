<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

import { useData } from 'vitepress'

const { isDark } = useData()
const container = ref<HTMLElement | null>(null)

function giscusTheme(dark: boolean): string {
  return dark ? 'dark' : 'light'
}

onMounted(() => {
  const script = document.createElement('script')
  script.src = 'https://giscus.app/client.js'
  script.async = true
  script.crossOrigin = 'anonymous'
  Object.entries({
    'data-repo': 'lendwise-fi/docs',
    'data-repo-id': 'R_kgDOTRSMNQ',
    'data-category': 'Announcements',
    'data-category-id': 'DIC_kwDOTRSMNc4DA2to',
    'data-mapping': 'pathname',
    'data-strict': '1',
    'data-reactions-enabled': '1',
    'data-emit-metadata': '0',
    'data-input-position': 'top',
    'data-theme': giscusTheme(isDark.value),
    'data-lang': 'en',
  }).forEach(([key, value]) => script.setAttribute(key, value))
  container.value?.appendChild(script)
})

// Keep the giscus iframe theme in sync with the VitePress theme toggle.
watch(isDark, (dark) => {
  const iframe = container.value?.querySelector<HTMLIFrameElement>(
    'iframe.giscus-frame'
  )
  iframe?.contentWindow?.postMessage(
    { giscus: { setConfig: { theme: giscusTheme(dark) } } },
    'https://giscus.app'
  )
})
</script>

<template>
  <div id="comments" ref="container" class="giscus-comments" />
</template>

<style scoped>
.giscus-comments {
  margin-top: 48px;
  border-top: 1px solid var(--vp-c-divider);
  padding-top: 32px;
}
</style>
