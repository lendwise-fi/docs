/**
 * Shared helpers for the Learn section. Kept dependency-free (no Node
 * imports) so it can be imported from config.ts, learn.data.ts, and Vue
 * theme components alike.
 */

export const SITE_URL = 'https://lendwise.fi/docs'

export const WORDS_PER_MINUTE = 220

/** A learn post is any page under learn/ except the section index. */
export function isLearnPost(relativePath: string): boolean {
  return relativePath.startsWith('learn/') && relativePath !== 'learn/index.md'
}

/**
 * Short display form of a post title (sidebar labels, og:title): text before
 * the first colon, trailing parenthetical stripped. Posts can override it
 * with the optional `titleShort` frontmatter field.
 */
export function shortTitle(title: string): string {
  return title
    .split(':')[0]
    .replace(/\s*\([^)]*\)\s*$/, '')
    .trim()
}

export function readingTime(src: string): string {
  const words = src.split(/\s+/g).length
  return `${Math.max(1, Math.round(words / WORDS_PER_MINUTE))} min read`
}

/**
 * Post dates are date-only values (yyyy-MM-dd) parsed as UTC midnight, so
 * they must also be formatted in UTC — otherwise visitors west of UTC see
 * the previous day (and hydration disagrees with the UTC-built SSR HTML).
 */
export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
}
