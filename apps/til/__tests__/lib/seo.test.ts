const SITE_URL = 'https://example.com'

const mockArticle = {
  slug: 'learn-rust',
  title: 'Learn Rust',
  date: '2025-06-25',
  language: 'EN' as const,
  tags: ['rust'],
  content: '',
}

beforeEach(() => {
  process.env.NEXT_PUBLIC_SITE_URL = SITE_URL
})

afterEach(() => {
  delete process.env.NEXT_PUBLIC_SITE_URL
  jest.resetModules()
})

describe('siteUrl', () => {
  it('returns the configured site URL without trailing slash', async () => {
    const { siteUrl } = await import('../../src/lib/seo')
    expect(siteUrl()).toBe('https://example.com')
  })

  it('strips a trailing slash from the URL', async () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com/'
    const { siteUrl } = await import('../../src/lib/seo')
    expect(siteUrl()).toBe('https://example.com')
  })

  it('throws if NEXT_PUBLIC_SITE_URL is not set', async () => {
    delete process.env.NEXT_PUBLIC_SITE_URL
    const { siteUrl } = await import('../../src/lib/seo')
    expect(() => siteUrl()).toThrow('NEXT_PUBLIC_SITE_URL is not set')
  })
})

describe('buildMetadata', () => {
  it('builds title as "<article title> — TIL"', async () => {
    const { buildMetadata } = await import('../../src/lib/seo')
    const meta = buildMetadata(mockArticle)
    expect(meta.title).toBe('Learn Rust — TIL')
  })

  it('uses article summary as description', async () => {
    const { buildMetadata } = await import('../../src/lib/seo')
    const meta = buildMetadata({ ...mockArticle, summary: 'A quick summary.' })
    expect(meta.description).toBe('A quick summary.')
  })

  it('falls back to site description when summary is absent', async () => {
    const { buildMetadata } = await import('../../src/lib/seo')
    const meta = buildMetadata(mockArticle)
    expect(meta.description).toBe('Today I Learned - things picked up while building.')
  })

  it('sets canonical URL from slug', async () => {
    const { buildMetadata } = await import('../../src/lib/seo')
    const meta = buildMetadata(mockArticle)
    expect(meta.alternates?.canonical).toBe('https://example.com/learn-rust/')
  })

  it('sets openGraph type to article with publishedTime', async () => {
    const { buildMetadata } = await import('../../src/lib/seo')
    const meta = buildMetadata(mockArticle)
    const og = meta.openGraph as Record<string, unknown>
    expect(og?.type).toBe('article')
    expect(og?.publishedTime).toBe('2025-06-25')
    expect(og?.url).toBe('https://example.com/learn-rust/')
  })

  it('sets twitter summary card', async () => {
    const { buildMetadata } = await import('../../src/lib/seo')
    const meta = buildMetadata(mockArticle)
    expect(meta.twitter?.card).toBe('summary')
  })
})

describe('buildArticleJsonLd', () => {
  it('returns correct JSON-LD Article schema for an EN article', async () => {
    const { buildArticleJsonLd } = await import('../../src/lib/seo')
    const ld = buildArticleJsonLd(mockArticle) as Record<string, unknown>
    expect(ld['@context']).toBe('https://schema.org')
    expect(ld['@type']).toBe('Article')
    expect(ld.headline).toBe('Learn Rust')
    expect(ld.datePublished).toBe('2025-06-25')
    expect(ld.inLanguage).toBe('en')
    expect(ld.url).toBe('https://example.com/learn-rust/')
  })

  it('sets inLanguage to "id" for ID articles', async () => {
    const { buildArticleJsonLd } = await import('../../src/lib/seo')
    const ld = buildArticleJsonLd({ ...mockArticle, language: 'ID' }) as Record<string, unknown>
    expect(ld.inLanguage).toBe('id')
  })
})
