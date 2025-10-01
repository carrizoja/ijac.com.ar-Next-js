import { MetadataRoute } from 'next'

export const dynamic = 'force-static'
export const revalidate = false
 
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://ijac.com.ar'
  const lastModified = new Date()
  
  return [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/politica-de-privacidad`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terminos-y-condiciones`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]
}
