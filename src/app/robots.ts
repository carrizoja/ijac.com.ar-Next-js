import { MetadataRoute } from 'next'

export const dynamic = 'force-static'
export const revalidate = false
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/_next/'],
    },
    sitemap: 'https://ijac.com.ar/sitemap.xml',
  }
}
