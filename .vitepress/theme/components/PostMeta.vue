<script setup lang="ts">
import { ref } from 'vue'

import { useData, withBase } from 'vitepress'

defineProps<{ readingTime: string }>()

const { frontmatter } = useData()
const copied = ref(false)

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function shareOnX(): void {
  const url = new URL('https://x.com/intent/post')
  url.searchParams.set('text', document.title)
  url.searchParams.set('url', location.href)
  window.open(url.toString(), '_blank', 'noopener')
}

async function copyLink(): Promise<void> {
  await navigator.clipboard.writeText(location.href)
  copied.value = true
  setTimeout(() => (copied.value = false), 2000)
}
</script>

<template>
  <div class="post-meta">
    <div class="post-meta-author">
      <img class="post-meta-avatar" :src="withBase('/logo.svg')" alt="" />
      <span class="post-meta-name">{{ frontmatter.author ?? 'Lendwise' }}</span>
      <a
        class="post-meta-follow"
        href="https://x.com/lendwisefi"
        target="_blank"
        rel="noopener noreferrer"
      >
        Follow
      </a>
      <span class="post-meta-sub">
        {{ readingTime }}
        <template v-if="frontmatter.date">
          · {{ formatDate(frontmatter.date) }}
        </template>
      </span>
    </div>

    <div class="post-meta-bar">
      <a class="post-meta-action" href="#comments">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
        Comments
      </a>
      <span class="post-meta-spacer" />
      <button class="post-meta-action" type="button" @click="shareOnX">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        Share
      </button>
      <button class="post-meta-action" type="button" @click="copyLink">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
        {{ copied ? 'Copied!' : 'Copy link' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.post-meta {
  margin: 20px 0 8px;
}

.post-meta-author {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
}

.post-meta-avatar {
  height: 26px;
  width: auto;
}

.post-meta-name {
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.post-meta-follow {
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  padding: 3px 14px;
  font-size: 13px;
  font-weight: 500;
  color: var(--vp-c-text-1);
  text-decoration: none;
  transition:
    border-color 0.2s,
    color 0.2s;
}

.post-meta-follow:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.post-meta-sub {
  color: var(--vp-c-text-2);
  font-size: 13.5px;
}

.post-meta-bar {
  display: flex;
  align-items: center;
  gap: 22px;
  margin-top: 18px;
  border-top: 1px solid var(--vp-c-divider);
  border-bottom: 1px solid var(--vp-c-divider);
  padding: 10px 2px;
}

.post-meta-spacer {
  flex: 1;
}

.post-meta-action {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  background: none;
  border: none;
  padding: 0;
  font-size: 13.5px;
  font-family: inherit;
  color: var(--vp-c-text-2);
  text-decoration: none;
  cursor: pointer;
  transition: color 0.2s;
}

.post-meta-action:hover {
  color: var(--vp-c-text-1);
}

.post-meta-action svg {
  width: 17px;
  height: 17px;
}
</style>
