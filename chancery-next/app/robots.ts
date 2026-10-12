import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo'

// The AI assistants' crawlers, named so a later blanket rule (or a host-level
// bot setting) can't shut them out by accident. They get exactly the rules
// every crawler gets: being read and cited by ChatGPT, Claude, Perplexity and
// Gemini is the point of /llms.txt.
const AI_CRAWLERS = [
  'GPTBot', 'OAI-SearchBot', 'ChatGPT-User',
  'ClaudeBot', 'Claude-SearchBot', 'Claude-User',
  'PerplexityBot', 'Perplexity-User',
  'Google-Extended', 'Applebot-Extended',
]

export default function robots(): MetadataRoute.Robots {
  const rules = { allow: '/', disallow: ['/admin', '/api'] }
  return {
    rules: [{ userAgent: '*', ...rules }, { userAgent: AI_CRAWLERS, ...rules }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
