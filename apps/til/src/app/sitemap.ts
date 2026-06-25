import type { MetadataRoute } from 'next'
import { getAllArticles } from '@/lib/til'
import { siteUrl } from '@/lib/seo'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl()
  const articles = getAllArticles()

  return [
    { url: `${base}/`, lastModified: new Date() },
    ...articles.map((article) => ({
      url: `${base}/${article.slug}/`,
      lastModified: new Date(article.date),
    })),
  ]
}
