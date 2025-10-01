/**
 * 404 Error Logger
 * Add this script to your Google Analytics or monitoring setup
 * to track which URLs are causing 404 errors
 */

'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

interface ErrorLogEntry {
  url: string;
  timestamp: string;
  userAgent: string;
  referrer: string;
}

export function ErrorLogger() {
  const pathname = usePathname();

  useEffect(() => {
    // Only log in production
    if (process.env.NODE_ENV !== 'production') return;

    // Check if this is likely a 404 error
    const is404Likely = 
      pathname.includes('/wp-') ||
      pathname.includes('/admin') ||
      pathname.endsWith('.php') ||
      pathname.endsWith('.asp') ||
      pathname.includes('//') ||
      pathname.includes('..') ||
      pathname.includes('%');

    if (is404Likely) {
      const errorData: ErrorLogEntry = {
        url: window.location.href,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        referrer: document.referrer,
      };

      // Log to console for development
      console.warn('Potential 404 detected:', errorData);

      // Send to Google Analytics if available
      if (typeof window !== 'undefined' && 'gtag' in window) {
        // Define proper types for gtag
        const gtag = (window as { gtag?: (...args: unknown[]) => void }).gtag;
        if (gtag) {
          gtag('event', 'page_not_found', {
            page_location: errorData.url,
            page_referrer: errorData.referrer,
            custom_map: {
              'dimension1': 'error_404'
            }
          });
        }
      }

      // You can also send to your own analytics endpoint
      // fetch('/api/log-error', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorData)
      // }).catch(console.error);
    }
  }, [pathname]);

  return null;
}

// Utility function to get most common 404 patterns
export function analyzeErrorPatterns(errors: ErrorLogEntry[]): Record<string, number> {
  const patterns: Record<string, number> = {};
  
  errors.forEach(error => {
    try {
      const url = new URL(error.url);
      const path = url.pathname;
      
      // Categorize errors
      if (path.includes('/wp-')) patterns['WordPress URLs'] = (patterns['WordPress URLs'] || 0) + 1;
      else if (path.includes('/admin')) patterns['Admin URLs'] = (patterns['Admin URLs'] || 0) + 1;
      else if (path.endsWith('.php')) patterns['PHP files'] = (patterns['PHP files'] || 0) + 1;
      else if (path.endsWith('.html')) patterns['HTML files'] = (patterns['HTML files'] || 0) + 1;
      else if (path.includes('//')) patterns['Double slashes'] = (patterns['Double slashes'] || 0) + 1;
      else patterns['Other'] = (patterns['Other'] || 0) + 1;
    } catch {
      // Catch block for invalid URLs - don't need to use the error
      patterns['Invalid URLs'] = (patterns['Invalid URLs'] || 0) + 1;
    }
  });
  
  return patterns;
}

export default ErrorLogger;