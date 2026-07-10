<script setup lang="ts">
import { withBase } from 'vitepress'

import { data } from '../../learn.data'

const posts = data.slice(0, 4)

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
</script>

<template>
  <section class="home-posts">
    <div class="home-posts-container">
    <div class="home-posts-head">
      <h2>Lendwise Learn</h2>
      <a class="home-posts-all" :href="withBase('/learn/')">All posts →</a>
    </div>
    <div class="home-posts-grid">
      <a
        v-for="post in posts"
        :key="post.url"
        class="home-post-card"
        :href="withBase(post.url)"
      >
        <div class="home-post-thumb">
          <img v-if="post.image" :src="withBase(post.image)" alt="" />
          <div v-else class="home-post-thumb-fallback">
            <img :src="withBase('/logo.svg')" alt="" />
          </div>
        </div>
        <div class="home-post-body">
          <h3 class="home-post-title">{{ post.title }}</h3>
          <p class="home-post-desc">{{ post.description }}</p>
          <span class="home-post-date">
            {{ formatDate(post.date) }} · {{ post.readingTime }}
          </span>
        </div>
      </a>
    </div>
    </div>
  </section>
</template>

<style scoped>
/* VPHome already wraps markdown content in a padded 1152px container that
   lines up with the features grid — no extra gutter or max-width here. */
.home-posts {
  margin-top: 24px;
  padding-bottom: 64px;
}

.home-posts-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 20px;
}

.home-posts-head h2 {
  margin: 0;
  border: none;
  padding: 0;
  font-size: 20px;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.home-posts-all {
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-brand-1);
  text-decoration: none;
}

.home-posts-all:hover {
  color: var(--vp-c-brand-2);
}

.home-posts-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

@media (max-width: 960px) {
  .home-posts-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 560px) {
  .home-posts-grid {
    grid-template-columns: 1fr;
  }
}

.home-post-card {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  transition:
    border-color 0.25s,
    transform 0.25s;
}

.home-post-card:hover {
  border-color: var(--vp-c-brand-1);
  transform: translateY(-2px);
}

.home-post-thumb {
  aspect-ratio: 1200 / 630;
}

.home-post-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.home-post-thumb-fallback {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  background: linear-gradient(
    135deg,
    var(--lw-brand-deep, #3d1414) 0%,
    var(--lw-primary, #762b2b) 100%
  );
}

.home-post-thumb-fallback img {
  width: 56px;
  height: auto;
}

.home-post-body {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 16px;
}

.home-post-title {
  margin: 0 0 8px;
  font-size: 15px;
  font-weight: 600;
  line-height: 1.35;
  color: var(--vp-c-text-1);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.home-post-desc {
  margin: 0 0 14px;
  font-size: 13px;
  line-height: 1.5;
  color: var(--vp-c-text-2);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.home-post-date {
  margin-top: auto;
  font-size: 12px;
  color: var(--vp-c-text-3);
}
</style>
