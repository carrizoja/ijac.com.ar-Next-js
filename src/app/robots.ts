import { MetadataRoute } from 'next'

export const dynamic = 'force-static'
export const revalidate = false
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/_next/static/', // Allow static assets (CSS, JS, fonts, images)
        ],
        disallow: [
          '/admin/',
          '/api/',
          '/_next/webpack-hmr', // Block dev-only files
          '/_next/server/', // Block server-side files
          '/private/',
          '/*.json$',
          '/temp/',
          '/tmp/',
          '/staging/',
          '/test/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/_next/static/', // Explicitly allow static assets for Google
        ],
        disallow: [
          '/admin/',
          '/api/',
          '/_next/webpack-hmr',
          '/_next/server/',
          '/private/',
        ],
      },
    ],
    sitemap: 'https://ijac.com.ar/sitemap.xml',
    host: 'https://ijac.com.ar',
  }
}
