<script setup lang="ts">
import { withBase } from 'vitepress'

import { data as posts } from '../../learn.data'

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
</script>

<template>
  <div class="learn-index">
    <article v-for="post in posts" :key="post.url" class="learn-card">
      <a class="learn-card-link" :href="withBase(post.url)">
        <div class="learn-card-body">
          <div class="learn-card-meta">
            <img class="learn-card-avatar" :src="withBase('/logo.svg')" alt="" />
            <span class="learn-card-author">{{ post.author }}</span>
            <span class="learn-card-dot">·</span>
            <span>{{ formatDate(post.date) }}</span>
          </div>
          <h2 class="learn-card-title">{{ post.title }}</h2>
          <p class="learn-card-excerpt">{{ post.description }}</p>
          <div class="learn-card-footer">{{ post.readingTime }}</div>
        </div>
        <div class="learn-card-thumb">
          <img v-if="post.image" :src="withBase(post.image)" alt="" />
          <div v-else class="learn-card-thumb-fallback">
            <img :src="withBase('/logo.svg')" alt="" />
          </div>
        </div>
      </a>
    </article>
  </div>
</template>

<style scoped>
.learn-index {
  display: flex;
  flex-direction: column;
  margin-top: 8px;
}

.learn-card + .learn-card {
  border-top: 1px solid var(--vp-c-divider);
}

.learn-card-link {
  display: flex;
  align-items: center;
  gap: 40px;
  padding: 28px 0;
  color: inherit;
  text-decoration: none;
}

.learn-card-body {
  flex: 1;
  min-width: 0;
}

.learn-card-meta {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
  color: var(--vp-c-text-2);
}

.learn-card-avatar {
  height: 20px;
  width: auto;
}

.learn-card-author {
  color: var(--vp-c-text-1);
  font-weight: 500;
}

.learn-card-dot {
  color: var(--vp-c-text-3);
}

.learn-card-title {
  margin: 10px 0 6px;
  border: none;
  padding: 0;
  font-size: 21px;
  font-weight: 700;
  line-height: 1.25;
  letter-spacing: -0.01em;
  color: var(--vp-c-text-1);
  transition: color 0.2s;
}

.learn-card-link:hover .learn-card-title {
  color: var(--vp-c-brand-1);
}

.learn-card-excerpt {
  margin: 0;
  font-size: 15px;
  line-height: 1.55;
  color: var(--vp-c-text-2);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.learn-card-footer {
  margin-top: 14px;
  font-size: 12.5px;
  color: var(--vp-c-text-3);
}

.learn-card-thumb {
  flex-shrink: 0;
  width: 170px;
  height: 112px;
  border-radius: 4px;
  overflow: hidden;
}

.learn-card-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.learn-card-thumb-fallback {
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

.learn-card-thumb-fallback img {
  width: 72px;
  height: auto;
  object-fit: contain;
}

@media (max-width: 560px) {
  .learn-card-link {
    gap: 20px;
  }

  .learn-card-thumb {
    width: 100px;
    height: 70px;
  }

  .learn-card-title {
    font-size: 17px;
  }

  .learn-card-excerpt {
    display: none;
  }
}
</style>
