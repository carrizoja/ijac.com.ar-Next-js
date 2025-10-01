'use client'

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

// Common 404 patterns and their redirects
const redirectMap: Record<string, string> = {
  '/services': '/#servicios',
  '/servicios': '/#servicios',
  '/about': '/#nosotros',
  '/nosotros': '/#nosotros',
  '/testimonials': '/#testimonios',
  '/testimonios': '/#testimonios',
  '/faq': '/#faq',
  '/contacto': '/contact',
  '/home': '/',
  '/index': '/',
  '/main': '/',
  '/inicio': '/',
  // Add more patterns as needed
};

export function ClientRedirect() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const normalizedPath = pathname.toLowerCase();
    
    // Check for exact matches first
    if (redirectMap[normalizedPath]) {
      router.replace(redirectMap[normalizedPath]);
      return;
    }

    // Check for patterns that end with common variations
    const pathWithoutSlash = normalizedPath.replace(/\/$/, '');
    if (redirectMap[pathWithoutSlash]) {
      router.replace(redirectMap[pathWithoutSlash]);
      return;
    }

    // Check for .html extensions that might be old URLs
    if (normalizedPath.endsWith('.html')) {
      const withoutHtml = normalizedPath.replace('.html', '');
      if (redirectMap[withoutHtml]) {
        router.replace(redirectMap[withoutHtml]);
        return;
      }
      // Default redirect for .html pages
      router.replace('/');
      return;
    }

    // Check for .php extensions that might be old URLs
    if (normalizedPath.endsWith('.php')) {
      router.replace('/');
      return;
    }

    // Handle old WordPress-style URLs
    if (normalizedPath.includes('/wp-') || normalizedPath.includes('/wordpress')) {
      router.replace('/');
      return;
    }

    // Handle admin or backend paths
    if (normalizedPath.includes('/admin') || normalizedPath.includes('/wp-admin')) {
      router.replace('/');
      return;
    }
  }, [pathname, router]);

  return null; // This component doesn't render anything
}

export default ClientRedirect;