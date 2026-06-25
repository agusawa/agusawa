import type { Metadata } from 'next'
import type { TILArticle } from './til'

const SITE_DESCRIPTION = 'Today I Learned - things picked up while building.'

export function siteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL
  if (!url) throw new Error('NEXT_PUBLIC_SITE_URL is not set')
  return url.replace(/\/$/, '')
}

export function buildMetadata(article: TILArticle): Metadata {
  const base = siteUrl()
  const url = `${base}/${article.slug}/`
  const description = article.summary ?? SITE_DESCRIPTION

  return {
    title: `${article.title} — TIL`,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      title: `${article.title} — TIL`,
      description,
      url,
      publishedTime: article.date,
    },
    twitter: {
      card: 'summary',
      title: `${article.title} — TIL`,
      description,
    },
  }
}

export function buildArticleJsonLd(article: TILArticle): object {
  const base = siteUrl()
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    datePublished: article.date,
    inLanguage: article.language === 'ID' ? 'id' : 'en',
    url: `${base}/${article.slug}/`,
  }
}
