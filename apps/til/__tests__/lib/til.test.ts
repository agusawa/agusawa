import fs from 'fs'
import os from 'os'
import path from 'path'

let tmpDir: string

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'til-test-'))
  process.env.TIL_CONTENT_DIR = tmpDir
})

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true })
  delete process.env.TIL_CONTENT_DIR
  jest.resetModules()
})

function writeArticle(filename: string, content: string) {
  fs.writeFileSync(path.join(tmpDir, filename), content, 'utf-8')
}

describe('getAllArticles', () => {
  it('returns articles sorted by date descending', async () => {
    writeArticle('2025-01-01-first.md', `---
title: "First"
date: "2025-01-01"
language: "ID"
tags: ["tag-a"]
---
Body A.`)
    writeArticle('2025-06-25-second.md', `---
title: "Second"
date: "2025-06-25"
language: "EN"
tags: ["tag-b"]
summary: "A summary"
---
Body B.`)

    const { getAllArticles } = await import('../../src/lib/til')
    const articles = getAllArticles()
    expect(articles).toHaveLength(2)
    expect(articles[0].slug).toBe('second')
    expect(articles[1].slug).toBe('first')
  })

  it('skips files with missing required frontmatter', async () => {
    writeArticle('2025-01-01-bad.md', `---
title: "Missing fields"
---
Body.`)
    writeArticle('2025-06-25-good.md', `---
title: "Good"
date: "2025-06-25"
language: "EN"
tags: ["ok"]
---
Body.`)

    const { getAllArticles } = await import('../../src/lib/til')
    const articles = getAllArticles()
    expect(articles).toHaveLength(1)
    expect(articles[0].slug).toBe('good')
  })
})

describe('getArticleBySlug', () => {
  it('returns the article matching the slug', async () => {
    writeArticle('2025-06-25-docker-multi-stage-build.md', `---
title: "Docker"
date: "2025-06-25"
language: "EN"
tags: ["docker"]
---
Body.`)

    const { getArticleBySlug } = await import('../../src/lib/til')
    const article = getArticleBySlug('docker-multi-stage-build')
    expect(article).not.toBeNull()
    expect(article!.title).toBe('Docker')
  })

  it('returns null for unknown slug', async () => {
    const { getArticleBySlug } = await import('../../src/lib/til')
    expect(getArticleBySlug('does-not-exist')).toBeNull()
  })
})

describe('getAllTags', () => {
  it('returns unique tags sorted alphabetically', async () => {
    writeArticle('2025-01-01-a.md', `---
title: "A"
date: "2025-01-01"
language: "EN"
tags: ["zebra", "apple"]
---
Body.`)
    writeArticle('2025-02-01-b.md', `---
title: "B"
date: "2025-02-01"
language: "EN"
tags: ["apple", "mango"]
---
Body.`)

    const { getAllTags } = await import('../../src/lib/til')
    expect(getAllTags()).toEqual(['apple', 'mango', 'zebra'])
  })
})

describe('getAllSlugs', () => {
  it('returns all slugs', async () => {
    writeArticle('2025-01-01-alpha.md', `---
title: "Alpha"
date: "2025-01-01"
language: "EN"
tags: ["x"]
---
Body.`)
    writeArticle('2025-02-01-beta.md', `---
title: "Beta"
date: "2025-02-01"
language: "EN"
tags: ["y"]
---
Body.`)

    const { getAllSlugs } = await import('../../src/lib/til')
    const slugs = getAllSlugs()
    expect(slugs).toContain('alpha')
    expect(slugs).toContain('beta')
  })
})
