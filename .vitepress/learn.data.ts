import { createContentLoader } from 'vitepress'

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

const WORDS_PER_MINUTE = 220

export default createContentLoader('learn/*.md', {
  includeSrc: true,
  transform(raw): LearnPost[] {
    return raw
      .filter((page) => page.url !== '/learn/')
      .map(({ url, frontmatter, src }) => {
        const words = (src ?? '').split(/\s+/g).length
        return {
          url,
          title: frontmatter.title as string,
          description: (frontmatter.description as string) ?? '',
          date: (frontmatter.date as string) ?? '',
          author: (frontmatter.author as string) ?? 'Lendwise',
          image: frontmatter.image as string | undefined,
          readingTime: `${Math.max(1, Math.round(words / WORDS_PER_MINUTE))} min read`,
        }
      })
      .sort((a, b) => +new Date(b.date) - +new Date(a.date))
  },
})
