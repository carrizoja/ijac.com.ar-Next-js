import { MetadataRoute } from 'next'
import { getServiceSlugs } from '../data/services'
import { getEnglishSlug } from '../i18n/services/catalog'

export const dynamic = 'force-static'
export const revalidate = false

const baseUrl = 'https://ijac.com.ar'

type LanguageAlternates = NonNullable<
  NonNullable<MetadataRoute.Sitemap[number]['alternates']>['languages']
>

function languageAlternates(esUrl: string, enUrl: string): LanguageAlternates {
  return {
    es: esUrl,
    en: enUrl,
    'x-default': esUrl,
  }
}

/** A reciprocal Spanish/English pair of sitemap entries sharing one hreflang set. */
function localizedPair(
  esUrl: string,
  enUrl: string,
  meta: Pick<MetadataRoute.Sitemap[number], 'lastModified' | 'changeFrequency' | 'priority'>,
): MetadataRoute.Sitemap {
  const alternates = { languages: languageAlternates(esUrl, enUrl) }

  return [
    { url: esUrl, alternates, ...meta },
    { url: enUrl, alternates, ...meta },
  ]
}

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  const servicePairs = getServiceSlugs().map((slugEs) => ({
    slugEs,
    slugEn: getEnglishSlug(slugEs),
  }))

  const serviceRoutes = servicePairs.flatMap(({ slugEs, slugEn }) => {
    const esUrl = `${baseUrl}/services/${slugEs}`
    const meta = { lastModified, changeFrequency: 'weekly' as const, priority: 0.8 }

    if (!slugEn) return [{ url: esUrl, ...meta }]

    return localizedPair(esUrl, `${baseUrl}/en/services/${slugEn}`, meta)
  })

  return [
    ...localizedPair(baseUrl, `${baseUrl}/en`, {
      lastModified,
      changeFrequency: 'weekly',
      priority: 1,
    }),
    ...localizedPair(`${baseUrl}/contact`, `${baseUrl}/en/contact`, {
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    }),
    ...localizedPair(`${baseUrl}/services`, `${baseUrl}/en/services`, {
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    }),
    ...serviceRoutes,
  ]
}
