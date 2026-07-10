import { createContentLoader } from 'vitepress'

import { readingTime } from './learn'

export interface LearnPost {
  url: string
  title: string
  description: string
  date: string
  author: string
  image?: string
  readingTime: string
}

declare const data: LearnPost[]
export { data }

export default createContentLoader('learn/*.md', {
  includeSrc: true,
  transform(raw): LearnPost[] {
    return raw
      .filter((page) => page.url !== '/learn/')
      .map(({ url, frontmatter, src }) => ({
        url,
        title: frontmatter.title as string,
        description: (frontmatter.description as string) ?? '',
        // YAML dates parse as UTC-midnight Date objects; normalize to
        // yyyy-MM-dd strings so sorting and UTC formatting are deterministic.
        date:
          frontmatter.date instanceof Date
            ? frontmatter.date.toISOString().slice(0, 10)
            : ((frontmatter.date as string) ?? ''),
        author: (frontmatter.author as string) ?? 'Lendwise',
        image: frontmatter.image as string | undefined,
        readingTime: readingTime(src ?? ''),
      }))
      .sort((a, b) => b.date.localeCompare(a.date))
  },
})
